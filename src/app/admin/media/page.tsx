'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/admin/ImageUploader';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import JSZip from 'jszip';
import {
  Download,
  Archive,
  Search,
  Copy,
  Check,
  Filter,
  Trash2,
  CheckSquare,
  Square,
  X,
  AlertTriangle,
  FolderDown,
  Layers,
} from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  caption?: string;
  altText?: string;
  size: number;
  createdAt: string;
  category?: string;
  tag?: string;
}

export default function MediaLibraryAdminPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'selected' | 'all';
    id?: string;
    filename?: string;
    count: number;
  }>({ type: 'selected', count: 0 });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        setMediaList(data.data || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopyUrl = (id: string, url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Single Image Download
  const handleSingleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  // Bulk ZIP Download
  const handleZipDownload = async (targetItems: MediaItem[], zipTitle: string) => {
    if (targetItems.length === 0) return;
    setZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(zipTitle.replace(/[^a-zA-Z0-9_-]/g, '_'));

      for (const item of targetItems) {
        try {
          const res = await fetch(item.url);
          const blob = await res.blob();
          const cleanName = item.filename || `image_${item.id}.jpg`;
          folder?.file(cleanName, blob);
        } catch (err) {}
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `${zipTitle}.zip`;
      a.click();
    } catch (err) {
      alert('ZIP डाउनलोड में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setZipping(false);
    }
  };

  const categories = useMemo(() => {
    return Array.from(new Set(mediaList.map((m) => m.category).filter(Boolean))) as string[];
  }, [mediaList]);

  const filteredMedia = useMemo(() => {
    return mediaList.filter((m) => {
      const matchesSearch =
        m.filename.toLowerCase().includes(search.toLowerCase()) ||
        (m.caption && m.caption.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [mediaList, search, selectedCategory]);

  // Selection handlers
  const isAllSelected =
    filteredMedia.length > 0 && filteredMedia.every((m) => selectedIds.includes(m.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMedia.map((m) => m.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Trigger Deletion Modal
  const openSingleDelete = (id: string, filename: string) => {
    setDeleteTarget({ type: 'single', id, filename, count: 1 });
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const openSelectedDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget({ type: 'selected', count: selectedIds.length });
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const openAllDelete = () => {
    if (mediaList.length === 0) return;
    setDeleteTarget({ type: 'all', count: mediaList.length });
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  // Perform Permanent Delete
  const handleConfirmPermanentDelete = async (password: string) => {
    setDeleteLoading(true);
    setDeleteError('');

    try {
      let bodyData: any = { password };
      if (deleteTarget.type === 'single' && deleteTarget.id) {
        bodyData.ids = [deleteTarget.id];
      } else if (deleteTarget.type === 'selected') {
        bodyData.ids = selectedIds;
      } else if (deleteTarget.type === 'all') {
        bodyData.all = true;
      }

      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (data.success) {
        if (deleteTarget.type === 'all') {
          setMediaList([]);
          setSelectedIds([]);
        } else if (deleteTarget.type === 'selected') {
          setMediaList((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
          setSelectedIds([]);
        } else if (deleteTarget.type === 'single' && deleteTarget.id) {
          setMediaList((prev) => prev.filter((m) => m.id !== deleteTarget.id));
          setSelectedIds((prev) => prev.filter((x) => x !== deleteTarget.id));
        }

        setDeleteModalOpen(false);
        setSuccessMsg(data.message || 'फोटो स्थायी रूप से डिलीट कर दी गईं');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setDeleteError(data.error || 'डिलीट करने में त्रुटि हुई');
      }
    } catch (err) {
      setDeleteError('नेटवर्क त्रुटि: डिलीट नहीं हो सका');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2.5">
            <span>🖼️ इमेज गैलरी एवं मीडिया हब</span>
            <span className="bg-[#EA580C] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              कुल {mediaList.length} फोटो
            </span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            वेबसाइट की सभी फोटो एक जगह — 1-क्लिक बल्क डाउनलोड, लिंक कॉपी एवं सुरक्षित स्थायी विलोपन
          </p>
        </div>

        {/* Global Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download ALL Photos at Once */}
          <button
            onClick={() => handleZipDownload(mediaList, 'DainikManyawar_All_Photos')}
            disabled={zipping || mediaList.length === 0}
            className="bg-[#16A34A] hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="पूरी गैलरी की सभी फोटो एक बार में ZIP डाउनलोड करें"
          >
            <FolderDown className="w-4 h-4" />
            <span>{zipping ? 'ZIP तैयार हो रहा है...' : `📦 सभी फोटो डाउनलोड करें (${mediaList.length})`}</span>
          </button>

          {/* Delete ALL Photos */}
          {mediaList.length > 0 && (
            <button
              onClick={openAllDelete}
              className="bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="पूरी गैलरी की सभी फोटो हमेशा के लिए डिलीट करें (पासवर्ड सुरक्षित)"
            >
              <Trash2 className="w-4 h-4" />
              <span>सभी फोटो डिलीट करें</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center shadow-xs">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold hover:text-emerald-900 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Image Uploader */}
      <ImageUploader
        label="नया चित्र गैलरी में अपलोड करें"
        onChange={() => fetchMedia()}
      />

      {/* Floating Sticky Multi-Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-30 bg-stone-900 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-stone-800 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#EA580C] text-white text-xs font-bold px-3 py-1 rounded-full">
              {selectedIds.length} चयनित
            </span>
            <span className="text-xs text-stone-300 font-medium hidden sm:inline">
              फोटो पर मल्टीपल एक्शन चुनें:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Download Selected as ZIP */}
            <button
              onClick={() => {
                const target = mediaList.filter((m) => selectedIds.includes(m.id));
                handleZipDownload(target, `DainikManyawar_Selected_${selectedIds.length}_Photos`);
              }}
              disabled={zipping}
              className="bg-[#16A34A] hover:bg-green-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>चयनित डाउनलोड करें ({selectedIds.length})</span>
            </button>

            {/* Delete Selected Permanently */}
            <button
              onClick={openSelectedDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>चयनित स्थायी हटाएं ({selectedIds.length})</span>
            </button>

            {/* Deselect All */}
            <button
              onClick={() => setSelectedIds([])}
              className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>रद्द करें</span>
            </button>
          </div>
        </div>
      )}

      {/* Gallery Controls, Filters & Search */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          {/* Select All Checkbox + Category Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Master Select / Deselect All Button */}
            {filteredMedia.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-black bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg border border-stone-300 transition-colors cursor-pointer"
                title={isAllSelected ? 'सभी का चयन हटाएं' : 'वर्तमान सूची के सभी चित्र चुनें'}
              >
                {isAllSelected ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-[#EA580C]" />
                    <span>सभी हटाएं</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-stone-500" />
                    <span>सभी चुनें ({filteredMedia.length})</span>
                  </>
                )}
              </button>
            )}

            {/* Category Filter Pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-[#F97316]" />
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`text-xs px-3 py-1 rounded-full border font-bold cursor-pointer transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-[#EA580C] text-white border-[#EA580C]'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  सभी ({mediaList.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1 rounded-full border font-bold cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#EA580C] text-white border-[#EA580C]'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="फोटो का नाम या शीर्षक खोजें..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] transition-colors"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Gallery Cards Grid */}
        {filteredMedia.length === 0 ? (
          <div className="p-16 text-center text-stone-400 text-xs font-bold bg-stone-50 rounded-xl border border-dashed border-stone-200">
            कोई फोटो नहीं मिली। ऊपर बटन से नई फोटो अपलोड करें।
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredMedia.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`relative rounded-2xl overflow-hidden bg-white border transition-all duration-200 flex flex-col justify-between shadow-2xs group ${
                    isSelected
                      ? 'border-[#EA580C] ring-2 ring-orange-400/40 shadow-md'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {/* Select Checkbox (Top Left Badge) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(item.id);
                    }}
                    className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-all shadow-sm ${
                      isSelected
                        ? 'bg-[#EA580C] text-white scale-105'
                        : 'bg-white/90 text-stone-400 border border-stone-300 hover:text-stone-700'
                    }`}
                    title={isSelected ? 'चयन हटाएं' : 'चुनें'}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-xs" />
                    )}
                  </div>

                  {/* Image Preview Container */}
                  <div
                    onClick={() => toggleSelectItem(item.id)}
                    className="relative w-full h-36 bg-stone-100 cursor-pointer overflow-hidden"
                  >
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>

                  {/* Card Metadata */}
                  <div className="p-2.5 text-[11px] text-stone-700 space-y-1">
                    <p
                      className="font-bold text-stone-900 truncate font-mono"
                      title={item.filename}
                    >
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                      <span>
                        {item.size ? `${Math.round(item.size / 1024)} KB` : 'इमेज'}
                      </span>
                      <span>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('hi-IN')
                          : ''}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Buttons Row */}
                  <div className="p-2 bg-stone-50 border-t border-stone-100 flex items-center gap-1">
                    {/* Single Download */}
                    <button
                      onClick={() => handleSingleDownload(item.url, item.filename)}
                      className="flex-1 bg-white hover:bg-orange-50 text-stone-700 hover:text-[#EA580C] border border-stone-200 text-[10px] font-bold py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="डाउनलोड करें"
                    >
                      <Download className="w-3 h-3" />
                      <span>डाउनलोड</span>
                    </button>

                    {/* Copy URL */}
                    <button
                      onClick={() => handleCopyUrl(item.id, item.url)}
                      className="bg-white hover:bg-stone-200 text-stone-700 border border-stone-200 p-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      title="इमेज URL कॉपी करें"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Single Permanent Delete */}
                    <button
                      onClick={() => openSingleDelete(item.id, item.filename)}
                      className="bg-white hover:bg-red-50 text-stone-400 hover:text-red-600 border border-stone-200 hover:border-red-300 p-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      title="स्थायी रूप से हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Safety Confirmation Modal with Password Protection */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleteLoading) setDeleteModalOpen(false);
        }}
        onConfirm={handleConfirmPermanentDelete}
        title="⚠️ फोटो स्थायी विलोपन सुरक्षा (Permanent Delete)"
        question={
          deleteTarget.type === 'all'
            ? `क्या आप वास्तव में पूरी गैलरी की सभी ${deleteTarget.count} फोटो को स्थायी रूप से (डेटाबेस और सर्वर डिस्क दोनों से) डिलीट करना चाहते हैं?`
            : deleteTarget.type === 'selected'
            ? `क्या आप वास्तव में चयनित ${deleteTarget.count} फोटो को स्थायी रूप से (डेटाबेस और सर्वर डिस्क दोनों से) डिलीट करना चाहते हैं?`
            : `क्या आप वास्तव में "${deleteTarget.filename || 'इस फोटो'}" को स्थायी रूप से डिलीट करना चाहते हैं?`
        }
        itemCount={deleteTarget.count}
        isPermanent={true}
        loading={deleteLoading}
        errorMessage={deleteError}
      />
    </div>
  );
}

