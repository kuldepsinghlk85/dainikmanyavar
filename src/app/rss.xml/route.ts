import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dainikmanyawar.in';

  const articles = await db.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    include: { category: true, author: true },
  });

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>दैनिक मान्यवर - समाचार पोर्टल</title>
  <link>${baseUrl}</link>
  <description>दैनिक मान्यवर - निष्पक्ष, तेज़ और भरोसेमंद हिंदी समाचार पोर्टल</description>
  <language>hi-IN</language>
  ${articles
    .map(
      (a) => `
  <item>
    <title><![CDATA[${a.title}]]></title>
    <link>${baseUrl}/news/${a.slug}</link>
    <guid>${baseUrl}/news/${a.slug}</guid>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    <description><![CDATA[${a.excerpt || a.title}]]></description>
    <category><![CDATA[${a.category?.name || 'समाचार'}]]></category>
  </item>`
    )
    .join('')}
</channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
