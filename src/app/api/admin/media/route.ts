import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const mediaItems = await db.mediaItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: mediaItems });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const caption = (formData.get('caption') as string) || '';
    const altText = (formData.get('altText') as string) || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    const mediaRecord = await db.mediaItem.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: fileUrl,
        caption,
        altText,
      },
    });

    await db.auditLog.create({
      data: {
        action: 'UPLOAD_MEDIA',
        objectType: 'MEDIA',
        objectId: mediaRecord.id,
        detailsJson: JSON.stringify({ filename, url: fileUrl }),
      },
    });

    return NextResponse.json({
      success: true,
      url: fileUrl,
      media: mediaRecord,
    });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
