import { NextResponse } from 'next/server';
import { liveDataService } from '@/lib/live-data/service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const result = await liveDataService.getCricketLive(force);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        meta: result.meta,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        data: [],
        meta: { status: 'UNAVAILABLE', error: 'क्रिकेट डेटा अनुपलब्ध है' },
      },
      { status: 500 }
    );
  }
}
