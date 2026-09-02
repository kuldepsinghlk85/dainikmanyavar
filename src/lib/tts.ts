export interface TTSProvider {
  name: string;
  generateAudio(text: string, voice?: string): Promise<{ audioUrl: string; duration: number }>;
}

export function cleanTextForTTS(htmlOrText: string): string {
  if (!htmlOrText) return '';
  // 1. Remove HTML tags
  let text = htmlOrText.replace(/<[^>]*>?/gm, ' ');
  // 2. Remove multiple spaces and newlines
  text = text.replace(/\s+/g, ' ').trim();
  // 3. Clean special punctuation for natural speech pause
  text = text.replace(/\|/g, '।');
  return text;
}

export class WebSpeechTTSProvider implements TTSProvider {
  name = 'web_speech';
  async generateAudio(text: string, voice = 'hi-IN'): Promise<{ audioUrl: string; duration: number }> {
    // For WebSpeech client-side synth, we return a virtual synthesis payload
    const words = text.split(/\s+/).length;
    const estimatedDuration = Math.ceil(words / 2.5); // ~150 wpm
    return {
      audioUrl: `synth://web_speech?voice=${voice}&length=${words}`,
      duration: estimatedDuration,
    };
  }
}

export function getTTSProvider(): TTSProvider {
  // Can be extended to Google Cloud TTS or ElevenLabs via env vars
  return new WebSpeechTTSProvider();
}
