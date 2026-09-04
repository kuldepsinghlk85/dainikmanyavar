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
    const text = `दैनिक मान्यवर आज का ई-पेपर (${new Date(edition.editionDate).toLocaleDateString('hi-IN')}) ऑनलाइन पढ़ें: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
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
      className={`bg-stone-900 text-white flex flex-col justify-between select-none ${
        isFullscreen ? 'h-screen w-screen p-0' : 'min-h-[85vh] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl'
      }`}
    >
      {/* Top Banner Advertisement */}
      {topAd && (
        <div className="bg-slate-950 p-2 text-center border-b border-slate-800 flex justify-center items-center">
          <a href={topAd.targetUrl || '#'} target="_blank" rel="noreferrer" className="inline-block max-h-14 overflow-hidden">
            <img src={topAd.imageUrl} alt="Advertisement" className="h-12 w-auto object-contain rounded" />
          </a>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="bg-[#EA580C] text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
            {edition.editionType || 'दैनिक'}
          </span>
          <div>
            <h2 className="font-extrabold text-amber-400 text-sm leading-tight">
              {edition.title} - {activePageObj?.pageTitle || `पेज ${currentPage}`}
            </h2>
            <p className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-orange-400" />
              <span>{new Date(edition.editionDate).toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <span className="text-orange-500 font-bold ml-2">कुल पृष्ठ: {totalPages}</span>
            </p>
          </div>
        </div>

        {/* Top Controls: Search, OCR Text, Zoom & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearchModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">अखबार में खोजें</span>
          </button>

          <button
            onClick={() => setShowTextModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-stone-200 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">पेज पाठ पढ़ें</span>
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4 text-amber-400" />
          </button>

          {zoomLevel !== 1 && (
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2.5 py-1 bg-[#EA580C] hover:bg-orange-700 rounded-xl text-[10px] font-mono font-bold text-white cursor-pointer"
            >
              100% Reset
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Full Screen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4 text-white" />}
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

            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="उदा. प्रधानमंत्री, वाराणसी, जौनपुर, विकास, खेल..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#EA580C]"
            />

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

      {/* Main 3D Newspaper Flipbook Stage Area */}
      <div
        className="relative flex-1 bg-stone-950 flex items-center justify-center p-2 sm:p-6 overflow-auto min-h-[520px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Arrow Button */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`absolute left-3 z-30 p-3 rounded-full bg-slate-900/90 hover:bg-[#EA580C] text-white border border-slate-700 transition-all cursor-pointer shadow-2xl ${
            currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
          }`}
          title="पिछला पेज (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Real Newspaper Page Container with 3D Flip Animation */}
        <div className="relative max-w-4xl w-full flex items-center justify-center transition-all duration-300">
          <div
            className={`relative transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border-2 border-stone-800 bg-white ${
              isFlipping
                ? flipDirection === 'next'
                  ? 'animate-flip-next rotate-y-6 opacity-75'
                  : 'animate-flip-prev -rotate-y-6 opacity-75'
                : 'opacity-100'
            }`}
            style={{
              transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
              transformOrigin: 'center center',
            }}
          >
            {/* Real Newspaper Scanned High-Res Page Image */}
            <img
              key={`page-${currentPage}`}
              src={getPageImage(currentPage)}
              alt={`दैनिक मान्यवर - पेज ${currentPage} / ${totalPages}`}
              className="max-h-[76vh] w-auto object-contain mx-auto select-none pointer-events-auto shadow-inner"
              loading="eager"
            />

            {/* Page Title Tag */}
            <div className="absolute top-2 right-2 bg-slate-950/90 text-amber-400 font-mono text-[11px] font-extrabold px-3 py-1 rounded-full border border-slate-800 shadow-md">
              पेज {currentPage} / {totalPages}
            </div>

            {/* Page Specific Overlay Advertisement */}
            {pageAd && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-950/90 p-2 rounded-xl border border-amber-500/50 shadow-2xl max-w-xs">
                <a href={pageAd.targetUrl || '#'} target="_blank" rel="noreferrer">
                  <img src={pageAd.imageUrl} alt="Ad" className="w-full h-16 object-cover rounded-lg" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`absolute right-3 z-30 p-3 rounded-full bg-slate-900/90 hover:bg-[#EA580C] text-white border border-slate-700 transition-all cursor-pointer shadow-2xl ${
            currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
          }`}
          title="अगला पेज (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Newspaper Controls Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Navigation & Counter */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">पिछला</span>
          </button>

          {/* Page Counter & Direct Select Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-stone-400 font-bold text-[11px]">पेज</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
              className="bg-transparent text-amber-400 font-mono font-bold text-xs focus:outline-none cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n} className="bg-slate-900 text-white">
                  पेज {n}
                </option>
              ))}
            </select>
            <span className="text-stone-400 font-mono font-bold text-[11px]">/ {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-[#EA580C] hover:bg-orange-700 disabled:opacity-30 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
          >
            <span className="hidden sm:inline">अगला</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Thumbnail Page Selector Slider - Visually shows all 8 newspaper pages */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-xs sm:max-w-md lg:max-w-lg no-scrollbar py-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
            const isCur = currentPage === pNum;
            return (
              <button
                key={pNum}
                onClick={() => setCurrentPage(pNum)}
                className={`flex flex-col items-center gap-1 p-1 rounded-lg border transition-all cursor-pointer flex-shrink-0 ${
                  isCur
                    ? 'bg-orange-600/30 border-orange-500 ring-2 ring-orange-500 scale-105'
                    : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                }`}
                title={`पेज ${pNum}`}
              >
                <div className="w-9 h-12 bg-stone-800 rounded overflow-hidden relative border border-stone-700">
                  <img
                    src={getPageImage(pNum)}
                    alt={`पेज ${pNum}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className={`text-[10px] font-mono font-black leading-none ${isCur ? 'text-amber-400' : 'text-stone-400'}`}>
                  {pNum}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: PDF Download & Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="bg-stone-800 hover:bg-stone-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="मूल PDF डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            title="व्हाट्सएप पर शेयर करें"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>शेयर करें</span>
          </button>
        </div>
      </div>
    </div>
  );
}
