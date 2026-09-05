'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
  Code2,
  Eye,
  Edit3,
  Sparkles,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Maximize2,
  Minimize2,
  FileCode,
} from 'lucide-react';

interface HtmlContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minHeight?: string;
}

export default function HtmlContentEditor({
  value,
  onChange,
  placeholder = 'समाचार की विस्तृत जानकारी यहाँ लिखें या HTML डेटा पेस्ट करें...',
  label = 'विस्तृत समाचार सामग्री (Content Body - HTML/Visual Editor)',
  required = false,
  minHeight = '320px',
}: HtmlContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'preview'>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Synchronize external value into editor when not typing internally
  useEffect(() => {
    if (activeTab === 'visual' && editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        if (!isInternalChange.current) {
          editorRef.current.innerHTML = value || '';
        }
      }
    }
    isInternalChange.current = false;
  }, [value, activeTab]);

  // Handle Input in Visual Mode
  const handleVisualInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      isInternalChange.current = true;
      onChange(html);
    }
  }, [onChange]);

  // Execute formatting commands
  const execCmd = (cmd: string, arg?: string) => {
    if (activeTab !== 'visual') {
      setActiveTab('visual');
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand(cmd, false, arg);
          handleVisualInput();
        }
      }, 50);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, arg);
      handleVisualInput();
    }
  };

  // Add Link
  const handleInsertLink = () => {
    const url = prompt('लिंक का URL दर्ज करें (उदा. https://dainikmanyavar.com):');
    if (url) {
      execCmd('createLink', url);
    }
  };

  // Format Selection as Blockquote
  const handleInsertQuote = () => {
    execCmd('formatBlock', '<blockquote>');
  };

  // Auto-Clean & Standardize HTML Feed Data
  const handleAutoCleanHtml = () => {
    if (!value || !value.trim()) return;

    let cleaned = value.trim();

    // If it lacks basic HTML tags, wrap lines into <p> tags
    if (!/<[a-z][\s\S]*>/i.test(cleaned)) {
      cleaned = cleaned
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${line}</p>`)
        .join('\n');
    } else {
      // Clean up common messy feed artifacts
      cleaned = cleaned
        .replace(/<p>\s*<\/p>/gi, '') // Remove empty paragraphs
        .replace(/<p><br\s*\/?><\/p>/gi, '') // Remove empty br paragraphs
        .replace(/style="[^"]*"/gi, '') // Strip inline styles that break themes
        .replace(/class="[^"]*"/gi, '') // Strip external classes
        .replace(/&nbsp;/gi, ' '); // Clean excessive nbsp
    }

    onChange(cleaned);
    if (editorRef.current) {
      editorRef.current.innerHTML = cleaned;
    }
  };

  // Calculate stats
  const cleanText = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const charCount = cleanText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div
      className={`border border-stone-300 rounded-2xl bg-white shadow-xs overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl border-stone-400' : 'relative'
      }`}
    >
      {/* Top Header & Tab Switching */}
      <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-[#EA580C]" />
            <span>{label}</span>
            {required && <span className="text-red-600 font-bold">*</span>}
          </label>
        </div>

        {/* View Tabs: Visual, HTML Code, Preview */}
        <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-white text-stone-950 shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>👁️ विज़ुअल (Visual)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-stone-900 text-amber-400 shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>💻 HTML कोड (Feed Source)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>📱 लाइव प्रीव्यू</span>
          </button>
        </div>

        {/* Tools: Fullscreen & Auto Clean */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAutoCleanHtml}
            className="bg-orange-50 hover:bg-orange-100 text-[#C2410C] font-black text-[11px] px-2.5 py-1 rounded-lg border border-orange-200 flex items-center gap-1 transition-colors cursor-pointer"
            title="फ़ीड HTML को साफ करें और पैराग्राफ में व्यवस्थित करें"
          >
            <Sparkles className="w-3 h-3 text-[#EA580C]" />
            <span>HTML ऑटो-फ़ॉर्मेट</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-stone-600 hover:text-stone-950 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            title={isFullscreen ? 'सामान्य स्क्रीन' : 'फ़ुल स्क्रीन एडिटर'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* WYSIWYG Formatting Toolbar (Visible in Visual Mode) */}
      {activeTab === 'visual' && (
        <div className="bg-stone-100/90 px-3 py-1.5 border-b border-stone-200 flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<p>')}
            className="px-2 py-1 text-xs font-bold text-stone-700 hover:bg-white rounded hover:text-stone-900 cursor-pointer"
            title="सामान्य पैराग्राफ (Paragraph)"
          >
            <Pilcrow className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h2>')}
            className="px-2 py-1 text-xs font-bold text-stone-700 hover:bg-white rounded hover:text-stone-900 cursor-pointer"
            title="उप-शीर्षक 1 (Heading 2)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h3>')}
            className="px-2 py-1 text-xs font-bold text-stone-700 hover:bg-white rounded hover:text-stone-900 cursor-pointer"
            title="उप-शीर्षक 2 (Heading 3)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-stone-300 mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="बोल्ड (Bold - Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="इटैलिक (Italic - Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="अंडरलाइन (Underline)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-stone-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => execCmd('justifyLeft')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="बायां संरेखण (Align Left)"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyCenter')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="केंद्र संरेखण (Align Center)"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyFull')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="जस्टीफाई (Justify)"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-stone-300 mx-1" />

          {/* Lists & Quote */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="बिंदुवार सूची (Bullet List)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="क्रमांक सूची (Numbered List)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleInsertQuote}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="विशेष कथन / ब्लॉककोट (Quote)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-stone-300 mx-1" />

          {/* Links */}
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="लिंक जोड़ें (Add Link)"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('unlink')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="लिंक हटाएं (Remove Link)"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('removeFormat')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="फ़ॉर्मेटिंग हटाएं (Clear Format)"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-stone-300 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => execCmd('undo')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="पूर्ववत करें (Undo)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('redo')}
            className="p-1.5 text-stone-700 hover:bg-white rounded hover:text-stone-950 cursor-pointer"
            title="पुनः करें (Redo)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="relative flex-1 flex flex-col bg-white overflow-hidden">
        {/* Tab 1: Visual WYSIWYG ContentEditable */}
        {activeTab === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleVisualInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="p-4 flex-1 outline-none text-stone-900 text-sm leading-relaxed overflow-y-auto prose prose-stone max-w-none focus:ring-0 [&>p]:mb-3 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-stone-900 [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-stone-900 [&>h3]:mt-3 [&>h3]:mb-1.5 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-[#EA580C] [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:bg-orange-50/50 [&>blockquote]:py-1.5 [&>blockquote]:my-3 [&>blockquote]:rounded-r [&>a]:text-[#EA580C] [&>a]:underline empty:before:content-[attr(data-placeholder)] empty:before:text-stone-400 empty:before:pointer-events-none"
          />
        )}

        {/* Tab 2: Raw HTML Data Feed Code View */}
        {activeTab === 'code' && (
          <div className="flex-1 flex flex-col bg-stone-950 text-emerald-400 p-3">
            <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-stone-400 border-b border-stone-800 mb-2">
              <span>HTML फ़ीड स्रोत कोड (Direct HTML Feed Input / Code Editor)</span>
              <span className="text-amber-400 font-bold">यहाँ सीधे HTML टैग्स लिख या पेस्ट कर सकते हैं</span>
            </div>
            <textarea
              rows={14}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="<p>समाचार का HTML डेटा यहाँ दर्ज करें...</p>"
              style={{ minHeight }}
              className="w-full flex-1 bg-transparent text-emerald-400 font-mono text-xs p-2 outline-none resize-y leading-relaxed focus:ring-0"
              spellCheck={false}
            />
          </div>
        )}

        {/* Tab 3: Public Website Reader Live Preview */}
        {activeTab === 'preview' && (
          <div
            style={{ minHeight }}
            className="p-6 flex-1 overflow-y-auto bg-stone-50/60 border-t border-stone-100"
          >
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2 mb-4 flex items-center justify-between">
                <span>📱 दैनिक मान्यवर पाठक दृश्य (Reader View)</span>
                <span className="text-green-700 font-bold">● लाइव प्रीव्यू</span>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: value || '<p class="text-stone-400 italic">कोई समाचार सामग्री नहीं है...</p>' }}
                className="text-stone-800 text-sm sm:text-base leading-relaxed space-y-3 prose prose-stone max-w-none [&>p]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-stone-900 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-stone-900 [&>blockquote]:border-l-4 [&>blockquote]:border-[#EA580C] [&>blockquote]:pl-4 [&>blockquote]:py-1 [&>blockquote]:my-3 [&>blockquote]:italic [&>blockquote]:bg-orange-50/40 [&>blockquote]:rounded-r [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>a]:text-[#EA580C] [&>a]:underline"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-stone-50 px-4 py-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-stone-500">
        <div className="flex items-center gap-3">
          <span>कुल शब्द: <strong className="text-stone-800">{wordCount}</strong></span>
          <span>अक्षर: <strong className="text-stone-800">{charCount}</strong></span>
          <span>अनुमानित पठन: <strong className="text-stone-800">~{readingTime} मिनट</strong></span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          {/<[a-z][\s\S]*>/i.test(value) ? (
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
              ✓ HTML फ़ॉर्मेटेड डेटा
            </span>
          ) : (
            <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
              ⚠ सामान्य टेक्स्ट (HTML में बदलें)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
