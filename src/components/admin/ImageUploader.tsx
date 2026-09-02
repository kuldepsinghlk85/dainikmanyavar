'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, Link as LinkIcon, Check, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value = '', onChange, label = 'मुख्य चित्र (Featured Image)' }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media', {
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

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setMessage('चित्र URL सुरक्षित हुआ!');
    }
  };

  return (
    <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
      <label className="block text-xs font-bold text-stone-700">{label}</label>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`text-xs font-bold px-3 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-[#F97316] text-white'
              : 'bg-white text-stone-600 border border-stone-300 hover:bg-stone-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>कंप्यूटर से अपलोड करें</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`text-xs font-bold px-3 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'url'
              ? 'bg-[#F97316] text-white'
              : 'bg-white text-stone-600 border border-stone-300 hover:bg-stone-100'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>चित्र URL दर्ज करें</span>
        </button>
      </div>

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-[#C2410C] hover:file:bg-orange-200 cursor-pointer"
          />
          {uploading && <p className="text-xs text-[#F97316] font-semibold animate-pulse">चित्र अपलोड हो रहा है...</p>}
        </div>
      )}

      {/* URL Tab */}
      {activeTab === 'url' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://domain.com/image.jpg"
            className="flex-1 p-2 text-xs border border-stone-300 rounded focus:outline-none focus:border-[#F97316]"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="bg-[#EA580C] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-700"
          >
            सेट करें
          </button>
        </div>
      )}

      {message && <p className="text-[11px] font-semibold text-green-700">{message}</p>}

      {/* Image Preview */}
      {value && (
        <div className="mt-3 relative w-full h-36 rounded-lg overflow-hidden border border-stone-300 bg-white">
          <Image src={value} alt="Preview" fill className="object-cover" />
          <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono truncate max-w-[200px]">
            {value}
          </div>
        </div>
      )}
    </div>
  );
}
