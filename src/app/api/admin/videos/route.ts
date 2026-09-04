import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { getNextNewsId } from '@/lib/newsId';

export async function GET() {
  try {
    const videos = await db.article.findMany({
      where: { videoEnabled: true },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: videos });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      videoUrl,
      videoThumbnail,
      videoDuration = '3:00',
      categorySlug = 'uttar-pradesh',
      content = '',
    } = body;

    if (!title || !videoUrl) {
      return NextResponse.json({ success: false, error: 'शीर्षक और वीडियो लिंक अनिवार्य हैं' }, { status: 400 });
    }

    // Determine video type (YouTube / Direct MP4 / Embed)
    let videoType = 'mp4';
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      videoType = 'youtube';
    } else if (videoUrl.includes('vimeo.com')) {
      videoType = 'vimeo';
    }

    // Find or fallback primary category
    const category = await db.category.findFirst({
      where: { slug: categorySlug },
    }) || await db.category.findFirst();

    if (!category) {
      return NextResponse.json({ success: false, error: 'कोई श्रेणी उपलब्ध नहीं है' }, { status: 400 });
    }

    const slug = `${slugify(title)}-video-${Date.now().toString().slice(-4)}`;
    const nextNewsId = await getNextNewsId();

    const videoArticle = await db.article.create({
      data: {
        newsId: nextNewsId,
        title,
        slug,
        excerpt: title,
        content: content || `<p>${title} — दैनिक मान्यवर वीडियो न्यूज़ बुलेटिन।</p>`,
        featuredImage: videoThumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
        videoEnabled: true,
        videoUrl,
        videoType,
        videoDuration,
        videoThumbnail: videoThumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
        primaryCategoryId: category.id,
        status: 'PUBLISHED',
        isFeatured: true,
      },
    });

    await db.auditLog.create({
      data: {
        action: 'CREATE_VIDEO_NEWS',
        objectType: 'ARTICLE_VIDEO',
        objectId: videoArticle.id,
        detailsJson: JSON.stringify({ title, videoUrl }),
      },
    });

    return NextResponse.json({ success: true, data: videoArticle });
  } catch (error: any) {
    console.error('Video create error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
