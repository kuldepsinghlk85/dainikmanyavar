import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const reporterProfileId = searchParams.get('reporterProfileId') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const district = searchParams.get('district') || '';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        where.status = { in: ['SUBMITTED', 'UNDER_REVIEW'] };
      } else {
        where.status = status;
      }
    }

    if (reporterProfileId) {
      where.reporterProfileId = reporterProfileId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (district) {
      where.OR = [
        { locationName: { contains: district } },
        { reporterProfile: { district: { contains: district } } },
      ];
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { headline: { contains: q } },
        { excerpt: { contains: q } },
        { reporterProfile: { fullName: { contains: q } } },
        { reporterProfile: { reporterId: { contains: q } } },
      ];
    }

    // Pending review count across the board for the sidebar badge
    const [pendingCount, totalCount, items] = await Promise.all([
      db.reporterSubmission.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      db.reporterSubmission.count({ where }),
      db.reporterSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reporterProfile: {
            select: {
              id: true,
              reporterId: true,
              fullName: true,
              designation: true,
              district: true,
              photo: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          article: {
            select: {
              id: true,
              slug: true,
              newsId: true,
              viewCount: true,
              status: true,
              publishedAt: true,
            },
          },
        },
      }),
    ]);

    // Format items with category name if categoryId present
    const categoryIds = Array.from(new Set(items.map((i) => i.categoryId).filter(Boolean))) as string[];
    const categories = categoryIds.length > 0
      ? await db.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, slug: true },
        })
      : [];
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const enrichedItems = items.map((item) => {
      let parsedImages = [];
      try {
        if (item.additionalImages) {
          parsedImages = JSON.parse(item.additionalImages);
        }
      } catch (e) {
        parsedImages = [];
      }

      return {
        ...item,
        category: item.categoryId ? catMap.get(item.categoryId) || null : null,
        additionalImagesList: parsedImages,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedItems,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        pendingCount,
      },
    });
  } catch (error) {
    console.error('Error fetching admin news by reporters:', error);
    return NextResponse.json({ success: false, error: 'रिपोर्टर खबरों की सूची लोड करने में विफल' }, { status: 500 });
  }
}
