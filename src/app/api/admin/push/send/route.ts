import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { sendPushNotification, checkPushFrequencyAllowed } from '@/lib/push/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      body: messageBody,
      image,
      url,
      targetType = 'all', // all, topic, category, district, platform
      targetValue,
      articleId,
      isBreaking = false,
      force = false,
    } = body;

    if (!title || !messageBody || !url) {
      return NextResponse.json(
        { success: false, error: 'शीर्षक, संदेश और लिंक अनिवार्य हैं।' },
        { status: 400 }
      );
    }

    // Anti-spam / Frequency capping check
    const freqCheck = checkPushFrequencyAllowed(force || isBreaking);
    if (!freqCheck.allowed) {
      return NextResponse.json({ success: false, error: freqCheck.reason }, { status: 429 });
    }

    // Build subscriber query based on targeting
    const subscriberWhere: any = { active: true };

    if (targetType === 'platform' && targetValue) {
      subscriberWhere.platform = targetValue;
    } else if (targetType === 'district' && targetValue) {
      subscriberWhere.district = targetValue;
    }

    // Fetch matching active subscribers
    const subscribers = await db.pushSubscriber.findMany({
      where: subscriberWhere,
      select: { id: true, token: true, preferences: true },
      take: 10000,
    });

    // Filter subscribers by preferences if target is topic or category
    let targetTokens = subscribers.map((s) => s.token);
    if (targetType === 'category' || targetType === 'topic') {
      const targetValLower = (targetValue || '').toLowerCase();
      targetTokens = subscribers
        .filter((s) => {
          if (!s.preferences) return true;
          if (targetValLower.includes('breaking') && !s.preferences.breakingNews) return false;
          if (targetValLower.includes('entertainment') && !s.preferences.entertainmentBollywood) return false;
          if (s.preferences.topics) {
            try {
              const prefTopics = JSON.parse(s.preferences.topics);
              if (Array.isArray(prefTopics) && prefTopics.length > 0) {
                return prefTopics.some((t: string) => targetValLower.includes(t.toLowerCase()));
              }
            } catch (_) {}
          }
          return true;
        })
        .map((s) => s.token);
    }

    // Create NotificationCampaign in DB
    const campaign = await db.notificationCampaign.create({
      data: {
        title,
        body: messageBody,
        image: image || null,
        url,
        targetType,
        targetValue: targetValue || null,
        articleId: articleId || null,
        status: 'SENDING',
        createdBy: session.name || session.email || 'admin',
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name || 'Admin',
        action: 'SEND_PUSH_CAMPAIGN',
        objectType: 'NOTIFICATION_CAMPAIGN',
        objectId: campaign.id,
        detailsJson: JSON.stringify({ title, targetType, targetValue, tokenCount: targetTokens.length }),
      },
    }).catch(() => {});

    // Dispatch notification
    const dispatchResult = await sendPushNotification(
      targetTokens,
      {
        title,
        body: messageBody,
        image: image || undefined,
        url,
        isBreaking,
        data: {
          campaignId: campaign.id,
          url,
          articleId: articleId || '',
        },
      },
      campaign.id
    );

    return NextResponse.json({
      success: dispatchResult.success,
      campaignId: campaign.id,
      recipientsCount: targetTokens.length,
      simulated: dispatchResult.simulated,
      message: dispatchResult.message,
    });
  } catch (error: any) {
    console.error('Push send error:', error);
    return NextResponse.json({ success: false, error: error.message || 'नोटिफिकेशन भेजने में त्रुटि हुई' }, { status: 500 });
  }
}
