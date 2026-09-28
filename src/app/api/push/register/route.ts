import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, platform = 'web', deviceType = 'desktop', language = 'hi', state, district } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    // Upsert subscriber
    const subscriber = await db.pushSubscriber.upsert({
      where: { token },
      update: {
        active: true,
        platform,
        deviceType,
        language,
        state: state || null,
        district: district || null,
        lastActiveAt: new Date(),
      },
      create: {
        token,
        platform,
        deviceType,
        language,
        state: state || null,
        district: district || null,
        active: true,
      },
    });

    // Ensure preference record exists
    await db.notificationPreference.upsert({
      where: { subscriberId: subscriber.id },
      update: {},
      create: {
        subscriberId: subscriber.id,
        breakingNews: true,
        trendingNews: true,
        dailyDigest: true,
        editorialOpinions: true,
        entertainmentBollywood: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: subscriber.id, active: subscriber.active },
      message: 'सफलतापूर्वक नोटिफिकेशन सब्सक्राइब किया गया',
    });
  } catch (error: any) {
    console.error('Push register error:', error);
    return NextResponse.json({ success: false, error: 'रजिस्ट्रेशन विफल रहा' }, { status: 500 });
  }
}
