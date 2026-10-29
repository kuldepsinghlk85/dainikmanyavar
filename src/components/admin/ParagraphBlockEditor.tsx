'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Code2,
  LayoutList,
  Sparkles,
  Loader2,
  MoveVertical,
  Check,
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Type,
  Highlighter,
  Eraser,
  Eye,
  EyeOff,
  List,
  FolderOpen
} from 'lucide-react';
import VoiceInputButton from '@/components/public/VoiceInputButton';
import HtmlContentEditor from '@/components/admin/HtmlContentEditor';
import MediaGalleryModal from '@/components/admin/MediaGalleryModal';
import {
  ParagraphBlock,
  uid,
  formatTextToParagraphs,
  serializeBlocksToHtml,
} from '@/lib/paragraphBlocks';

export type { ParagraphBlock };
export { serializeBlocksToHtml, formatTextToParagraphs, uid };

interface ParagraphBlockEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  subtitleHint?: string;
}

// Extract blocks from HTML comment or parse existing HTML
function parseHtmlToBlocks(html: string): ParagraphBlock[] {
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

  // 2. Fallback: Parse existing HTML into blocks
  if (typeof window !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Check if structured as section.news-paragraph-block
      const sections = doc.querySelectorAll('section.news-paragraph-block');
      if (sections.length > 0) {
        const blocks: ParagraphBlock[] = [];
        sections.forEach((sec) => {
          const sub = sec.querySelector('h2, h3, h4')?.textContent?.trim() || '';
          const img = sec.querySelector('img')?.getAttribute('src') || '';
          const cap = sec.querySelector('figcaption')?.textContent?.replace(/^📷\s*/, '').trim() || '';
          const pTexts: string[] = [];
          sec.querySelectorAll('p').forEach((p) => {
            const t = p.textContent?.trim();
            if (t) pTexts.push(t);
          });
          blocks.push({
            id: sec.getAttribute('data-block-id') || uid(),
            subtitle: sub,
            imageUrl: img,
            imageCaption: cap,
            text: pTexts.join('\n\n'),
          });
        });
        if (blocks.length > 0) return blocks;
      }

      // Check if article has multiple images and paragraphs
      const imgs = doc.querySelectorAll('img');
      const headings = doc.querySelectorAll('h2, h3');
      const paragraphs = doc.querySelectorAll('p');

      // If document is simple plain HTML, convert paragraphs into blocks
      if (paragraphs.length > 0 || imgs.length > 0) {
        // Group content into blocks
        const childNodes = Array.from(doc.body.childNodes);
        const parsedBlocks: ParagraphBlock[] = [];
        let curBlock: ParagraphBlock = { id: uid(), subtitle: '', imageUrl: '', imageCaption: '', text: '' };

        childNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();

            if (['h2', 'h3', 'h4'].includes(tag)) {
              if (curBlock.text || curBlock.imageUrl || curBlock.subtitle) {
                parsedBlocks.push(curBlock);
                curBlock = { id: uid(), subtitle: '', imageUrl: '', imageCaption: '', text: '' };
              }
              curBlock.subtitle = el.textContent?.trim() || '';
            } else if (tag === 'img') {
              const src = el.getAttribute('src');
              if (src) {
                if (curBlock.imageUrl && (curBlock.text || curBlock.subtitle)) {
                  parsedBlocks.push(curBlock);
                  curBlock = { id: uid(), subtitle: '', imageUrl: '', imageCaption: '', text: '' };
                }
                curBlock.imageUrl = src;
                curBlock.imageCaption = el.getAttribute('alt') || '';
              }
            } else if (tag === 'figure') {
              const fImg = el.querySelector('img')?.getAttribute('src');
              const fCap = el.querySelector('figcaption')?.textContent?.trim();
              if (fImg) {
                if (curBlock.imageUrl && (curBlock.text || curBlock.subtitle)) {
                  parsedBlocks.push(curBlock);
                  curBlock = { id: uid(), subtitle: '', imageUrl: '', imageCaption: '', text: '' };
                }
                curBlock.imageUrl = fImg;
                curBlock.imageCaption = fCap || '';
              }
            } else {
              const txt = el.textContent?.trim();
              if (txt) {
                curBlock.text = curBlock.text ? `${curBlock.text}\n\n${txt}` : txt;
              }
            }
          } else if (node.nodeType === Node.TEXT_NODE) {
            const txt = node.textContent?.trim();
            if (txt) {
              curBlock.text = curBlock.text ? `${curBlock.text}\n\n${txt}` : txt;
            }
          }
        });

        if (curBlock.text || curBlock.imageUrl || curBlock.subtitle) {
          parsedBlocks.push(curBlock);
        }

        if (parsedBlocks.length > 0) return parsedBlocks;
      }
    } catch (_) {}
  }

  // 3. Ultra-fallback: treat raw HTML as 1 block
  const cleanedText = html
    .replace(/<[^>]*>/g, '\n')
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n\n');

  return [{ id: uid(), subtitle: '', imageUrl: '', imageCaption: '', text: cleanedText || '' }];
}

