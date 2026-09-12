import { NextResponse } from 'next/server';
import { getFestiveConfig } from '@/lib/festive';

export async function GET() {
  try {
    const config = await getFestiveConfig();
    return NextResponse.json(
      { success: true, data: config },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Public festive API error:', error);
    return NextResponse.json({ success: false, error: 'डाटा लोड करने में विफल' }, { status: 500 });
  }
}
