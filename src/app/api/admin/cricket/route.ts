import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const matches = await db.cricketMatch.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: matches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchTitle, tournament, teamA, teamB, scoreA, scoreB, matchStatus, resultText, venue, newsHeadline, newsSummary, featuredImage, tagsJson } = body;

    const created = await db.cricketMatch.create({
      data: {
        matchTitle,
        tournament: tournament || 'अंतरराष्ट्रीय क्रिकेट',
        teamA,
        teamB,
        scoreA,
        scoreB,
        matchStatus: matchStatus || 'UPCOMING',
        resultText,
        venue,
        newsHeadline,
        newsSummary,
        featuredImage: featuredImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
        tagsJson: tagsJson ? JSON.stringify(tagsJson) : JSON.stringify(['#क्रिकेट', '#भारत']),
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

    await db.cricketMatch.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'क्रिकेट आइटम सफलतापूर्वक हटा दिया गया!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
