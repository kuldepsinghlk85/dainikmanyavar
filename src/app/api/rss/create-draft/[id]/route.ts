import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { getNextNewsId } from '@/lib/newsId';
import { getOrCreateTag } from '@/lib/tagUtils';
import { translateArticleData } from '@/lib/translate';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const importItem = await db.newsImportItem.findUnique({
      where: { id },
      include: { source: true },
    });

    if (!importItem) {
      return NextResponse.json({ success: false, error: 'Imported item not found' }, { status: 404 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    // 1. Resolve Category
    let category = null;
    if (importItem.source?.defaultCategoryId) {
      category = await db.category.findUnique({
        where: { id: importItem.source.defaultCategoryId },
      });
    }

    if (!category && importItem.suggestedCategoryId) {
      category = await db.category.findUnique({
        where: { id: importItem.suggestedCategoryId },
      });
    }

    const isEntertainment = 
      importItem.source?.category === 'Entertainment' ||
      importItem.source?.region === 'Bollywood' ||
      importItem.source?.region === 'Hollywood' ||
      importItem.source?.region === 'Box Office' ||
      importItem.source?.region === 'OTT' ||
      importItem.source?.region === 'Viral';

    if (!category && isEntertainment) {
      category = await db.category.findUnique({ where: { slug: 'manoranjan' } });
    }

    if (!category) {
      const categoryName = importItem.source?.category || 'ताजा खबर';
      category = await db.category.findFirst({
        where: { name: categoryName },
      });

      if (!category) {
        const slug = slugify(categoryName) || `cat-${Date.now()}`;
        category = await db.category.create({
          data: { name: categoryName, slug },
        });
      }
    }

    // Determine subtype for Manoranjan
    let articleSourceType: string | null = null;
    if (category.slug === 'manoranjan' || isEntertainment) {
      const title = importItem.originalTitle || '';
      const region = importItem.source?.region || '';
      if (/review|रिव्यू|रेटिंग|समीक्षा/i.test(title)) {
        articleSourceType = 'movie_review';
      } else if (region === 'Viral' || /वायरल|viral|video|वीडियो/i.test(title)) {
        articleSourceType = 'viral';
      } else if (importItem.source?.category === 'Cricket' || /क्रिकेट|cricket/i.test(title)) {
        articleSourceType = 'cricket_buzz';
      } else {
        articleSourceType = 'movies';
      }
    }
    if (body.sourceType) {
      articleSourceType = body.sourceType;
    }

    const publishNow = body.publishNow === true || body.status === 'PUBLISHED';
    const targetStatus = publishNow ? 'PUBLISHED' : 'DRAFT';
    const publishedAt = publishNow ? new Date() : undefined;

    // 2. Auto-Translate to Hindi if English text is detected or requested
    let finalTitle = importItem.originalTitle;
    let finalExcerpt = importItem.originalExcerpt || importItem.originalTitle;
    let finalContent = importItem.rawContent || `<p>${finalExcerpt}</p><p>स्रोत: ${importItem.publisherName}</p>`;
    let finalTags: string[] = importItem.suggestedTagsJson ? JSON.parse(importItem.suggestedTagsJson) : [];

    if (body.translate !== false && (/[a-zA-Z]{3,}/.test(finalTitle) || /[a-zA-Z]{3,}/.test(finalExcerpt))) {
      const trans = await translateArticleData({
        title: finalTitle,
        excerpt: finalExcerpt,
        content: finalContent,
        tags: finalTags,
      });
      finalTitle = trans.title;
      finalExcerpt = trans.excerpt;
      finalContent = trans.content;
      finalTags = trans.tags;
    }

    // 3. Generate Unique Base Slug
    const baseSlug = slugify(finalTitle) || `article-${Date.now()}`;
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const nextNewsId = await getNextNewsId();

    // 4. Create Standard Dainik Manyavar Article in Hindi
    const article = await db.article.create({
      data: {
        newsId: nextNewsId,
        title: finalTitle,
        slug,
        excerpt: finalExcerpt,
        content: finalContent,
        featuredImage: importItem.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
        category: { connect: { id: category.id } },
        status: targetStatus,
        publishedAt,
        sourceType: articleSourceType,
        originalSourceName: importItem.publisherName,
        originalSourceUrl: importItem.sourceUrl,
        isImported: true,
        importItemId: importItem.id,
      },
    });

    // 4. Create Tags
    if (finalTags && finalTags.length > 0) {
      try {
        for (const tagText of finalTags) {
          if (!tagText || !tagText.trim()) continue;
          const tagObj = await getOrCreateTag(tagText.trim());
          if (!tagObj) continue;

          await db.articleTag.upsert({
            where: {
              articleId_tagId: {
                articleId: article.id,
                tagId: tagObj.id,
              },
            },
            create: {
              articleId: article.id,
              tagId: tagObj.id,
            },
            update: {},
          });
        }
      } catch (e) {}
    }

    // 5. Update Import Item Status & Cache Hindi Text
    await db.newsImportItem.update({
      where: { id },
      data: {
        status: publishNow ? 'APPROVED' : 'DRAFT_CREATED',
        originalTitle: finalTitle,
        originalExcerpt: finalExcerpt,
        suggestedTagsJson: JSON.stringify(finalTags),
      },
    });

    return NextResponse.json({
      success: true,
      message: publishNow
        ? 'दैनिक मान्यवर मनोरंजन पोर्टल पर सफलतापूर्वक लाइव प्रकाशित कर दिया गया!'
        : 'दैनिक मान्यवर ड्राफ्ट सफलतापूर्वक बना दिया गया!',
      articleId: article.id,
      published: publishNow,
      editUrl: `/admin/news/${article.id}/edit`,
      publicUrl: publishNow ? `/news/${article.slug}` : undefined,
    });
  } catch (error: any) {
    console.error('Error creating 1-click draft:', error);
    return NextResponse.json({ success: false, error: 'ड्राफ्ट बनाने में समस्या आई' }, { status: 500 });
  }
}
