import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { maskPhoneNumber } from '@/lib/sms';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== Role.INCHARGE && user.role !== Role.HR_REPRESENTATIVE) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const params = new URL(request.url).searchParams;
    const status = params.get('status');
    const type = params.get('type');
    const logs = await prisma.smsNotificationLog.findMany({ where: { ...(status && status !== 'ALL' ? { status } : {}), ...(type && type !== 'ALL' ? { notificationType: type } : {}) }, orderBy: { createdAt: 'desc' }, take: 200 });
    const safeLogs = logs.map((log) => ({ ...log, phoneNumber: maskPhoneNumber(log.phoneNumber) }));
    return NextResponse.json({ success: true, logs: safeLogs });
  } catch (error) {
    console.error('Fetch SMS logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS history' }, { status: 500 });
  }
}