export default function ParagraphBlockEditor({
  value,
  onChange,
  label = '3. फोटो अपलोड के साथ पैराग्राफ (Paragraphs with Photo Uploads)',
  subtitleHint = 'प्रत्येक पैराग्राफ खंड के लिए उप-शीर्षक, विवरण और फोटो बदलें या नया जोड़ें।',
}: ParagraphBlockEditorProps) {
  const [blocks, setBlocks] = useState<ParagraphBlock[]>(() => parseHtmlToBlocks(value));
  const [editorMode, setEditorMode] = useState<'blocks' | 'classic'>('blocks');
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewBlocks, setPreviewBlocks] = useState<Record<string, boolean>>({});
  const [galleryTargetBlockId, setGalleryTargetBlockId] = useState<string | null>(null);

  // Helper to wrap or apply formatting to selected text in a block's textarea
  const applyFormatToBlock = (
    blockId: string,
    prefix: string,
    suffix: string,
    defaultPlaceholder: string = 'टेक्स्ट'
  ) => {
    const textarea = document.getElementById(`textarea-block-${blockId}`) as HTMLTextAreaElement | null;
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    if (!textarea) {
      handleBlockChange(blockId, 'text', (block.text || '') + ` ${prefix}${defaultPlaceholder}${suffix}`);
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const currentText = block.text || '';
    const selectedText = currentText.substring(start, end);

    const replacement = selectedText
      ? `${prefix}${selectedText}${suffix}`
      : `${prefix}${defaultPlaceholder}${suffix}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    handleBlockChange(blockId, 'text', newText);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultPlaceholder.length);
      }
    }, 25);
  };

  // Helper to remove formatting / strip HTML tags from selected text
  const removeFormatFromBlock = (blockId: string) => {
    const textarea = document.getElementById(`textarea-block-${blockId}`) as HTMLTextAreaElement | null;
    const block = blocks.find((b) => b.id === blockId);
    if (!block || !textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const currentText = block.text || '';
    const selectedText = currentText.substring(start, end);
    if (!selectedText) return;

    const stripped = selectedText.replace(/<\/?[^>]+(>|$)/g, '');
    const newText = currentText.substring(0, start) + stripped + currentText.substring(end);
    handleBlockChange(blockId, 'text', newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + stripped.length);
    }, 25);
  };

  // Toggle live preview for a block
  const toggleBlockPreview = (blockId: string) => {
    setPreviewBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  // Keep a ref of internal changes to avoid re-parsing on self-triggered updates
  const internalHtmlRef = useRef<string>(value);

  // Sync external changes (e.g. from AutoTranslate or reset)
  useEffect(() => {
    if (value !== internalHtmlRef.current) {
      internalHtmlRef.current = value;
      const parsed = parseHtmlToBlocks(value);
      setBlocks(parsed);
    }
  }, [value]);

  // Update blocks and emit HTML
  const commitBlocks = (newBlocks: ParagraphBlock[]) => {
    setBlocks(newBlocks);
    const html = serializeBlocksToHtml(newBlocks);
    internalHtmlRef.current = html;
    onChange(html);
  };

  // Add block at top or bottom or specific index
  const handleAddBlock = (position: 'top' | 'bottom' | number) => {
    const newBlock: ParagraphBlock = {
      id: uid(),
      subtitle: '',
      imageUrl: '',
      imageCaption: '',
      text: '',
    };

    if (position === 'top') {
      commitBlocks([newBlock, ...blocks]);
    } else if (position === 'bottom') {
      commitBlocks([...blocks, newBlock]);
    } else if (typeof position === 'number') {
      const next = [...blocks];
      next.splice(position, 0, newBlock);
      commitBlocks(next);
    }
  };

  // Move block up or down
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    commitBlocks(next);
  };

  // Delete block
  const handleDeleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      // Clear instead of removing last block
      commitBlocks([{ id: uid(), subtitle: '', imageUrl: '', imageCaption: '', text: '' }]);
      return;
    }
    const next = blocks.filter((_, i) => i !== index);
    commitBlocks(next);
  };

  // Update specific block field
  const handleBlockChange = (id: string, field: keyof ParagraphBlock, val: string) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, [field]: val } : b));
    commitBlocks(next);
  };

  // File upload for a specific block's photo
  const handleUploadImageForBlock = async (blockId: string, file: File) => {
    setUploadingBlockId(blockId);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        const next = blocks.map((b) =>
          b.id === blockId ? { ...b, imageUrl: data.url } : b
        );
        commitBlocks(next);
      } else {
        setUploadError(data.error || 'फोटो अपलोड विफल रहा।');
      }
    } catch (err: any) {
      setUploadError(err.message || 'फोटो अपलोड में त्रुटि हुई।');
    } finally {
      setUploadingBlockId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 2 Big Visible Tabs: Block Mode vs Full HTML Editor */}
      <div className="bg-stone-100 p-1.5 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2 shadow-inner">
        <button
          type="button"
          onClick={() => setEditorMode('blocks')}
          className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            editorMode === 'blocks'
              ? 'bg-[#EA580C] text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200/80 bg-white/70'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>📰 पैराग्राफ ब्लॉक मोड (मल्टीपल फोटो व खंडवार)</span>
          {editorMode === 'blocks' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
              सक्रिय
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setEditorMode('classic')}
          className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            editorMode === 'classic'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200/80 bg-white/70'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>💻 पूर्ण HTML / विज़ुअल एडिटर (बोल्ड, इटैलिक, बड़ा फॉन्ट)</span>
          {editorMode === 'classic' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
              सक्रिय
            </span>
          )}
        </button>
      </div>

      {/* Module Sub-Header (Only in Blocks Mode) */}
      {editorMode === 'blocks' && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                <span>✍️</span>
                <span>{label}</span>
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C] border border-orange-200">
                मल्टीपल फोटो सपोर्ट
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-1">
              {subtitleHint}
            </p>
          </div>

          {/* Top Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Add Paragraph Above Button */}
            <button
              type="button"
              onClick={() => handleAddBlock('top')}
              className="flex-1 sm:flex-initial text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="लेख के सबसे ऊपर नया पैराग्राफ जोड़ें"
            >
              <Plus className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>+ ऊपर नया पैराग्राफ</span>
            </button>

            {/* Add Paragraph Button */}
            <button
              type="button"
              onClick={() => handleAddBlock('bottom')}
              className="flex-1 sm:flex-initial text-xs font-black text-white bg-[#EA580C] hover:bg-orange-700 border border-orange-600 px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
              title="लेख के अंत में नया पैराग्राफ जोड़ें"
            >
              <Plus className="w-4 h-4" />
              <span>+ नया पैराग्राफ जोड़ें</span>
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-red-800 font-black">×</button>
        </div>
      )}

      {/* Editor Content Area */}
      {editorMode === 'classic' ? (
        <div className="space-y-2">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium p-3 rounded-xl flex items-center justify-between">
            <span>ℹ️ आप अभी <strong>क्लासिक HTML/विजुअल एडिटर</strong> में हैं। वापस पैराग्राफ ब्लॉक्स में जाने के लिए ऊपर 'ब्लॉक मोड' पर क्लिक करें।</span>
            <button
              type="button"
              onClick={() => setEditorMode('blocks')}
              className="bg-amber-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg ml-2 hover:bg-amber-700"
            >
              ब्लॉक मोड में लौटें
            </button>
          </div>
          <HtmlContentEditor
            value={value}
            onChange={(html) => {
              internalHtmlRef.current = html;
              onChange(html);
            }}
            required
            label="पूरा समाचार विवरण (Full Content Body - HTML/Visual Editor)"
            placeholder="समाचार की विस्तृत जानकारी यहाँ लिखें या HTML डेटा पेस्ट करें..."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Paragraph Blocks List */}
          {blocks.map((block, index) => {
            const isFirst = index === 0;
            const isLast = index === blocks.length - 1;
            const isUploadingThis = uploadingBlockId === block.id;

            return (
              <div
                key={block.id}
                className="bg-white rounded-2xl border-2 border-stone-200 hover:border-orange-200 p-4 sm:p-5 shadow-xs transition-all space-y-4 group"
              >
                {/* Block Header & Reorder Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#EA580C] text-xs font-black flex items-center justify-center font-mono shadow-2xs">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-extrabold text-stone-900">
                      पैराग्राफ खंड (Paragraph Block {index + 1})
                    </span>
                    {block.imageUrl && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>फोटो संलग्न</span>
                      </span>
                    )}
                  </div>

                  {/* Ordering & Insertion Controls (Fulfills: पैराग्राफ को ऊपर-नीचे करने व लेटेस्ट पैराग्राफ जोड़ने की सुविधा) */}
                  <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200">
                    {/* Move Up Button */}
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMoveBlock(index, 'up')}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                      title="इस पैराग्राफ को ऊपर ले जाएं (Move Up)"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span className="hidden sm:inline">ऊपर</span>
                    </button>

                    {/* Move Down Button */}
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMoveBlock(index, 'down')}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                      title="इस पैराग्राफ को नीचे ले जाएं (Move Down)"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span className="hidden sm:inline">नीचे</span>
                    </button>

                    <span className="w-px h-4 bg-stone-300 mx-0.5" />

                    {/* Insert Above */}
                    <button
                      type="button"
                      onClick={() => handleAddBlock(index)}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-white transition-colors cursor-pointer flex items-center gap-0.5 text-[11px] font-bold"
                      title="इसके ठीक ऊपर नया पैराग्राफ जोड़ें"
                    >
                      <Plus className="w-3.5 h-3.5 text-stone-600" />
                      <span className="hidden sm:inline">ऊपर जोड़ें</span>
                    </button>

                    {/* Insert Below */}
                    <button
                      type="button"
                      onClick={() => handleAddBlock(index + 1)}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-white transition-colors cursor-pointer flex items-center gap-0.5 text-[11px] font-bold"
                      title="इसके ठीक नीचे नया पैराग्राफ जोड़ें"
                    >
                      <Plus className="w-3.5 h-3.5 text-stone-600" />
                      <span className="hidden sm:inline">नीचे जोड़ें</span>
                    </button>

                    <span className="w-px h-4 bg-stone-300 mx-0.5" />

                    {/* Delete Block */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(index)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                      title="इस पैराग्राफ खंड को हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtitle Input (उप-शीर्षक) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                      <span>उप-शीर्षक / खंड हेडिंग (Sub-heading - Optional)</span>
                    </label>
                    <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-lg">
                      <VoiceInputButton
                        mode="append"
                        onTranscript={(txt) => handleBlockChange(block.id, 'subtitle', txt)}
                        currentValue={block.subtitle || ''}
                        placeholderHint="उप-शीर्षक बोलिए..."
                        size="sm"
                      />
                      <span className="text-[10px] font-bold text-stone-600 select-none">बोलकर लिखें</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={block.subtitle || ''}
                    onChange={(e) => handleBlockChange(block.id, 'subtitle', e.target.value)}
                    placeholder="उदा: घटना का पूरा विवरण, अधिकारियों का बयान, मुख्य तथ्य..."
                    className="w-full p-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-hidden focus:border-[#EA580C] transition-colors"
                  />
                </div>

                {/* Photo Upload Section for this Paragraph */}
                <div className="p-3 sm:p-4 bg-stone-50/90 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-stone-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>इस पैराग्राफ की फोटो (Attach Photo for this Paragraph - Optional)</span>
                    </label>
                    {block.imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          handleBlockChange(block.id, 'imageUrl', '');
                          handleBlockChange(block.id, 'imageCaption', '');
                        }}
                        className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>फोटो हटाएं</span>
                      </button>
                    )}
                  </div>

                  {block.imageUrl ? (
                    /* Photo Preview with Caption Field */
                    <div className="flex flex-col sm:flex-row gap-4 items-start bg-white p-3 rounded-xl border border-stone-200">
                      <div className="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image
                          src={block.imageUrl}
                          alt={block.imageCaption || 'पैराग्राफ फोटो'}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-1">
                            फोटो का विवरण / कैप्शन (Photo Caption):
                          </label>
                          <input
                            type="text"
                            value={block.imageCaption || ''}
                            onChange={(e) => handleBlockChange(block.id, 'imageCaption', e.target.value)}
                            placeholder="उदा: बैठक में उपस्थित अधिकारीगण, घटनास्थल का दृश्य..."
                            className="w-full p-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#EA580C]"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <label className="text-[11px] font-bold text-[#EA580C] hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                            <Upload className="w-3 h-3" />
                            <span>कंप्यूटर से बदलें</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingThis}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadImageForBlock(block.id, f);
                              }}
                              className="hidden"
                            />
                          </label>

                          {/* Change from Gallery */}
                          <button
                            type="button"
                            onClick={() => setGalleryTargetBlockId(block.id)}
                            className="text-[11px] font-bold text-stone-800 hover:text-white bg-stone-100 hover:bg-stone-900 border border-stone-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            title="गैलरी से दूसरी फोटो चुनें"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-orange-500" />
                            <span>🖼️ गैलरी से बदलें</span>
                          </button>

                          <span className="text-[10px] text-stone-400 truncate max-w-xs">{block.imageUrl}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Photo Upload / Gallery / URL Options */
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      {/* Option 1: File Upload (Computer or Phone) */}
                      <label className="sm:col-span-5 border-2 border-dashed border-stone-300 hover:border-[#EA580C] hover:bg-orange-50/40 rounded-xl p-3 flex items-center justify-center gap-2.5 cursor-pointer transition-colors bg-white">
                        {isUploadingThis ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#EA580C]" />
                            <span className="text-xs font-bold text-[#EA580C]">अपलोड हो रहा है...</span>
                          </>
                        ) : (
                          <>
                            <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-extrabold text-stone-800 block">
                                कंप्यूटर या मोबाइल से अपलोड करें
                              </span>
                              <span className="text-[10px] text-stone-500 block">
                                JPG, PNG, WEBP क्लिक या ड्रैग करें
                              </span>
                            </div>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingThis}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadImageForBlock(block.id, f);
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* Option 2: Gallery Modal Trigger (Fulfills: जहां पर फोटो है, वहां गैलरी से अपलोड करें का ऑप्शन अवश्य हो) */}
                      <button
                        type="button"
                        onClick={() => setGalleryTargetBlockId(block.id)}
                        className="sm:col-span-4 border-2 border-dashed border-stone-300 hover:border-stone-800 hover:bg-stone-100/60 rounded-xl p-3 flex items-center justify-center gap-2.5 cursor-pointer transition-colors bg-white group text-left"
                        title="वेबसाइट की मीडिया गैलरी से फोटो चुनें या गैलरी में अपलोड करें"
                      >
                        <div className="w-7 h-7 rounded-lg bg-stone-900 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <FolderOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-stone-900 group-hover:text-[#EA580C] block transition-colors">
                            🖼️ गैलरी से अपलोड करें / चुनें
                          </span>
                          <span className="text-[10px] text-stone-500 block">
                            पोर्टल मीडिया गैलरी से फोटो लगाएं
                          </span>
                        </div>
                      </button>

                      {/* Option 3: Online URL Input */}
                      <div className="sm:col-span-3 bg-white p-2.5 border border-stone-200 rounded-xl flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />
                        <input
                          type="text"
                          placeholder="या ऑनलाइन इमेज URL..."
                          value={block.imageUrl || ''}
                          onChange={(e) => handleBlockChange(block.id, 'imageUrl', e.target.value)}
                          className="w-full text-xs font-medium focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Paragraph Text Description with Rich Formatting Toolbar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-extrabold text-stone-800 flex items-center gap-1">
                      <span>पैराग्राफ विवरण (Paragraph Text Content) *</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleBlockPreview(block.id)}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 cursor-pointer transition-colors ${
                          previewBlocks[block.id]
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                        }`}
                        title="लाइव फ़ॉर्मेटिंग पूर्वावलोकन देखें"
                      >
                        {previewBlocks[block.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{previewBlocks[block.id] ? 'प्रीव्यू छुपाएं' : '👁️ प्रीव्यू देखें'}</span>
                      </button>
                      <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-lg">
                        <VoiceInputButton
                          mode="append"
                          onTranscript={(txt) => handleBlockChange(block.id, 'text', txt)}
                          currentValue={block.text || ''}
                          placeholderHint="पैराग्राफ बोलिए..."
                          size="sm"
                        />
                        <span className="text-[10px] font-bold text-stone-600 select-none">बोलकर लिखें</span>
                      </div>
                    </div>
                  </div>

                  {/* Inline Rich HTML Formatting Toolbar for this Paragraph Block */}
                  <div className="bg-stone-100/90 p-1.5 rounded-t-xl border border-b-0 border-stone-300 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-bold text-stone-500 mr-1 select-none">फ़ॉर्मेट:</span>

                    {/* Bold */}
                    <button
                      type="button"
                      onClick={() => applyFormatToBlock(block.id, '<strong>', '</strong>', 'बोल्ड टेक्स्ट')}
                      className="px-2 py-1 bg-white hover:bg-orange-50 hover:text-[#EA580C] hover:border-orange-300 border border-stone-200 rounded-md text-xs font-black text-stone-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      title="टेक्स्ट को बोल्ड करें (Bold)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                      <span className="text-[11px]">बोल्ड</span>
                    </button>

                    {/* Italic */}
                    <button
                      type="button"
                      onClick={() => applyFormatToBlock(block.id, '<em>', '</em>', 'इटैलिक टेक्स्ट')}
                      className="px-2 py-1 bg-white hover:bg-orange-50 hover:text-[#EA580C] hover:border-orange-300 border border-stone-200 rounded-md text-xs font-bold text-stone-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 italic"
                      title="टेक्स्ट को इटैलिक करें (Italic)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                      <span className="text-[11px]">इटैलिक</span>
                    </button>

                    {/* Underline */}
                    <button
                      type="button"
                      onClick={() => applyFormatToBlock(block.id, '<u>', '</u>', 'अंडरलाइन')}
                      className="px-2 py-1 bg-white hover:bg-orange-50 hover:text-[#EA580C] hover:border-orange-300 border border-stone-200 rounded-md text-xs font-bold text-stone-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 underline"
                      title="टेक्स्ट के नीचे लाइन खींचें (Underline)"
                    >
                      <Underline className="w-3.5 h-3.5" />
                      <span className="text-[11px]">अंडरलाइन</span>
                    </button>

                    <div className="h-4 w-px bg-stone-300 mx-0.5" />

                    {/* H2 Heading */}
                    <button
                      type="button"
                      onClick={() => applyFormatToBlock(block.id, '<h2 class="text-xl sm:text-2xl font-black text-stone-900 my-2">', '</h2>', 'बड़ी हेडिंग यहाँ लिखें')}
                      className="px-2 py-1 bg-white hover:bg-orange-50 hover:text-[#EA580C] hover:border-orange-300 border border-stone-200 rounded-md text-xs font-black text-stone-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-0.5"
                      title="बड़ी हेडिंग (H2 Heading - 22px)"
                    >
                      <Heading2 className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span className="text-[11px]">H2 हेडिंग</span>
                    </button>

                    {/* H3 Heading */}
                    <button
                      type="button"
                      onClick={() => applyFormatToBlock(block.id, '<h3 class="text-lg font-bold text-stone-800 my-1">', '</h3>', 'मध्यम हेडिंग यहाँ लिखें')}
                      className="px-2 py-1 bg-white hover:bg-orange-50 hover:text-[#EA580C] hover:border-orange-300 border border-stone-200 rounded-md text-xs font-bold text-stone-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-0.5"
                      title="मध्यम हेडिंग (H3 Heading - 18px)"
                    >
                      <Heading3 className="w-3.5 h-3.5 text-stone-700" />
                      <span className="text-[11px]">H3</span>
                    </button>

                    <div className="h-4 w-px bg-stone-300 mx-0.5" />

                    {/* Font Size A+ */}
                    <button
                      type="button"
                      onClick={() => applyFormatToBlock(block.id, '<span style="font-size: 1.18rem; font-weight: 600;">', '</span>', 'बड़ा फॉन्ट')}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md text-xs font-black transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      title="फॉन्ट बड़ा करें (18px Large Font)"
                    >
                      <Type className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-[11px]">A+ बड़ा फॉन्ट</span>
                    </button>

                    {/* Font Size A++ */}
                    <button
                      type="button"
                      onClick={() => applyFormatToBlock(block.id, '<span style="font-size: 1.4rem; font-weight: 700;">', '</span>', 'विशाल फॉन्ट')}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-md text-xs font-black transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      title="फॉन्ट बहुत बड़ा करें (22px Extra Large Font)"
                    >
                      <Type className="w-4 h-4 text-amber-800" />
                      <span className="text-[11px]">A++ बहुत बड़ा</span>
                    </button>

                    <div className="h-4 w-px bg-stone-300 mx-0.5" />

                    {/* Highlight */}
                    <button
                      type="button"
                      onClick={() => applyFormatToBlock(block.id, '<mark class="bg-yellow-200 px-1 py-0.5 rounded font-medium">', '</mark>', 'हाइलाइट')}
                      className="px-1.5 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border border-yellow-300 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                      title="टेक्स्ट को हाइलाइट करें (Yellow Highlight)"
                    >
                      <Highlighter className="w-3 h-3" />
                      <span className="text-[10px]">हाइलाइट</span>
                    </button>

                    {/* Bullet */}
                    <button
                      type="button"
                      onClick={() => applyFormatToBlock(block.id, '• ', '', 'मुख्य बिंदु')}
                      className="px-1.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-md text-xs font-bold text-stone-700 transition-colors cursor-pointer flex items-center gap-0.5"
                      title="बुलेट बिंदु जोड़ें"
                    >
                      <List className="w-3 h-3" />
                      <span className="text-[10px]">बुलेट</span>
                    </button>

                    {/* Clear Format */}
                    <button
                      type="button"
                      onClick={() => removeFormatFromBlock(block.id)}
                      className="px-1.5 py-1 bg-white hover:bg-red-50 hover:text-red-700 border border-stone-200 rounded-md text-xs font-bold text-stone-600 transition-colors cursor-pointer flex items-center gap-0.5 ml-auto"
                      title="चयनित टेक्स्ट से HTML फ़ॉर्मेटिंग हटाएं"
                    >
                      <Eraser className="w-3 h-3" />
                      <span className="text-[10px]">फ़ॉर्मेट हटाएं</span>
                    </button>
                  </div>

                  <textarea
                    id={`textarea-block-${block.id}`}
                    rows={4}
                    value={block.text}
                    onChange={(e) => handleBlockChange(block.id, 'text', e.target.value)}
                    placeholder="इस पैराग्राफ का विस्तृत समाचार विवरण यहाँ दर्ज करें... टेक्स्ट चुनकर ऊपर दिए गए बटनों से बोल्ड, इटैलिक, हेडिंग या बड़ा फॉन्ट बनाएं।"
                    className="w-full p-3 border border-stone-300 rounded-b-xl text-sm font-normal text-stone-900 leading-relaxed focus:outline-hidden focus:border-[#EA580C] focus:ring-1 focus:ring-orange-500 font-sans"
                  />

                  {/* Live Render Preview if toggled */}
                  {previewBlocks[block.id] && (
                    <div className="mt-2 p-3 bg-stone-50 border border-blue-200 rounded-xl">
                      <div className="text-[11px] font-black text-blue-900 mb-1 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>लाइव रेंडर प्रीव्यू (Live Rendered Preview):</span>
                      </div>
                      <div
                        className="prose prose-stone max-w-none text-sm text-stone-900 bg-white p-3 rounded-lg border border-stone-200 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatTextToParagraphs(block.text) || '<span class="text-stone-400 italic">पैराग्राफ रिक्त है...</span>',
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1">
                    <span>नया पैराग्राफ बनाने के लिए Enter दबाएं • टेक्स्ट चुनकर ऊपर दिए बटनों से फ़ॉर्मेट करें</span>
                    <span>{block.text ? `${block.text.length} अक्षर` : 'रिक्त'}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Add Bar & Summary */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-stone-600 flex items-center gap-3">
              <span>📊 कुल पैराग्राफ: <strong className="text-stone-900">{blocks.length}</strong></span>
              <span>•</span>
              <span>📷 कुल तस्वीरें: <strong className="text-stone-900">{blocks.filter((b) => !!b.imageUrl).length}</strong></span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleAddBlock('top')}
                className="flex-1 sm:flex-initial text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>+ ऊपर नया पैराग्राफ</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('bottom')}
                className="flex-1 sm:flex-initial text-xs font-black text-white bg-[#EA580C] hover:bg-orange-700 border border-orange-600 px-5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ नया पैराग्राफ जोड़ें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Gallery Modal for paragraph blocks (Fulfills: जहां पर फोटो है, वहां गैलरी से अपलोड करें का ऑप्शन अवश्य हो) */}
      <MediaGalleryModal
        isOpen={!!galleryTargetBlockId}
        onClose={() => setGalleryTargetBlockId(null)}
        onSelect={(url, caption) => {
          if (galleryTargetBlockId) {
            const next = blocks.map((b) =>
              b.id === galleryTargetBlockId
                ? {
                    ...b,
                    imageUrl: url,
                    imageCaption: caption || b.imageCaption || '',
                  }
                : b
            );
            commitBlocks(next);
            setGalleryTargetBlockId(null);
          }
        }}
        title="🖼️ पैराग्राफ के लिए गैलरी से फोटो चुनें"
        currentSelectedUrl={
          blocks.find((b) => b.id === galleryTargetBlockId)?.imageUrl || ''
        }
      />
    </div>
  );
}
