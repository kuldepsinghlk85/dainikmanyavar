import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category: rawCategorySlug } = await params;
  const categorySlug = decodeURIComponent(rawCategorySlug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dainikmanyavar.com';

  const category = await db.category.findUnique({
    where: { slug: categorySlug },
  });

  const articles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      category: { slug: categorySlug },
    },
    orderBy: { publishedAt: 'desc' },
    take: 40,
    include: { category: true, author: true },
  });

  const categoryName = category ? category.name : categorySlug;

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>दैनिक मान्यवर - ${categoryName}</title>
  <link>${baseUrl}/category/${encodeURIComponent(categorySlug)}</link>
  <description>दैनिक मान्यवर - ${categoryName} की ताज़ा और ब्रेकिंग खबरें</description>
  <language>hi-IN</language>
  <atom:link href="${baseUrl}/rss/${encodeURIComponent(categorySlug)}" rel="self" type="application/rss+xml" />
  ${articles
    .map(
      (a) => `
  <item>
    <title><![CDATA[${a.title}]]></title>
    <link>${baseUrl}/news/${encodeURIComponent(a.slug)}</link>
    <guid isPermaLink="true">${baseUrl}/news/${encodeURIComponent(a.slug)}</guid>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    <description><![CDATA[${a.excerpt || a.title}]]></description>
    <category><![CDATA[${a.category?.name || categoryName}]]></category>
    ${a.featuredImage ? `<enclosure url="${a.featuredImage}" type="image/jpeg" length="0" />` : ''}
  </item>`
    )
    .join('')}
</channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
