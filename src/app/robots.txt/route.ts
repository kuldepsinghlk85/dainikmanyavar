import { NextResponse } from 'next/server';
import { getPublicSiteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getPublicSiteUrl();

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/temp/

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/news-sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
