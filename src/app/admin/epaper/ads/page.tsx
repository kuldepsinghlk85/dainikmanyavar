'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, ExternalLink, Calendar, CheckCircle2, Upload, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  position: string;
  pageNumber: number;
  imageUrl: string;
  targetUrl: string;
  active: boolean;
  impressions: number;
}

export default function EpaperAdsAdminPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    position: 'top_banner',
    pageNumber: '1',
    imageUrl: '',
    targetUrl: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/epaper/ads');
      const data = await res.json();
      if (data.success) setAds(data.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleImageFileChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !form.imageUrl) {
      alert('कृपया विज्ञापन की फ़ोटो (Image) चुनें या URL दर्ज करें');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('position', form.position);
      formData.append('pageNumber', form.pageNumber);
      formData.append('targetUrl', form.targetUrl);

      if (imageFile) {
        formData.append('imageFile', imageFile);
      } else {
        formData.append('imageUrl', form.imageUrl);
      }

      const res = await fetch('/api/epaper/ads', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMsg('✅ ई-पेपर विज्ञापन सफलतापूर्वक अपलोड व सुरक्षित हो गया!');
        setShowAddModal(false);
        setForm({ title: '', position: 'top_banner', pageNumber: '1', imageUrl: '', targetUrl: '' });
        setImageFile(null);
        setImagePreview(null);
        fetchAds();
      } else {
        alert(data.error || 'विज्ञापन जोड़ने में त्रुटि हुई');
      }
    } catch (err: any) {
      alert(err.message || 'सर्वर एरर');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस विज्ञापन को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/epaper/ads?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchAds();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#EA580C]" />
            <span>Advertisement Management (ई-पेपर विज्ञापन प्रबंधक)</span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            ई-पेपर टॉप बैनर, पेज-विशिष्ट विज्ञापन एवं साइड बैनर प्रबंधित करें
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>➕ नया विज्ञापन जोड़ें</span>
        </button>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-extrabold flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700">×</button>
        </div>
      )}

      {/* Add Ad Modal */}
      {showAddModal && (
        <form onSubmit={handleAddAd} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-stone-900 text-base border-b border-stone-100 pb-2">➕ नया ई-पेपर विज्ञापन दर्ज करें</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">विज्ञापन शीर्षक *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="उदा. दीपावली विशेष ऑफर"
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">पोजीशन (Ad Position)</label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
              >
                <option value="top_banner">🔝 Top Banner Advertisement</option>
                <option value="page_specific">📄 Page Specific Advertisement</option>
                <option value="side_banner">➡️ Side Advertisement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">पेज नंबर (Page Number)</label>
              <input
                type="number"
                min="1"
                value={form.pageNumber}
                onChange={(e) => setForm({ ...form, pageNumber: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Target URL (लिंक)</label>
              <input
                type="text"
                value={form.targetUrl}
                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                placeholder="https://..."
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
              />
            </div>

            {/* Ad Image File Uploader Box */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-stone-800">
                  विज्ञापन फ़ोटो (Ad Banner Image) *
                </label>
                <button
                  type="button"
                  onClick={() => setUseUrlInput(!useUrlInput)}
                  className="text-[11px] text-[#EA580C] hover:underline font-bold cursor-pointer"
                >
                  {useUrlInput ? '📁 फ़ाइल अपलोड बॉक्स का उपयोग करें' : '🔗 URL द्वारा जोड़ें'}
                </button>
              </div>

              {!useUrlInput ? (
                <div>
                  {imagePreview ? (
                    <div className="relative p-3 bg-stone-50 border-2 border-dashed border-green-500 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Ad Preview"
                          className="w-24 h-20 object-contain bg-white rounded-xl border border-stone-200 shadow-xs"
                        />
                        <div>
                          <p className="text-xs font-black text-stone-900 line-clamp-1">{imageFile?.name || 'चुनी गई विज्ञापन फ़ाइल'}</p>
                          {imageFile && (
                            <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                              {(imageFile.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                          <p className="text-[10px] text-green-600 font-bold mt-0.5">✓ अपलोड के लिए तैयार</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                        title="फ़ोटो हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>हटाएं</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-[#EA580C] bg-stone-50 hover:bg-orange-50/20 p-6 rounded-2xl text-center space-y-2 cursor-pointer transition-all"
                    >
                      <Upload className="w-8 h-8 text-[#EA580C] mx-auto" />
                      <div>
                        <p className="text-xs font-black text-stone-900">
                          यहाँ क्लिक करें या विज्ञापन बैनर फ़ोटो ड्रैग करें (Click to Choose Image)
                        </p>
                        <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                          समर्थित प्रारूप: PNG, JPG, JPEG, WebP, GIF
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                        className="hidden"
                        onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://... या /uploads/..."
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
                  />
                  {form.imageUrl && (
                    <div className="mt-2 p-2 bg-stone-50 border rounded-xl flex items-center gap-3">
                      <img src={form.imageUrl} alt="Ad Preview" className="w-12 h-12 object-contain rounded" />
                      <span className="text-[10px] text-stone-500 font-mono">इमेज प्रिव्यू</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : null}
            <span>{submitting ? 'अपलोड हो रहा है...' : 'विज्ञापन सुरक्षित करें'}</span>
          </button>
        </form>
      )}

      {/* Ads List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <span className="bg-slate-900 text-orange-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                  {ad.position} (पेज {ad.pageNumber})
                </span>
                <h3 className="font-extrabold text-stone-900 text-xs">{ad.title}</h3>
                <p className="text-[11px] font-mono text-stone-400 truncate max-w-xs">{ad.targetUrl}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(ad.id)}
              className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
