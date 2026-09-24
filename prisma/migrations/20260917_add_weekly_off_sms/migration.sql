ALTER TABLE "Employee" ADD COLUMN "weeklyOffDays" TEXT NOT NULL DEFAULT '[]';

CREATE TABLE "SmsNotificationLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT,
    "employeeName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL DEFAULT 'WEEKLY_OFF',
    "notificationDate" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'FAILED',
    "providerMessageId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "SmsNotificationLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SmsNotificationLog_employeeId_notificationType_notificationDate_key" ON "SmsNotificationLog"("employeeId", "notificationType", "notificationDate");
CREATE INDEX "SmsNotificationLog_notificationDate_notificationType_idx" ON "SmsNotificationLog"("notificationDate", "notificationType");
CREATE INDEX "SmsNotificationLog_status_createdAt_idx" ON "SmsNotificationLog"("status", "createdAt");

ALTER TABLE "SmsNotificationLog" ADD CONSTRAINT "SmsNotificationLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "SystemSetting" ("id", "key", "value", "group", "description", "updatedAt")
VALUES
    (CONCAT('weekly-off-', md5(random()::text)), 'TIMEZONE', 'Asia/Karachi', 'INSTITUTION', 'Timezone used for daily scheduled notifications', CURRENT_TIMESTAMP),
    (CONCAT('weekly-off-', md5(random()::text)), 'SMS_ENABLED', 'false', 'NOTIFICATIONS', 'Enable outbound SMS notifications', CURRENT_TIMESTAMP),
    (CONCAT('weekly-off-', md5(random()::text)), 'WEEKLY_OFF_SMS_ENABLED', 'false', 'NOTIFICATIONS', 'Enable daily weekly-off SMS notifications', CURRENT_TIMESTAMP),
    (CONCAT('weekly-off-', md5(random()::text)), 'WEEKLY_OFF_SMS_TEMPLATE', 'Dear {employeeName}, today is your weekly off. You are not required to report to work today. Regards, {companyName}', 'NOTIFICATIONS', 'Weekly-off SMS template', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;