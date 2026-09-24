import { NextResponse } from 'next/server';
import { sendWeeklyOffNotifications } from '@/lib/weekly-off';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dryRun = new URL(request.url).searchParams.get('dryRun') === '1';
    return NextResponse.json({ success: true, result: await sendWeeklyOffNotifications(new Date(), { dryRun }) });
  } catch (error) {
    console.error('Weekly off SMS job failed:', error);
    return NextResponse.json({ error: 'Weekly off SMS job failed' }, { status: 500 });
  }
}