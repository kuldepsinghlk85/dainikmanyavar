'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, FolderArchive, Check, X, Search, RefreshCw } from 'lucide-react';

interface ImageUploadWidgetProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploadWidget({ value, onChange, label = 'मुख्य चित्र (Featured Image)' }: ImageUploadWidgetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveItems, setArchiveItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        alert(data.error || 'अपलोड में त्रुटि हुई');
      }
    } catch (err) {
      alert('फाइल अपलोड करने में समस्या आई');
    }
    setUploading(false);
  };

  const fetchArchive = async () => {
    try {
      let url = '/api/media';
      if (searchQuery) url += `?q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setArchiveItems(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    if (showArchiveModal) fetchArchive();
  }, [showArchiveModal, searchQuery]);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-extrabold text-stone-900 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-[#EA580C]" />
          <span>{label}</span>
        </span>

        <div className="flex gap-2">
          {/* Native File Upload Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'अपलोड हो रहा है...' : '📷 कंप्यूटर से चुनें'}</span>
          </button>

          {/* Archive Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="bg-stone-800 hover:bg-stone-900 text-white font-extrabold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
            <span>🖼️ आर्काइव से चुनें</span>
          </button>
        </div>
      </label>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Manual URL / Path Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... या /uploads/..."
        className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:border-[#EA580C]"
      />

      {/* Image Preview Box */}
      {value && (
        <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-300 shadow-inner">
          <img src={value} alt="Featured Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md cursor-pointer"
            title="फोटो हटाएं"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Archive Selection Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-[#EA580C]" />
                <span>🖼️ मीडिया आर्काइवर से फोटो चुनें</span>
              </h3>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="आर्काइव में नाम खोजें..."
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs"
              />
            </div>

            {/* Grid of Archived Images */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-3 p-1">
              {archiveItems.map((img) => (
                <div
                  key={img.id}
                  onClick={() => {
                    onChange(img.url);
                    setShowArchiveModal(false);
                  }}
                  className="group relative h-28 rounded-xl overflow-hidden border border-stone-200 cursor-pointer hover:border-[#EA580C] hover:shadow-md transition-all bg-stone-100"
                >
                  <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-1 rounded">चुनें</span>
                  </div>
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-mono text-white bg-black/60 px-1 py-0.5 rounded truncate">
                    {img.filename}
                  </span>
                </div>
              ))}

              {archiveItems.length === 0 && (
                <div className="col-span-full py-12 text-center text-xs text-stone-400 font-bold">
                  आर्काइव में कोई फोटो नहीं मिली। ऊपर बटन से कंप्यूटर से फोटो अपलोड करें।
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
