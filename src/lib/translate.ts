/**
 * Utility for automatic translation of news content from English to Hindi.
 * Uses Google Translate API (client=gtx) with explicit sl=en&tl=hi to guarantee
 * Indian names, Hinglish, and English headlines convert accurately into Hindi Devnagari script.
 */

export async function translateTextToHindi(text: string): Promise<string> {
  if (!text || !text.trim()) return text;
  // If already predominantly Devnagari and has no Latin characters, return as is
  if (!/[a-zA-Z]/.test(text)) return text;

  // Endpoint 1: clients5 Google dict-chrome-ex (super fast, robust, no 429)
  try {
    const url1 = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=hi&q=${encodeURIComponent(text)}`;
    const res1 = await fetch(url1, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res1.ok) {
      const data = await res1.json();
      if (Array.isArray(data) && typeof data[0] === 'string' && data[0].trim()) {
        return data[0].trim();
      }
    }
  } catch {
    // Continue to fallback
  }

  // Endpoint 2: translate.googleapis.com single gtx
  try {
    const url2 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
    const res2 = await fetch(url2, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res2.ok) {
      const json = await res2.json();
      if (Array.isArray(json) && Array.isArray(json[0])) {
        const translated = json[0]
          .map((segment: any) => (Array.isArray(segment) && segment[0] ? segment[0] : ''))
          .join('')
          .trim();
        if (translated) return translated;
      }
    }
  } catch (error) {
    console.warn('Translation error:', error);
  }

  return text;
}

/**
 * Translates HTML content to Hindi while preserving all HTML tags and attributes (<p>, <a>, <img>, etc.)
 */
export async function translateHtmlToHindi(html: string): Promise<string> {
  if (!html || !html.trim()) return '';
  if (!/[a-zA-Z]/.test(html)) return html;

  try {
    // If there are no HTML tags, translate plain text directly
    if (!/<[a-z][\s\S]*>/i.test(html)) {
      return await translateTextToHindi(html);
    }

    // Split by HTML tags
    const parts = html.split(/(<[^>]+>)/g);
    const translatedParts: string[] = [];

    for (const part of parts) {
      // If it's an HTML tag, preserve as is
      if (part.startsWith('<') && part.endsWith('>')) {
        translatedParts.push(part);
        continue;
      }
      // If empty or no Latin letters, preserve as is
      if (!part.trim() || !/[a-zA-Z]/.test(part)) {
        translatedParts.push(part);
        continue;
      }
      // Translate text node
      const translated = await translateTextToHindi(part);
      translatedParts.push(translated);
    }

    return translatedParts.join('');
  } catch (error) {
    console.error('HTML translation error:', error);
    return html;
  }
}

/**
 * Translates an entire article payload (title, subtitle, excerpt, content, tags) to Hindi.
 */
export async function translateArticleData(data: {
  title?: string | null;
  subtitle?: string | null;
  excerpt?: string | null;
  content?: string | null;
  tags?: string[];
}): Promise<{
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  tags: string[];
}> {
  const [translatedTitle, translatedSubtitle, translatedExcerpt, translatedContent] =
    await Promise.all([
      data.title ? translateTextToHindi(data.title) : Promise.resolve(''),
      data.subtitle ? translateTextToHindi(data.subtitle) : Promise.resolve(''),
      data.excerpt ? translateTextToHindi(data.excerpt) : Promise.resolve(''),
      data.content ? translateHtmlToHindi(data.content) : Promise.resolve(''),
    ]);

  // Translate tags or map common English entertainment tags to Hindi
  const translatedTags: string[] = [];
  if (data.tags && data.tags.length > 0) {
    for (const tag of data.tags) {
      const cleanTag = tag.replace(/^#/, '').trim();
      if (!cleanTag) continue;

      if (!/[a-zA-Z]/.test(cleanTag)) {
        translatedTags.push(cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`);
        continue;
      }

      const lower = cleanTag.toLowerCase();
      if (lower.includes('bollywood')) translatedTags.push('#बॉलीवुड');
      else if (lower.includes('hollywood')) translatedTags.push('#हॉलीवुड');
      else if (lower.includes('entertainment')) translatedTags.push('#मनोरंजन');
      else if (lower.includes('cinema') || lower.includes('movie')) translatedTags.push('#सिनेमा');
      else if (lower.includes('box office')) translatedTags.push('#बॉक्स_ऑफिस');
      else if (lower.includes('review')) translatedTags.push('#मूवी_रिव्यू');
      else if (lower.includes('cricket')) translatedTags.push('#क्रिकेट');
      else if (lower.includes('viral')) translatedTags.push('#वायरल_वीडियो');
      else if (lower.includes('gold')) translatedTags.push('#सोना_चांदी_भाव');
      else {
        const transTag = await translateTextToHindi(cleanTag);
        const formatted = transTag.replace(/\s+/g, '_');
        translatedTags.push(formatted.startsWith('#') ? formatted : `#${formatted}`);
      }
    }
  }

  // Ensure default `#मनोरंजन` tag if none
  if (translatedTags.length === 0) {
    translatedTags.push('#मनोरंजन', '#सिनेमा');
  }

  return {
    title: translatedTitle,
    subtitle: translatedSubtitle,
    excerpt: translatedExcerpt,
    content: translatedContent,
    tags: Array.from(new Set(translatedTags)),
  };
}
