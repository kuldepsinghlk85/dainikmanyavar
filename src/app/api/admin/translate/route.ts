import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import {
  translateTextToHindi,
  translateHtmlToHindi,
  translateArticleData,
} from '@/lib/translate';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, texts, html, article } = body;

    // 1. Translate Article Object
    if (article) {
      const translated = await translateArticleData(article);
      return NextResponse.json({ success: true, translated });
    }

    // 2. Translate Array of Texts
    if (Array.isArray(texts)) {
      const translated = await Promise.all(
        texts.map((t) => (typeof t === 'string' ? translateTextToHindi(t) : Promise.resolve(t)))
      );
      return NextResponse.json({ success: true, translated });
    }

    // 3. Translate HTML Chunk
    if (typeof html === 'string') {
      const translated = await translateHtmlToHindi(html);
      return NextResponse.json({ success: true, translatedHtml: translated });
    }

    // 4. Translate Single Text
    if (typeof text === 'string') {
      const translated = await translateTextToHindi(text);
      return NextResponse.json({ success: true, translatedText: translated });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Translation route error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
