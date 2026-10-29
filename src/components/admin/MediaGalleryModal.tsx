'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  FolderOpen,
  Filter,
  Loader2,
  ZoomIn,
  Grid,
  LayoutGrid,
  Maximize2
} from 'lucide-react';

export interface MediaGalleryItem {
  id: string;
  filename: string;
  originalName?: string | null;
  mimeType?: string | null;
  size: number;
  url: string;
  category?: string | null;
  caption?: string | null;
  altText?: string | null;
  createdAt: string;
}

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, caption?: string) => void;
  title?: string;
  categoryHint?: string;
  currentSelectedUrl?: string;
}

export default function MediaGalleryModal({
  isOpen,
  onClose,
  onSelect,
  title = '🖼️ इमेज व मीडिया गैलरी से फोटो चुनें',
  categoryHint = 'ALL',
  currentSelectedUrl = '',
}: MediaGalleryModalProps) {
  const [items, setItems] = useState<MediaGalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryHint);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentSelectedUrl);
  const [selectedCaption, setSelectedCaption] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<'large' | 'medium'>('large'); // default large for clear visibility
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media from /api/media
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (err) {
      console.error('Failed to load gallery photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentSelectedUrl || '');
      fetchMedia();
    }
  }, [isOpen, currentSelectedUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (zoomedUrl) {
          setZoomedUrl(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, zoomedUrl, onClose]);

  // Upload a new photo directly into gallery
  const handleUploadNew = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory === 'ALL' ? 'सामान्य' : selectedCategory);
      formData.append('caption', file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        const newItem: MediaGalleryItem = {
          id: data.mediaId || String(Date.now()),
          filename: data.filename || file.name,
          originalName: file.name,
          mimeType: data.mimeType || file.type,
          size: data.size || file.size,
          url: data.url,
          category: selectedCategory === 'ALL' ? 'सामान्य' : selectedCategory,
          caption: file.name,
          createdAt: new Date().toISOString(),
        };
        setItems((prev) => [newItem, ...prev]);
        setSelectedUrl(data.url);
        setSelectedCaption(file.name);
      } else {
        setUploadError(data.error || 'फोटो अपलोड विफल रहा।');
      }
    } catch (err: any) {
      setUploadError(err.message || 'फोटो अपलोड में त्रुटि हुई।');
    } finally {
      setUploading(false);
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim());
      }
    });
    return ['ALL', ...Array.from(set)];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.filename && item.filename.toLowerCase().includes(q)) ||
        (item.originalName && item.originalName.toLowerCase().includes(q)) ||
        (item.caption && item.caption.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));

      const matchCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [items, search, selectedCategory]);

  const handleConfirmSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl, selectedCaption);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-stone-200 flex flex-col h-[92vh] max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/30 text-[#EA580C] border border-orange-500/40 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {items.length} फोटो उपलब्ध
                </span>
              </h3>
              <p className="text-[11px] text-stone-300">
                अपनी पसंदीदा फोटो पर क्लिक करके तुरंत लगाएं या नई फोटो अपलोड करें
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="बंद करें (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filters, Size Switcher, Upload */}
        <div className="p-3 sm:p-4 bg-stone-50 border-b border-stone-200 space-y-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="गैलरी में फोटो खोजें (नाम, कैप्शन या श्रेणी)..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:border-[#EA580C] focus:ring-1 focus:ring-orange-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Size & Upload Actions */}
            <div className="flex items-center gap-2">
              {/* Photo Size Switcher (Fulfills: गैलरी में फोटो बहुत छोटे साइज की है, दिख नहीं रही है) */}
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-xl border border-stone-300">
                <button
                  type="button"
                  onClick={() => setGridSize('large')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                    gridSize === 'large'
                      ? 'bg-white text-stone-950 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="फोटो बड़ा दिखाएं (Large Cards)"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>बड़ा आकार</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGridSize('medium')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                    gridSize === 'medium'
                      ? 'bg-white text-stone-950 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="मध्यम आकार (Medium Cards)"
                >
                  <Grid className="w-3.5 h-3.5 text-stone-600" />
                  <span>मध्यम</span>
                </button>
              </div>

              {/* Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadNew(f);
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3.5 py-2 bg-[#EA580C] hover:bg-orange-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                title="कंप्यूटर या फोन से सीधे गैलरी में नई फोटो अपलोड करें"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>अपलोड हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ नई फोटो अपलोड करें</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={fetchMedia}
                disabled={loading}
                className="p-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
                title="गैलरी रिफ्रेश करें"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#EA580C]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1 shrink-0 mr-1">
                <Filter className="w-3 h-3" />
                <span>श्रेणी:</span>
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cat === 'ALL' ? 'सभी फोटो' : cat}
                </button>
              ))}
            </div>
          )}

          {uploadError && (
            <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 p-2 rounded-xl flex items-center justify-between">
              <span>⚠️ {uploadError}</span>
              <button onClick={() => setUploadError(null)} className="font-black">✕</button>
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-stone-100/60">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#EA580C] mx-auto" />
              <p className="text-xs font-bold text-stone-600">गैलरी की तस्वीरें लोड हो रही हैं...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#EA580C] border border-orange-200 flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black text-stone-800">कोई फोटो नहीं मिली</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {search
                  ? `"${search}" से संबंधित कोई फोटो उपलब्ध नहीं है। कृपया दूसरा शब्द खोजें।`
                  : 'गैलरी में अभी कोई फोटो मौजूद नहीं है। ऊपर दिए गए बटन से नई फोटो अपलोड करें।'}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EA580C] text-white text-xs font-black rounded-xl hover:bg-orange-700"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>अभी फोटो अपलोड करें</span>
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-4 sm:gap-5 ${
                gridSize === 'large'
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}
            >
              {filteredItems.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedUrl(item.url);
                      setSelectedCaption(item.caption || item.originalName || '');
                    }}
                    onDoubleClick={() => {
                      setSelectedUrl(item.url);
                      setSelectedCaption(item.caption || item.originalName || '');
                      onSelect(item.url, item.caption || item.originalName || '');
                      onClose();
                    }}
                    className={`group relative bg-white rounded-2xl border-2 overflow-hidden transition-all cursor-pointer flex flex-col shadow-xs hover:shadow-xl ${
                      isSelected
                        ? 'border-[#EA580C] ring-4 ring-orange-500/30 shadow-md'
                        : 'border-stone-200 hover:border-orange-400'
                    }`}
                    title="चुनने के लिए क्लिक करें, तुरंत लगाने के लिए डबल-क्लिक करें"
                  >
                    {/* Fixed Height Image Container - 100% visible guaranteed */}
                    <div
                      className={`relative w-full bg-stone-200 overflow-hidden shrink-0 flex items-center justify-center ${
                        gridSize === 'large' ? 'h-52 sm:h-60' : 'h-40 sm:h-48'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.caption || item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#EA580C] text-white text-xs font-black flex items-center gap-1 shadow-lg">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>चयनित</span>
                        </div>
                      )}

                      {/* Zoom Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedUrl(item.url);
                        }}
                        className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/70 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs shadow-md"
                        title="फोटो को फुल स्क्रीन बड़ा देखें"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      {/* Category Badge */}
                      {item.category && item.category !== 'सामान्य' && (
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-black px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Metadata Box */}
                    <div className="p-3 flex-1 flex flex-col justify-between bg-white border-t border-stone-100">
                      <div>
                        <p
                          className="text-xs font-black text-stone-900 line-clamp-1 truncate"
                          title={item.caption || item.filename}
                        >
                          {item.caption || item.filename}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2 pt-2 border-t border-stone-100 font-mono">
                        <span className="font-bold text-stone-700">
                          {item.size ? `${Math.round(item.size / 1024)} KB` : 'इमेज'}
                        </span>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Selected Preview & Action Buttons */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-xs">
          {/* Selected Preview Info */}
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            {selectedUrl ? (
              <>
                <div
                  onClick={() => setZoomedUrl(selectedUrl)}
                  className="relative w-16 h-14 rounded-xl overflow-hidden bg-stone-100 border-2 border-[#EA580C] shrink-0 cursor-pointer shadow-xs group"
                  title="क्लिक करके बड़ा देखें"
                >
                  <img
                    src={selectedUrl}
                    alt="Selected"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>फोटो चयनित (Selected)</span>
                  </span>
                  <span className="text-xs font-black text-stone-900 truncate block max-w-sm sm:max-w-md font-mono mt-0.5">
                    {selectedUrl.split('/').pop()}
                  </span>
                  <span className="text-[10px] text-stone-400 block truncate">
                    {selectedCaption || 'मुख्य मीडिया चित्र'}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs text-stone-500 font-bold italic flex items-center gap-1.5">
                <span>👉</span>
                <span>ऊपर गैलरी से किसी भी फोटो पर क्लिक करके चुनें (या डबल-क्लिक करें)</span>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              रद्द करें
            </button>

            <button
              type="button"
              onClick={handleConfirmSelect}
              disabled={!selectedUrl}
              className="px-6 py-2.5 bg-[#EA580C] hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:cursor-not-allowed active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>✓ यह फोटो लगाएं (Use This Photo)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Resolution Zoom Lightbox Modal */}
      {zoomedUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomedUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={zoomedUrl}
              alt="Zoomed"
              className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain border border-stone-700"
            />
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedUrl(zoomedUrl);
                  onSelect(zoomedUrl);
                  setZoomedUrl(null);
                  onClose();
                }}
                className="px-5 py-2 bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>✓ यह फोटो चुनें और लगाएं</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomedUrl(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                बंद करें (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
