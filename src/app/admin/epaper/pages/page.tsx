'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FolderTree,
  Newspaper,
  RefreshCw,
  Eye,
  Upload,
  Edit3,
  CheckCircle2,
  X,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface PageItem {
  id: string;
  pageNumber: number;
  pageTitle: string;
  pageImage: string;
  thumbnailImage?: string;
  extractedText?: string | null;
}

interface Edition {
  id: string;
  title: string;
  editionDate: string;
  totalPages: number;
  pages: PageItem[];
}

export default function EpaperPageManagementAdminPage() {
  const searchParams = useSearchParams();
  const editionId = searchParams.get('editionId');

  const [editions, setEditions] = useState<Edition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Preview Modal State
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; num: number } | null>(null);

  // Upload Image State
  const [uploadingPageId, setUploadingPageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetUploadPageId, setTargetUploadPageId] = useState<string | null>(null);

  // Notification
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchEditions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/epaper/editions?status=ALL');
      const data = await res.json();
      if (data.success) {
        setEditions(data.data || []);
        if (editionId) {
          const found = data.data.find((e: Edition) => e.id === editionId);
          if (found) setSelectedEdition(found);
          else if (data.data.length > 0) setSelectedEdition(data.data[0]);
        } else if (data.data.length > 0) {
          setSelectedEdition(data.data[0]);
        }
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchEditions();
  }, [editionId]);

  const handleOpenEdit = (page: PageItem) => {
    setEditingPage(page);
    setEditTitle(page.pageTitle);
    setEditText(page.extractedText || '');
  };

  const handleSaveEdit = async () => {
    if (!editingPage) return;
    setSavingEdit(true);
    try {
      const res = await fetch('/api/epaper/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPage.id,
          pageTitle: editTitle,
          extractedText: editText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ पेज ${editingPage.pageNumber} का विवरण सफलतापूर्वक अपडेट हुआ!`);
        if (selectedEdition) {
          setSelectedEdition({
            ...selectedEdition,
            pages: selectedEdition.pages.map((p) =>
              p.id === editingPage.id ? { ...p, pageTitle: editTitle, extractedText: editText } : p
            ),
          });
        }
        setEditingPage(null);
      } else {
        alert(data.error || 'अपडेट में त्रुटि हुई');
      }
    } catch (err: any) {
      alert(err.message || 'सर्वर एरर');
    }
    setSavingEdit(false);
  };

  const triggerUploadImage = (pageId: string) => {
    setTargetUploadPageId(pageId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetUploadPageId) return;

    setUploadingPageId(targetUploadPageId);
    const formData = new FormData();
    formData.append('pageId', targetUploadPageId);
    formData.append('imageFile', file);

    try {
      const res = await fetch('/api/epaper/pages', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ नया पेज स्कैन इमेज सफलतापूर्वक सेव हो गया!');
        if (selectedEdition) {
          setSelectedEdition({
            ...selectedEdition,
            pages: selectedEdition.pages.map((p) =>
              p.id === targetUploadPageId ? { ...p, pageImage: data.imageUrl, thumbnailImage: data.imageUrl } : p
            ),
          });
        }
      } else {
        alert(data.error || 'इमेज अपलोड में त्रुटि हुई');
      }
    } catch (err: any) {
      alert(err.message || 'सर्वर एरर');
    }
    setUploadingPageId(null);
    setTargetUploadPageId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Hidden File Input for Page Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-stone-900 text-amber-400 border border-amber-500/50 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-[#EA580C]" />
            <span>Page Management (पेज री-ऑर्डरिंग व प्रबंधन)</span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            प्रत्येक पृष्ठ की असली छवि बदलें, शीर्षक संपादित करें एवं पाठ (OCR) अपडेट करें
          </p>
        </div>

        {selectedEdition && (
          <Link
            href={`/epaper?id=${selectedEdition.id}`}
            target="_blank"
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>लाइव ई-पेपर प्रिव्यू खोलें</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </Link>
        )}
      </div>

      {/* Edition Selector Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <label className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5 whitespace-nowrap">
            <Newspaper className="w-4 h-4 text-[#EA580C]" />
            <span>अखबार संस्करण:</span>
          </label>
          <select
            value={selectedEdition?.id || ''}
            onChange={(e) => {
              const found = editions.find((ed) => ed.id === e.target.value);
              if (found) setSelectedEdition(found);
            }}
            className="w-full max-w-md p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C] bg-stone-50"
          >
            {editions.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.title} ({new Date(ed.editionDate).toLocaleDateString('hi-IN')}) — {ed.totalPages} पेज
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchEditions}
          className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="रिफ्रेश करें"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">रिफ्रेश</span>
        </button>
      </div>

      {/* Pages Grid */}
      {selectedEdition && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-stone-900 text-white p-4 rounded-xl">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <span>{selectedEdition.title}</span>
              <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                कुल {selectedEdition.pages?.length || 0} पृष्ठ
              </span>
            </h3>
            <span className="text-xs text-amber-400 font-mono font-bold">
              ● सभी पृष्ठ असली छवियों के साथ सक्रिय हैं
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {selectedEdition.pages?.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow p-3.5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Page Scan Preview */}
                  <div
                    onClick={() =>
                      setPreviewImage({
                        url: page.pageImage,
                        title: page.pageTitle,
                        num: page.pageNumber,
                      })
                    }
                    className="relative h-60 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 group cursor-pointer"
                    title="क्लिक करके बड़ा देखें"
                  >
                    <img
                      src={page.pageImage}
                      alt={page.pageTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#EA580C] text-white text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full shadow-md">
                      पेज {page.pageNumber}
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>बड़ा देखें</span>
                    </div>

                    {uploadingPageId === page.id && (
                      <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 text-amber-400 font-bold text-xs">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#EA580C]" />
                        <span>अपलोड हो रहा है...</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Info */}
                  <div className="mt-2.5">
                    <h4 className="font-extrabold text-stone-900 text-xs leading-tight line-clamp-2">
                      {page.pageTitle}
                    </h4>
                    {page.extractedText && (
                      <p className="text-[10px] text-stone-500 line-clamp-1 mt-1 font-mono">
                        📝 {page.extractedText.slice(0, 50)}...
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs font-bold">
                  <button
                    onClick={() => triggerUploadImage(page.id)}
                    className="p-2 bg-stone-100 hover:bg-[#EA580C] text-stone-800 hover:text-white rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="इस पेज की नई स्कैन इमेज अपलोड करें"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>इमेज बदलें</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(page)}
                    className="p-2 bg-stone-100 hover:bg-stone-800 text-stone-800 hover:text-white rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="पेज का शीर्षक व समाचार टेक्स्ट संपादित करें"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>एडिट</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#EA580C]" />
                <span>पेज {editingPage.pageNumber} का शीर्षक व टेक्स्ट संपादित करें</span>
              </h3>
              <button onClick={() => setEditingPage(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">पेज शीर्षक (Title):</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">
                  पेज का समाचार पाठ / OCR Text (पाठक इसे "पेज पाठ पढ़ें" में देखेंगे):
                </label>
                <textarea
                  rows={6}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="इस पृष्ठ के मुख्य समाचार व खबरें यहां लिखें..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#EA580C] leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => setEditingPage(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-5 py-2 bg-[#EA580C] hover:bg-orange-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>सहेजें (Save)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Resolution Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex justify-between items-center bg-slate-950 p-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="bg-[#EA580C] text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded">
                  पेज {previewImage.num}
                </span>
                <h3 className="font-bold text-amber-400 text-sm">{previewImage.title}</h3>
              </div>
              <button onClick={() => setPreviewImage(null)} className="text-stone-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone-950">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[78vh] w-auto object-contain rounded shadow-2xl border border-stone-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
