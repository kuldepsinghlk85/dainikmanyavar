import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getReporterSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getReporterSession();
    if (!session || !session.reporterProfile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const submission = await db.reporterSubmission.findFirst({
      where: {
        id,
        reporterProfileId: session.reporterProfile.id,
      },
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
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: 'समाचार नहीं मिला।' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    console.error('Error fetching reporter submission:', error);
    return NextResponse.json({ success: false, error: 'समाचार लोड करने में समस्या आई' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getReporterSession();
    if (!session || !session.reporterProfile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.reporterSubmission.findFirst({
      where: {
        id,
        reporterProfileId: session.reporterProfile.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'समाचार नहीं मिला।' }, { status: 404 });
    }

    const body = await request.json();

    // Case 1: Published Story Revision Request
    if (existing.status === 'PUBLISHED') {
      const { revisionNote, updatedContent } = body;
      if (!revisionNote || !revisionNote.trim()) {
        return NextResponse.json(
          { success: false, error: 'प्रकाशित खबर में संशोधन का अनुरोध भेजने के लिए कारण/नोट लिखना अनिवार्य है।' },
          { status: 400 }
        );
      }

      const updated = await db.reporterSubmission.update({
        where: { id },
        data: {
          revisionRequested: true,
          revisionNote: revisionNote.trim(),
          sourceNote: body.sourceNote || existing.sourceNote,
          ...(updatedContent ? { content: updatedContent } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'संशोधन का अनुरोध संपादक को भेज दिया गया है। स्वीकृति मिलने तक साइट पर मौजूदा खबर लाइव रहेगी।',
        data: updated,
      });
    }

    // Case 2: Only DRAFT or CHANGES_REQUESTED can be directly edited
    if (existing.status !== 'DRAFT' && existing.status !== 'CHANGES_REQUESTED') {
      return NextResponse.json(
        { success: false, error: 'यह समाचार वर्तमान स्थिति में संपादित नहीं किया जा सकता।' },
        { status: 400 }
      );
    }

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
      submitForReview,
    } = body;

    let targetStatus = existing.status;
    if (submitForReview || body.status === 'SUBMITTED') {
      targetStatus = 'SUBMITTED';
    } else if (body.status === 'DRAFT') {
      targetStatus = 'DRAFT';
    }

    const updated = await db.reporterSubmission.update({
      where: { id },
      data: {
        headline: headline ? headline.trim() : existing.headline,
        subtitle: subtitle !== undefined ? (subtitle ? subtitle.trim() : null) : existing.subtitle,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        locationId: locationId !== undefined ? locationId : existing.locationId,
        locationName: locationName !== undefined ? locationName : existing.locationName,
        eventDate: eventDate ? new Date(eventDate) : existing.eventDate,
        excerpt: excerpt !== undefined ? (excerpt ? excerpt.trim() : null) : existing.excerpt,
        content: content ? content.trim() : existing.content,
        featuredImage: featuredImage !== undefined ? featuredImage : existing.featuredImage,
        additionalImages: Array.isArray(additionalImages) ? JSON.stringify(additionalImages) : existing.additionalImages,
        sourceNote: sourceNote !== undefined ? (sourceNote ? sourceNote.trim() : null) : existing.sourceNote,
        status: targetStatus,
      },
    });

    if (submitForReview) {
      await db.reporterNotification.create({
        data: {
          reporterProfileId: session.reporterProfile.id,
          submissionId: updated.id,
          title: 'सुधार के बाद पुनः जमा किया गया',
          message: `आपका समाचार "${updated.headline.slice(0, 45)}..." संपादक की समीक्षा हेतु दोबारा जमा कर दिया गया है।`,
          type: 'SUBMITTED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: submitForReview
        ? 'संशोधित समाचार समीक्षा हेतु सफलतापूर्वक भेज दिया गया!'
        : 'समाचार ड्राफ्ट सफलतापूर्वक अपडेट हो गया!',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating reporter submission:', error);
    return NextResponse.json({ success: false, error: 'समाचार अपडेट करने में समस्या आई' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getReporterSession();
    if (!session || !session.reporterProfile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.reporterSubmission.findFirst({
      where: {
        id,
        reporterProfileId: session.reporterProfile.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'समाचार नहीं मिला।' }, { status: 404 });
    }

    if (existing.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'केवल ड्राफ्ट समाचार को ही हटाया जा सकता है।' },
        { status: 400 }
      );
    }

    await db.reporterSubmission.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'ड्राफ्ट समाचार सफलतापूर्वक हटा दिया गया।' });
  } catch (error) {
    console.error('Error deleting reporter submission:', error);
    return NextResponse.json({ success: false, error: 'हटाने में समस्या आई' }, { status: 500 });
  }
}
