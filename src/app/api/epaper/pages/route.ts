import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET /api/epaper/pages?editionId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const editionId = searchParams.get('editionId');
    if (!editionId) {
      return NextResponse.json({ success: false, error: 'editionId is required' }, { status: 400 });
    }
    const pages = await db.epaperPage.findMany({
      where: { editionId },
      orderBy: { pageNumber: 'asc' },
    });
    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/epaper/pages
const updatePage = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, pageTitle, extractedText, pageImage } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Page id is required' }, { status: 400 });
    }
    const updated = await db.epaperPage.update({
      where: { id },
      data: {
        ...(pageTitle !== undefined && { pageTitle }),
        ...(extractedText !== undefined && { extractedText }),
        ...(pageImage !== undefined && { pageImage, thumbnailImage: pageImage }),
      },
    });
    return NextResponse.json({ success: true, page: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
export { updatePage as PATCH };

// POST /api/epaper/pages (Upload new image for a page)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pageId = formData.get('pageId') as string;
    const file = formData.get('imageFile') as File | null;

    if (!pageId || !file) {
      return NextResponse.json({ success: false, error: 'pageId and imageFile are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.png';
    const filename = `page_${pageId}_${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'epaper', 'pages');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/epaper/pages/${filename}`;

    const updated = await db.epaperPage.update({
      where: { id: pageId },
      data: {
        pageImage: imageUrl,
        thumbnailImage: imageUrl,
      },
    });

    return NextResponse.json({ success: true, page: updated, imageUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/epaper/pages?id=...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('id');
    if (!pageId) {
      return NextResponse.json({ success: false, error: 'Page id is required' }, { status: 400 });
    }

    const page = await db.epaperPage.findUnique({ where: { id: pageId } });
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    const editionId = page.editionId;

    await db.epaperPage.delete({ where: { id: pageId } });

    // Renumber remaining pages sequentially
    const remainingPages = await db.epaperPage.findMany({
      where: { editionId },
      orderBy: { pageNumber: 'asc' },
    });

    for (let i = 0; i < remainingPages.length; i++) {
      const newNum = i + 1;
      if (remainingPages[i].pageNumber !== newNum) {
        await db.epaperPage.update({
          where: { id: remainingPages[i].id },
          data: { pageNumber: newNum },
        });
      }
    }

    // Update edition totalPages
    await db.epaperEdition.update({
      where: { id: editionId },
      data: { totalPages: remainingPages.length },
    });

    return NextResponse.json({
      success: true,
      message: 'पृष्ठ सफलतापूर्वक हटा दिया गया!',
      totalPages: remainingPages.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}