'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, FolderOpen, Check, X } from 'lucide-react';
import MediaGalleryModal from '@/components/admin/MediaGalleryModal';

interface ImageUploadWidgetProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploadWidget({
  value,
  onChange,
  label = 'मुख्य चित्र (Featured Image)',
}: ImageUploadWidgetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
        onChange(data.url);
      } else {
        alert(data.error || 'अपलोड में त्रुटि हुई');
      }
    } catch (err) {
      alert('फाइल अपलोड करने में समस्या आई');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-black text-stone-900">
          <ImageIcon className="w-4 h-4 text-[#EA580C]" />
          <span>{label}</span>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Native File Upload Trigger (Computer / Device) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="कंप्यूटर या फोन की फ़ाइल से फोटो अपलोड करें"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'अपलोड हो रहा है...' : '📷 कंप्यूटर से चुनें'}</span>
          </button>

          {/* Gallery Modal Trigger (Fulfills: जहां पर फोटो है, वहां गैलरी से अपलोड करें का ऑप्शन अवश्य हो) */}
          <button
            type="button"
            onClick={() => setShowGalleryModal(true)}
            className="bg-stone-800 hover:bg-stone-900 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer border border-stone-700"
            title="मीडिया गैलरी से कोई भी फोटो चुनें या गैलरी में अपलोड करें"
          >
            <FolderOpen className="w-3.5 h-3.5 text-orange-400" />
            <span>🖼️ गैलरी से अपलोड करें / चुनें</span>
          </button>
        </div>
      </div>

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
        className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-hidden focus:border-[#EA580C]"
      />

      {/* Image Preview Box */}
      {value && (
        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-300 shadow-inner group">
          <img src={value} alt="Featured Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowGalleryModal(true)}
              className="bg-stone-900/90 hover:bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-orange-400" />
              <span>गैलरी से बदलें</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>हटाएं</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md cursor-pointer group-hover:hidden"
            title="फोटो हटाएं"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Media Gallery Modal */}
      <MediaGalleryModal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        onSelect={(url) => {
          onChange(url);
          setShowGalleryModal(false);
        }}
        title="🖼️ मुख्य समाचार चित्र के लिए गैलरी से फोटो चुनें"
        currentSelectedUrl={value}
      />
    </div>
  );
}
