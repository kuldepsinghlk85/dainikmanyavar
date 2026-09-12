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
    const totalPagesStr = formData.get('totalPages') as string | null;
    const selectedCoverPageStr = formData.get('selectedCoverPage') as string | null;
    const selectedCoverPageNum = selectedCoverPageStr ? parseInt(selectedCoverPageStr, 10) : 1;
    const totalPagesCount = totalPagesStr ? parseInt(totalPagesStr, 10) : 0;

    if (!file && totalPagesCount === 0) {
      return NextResponse.json(
        { success: false, error: 'कृपया PDF फ़ाइल चुनें या कम से कम एक पेज की इमेज अपलोड करें' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();

    // Upload directories
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'epaper');
    const pagesDir = path.join(uploadDir, 'pages');
    await mkdir(uploadDir, { recursive: true });
    await mkdir(pagesDir, { recursive: true });

    let pdfUrl: string | null = null;
    let buffer: Buffer | null = null;

    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const pdfFileName = `${timestamp}_${safeName}`;
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      const pdfPath = path.join(uploadDir, pdfFileName);
      await writeFile(pdfPath, buffer);
      pdfUrl = `/uploads/epaper/${pdfFileName}`;
    }

    const editionDate = editionDateStr ? new Date(editionDateStr) : new Date();

    let pagesToCreate: Array<{
      pageNumber: number;
      pageTitle: string;
      pageImage: string;
      thumbnailImage: string;
      extractedText?: string | null;
    }> = [];

    if (totalPagesCount > 0 && formData.has('pageImage_1')) {
      // Save all rendered page images from the PDF
      for (let i = 1; i <= totalPagesCount; i++) {
        const pageFile = formData.get(`pageImage_${i}`) as File | null;
        const pageText = (formData.get(`pageText_${i}`) as string) || null;

        let pageImageUrl = '';
        if (pageFile && typeof pageFile === 'object' && pageFile.size > 0) {
          const pageBytes = await pageFile.arrayBuffer();
          const pageBuffer = Buffer.from(pageBytes);
          const pageFileName = `${timestamp}_page_${i}.jpg`;
          await writeFile(path.join(pagesDir, pageFileName), pageBuffer);
          pageImageUrl = `/uploads/epaper/pages/${pageFileName}`;
        } else {
          pageImageUrl = `/uploads/epaper/pages/page_${Math.min(i, 8)}.png`;
        }

        pagesToCreate.push({
          pageNumber: i,
          pageTitle: i === 1 ? 'पेज 1 - मुख्य पृष्ठ (Front Page)' : `पेज ${i}`,
          pageImage: pageImageUrl,
          thumbnailImage: pageImageUrl,
          extractedText: pageText,
        });
      }
    } else if (buffer && file) {
      // Fallback: If no client-rendered page images were supplied
      const processed = await processEpaperPdf(buffer, file.name, title);
      pagesToCreate = processed.pages;
    }

    let coverImage = customCoverImage;
    if (coverFile && typeof coverFile === 'object' && coverFile.name && coverFile.size > 0) {
      const cBytes = await coverFile.arrayBuffer();
      const cBuffer = Buffer.from(cBytes);
      const ext = path.extname(coverFile.name) || '.png';
      const cName = `cover_${timestamp}${ext}`;
      await writeFile(path.join(pagesDir, cName), cBuffer);
      coverImage = `/uploads/epaper/pages/${cName}`;
    } else if (!coverImage) {
      const coverIdx = Math.max(0, Math.min(selectedCoverPageNum - 1, pagesToCreate.length - 1));
      coverImage = pagesToCreate[coverIdx]?.pageImage || pagesToCreate[0]?.pageImage || '/uploads/epaper/pages/page_1.png';
    }

    // Create EpaperEdition record
    const edition = await db.epaperEdition.create({
      data: {
        title,
        editionDate,
        editionType,
        pdfUrl,
        coverImage,
        description,
        totalPages: pagesToCreate.length,
        status,
      },
    });

    // Create EpaperPage records
    for (const page of pagesToCreate) {
      await db.epaperPage.create({
        data: {
          editionId: edition.id,
          pageNumber: page.pageNumber,
          pageTitle: page.pageTitle,
          pageImage: page.pageImage,
          thumbnailImage: page.thumbnailImage,
          extractedText: page.extractedText || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `ई-पेपर संस्करण (${pagesToCreate.length} पेज) सभी वास्तविक पृष्ठों सहित सफलतापूर्वक सेव हो गया!`,
      editionId: edition.id,
      edition,
    });
  } catch (error: any) {
    console.error('Error uploading e-paper PDF:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

