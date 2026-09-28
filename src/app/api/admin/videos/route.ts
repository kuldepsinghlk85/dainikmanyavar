import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { getNextNewsId } from '@/lib/newsId';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const videos = await db.article.findMany({
      where: { videoEnabled: true },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, data: videos });
  } catch (error) {
    console.error('Fetch videos error:', error);
    return NextResponse.json({ success: false, error: 'वीडियो लोड करने में विफल।' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

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

    const finalThumbnail = videoThumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';

    const videoArticle = await db.article.create({
      data: {
        newsId: nextNewsId,
        title,
        slug,
        excerpt: title,
        content: content || `<p>${title} — दैनिक मान्यवर वीडियो न्यूज़ बुलेटिन।</p>`,
        featuredImage: finalThumbnail,
        videoEnabled: true,
        videoUrl,
        videoType,
        videoDuration,
        videoThumbnail: finalThumbnail,
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
  } catch (error) {
    console.error('Video create error:', error);
    return NextResponse.json({ success: false, error: 'वीडियो बुलेटिन सहेजने में विफल।' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      videoUrl,
      videoThumbnail,
      videoDuration,
      content,
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'वीडियो ID अनिवार्य है' }, { status: 400 });
    }

    // Determine video type
    let videoType: string | undefined = undefined;
    if (videoUrl) {
      videoType = 'mp4';
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        videoType = 'youtube';
      } else if (videoUrl.includes('vimeo.com')) {
        videoType = 'vimeo';
      }
    }

    const updated = await db.article.update({
      where: { id },
      data: {
        ...(title ? { title, excerpt: title } : {}),
        ...(videoUrl ? { videoUrl, videoType } : {}),
        ...(videoThumbnail ? { videoThumbnail, featuredImage: videoThumbnail } : {}),
        ...(videoDuration ? { videoDuration } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(status ? { status } : {}),
      },
    });

    await db.auditLog.create({
      data: {
        action: 'UPDATE_VIDEO_NEWS',
        objectType: 'ARTICLE_VIDEO',
        objectId: updated.id,
        detailsJson: JSON.stringify({ id, title, videoThumbnail }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Video update error:', error);
    return NextResponse.json({ success: false, error: 'वीडियो अपडेट करने में विफल।' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'वीडियो ID अनिवार्य है' }, { status: 400 });
    }

    await db.article.delete({
      where: { id },
    });

    await db.auditLog.create({
      data: {
        action: 'DELETE_VIDEO_NEWS',
        objectType: 'ARTICLE_VIDEO',
        objectId: id,
        detailsJson: JSON.stringify({ id }),
      },
    });

    return NextResponse.json({ success: true, message: 'वीडियो बुलेटिन सफलतापूर्वक हटा दिया गया।' });
  } catch (error) {
    console.error('Video delete error:', error);
    return NextResponse.json({ success: false, error: 'वीडियो हटाने में विफल।' }, { status: 500 });
  }
}
