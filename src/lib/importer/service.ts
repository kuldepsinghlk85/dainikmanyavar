import Parser from 'rss-parser';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { getNextNewsId } from '@/lib/newsId';

interface NormalizedNewsItem {
  externalId: string;
  sourceUrl: string;
  canonicalUrl?: string;
  title: string;
  excerpt: string;
  rawContent?: string;
  allowedContent?: string;
  imageUrl?: string;
  publisherName: string;
  author?: string;
  publishedAt: Date;
  suggestedCategoryId?: string;
  suggestedLocationId?: string;
  suggestedTags: string[];
  contentHash: string;
  similarityHash: string;
}

export class NewsImportService {
  private static parser = new Parser({
    customFields: {
      item: ['media:content', 'media:thumbnail', 'content:encoded'],
    },
  });

  /**
   * SSRF Protection: Validate URL and block localhost / internal private IPs
   */
  public static validateUrlSecurity(urlStr: string): boolean {
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return false;
      }
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.')
      ) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Calculate SHA256 Hash for duplicate checking
   */
  private static calculateContentHash(title: string, url: string): string {
    return crypto.createHash('sha256').update(`${title.trim().toLowerCase()}-${url.trim()}`).digest('hex');
  }

  /**
   * Calculate Headline Similarity Percentage (0 to 100)
   */
  public static calculateHeadlineSimilarity(titleA: string, titleB: string): number {
    const cleanA = titleA.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '');
    const cleanB = titleB.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '');
    if (cleanA === cleanB) return 100;
    if (!cleanA || !cleanB) return 0;

    const setA = new Set(cleanA.split(''));
    const setB = new Set(cleanB.split(''));
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    return Math.round((intersection.size / Math.max(setA.size, setB.size)) * 100);
  }

  /**
   * Location Auto-Detection from Headline/Excerpt
   */
  public static detectLocationId(text: string, locationsMap: Map<string, string>): string | undefined {
    for (const [name, id] of locationsMap.entries()) {
      if (text.includes(name)) {
        return id;
      }
    }
    return undefined;
  }

  /**
   * Tag Auto-Detection from Headline/Excerpt
   */
  public static detectSuggestedTags(text: string, availableTags: Array<{ name: string }>): string[] {
    const matched: string[] = [];
    for (const tag of availableTags) {
      const cleanTagName = tag.name.replace(/^#/, '');
      if (text.includes(cleanTagName)) {
        matched.push(tag.name.startsWith('#') ? tag.name : `#${cleanTagName}`);
      }
    }
    if (matched.length === 0) {
      if (text.includes('जौनपुर')) matched.push('#जौनपुर');
      if (text.includes('उत्तर प्रदेश') || text.includes('यूपी')) matched.push('#उत्तर_प्रदेश');
      if (text.includes('विकास') || text.includes('योजना')) matched.push('#विकास');
    }
    return Array.from(new Set(matched));
  }

  /**
   * Fetch single source and ingest items to Inbox
   */
  public static async fetchAndIngestSource(sourceId: string): Promise<{
    itemsFound: number;
    itemsImported: number;
    duplicatesFound: number;
    error?: string;
  }> {
    const source = await db.newsSource.findUnique({ where: { id: sourceId } });
    if (!source || !source.isActive) {
      return { itemsFound: 0, itemsImported: 0, duplicatesFound: 0, error: 'Source inactive or not found' };
    }

    if (source.feedUrl && !this.validateUrlSecurity(source.feedUrl)) {
      return { itemsFound: 0, itemsImported: 0, duplicatesFound: 0, error: 'Security Exception: Invalid or restricted Feed URL' };
    }

    const startTime = new Date();
    let itemsFound = 0;
    let itemsImported = 0;
    let duplicatesFound = 0;

    try {
      // Pre-fetch available categories, locations, tags
      const [categories, locations, tags] = await Promise.all([
        db.category.findMany(),
        db.location.findMany(),
        db.tag.findMany(),
      ]);

      const locMap = new Map<string, string>();
      locations.forEach((l) => locMap.set(l.name, l.id));

      const defaultCatId = source.defaultCategoryId || (categories[0] ? categories[0].id : undefined);

      let fetchedItems: any[] = [];

      // Method 1: RSS / Atom Parser
      if ((source.sourceType === 'RSS' || source.sourceType === 'ATOM') && source.feedUrl) {
        const feed = await this.parser.parseURL(source.feedUrl);
        fetchedItems = feed.items || [];
      } else if (source.sourceType === 'JSON_API' && source.apiEndpoint) {
        const res = await fetch(source.apiEndpoint);
        const data = await res.json();
        fetchedItems = Array.isArray(data) ? data : data.items || data.articles || [];
      }

      itemsFound = fetchedItems.length;

      for (const item of fetchedItems) {
        const title = item.title || item.originalTitle || 'शीर्षक विहीन समाचार';
        const sourceUrl = item.link || item.sourceUrl || item.guid || source.websiteUrl || source.feedUrl || 'https://dainikmanyawar.in';
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        const excerpt = (item.contentSnippet || item.description || item.excerpt || title).replace(/<[^>]*>?/gm, '').trim();
        const rawContent = item['content:encoded'] || item.content || excerpt;

        // Image Extraction
        let imageUrl = item.enclosure?.url || item['media:content']?.$.url || item['media:thumbnail']?.$.url || null;
        if (!imageUrl && rawContent) {
          const imgMatch = rawContent.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) imageUrl = imgMatch[1];
        }

        // Apply Permission Mode (Metadata Only vs Licensed Full)
        const allowedContent = source.permissionMode === 'FULL_CONTENT_LICENSED'
          ? rawContent
          : `<p>${excerpt}</p><p><em>(स्रोत: ${source.publisherName} — पूर्ण समाचार मूल वेबसाइट पर उपलब्ध है)</em></p>`;

        const contentHash = this.calculateContentHash(title, sourceUrl);
        const suggestedLocId = this.detectLocationId(`${title} ${excerpt}`, locMap) || source.defaultLocationId;
        const suggestedTagsList = this.detectSuggestedTags(`${title} ${excerpt}`, tags);

        // Check Duplicates in DB
        const existingDuplicate = await db.newsImportItem.findFirst({
          where: {
            OR: [
              { contentHash },
              { sourceUrl },
              { originalTitle: title },
            ],
          },
        });

        let status = 'NEW';
        let duplicateOfId: string | undefined = undefined;
        let similarityPercentage = 0;

        if (existingDuplicate) {
          duplicatesFound++;
          status = 'DUPLICATE';
          duplicateOfId = existingDuplicate.id;
          similarityPercentage = this.calculateHeadlineSimilarity(title, existingDuplicate.originalTitle);
        }

        await db.newsImportItem.create({
          data: {
            sourceId: source.id,
            externalId: item.guid || item.id || sourceUrl,
            sourceUrl,
            canonicalUrl: sourceUrl,
            originalTitle: title,
            originalExcerpt: excerpt,
            rawContent,
            normalizedText: allowedContent,
            imageUrl,
            publisherName: source.publisherName,
            originalAuthor: item.creator || item.author || source.publisherName,
            sourcePublishedAt: pubDate,
            suggestedCategoryId: defaultCatId,
            suggestedLocationId: suggestedLocId || undefined,
            suggestedTagsJson: JSON.stringify(suggestedTagsList),
            contentHash,
            copyrightMode: source.permissionMode,
            status,
            duplicateOfId,
            similarityPercentage,
          },
        });

        if (status === 'NEW') {
          itemsImported++;
        }
      }

      // Update Source Status
      await db.newsSource.update({
        where: { id: source.id },
        data: {
          lastFetchAt: new Date(),
          healthStatus: 'Healthy',
          lastError: null,
        },
      });

      // Log Ingestion Run
      await db.newsImportLog.create({
        data: {
          sourceId: source.id,
          startedAt: startTime,
          finishedAt: new Date(),
          itemsFound,
          itemsImported,
          duplicatesFound,
          status: 'SUCCESS',
        },
      });

      return { itemsFound, itemsImported, duplicatesFound };
    } catch (err: any) {
      console.error(`Import error for source ${source.name}:`, err);
      await db.newsSource.update({
        where: { id: source.id },
        data: {
          healthStatus: 'Failed',
          lastError: err.message,
        },
      });

      await db.newsImportLog.create({
        data: {
          sourceId: source.id,
          startedAt: startTime,
          finishedAt: new Date(),
          itemsFound: 0,
          itemsImported: 0,
          failedItems: 1,
          status: 'FAILED',
          errorMessage: err.message,
        },
      });

      return { itemsFound: 0, itemsImported: 0, duplicatesFound: 0, error: err.message };
    }
  }

  /**
   * Convert Inbox Item into a Normal Dainik Manyavar Article Draft
   */
  public static async convertInboxItemToDraft(importItemId: string): Promise<any> {
    const item = await db.newsImportItem.findUnique({
      where: { id: importItemId },
      include: { source: true },
    });

    if (!item) throw new Error('इम्पोर्ट इनबॉक्स रिकॉर्ड नहीं मिला');

    // Default Primary Category
    const categoryId = item.suggestedCategoryId || (await db.category.findFirst())?.id;
    if (!categoryId) throw new Error('श्रेणी उपलब्ध नहीं है');

    const cleanSlug = `${slugify(item.originalTitle)}-${Date.now().toString().slice(-4)}`;

    const tagsList: string[] = JSON.parse(item.suggestedTagsJson || '[]');

    // Find or create tags & deduplicate tag IDs
    const rawTagIds: string[] = [];
    for (const tagName of tagsList) {
      const cleanTagName = tagName.replace(/^#/, '').trim();
      if (!cleanTagName) continue;
      let tagRecord = await db.tag.findUnique({ where: { slug: slugify(cleanTagName) } });
      if (!tagRecord) {
        tagRecord = await db.tag.create({
          data: { name: `#${cleanTagName}`, slug: slugify(cleanTagName) },
        });
      }
      rawTagIds.push(tagRecord.id);
    }

    // Deduplicate tag IDs to prevent unique constraint error (articleId, tagId)
    const uniqueTagIds = Array.from(new Set(rawTagIds));

    // Article Content Respecting Copyright Permission Mode
    const draftContent = item.copyrightMode === 'FULL_CONTENT_LICENSED' && item.rawContent
      ? item.rawContent
      : `<p>${item.originalExcerpt || item.originalTitle}</p>
<p><strong>जौनपुर / विशेष बुलेटिन:</strong> इस खबर की संपूर्ण जानकारी एवं विस्तृत विवरण के लिए मूल प्रकाशक देखें।</p>
<p><em>(स्रोत: ${item.publisherName} — <a href="${item.sourceUrl}" target="_blank" rel="noopener">मूल लिंक खोलें</a>)</em></p>`;

    // Create Normal Article Record (Status: DRAFT)
    const nextNewsId = await getNextNewsId();
    const newArticle = await db.article.create({
      data: {
        newsId: nextNewsId,
        title: item.originalTitle,
        subtitle: `स्रोत: ${item.publisherName}`,
        slug: cleanSlug,
        excerpt: item.originalExcerpt || item.originalTitle,
        content: draftContent,
        featuredImage: item.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
        primaryCategoryId: categoryId,
        locationId: item.suggestedLocationId || undefined,
        status: 'DRAFT',
        source: item.publisherName,
        isImported: true,
        importItemId: item.id,
        sourceType: item.source.sourceType,
        originalSourceName: item.publisherName,
        originalSourceUrl: item.sourceUrl,
        sourcePublishedAt: item.sourcePublishedAt || new Date(),
        tags: {
          create: uniqueTagIds.map((tagId) => ({ tagId })),
        },
      },
    });

    // Update Import Item Status to APPROVED
    await db.newsImportItem.update({
      where: { id: item.id },
      data: { status: 'APPROVED' },
    });

    return newArticle;
  }
}
