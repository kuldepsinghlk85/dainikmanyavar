import { db } from '@/lib/db';
import crypto from 'crypto';

export interface NormalizedFeedItem {
  title: string;
  description: string;
  imageUrl?: string;
  sourceName: string;
  sourceUrl: string;
  guid?: string;
  author?: string;
  publishedAt: Date;
  category?: string;
  region?: string;
  tags: string[];
  contentHash: string;
  fingerprint: string;
}

const HINDI_STOP_WORDS = new Set([
  'और', 'का', 'के', 'की', 'को', 'में', 'पर', 'से', 'है', 'हैं', 'था', 'थी', 'थे',
  'हुआ', 'हुए', 'गया', 'गई', 'गए', 'ने', 'यह', 'वह', 'इस', 'उस', 'भी', 'तो', 'ही',
  'किया', 'कहा', 'दिया', 'लिया', 'रहे', 'रहा', 'रही', 'एक', 'दो', 'तक', 'अपडेट',
  'news', 'live', 'breaking', 'hindi', 'today', 'livehindustan', 'amarujala', 'jagran'
]);

export function cleanCdata(text: string): string {
  if (!text) return '';
  let s = text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Remove font tags (used by Google News for source name)
  s = s.replace(/<font[^>]*>[\s\S]*?<\/font>/gi, '');
  // Remove anchor tags but keep anchor text if any
  s = s.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1');
  // Remove any remaining HTML tags
  s = s.replace(/<[^>]+>/g, ' ');
  // Clean whitespace
  s = s.replace(/\s+/g, ' ').trim();
  // Remove trailing domain/publisher suffix like " - hindi.news18.com"
  s = s.replace(/\s*-\s*[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s*$/i, '');
  return s;
}

export function extractImageFromXml(itemXml: string): string | undefined {
  // 1. Enclosure tag (standard RSS 2.0 audio/video/image)
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch && enclosureMatch[1]) return enclosureMatch[1];

  // 2. Media content tag
  const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch && mediaMatch[1]) return mediaMatch[1];

  // 3. Media thumbnail tag
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (thumbMatch && thumbMatch[1]) return thumbMatch[1];

  // 4. Img tag in description or content:encoded
  const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];

  return undefined;
}

export function extractSignificantTokens(text: string): string[] {
  if (!text) return [];
  const clean = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 2 && !HINDI_STOP_WORDS.has(t));
  return Array.from(new Set(clean));
}

export function calculateTokenSimilarity(tokensA: string[], tokensB: string[]): number {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const intersection = tokensB.filter(t => setA.has(t));
  const union = new Set([...tokensA, ...tokensB]);
  return intersection.length / union.size;
}

export function generateSuggestedTags(title: string, category?: string, region?: string): string[] {
  const tags: Set<string> = new Set();

  if (title.includes('जौनपुर') || region === 'Jaunpur') tags.add('#जौनपुर');
  if (title.includes('वाराणसी') || title.includes('काशी') || region === 'Varanasi') {
    tags.add('#वाराणसी');
    tags.add('#पूर्वांचल');
  }
  if (title.includes('लखनऊ') || region === 'Lucknow') tags.add('#लखनऊ');
  if (title.includes('गाजीपुर') || region === 'Ghazipur') tags.add('#गाजीपुर');
  if (title.includes('चंदौली') || region === 'Chandauli') tags.add('#चंदौली');
  if (title.includes('दिल्ली') || region === 'New Delhi' || region === 'Delhi NCR') tags.add('#दिल्ली_एनसीआर');
  if (title.includes('बिहार') || region === 'Bihar') tags.add('#बिहार');
  if (title.includes('उत्तर प्रदेश') || title.includes('यूपी') || region === 'Uttar Pradesh') tags.add('#उत्तरप्रदेश');

  if (category === 'Cricket' || title.includes('क्रिकेट')) {
    tags.add('#क्रिकेट');
    tags.add('#खेल');
  } else if (category === 'Entertainment' || /फिल्म|सिनेमा|बॉलीवुड|रिव्यू|अभिनेता|अभिनेत्री/i.test(title)) {
    tags.add('#मनोरंजन');
    if (/review|रिव्यू|समीक्षा/i.test(title)) tags.add('#मूवी_रिव्यू');
  } else if (category === 'Editorial' || /विचार|संपादकीय|राय/i.test(title)) {
    tags.add('#संपादकीय');
    tags.add('#विचार');
  } else if (category === 'Breaking News' || /ब्रेकिंग|breaking/i.test(title)) {
    tags.add('#ब्रेकिंग_न्यूज़');
    tags.add('#ताजा_खबर');
  } else {
    tags.add('#ताजा_खबर');
  }

  return Array.from(tags);
}

