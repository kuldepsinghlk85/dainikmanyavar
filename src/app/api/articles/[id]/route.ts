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
        locationId: article.locationId,
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
      tagIds,
      tags,
      contentType,
      isPromoted,
      priority,
      movieReview,
    } = body;

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    let hasTagsUpdate = false;
    const finalTagIds = new Set<string>();

    if (Array.isArray(tagIds)) {
      hasTagsUpdate = true;
      tagIds.forEach((tid: string) => {
        if (tid && typeof tid === 'string') finalTagIds.add(tid);
      });
    }

    if (Array.isArray(tags)) {
      hasTagsUpdate = true;
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

    let finalLocationId = locationId !== undefined ? (locationId || null) : existing.locationId;

    const loadedTags = finalTagIds.size > 0
      ? await db.tag.findMany({ where: { id: { in: Array.from(finalTagIds) } } })
      : [];

    // If locationId is not set, check if any tag corresponds to a district/location
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
          if (Array.isArray(tagIds) || Array.isArray(tags)) {
            hasTagsUpdate = true;
          }
        }
      }
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
        locationId: finalLocationId,
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
      if (finalLocationId) {
        const loc = await db.location.findUnique({ where: { id: finalLocationId } });
        if (loc?.slug) revalidatePath(`/district/${loc.slug}`);
      }
    } catch (_) {}

    // Update Tags
    if (hasTagsUpdate) {
      await db.articleTag.deleteMany({ where: { articleId: id } });

      for (const tagId of finalTagIds) {
        await db.articleTag.create({
          data: {
            articleId: id,
            tagId,
          },
        });
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
