'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Copy, Check, Trash2, Search, RefreshCw, FolderArchive } from 'lucide-react';

export default function MediaArchiveAdminPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [msg, setMsg] = useState('');

  const fetchItems = async () => {
    try {
      let url = '/api/media';
      if (query) url += `?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [query]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (data.success) {
        setMsg('इमेज सफलता से आर्काइव में जुड़ गई!');
        fetchItems();
      } else {
        alert(data.error || 'अपलोड में त्रुटि हुई');
      }
    } catch (err) {
      alert('अपलोड करने में समस्या आई');
    }
    setUploading(false);
  };

  const handleCopyUrl = (id: string, url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस फोटो को आर्काइव से हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchItems();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-[#EA580C]" />
            <span>🖼️ फोटो आर्काइवर व मीडिया लाइब्रेरी (Photo Archiver)</span>
            <span className="bg-[#EA580C] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {items.length} फोटो
            </span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            वेबसाइट व खबरों के लिए सभी अपलोड की गई फोटो गैलरी — 1-क्लिक लिंक कॉपी व मैनेजमेंट
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'अपलोड जारी...' : '📷 नई फोटो अपलोड करें'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold">×</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="फोटो का नाम खोजें..."
          className="w-full text-xs font-medium text-stone-900 focus:outline-none"
        />
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((img) => (
          <div key={img.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="relative h-40 bg-stone-100 border-b border-stone-100">
              <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
            </div>

            <div className="p-3 space-y-2">
              <p className="text-xs font-bold text-stone-900 truncate" title={img.originalName || img.filename}>
                {img.originalName || img.filename}
              </p>
              <p className="text-[10px] font-mono text-stone-400">
                {new Date(img.createdAt).toLocaleDateString('hi-IN')}
              </p>

              <div className="pt-2 border-t border-stone-100 flex gap-1.5">
                <button
                  onClick={() => handleCopyUrl(img.id, img.url)}
                  className="flex-1 bg-orange-50 hover:bg-orange-100 text-[#C2410C] font-extrabold text-[11px] py-1.5 px-2 rounded-lg border border-orange-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="यूआरएल कॉपी करें"
                >
                  {copiedId === img.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-700">कॉपी हुआ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>कॉपी लिंक</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg border border-red-200 transition-colors cursor-pointer"
                  title="हटाएं"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-stone-400 font-bold bg-white rounded-2xl border border-stone-200">
            कोई फोटो नहीं मिली। ऊपर बटन से नई फोटो अपलोड करें।
          </div>
        )}
      </div>
    </div>
  );
}
