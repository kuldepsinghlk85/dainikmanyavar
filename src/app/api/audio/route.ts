import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanTextForTTS, getTTSProvider } from '@/lib/tts';
import { trackEvent } from '@/lib/analytics';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, action = 'generate', visitorId = 'anon' } = body;

    if (!articleId) {
      return NextResponse.json({ success: false, error: 'articleId is required' }, { status: 400 });
    }

    const article = await db.article.findUnique({
      where: { id: articleId },
      include: { audios: true },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    if (action === 'track_listen') {
      await trackEvent({
        articleId,
        visitorId,
        sessionId: `session_${Date.now()}`,
        eventName: body.eventName || 'audio_start',
        eventValue: body.eventValue,
      });
      return NextResponse.json({ success: true });
    }

    // 1. Check for existing cached audio
    const existingAudio = article.audios.find((a) => a.status === 'generated');
    if (existingAudio && article.audioStatus !== 'outdated') {
      return NextResponse.json({
        success: true,
        cached: true,
        data: existingAudio,
        speechText: cleanTextForTTS(`${article.title}। ${article.content}`),
      });
    }

    // 2. Prepare TTS clean text
    const cleanSpeechText = cleanTextForTTS(`${article.title}। ${article.content}`);

    // 3. Generate via TTS Provider
    const ttsProvider = getTTSProvider();
    const generated = await ttsProvider.generateAudio(cleanSpeechText);

    // 4. Save to article_audio table
    const audioRecord = await db.articleAudio.create({
      data: {
        articleId: article.id,
        provider: ttsProvider.name,
        voice: 'hi-IN',
        language: 'hi-IN',
        audioUrl: generated.audioUrl,
        duration: generated.duration,
        status: 'generated',
      },
    });

    await db.article.update({
      where: { id: articleId },
      data: { audioStatus: 'ready' },
    });

    return NextResponse.json({
      success: true,
      cached: false,
      data: audioRecord,
      speechText: cleanSpeechText,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
