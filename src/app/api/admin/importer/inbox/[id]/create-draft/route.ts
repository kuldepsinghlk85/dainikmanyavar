import { NextResponse } from 'next/server';
import { NewsImportService } from '@/lib/importer/service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleDraft = await NewsImportService.convertInboxItemToDraft(id);
    return NextResponse.json({
      success: true,
      message: 'Dainik Manyavar Draft created successfully',
      article: articleDraft,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
