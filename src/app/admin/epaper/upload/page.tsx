'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Upload,
  FileText,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Eye,
  ArrowLeft,
  Zap,
  AlertCircle,
  Layers,
  Check,
  X,
  Maximize2,
  Star,
  Plus,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

interface RenderedPage {
  pageNumber: number;
  pageTitle: string;
  blob: Blob;
  previewUrl: string;
  text?: string;
  isCustomImage?: boolean;
}

export default function UploadEpaperAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [useCoverUrl, setUseCoverUrl] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const replacePageInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetPageNum, setReplaceTargetPageNum] = useState<number | null>(null);
  const addExtraPagesInputRef = useRef<HTMLInputElement>(null);
  const urlsToRevokeRef = useRef<string[]>([]);

  // Automatic PDF Page Extraction State
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [selectedCoverPage, setSelectedCoverPage] = useState<number>(1);
  const [renderingPages, setRenderingPages] = useState(false);
  const [renderProgress, setRenderProgress] = useState({ current: 0, total: 0, message: '' });
  const [renderError, setRenderError] = useState('');
  const [zoomPage, setZoomPage] = useState<RenderedPage | null>(null);

  const [form, setForm] = useState({
    title: 'दैनिक मान्यवर',
    editionDate: new Date().toISOString().split('T')[0],
    editionType: 'दैनिक',
    description: 'दैनिक मान्यवर ई-पेपर डिजिटल संस्करण',
    coverImage: '',
    status: 'PUBLISHED',
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [resultId, setResultId] = useState<string | null>(null);

  // Clean up object URLs strictly on component unmount
  useEffect(() => {
    return () => {
      urlsToRevokeRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const handleCoverFileChange = (f: File | null) => {
    if (!f) return;
    setCoverFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const triggerReplacePage = (pageNum: number) => {
    setReplaceTargetPageNum(pageNum);
    if (replacePageInputRef.current) {
      replacePageInputRef.current.value = '';
      replacePageInputRef.current.click();
    }
  };

  const handleReplacePageFile = (f: File | null) => {
    if (!f || replaceTargetPageNum === null) return;
    const newPreviewUrl = URL.createObjectURL(f);
    urlsToRevokeRef.current.push(newPreviewUrl);
    setRenderedPages((prev) =>
      prev.map((p) =>
        p.pageNumber === replaceTargetPageNum
          ? { ...p, blob: f, previewUrl: newPreviewUrl, isCustomImage: true }
          : p
      )
    );
    if (zoomPage && zoomPage.pageNumber === replaceTargetPageNum) {
      setZoomPage((prev) => (prev ? { ...prev, blob: f, previewUrl: newPreviewUrl, isCustomImage: true } : null));
    }
    setReplaceTargetPageNum(null);
  };

  const handleAddExtraPages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const currentLen = renderedPages.length;
    const newItems: RenderedPage[] = [];
    Array.from(files).forEach((f, idx) => {
      const pUrl = URL.createObjectURL(f);
      urlsToRevokeRef.current.push(pUrl);
      const newNum = currentLen + idx + 1;
      newItems.push({
        pageNumber: newNum,
        pageTitle: `पेज ${newNum}`,
        blob: f,
        previewUrl: pUrl,
        isCustomImage: true,
      });
    });
    setRenderedPages((prev) => [...prev, ...newItems]);
  };

  const handleDeleteRenderedPage = (pageNum: number) => {
    if (renderedPages.length <= 1) {
      alert('कम से कम एक पेज होना अनिवार्य है');
      return;
    }
    if (!confirm(`क्या आप पेज ${pageNum} को इस संस्करण से हटाना चाहते हैं?`)) return;
    const remaining = renderedPages.filter((p) => p.pageNumber !== pageNum);
    const renumbered = remaining.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
      pageTitle: idx === 0 ? 'पेज 1 - मुख्य पृष्ठ (Front Page)' : `पेज ${idx + 1}`,
    }));
    setRenderedPages(renumbered);
    if (selectedCoverPage === pageNum) {
      setSelectedCoverPage(1);
    } else if (selectedCoverPage > pageNum) {
      setSelectedCoverPage((prev) => Math.max(1, prev - 1));
    }
  };

  // Automatic PDF Page Extraction on File Selection
  const handlePdfFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      urlsToRevokeRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsToRevokeRef.current = [];
      setRenderedPages([]);
      return;
    }

    setFile(selectedFile);
    // Cleanup old preview URLs
    urlsToRevokeRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsToRevokeRef.current = [];
    setRenderedPages([]);
    setSelectedCoverPage(1);
    setRenderingPages(true);
    setRenderError('');
    setRenderProgress({ current: 0, total: 0, message: 'PDF फाइल लोड हो रही है...' });

    try {
      // @ts-ignore
      const pdfjs = await import('pdfjs-dist/build/pdf.js');
      if (typeof window !== 'undefined') {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }

      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        cMapUrl: '/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/standard_fonts/',
        disableFontFace: true,
      });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      setRenderProgress({
        current: 0,
        total: numPages,
        message: `अखबार के कुल ${numPages} पृष्ठ डिटेक्ट हुए। पेज रेंडरिंग जारी...`,
      });

      const pages: RenderedPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        setRenderProgress({
          current: i,
          total: numPages,
          message: `पेज ${i} / ${numPages} रेंडर हो रहा है...`,
        });

        const page = await pdfDoc.getPage(i);
        const defaultVp = page.getViewport({ scale: 1.0 });
        // Target ~1400px width for crisp print text readability
        const targetWidth = 1400;
        const scale = Math.min(2.0, Math.max(1.0, targetWidth / defaultVp.width));
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => {
                if (b) resolve(b);
                else reject(new Error(`Page ${i} conversion failed`));
              },
              'image/jpeg',
              0.88
            );
          });

          const previewUrl = URL.createObjectURL(blob);
          urlsToRevokeRef.current.push(previewUrl);

          let text = '';
          try {
            const textContent = await page.getTextContent();
            text = textContent.items
              .map((item: any) => item.str || '')
              .join(' ')
              .trim();
          } catch (e) {
            // Text extraction failure is non-fatal
          }

          pages.push({
            pageNumber: i,
            pageTitle: i === 1 ? 'पेज 1 - मुख्य पृष्ठ (Front Page)' : `पेज ${i}`,
            blob,
            previewUrl,
            text,
          });

          // Incremental state update so user sees progress immediately
          setRenderedPages([...pages]);
        }
      }

      setRenderingPages(false);
      setRenderProgress({
        current: numPages,
        total: numPages,
        message: `✅ सभी ${numPages} पृष्ठ उच्च गुणवत्ता में तैयार हो चुके हैं!`,
      });
    } catch (err: any) {
      console.error('PDF page extraction error:', err);
      setRenderingPages(false);
      setRenderError(
        'PDF पृष्ठ स्वतः रेंडर करने में त्रुटि: ' +
          (err.message || 'कृपया दोबारा प्रयास करें या फ़ाइल जांचें')
      );
    }
  };

  const handleSubmit = async (statusOverride?: string) => {
    if (!file && renderedPages.length === 0) {
      alert('कृपया अखबार की PDF फ़ाइल चुनें या इमेज से कम से कम एक पेज जोड़ें');
      return;
    }

    if (renderingPages) {
      alert('कृपया प्रतीक्षा करें, अभी PDF के सभी पन्नों की रेंडरिंग प्रक्रिया जारी है...');
      return;
    }

    setLoading(true);
    setMsg('⏳ अखबार व उसके सभी पृष्ठ अपलोड व सेव हो रहे हैं, कृपया प्रतीक्षा करें...');

    try {
      const formData = new FormData();
      if (file) formData.append('pdfFile', file);
      formData.append('title', form.title);
      formData.append('editionDate', form.editionDate);
      formData.append('editionType', form.editionType);
      formData.append('description', form.description);
      formData.append('coverImage', form.coverImage);
      if (coverFile) formData.append('coverImageFile', coverFile);
      formData.append('selectedCoverPage', String(selectedCoverPage));
      formData.append('status', statusOverride || form.status);

      // Append all auto-rendered page images from the PDF
      if (renderedPages.length > 0) {
        formData.append('totalPages', String(renderedPages.length));
        renderedPages.forEach((p) => {
          formData.append(`pageImage_${p.pageNumber}`, p.blob, `page_${p.pageNumber}.jpg`);
          if (p.text) {
            formData.append(`pageText_${p.pageNumber}`, p.text);
          }
        });
      }

      const res = await fetch('/api/epaper/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMsg(`✅ ${data.message} डिजिटल ई-पेपर खुल रहा है...`);
        setResultId(data.editionId);

        // Instant Auto-Redirect to the newly generated flipbook reader
        setTimeout(() => {
          window.location.href = `/epaper?id=${data.editionId}`;
        }, 1200);
      } else {
        alert(data.error || 'अपलोड में त्रुटि हुई');
        setLoading(false);
      }
    } catch (err: any) {
      alert(err.message || 'सर्वर एरर');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#EA580C]" />
            <span>Upload Today's Newspaper (आज का अखबार अपलोड करें)</span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            दैनिक अखबार की PDF अपलोड करें — सभी पृष्ठ स्वतः अलग-अलग इमेज बनकर ई-पेपर में सेव होंगे
          </p>
        </div>

        <Link
          href="/admin/epaper/published"
          className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>प्रकाशित संस्करण देखें</span>
        </Link>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-2xl font-bold text-xs space-y-3 shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">{msg}</span>
          </div>

          {resultId && (
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href={`/epaper?id=${resultId}`}
                className="bg-[#EA580C] text-white px-5 py-2 rounded-xl font-black text-xs inline-flex items-center gap-2 shadow-md hover:bg-orange-700 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-white" />
                <span>🚀 अभी ई-पेपर प्रिव्यू खोलें</span>
              </Link>

              <Link
                href="/admin/epaper/published"
                className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs inline-flex items-center gap-1.5"
              >
                <span>📋 सभी प्रकाशित संस्करण देखें</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Upload Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-6"
      >
        <h3 className="font-extrabold text-stone-900 text-base border-b border-stone-100 pb-3 flex items-center gap-2">
          <span>📰 अखबार विवरण व PDF अपलोड</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Newspaper Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Newspaper Name (अखबार का नाम) *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
              placeholder="दैनिक मान्यवर"
            />
          </div>

          {/* Edition Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Edition Date (प्रकाशन तिथि) *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                suppressHydrationWarning
                value={form.editionDate}
                onChange={(e) => setForm({ ...form, editionDate: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>

          {/* Edition Type */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Edition Type (संस्करण प्रकार)
            </label>
            <select
              value={form.editionType}
              onChange={(e) => setForm({ ...form, editionType: e.target.value })}
              className="w-full p-3 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
            >
              <option value="दैनिक">📰 दैनिक समाचार पत्र (Daily Newspaper)</option>
              <option value="विशेष">🌟 विशेष संस्करण (Special Edition)</option>
              <option value="रविवार">☀️ रविवार विशेषांक (Sunday Special)</option>
            </select>
          </div>

          {/* Cover Image File Uploader / Auto-selected Cover */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-stone-700">
                Cover Photo (मुख्य कवर पेज)
              </label>
              <button
                type="button"
                onClick={() => setUseCoverUrl(!useCoverUrl)}
                className="text-[10px] text-[#EA580C] hover:underline font-bold cursor-pointer"
              >
                {useCoverUrl ? '📁 फ़ाइल / पेज चुनें' : '🔗 URL दर्ज करें'}
              </button>
            </div>

            {!useCoverUrl ? (
              <div>
                {coverPreview ? (
                  <div className="p-2.5 bg-stone-50 border border-green-500 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={coverPreview}
                        alt="Cover Preview"
                        className="w-12 h-14 object-cover rounded-lg border shadow-xs"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-900 line-clamp-1">
                          {coverFile?.name}
                        </p>
                        <p className="text-[10px] text-green-600 font-bold">✓ कस्टम कवर फोटो चयनित</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1 bg-red-50 rounded-lg cursor-pointer"
                    >
                      हटाएं
                    </button>
                  </div>
                ) : renderedPages.length > 0 ? (
                  <div className="p-2.5 bg-amber-50/80 border border-amber-300 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {(() => {
                        const activeCover =
                          renderedPages.find((p) => p.pageNumber === selectedCoverPage) ||
                          renderedPages[0];
                        return (
                          <>
                            <img
                              src={activeCover.previewUrl}
                              alt="Cover Preview"
                              className="w-12 h-15 object-cover rounded-lg border border-amber-400 shadow-xs cursor-pointer hover:opacity-90 flex-shrink-0"
                              onClick={() => setZoomPage(activeCover)}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-stone-900">
                                  पेज {activeCover.pageNumber}
                                </span>
                                <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  {activeCover.pageNumber === 1 ? 'स्वतः मुख्य कवर' : 'मुख्य कवर चयनित'}
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-600 font-medium mt-0.5 truncate">
                                नीचे किसी भी पेज पर &apos;मुख्य बनाएं&apos; दबाकर बदल सकते हैं
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="text-[11px] text-[#EA580C] hover:text-orange-700 font-bold px-2.5 py-1.5 bg-white hover:bg-orange-50 rounded-lg border border-orange-200 cursor-pointer flex-shrink-0"
                    >
                      कस्टम फोटो
                    </button>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      onChange={(e) => handleCoverFileChange(e.target.files?.[0] || null)}
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="border border-dashed border-stone-300 hover:border-[#EA580C] bg-stone-50 p-3 rounded-xl text-center cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold text-stone-700">📁 कवर फ़ोटो चुनें (PNG, JPG)</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      खाली छोड़ने पर PDF का प्रथम पृष्ठ (पेज 1) स्वतः मुख्य कवर बनेगा
                    </p>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      onChange={(e) => handleCoverFileChange(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://... या /uploads/..."
                className="w-full p-3 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#EA580C]"
              />
            )}
          </div>

          {/* PDF Upload File Box */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Upload Newspaper PDF File (अखबार की PDF फ़ाइल चुनें) *
            </label>
            <div
              className={`border-2 border-dashed p-8 rounded-2xl text-center space-y-3 transition-colors cursor-pointer ${
                file
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-stone-300 hover:border-[#EA580C] bg-stone-50'
              }`}
              onClick={() => document.getElementById('pdf-file-input')?.click()}
            >
              <Upload
                className={`w-10 h-10 mx-auto ${file ? 'text-emerald-600' : 'text-[#EA580C]'}`}
              />
              <div>
                <p className="text-sm font-black text-stone-900">
                  {file
                    ? `चुनी गई फ़ाइल: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
                    : 'यहाँ क्लिक करें या PDF फ़ाइल चुनें'}
                </p>
                <p className="text-[11px] text-stone-500 font-semibold mt-1">
                  दैनिक अखबार की PDF (सिस्टम इसके सभी 8 पन्नों को स्वतः अलग-अलग इमेज में बदल देगा)
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      addExtraPagesInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] hover:text-orange-700 bg-white hover:bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-300 shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>या सीधे इमेज फ़ाइलों (JPG/PNG) से पेज जोड़ें</span>
                  </span>
                </div>
              </div>
              <input
                id="pdf-file-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handlePdfFileChange(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Rendering Progress Card */}
          {renderingPages && (
            <div className="md:col-span-2 bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#EA580C]" />
                  <span className="text-xs font-black text-amber-900">
                    {renderProgress.message}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-amber-800 bg-amber-200/70 px-2.5 py-1 rounded-full">
                  {renderProgress.current} / {renderProgress.total}
                </span>
              </div>
              <div className="w-full bg-amber-200/50 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#EA580C] h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      renderProgress.total > 0
                        ? (renderProgress.current / renderProgress.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                अखबार के सभी पन्ने हाई-रेसोल्यूशन इमेज में कन्वर्ट हो रहे हैं। कृपया कुछ सेकंड प्रतीक्षा करें...
              </p>
            </div>
          )}

          {/* Render Error */}
          {renderError && (
            <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-xs font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{renderError}</span>
            </div>
          )}

          {/* Auto-Rendered Pages Gallery */}
          {renderedPages.length > 0 && (
            <div className="md:col-span-2 bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                      <span>अखबार के कुल {renderedPages.length} पृष्ठ तैयार</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        ✓ रेडी टू पब्लिश
                      </span>
                    </h4>
                    <p className="text-[11px] text-stone-500 font-medium">
                      आप किसी भी पेज की इमेज बदल सकते हैं या अतिरिक्त पेज जोड़ सकते हैं।
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addExtraPagesInputRef.current?.click()}
                    className="bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>➕ नया पेज जोड़ें (इमेज)</span>
                  </button>
                  <div className="text-xs font-bold text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                    <Layers className="w-4 h-4 text-[#EA580C]" />
                    <span>कुल पृष्ठ: {renderedPages.length}</span>
                  </div>
                </div>
              </div>

              {/* Grid of Rendered Pages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {renderedPages.map((p) => {
                  const isCover = p.pageNumber === selectedCoverPage;
                  return (
                    <div
                      key={p.pageNumber}
                      className={`group relative bg-white rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                        isCover
                          ? 'border-[#EA580C] ring-2 ring-[#EA580C]/40 shadow-sm'
                          : 'border-stone-200'
                      }`}
                    >
                      {/* Header badge */}
                      <div
                        className={`text-[11px] font-black px-2.5 py-1.5 flex items-center justify-between ${
                          isCover ? 'bg-[#EA580C] text-white' : 'bg-stone-900 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {isCover && <Star className="w-3.5 h-3.5 fill-current text-amber-300" />}
                          <span>पेज {p.pageNumber}</span>
                        </div>
                        {p.isCustomImage ? (
                          <span className="bg-blue-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-xs">
                            ✓ बदली हुई इमेज
                          </span>
                        ) : isCover ? (
                          <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-xs">
                            ★ मुख्य कवर
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-400 font-bold">✓ ऑटो-सेव</span>
                        )}
                      </div>

                      {/* Image Preview */}
                      <div
                        className="relative aspect-[3/4] bg-stone-100 cursor-pointer overflow-hidden"
                        onClick={() => setZoomPage(p)}
                      >
                        <img
                          src={p.previewUrl}
                          alt={`Page ${p.pageNumber}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <span className="bg-black/75 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" /> बड़ा देखें
                          </span>
                        </div>
                      </div>

                      {/* Footer Title & Actions */}
                      <div className="p-2 bg-stone-50 border-t border-stone-100 flex flex-col gap-1.5">
                        <span className="text-[11px] font-black text-stone-800 line-clamp-1 text-center">
                          {p.pageTitle}
                        </span>

                        {isCover ? (
                          <div className="w-full py-1 text-center bg-orange-100 text-[#EA580C] text-[10px] font-black rounded-lg border border-orange-200">
                            ✓ मुख्य कवर पेज
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCoverPage(p.pageNumber);
                            }}
                            className="w-full py-1 text-center bg-white hover:bg-[#EA580C] hover:text-white text-stone-700 text-[10px] font-bold rounded-lg border border-stone-200 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                          >
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>मुख्य पेज बनाएं</span>
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-1 pt-1 border-t border-stone-200/60">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerReplacePage(p.pageNumber);
                            }}
                            className="w-full py-1 px-1 bg-stone-100 hover:bg-stone-800 hover:text-white text-stone-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 border border-stone-200"
                            title="इस पेज के स्थान पर अपनी मनपसंद इमेज लगाएं"
                          >
                            <Upload className="w-3 h-3 text-[#EA580C]" />
                            <span>इमेज बदलें</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRenderedPage(p.pageNumber);
                            }}
                            className="w-full py-1 px-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 border border-red-200"
                            title="इस पेज को हटाएं"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>हटाएं</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-1">Description (विवरण)</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="अखबार का मुख्य आकर्षण या विवरण दर्ज करें..."
              className="w-full p-3 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#EA580C]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading || renderingPages}
            className="bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Draft (ड्राफ्ट सेव करें)
          </button>

          <button
            type="submit"
            disabled={loading || renderingPages}
            className="bg-[#EA580C] hover:bg-orange-700 disabled:opacity-50 text-white font-black text-sm px-7 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Zap className="w-4 h-4 text-amber-300" />
            )}
            <span>
              {renderingPages
                ? `पेज तैयार हो रहे हैं (${renderProgress.current}/${renderProgress.total})...`
                : loading
                ? 'अखबार व पृष्ठ सेव हो रहे हैं...'
                : 'Process & Publish Edition (प्रोसेस व पब्लिश करें)'}
            </span>
          </button>
        </div>
      </form>

      {/* Modal for Zoom Preview */}
      {zoomPage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoomPage(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm">{zoomPage.pageTitle} (प्रिव्यू)</span>
                {zoomPage.pageNumber === selectedCoverPage && (
                  <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> मुख्य कवर
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerReplacePage(zoomPage.pageNumber)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-stone-700"
                  title="इस पेज के स्थान पर अपनी इमेज अपलोड करें"
                >
                  <Upload className="w-3 h-3 text-[#EA580C]" />
                  <span>इमेज बदलें</span>
                </button>

                {zoomPage.pageNumber !== selectedCoverPage && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCoverPage(zoomPage.pageNumber);
                    }}
                    className="bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Star className="w-3 h-3 fill-current" />
                    <span>इसे मुख्य पेज बनाएं</span>
                  </button>
                )}
                <button
                  onClick={() => setZoomPage(null)}
                  className="p-1 hover:bg-stone-800 rounded-lg text-stone-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[80vh] flex items-center justify-center bg-stone-100">
              <img
                src={zoomPage.previewUrl}
                alt={zoomPage.pageTitle}
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs for replacing page image and adding extra pages */}
      <input
        ref={replacePageInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={(e) => handleReplacePageFile(e.target.files?.[0] || null)}
      />
      <input
        ref={addExtraPagesInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={(e) => handleAddExtraPages(e.target.files)}
      />
    </div>
  );
}

