import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getReporterSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getReporterSession();
    if (!session || !session.reporterProfile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await db.reporterNotification.findMany({
      where: { reporterProfileId: session.reporterProfile.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching reporter notifications:', error);
    return NextResponse.json({ success: false, error: 'सूचनाएं लोड करने में त्रुटि' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getReporterSession();
    if (!session || !session.reporterProfile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll) {
      await db.reporterNotification.updateMany({
        where: { reporterProfileId: session.reporterProfile.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'सभी सूचनाएं पढ़ी हुई चिह्नित की गईं' });
    }

    if (notificationId) {
      await db.reporterNotification.updateMany({
        where: { id: notificationId, reporterProfileId: session.reporterProfile.id },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'सूचना पढ़ी हुई चिह्नित की गई' });
    }

    return NextResponse.json({ success: false, error: 'अमान्य अनुरोध' }, { status: 400 });
  } catch (error) {
    console.error('Error marking reporter notifications:', error);
    return NextResponse.json({ success: false, error: 'सूचना अपडेट करने में त्रुटि' }, { status: 500 });
  }
}
