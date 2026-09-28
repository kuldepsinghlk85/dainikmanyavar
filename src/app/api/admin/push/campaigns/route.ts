import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [campaigns, totalSubscribers, webSubscribers, mobileSubscribers, totalSent, totalOpened] = await Promise.all([
      db.notificationCampaign.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          article: {
            select: { id: true, title: true, slug: true, featuredImage: true },
          },
        },
      }),
      db.pushSubscriber.count({ where: { active: true } }),
      db.pushSubscriber.count({ where: { active: true, platform: 'web' } }),
      db.pushSubscriber.count({ where: { active: true, platform: { in: ['android', 'ios'] } } }),
      db.notificationCampaign.aggregate({ _sum: { successCount: true } }),
      db.notificationCampaign.aggregate({ _sum: { openCount: true } }),
    ]);

    const sentCount = totalSent._sum.successCount || 0;
    const openCount = totalOpened._sum.openCount || 0;
    const avgOpenRate = sentCount > 0 ? ((openCount / sentCount) * 100).toFixed(1) : '0.0';

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        stats: {
          totalSubscribers,
          webSubscribers,
          mobileSubscribers,
          totalSent: sentCount,
          totalOpened: openCount,
          openRate: `${avgOpenRate}%`,
        },
      },
    });
  } catch (error: any) {
    console.error('Push campaigns error:', error);
    return NextResponse.json({ success: false, error: 'डेटा लोड करने में विफल' }, { status: 500 });
  }
}
