'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  FileSpreadsheet,
  Link2,
  ExternalLink,
  Globe,
  ListFilter,
} from 'lucide-react';

interface ArticleItem {
  id: string;
  newsId?: number;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  publishedAt: string;
  category?: { name: string };
}

interface ExportLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: ArticleItem[];
  selectedIds?: string[];
}

export default function ExportLinksModal({
  isOpen,
  onClose,
  articles,
  selectedIds = [],
}: ExportLinksModalProps) {
  // Scope: 'all' or 'selected'
  const [scope, setScope] = useState<'all' | 'selected'>(
    selectedIds.length > 0 ? 'selected' : 'all'
  );

  // Line style in TXT: 'pair' (Full Link | Short Link), 'tab' (Tab separated), or 'detailed' (Title + Links)
  const [txtFormat, setTxtFormat] = useState<'pair' | 'tab' | 'detailed'>('pair');

  // Domain selection: 'live' (https://dainikmanyavar.com) or 'current' (window.location.origin)
  const [useLiveDomain, setUseLiveDomain] = useState<boolean>(true);

  // Copy feedback state
  const [copied, setCopied] = useState<boolean>(false);

  // Filter articles based on scope
  const targetArticles = useMemo(() => {
    if (scope === 'selected' && selectedIds.length > 0) {
      const idSet = new Set(selectedIds);
      return articles.filter((a) => idSet.has(a.id));
    }
    return articles;
  }, [articles, selectedIds, scope]);

  // Compute Base URL
  const baseUrl = useMemo(() => {
    if (useLiveDomain) return 'https://dainikmanyavar.com';
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return 'https://dainikmanyavar.com';
  }, [useLiveDomain]);

  // Build link objects
  const linkItems = useMemo(() => {
    return targetArticles.map((art) => {
      const fullUrl = `${baseUrl}/news/${art.newsId || art.slug}`;
      const shortUrl =
        art.newsId && art.newsId > 0
          ? `${baseUrl}/n/${art.newsId}`
          : `${baseUrl}/n/${art.id}`;
      return {
        id: art.newsId ? `#${art.newsId}` : `#${art.id.slice(0, 6)}`,
        title: art.title,
        category: art.category?.name || 'सामान्य',
        views: art.viewCount || 0,
        date: art.publishedAt
          ? new Date(art.publishedAt).toLocaleDateString('hi-IN')
          : '',
        fullUrl,
        shortUrl,
      };
    });
  }, [targetArticles, baseUrl]);

  // Generate plain text lines
  const textContent = useMemo(() => {
    if (linkItems.length === 0) return '';

    if (txtFormat === 'pair') {
      // Clean pair format: Full Link | Short Link
      return linkItems
        .map((item) => `${item.fullUrl} | ${item.shortUrl}`)
        .join('\n');
    }

    if (txtFormat === 'tab') {
      // Tab separated for spreadsheets/Notepad
      return linkItems
        .map((item) => `${item.fullUrl}\t${item.shortUrl}`)
        .join('\n');
    }

    // Detailed format: Title, Full Link, Short Link
    return linkItems
      .map(
        (item, index) =>
          `[${index + 1}] ${item.id} ${item.title}\nफुल लिंक: ${item.fullUrl}\nशॉर्ट लिंक: ${item.shortUrl}\n`
      )
      .join('\n');
  }, [linkItems, txtFormat]);

  // Generate CSV content (with UTF-8 BOM for Microsoft Excel)
  const csvContent = useMemo(() => {
    const headers = [
      'ID',
      'समाचार शीर्षक (Title)',
      'श्रेणी (Category)',
      'फुल लिंक (Full Link)',
      'शॉर्ट वर्जन लिंक (Short Link)',
      'व्यूज (Views)',
      'दिनांक (Date)',
    ];

    const escapeCsv = (str: string | number) => {
      const val = String(str ?? '');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return `"${val}"`;
    };

    const rows = linkItems.map((item) =>
      [
        escapeCsv(item.id),
        escapeCsv(item.title),
        escapeCsv(item.category),
        escapeCsv(item.fullUrl),
        escapeCsv(item.shortUrl),
        escapeCsv(item.views),
        escapeCsv(item.date),
      ].join(',')
    );

    // '\uFEFF' ensures UTF-8 Hindi text renders correctly in Excel
    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  }, [linkItems]);

  if (!isOpen) return null;

  // Trigger file download
  const handleDownloadFile = (type: 'txt' | 'csv') => {
    const isCsv = type === 'csv';
    const content = isCsv ? csvContent : textContent;
    const mime = isCsv ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8';
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `dainikmanyavar-links-${scope}-${dateStr}.${type}`;

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy links:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-100 flex items-start justify-between gap-4 bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 text-[#EA580C] border border-orange-200 flex items-center justify-center shrink-0 shadow-xs">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span>पन्ने के सभी लिंक एक्सपोर्ट करें</span>
                <span className="bg-[#EA580C] text-white text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                  {linkItems.length} लिंक्स
                </span>
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                प्रत्येक समाचार का फुल वेब लिंक और शॉर्ट वर्जन लिंक एक साथ डाउनलोड करें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 border-b border-stone-100 bg-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Scope Selection */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setScope('selected')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    scope === 'selected'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  चयनित ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    scope === 'all'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  सभी पन्ने के ({articles.length})
                </button>
              </div>
            )}

            {/* Domain toggle */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-stone-500 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> डोमेन:
              </span>
              <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setUseLiveDomain(true)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    useLiveDomain
                      ? 'bg-white text-[#EA580C] shadow-xs font-black'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="लाइव सार्वजनिक वेबसाइट का लिंक"
                >
                  dainikmanyavar.com (लाइव)
                </button>
                <button
                  type="button"
                  onClick={() => setUseLiveDomain(false)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    !useLiveDomain
                      ? 'bg-white text-stone-900 shadow-xs font-black'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="वर्तमान होस्ट (Local / Staging)"
                >
                  वर्तमान होस्ट
                </button>
              </div>
            </div>

            {/* TXT Format layout */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-stone-500">लाइन फॉर्मेट:</span>
              <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTxtFormat('pair')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    txtFormat === 'pair'
                      ? 'bg-white text-stone-900 shadow-xs font-black'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="फुल लिंक | शॉर्ट लिंक"
                >
                  लिंक | शॉर्ट लिंक
                </button>
                <button
                  type="button"
                  onClick={() => setTxtFormat('tab')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    txtFormat === 'tab'
                      ? 'bg-white text-stone-900 shadow-xs font-black'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Tab Separated (Excel पेस्ट के लिए)"
                >
                  Tab अलग (Tab)
                </button>
                <button
                  type="button"
                  onClick={() => setTxtFormat('detailed')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    txtFormat === 'detailed'
                      ? 'bg-white text-stone-900 shadow-xs font-black'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="शीर्षक + लिंक"
                >
                  शीर्षक सहित
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col min-h-0 bg-stone-900 text-stone-200">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-400 pb-2 border-b border-stone-800">
            <span>📄 फाइल प्रीव्यू (हर लाइन पर फुल लिंक व शॉर्ट लिंक):</span>
            <span className="text-orange-400">{linkItems.length} पंक्तियाँ तैयार</span>
          </div>

          <div className="mt-2 flex-1 overflow-y-auto pr-1 font-mono text-[11px] leading-relaxed select-all bg-stone-950 p-3 rounded-xl border border-stone-800 text-stone-300">
            {linkItems.length === 0 ? (
              <p className="text-stone-500 italic">कोई समाचार लिंक उपलब्ध नहीं है।</p>
            ) : (
              <pre className="whitespace-pre-wrap font-mono break-all">
                {textContent}
              </pre>
            )}
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 border-t border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-500 font-medium">
            💡 <strong className="text-stone-700">सुझाव:</strong> WhatsApp, Telegram या सोशल मीडिया पोस्ट में शॉर्ट लिंक का उपयोग करें।
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy All Button */}
            <button
              type="button"
              onClick={handleCopyClipboard}
              disabled={linkItems.length === 0}
              className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              title="सभी लिंक क्लिपबोर्ड पर कॉपी करें"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">कॉपी हो गया!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>सभी कॉपी करें</span>
                </>
              )}
            </button>

            {/* Download CSV / Excel Button */}
            <button
              type="button"
              onClick={() => handleDownloadFile('csv')}
              disabled={linkItems.length === 0}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="एक्सेल में खोलने योग्य CSV फाइल डाउनलोड करें"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>डाउनलोड CSV (Excel)</span>
            </button>

            {/* Download TXT File Button (Primary) */}
            <button
              type="button"
              onClick={() => handleDownloadFile('txt')}
              disabled={linkItems.length === 0}
              className="px-4.5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-orange-700 text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              title="हर लाइन पर लिंक व शॉर्ट लिंक वाली टेक्स्ट फाइल डाउनलोड करें"
            >
              <Download className="w-4 h-4" />
              <span>डाउनलोड फाइल (.txt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
