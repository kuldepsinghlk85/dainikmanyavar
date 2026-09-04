import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const prices = await db.commodityPrice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: prices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { city, gold24K, gold22K, silver, goldChange, silverChange } = body;

    const upserted = await db.commodityPrice.create({
      data: {
        city,
        gold24K: parseFloat(gold24K),
        gold22K: parseFloat(gold22K),
        silver: parseFloat(silver),
        goldChange: parseFloat(goldChange || 0),
        silverChange: parseFloat(silverChange || 0),
      },
    });

    return NextResponse.json({ success: true, data: upserted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await db.commodityPrice.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'शहर सराफा दरें हटा दी गईं!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
