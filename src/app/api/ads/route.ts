import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    if (position) {
      const slot = await db.adSlot.findUnique({
        where: { position },
      });
      return NextResponse.json({ success: true, data: slot });
    }

    const allSlots = await db.adSlot.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: allSlots });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