export async function findOrCreateStoryCluster(title: string, excerpt: string): Promise<string | null> {
  try {
    const tokens = extractSignificantTokens(title);
    if (tokens.length < 2) return null;

    // Look for recent clusters within the past 24 hours
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClusters = await db.storyCluster.findMany({
      where: {
        lastSeenAt: { gte: past24h },
      },
      take: 20,
      orderBy: { lastSeenAt: 'desc' },
    });

    for (const cluster of recentClusters) {
      const clusterTokens = cluster.keywords ? cluster.keywords.split(',') : extractSignificantTokens(cluster.title);
      const similarity = calculateTokenSimilarity(tokens, clusterTokens);

      if (similarity >= 0.4 || tokens.filter(t => clusterTokens.includes(t)).length >= 3) {
        // Matched existing cluster
        await db.storyCluster.update({
          where: { id: cluster.id },
          data: {
            itemCount: { increment: 1 },
            lastSeenAt: new Date(),
          },
        });
        return cluster.id;
      }
    }

    // Create new cluster for this story
    const newCluster = await db.storyCluster.create({
      data: {
        title: title.slice(0, 200),
        summary: excerpt ? excerpt.slice(0, 300) : null,
        keywords: tokens.slice(0, 10).join(','),
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        itemCount: 1,
      },
    });

    return newCluster.id;
  } catch (clusterErr) {
    console.warn('[RssEngine] Cluster handling warning:', clusterErr);
    return null;
  }
}

