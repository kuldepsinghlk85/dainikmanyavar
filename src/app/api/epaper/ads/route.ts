import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const editionId = searchParams.get('editionId');

    const where: any = {};
    if (editionId) where.editionId = editionId;

    const ads = await db.epaperAd.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { edition: { select: { title: true } } },
    });

    return NextResponse.json({ success: true, data: ads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let title = 'ई-पेपर विज्ञापन';
    let position = 'top_banner';
    let pageNumber = 1;
    let imageUrl = '';
    let targetUrl = '#';
    let editionId: string | null = null;
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') as string) || title;
      position = (formData.get('position') as string) || position;
      const pageNumStr = formData.get('pageNumber') as string;
      if (pageNumStr) pageNumber = parseInt(pageNumStr, 10);
      targetUrl = (formData.get('targetUrl') as string) || targetUrl;
      const edId = formData.get('editionId') as string;
      if (edId) editionId = edId;
      const sDate = formData.get('startDate') as string;
      if (sDate) startDate = new Date(sDate);
      const eDate = formData.get('endDate') as string;
      if (eDate) endDate = new Date(eDate);

      const file = (formData.get('imageFile') || formData.get('adImage')) as File | null;
      if (file && typeof file === 'object' && file.name) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || '.png';
        const filename = `ad_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'epaper', 'ads');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        imageUrl = `/uploads/epaper/ads/${filename}`;
      } else {
        imageUrl = (formData.get('imageUrl') as string) || '';
      }
    } else {
      const body = await request.json();
      title = body.title || title;
      position = body.position || position;
      pageNumber = body.pageNumber ? parseInt(body.pageNumber, 10) : 1;
      imageUrl = body.imageUrl || '';
      targetUrl = body.targetUrl || targetUrl;
      editionId = body.editionId || null;
      startDate = body.startDate ? new Date(body.startDate) : null;
      endDate = body.endDate ? new Date(body.endDate) : null;
    }

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'विज्ञापन फ़ोटो (Image) चुनना अनिवार्य है' }, { status: 400 });
    }

    const ad = await db.epaperAd.create({
      data: {
        editionId,
        title,
        position,
        pageNumber,
        imageUrl,
        targetUrl,
        startDate,
        endDate,
        active: true,
      },
    });

    return NextResponse.json({ success: true, message: 'विज्ञापन सफलतापूर्वक जोड़ा गया!', data: ad, imageUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await db.epaperAd.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'विज्ञापन हटा दिया गया' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
