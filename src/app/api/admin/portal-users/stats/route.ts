import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. User metrics
    const [totalUsers, newToday, newsletterSubs, activeSubs, unsubscribedSubs, totalImported] = await Promise.all([
      db.portalUser.count(),
      db.portalUser.count({ where: { registrationDate: { gte: startOfToday } } }),
      db.portalUser.count({ where: { newsletterSubscribed: true } }),
      db.portalUser.count({ where: { newsletterSubscribed: true, status: 'ACTIVE' } }),
      db.portalUser.count({ where: { newsletterSubscribed: false } }),
      db.portalUser.count({ where: { isImported: true } }),
    ]);

    // 2. Communication metrics
    const [whatsappSent, whatsappDelivered, whatsappOpened, whatsappFailed] = await Promise.all([
      db.notificationLog.count(),
      db.notificationLog.count({ where: { deliveryStatus: 'DELIVERED' } }),
      db.notificationLog.count({ where: { openedStatus: 'OPENED' } }),
      db.notificationLog.count({ where: { deliveryStatus: 'FAILED' } }),
    ]);

    // 3. Most Read News (Articles with highest views / activity)
    const mostReadArticles = await db.article.findMany({
      orderBy: { viewCount: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        featuredImage: true,
      },
    });

    // 4. Most Shared News (by ShareTracking click counts or article share count)
    const mostSharedArticles = await db.article.findMany({
      orderBy: { shareCount: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        shareCount: true,
        viewCount: true,
        featuredImage: true,
      },
    });

    // 5. Most Active Users (by activity count)
    const activeUserCounts = await db.userActivityLog.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      where: {
        userId: { not: null },
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 8,
    });

    const activeUserIds = activeUserCounts.map((u) => u.userId!).filter(Boolean);
    const usersInfo = await db.portalUser.findMany({
      where: { id: { in: activeUserIds } },
      select: { id: true, fullName: true, mobileNumber: true, city: true },
    });

    const userMap = new Map(usersInfo.map((u) => [u.id, u]));
    const mostActiveUsers = activeUserCounts
      .map((item) => {
        const u = userMap.get(item.userId!);
        if (!u) return null;
        return {
          ...u,
          activityCount: item._count.id,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          totalUsers,
          newToday,
          newsletterSubs,
          activeSubs,
          unsubscribedSubs,
          totalImported,
        },
        communication: {
          whatsappSent,
          whatsappDelivered,
          whatsappOpened,
          whatsappFailed,
          openRate: whatsappSent > 0 ? ((whatsappOpened / whatsappSent) * 100).toFixed(1) + '%' : '0%',
        },
        engagement: {
          mostReadArticles,
          mostSharedArticles,
          mostActiveUsers,
        },
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ success: false, error: 'एनालिटिक्स लोड करने में विफल।' }, { status: 500 });
  }
}
