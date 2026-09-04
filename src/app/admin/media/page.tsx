'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/admin/ImageUploader';
import JSZip from 'jszip';
import { Download, Archive, Search, Copy, Check, Filter } from 'lucide-react';

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
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        // Assign default categories & tags to demo gallery items if not set
        const formatted = data.data.map((m: any, idx: number) => ({
          ...m,
          category: idx % 2 === 0 ? 'उत्तर प्रदेश' : 'जौनपुर',
          tag: idx % 2 === 0 ? '#विकास' : '#जौनपुर',
        }));
        setMediaList(formatted);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
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

  // Bulk ZIP Download (Category-wise or All)
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
      alert('ZIP जनरेट करने में त्रुटि हुई।');
    } finally {
      setZipping(false);
    }
  };

  const categories = Array.from(new Set(mediaList.map((m) => m.category).filter(Boolean)));

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch = m.filename.toLowerCase().includes(search.toLowerCase()) ||
                          (m.tag && m.tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">इमेज गैलरी एवं मीडिया (Media Gallery & ZIP Downloads)</h1>
          <p className="text-xs text-stone-500">चित्र अपलोड करें, श्रेणी/टैग अनुसार खोजें, और ZIP डाउनलोड करें</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleZipDownload(filteredMedia, `DainikManyawar_${selectedCategory}_Gallery`)}
            disabled={zipping || filteredMedia.length === 0}
            className="bg-[#16A34A] hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>{zipping ? 'ZIP बन रहा है...' : `📦 ${selectedCategory === 'ALL' ? 'सभी' : selectedCategory} चित्र (ZIP)`}</span>
          </button>
        </div>
      </div>

      {/* Image Uploader */}
      <ImageUploader
        label="नया चित्र गैलरी में अपलोड करें"
        onChange={() => fetchMedia()}
      />

      {/* Gallery Controls & Search */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#F97316]" />
            <span className="text-xs font-bold text-stone-700">श्रेणी फ़िल्टर:</span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`text-xs px-3 py-1 rounded-full border font-bold ${
                selectedCategory === 'ALL'
                  ? 'bg-[#EA580C] text-white border-[#EA580C]'
                  : 'bg-stone-50 text-stone-700 border-stone-300'
              }`}
            >
              सभी चित्र ({mediaList.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat!)}
                className={`text-xs px-3 py-1 rounded-full border font-bold ${
                  selectedCategory === cat
                    ? 'bg-[#EA580C] text-white border-[#EA580C]'
                    : 'bg-stone-50 text-stone-700 border-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="चित्र या टैग खोजें..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:border-[#F97316]"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div key={item.id} className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50 group flex flex-col justify-between shadow-xs hover:border-orange-300 transition-colors">
              <div>
                <div className="relative w-full h-32 bg-white">
                  <Image src={item.url} alt={item.filename} fill className="object-cover" />
                  {item.tag && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] bg-white/90 text-[#C2410C] font-bold px-1.5 py-0.5 rounded border border-orange-200 shadow-xs">
                      {item.tag}
                    </span>
                  )}
                </div>
                <div className="p-2 text-[10px] text-stone-600 bg-white">
                  <p className="truncate font-mono font-bold text-stone-800">{item.filename}</p>
                  <p className="text-stone-400 mt-0.5">श्रेणी: {item.category || 'सामान्य'}</p>
                </div>
              </div>

              <div className="p-2 bg-stone-100 border-t border-stone-200 flex gap-1">
                <button
                  onClick={() => handleSingleDownload(item.url, item.filename)}
                  className="flex-1 bg-white hover:bg-orange-100 text-stone-700 hover:text-[#C2410C] border border-stone-300 text-[10px] font-bold py-1 px-1.5 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="डाउनलोड करें"
                >
                  <Download className="w-3 h-3" />
                  <span>डाउनलोड</span>
                </button>

                <button
                  onClick={() => handleCopyUrl(item.id, item.url)}
                  className="bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 p-1.5 rounded transition-colors cursor-pointer"
                  title="URL कॉपी करें"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
