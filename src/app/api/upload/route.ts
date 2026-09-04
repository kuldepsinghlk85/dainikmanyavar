import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'सामान्य';
    const caption = (formData.get('caption') as string) || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize Filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${timestamp}_${safeName}`;

    // Target upload directory: public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    // Save record to MediaItem table
    const mediaItem = await db.mediaItem.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        category,
        caption: caption || file.name,
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      mediaId: mediaItem.id,
      filename: mediaItem.filename,
      message: 'इमेज सफलतापूर्वक अपलोड हो गई!',
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
