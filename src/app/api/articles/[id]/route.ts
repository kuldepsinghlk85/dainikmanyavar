import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
      categoryId,
      primaryCategoryId,
      locationId,
      status,
      allowAudio,
      seoTitle,
      seoDescription,
      publishedAt,
      tags = [],
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
        primaryCategoryId: primaryCategoryId || categoryId || existing.primaryCategoryId,
        locationId: locationId !== undefined ? locationId : existing.locationId,
        status: status || existing.status,
        allowAudio: allowAudio !== undefined ? allowAudio : existing.allowAudio,
        seoTitle: seoTitle || existing.seoTitle,
        seoDescription: seoDescription || existing.seoDescription,
        publishedAt: publishedAt ? new Date(publishedAt) : existing.publishedAt,
      },
    });

    // Update Tags
    if (Array.isArray(tags)) {
      await db.articleTag.deleteMany({ where: { articleId: id } });

      for (const tagText of tags) {
        if (!tagText.trim()) continue;
        let tagObj = await db.tag.findFirst({ where: { name: tagText.trim() } });
        if (!tagObj) {
          const tagSlug = tagText.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0900-\u097F\-]+/g, '');
          tagObj = await db.tag.create({ data: { name: tagText.trim(), slug: tagSlug || `tag-${Date.now()}` } });
        }

        await db.articleTag.create({
          data: {
            articleId: id,
            tagId: tagObj.id,
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
