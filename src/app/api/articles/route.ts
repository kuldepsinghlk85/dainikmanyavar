import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const tagSlug = searchParams.get('tag');
    const districtSlug = searchParams.get('district');
    const query = searchParams.get('q');
    const status = searchParams.get('status') || 'PUBLISHED';
    const isMainStory = searchParams.get('main') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';
    const isBreaking = searchParams.get('breaking') === 'true';
    const isTrending = searchParams.get('trending') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status === 'ACTIVE') {
      where.status = { not: 'ARCHIVED' };
    } else if (status !== 'ALL') {
      where.status = status;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const district = districtSlug || searchParams.get('location') || searchParams.get('locationId');
    if (district) {
      where.location = {
        OR: [
          { slug: district },
          { name: district },
          { id: district },
        ],
      };
    }

    if (tagSlug) {
      where.tags = {
        some: {
          tag: {
            slug: tagSlug,
          },
        },
      };
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { excerpt: { contains: query } },
        { content: { contains: query } },
      ];
    }

    if (isMainStory) where.isMainStory = true;
    if (isFeatured) where.isFeatured = true;
    if (isBreaking) where.isBreaking = true;

    const sortBy = searchParams.get('sortBy') || searchParams.get('sort');
    const sortOrder = searchParams.get('order')?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    let orderBy: any = { publishedAt: 'desc' };

    if (sortBy === 'id') {
      orderBy = { id: sortOrder };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder };
    } else if (isTrending) {
      orderBy = [
        { forceTrending: 'desc' },
        { viewCount: 'desc' },
        { publishedAt: 'desc' },
      ];
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          author: true,
          location: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      db.article.count({ where }),
    ]);

    const formattedArticles = articles.map((art) => ({
      ...art,
      tags: art.tags.map((t) => t.tag),
    }));

    return NextResponse.json({
      success: true,
      data: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      excerpt,
      content,
      featuredImage,
      primaryCategoryId,
      authorId,
      locationId,
      tagIds = [],
      isBreaking = false,
      isFeatured = false,
      isMainStory = false,
      status = 'PUBLISHED',
      allowAudio = true,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !content || !primaryCategoryId) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and primary category are required' },
        { status: 400 }
      );
    }

    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const article = await db.article.create({
      data: {
        title,
        subtitle,
        slug: uniqueSlug,
        excerpt,
        content,
        featuredImage,
        primaryCategoryId,
        authorId: authorId || null,
        locationId: locationId || null,
        isBreaking,
        isFeatured,
        isMainStory,
        status,
        allowAudio,
        seoTitle: seoTitle || `${title} | दैनिक मान्यवर`,
        seoDescription: seoDescription || excerpt,
        publishedAt: status === 'PUBLISHED' ? new Date() : new Date(),
      },
    });

    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const uniqueTagIds = Array.from(new Set(tagIds));
      for (const tagId of uniqueTagIds) {
        await db.articleTag.create({
          data: {
            articleId: article.id,
            tagId,
          },
        });
      }
    }

    const shortCode = article.id.slice(0, 6);
    await db.shortLink.create({
      data: {
        articleId: article.id,
        shortCode,
      },
    });

    await db.articleRevision.create({
      data: {
        articleId: article.id,
        revisionNumber: 1,
        snapshotJson: JSON.stringify(article),
        title: article.title,
        content: article.content,
        changeNote: 'Initial Creation',
      },
    });

    await db.auditLog.create({
      data: {
        action: 'CREATE_ARTICLE',
        objectType: 'ARTICLE',
        objectId: article.id,
        detailsJson: JSON.stringify({ title: article.title, status }),
      },
    });

    return NextResponse.json({ success: true, data: article });
  } catch (error: any) {
    console.error('Error creating article:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids, action } = await request.json();

    if (action === 'DELETE_SELECTED' && Array.isArray(ids)) {
      const deleted = await db.article.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ success: true, message: `${deleted.count} समाचार सफलता से हटा दिए गए।` });
    }

    if (action === 'CLEAR_ALL') {
      const deleted = await db.article.deleteMany({});
      return NextResponse.json({ success: true, message: `${deleted.count} सभी समाचार सफलता से हटा दिए गए।` });
    }

    return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
