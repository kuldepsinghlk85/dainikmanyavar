import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuOnly = searchParams.get('menuOnly') === 'true';

    const where: any = {};
    if (menuOnly) {
      where.isHeaderMenu = true;
    }

    const categories = await db.category.findMany({
      where,
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
