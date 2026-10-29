import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getReporterSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getReporterSession();
    if (!session || !session.reporterProfile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      reporterProfileId: session.reporterProfile.id,
    };

    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        where.status = { in: ['SUBMITTED', 'UNDER_REVIEW'] };
      } else {
        where.status = status;
      }
    }

    if (search && search.trim()) {
      where.OR = [
        { headline: { contains: search.trim() } },
        { excerpt: { contains: search.trim() } },
      ];
    }

    const [total, submissions] = await Promise.all([
      db.reporterSubmission.count({ where }),
      db.reporterSubmission.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          article: {
            select: {
              id: true,
              newsId: true,
              slug: true,
              viewCount: true,
              status: true,
              publishedAt: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching reporter submissions:', error);
    return NextResponse.json({ success: false, error: 'खबरें लोड करने में समस्या आई' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getReporterSession();
    if (!session || !session.reporterProfile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      headline,
      subtitle,
      categoryId,
      locationId,
      locationName,
      eventDate,
      excerpt,
      content,
      featuredImage,
      additionalImages,
      sourceNote,
      submitForReview, // boolean: true = SUBMITTED, false = DRAFT
    } = body;

    if (!headline || !headline.trim()) {
      return NextResponse.json({ success: false, error: 'मुख्य शीर्षक आवश्यक है।' }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'समाचार का विवरण आवश्यक है।' }, { status: 400 });
    }

    const initialStatus = submitForReview ? 'SUBMITTED' : 'DRAFT';

    const submission = await db.reporterSubmission.create({
      data: {
        reporterProfileId: session.reporterProfile.id,
        headline: headline.trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        categoryId: categoryId || null,
        locationId: locationId || session.reporterProfile.locationId || null,
        locationName: locationName || session.reporterProfile.district || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        excerpt: excerpt ? excerpt.trim() : null,
        content: content.trim(),
        featuredImage: featuredImage || null,
        additionalImages: Array.isArray(additionalImages) ? JSON.stringify(additionalImages) : null,
        sourceNote: sourceNote ? sourceNote.trim() : null,
        status: initialStatus,
      },
    });

    // If submitted for review, create notification for reporter
    if (submitForReview) {
      await db.reporterNotification.create({
        data: {
          reporterProfileId: session.reporterProfile.id,
          submissionId: submission.id,
          title: 'समाचार समीक्षा हेतु भेजा गया',
          message: `आपका समाचार "${submission.headline.slice(0, 45)}..." संपादक की समीक्षा हेतु सफलतापूर्वक जमा कर दिया गया है।`,
          type: 'SUBMITTED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: submitForReview
        ? 'समाचार संपादक को समीक्षा हेतु सफलतापूर्वक भेज दिया गया है!'
        : 'समाचार ड्राफ्ट के रूप में सुरक्षित हो गया!',
      data: submission,
    });
  } catch (error) {
    console.error('Error creating reporter submission:', error);
    return NextResponse.json({ success: false, error: 'समाचार जमा करने में समस्या आई' }, { status: 500 });
  }
}
