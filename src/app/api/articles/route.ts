import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { getNextNewsId, ensureArticleNewsIds } from '@/lib/newsId';
import { getOrCreateTag } from '@/lib/tagUtils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const tagSlug = searchParams.get('tag');
    const districtSlug = searchParams.get('district');
    const query = searchParams.get('q');
    const status = searchParams.get('status') || 'PUBLISHED';
    const isMainStory = searchParams.get('main') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';
    const isBreaking = searchParams.get('breaking') === 'true';
    const isTrending = searchParams.get('trending') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status === 'ACTIVE') {
      where.status = { not: 'ARCHIVED' };
    } else if (status !== 'ALL') {
      where.status = status;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const district = districtSlug || searchParams.get('location') || searchParams.get('locationId');
    if (district) {
      let decodedDistrict = district;
      try {
        decodedDistrict = decodeURIComponent(district);
      } catch (_) {}
      const cleanDistrict = decodedDistrict.replace(/^#+/, '').trim();

      const matchedLoc = await db.location.findFirst({
        where: {
          OR: [
            { slug: district },
            { slug: decodedDistrict },
            { slug: cleanDistrict },
            { name: decodedDistrict },
            { name: cleanDistrict },
            { id: district },
          ],
        },
      });

      const locName = matchedLoc?.name || cleanDistrict;
      const locSlug = matchedLoc?.slug || cleanDistrict;
      const locId = matchedLoc?.id;

      const districtConditions: any[] = [
        { location: { slug: locSlug } },
        { location: { name: locName } },
        {
          tags: {
            some: {
              tag: {
                OR: [
                  { name: locName },
                  { name: `#${locName}` },
                  { slug: locSlug },
                  { slug: cleanDistrict },
                ],
              },
            },
          },
        },
        { title: { contains: locName } },
      ];

      if (locId) {
        districtConditions.unshift({ locationId: locId });
      }

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: districtConditions },
        ];
        delete where.OR;
      } else {
        where.OR = districtConditions;
      }
    }

    if (tagSlug) {
      let decodedTag = tagSlug;
      try {
        decodedTag = decodeURIComponent(tagSlug);
      } catch (_) {}
      const cleanTag = decodedTag.replace(/^#+/, '').trim();

      const matchingLoc = await db.location.findFirst({
        where: {
          OR: [
            { slug: tagSlug },
            { slug: decodedTag },
            { slug: cleanTag },
            { name: decodedTag },
            { name: cleanTag },
          ],
        },
      });

      const tagConditions: any[] = [
        {
          tags: {
            some: {
              tag: {
                OR: [
                  { slug: tagSlug },
                  { slug: decodedTag },
                  { slug: cleanTag },
                  { name: decodedTag },
                  { name: cleanTag },
                  { name: `#${cleanTag}` },
                ],
              },
            },
          },
        },
      ];

      if (matchingLoc) {
        tagConditions.push(
          { locationId: matchingLoc.id },
          { location: { slug: matchingLoc.slug } },
          { title: { contains: matchingLoc.name } }
        );
      }

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: tagConditions },
        ];
        delete where.OR;
      } else {
        where.OR = tagConditions;
      }
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { excerpt: { contains: query } },
        { content: { contains: query } },
      ];
    }

    if (isMainStory) where.isMainStory = true;
    if (isFeatured) where.isFeatured = true;
    if (isBreaking) where.isBreaking = true;

    // Automatically backfill any missing newsIds
    await ensureArticleNewsIds();

    const sortBy = searchParams.get('sortBy') || searchParams.get('sort');
    const sortOrder = searchParams.get('order')?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    let orderBy: any = [
      { newsId: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ];

    if (sortBy === 'newsId' || sortBy === 'id') {
      orderBy = [{ newsId: sortOrder }];
    } else if (sortBy === 'publishedAt') {
      orderBy = [{ publishedAt: sortOrder }, { newsId: sortOrder }];
    } else if (sortBy === 'createdAt') {
      orderBy = [{ createdAt: sortOrder }, { newsId: sortOrder }];
    } else if (sortBy === 'updatedAt') {
      orderBy = [{ updatedAt: sortOrder }, { newsId: sortOrder }];
    } else if (isTrending) {
      orderBy = [
        { forceTrending: 'desc' },
        { viewCount: 'desc' },
        { newsId: 'desc' },
      ];
    }

    const contentType = searchParams.get('contentType');
    if (contentType) {
      where.contentType = contentType;
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          author: true,
          location: true,
          movieReview: {
            include: {
              movie: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      db.article.count({ where }),
    ]);

    const formattedArticles = articles.map((art) => ({
      ...art,
      tags: art.tags.map((t) => t.tag),
    }));

    return NextResponse.json({
      success: true,
      data: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      excerpt,
      content,
      featuredImage,
      gallery,
      primaryCategoryId,
      authorId,
      locationId,
      tagIds = [],
      tags = [],
      isBreaking = false,
      isFeatured = false,
      isMainStory = false,
      status = 'PUBLISHED',
      allowAudio = true,
      seoTitle,
      seoDescription,
      sourceType,
      contentType = 'news',
      isPromoted = false,
      priority = 0,
      seriesId,
      movieReview,
      sendPushNotification = false,
    } = body;

    if (!title || !content || !primaryCategoryId) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and primary category are required' },
        { status: 400 }
      );
    }

    // Gather and resolve all tag IDs
    const finalTagIds = new Set<string>();
    if (Array.isArray(tagIds)) {
      tagIds.forEach((id: string) => {
        if (id && typeof id === 'string') finalTagIds.add(id);
      });
    }
    if (Array.isArray(tags)) {
      for (const t of tags) {
        if (!t) continue;
        if (typeof t === 'string') {
          if (/^[0-9a-fA-F-]{36}$/.test(t)) {
            finalTagIds.add(t);
          } else {
            const created = await getOrCreateTag(t);
            if (created) finalTagIds.add(created.id);
          }
        } else if (t.id) {
          finalTagIds.add(t.id);
        }
      }
    }

    let finalLocationId = locationId || null;

    // If locationId was not specified, check if any tag corresponds to a district
    const loadedTags = finalTagIds.size > 0
      ? await db.tag.findMany({ where: { id: { in: Array.from(finalTagIds) } } })
      : [];

    if (!finalLocationId && loadedTags.length > 0) {
      for (const tag of loadedTags) {
        const cleanName = tag.name.replace(/^#+/, '').trim();
        const matchedLoc = await db.location.findFirst({
          where: {
            OR: [
              { name: cleanName },
              { name: tag.name },
              { slug: tag.slug },
              { slug: cleanName },
            ],
          },
        });
        if (matchedLoc) {
          finalLocationId = matchedLoc.id;
          break;
        }
      }
    }

    // If location is set, ensure district tag is also included
    if (finalLocationId) {
      const loc = await db.location.findUnique({ where: { id: finalLocationId } });
      if (loc) {
        const districtTag = await getOrCreateTag(loc.name);
        if (districtTag) {
          finalTagIds.add(districtTag.id);
        }
      }
    }

    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const nextNewsId = await getNextNewsId();

    const article = await db.article.create({
      data: {
        newsId: nextNewsId,
        title,
        subtitle,
        slug: uniqueSlug,
        excerpt,
        content,
        featuredImage,
        gallery: gallery || null,
        sourceType: sourceType || null,
        primaryCategoryId,
        authorId: authorId || null,
        locationId: finalLocationId,
        isBreaking,
        isFeatured,
        isMainStory,
        status,
        allowAudio,
        contentType,
        isPromoted,
        priority,
        seriesId: seriesId || null,
        seoTitle: seoTitle || `${title} | दैनिक मान्यवर`,
        seoDescription: seoDescription || excerpt,
        publishedAt: status === 'PUBLISHED' ? new Date() : new Date(),
      },
    });

    // Create Movie Review if provided
    if (contentType === 'movie_review' && movieReview) {
      const movieSlug = slugify(movieReview.movieTitle || title);
      const movie = await db.movie.upsert({
        where: { slug: movieSlug },
        update: {
          titleHindi: movieReview.movieTitleHindi || undefined,
          director: movieReview.director || undefined,
          cast: movieReview.cast || undefined,
          ottPlatform: movieReview.ottPlatform || undefined,
          poster: movieReview.poster || featuredImage || undefined,
        },
        create: {
          title: movieReview.movieTitle || title,
          titleHindi: movieReview.movieTitleHindi || null,
          slug: movieSlug,
          poster: movieReview.poster || featuredImage || null,
          director: movieReview.director || null,
          cast: movieReview.cast || null,
          ottPlatform: movieReview.ottPlatform || null,
          genre: movieReview.genre || 'Action, Drama',
        },
      });

      await db.movieReview.create({
        data: {
          movieId: movie.id,
          articleId: article.id,
          rating: parseFloat(movieReview.rating) || 3.0,
          directionRating: movieReview.directionRating ? parseFloat(movieReview.directionRating) : null,
          actingRating: movieReview.actingRating ? parseFloat(movieReview.actingRating) : null,
          storyRating: movieReview.storyRating ? parseFloat(movieReview.storyRating) : null,
          musicRating: movieReview.musicRating ? parseFloat(movieReview.musicRating) : null,
          technicalRating: movieReview.technicalRating ? parseFloat(movieReview.technicalRating) : null,
          verdict: movieReview.verdict || null,
          positives: movieReview.positives || null,
          negatives: movieReview.negatives || null,
          spoilersContent: movieReview.spoilersContent || null,
          isFeaturedReview: Boolean(movieReview.isFeaturedReview),
        },
      });
    }

    // Optional automated push notification
    if (sendPushNotification && status === 'PUBLISHED') {
      try {
        const { sendPushNotification: dispatchPush } = await import('@/lib/push/firebaseAdmin');
        const subscribers = await db.pushSubscriber.findMany({
          where: { active: true },
          select: { token: true },
          take: 5000,
        });
        if (subscribers.length > 0) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dainikmanyavar.com';
          const targetUrl = contentType === 'movie_review'
            ? `${siteUrl}/movie-review/${article.slug}`
            : `${siteUrl}/news/${article.slug}`;

          const campaign = await db.notificationCampaign.create({
            data: {
              title: isBreaking ? `⚡ ब्रेकिंग: ${title}` : title,
              body: excerpt || subtitle || 'विस्तार से पढ़ने के लिए टैप करें...',
              image: featuredImage || null,
              url: targetUrl,
              articleId: article.id,
              targetType: 'all',
              status: 'SENDING',
              createdBy: 'article_publish',
            },
          });

          await dispatchPush(
            subscribers.map((s) => s.token),
            {
              title: isBreaking ? `⚡ ब्रेकिंग: ${title}` : title,
              body: excerpt || subtitle || 'विस्तार से पढ़ने के लिए टैप करें...',
              image: featuredImage || undefined,
              url: targetUrl,
              isBreaking,
            },
            campaign.id
          );
        }
      } catch (pushErr) {
        console.error('Auto push failed:', pushErr);
      }
    }

    if (finalTagIds.size > 0) {
      for (const tagId of finalTagIds) {
        await db.articleTag.create({
          data: {
            articleId: article.id,
            tagId,
          },
        });
      }
    }

    const shortCode = article.id.slice(0, 6);
    await db.shortLink.create({
      data: {
        articleId: article.id,
        shortCode,
      },
    });

    await db.articleRevision.create({
      data: {
        articleId: article.id,
        revisionNumber: 1,
        snapshotJson: JSON.stringify(article),
        title: article.title,
        content: article.content,
        changeNote: 'Initial Creation',
      },
    });

    await db.auditLog.create({
      data: {
        action: 'CREATE_ARTICLE',
        objectType: 'ARTICLE',
        objectId: article.id,
        detailsJson: JSON.stringify({ title: article.title, status }),
      },
    });

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/category/latest');
      revalidatePath('/admin/news');
    } catch (_) {}

    return NextResponse.json({ success: true, data: article });
  } catch (error: any) {
    console.error('Error creating article:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids, action, password } = await request.json();

    const REQUIRED_PASSWORD = process.env.DELETE_PASSWORD || 'delete123';

    if (!password || password !== REQUIRED_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: 'अमान्य सुरक्षा पासवर्ड! समाचार डिलीट करने हेतु पासवर्ड (delete123) आवश्यक है।',
        },
        { status: 403 }
      );
    }

    // 1. DELETE ALL / CLEAR_ALL: Do not destroy data! Safely gather all active news into ARCHIVED record!
    if (action === 'CLEAR_ALL') {
      const archived = await db.article.updateMany({
        where: { status: { not: 'ARCHIVED' } },
        data: { status: 'ARCHIVED' },
      });

      try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/');
        revalidatePath('/category/latest');
        revalidatePath('/admin/news');
        revalidatePath('/admin/archive/news');
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: `सभी ${archived.count} समाचार सुरक्षित रूप से 'आर्काइव रिकॉर्ड' में एकत्र कर दिए गए हैं। इन्हें आर्काइव लाइब्रेरी से कभी भी 1-क्लिक में रीस्टोर किया जा सकता है।`,
        count: archived.count,
      });
    }

    // 2. DELETE SELECTED (Bulk or Single from News Manager): Move to ARCHIVED record!
    if (action === 'DELETE_SELECTED' && Array.isArray(ids)) {
      const archived = await db.article.updateMany({
        where: { id: { in: ids } },
        data: { status: 'ARCHIVED' },
      });

      try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/');
        revalidatePath('/category/latest');
        revalidatePath('/admin/news');
        revalidatePath('/admin/archive/news');
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: `${archived.count} समाचार 'आर्काइव रिकॉर्ड' में सुरक्षित एकत्र कर दिए गए हैं। इन्हें कभी भी पुनः रीस्टोर किया जा सकता है।`,
        count: archived.count,
      });
    }

    // 3. PERMANENT DELETE (Only from Archive Library with explicit admin confirmation & password)
    if (action === 'PERMANENT_DELETE' && Array.isArray(ids)) {
      await db.articleTag.deleteMany({ where: { articleId: { in: ids } } });
      await db.userSavedArticle.deleteMany({ where: { articleId: { in: ids } } });
      await db.articleAudio.deleteMany({ where: { articleId: { in: ids } } });
      await db.shortLink.deleteMany({ where: { articleId: { in: ids } } });
      await db.articleRevision.deleteMany({ where: { articleId: { in: ids } } });
      await db.breakingNews.deleteMany({ where: { articleId: { in: ids } } });

      const deleted = await db.article.deleteMany({
        where: { id: { in: ids } },
      });

      try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/');
        revalidatePath('/category/latest');
        revalidatePath('/admin/news');
        revalidatePath('/admin/archive/news');
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: `${deleted.count} समाचार डेटाबेस से स्थायी रूप से हटा दिए गए।`,
        count: deleted.count,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in DELETE /api/articles:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
