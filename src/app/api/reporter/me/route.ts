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

    const profileId = session.reporterProfile.id;

    // Fetch counts for this reporter
    const [
      totalCount,
      submittedCount,
      underReviewCount,
      changesRequestedCount,
      approvedCount,
      publishedSubmissions,
      rejectedCount,
      unreadNotifCount,
    ] = await Promise.all([
      db.reporterSubmission.count({ where: { reporterProfileId: profileId } }),
      db.reporterSubmission.count({ where: { reporterProfileId: profileId, status: 'SUBMITTED' } }),
      db.reporterSubmission.count({ where: { reporterProfileId: profileId, status: 'UNDER_REVIEW' } }),
      db.reporterSubmission.count({ where: { reporterProfileId: profileId, status: 'CHANGES_REQUESTED' } }),
      db.reporterSubmission.count({ where: { reporterProfileId: profileId, status: 'APPROVED' } }),
      db.reporterSubmission.findMany({
        where: { reporterProfileId: profileId, status: 'PUBLISHED' },
        select: {
          id: true,
          articleId: true,
          article: {
            select: {
              id: true,
              viewCount: true,
              status: true,
            },
          },
        },
      }),
      db.reporterSubmission.count({ where: { reporterProfileId: profileId, status: 'REJECTED' } }),
      db.reporterNotification.count({ where: { reporterProfileId: profileId, read: false } }),
    ]);

    // Sum actual views only from published articles that are currently PUBLISHED
    let totalViews = 0;
    let publishedCount = 0;
    for (const sub of publishedSubmissions) {
      if (sub.article && sub.article.status === 'PUBLISHED') {
        totalViews += sub.article.viewCount || 0;
        publishedCount += 1;
      }
    }

    const pendingReviewCount = submittedCount + underReviewCount;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
        },
        profile: session.reporterProfile,
        stats: {
          total: totalCount,
          pendingReview: pendingReviewCount,
          changesRequested: changesRequestedCount,
          approved: approvedCount,
          published: publishedCount,
          rejected: rejectedCount,
          totalViews,
          unreadNotifications: unreadNotifCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching reporter profile stats:', error);
    return NextResponse.json({ success: false, error: 'डेटा लोड करने में समस्या आई' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getReporterSession();
    if (!session || !session.reporterProfile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { photo, bio, mobileNumber, fullName } = body;

    const data: any = {};
    if (photo !== undefined) data.photo = photo ? photo.trim() : null;
    if (bio !== undefined) data.bio = bio ? bio.trim() : null;
    if (mobileNumber !== undefined) data.mobileNumber = mobileNumber ? mobileNumber.trim() : null;
    if (fullName !== undefined && fullName.trim()) data.fullName = fullName.trim();

    const updatedProfile = await db.reporterProfile.update({
      where: { id: session.reporterProfile.id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating reporter profile:', error);
    return NextResponse.json({ success: false, error: 'प्रोफ़ाइल अपडेट करने में समस्या आई' }, { status: 500 });
  }
}

