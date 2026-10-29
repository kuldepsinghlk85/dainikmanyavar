'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Copy,
  CheckCheck,
  FolderOpen
} from 'lucide-react';
import MediaGalleryModal from '@/components/admin/MediaGalleryModal';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  category?: string;
}

export default function ImageUploader({
  value = '',
  onChange,
  label = 'मुख्य चित्र (Featured Image)',
  category = 'सामान्य',
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('caption', file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
        setUrlInput(data.url);
        setMessage('चित्र सफलता से अपलोड हो गया!');
      } else {
        setMessage(data.error || 'अपलोड में त्रुटि हुई।');
      }
    } catch (err) {
      setMessage('अपलोड में समस्या आई।');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setMessage('चित्र URL सुरक्षित हुआ!');
    }
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-black text-stone-800 tracking-tight flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>{label}</span>
        </label>

        {/* Tab & Gallery Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-[#C2410C] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>फ़ाइल अपलोड</span>
          </button>

          {/* Gallery Button: Fulfills 'गैलरी से अपलोड करें का ऑप्शन अवश्य हो' */}
          <button
            type="button"
            onClick={() => setShowGalleryModal(true)}
            className="px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer bg-stone-800 hover:bg-stone-900 text-white shadow-xs"
            title="मीडिया गैलरी से फोटो चुनें या गैलरी में अपलोड करें"
          >
            <FolderOpen className="w-3 h-3 text-orange-400" />
            <span>🖼️ गैलरी से चुनें</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-[#C2410C] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>इमेज URL</span>
          </button>
        </div>
      </div>

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-2">
          {value ? (
            <div className="p-3 bg-white border-2 border-dashed border-green-500/80 rounded-2xl space-y-3">
              {/* Top Row: Thumbnail + File Info + Quick Actions */}
              <div className="flex items-center gap-3">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-2xs block group/img"
                  title="बड़ी फोटो देखने के लिए क्लिक करें"
                >
                  <Image
                    src={value}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover group-hover/img:scale-105 transition-transform"
                  />
                </a>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-black">
                      <Check className="w-3 h-3 text-green-600" />
                      <span>सक्रिय है</span>
                    </span>
                  </div>
                  <p
                    className="text-xs font-bold text-stone-900 font-mono truncate mt-1 max-w-[200px]"
                    title={value.split('/').pop()}
                  >
                    {value.split('/').pop()}
                  </p>
                </div>

                {/* Quick Actions: Copy URL & Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    title="URL कॉपी करें"
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setUrlInput('');
                    }}
                    className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs cursor-pointer transition-colors"
                    title="फोटो हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons Toolbar Row */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="w-full px-2 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-2xs truncate"
                  title="मीडिया गैलरी से कोई दूसरी फोटो चुनें"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="truncate">गैलरी से बदलें</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-2 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#C2410C] border border-orange-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-2xs truncate"
                  title="कंप्यूटर से नई फोटो अपलोड करें"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">कंप्यूटर से बदलें</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: Computer / Mobile File Picker */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-[#EA580C] bg-orange-50'
                    : 'border-stone-300 hover:border-[#EA580C] bg-white hover:bg-orange-50/20'
                }`}
              >
                <Upload className={`w-6 h-6 transition-colors ${isDragging ? 'text-[#EA580C]' : 'text-[#EA580C]'}`} />
                <div>
                  <p className="text-xs font-black text-stone-800">
                    {uploading ? 'चित्र अपलोड हो रहा है...' : 'कंप्यूटर / मोबाइल से फोटो अपलोड करें'}
                  </p>
                  <p className="text-[10px] text-stone-500 font-medium">
                    क्लिक करें या फोटो ड्रैग-ड्रॉप करें
                  </p>
                </div>
              </div>

              {/* Option B: Gallery Picker Button */}
              <div
                onClick={() => setShowGalleryModal(true)}
                className="border-2 border-dashed border-stone-300 hover:border-stone-800 p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all flex flex-col items-center justify-center bg-white hover:bg-stone-100/70 group"
              >
                <div className="w-8 h-8 rounded-xl bg-stone-900 text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-stone-900 group-hover:text-[#EA580C] transition-colors">
                    🖼️ गैलरी से अपलोड करें / चुनें
                  </p>
                  <p className="text-[10px] text-stone-500 font-medium">
                    वेबसाइट की मीडिया गैलरी से फोटो लगाएं
                  </p>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            disabled={uploading}
            className="hidden"
          />
        </div>
      )}

      {/* URL Tab */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/banner.jpg या /uploads/image.png"
              className="flex-1 p-2.5 text-xs font-mono border border-stone-300 rounded-xl bg-white focus:outline-hidden focus:border-[#EA580C]"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="bg-[#EA580C] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-700 cursor-pointer shadow-xs transition-colors"
            >
              लागू करें
            </button>
          </div>
          {value && (
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-stone-200 bg-white">
              <Image src={value} alt="Preview" fill unoptimized className="object-contain" />
            </div>
          )}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
          <Check className="w-3.5 h-3.5 text-green-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Media Gallery Modal */}
      <MediaGalleryModal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        onSelect={(url) => {
          onChange(url);
          setUrlInput(url);
          setShowGalleryModal(false);
          setMessage('गैलरी से चित्र सफलतापूर्वक चयनित किया गया!');
          setTimeout(() => setMessage(''), 3000);
        }}
        title="🖼️ मीडिया गैलरी से फोटो चुनें"
        currentSelectedUrl={value}
      />
    </div>
  );
}
