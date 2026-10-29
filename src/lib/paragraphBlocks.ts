export interface ParagraphBlock {
  id: string;
  subtitle?: string;
  imageUrl?: string;
  imageCaption?: string;
  text: string;
}

// Generate unique ID
export function uid(): string {
  return 'b_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
}

// Format text into clean HTML paragraphs while preserving headings and rich tags
export function formatTextToParagraphs(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';
  return rawText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      // If segment is already a block-level HTML tag (h1-h6, blockquote, ul, ol, div, figure, hr, table), preserve as-is
      if (/^<(h[1-6]|blockquote|ul|ol|div|figure|table|hr)/i.test(p)) {
        return p;
      }
      return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');
}

// Serialize blocks array to production-grade Dainik Manyavar HTML
export function serializeBlocksToHtml(blocks: ParagraphBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  const htmlSections = blocks
    .map((block, idx) => {
      const subtitleHtml =
        block.subtitle && block.subtitle.trim()
          ? `<h3 class="text-xl sm:text-2xl font-bold text-stone-900 mt-6 mb-3 tracking-tight">${block.subtitle.trim()}</h3>`
          : '';

      const photoHtml =
        block.imageUrl && block.imageUrl.trim()
          ? `<figure class="my-4 overflow-hidden rounded-2xl bg-stone-100 border border-stone-200 shadow-xs">
          <img src="${block.imageUrl.trim()}" alt="${(
              block.imageCaption ||
              block.subtitle ||
              'दैनिक मान्यवर समाचार चित्र'
            ).replace(/"/g, '&quot;')}" class="w-full max-h-[520px] object-cover" loading="lazy" />
          ${
            block.imageCaption && block.imageCaption.trim()
              ? `<figcaption class="text-xs text-stone-600 bg-stone-50 px-3 py-1.5 border-t border-stone-200 italic text-center font-medium">📷 ${block.imageCaption.trim()}</figcaption>`
              : ''
          }
        </figure>`
          : '';

      const textHtml =
        block.text && block.text.trim()
          ? `<div class="paragraph-body text-stone-800 leading-relaxed text-base sm:text-lg space-y-3 font-normal">${formatTextToParagraphs(
              block.text
            )}</div>`
          : '';

      return `<section class="news-paragraph-block my-5 border-b border-stone-100 pb-5 last:border-b-0" data-block-id="${block.id}" data-block-index="${idx}">
      ${subtitleHtml}
      ${photoHtml}
      ${textHtml}
    </section>`;
    })
    .join('\n\n');

  // Embed JSON payload in safe HTML comment so it can be rehydrated with 100% fidelity on edit
  const metadataComment = `\n<!-- __DM_ARTICLE_BLOCKS__:${JSON.stringify(blocks)} -->`;
  return htmlSections + metadataComment;
}

// Extract blocks from HTML comment or parse existing HTML
export function parseHtmlToBlocks(html: string): ParagraphBlock[] {
  if (!html || !html.trim()) {
    return [{ id: uid(), subtitle: '', imageUrl: '', imageCaption: '', text: '' }];
  }

  // 1. Try to read embedded JSON payload
  const match = html.match(/<!--\s*__DM_ARTICLE_BLOCKS__:([\s\S]*?)\s*-->/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((b: any) => ({
          id: b.id || uid(),
          subtitle: b.subtitle || '',
          imageUrl: b.imageUrl || '',
          imageCaption: b.imageCaption || '',
          text: b.text || '',
        }));
      }
    } catch (_) {}
  }

  // 2. Fallback: Parse basic HTML
  const clean = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return [{ id: uid(), subtitle: '', imageUrl: '', imageCaption: '', text: clean }];
}
