import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processEpaperPdf } from '@/lib/epaper/pdfProcessor';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdfFile') as File | null;
    const title = (formData.get('title') as string) || 'दैनिक मान्यवर';
    const editionDateStr = formData.get('editionDate') as string;
    const editionType = (formData.get('editionType') as string) || 'दैनिक';
    const description = (formData.get('description') as string) || '';
    const status = (formData.get('status') as string) || 'PUBLISHED';
    const customCoverImage = (formData.get('coverImage') as string) || '';
    const coverFile = formData.get('coverImageFile') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'PDF फ़ाइल चुनना अनिवार्य है' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const editionDate = editionDateStr ? new Date(editionDateStr) : new Date();

    // Process PDF and Extract Pages
    const processed = await processEpaperPdf(buffer, file.name, title);

    let coverImage = customCoverImage;
    if (coverFile && typeof coverFile === 'object' && coverFile.name) {
      const cBytes = await coverFile.arrayBuffer();
      const cBuffer = Buffer.from(cBytes);
      const ext = path.extname(coverFile.name) || '.png';
      const cName = `cover_${Date.now()}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'epaper', 'pages');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, cName), cBuffer);
      coverImage = `/uploads/epaper/pages/${cName}`;
    } else if (!coverImage) {
      coverImage = processed.pages[0]?.pageImage || '/uploads/epaper/pages/page_1.png';
    }

    // Create EpaperEdition record
    const edition = await db.epaperEdition.create({
      data: {
        title,
        editionDate,
        editionType,
        pdfUrl: processed.pdfUrl,
        coverImage,
        description,
        totalPages: processed.totalPages,
        status,
      },
    });

    // Create EpaperPage records
    for (const page of processed.pages) {
      await db.epaperPage.create({
        data: {
          editionId: edition.id,
          pageNumber: page.pageNumber,
          pageTitle: page.pageTitle,
          pageImage: page.pageImage,
          thumbnailImage: page.thumbnailImage,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `ई-पेपर संस्करण (${processed.totalPages} पेज) सफलतापूर्वक प्रोसेसिंग व सेव हो गया!`,
      editionId: edition.id,
      edition,
    });
  } catch (error: any) {
    console.error('Error uploading e-paper PDF:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
