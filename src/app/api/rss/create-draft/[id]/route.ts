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

    // 1. Resolve Category Foolproof
    let category = null;

    // Check direct category ID on source or item
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

    // Smart slug mapping for special modules and Hindi categories
    if (!category) {
      const catRaw = (importItem.source?.category || '').trim();
      const title = importItem.originalTitle || '';

      let targetSlug = '';
      if (/gold|silver|सोना|चांदी/i.test(catRaw) || /सोना|चांदी|gold rate|gold price|silver price/i.test(title)) {
        targetSlug = 'gold-silver';
      } else if (/cricket|क्रिकेट/i.test(catRaw) || /क्रिकेट|cricket|ipl|wpl|bcci/i.test(title)) {
        targetSlug = 'cricket';
      } else if (/stock|market|शेयर|बाजार|sensex|nifty|रुपया/i.test(catRaw) || /शेयर बाजार|sensex|nifty|share market/i.test(title)) {
        targetSlug = 'arthjagat';
      } else if (/rashifal|horoscope|ज्योतिष|राशिफल/i.test(catRaw) || /राशिफल|राशि|पंचांग/i.test(title)) {
        targetSlug = 'dharm-sanskriti';
      } else if (isEntertainment || /फिल्म|सिनेमा|बॉलीवुड|रिव्यू|मनोरंजन|box office/i.test(title)) {
        targetSlug = 'manoranjan';
      } else if (/breaking|ताजा खबर|latest/i.test(catRaw)) {
        targetSlug = 'latest';
      } else if (/editorial|विचार|opinion|संपादकीय/i.test(catRaw)) {
        targetSlug = 'samaj';
      } else if (/national|देश|desh/i.test(catRaw)) {
        targetSlug = 'desh';
      } else if (/uttar-pradesh|up|उत्तर प्रदेश/i.test(catRaw) || /उत्तर प्रदेश|लखनऊ|वाराणसी|जौनपुर/i.test(title)) {
        targetSlug = 'uttar-pradesh';
      }

      if (targetSlug) {
        category = await db.category.findUnique({
          where: { slug: targetSlug },
        });
      }
    }

    // Fallback: match by slugified category name, then exact name, then 'latest', then first category
    if (!category) {
      const categoryName = importItem.source?.category || 'ताजा खबर';
      const slugCandidate = slugify(categoryName);

      if (slugCandidate) {
        category = await db.category.findUnique({
          where: { slug: slugCandidate },
        });
      }

      if (!category) {
        category = await db.category.findFirst({
          where: { name: categoryName },
        });
      }

      if (!category) {
        category = await db.category.findUnique({
          where: { slug: 'latest' },
        });
      }

      if (!category) {
        category = await db.category.findFirst();
      }
    }

    if (!category) {
      throw new Error('कोई वैध श्रेणी (Category) उपलब्ध नहीं है');
    }

    // Determine articleSourceType
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
    } else if (category.slug === 'gold-silver') {
      articleSourceType = 'gold_silver';
    } else if (category.slug === 'arthjagat') {
      articleSourceType = 'stock_market';
    } else if (category.slug === 'cricket') {
      articleSourceType = 'cricket_buzz';
    }

    if (body.sourceType) {
      articleSourceType = body.sourceType;
    }

    const publishNow = body.publishNow === true || body.status === 'PUBLISHED';
    const targetStatus = publishNow ? 'PUBLISHED' : 'DRAFT';
    const publishedAt = publishNow ? new Date() : undefined;

    // Helper to sanitize editorial text
    const sanitizeEditorialText = (text: string): string => {
      if (!text) return '';
      let s = text
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
      s = s.replace(/<font[^>]*>[\s\S]*?<\/font>/gi, '');
      s = s.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1');
      s = s.replace(/<[^>]+>/g, ' ');
      s = s.replace(/\s+/g, ' ').trim();
      s = s.replace(/\s*-\s*[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s*$/i, '');
      return s;
    };

    // 2. Clean and Auto-Translate to Hindi
    let finalTitle = sanitizeEditorialText(importItem.originalTitle);
    let finalExcerpt = sanitizeEditorialText(importItem.originalExcerpt || importItem.originalTitle);
    let finalContent = `<p>${finalExcerpt}</p><p><strong>दैनिक मान्यवर समाचार:</strong> इस खबर की संपूर्ण जानकारी एवं विस्तृत विवरण के लिए मूल प्रकाशक देखें।</p><p><em>(स्रोत: ${importItem.publisherName} — <a href="${importItem.sourceUrl}" target="_blank" rel="noopener">मूल समाचार लिंक खोलें</a>)</em></p>`;
    let finalTags: string[] = importItem.suggestedTagsJson ? JSON.parse(importItem.suggestedTagsJson) : [];

    // Add gold-silver specific tags if appropriate
    if (category.slug === 'gold-silver' && !finalTags.some(t => t.includes('सोना') || t.includes('चांदी'))) {
      finalTags.push('#सोना_चांदी_भाव', '#आज_का_सोने_का_भाव');
    }

    if (body.translate !== false && (/[a-zA-Z]{3,}/.test(finalTitle) || /[a-zA-Z]{3,}/.test(finalExcerpt))) {
      try {
        const trans = await translateArticleData({
          title: finalTitle,
          excerpt: finalExcerpt,
          content: finalContent,
          tags: finalTags,
        });
        finalTitle = sanitizeEditorialText(trans.title);
        finalExcerpt = sanitizeEditorialText(trans.excerpt);
        finalContent = `<p>${finalExcerpt}</p><p><strong>दैनिक मान्यवर समाचार:</strong> इस खबर की संपूर्ण जानकारी एवं विस्तृत विवरण के लिए मूल प्रकाशक देखें।</p><p><em>(स्रोत: ${importItem.publisherName} — <a href="${importItem.sourceUrl}" target="_blank" rel="noopener">मूल समाचार लिंक खोलें</a>)</em></p>`;
        finalTags = trans.tags;
      } catch (transErr) {
        console.warn('Translation fallback warning:', transErr);
      }
    }

    // 3. Generate Unique Base Slug
    const baseSlug = slugify(finalTitle) || `article-${Date.now()}`;
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const nextNewsId = await getNextNewsId();

    // 4. Create Standard Dainik Manyavar Article
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

    // 5. Connect / Create Tags
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

    // 6. Update Import Item Status & Cache
    await db.newsImportItem.update({
      where: { id },
      data: {
        status: publishNow ? 'APPROVED' : 'DRAFT_CREATED',
        editorialStatus: 'DRAFT_CREATED',
        originalTitle: finalTitle,
        originalExcerpt: finalExcerpt,
        suggestedTagsJson: JSON.stringify(finalTags),
      },
    });

    return NextResponse.json({
      success: true,
      message: publishNow
        ? 'दैनिक मान्यवर पोर्टल पर सफलतापूर्वक लाइव प्रकाशित कर दिया गया!'
        : 'दैनिक मान्यवर ड्राफ्ट सफलतापूर्वक बना दिया गया!',
      articleId: article.id,
      published: publishNow,
      editUrl: `/admin/news/${article.id}/edit`,
      publicUrl: publishNow ? `/news/${article.slug}` : undefined,
    });
  } catch (error: any) {
    console.error('Error creating 1-click draft:', error);
    return NextResponse.json({ success: false, error: `ड्राफ्ट बनाने में समस्या आई: ${error.message || 'अज्ञात त्रुटि'}` }, { status: 500 });
  }
}
