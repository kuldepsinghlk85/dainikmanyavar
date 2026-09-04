import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const horoscopes = await db.horoscope.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: horoscopes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { zodiacSign, zodiacHindi, title, prediction, love, career, health, finance, luckyNumber, luckyColor, remedies } = body;

    const created = await db.horoscope.create({
      data: {
        zodiacSign,
        zodiacHindi,
        title,
        prediction,
        love,
        career,
        health,
        finance,
        luckyNumber,
        luckyColor,
        remedies,
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

    await db.horoscope.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'राशिफल आइटम हटा दिया गया!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
