import { NextResponse } from 'next/server';
import { syncSingleRssSource } from '@/lib/importer/rssEngine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    const { sourceId } = await params;
    const result = await syncSingleRssSource(sourceId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
