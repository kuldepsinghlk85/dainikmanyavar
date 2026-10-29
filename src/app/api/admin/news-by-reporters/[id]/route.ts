import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getNextNewsId } from '@/lib/newsId';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const { id } = await params;
    const submission = await db.reporterSubmission.findUnique({
      where: { id },
      include: {
        reporterProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                active: true,
              },
            },
            location: true,
            author: true,
          },
        },
        article: {
          select: {
            id: true,
            slug: true,
            newsId: true,
            title: true,
            status: true,
            viewCount: true,
            publishedAt: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: 'खबर नहीं मिली' }, { status: 404 });
    }

    let category = null;
    if (submission.categoryId) {
      category = await db.category.findUnique({
        where: { id: submission.categoryId },
        select: { id: true, name: true, slug: true },
      });
    }

    let parsedAdditionalImages = [];
    try {
      if (submission.additionalImages) {
        parsedAdditionalImages = JSON.parse(submission.additionalImages);
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      data: {
        ...submission,
        category,
        additionalImagesList: parsedAdditionalImages,
      },
    });
  } catch (error) {
    console.error('Error fetching submission detail for admin review:', error);
    return NextResponse.json({ success: false, error: 'खबर विवरण लोड करने में विफल' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const {
      action,
      editorComment,
      headline,
      subtitle,
      excerpt,
      content,
      featuredImage,
      additionalImages,
      categoryId,
      locationId,
      locationName,
      sendPushNotification,
    } = body;

    const submission = await db.reporterSubmission.findUnique({
      where: { id },
      include: {
        reporterProfile: {
          include: {
            user: true,
            author: true,
          },
        },
        article: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: 'खबर नहीं मिली' }, { status: 404 });
    }

    const reviewerName = session.name || 'संपादक';

    // 1. START_REVIEW
    if (action === 'START_REVIEW') {
      const updated = await db.reporterSubmission.update({
        where: { id },
        data: {
          status: 'UNDER_REVIEW',
          reviewedBy: reviewerName,
          reviewedAt: new Date(),
        },
      });

      await db.reporterNotification.create({
        data: {
          reporterProfileId: submission.reporterProfileId,
          submissionId: id,
          type: 'INFO',
          title: 'समीक्षा शुरू हुई',
          message: `आपकी खबर "${submission.headline}" की समीक्षा एडिटर द्वारा शुरू कर दी गई है।`,
        },
      });

      return NextResponse.json({ success: true, message: 'समीक्षा शुरू की गई', data: updated });
    }

    // 2. REQUEST_CHANGES
    if (action === 'REQUEST_CHANGES') {
      if (!editorComment || !editorComment.trim()) {
        return NextResponse.json({ success: false, error: 'सुधार हेतु टिप्पणी अनिवार्य है' }, { status: 400 });
      }

      const updated = await db.reporterSubmission.update({
        where: { id },
        data: {
          status: 'CHANGES_REQUESTED',
          editorComment: editorComment.trim(),
          reviewedBy: reviewerName,
          reviewedAt: new Date(),
          revisionRequested: false,
        },
      });

      await db.reporterNotification.create({
        data: {
          reporterProfileId: submission.reporterProfileId,
          submissionId: id,
          type: 'CHANGES_REQUESTED',
          title: 'सुधार की आवश्यकता',
          message: `आपकी खबर "${submission.headline}" में सुधार हेतु भेजा गया है: ${editorComment.trim()}`,
        },
      });

      return NextResponse.json({ success: true, message: 'रिपोर्टर को सुधार के लिए भेजा गया', data: updated });
    }

    // 3. REJECT
    if (action === 'REJECT') {
      if (!editorComment || !editorComment.trim()) {
        return NextResponse.json({ success: false, error: 'अस्वीकृति का कारण लिखना आवश्यक है' }, { status: 400 });
      }

      const updated = await db.reporterSubmission.update({
        where: { id },
        data: {
          status: 'REJECTED',
          editorComment: editorComment.trim(),
          reviewedBy: reviewerName,
          reviewedAt: new Date(),
        },
      });

      await db.reporterNotification.create({
        data: {
          reporterProfileId: submission.reporterProfileId,
          submissionId: id,
          type: 'STORY_REJECTED',
          title: 'खबर अस्वीकृत की गई',
          message: `आपकी खबर "${submission.headline}" अस्वीकृत की गई है: ${editorComment.trim()}`,
        },
      });

      return NextResponse.json({ success: true, message: 'खबर अस्वीकृत की गई', data: updated });
    }

    // Common fields edited by reviewer
    const finalHeadline = headline !== undefined ? headline.trim() : submission.headline;
    const finalSubtitle = subtitle !== undefined ? subtitle?.trim() : submission.subtitle;
    const finalContent = content !== undefined ? content : submission.content;
    const finalExcerpt = excerpt !== undefined ? excerpt?.trim() : submission.excerpt;
    const finalFeaturedImage = featuredImage !== undefined ? featuredImage : submission.featuredImage;
    const finalCategoryId = categoryId !== undefined ? categoryId : submission.categoryId;
    const finalLocationId = locationId !== undefined ? locationId : submission.locationId;
    const finalLocationName = locationName !== undefined ? locationName : submission.locationName;
    const finalAdditionalImages = additionalImages !== undefined ? JSON.stringify(additionalImages) : submission.additionalImages;

    // Resolve Author ID for the reporter
    let authorId = submission.reporterProfile.authorId;
    if (!authorId) {
      // Find or create author for this reporter
      let author = await db.author.findFirst({
        where: { name: submission.reporterProfile.fullName },
      });
      if (!author) {
        const slug = slugify(submission.reporterProfile.fullName);
        author = await db.author.create({
          data: {
            name: submission.reporterProfile.fullName,
            slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
            designation: submission.reporterProfile.designation || 'संवाददाता',
            photo: submission.reporterProfile.photo || null,
            bio: submission.reporterProfile.bio || null,
          },
        });
      }
      authorId = author.id;
      await db.reporterProfile.update({
        where: { id: submission.reporterProfileId },
        data: { authorId: author.id },
      });
    }

    // Ensure valid category
    let finalCatId = finalCategoryId;
    if (!finalCatId) {
      const defaultCategory = await db.category.findFirst({
        orderBy: { order: 'asc' },
      });
      finalCatId = defaultCategory ? defaultCategory.id : null;
    }

    // 4. APPROVE_DRAFT (Approve as draft article)
    if (action === 'APPROVE_DRAFT') {
      let articleId = submission.articleId;
      if (articleId) {
        await db.article.update({
          where: { id: articleId },
          data: {
            title: finalHeadline,
            subtitle: finalSubtitle,
            excerpt: finalExcerpt || finalHeadline.slice(0, 160),
            content: finalContent,
            featuredImage: finalFeaturedImage,
            status: 'DRAFT',
            primaryCategoryId: finalCatId,
            locationId: finalLocationId,
            authorId,
          },
        });
      } else if (finalCatId) {
        const nextNewsId = await getNextNewsId();
        const baseSlug = slugify(finalHeadline);
        const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

        const newArticle = await db.article.create({
          data: {
            newsId: nextNewsId,
            title: finalHeadline,
            subtitle: finalSubtitle,
            slug: uniqueSlug,
            excerpt: finalExcerpt || finalHeadline.slice(0, 160),
            content: finalContent,
            featuredImage: finalFeaturedImage,
            status: 'DRAFT',
            primaryCategoryId: finalCatId,
            locationId: finalLocationId,
            authorId,
            sourceType: `संवाददाता / ${submission.reporterProfile.fullName}`,
            publishedAt: new Date(),
          },
        });
        articleId = newArticle.id;
      }

      const updated = await db.reporterSubmission.update({
        where: { id },
        data: {
          headline: finalHeadline,
          subtitle: finalSubtitle,
          excerpt: finalExcerpt,
          content: finalContent,
          featuredImage: finalFeaturedImage,
          additionalImages: finalAdditionalImages,
          categoryId: finalCatId,
          locationId: finalLocationId,
          locationName: finalLocationName,
          status: 'APPROVED',
          articleId: articleId || null,
          reviewedBy: reviewerName,
          reviewedAt: new Date(),
          editorComment: editorComment ? editorComment.trim() : null,
          revisionRequested: false,
        },
      });

      await db.reporterNotification.create({
        data: {
          reporterProfileId: submission.reporterProfileId,
          submissionId: id,
          type: 'STORY_APPROVED',
          title: 'खबर स्वीकृत हुई (ड्राफ्ट)',
          message: `आपकी खबर "${finalHeadline}" स्वीकृत कर ली गई है और ड्राफ्ट में सुरक्षित है।`,
        },
      });

      return NextResponse.json({ success: true, message: 'खबर स्वीकृत कर ड्राफ्ट में सेव कर ली गई', data: updated });
    }

    // 5. APPROVE_PUBLISH (Publish directly)
    if (action === 'APPROVE_PUBLISH') {
      if (!finalCatId) {
        return NextResponse.json({ success: false, error: 'खबर प्रकाशित करने के लिए श्रेणी चुनना अनिवार्य है' }, { status: 400 });
      }

      let articleId = submission.articleId;
      let finalArticle;

      if (articleId) {
        // Update existing article
        finalArticle = await db.article.update({
          where: { id: articleId },
          data: {
            title: finalHeadline,
            subtitle: finalSubtitle,
            excerpt: finalExcerpt || finalHeadline.slice(0, 160),
            content: finalContent,
            featuredImage: finalFeaturedImage,
            status: 'PUBLISHED',
            primaryCategoryId: finalCatId,
            locationId: finalLocationId,
            authorId,
            sourceType: `संवाददाता / ${submission.reporterProfile.fullName}`,
            publishedAt: new Date(),
          },
        });
      } else {
        // Create new published article
        const nextNewsId = await getNextNewsId();
        const baseSlug = slugify(finalHeadline);
        const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

        finalArticle = await db.article.create({
          data: {
            newsId: nextNewsId,
            title: finalHeadline,
            subtitle: finalSubtitle,
            slug: uniqueSlug,
            excerpt: finalExcerpt || finalHeadline.slice(0, 160),
            content: finalContent,
            featuredImage: finalFeaturedImage,
            status: 'PUBLISHED',
            primaryCategoryId: finalCatId,
            locationId: finalLocationId,
            authorId,
            sourceType: `संवाददाता / ${submission.reporterProfile.fullName}`,
            publishedAt: new Date(),
          },
        });
        articleId = finalArticle.id;
      }

      const publishedNow = new Date();
      const updated = await db.reporterSubmission.update({
        where: { id },
        data: {
          headline: finalHeadline,
          subtitle: finalSubtitle,
          excerpt: finalExcerpt,
          content: finalContent,
          featuredImage: finalFeaturedImage,
          additionalImages: finalAdditionalImages,
          categoryId: finalCatId,
          locationId: finalLocationId,
          locationName: finalLocationName,
          status: 'PUBLISHED',
          articleId,
          publishedAt: publishedNow,
          reviewedBy: reviewerName,
          reviewedAt: publishedNow,
          editorComment: null,
          revisionRequested: false,
        },
      });

      await db.reporterNotification.create({
        data: {
          reporterProfileId: submission.reporterProfileId,
          submissionId: id,
          type: 'STORY_PUBLISHED',
          title: 'बधाई! आपकी खबर प्रकाशित हो गई',
          message: `आपकी खबर "${finalHeadline}" पोर्टल पर सफलतापूर्वक प्रकाशित कर दी गई है।`,
        },
      });

      // Optional push notification
      if (sendPushNotification) {
        try {
          const { sendPushNotification: dispatchPush } = await import('@/lib/push/firebaseAdmin');
          const subscribers = await db.pushSubscriber.findMany({
            where: { active: true },
            select: { token: true },
            take: 3000,
          });
          if (subscribers.length > 0 && finalArticle) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dainikmanyavar.com';
            const targetUrl = `${siteUrl}/news/${finalArticle.slug}`;

            await dispatchPush(
              subscribers.map((s) => s.token),
              {
                title: finalHeadline,
                body: finalExcerpt || finalSubtitle || 'दैनिक मान्यवर पर पूरी खबर पढ़ें...',
                image: finalFeaturedImage || undefined,
                url: targetUrl,
              }
            );
          }
        } catch (pushErr) {
          console.error('Push notification dispatch error on reporter story publish:', pushErr);
        }
      }

      // Revalidate cache
      try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/');
        revalidatePath('/category/latest');
        if (finalArticle) {
          revalidatePath(`/news/${finalArticle.slug}`);
        }
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: 'खबर सफलतापूर्वक प्रकाशित की गई!',
        data: updated,
        article: finalArticle,
      });
    }

    // 6. UNPUBLISH
    if (action === 'UNPUBLISH') {
      if (submission.articleId) {
        await db.article.update({
          where: { id: submission.articleId },
          data: { status: 'DRAFT' },
        });
      }

      const updated = await db.reporterSubmission.update({
        where: { id },
        data: {
          status: 'UNPUBLISHED',
          reviewedBy: reviewerName,
          reviewedAt: new Date(),
        },
      });

      await db.reporterNotification.create({
        data: {
          reporterProfileId: submission.reporterProfileId,
          submissionId: id,
          type: 'INFO',
          title: 'खबर अप्रकाशित की गई',
          message: `आपकी खबर "${submission.headline}" को पोर्टल से अप्रकाशित (Unpublished) किया गया है।`,
        },
      });

      return NextResponse.json({ success: true, message: 'खबर अप्रकाशित की गई', data: updated });
    }

    return NextResponse.json({ success: false, error: 'अमान्य कार्रवाई' }, { status: 400 });
  } catch (error) {
    console.error('Error reviewing reporter submission:', error);
    return NextResponse.json({ success: false, error: 'समीक्षा कार्रवाई निष्पादित करने में विफल' }, { status: 500 });
  }
}
