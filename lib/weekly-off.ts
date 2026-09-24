import { prisma } from '@/lib/prisma';
import { isValidPakistaniPhone, normalizePakistaniPhone, sendSms } from '@/lib/sms';

export const WEEK_DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

function getSetting(settings: Map<string, string>, key: string, fallback: string) {
  return settings.get(key)?.trim() || fallback;
}

function localDateParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    day: values.weekday.toUpperCase() as WeekDay,
    date: `${values.year}-${values.month}-${values.day}`,
    dateValue: new Date(`${values.year}-${values.month}-${values.day}T00:00:00.000Z`),
  };
}

function nextReportingDay(day: WeekDay, weeklyOffDays: string[]) {
  let index = WEEK_DAYS.indexOf(day);
  for (let i = 0; i < WEEK_DAYS.length; i++) {
    index = (index + 1) % WEEK_DAYS.length;
    if (!weeklyOffDays.includes(WEEK_DAYS[index])) return WEEK_DAYS[index].charAt(0) + WEEK_DAYS[index].slice(1).toLowerCase();
  }
  return 'your next scheduled working day';
}

function renderMessage(template: string, employeeName: string, companyName: string, day: string, date: string, nextDay: string) {
  return template
    .replaceAll('{employeeName}', employeeName)
    .replaceAll('{companyName}', companyName)
    .replaceAll('{day}', day.charAt(0) + day.slice(1).toLowerCase())
    .replaceAll('{date}', date)
    .replaceAll('{nextReportingDay}', nextDay);
}

export async function sendWeeklyOffNotifications(now = new Date(), options: { dryRun?: boolean } = {}) {
  const settingsRows = await prisma.systemSetting.findMany({ where: { key: { in: ['TIMEZONE', 'INSTITUTION_NAME', 'SMS_ENABLED', 'WEEKLY_OFF_SMS_ENABLED', 'WEEKLY_OFF_SMS_TEMPLATE'] } } });
  const settings = new Map(settingsRows.map((setting) => [setting.key, setting.value]));
  const timezone = getSetting(settings, 'TIMEZONE', process.env.TZ || 'Asia/Karachi');
  const companyName = getSetting(settings, 'INSTITUTION_NAME', process.env.NEXT_PUBLIC_APP_NAME || 'Sweet Home');
  const defaultTemplate = 'Dear {employeeName}, today is your scheduled weekly off. Your next reporting day is {nextReportingDay}. - PBM Sweet Home Multan';
  const configuredTemplate = getSetting(settings, 'WEEKLY_OFF_SMS_TEMPLATE', defaultTemplate);
  const template = configuredTemplate.includes('You are not required to report to work today') ? defaultTemplate : configuredTemplate;
  const local = localDateParts(now, timezone);
  const notificationsEnabled = getSetting(settings, 'SMS_ENABLED', 'false').toLowerCase() === 'true' && getSetting(settings, 'WEEKLY_OFF_SMS_ENABLED', 'false').toLowerCase() === 'true';

  if (!notificationsEnabled && !options.dryRun) return { date: local.date, day: local.day, sent: 0, failed: 0, skipped: 0, disabled: true, dryRun: false, previews: [] };

  const employees = await prisma.employee.findMany({ where: { employmentStatus: 'ACTIVE' }, select: { id: true, fullName: true, phoneNumber: true, weeklyOffDays: true } });
  const previews: Array<{ employee: string; phone: string; message: string; wouldSend: boolean; reason?: string }> = [];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const employee of employees) {
    let weeklyOffDays: string[] = [];
    try {
      weeklyOffDays = JSON.parse(employee.weeklyOffDays || '[]');
    } catch {
      weeklyOffDays = [];
    }
    if (!weeklyOffDays.includes(local.day)) continue;

    const phone = normalizePakistaniPhone(employee.phoneNumber);
    const message = renderMessage(template, employee.fullName, companyName, local.day, local.date, nextReportingDay(local.day, weeklyOffDays));
    const validPhone = isValidPakistaniPhone(phone);
    if (options.dryRun) {
      previews.push({ employee: employee.fullName, phone, message, wouldSend: notificationsEnabled && validPhone, ...(validPhone ? {} : { reason: 'INVALID_PHONE_NUMBER' }) });
      continue;
    }
    if (!validPhone) {
      skipped++;
      await prisma.smsNotificationLog.upsert({ where: { employeeId_notificationType_notificationDate: { employeeId: employee.id, notificationType: 'WEEKLY_OFF', notificationDate: local.dateValue } }, update: { employeeName: employee.fullName, phoneNumber: phone, message, status: 'FAILED', error: 'INVALID_PHONE_NUMBER' }, create: { employeeId: employee.id, employeeName: employee.fullName, phoneNumber: phone, message, notificationType: 'WEEKLY_OFF', notificationDate: local.dateValue, status: 'FAILED', error: 'INVALID_PHONE_NUMBER' } });
      continue;
    }

    const existing = await prisma.smsNotificationLog.findUnique({ where: { employeeId_notificationType_notificationDate: { employeeId: employee.id, notificationType: 'WEEKLY_OFF', notificationDate: local.dateValue } } });
    if (existing?.status === 'SENT' || existing?.status === 'PENDING') continue;
    try {
      await prisma.smsNotificationLog.create({ data: { employeeId: employee.id, employeeName: employee.fullName, phoneNumber: phone, message, notificationType: 'WEEKLY_OFF', notificationDate: local.dateValue, status: 'PENDING' } });
    } catch {
      continue;
    }

    try {
      const result = await sendSms(phone, message, `WEEKLY_OFF:${employee.id}:${local.date}`);
      if (!result.sent) {
        skipped++;
        await prisma.smsNotificationLog.update({ where: { employeeId_notificationType_notificationDate: { employeeId: employee.id, notificationType: 'WEEKLY_OFF', notificationDate: local.dateValue } }, data: { status: 'FAILED', error: result.reason || 'SMS gateway did not send the message', sentAt: null } });
        continue;
      }
      await prisma.smsNotificationLog.update({ where: { employeeId_notificationType_notificationDate: { employeeId: employee.id, notificationType: 'WEEKLY_OFF', notificationDate: local.dateValue } }, data: { status: 'SENT', providerMessageId: result.providerMessageId || null, error: null, sentAt: new Date() } });
      sent++;
    } catch (error) {
      failed++;
      await prisma.smsNotificationLog.update({ where: { employeeId_notificationType_notificationDate: { employeeId: employee.id, notificationType: 'WEEKLY_OFF', notificationDate: local.dateValue } }, data: { status: 'FAILED', error: error instanceof Error ? error.message : 'SMS provider request failed', sentAt: null } });
    }
  }

  return { date: local.date, day: local.day, sent, failed, skipped, disabled: !notificationsEnabled, dryRun: Boolean(options.dryRun), previews };
}
