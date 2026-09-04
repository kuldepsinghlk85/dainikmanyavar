'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Link as LinkIcon, Check, Image as ImageIcon, Trash2, RefreshCw, Copy, CheckCheck } from 'lucide-react';

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

        {/* Tab Switcher */}
        <div className="flex bg-stone-200/80 p-0.5 rounded-lg text-[11px] font-bold">
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
        <div>
          {value ? (
            <div className="p-3 bg-white border-2 border-dashed border-green-500/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 h-14 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                  <Image
                    src={value}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 font-mono truncate max-w-[220px]">
                    {value.split('/').pop()}
                  </p>
                  <p className="text-[10px] text-green-700 font-bold mt-0.5">✓ चित्र सक्रिय है</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="URL कॉपी करें"
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#C2410C] rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>बदलें</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setUrlInput('');
                  }}
                  className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs cursor-pointer transition-colors"
                  title="हटाएं"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-6 rounded-2xl text-center space-y-2 cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#EA580C] bg-orange-50'
                  : 'border-stone-300 hover:border-[#EA580C] bg-white hover:bg-orange-50/20'
              }`}
            >
              <Upload className={`w-7 h-7 mx-auto transition-colors ${isDragging ? 'text-[#EA580C]' : 'text-stone-400'}`} />
              <div>
                <p className="text-xs font-black text-stone-800">
                  {uploading ? 'चित्र अपलोड हो रहा है...' : 'यहाँ क्लिक करें या इमेज ड्रैग करके छोड़ें (Drag & Drop)'}
                </p>
                <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                  समर्थित प्रारूप: PNG, JPG, JPEG, WebP, GIF (अधिकतम 10MB)
                </p>
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
              className="flex-1 p-2.5 text-xs font-mono border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-[#F97316]"
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
    </div>
  );
}
