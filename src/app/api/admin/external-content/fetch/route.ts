import { NextResponse } from 'next/server';
import { fetchAndIngestSpecialFeeds } from '@/lib/importer/specialContentImporter';

export async function POST() {
  try {
    const result = await fetchAndIngestSpecialFeeds();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
