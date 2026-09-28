import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    const subscriber = await db.pushSubscriber.findUnique({
      where: { token },
      include: { preferences: true },
    });

    if (!subscriber) {
      return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: subscriber.preferences || {},
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'प्राथमिकताएँ लोड करने में विफल' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      token,
      breakingNews,
      trendingNews,
      dailyDigest,
      editorialOpinions,
      entertainmentBollywood,
      topics,
      districts,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
    } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    const subscriber = await db.pushSubscriber.findUnique({
      where: { token },
      select: { id: true },
    });

    if (!subscriber) {
      return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 });
    }

    const updated = await db.notificationPreference.upsert({
      where: { subscriberId: subscriber.id },
      update: {
        breakingNews: breakingNews !== undefined ? Boolean(breakingNews) : undefined,
        trendingNews: trendingNews !== undefined ? Boolean(trendingNews) : undefined,
        dailyDigest: dailyDigest !== undefined ? Boolean(dailyDigest) : undefined,
        editorialOpinions: editorialOpinions !== undefined ? Boolean(editorialOpinions) : undefined,
        entertainmentBollywood: entertainmentBollywood !== undefined ? Boolean(entertainmentBollywood) : undefined,
        topics: topics ? (Array.isArray(topics) ? JSON.stringify(topics) : topics) : undefined,
        districts: districts ? (Array.isArray(districts) ? JSON.stringify(districts) : districts) : undefined,
        quietHoursEnabled: quietHoursEnabled !== undefined ? Boolean(quietHoursEnabled) : undefined,
        quietHoursStart: quietHoursStart || undefined,
        quietHoursEnd: quietHoursEnd || undefined,
      },
      create: {
        subscriberId: subscriber.id,
        breakingNews: breakingNews !== undefined ? Boolean(breakingNews) : true,
        trendingNews: trendingNews !== undefined ? Boolean(trendingNews) : true,
        dailyDigest: dailyDigest !== undefined ? Boolean(dailyDigest) : true,
        editorialOpinions: editorialOpinions !== undefined ? Boolean(editorialOpinions) : true,
        entertainmentBollywood: entertainmentBollywood !== undefined ? Boolean(entertainmentBollywood) : true,
        topics: topics ? (Array.isArray(topics) ? JSON.stringify(topics) : topics) : null,
        districts: districts ? (Array.isArray(districts) ? JSON.stringify(districts) : districts) : null,
        quietHoursEnabled: quietHoursEnabled !== undefined ? Boolean(quietHoursEnabled) : false,
        quietHoursStart: quietHoursStart || '22:00',
        quietHoursEnd: quietHoursEnd || '07:00',
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'प्राथमिकताएँ सुरक्षित कर ली गई हैं',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'प्राथमिकताएँ अपडेट करने में विफल' }, { status: 500 });
  }
}
