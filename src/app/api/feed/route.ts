import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const topicsParam = searchParams.get('topics') || searchParams.get('categories');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const topics = topicsParam
      ? topicsParam.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    // Fetch pool of latest published articles
    const articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        newsId: true,
        title: true,
        subtitle: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        isBreaking: true,
        isFeatured: true,
        isPromoted: true,
        forceTrending: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        contentType: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        location: {
          select: { id: true, name: true, slug: true },
        },
        author: {
          select: { id: true, name: true, slug: true, photo: true, designation: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 100, // pool for scoring and personalization
    });

    const now = Date.now();

    // Score and personalize
    const scoredArticles = articles.map((article) => {
      let score = 100;
      const hoursOld = (now - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);

      // Recency decay factor
      score /= Math.pow(hoursOld + 2, 1.2);

      // Breaking and promoted boost
      if (article.isBreaking) score += 150;
      if (article.isPromoted) score += 100;
      if (article.isFeatured) score += 50;

      // Location match boost
      if (district && article.location) {
        const locSlug = article.location.slug.toLowerCase();
        const locName = article.location.name.toLowerCase();
        const targetDistrict = district.toLowerCase();
        if (locSlug === targetDistrict || locName === targetDistrict) {
          score += 120;
        }
      }

      // Topic / Category match boost
      if (topics.length > 0 && article.category) {
        const catSlug = article.category.slug.toLowerCase();
        const catName = article.category.name.toLowerCase();
        if (topics.some((t) => catSlug.includes(t) || catName.includes(t))) {
          score += 80;
        }
      }

      // Engagement bonus
      score += Math.log10(article.viewCount + 1) * 10;
      score += (article.shareCount || 0) * 5;

      return { article, score };
    });

    // Sort by personalized score descending
    scoredArticles.sort((a, b) => b.score - a.score);

    // Paginate
    const paginated = scoredArticles.slice(skip, skip + limit).map((s) => s.article);

    return NextResponse.json(
      {
        success: true,
        data: paginated,
        total: scoredArticles.length,
        page,
        hasMore: skip + limit < scoredArticles.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('Personalized feed error:', error);
    return NextResponse.json({ success: false, error: 'फ़ीड लोड करने में त्रुटि' }, { status: 500 });
  }
}
