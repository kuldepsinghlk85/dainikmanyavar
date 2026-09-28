import { NextResponse } from 'next/server';
import { liveDataService } from '@/lib/live-data/service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const marketData = await liveDataService.getMarketIndices(force);

    if (!marketData) {
      return NextResponse.json(
        {
          success: false,
          meta: { status: 'UNAVAILABLE', error: 'बाजार डेटा अनुपलब्ध है' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: marketData,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'शेयर बाजार डेटा लोड करने में त्रुटि',
      },
      { status: 500 }
    );
  }
}
