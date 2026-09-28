import { NextRequest } from 'next/server';
import { resolveArticleByCode, handleShortLinkRedirect } from '@/lib/shortLinks';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const article = await resolveArticleByCode(code, request);
    return handleShortLinkRedirect(request, article);
  } catch (error) {
    console.error('Share redirect error:', error);
    return handleShortLinkRedirect(request, null);
  }
}

