import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateTag } from '@/lib/tagUtils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await db.article.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        movieReview: {
          include: {
            movie: true,
          },
        },
        tags: { include: { tag: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        categoryId: article.primaryCategoryId,
        tags: article.tags.map((t) => t.tag),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      subtitle,
      excerpt,
      content,
      featuredImage,
      gallery,
      sourceType,
      categoryId,
      primaryCategoryId,
      locationId,
      status,
      allowAudio,
      videoEnabled,
      videoUrl,
      videoType,
      videoDuration,
      videoThumbnail,
      seoTitle,
      seoDescription,
      publishedAt,
      tags = [],
      contentType,
      isPromoted,
      priority,
      movieReview,
    } = body;

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const updated = await db.article.update({
      where: { id },
      data: {
        title: title || existing.title,
        subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content || existing.content,
        featuredImage: featuredImage || existing.featuredImage,
        gallery: gallery !== undefined ? gallery : existing.gallery,
        sourceType: sourceType !== undefined ? sourceType : existing.sourceType,
        primaryCategoryId: primaryCategoryId || categoryId || existing.primaryCategoryId,
        locationId: locationId !== undefined ? locationId : existing.locationId,
        status: status || existing.status,
        allowAudio: allowAudio !== undefined ? allowAudio : existing.allowAudio,
        videoEnabled: videoEnabled !== undefined ? Boolean(videoEnabled) : existing.videoEnabled,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        videoType: videoType !== undefined ? videoType : (videoUrl?.includes('youtube') ? 'youtube' : existing.videoType),
        videoDuration: videoDuration !== undefined ? videoDuration : existing.videoDuration,
        videoThumbnail: videoThumbnail !== undefined ? videoThumbnail : existing.videoThumbnail,
        seoTitle: seoTitle || existing.seoTitle,
        seoDescription: seoDescription || existing.seoDescription,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        updatedAt: new Date(),
        contentType: contentType !== undefined ? contentType : existing.contentType,
        isPromoted: isPromoted !== undefined ? Boolean(isPromoted) : existing.isPromoted,
        priority: priority !== undefined ? Number(priority) : existing.priority,
      },
    });

    if (movieReview && (contentType === 'movie_review' || existing.contentType === 'movie_review')) {
      const movieSlug = (movieReview.movieTitle || updated.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const movie = await db.movie.upsert({
        where: { slug: movieSlug || `movie-${id}` },
        update: {
          titleHindi: movieReview.movieTitleHindi || undefined,
          director: movieReview.director || undefined,
          cast: movieReview.cast || undefined,
          ottPlatform: movieReview.ottPlatform || undefined,
          poster: movieReview.poster || updated.featuredImage || undefined,
        },
        create: {
          title: movieReview.movieTitle || updated.title,
          titleHindi: movieReview.movieTitleHindi || null,
          slug: movieSlug || `movie-${id}`,
          poster: movieReview.poster || updated.featuredImage || null,
          director: movieReview.director || null,
          cast: movieReview.cast || null,
          ottPlatform: movieReview.ottPlatform || null,
          genre: movieReview.genre || 'Action, Drama',
        },
      });

      await db.movieReview.upsert({
        where: { articleId: id },
        update: {
          movieId: movie.id,
          rating: parseFloat(movieReview.rating) || 3.0,
          directionRating: movieReview.directionRating ? parseFloat(movieReview.directionRating) : undefined,
          actingRating: movieReview.actingRating ? parseFloat(movieReview.actingRating) : undefined,
          storyRating: movieReview.storyRating ? parseFloat(movieReview.storyRating) : undefined,
          musicRating: movieReview.musicRating ? parseFloat(movieReview.musicRating) : undefined,
          technicalRating: movieReview.technicalRating ? parseFloat(movieReview.technicalRating) : undefined,
          verdict: movieReview.verdict || undefined,
          positives: movieReview.positives || undefined,
          negatives: movieReview.negatives || undefined,
          spoilersContent: movieReview.spoilersContent || undefined,
          isFeaturedReview: Boolean(movieReview.isFeaturedReview),
        },
        create: {
          movieId: movie.id,
          articleId: id,
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

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/category/latest');
      revalidatePath(`/news/${updated.slug}`);
      revalidatePath('/admin/news');
    } catch (_) {}

    // Update Tags
    if (Array.isArray(tags)) {
      await db.articleTag.deleteMany({ where: { articleId: id } });

      for (const tagText of tags) {
        if (!tagText || !tagText.trim()) continue;
        const tagObj = await getOrCreateTag(tagText.trim());
        if (!tagObj) continue;

        // Check unique relation before creating
        const existingRelation = await db.articleTag.findUnique({
          where: {
            articleId_tagId: {
              articleId: id,
              tagId: tagObj.id,
            },
          },
        });

        if (!existingRelation) {
          await db.articleTag.create({
            data: {
              articleId: id,
              tagId: tagObj.id,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'समाचार सफलतापूर्वक अद्यतन (Updated) हो गया!',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
