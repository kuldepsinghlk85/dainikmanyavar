import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { syncSingleRssSource } from '@/lib/importer/rssEngine';
import { slugify } from '@/lib/utils';
import { getNextNewsId } from '@/lib/newsId';
import { getOrCreateTag } from '@/lib/tagUtils';
import { translateArticleData, translateTextToHindi } from '@/lib/translate';

const ENTERTAINMENT_REGIONS = ['Bollywood', 'Hollywood', 'Box Office', 'OTT', 'Viral'];

function getRegionOrCategoryFilter(subcat: string | null) {
  switch (subcat) {
    case 'bollywood':
      return { region: 'Bollywood' };
    case 'hollywood':
      return { region: 'Hollywood' };
    case 'box_office':
      return { region: 'Box Office' };
    case 'ott':
      return { region: 'OTT' };
    case 'viral':
      return { region: 'Viral' };
    case 'cricket':
      return { category: 'Cricket' };
    case 'gold_silver':
      return { category: 'Gold Silver' };
    default:
      return {
        OR: [
          { category: 'Entertainment' },
          { region: { in: ENTERTAINMENT_REGIONS } },
          { category: 'Cricket' },
          { category: 'Gold Silver' },
        ],
      };
  }
}

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subcat = searchParams.get('subcat'); // 'all' | 'bollywood' | 'hollywood' | 'box_office' | 'ott' | 'viral' | 'cricket' | 'gold_silver'
    const status = searchParams.get('status') || 'NEW';

    const sourceWhere: any = {
      isActive: true,
      ...getRegionOrCategoryFilter(subcat),
    };

    // 1. Fetch Sources
    const sources = await db.newsSource.findMany({
      where: sourceWhere,
      orderBy: [{ lastFetchAt: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        publisherName: true,
        logoUrl: true,
        category: true,
        region: true,
        feedUrl: true,
        websiteUrl: true,
        sourceType: true,
        healthStatus: true,
        lastFetchAt: true,
        isActive: true,
      },
    });

    const sourceIds = sources.map((s) => s.id);

    // 2. Fetch Latest Import Items
    const items = await db.newsImportItem.findMany({
      where: {
        sourceId: { in: sourceIds },
        status,
      },
      orderBy: [{ importedAt: 'desc' }, { sourcePublishedAt: 'desc' }],
      take: 40,
      include: {
        source: {
          select: {
            id: true,
            name: true,
            publisherName: true,
            category: true,
            region: true,
          },
        },
      },
    });

    // 3. Counts summary
    const [newCount, draftedCount] = await Promise.all([
      db.newsImportItem.count({
        where: { sourceId: { in: sourceIds }, status: 'NEW' },
      }),
      db.newsImportItem.count({
        where: { sourceId: { in: sourceIds }, status: { in: ['DRAFT_CREATED', 'APPROVED'] } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        sources,
        items,
        counts: {
          totalSources: sources.length,
          newItems: newCount,
          draftedItems: draftedCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching Manoranjan RSS data:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // A. SYNC ALL ENTERTAINMENT SOURCES
    if (action === 'SYNC_ALL') {
      const subcat = body.subcat || null;
      const sourceWhere: any = {
        isActive: true,
        ...getRegionOrCategoryFilter(subcat),
      };

      const sources = await db.newsSource.findMany({ where: sourceWhere });
      let totalFound = 0;
      let newNews = 0;
      let duplicate = 0;
      let failed = 0;
      const syncedSources: string[] = [];

      for (const s of sources) {
        try {
          const res = await syncSingleRssSource(s.id);
          totalFound += res.totalFound;
          newNews += res.newNews;
          duplicate += res.duplicate;
          syncedSources.push(s.name);
        } catch (e) {
          failed++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `सफलतापूर्वक ${sources.length} मनोरंजन सोर्सेज सिंक किए गए!`,
        totalSources: sources.length,
        totalFound,
        newNews,
        duplicate,
        failed,
        syncedSources,
      });
    }

    // B. SYNC SINGLE SOURCE
    if (action === 'SYNC_ONE') {
      const { sourceId } = body;
      if (!sourceId) {
        return NextResponse.json({ success: false, error: 'sourceId आवश्यक है' }, { status: 400 });
      }

      const res = await syncSingleRssSource(sourceId);
      return NextResponse.json({
        ...res,
        message: `${res.sourceName} सिंक पूर्ण! +${res.newNews} नई खबरें मिलीं`,
      });
    }

    // C. TRANSLATE SINGLE IMPORT ITEM TO HINDI
    if (action === 'TRANSLATE_ITEM') {
      const { importItemId } = body;
      if (!importItemId) {
        return NextResponse.json({ success: false, error: 'importItemId आवश्यक है' }, { status: 400 });
      }

      const item = await db.newsImportItem.findUnique({
        where: { id: importItemId },
        include: { source: true },
      });

      if (!item) {
        return NextResponse.json({ success: false, error: 'खबर नहीं मिली' }, { status: 404 });
      }

      const [translatedTitle, translatedExcerpt] = await Promise.all([
        translateTextToHindi(item.originalTitle),
        translateTextToHindi(item.originalExcerpt || item.originalTitle),
      ]);

      const currentTags: string[] = item.suggestedTagsJson ? JSON.parse(item.suggestedTagsJson) : [];
      const translatedData = await translateArticleData({ tags: currentTags });

      const updated = await db.newsImportItem.update({
        where: { id: importItemId },
        data: {
          originalTitle: translatedTitle,
          originalExcerpt: translatedExcerpt,
          suggestedTagsJson: JSON.stringify(translatedData.tags),
        },
        include: {
          source: {
            select: {
              id: true,
              name: true,
              publisherName: true,
              category: true,
              region: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'खबर का हिंदी अनुवाद सफल रहा!',
        item: updated,
      });
    }

    // D. CREATE DRAFT OR PUBLISH LIVE TO MANORANJAN
    if (action === 'CREATE_DRAFT' || action === 'PUBLISH_LIVE') {
      const { importItemId, customSubtype, translate } = body;
      if (!importItemId) {
        return NextResponse.json({ success: false, error: 'importItemId आवश्यक है' }, { status: 400 });
      }

      const importItem = await db.newsImportItem.findUnique({
        where: { id: importItemId },
        include: { source: true },
      });

      if (!importItem) {
        return NextResponse.json({ success: false, error: 'आयातित खबर नहीं मिली' }, { status: 404 });
      }

      // 1. Resolve Manoranjan Category
      let manoranjanCat = await db.category.findUnique({ where: { slug: 'manoranjan' } });
      if (!manoranjanCat) {
        manoranjanCat = await db.category.create({
          data: { name: 'मनोरंजन', slug: 'manoranjan', order: 7, isHeaderMenu: true },
        });
      }

      // 2. Auto-Translate to Hindi if English text is detected or requested
      let finalTitle = importItem.originalTitle;
      let finalExcerpt = importItem.originalExcerpt || importItem.originalTitle;
      let finalContent = importItem.rawContent || `<p>${finalExcerpt}</p><p>स्रोत: ${importItem.publisherName}</p>`;
      let finalTags: string[] = importItem.suggestedTagsJson ? JSON.parse(importItem.suggestedTagsJson) : [];

      const needsTranslation =
        translate !== false && (/[a-zA-Z]{3,}/.test(finalTitle) || /[a-zA-Z]{3,}/.test(finalExcerpt));

      if (needsTranslation) {
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

      // 3. Resolve Subtype
      let subtype = customSubtype;
      if (!subtype) {
        const title = finalTitle || '';
        const region = importItem.source?.region || '';
        if (/review|रिव्यू|रेटिंग|समीक्षा/i.test(title)) {
          subtype = 'movie_review';
        } else if (region === 'Viral' || /वायरल|viral|video|वीडियो/i.test(title)) {
          subtype = 'viral';
        } else if (importItem.source?.category === 'Cricket' || /क्रिकेट|cricket/i.test(title)) {
          subtype = 'cricket_buzz';
        } else {
          subtype = 'movies';
        }
      }

      const isLive = action === 'PUBLISH_LIVE';
      const baseSlug = slugify(finalTitle) || `manoranjan-${Date.now()}`;
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      const nextNewsId = await getNextNewsId();

      // Check if video present
      const hasVideo = subtype === 'viral' && (importItem.sourceUrl.includes('video') || importItem.sourceUrl.includes('reddit') || importItem.sourceUrl.includes('youtube'));

      // 4. Create Article in Hindi
      const article = await db.article.create({
        data: {
          newsId: nextNewsId,
          title: finalTitle,
          subtitle: `स्रोत: ${importItem.publisherName}`,
          slug,
          excerpt: finalExcerpt,
          content: finalContent,
          featuredImage: importItem.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
          primaryCategoryId: manoranjanCat.id,
          status: isLive ? 'PUBLISHED' : 'DRAFT',
          publishedAt: isLive ? new Date() : undefined,
          sourceType: subtype,
          source: importItem.publisherName,
          originalSourceName: importItem.publisherName,
          originalSourceUrl: importItem.sourceUrl,
          isImported: true,
          importItemId: importItem.id,
          videoEnabled: hasVideo,
          videoUrl: hasVideo ? importItem.sourceUrl : null,
        },
      });

      // 5. Attach Tags
      for (const t of finalTags) {
        if (!t || !t.trim()) continue;
        const tagObj = await getOrCreateTag(t.trim());
        if (!tagObj) continue;
        await db.articleTag.upsert({
          where: {
            articleId_tagId: { articleId: article.id, tagId: tagObj.id },
          },
          create: { articleId: article.id, tagId: tagObj.id },
          update: {},
        });
      }

      // 6. Update Import Item Status & Cache Hindi Text
      await db.newsImportItem.update({
        where: { id: importItemId },
        data: {
          status: isLive ? 'APPROVED' : 'DRAFT_CREATED',
          originalTitle: finalTitle,
          originalExcerpt: finalExcerpt,
          suggestedTagsJson: JSON.stringify(finalTags),
        },
      });

      return NextResponse.json({
        success: true,
        message: isLive
          ? 'खबर को सीधे मनोरंजन पोर्टल पर लाइव प्रकाशित कर दिया गया है!'
          : 'दैनिक मान्यवर मनोरंजन ड्राफ्ट सफलतापूर्वक बना दिया गया!',
        articleId: article.id,
        published: isLive,
        slug: article.slug,
        editUrl: `/admin/news/${article.id}/edit`,
        publicUrl: isLive ? `/news/${article.slug}` : undefined,
      });
    }

    // D. DELETE IMPORT ITEM
    if (action === 'DELETE_ITEM') {
      const { importItemId } = body;
      if (!importItemId) {
        return NextResponse.json({ success: false, error: 'importItemId आवश्यक है' }, { status: 400 });
      }

      await db.newsImportItem.delete({ where: { id: importItemId } });
      return NextResponse.json({ success: true, message: 'खबर इनबॉक्स से हटा दी गई' });
    }

    return NextResponse.json({ success: false, error: 'अमान्य कार्रवाई (Invalid action)' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing Manoranjan RSS action:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
