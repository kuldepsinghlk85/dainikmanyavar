import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_SLOTS = [
  { name: 'शीर्ष हेडर विज्ञापन (Header Banner)', position: 'header_wide' },
  { name: 'साइडबार विज्ञापन #1 (Sidebar Ad #1 - 300x250)', position: 'sidebar_box' },
  { name: 'साइडबार विज्ञापन #2 (Sidebar Ad #2 - 300x300)', position: 'sidebar_tall' },
  { name: 'साइडबार विज्ञापन #3 (Sidebar Ad #3 - 300x250)', position: 'sidebar_box2' },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    // Ensure default slots exist in DB
    for (const slot of DEFAULT_SLOTS) {
      await db.adSlot.upsert({
        where: { position: slot.position },
        update: {},
        create: {
          name: slot.name,
          position: slot.position,
          active: true,
        },
      });
    }

    if (position) {
      const slot = await db.adSlot.findUnique({
        where: { position },
      });
      return NextResponse.json({ success: true, data: slot });
    }

    const allSlots = await db.adSlot.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: allSlots });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Batch update support (saving all slots at once)
    if (Array.isArray(body.slots)) {
      const results = [];
      for (const slot of body.slots) {
        if (!slot.position) continue;
        const res = await db.adSlot.upsert({
          where: { position: slot.position },
          update: {
            name: slot.name || undefined,
            desktopCreative: slot.desktopCreative !== undefined ? slot.desktopCreative : undefined,
            targetUrl: slot.targetUrl !== undefined ? slot.targetUrl : undefined,
            active: slot.active !== undefined ? slot.active : undefined,
          },
          create: {
            name: slot.name || slot.position,
            position: slot.position,
            desktopCreative: slot.desktopCreative || null,
            targetUrl: slot.targetUrl || '/advertise',
            active: slot.active !== undefined ? slot.active : true,
          },
        });
        results.push(res);
      }
      return NextResponse.json({ success: true, data: results, message: 'सभी विज्ञापन सफलतापूर्वक सुरक्षित हो गए!' });
    }

    // 2. Single slot update
    const { position, name, desktopCreative, targetUrl, active } = body;

    if (!position) {
      return NextResponse.json({ success: false, error: 'Position is required' }, { status: 400 });
    }

    const updated = await db.adSlot.upsert({
      where: { position },
      update: {
        name: name || undefined,
        desktopCreative: desktopCreative !== undefined ? desktopCreative : undefined,
        targetUrl: targetUrl !== undefined ? targetUrl : undefined,
        active: active !== undefined ? active : undefined,
      },
      create: {
        name: name || position,
        position,
        desktopCreative: desktopCreative || null,
        targetUrl: targetUrl || '/advertise',
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({ success: true, data: updated, message: `'${updated.name}' विज्ञापन सफलतापूर्वक सुरक्षित हो गया!` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
