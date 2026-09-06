import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const onlyActive = searchParams.get('onlyActive');
    const withArticlesOnly = searchParams.get('withArticlesOnly');
    const orderByParam = searchParams.get('orderBy');

    const where: any = {};
    if (query) {
      where.name = { contains: query };
    }
    if (type && type !== 'ALL') {
      where.type = type;
    }
    if (onlyActive === 'true') {
      where.active = true;
    } else if (onlyActive === 'false') {
      where.active = false;
    }
    if (withArticlesOnly === 'true') {
      where.articles = {
        some: {
          status: 'PUBLISHED',
        },
      };
    }

    let orderBy: any = { name: 'asc' };
    if (orderByParam === 'articlesCount') {
      orderBy = { articles: { _count: 'desc' } };
    }

    const locations = await db.location.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    // Map parent location names for hierarchy display
    const locationMap = new Map<string, string>();
    for (const loc of locations) {
      locationMap.set(loc.id, loc.name);
    }

    const formattedLocations = locations.map((loc) => ({
      ...loc,
      articleCount: loc._count.articles,
      parentName: loc.parentId ? (locationMap.get(loc.parentId) || null) : null,
    }));

    return NextResponse.json({ success: true, data: formattedLocations });
  } catch (error: any) {
    console.error('Error in GET /api/locations:', error);
    return NextResponse.json({ success: false, error: 'स्थान लोड करने में समस्या आई।' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, image, parentId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'स्थान का नाम आवश्यक है।' }, { status: 400 });
    }

    const trimmedName = name.trim();
    let baseSlug = slugify(trimmedName) || 'loc';

    // Protect from duplicacy: check if location name or slug already exists
    const existingLocation = await db.location.findFirst({
      where: {
        OR: [
          { name: trimmedName },
          { slug: baseSlug },
        ],
      },
      include: {
        _count: { select: { articles: true } },
      },
    });

    if (existingLocation) {
      return NextResponse.json({
        success: false,
        error: `स्थान "${trimmedName}" पहले से मौजूद है।`,
        data: {
          ...existingLocation,
          articleCount: existingLocation._count.articles,
        },
      }, { status: 409 });
    }

    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await db.location.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const validTypes = ['COUNTRY', 'STATE', 'DIVISION', 'DISTRICT', 'CITY', 'LOCAL_AREA'];

    const locationType = validTypes.includes(type) ? type : 'DISTRICT';

    const location = await db.location.create({
      data: {
        name: trimmedName,
        slug,
        type: locationType as any,
        image: image || null,
        parentId: parentId || null,
      },
      include: {
        _count: { select: { articles: true } },
      },
    });

    // Automatic Archival: If an image is provided, ensure it is archived in MediaItem for future reuse
    if (image && typeof image === 'string' && image.trim()) {
      try {
        const existingMedia = await db.mediaItem.findFirst({
          where: { url: image.trim() },
        });

        if (!existingMedia) {
          const filename = image.split('/').pop() || `location_${location.id}.jpg`;
          await db.mediaItem.create({
            data: {
              filename,
              originalName: `${trimmedName} फोटो`,
              mimeType: 'image/jpeg',
              size: 0,
              url: image.trim(),
              category: 'स्थान आर्काइव',
              caption: `स्थान चित्र: ${trimmedName} (${locationType})`,
            },
          });
        }
      } catch (mediaErr) {
        console.error('Error auto-archiving location media item:', mediaErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `स्थान '${trimmedName}' सफलतापूर्वक जोड़ दिया गया और इसका चित्र आर्काइव में सुरक्षित हो गया!`,
      data: {
        ...location,
        articleCount: location._count.articles,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, type, image, parentId, slug, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'स्थान ID आवश्यक है।' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (type) {
      const validTypes = ['COUNTRY', 'STATE', 'DIVISION', 'DISTRICT', 'CITY', 'LOCAL_AREA'];
      if (validTypes.includes(type)) {
        updateData.type = type;
      }
    }
    if (image !== undefined) updateData.image = image || null;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (slug && typeof slug === 'string' && slug.trim()) {
      updateData.slug = slug.trim();
    }
    if (typeof active === 'boolean') {
      updateData.active = active;
    }

    const location = await db.location.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { articles: true } },
      },
    });

    // Automatic Archival on update
    if (image && typeof image === 'string' && image.trim()) {
      try {
        const existingMedia = await db.mediaItem.findFirst({
          where: { url: image.trim() },
        });

        if (!existingMedia) {
          const filename = image.split('/').pop() || `location_${location.id}.jpg`;
          await db.mediaItem.create({
            data: {
              filename,
              originalName: `${location.name} फोटो`,
              mimeType: 'image/jpeg',
              size: 0,
              url: image.trim(),
              category: 'स्थान आर्काइव',
              caption: `स्थान चित्र: ${location.name} (${location.type})`,
            },
          });
        }
      } catch (mediaErr) {
        console.error('Error auto-archiving updated location media:', mediaErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `स्थान '${location.name}' सफलतापूर्वक अपडेट कर दिया गया!`,
      data: {
        ...location,
        articleCount: location._count.articles,
      },
    });
  } catch (error: any) {
    console.error('Error in PUT /api/locations:', error);
    return NextResponse.json({ success: false, error: 'स्थान अपडेट करने में समस्या आई।' }, { status: 500 });
  }
}

// Quick toggle or Bulk enable/disable
export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, active, bulk, type } = body;

    // Bulk enable / disable
    if (bulk === true) {
      if (typeof active !== 'boolean') {
        return NextResponse.json({ success: false, error: 'active स्थिति (true/false) आवश्यक है।' }, { status: 400 });
      }

      const whereClause: any = {};
      if (type && type !== 'ALL') {
        whereClause.type = type;
      }

      const updateResult = await db.location.updateMany({
        where: whereClause,
        data: { active },
      });

      return NextResponse.json({
        success: true,
        message: `${updateResult.count} स्थान सफलतापूर्वक ${active ? 'सक्रिय (Enabled)' : 'निष्क्रिय (Disabled)'} कर दिए गए।`,
        updatedCount: updateResult.count,
      });
    }

    // Single item toggle
    if (!id) {
      return NextResponse.json({ success: false, error: 'स्थान ID आवश्यक है।' }, { status: 400 });
    }

    if (typeof active !== 'boolean') {
      return NextResponse.json({ success: false, error: 'active स्थिति (true/false) आवश्यक है।' }, { status: 400 });
    }

    const updated = await db.location.update({
      where: { id },
      data: { active },
      include: {
        _count: { select: { articles: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `स्थान '${updated.name}' अब ${active ? 'सक्रिय' : 'निष्क्रिय'} है।`,
      data: {
        ...updated,
        articleCount: updated._count.articles,
      },
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/locations:', error);
    return NextResponse.json({ success: false, error: 'स्थान स्थिति बदलने में समस्या आई।' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'हटाने के लिए स्थान ID नहीं दी गई।' }, { status: 400 });
    }

    await db.location.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'स्थान सफलतापूर्वक हटा दिया गया।',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
