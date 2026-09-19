'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Calendar,
  Search,
  FileText,
  Volume2,
  X,
} from 'lucide-react';
import { getPublicSiteUrl } from '@/lib/utils';
import VoiceInputButton from '@/components/public/VoiceInputButton';

interface PageItem {
  id: string;
  pageNumber: number;
  pageTitle: string;
  pageImage: string;
  thumbnailImage?: string;
  extractedText?: string | null;
}

interface AdItem {
  id: string;
  position: string;
  pageNumber?: number;
  imageUrl: string;
  targetUrl?: string;
}

interface Edition {
  id: string;
  title: string;
  editionDate: string | Date;
  editionType: string;
  pdfUrl?: string | null;
  coverImage?: string | null;
  totalPages: number;
  pages: PageItem[];
  ads?: AdItem[];
}

interface FlipbookProps {
  edition: Edition;
}

export default function EpaperFlipbookViewer({ edition }: FlipbookProps) {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Touch Swipe Handling for Mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalPages = edition.pages?.length || edition.totalPages || 8;

  // Helper to get real page image
  const getPageImage = (pageNum: number) => {
    const found = edition.pages?.find((p) => p.pageNumber === pageNum);
    if (found?.pageImage && found.pageImage.trim() !== '') {
      return found.pageImage;
    }
    if (pageNum === 3 || pageNum === 8) {
      return `/uploads/epaper/pages/page_${pageNum}.jpg`;
    }
    return `/uploads/epaper/pages/page_${pageNum}.png`;
  };

  const activePageObj = edition.pages?.find((p) => p.pageNumber === currentPage) || {
    id: `p-${currentPage}`,
    pageNumber: currentPage,
    pageTitle: `पेज ${currentPage}`,
    pageImage: getPageImage(currentPage),
    extractedText: 'इस पृष्ठ का विस्तृत विवरण ई-पेपर में देखा जा सकता है।',
  };
  // Ads
  const topAd = edition.ads?.find((a) => a.position === 'top_banner');
  const pageAd = edition.ads?.find((a) => a.position === 'page_specific' && a.pageNumber === currentPage);

  // Search Results inside newspaper pages
  const searchResults = searchQuery.trim()
    ? edition.pages?.filter(
        (p) =>
          p.pageTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.extractedText && p.extractedText.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Log page view analytics
  useEffect(() => {
    if (!mounted) return;
    try {
      fetch('/api/epaper/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editionId: edition.id,
          pageNumber: currentPage,
          deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
          readingTime: 15,
        }),
      }).catch(() => {});
    } catch (err) {}
  }, [currentPage, edition.id, mounted]);

  const handleNextPage = () => {
    if (currentPage < totalPages && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsFlipping(false);
      }, 250);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsFlipping(false);
      }, 250);
    }
  };

  // Keyboard Arrow Navigation
  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextPage();
      if (e.key === 'ArrowLeft') handlePrevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, isFlipping, mounted]);

  // Touch Gestures for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (diffX > 50) handleNextPage();
    else if (diffX < -50) handlePrevPage();

    setTouchStartX(null);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownloadPdf = () => {
    const pdfUrl = edition.pdfUrl || '/uploads/epaper/1788500061593_manyavar_varanasi_5sept.pdf';
    window.open(pdfUrl, '_blank');
  };

  const handleShare = () => {
    const siteUrl = getPublicSiteUrl();
    const isMobile = typeof window !== 'undefined' && window.location.pathname.startsWith('/mobile');
    const shareUrl = `${siteUrl}${isMobile ? '/mobile/epaper' : '/epaper'}`;
    const dateStr = edition?.editionDate ? new Date(edition.editionDate).toLocaleDateString('hi-IN') : 'आज का';
    const text = `*दैनिक मान्यवर*\nआज का ई-पेपर (${dateStr}) ऑनलाइन पढ़ें:\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReadAudio = () => {
    if (!activePageObj?.extractedText) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activePageObj.extractedText);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-stone-900 text-white min-h-[75vh] rounded-3xl flex items-center justify-center border border-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-400 text-sm font-bold">ई-पेपर लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      suppressHydrationWarning
      className={`bg-[#0f1013] text-white flex flex-col justify-between select-none ${
        isFullscreen ? 'h-screen w-screen p-0' : 'min-h-[88vh] rounded-3xl overflow-hidden border border-stone-800 shadow-2xl'
      }`}
    >
      {/* Top Banner Advertisement */}
      {topAd && (
        <div className="bg-stone-950 p-2 text-center border-b border-stone-800 flex justify-center items-center">
          <a href={topAd.targetUrl || '#'} target="_blank" rel="noreferrer" className="inline-block max-h-12 overflow-hidden">
            <img src={topAd.imageUrl} alt="Advertisement" className="h-10 w-auto object-contain rounded" />
          </a>
        </div>
      )}

      {/* Sleek, Minimalist & Precise Top Header */}
      <div className="bg-stone-950/95 backdrop-blur-md px-3 sm:px-5 py-2.5 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs z-30">
        {/* Left: Edition Info */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="bg-[#EA580C] text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow-xs">
            {edition.editionType || 'दैनिक'}
          </span>
          <h2 className="font-extrabold text-stone-100 text-xs sm:text-sm truncate">
            {edition.title}
          </h2>
          <span className="text-stone-500 hidden md:inline text-[11px] font-mono">
            {new Date(edition.editionDate).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Center: Sleek Page Stepper Pill */}
        <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl px-2 py-1 shadow-xs">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-1 text-stone-300 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-stone-300 transition-colors cursor-pointer"
            title="पिछला पेज"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-2">
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
              className="bg-transparent text-amber-400 font-mono font-black text-xs focus:outline-none cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n} className="bg-stone-900 text-white">
                  पेज {n}
                </option>
              ))}
            </select>
            <span className="text-stone-500 font-mono text-[11px] font-bold">/ {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1 text-stone-300 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-stone-300 transition-colors cursor-pointer"
            title="अगला पेज"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Clean, Unified Toolbar */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom Out */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="p-1.5 sm:p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="छोटा करें (Zoom Out -)"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Zoom Level Indicator / Reset */}
          {zoomLevel !== 1 && (
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 bg-[#EA580C] hover:bg-orange-700 rounded-lg text-[10px] font-mono font-bold text-white cursor-pointer"
              title="रीसेट करें"
            >
              100%
            </button>
          )}

          {/* Zoom In */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className="p-1.5 sm:p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="बड़ा करें (Zoom In +)"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Search inside text */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-1.5 sm:p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
            title="अखबार में शब्द खोजें"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* OCR text reader */}
          <button
            onClick={() => setShowTextModal(true)}
            className="p-1.5 sm:p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
            title="पेज का टेक्स्ट पढ़ें व सुनें"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            className="p-1.5 sm:p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-orange-400 rounded-lg transition-colors cursor-pointer"
            title="मूल PDF डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleShare}
            className="p-1.5 sm:p-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
            title="व्हाट्सएप पर शेयर करें"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="फुलस्क्रीन"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>

      {/* Search Inside Newspaper Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>अखबार के अंदर शब्द खोजें (Search Newspaper)</span>
              </h3>
              <button onClick={() => setShowSearchModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="उदा. प्रधानमंत्री, वाराणसी, जौनपुर, विकास, खेल..."
                className="w-full p-3 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#EA580C]"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <VoiceInputButton
                  onTranscript={(txt) => setSearchQuery(txt)}
                  currentValue={searchQuery}
                  placeholderHint="शब्द बोलिए..."
                  size="sm"
                  className="text-slate-400 hover:text-white"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
              {searchResults?.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setCurrentPage(p.pageNumber);
                    setShowSearchModal(false);
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={getPageImage(p.pageNumber)} alt={p.pageTitle} className="w-8 h-10 object-cover rounded border border-stone-700" />
                    <div>
                      <span className="bg-[#EA580C] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                        पेज {p.pageNumber}
                      </span>
                      <p className="font-extrabold text-xs text-stone-200 mt-1 line-clamp-1">{p.pageTitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </div>
              ))}

              {searchQuery && searchResults.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">कोई परिणाम नहीं मिला</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OCR Page Text Reader Modal */}
      {showTextModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="bg-[#EA580C] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  पेज {currentPage}
                </span>
                <h3 className="font-extrabold text-amber-400 text-sm mt-1">{activePageObj?.pageTitle}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReadAudio}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>ऑडियो सुनें</span>
                </button>

                <button onClick={() => setShowTextModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 rounded-xl border border-slate-800 text-stone-200 text-xs leading-relaxed space-y-3 whitespace-pre-line font-sans">
              {activePageObj?.extractedText || 'इस पृष्ठ का टेक्स्ट एक्सट्रैक्शन उपलब्ध नहीं है।'}
            </div>
          </div>
        </div>
      )}

      {/* Main Newspaper Stage Area — Large, Immersive, Minimalist */}
      <div
        className="relative flex-1 bg-[#111215] flex items-center justify-center p-1 sm:p-3 overflow-auto min-h-[640px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sleek Floating Left Arrow Button */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`absolute left-2 sm:left-5 z-20 w-10 sm:w-12 h-16 sm:h-20 rounded-2xl bg-black/40 hover:bg-[#EA580C] text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-all flex items-center justify-center cursor-pointer shadow-2xl ${
            currentPage === 1 ? 'opacity-0 pointer-events-none' : 'hover:scale-105 active:scale-95'
          }`}
          title="पिछला पेज (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Real Newspaper Page Container */}
        <div className="relative w-full max-w-5xl 2xl:max-w-6xl flex items-center justify-center transition-all duration-300">
          <div
            className={`relative transition-all duration-300 shadow-2xl rounded-sm overflow-hidden bg-white border border-stone-800/60 ${
              isFlipping
                ? flipDirection === 'next'
                  ? 'animate-flip-next rotate-y-6 opacity-75'
                  : 'animate-flip-prev -rotate-y-6 opacity-75'
                : 'opacity-100'
            }`}
            style={{
              transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
              transformOrigin: 'top center',
            }}
          >
            {/* Real Newspaper Scanned High-Res Page Image */}
            <img
              key={`page-${currentPage}`}
              src={getPageImage(currentPage)}
              alt={`दैनिक मान्यवर - पेज ${currentPage} / ${totalPages}`}
              className="max-h-[85vh] w-auto max-w-full object-contain mx-auto select-none pointer-events-auto shadow-inner cursor-zoom-in"
              loading="eager"
              onClick={() => setZoomLevel((z) => (z === 1 ? 1.4 : 1))}
              title="क्लिक करके ज़ूम करें"
            />

            {/* Page Specific Overlay Advertisement */}
            {pageAd && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-stone-950/90 p-2 rounded-xl border border-amber-500/50 shadow-2xl max-w-xs">
                <a href={pageAd.targetUrl || '#'} target="_blank" rel="noreferrer">
                  <img src={pageAd.imageUrl} alt="Ad" className="w-full h-16 object-cover rounded-lg" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sleek Floating Right Arrow Button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`absolute right-2 sm:right-5 z-20 w-10 sm:w-12 h-16 sm:h-20 rounded-2xl bg-black/40 hover:bg-[#EA580C] text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-all flex items-center justify-center cursor-pointer shadow-2xl ${
            currentPage === totalPages ? 'opacity-0 pointer-events-none' : 'hover:scale-105 active:scale-95'
          }`}
          title="अगला पेज (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

      {/* Sleek Bottom Thumbnail Bar */}
      <div className="bg-stone-950/95 backdrop-blur-md px-3 py-2 border-t border-stone-800/80 flex items-center justify-between gap-3 text-xs z-30">
        <div className="text-[11px] font-extrabold text-stone-400 hidden sm:flex items-center gap-1.5">
          <span>{activePageObj?.pageTitle || `पेज ${currentPage}`}</span>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex items-center gap-2 overflow-x-auto mx-auto no-scrollbar py-0.5 max-w-full">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
            const isCur = currentPage === pNum;
            return (
              <button
                key={pNum}
                onClick={() => setCurrentPage(pNum)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex-shrink-0 ${
                  isCur
                    ? 'bg-[#EA580C] border-[#EA580C] text-white shadow-sm ring-1 ring-orange-400'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
                title={`पेज ${pNum}`}
              >
                <div className="w-5 h-7 bg-stone-800 rounded-xs overflow-hidden relative border border-stone-700/60 flex-shrink-0">
                  <img
                    src={getPageImage(pNum)}
                    alt={`पेज ${pNum}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] font-mono font-bold leading-none">
                  {pNum}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-stone-500 hidden sm:block">
          कुल पृष्ठ: {totalPages}
        </div>
      </div>
    </div>
  );
}
