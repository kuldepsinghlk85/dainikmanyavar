import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (query) {
      where.OR = [
        { filename: { contains: query } },
        { originalName: { contains: query } },
        { caption: { contains: query } },
      ];
    }

    const items = await db.mediaItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'त्रुटि हुई' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    let ids: string[] = [];
    let deleteAll = false;
    let password = '';

    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');

    if (singleId) {
      ids = [singleId];
    } else {
      try {
        const body = await request.json();
        if (body.ids && Array.isArray(body.ids)) ids = body.ids;
        if (body.all) deleteAll = true;
        if (body.password) password = body.password;
      } catch (_) {}
    }

    // Verify password if deleting all or multiple
    if ((deleteAll || ids.length > 1) && password && password !== 'delete123') {
      return NextResponse.json(
        { success: false, error: 'गलत पासवर्ड! सुरक्षा पासवर्ड "delete123" दर्ज करें।' },
        { status: 403 }
      );
    }

    if (deleteAll) {
      // Find all media items to unlink physical files
      const allItems = await db.mediaItem.findMany();
      for (const item of allItems) {
        if (item.url && item.url.startsWith('/uploads/')) {
          try {
            const rel = item.url.replace(/^\/+/, '');
            const filePath = path.join(process.cwd(), 'public', rel);
            await unlink(filePath);
          } catch (_) {}
        }
      }

      await db.mediaItem.deleteMany({});
      return NextResponse.json({
        success: true,
        message: 'सभी फोटो स्थायी रूप से डिलीट कर दी गईं',
        deletedCount: allItems.length,
      });
    }

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'कोई आईडी नहीं दी गई' }, { status: 400 });
    }

    const targetItems = await db.mediaItem.findMany({
      where: { id: { in: ids } },
    });

    for (const item of targetItems) {
      if (item.url && item.url.startsWith('/uploads/')) {
        try {
          const rel = item.url.replace(/^\/+/, '');
          const filePath = path.join(process.cwd(), 'public', rel);
          await unlink(filePath);
        } catch (_) {}
      }
    }

    await db.mediaItem.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      message: `${targetItems.length} फोटो स्थायी रूप से डिलीट कर दी गईं`,
      deletedCount: targetItems.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'डिलीट करने में त्रुटि हुई' },
      { status: 500 }
    );
  }
}
