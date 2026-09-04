import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { stat } from 'fs/promises';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const relativePath = path.join(...segments);
    const resolvedPath = path.resolve(uploadsDir, relativePath);

    // Prevent directory traversal attacks
    if (!resolvedPath.startsWith(uploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fileStat = await stat(resolvedPath);
    if (!fileStat.isFile()) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const fileBuffer = await fs.promises.readFile(resolvedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': 'public, max-age=2592000, immutable',
      },
    });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return new NextResponse('Not Found', { status: 404 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
