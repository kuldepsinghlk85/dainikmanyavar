import { NextResponse } from 'next/server';
import { liveDataService } from '@/lib/live-data/service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const rates = await liveDataService.getBullionRates(force);

    if (!rates) {
      return NextResponse.json(
        {
          success: false,
          meta: { status: 'UNAVAILABLE', error: 'सर्राफा भाव अनुपलब्ध हैं' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: rates,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'सर्राफा भाव लोड करने में त्रुटि',
      },
      { status: 500 }
    );
  }
}
