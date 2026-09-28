import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaignId, subscriberId, eventType = 'OPENED' } = body;

    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'Campaign ID required' }, { status: 400 });
    }

    if (eventType === 'OPENED') {
      await db.notificationCampaign.update({
        where: { id: campaignId },
        data: {
          openCount: { increment: 1 },
        },
      }).catch(() => {});
    }

    await db.notificationEvent.create({
      data: {
        campaignId,
        subscriberId: subscriberId || null,
        eventType,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
