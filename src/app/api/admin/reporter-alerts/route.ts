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

    const whereCondition = {
      OR: [
        { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
        { revisionRequested: true },
      ],
    };

    const [pendingCount, latestSubmissions] = await Promise.all([
      db.reporterSubmission.count({
        where: whereCondition,
      }),
      db.reporterSubmission.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          headline: true,
          subtitle: true,
          featuredImage: true,
          status: true,
          revisionRequested: true,
          locationName: true,
          createdAt: true,
          reporterProfile: {
            select: {
              id: true,
              reporterId: true,
              fullName: true,
              designation: true,
              district: true,
              photo: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      pendingCount,
      latestSubmissions,
    });
  } catch (error) {
    console.error('Error fetching reporter alerts:', error);
    return NextResponse.json({ success: false, error: 'अलर्ट लोड करने में समस्या आई' }, { status: 500 });
  }
}
