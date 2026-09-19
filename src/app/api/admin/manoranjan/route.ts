import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { getNextNewsId } from '@/lib/newsId';
import { getOrCreateTag } from '@/lib/tagUtils';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subtype = searchParams.get('subtype'); // 'movies' | 'viral' | 'cricket_buzz' | 'movie_review' | null
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // 1. Get Manoranjan Category
    let category = await db.category.findUnique({
      where: { slug: 'manoranjan' },
    });
    if (!category) {
      category = await db.category.create({
        data: {
          name: 'मनोरंजन',
          slug: 'manoranjan',
          order: 7,
          isHeaderMenu: true,
        },
      });
    }

    const where: any = {
      primaryCategoryId: category.id,
    };

    if (subtype && subtype !== 'all') {
      where.sourceType = subtype;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subtitle: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [articles, total, allSubtypes] = await Promise.all([
      db.article.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          newsId: true,
          title: true,
          subtitle: true,
          slug: true,
          featuredImage: true,
          gallery: true,
          sourceType: true,
          status: true,
          isFeatured: true,
          isBreaking: true,
          viewCount: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
      db.article.count({ where }),
      db.article.findMany({
        where: { primaryCategoryId: category.id },
        select: { sourceType: true },
      }),
    ]);

    // Count by subtype
    const counts = {
      all: allSubtypes.length,
      movies: allSubtypes.filter((a) => a.sourceType === 'movies').length,
      viral: allSubtypes.filter((a) => a.sourceType === 'viral').length,
      cricket_buzz: allSubtypes.filter((a) => a.sourceType === 'cricket_buzz').length,
      movie_review: allSubtypes.filter((a) => a.sourceType === 'movie_review').length,
    };

    // 2. Fetch Widget Settings
    const settingKeys = [
      'section_manoranjan_enabled',
      'mobile_manoranjan_enabled',
      'manoranjan_widget_reviews_enabled',
      'manoranjan_widget_viral_enabled',
      'manoranjan_widget_cricket_enabled',
      'manoranjan_widget_films_enabled',
    ];

    const settingsRows = await db.siteSetting.findMany({
      where: { key: { in: settingKeys } },
    });

    const settings: Record<string, string> = {
      section_manoranjan_enabled: 'true',
      mobile_manoranjan_enabled: 'true',
      manoranjan_widget_reviews_enabled: 'true',
      manoranjan_widget_viral_enabled: 'true',
      manoranjan_widget_cricket_enabled: 'true',
      manoranjan_widget_films_enabled: 'true',
    };

    settingsRows.forEach((r) => {
      settings[r.key] = r.value;
    });

    return NextResponse.json({
      success: true,
      data: {
        articles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        counts,
        settings,
        categoryId: category.id,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'त्रुटि हुई' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const body = await request.json();

    // Check if this is a widget settings update
    if (body.updateSettings) {
      const { settings } = body;
      for (const [key, value] of Object.entries(settings)) {
        await db.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }

      try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/');
        revalidatePath('/manoranjan');
        revalidatePath('/mobile');
        revalidatePath('/mobile/manoranjan');
      } catch (_) {}

      return NextResponse.json({ success: true, message: 'विजेट सेटिंग्स सुरक्षित की गईं' });
    }

    // Otherwise, create a new Manoranjan article
    const {
      title,
      subtitle,
      excerpt,
      content,
      featuredImage,
      subtype = 'movies',
      reviewData,
      isFeatured = false,
      isBreaking = false,
      status = 'PUBLISHED',
      videoUrl,
      videoThumbnail,
      videoDuration = '1:00',
      tags = [],
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'शीर्षक और विवरण आवश्यक हैं' },
        { status: 400 }
      );
    }

    // Ensure Manoranjan category
    let category = await db.category.findUnique({
      where: { slug: 'manoranjan' },
    });
    if (!category) {
      category = await db.category.create({
        data: {
          name: 'मनोरंजन',
          slug: 'manoranjan',
          order: 7,
          isHeaderMenu: true,
        },
      });
    }

    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const nextNewsId = await getNextNewsId();

    const galleryJson = reviewData ? JSON.stringify(reviewData) : null;
    const hasVideo = Boolean(videoUrl && videoUrl.trim());

    const article = await db.article.create({
      data: {
        newsId: nextNewsId,
        title,
        subtitle: subtitle || (reviewData?.verdict ? `वर्डिक्ट: ${reviewData.verdict}` : null),
        slug: uniqueSlug,
        excerpt: excerpt || subtitle || '',
        content,
        featuredImage: featuredImage || null,
        gallery: galleryJson,
        sourceType: subtype,
        primaryCategoryId: category.id,
        isBreaking,
        isFeatured,
        status,
        allowAudio: true,
        videoEnabled: hasVideo,
        videoUrl: hasVideo ? videoUrl.trim() : null,
        videoType: hasVideo ? (videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? 'youtube' : 'mp4') : null,
        videoThumbnail: hasVideo ? (videoThumbnail?.trim() || featuredImage || null) : null,
        videoDuration: hasVideo ? (videoDuration?.trim() || '1:00') : null,
        seoTitle: `${title} | मनोरंजन - दैनिक मान्यवर`,
        seoDescription: excerpt || subtitle || title,
        publishedAt: new Date(),
      },
    });

    // Handle tags (normalize, deduplicate & link to ArticleTag as first-class data content)
    const rawTagsList: string[] = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    if (rawTagsList.length === 0) {
      rawTagsList.push('#मनोरंजन');
      if (subtype === 'movies') rawTagsList.push('#सिनेमा', '#बॉलीवुड');
      if (subtype === 'movie_review') rawTagsList.push('#मूवी_रिव्यू', '#फिल्म_समीक्षा');
      if (subtype === 'viral') rawTagsList.push('#वायरल_न्यूज', '#दिलचस्प');
      if (subtype === 'cricket_buzz') rawTagsList.push('#क्रिकेट', '#खेल_समाचार');
    }

    for (const tagStr of rawTagsList) {
      if (!tagStr || !tagStr.trim()) continue;
      const tagObj = await getOrCreateTag(tagStr.trim());
      if (tagObj) {
        try {
          await db.articleTag.create({
            data: {
              articleId: article.id,
              tagId: tagObj.id,
            },
          });
        } catch (_) {}
      }
    }

    const shortCode = article.id.slice(0, 6);
    await db.shortLink.create({
      data: {
        articleId: article.id,
        shortCode,
      },
    });

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/manoranjan');
      revalidatePath('/mobile');
      revalidatePath('/mobile/manoranjan');
      revalidatePath('/admin/manoranjan');
    } catch (_) {}

    return NextResponse.json({ success: true, data: article });
  } catch (error: any) {
    console.error('Error in POST /api/admin/manoranjan:', error);
    return NextResponse.json({ success: false, error: error.message || 'आर्टिकल बनाने में त्रुटि' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Article ID required' }, { status: 400 });
    }

    await db.article.delete({ where: { id } });

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/manoranjan');
      revalidatePath('/mobile');
      revalidatePath('/mobile/manoranjan');
      revalidatePath('/admin/manoranjan');
    } catch (_) {}

    return NextResponse.json({ success: true, message: 'आर्टिकल हटाया गया' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'हटाने में त्रुटि' }, { status: 500 });
  }
}
