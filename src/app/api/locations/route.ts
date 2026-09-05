import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const type = searchParams.get('type');

    const where: any = {};
    if (query) {
      where.name = { contains: query };
    }
    if (type && type !== 'ALL') {
      where.type = type;
    }

    const locations = await db.location.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true },
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, image, parentId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'स्थान का नाम आवश्यक है।' }, { status: 400 });
    }

    const trimmedName = name.trim();
    let baseSlug = slugify(trimmedName) || 'loc';
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
    const body = await request.json();
    const { id, name, type, image, parentId, slug } = body;

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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
