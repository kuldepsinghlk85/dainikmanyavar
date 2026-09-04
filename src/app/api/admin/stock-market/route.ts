import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const updates = await db.stockMarketUpdate.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: updates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, company, symbol, price, changePrice, changePercent, movement, indexName, indexValue, indexChange, content, featuredImage } = body;

    const created = await db.stockMarketUpdate.create({
      data: {
        title,
        company,
        symbol,
        price,
        changePrice,
        changePercent,
        movement: movement || 'UP',
        indexName: indexName || 'SENSEX',
        indexValue,
        indexChange,
        content,
        featuredImage: featuredImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
        status: 'PUBLISHED',
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await db.stockMarketUpdate.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'शेयर बाजार खबर हटा दी गई!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
