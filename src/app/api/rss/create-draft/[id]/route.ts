import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { getNextNewsId } from '@/lib/newsId';

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

    // 1. Resolve Category
    const categoryName = importItem.source?.category || 'ताजा खबर';
    let category = await db.category.findFirst({
      where: { name: categoryName },
    });

    if (!category) {
      const slug = slugify(categoryName) || `cat-${Date.now()}`;
      category = await db.category.create({
        data: { name: categoryName, slug },
      });
    }

    // 2. Generate Unique Base Slug
    const baseSlug = slugify(importItem.originalTitle) || `article-${Date.now()}`;
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const nextNewsId = await getNextNewsId();

    // 3. Create Standard Dainik Manyavar Article in DRAFT Status
    const article = await db.article.create({
      data: {
        newsId: nextNewsId,
        title: importItem.originalTitle,
        slug,
        excerpt: importItem.originalExcerpt || importItem.originalTitle,
        content: importItem.rawContent || `<p>${importItem.originalExcerpt || importItem.originalTitle}</p><p>स्रोत: ${importItem.publisherName}</p>`,
        featuredImage: importItem.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
        category: { connect: { id: category.id } },
        status: 'DRAFT',
        originalSourceName: importItem.publisherName,
        originalSourceUrl: importItem.sourceUrl,
      },
    });

    // 4. Create Tags
    if (importItem.suggestedTagsJson) {
      try {
        const tags: string[] = JSON.parse(importItem.suggestedTagsJson);
        for (const tagText of tags) {
          if (!tagText.trim()) continue;
          let tagObj = await db.tag.findFirst({ where: { name: tagText.trim() } });
          if (!tagObj) {
            const tagSlug = slugify(tagText.trim()) || `tag-${Date.now()}`;
            tagObj = await db.tag.create({ data: { name: tagText.trim(), slug: tagSlug } });
          }

          await db.articleTag.create({
            data: {
              articleId: article.id,
              tagId: tagObj.id,
            },
          });
        }
      } catch (e) {}
    }

    // 5. Update Import Item Status to DRAFT_CREATED
    await db.newsImportItem.update({
      where: { id },
      data: { status: 'DRAFT_CREATED' },
    });

    return NextResponse.json({
      success: true,
      message: 'दैनिक मान्यवर ड्राफ्ट सफलतापूर्वक बना दिया गया!',
      articleId: article.id,
      editUrl: `/admin/news/${article.id}/edit`,
    });
  } catch (error: any) {
    console.error('Error creating 1-click draft:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
