import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPublicSiteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = getPublicSiteUrl();

  const [articles, categories, locations] = await Promise.all([
    db.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { newsId: true, slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 2000,
    }),
    db.category.findMany({
      select: { slug: true, updatedAt: true },
      take: 100,
    }),
    db.location.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      take: 100,
    }),
  ]);

  const staticRoutes = [
    { path: '', priority: '1.0', changefreq: 'always' },
    { path: '/epaper', priority: '0.9', changefreq: 'daily' },
    { path: '/editorial', priority: '0.8', changefreq: 'daily' },
    { path: '/about-us', priority: '0.5', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  ];

  const nowIso = new Date().toISOString();

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
${categories
  .map(
    (c) => `  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(c.slug)}</loc>
    <lastmod>${new Date(c.updatedAt).toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
${locations
  .map(
    (l) => `  <url>
    <loc>${baseUrl}/district/${encodeURIComponent(l.slug)}</loc>
    <lastmod>${new Date(l.updatedAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
${articles
  .map((a) => {
    const articlePath = a.newsId ? `/news/${a.newsId}` : `/news/${encodeURIComponent(a.slug)}`;
    const modTime = new Date(a.updatedAt || a.publishedAt).toISOString();
    return `  <url>
    <loc>${baseUrl}${articlePath}</loc>
    <lastmod>${modTime}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
