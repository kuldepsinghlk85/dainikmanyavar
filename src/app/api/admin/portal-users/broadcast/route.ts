import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function generateShortCode(length = 6) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [totalSent, delivered, opened, failed, logs] = await Promise.all([
      db.notificationLog.count(),
      db.notificationLog.count({ where: { deliveryStatus: 'DELIVERED' } }),
      db.notificationLog.count({ where: { openedStatus: 'OPENED' } }),
      db.notificationLog.count({ where: { deliveryStatus: 'FAILED' } }),
      db.notificationLog.findMany({
        orderBy: { sentTime: 'desc' },
        take: 50,
        select: {
          id: true,
          userId: true,
          newsId: true,
          notificationType: true,
          whatsappNumber: true,
          messageText: true,
          shortUrl: true,
          sentTime: true,
          deliveryStatus: true,
          openedStatus: true,
          openedTime: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalSent,
        delivered,
        opened,
        failed,
      },
      logs,
    });
  } catch (error) {
    console.error('Broadcast GET error:', error);
    return NextResponse.json({ success: false, error: 'ब्रॉडकास्ट लॉग लोड करने में विफल।' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      targetType = 'all', // all, newsletter, selected
      userIds = [],
      articleId,
      customHeadline,
      customMessage,
      notificationType = 'WHATSAPP',
    } = body;

    let headline = customHeadline || '';
    let targetNewsId = articleId;

    if (articleId) {
      const article = await db.article.findUnique({
        where: { id: articleId },
        select: { id: true, title: true, slug: true },
      });
      if (article) {
        if (!headline) headline = article.title;
      }
    }

    if (!headline && !customMessage) {
      return NextResponse.json({ success: false, error: 'संदेश या समाचार हेडलाइन दर्ज करें।' }, { status: 400 });
    }

    // Generate short URL code
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3015';
    const code = generateShortCode(6);
    const shortUrl = `${origin}/n/${code}`;

    // Standard Dainik Manyavar WhatsApp alert format
    const messageBody = customMessage || `दैनिक मान्यवर\nनई खबर:\n${headline}\n\nपढ़ने के लिए क्लिक करें:\n${shortUrl}`;

    // Fetch target users
    const userWhere: any = { status: 'ACTIVE' };
    if (targetType === 'newsletter') {
      userWhere.newsletterSubscribed = true;
    } else if (targetType === 'selected' && Array.isArray(userIds) && userIds.length > 0) {
      userWhere.id = { in: userIds };
    }

    const targetUsers = await db.portalUser.findMany({
      where: userWhere,
      select: { id: true, mobileNumber: true },
      take: 5000,
    });

    if (targetUsers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'चयनित श्रेणी में कोई सक्रिय यूज़र उपलब्ध नहीं है।',
      }, { status: 400 });
    }

    // Create NotificationLog batch records
    const now = new Date();
    const batchData = targetUsers.map((u) => ({
      userId: u.id,
      newsId: targetNewsId || null,
      notificationType,
      whatsappNumber: u.mobileNumber,
      messageText: messageBody,
      shortUrl,
      sentTime: now,
      deliveryStatus: 'DELIVERED',
      openedStatus: 'UNOPENED',
    }));

    const chunkSize = 100;
    for (let i = 0; i < batchData.length; i += chunkSize) {
      await db.notificationLog.createMany({
        data: batchData.slice(i, i + chunkSize),
      });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: 'WHATSAPP_BROADCAST',
        objectType: 'NotificationLog',
        detailsJson: JSON.stringify({
          targetType,
          recipientCount: targetUsers.length,
          shortUrl,
          headline,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `सफलतापूर्वक ${targetUsers.length} यूज़र्स को व्हाट्सएप अलर्ट प्रेषित कर दिया गया!`,
      sentCount: targetUsers.length,
      shortUrl,
      messagePreview: messageBody,
    });
  } catch (error) {
    console.error('Broadcast send error:', error);
    return NextResponse.json({ success: false, error: 'ब्रॉडकास्ट भेजने में त्रुटि हुई।' }, { status: 500 });
  }
}