export async function syncSingleRssSource(sourceId: string) {
  const startTime = Date.now();
  console.log(`[RssEngine] Starting feed sync for source ID: ${sourceId}`);

  const source = await db.newsSource.findUnique({
    where: { id: sourceId },
  });

  if (!source) throw new Error('RSS Source not found');
  if (!source.feedUrl) throw new Error('RSS Feed URL is missing');

  let itemsFound = 0;
  let itemsImported = 0;
  let duplicatesFound = 0;
  let failedItems = 0;
  let httpStatus = 200;

  try {
    // 1. Prepare Smart Caching Headers
    const headers: Record<string, string> = {
      'User-Agent': 'DainikManyavar-RSS-Worker/1.0 (gzip)',
      'Accept': '*/*',
    };

    if (source.etag) {
      headers['If-None-Match'] = source.etag;
    }
    if (source.lastModifiedHeader) {
      headers['If-Modified-Since'] = source.lastModifiedHeader;
    }

    // 2. Fetch live XML with 8000ms timeout
    const res = await fetch(source.feedUrl, {
      headers,
      signal: AbortSignal.timeout(8000),
    });

    httpStatus = res.status;
    const responseTimeMs = Date.now() - startTime;

    // Handle 304 Not Modified
    if (res.status === 304) {
      console.log(`[RssEngine] Source ${source.name} returned 304 Not Modified (cached).`);

      await db.newsSource.update({
        where: { id: source.id },
        data: {
          lastFetchAt: new Date(),
          lastSuccessfulFetch: new Date(),
          healthStatus: 'Healthy',
          lastError: null,
          verificationStatus: 'VERIFIED',
        },
      });

      await db.newsImportLog.create({
        data: {
          sourceId: source.id,
          itemsFound: 0,
          itemsImported: 0,
          duplicatesFound: 0,
          failedItems: 0,
          httpStatus: 304,
          responseTimeMs,
          status: 'SUCCESS',
        },
      });

      return {
        success: true,
        sourceName: source.name,
        totalFound: 0,
        newNews: 0,
        duplicate: 0,
        failed: 0,
        notModified: true,
      };
    }

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    // Check payload size cap (5MB)
    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
      throw new Error(`Payload exceeds 5MB limit: ${contentLength} bytes`);
    }

    const xmlText = await res.text();
    if (xmlText.length > 5 * 1024 * 1024) {
      throw new Error(`Payload exceeds 5MB limit: ${xmlText.length} bytes`);
    }

    const newEtag = res.headers.get('etag');
    const newLastModified = res.headers.get('last-modified');

    // 3. Extract <item> (RSS) or <entry> (Atom)
    const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || xmlText.match(/<entry[\s\S]*?<\/entry>/gi) || [];
    const fetchedItems: NormalizedFeedItem[] = [];

    for (const itemXml of itemMatches.slice(0, 30)) {
      const titleMatch = itemXml.match(/<title[\s\S]*?>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link[\s\S]*?>([\s\S]*?)<\/link>/i) || itemXml.match(/<link[^>]+href=["']([^"']+)["']/i);
      const guidMatch = itemXml.match(/<guid[\s\S]*?>([\s\S]*?)<\/guid>/i) || itemXml.match(/<id[\s\S]*?>([\s\S]*?)<\/id>/i);
      const descMatch = itemXml.match(/<description[\s\S]*?>([\s\S]*?)<\/description>/i) || 
                        itemXml.match(/<content:encoded[\s\S]*?>([\s\S]*?)<\/content:encoded>/i) || 
                        itemXml.match(/<summary[\s\S]*?>([\s\S]*?)<\/summary>/i);
      const pubDateMatch = itemXml.match(/<pubDate[\s\S]*?>([\s\S]*?)<\/pubDate>/i) || 
                           itemXml.match(/<updated[\s\S]*?>([\s\S]*?)<\/updated>/i) ||
                           itemXml.match(/<dc:date[\s\S]*?>([\s\S]*?)<\/dc:date>/i);
      const authorMatch = itemXml.match(/<author[\s\S]*?>([\s\S]*?)<\/author>/i) ||
                          itemXml.match(/<dc:creator[\s\S]*?>([\s\S]*?)<\/dc:creator>/i);

      const rawTitle = titleMatch ? titleMatch[1] : '';
      const cleanTitle = cleanCdata(rawTitle);

      const rawLink = linkMatch ? (linkMatch[1] || '').trim() : '';
      const cleanLink = cleanCdata(rawLink);

      const rawGuid = guidMatch ? cleanCdata(guidMatch[1]) : cleanLink;
      const cleanDesc = descMatch ? cleanCdata(descMatch[1]) : cleanTitle;
      const cleanAuthor = authorMatch ? cleanCdata(authorMatch[1]) : '';

      const imageUrl = extractImageFromXml(itemXml) || source.logoUrl || undefined;

      let pubDate = new Date();
      if (pubDateMatch && pubDateMatch[1]) {
        const parsed = new Date(cleanCdata(pubDateMatch[1]));
        if (!isNaN(parsed.getTime())) pubDate = parsed;
      }

      if (cleanTitle && cleanLink) {
        const publisher = source.publisherName || source.name;
        const fingerprint = crypto.createHash('sha256').update(`${publisher}_${rawGuid || cleanLink}`).digest('hex');
        const contentHash = crypto.createHash('sha256').update(`${cleanTitle.trim()}_${cleanLink.trim()}`).digest('hex');

        fetchedItems.push({
          title: cleanTitle,
          description: cleanDesc,
          imageUrl,
          sourceName: publisher,
          sourceUrl: cleanLink,
          guid: rawGuid,
          author: cleanAuthor,
          publishedAt: pubDate,
          category: source.category,
          region: source.region,
          tags: generateSuggestedTags(cleanTitle, source.category, source.region),
          contentHash,
          fingerprint,
        });
      }
    }

    itemsFound = fetchedItems.length;

    // STRICT ZERO-FALLBACK: Do NOT inject synthetic mock items when 0 items returned!
    if (itemsFound === 0) {
      console.log(`[RssEngine] 0 items parsed from feed ${source.name}. Zero fallback applied.`);
    }

    let latestItemDate: Date | null = null;

    // 4. Ingest and Deduplicate Items
    for (const item of fetchedItems) {
      if (!latestItemDate || item.publishedAt > latestItemDate) {
        latestItemDate = item.publishedAt;
      }

      // Exact Duplicate Check (Fingerprint / SourceUrl / ContentHash)
      const existing = await db.newsImportItem.findFirst({
        where: {
          OR: [
            { fingerprint: item.fingerprint },
            { contentHash: item.contentHash },
            { sourceUrl: item.sourceUrl },
          ],
        },
      });

      if (existing) {
        duplicatesFound++;
        await db.newsImportItem.update({
          where: { id: existing.id },
          data: { lastSeenAt: new Date() },
        });
        continue;
      }

      // Check Title Similarity with items from the last 48 hours
      const itemTokens = extractSignificantTokens(item.title);
      let duplicateOfId: string | undefined = undefined;
      let similarityScore = 0;
      let status = 'NEW';

      const recentItems = await db.newsImportItem.findMany({
        where: {
          importedAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        },
        select: { id: true, originalTitle: true },
        take: 30,
        orderBy: { importedAt: 'desc' },
      });

      for (const rec of recentItems) {
        const recTokens = extractSignificantTokens(rec.originalTitle);
        const sim = calculateTokenSimilarity(itemTokens, recTokens);
        if (sim >= 0.75) {
          duplicateOfId = rec.id;
          similarityScore = Math.round(sim * 100);
          status = 'DUPLICATE';
          break;
        }
      }

      // Cross-Publisher Story Clustering
      const clusterId = await findOrCreateStoryCluster(item.title, item.description);

      // Save Normalized Item
      await db.newsImportItem.create({
        data: {
          sourceId: source.id,
          externalId: item.guid,
          guid: item.guid,
          sourceUrl: item.sourceUrl,
          originalTitle: item.title,
          originalExcerpt: item.description,
          imageUrl: item.imageUrl,
          publisherName: item.sourceName,
          originalAuthor: item.author || item.sourceName,
          sourcePublishedAt: item.publishedAt,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          suggestedCategoryId: source.defaultCategoryId || undefined,
          suggestedLocationId: source.defaultLocationId || undefined,
          suggestedTagsJson: JSON.stringify(item.tags),
          contentHash: item.contentHash,
          fingerprint: item.fingerprint,
          language: source.language || 'hi',
          country: source.country || 'India',
          state: source.state || undefined,
          city: source.city || undefined,
          copyrightMode: 'METADATA_ONLY',
          editorialStatus: 'PENDING_REVIEW',
          status,
          duplicateOfId,
          similarityPercentage: similarityScore,
          clusterId: clusterId || undefined,
        },
      });

      itemsImported++;
    }

    // 5. Update Source Health and Caching
    await db.newsSource.update({
      where: { id: source.id },
      data: {
        lastFetchAt: new Date(),
        lastSuccessfulFetch: new Date(),
        lastItemDate: latestItemDate || source.lastItemDate,
        itemsReceived: (source.itemsReceived || 0) + itemsImported,
        etag: newEtag || source.etag,
        lastModifiedHeader: newLastModified || source.lastModifiedHeader,
        healthStatus: 'Healthy',
        lastError: null,
        verificationStatus: 'VERIFIED',
      },
    });

    // 6. Log Sync Execution
    await db.newsImportLog.create({
      data: {
        sourceId: source.id,
        itemsFound,
        itemsImported,
        duplicatesFound,
        failedItems,
        httpStatus,
        responseTimeMs,
        status: 'SUCCESS',
      },
    });

    return {
      success: true,
      sourceName: source.name,
      totalFound: itemsFound,
      newNews: itemsImported,
      duplicate: duplicatesFound,
      failed: failedItems,
      responseTimeMs,
    };
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime;
    console.error(`[RssEngine Error] Source: ${source.name}`, error.message);

    await db.newsSource.update({
      where: { id: source.id },
      data: {
        lastFetchAt: new Date(),
        healthStatus: 'Failed',
        lastError: error.message,
      },
    });

    await db.newsImportLog.create({
      data: {
        sourceId: source.id,
        itemsFound,
        itemsImported,
        duplicatesFound,
        failedItems: 1,
        httpStatus: httpStatus || 500,
        responseTimeMs,
        status: 'FAILED',
        errorMessage: error.message,
      },
    });

    throw error;
  }
}
