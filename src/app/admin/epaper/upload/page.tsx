'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Newspaper, Upload, FileText, Calendar, CheckCircle2, RefreshCw, Eye, ArrowLeft, Zap } from 'lucide-react';

export default function UploadEpaperAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [useCoverUrl, setUseCoverUrl] = useState(false);
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: 'दैनिक मान्यवर',
    editionDate: new Date().toISOString().split('T')[0],
    editionType: 'दैनिक',
    description: 'दैनिक मान्यवर ई-पेपर डिजिटल संस्करण',
    coverImage: '',
    status: 'PUBLISHED',
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [resultId, setResultId] = useState<string | null>(null);

  const handleCoverFileChange = (f: File | null) => {
    if (!f) return;
    setCoverFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (statusOverride?: string) => {
    if (!file) {
      alert('कृपया अखबार की PDF फ़ाइल चुनें');
      return;
    }

    setLoading(true);
    setMsg('⏳ अखबार अपलोड व डिजिटल फ्लिपबुक प्रोसेसिंग जारी है, कृपया प्रतीक्षा करें...');

    try {
      const formData = new FormData();
      formData.append('pdfFile', file);
      formData.append('title', form.title);
      formData.append('editionDate', form.editionDate);
      formData.append('editionType', form.editionType);
      formData.append('description', form.description);
      formData.append('coverImage', form.coverImage);
      if (coverFile) formData.append('coverImageFile', coverFile);
      formData.append('status', statusOverride || form.status);

      const res = await fetch('/api/epaper/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMsg(`✅ ${data.message} डिजिटल ई-पेपर खुल रहा है...`);
        setResultId(data.editionId);

        // Instant Auto-Redirect to the newly generated flipbook reader
        setTimeout(() => {
          window.location.href = `/epaper?id=${data.editionId}`;
        }, 1200);
      } else {
        alert(data.error || 'अपलोड में त्रुटि हुई');
        setLoading(false);
      }
    } catch (err: any) {
      alert(err.message || 'सर्वर एरर');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#EA580C]" />
            <span>Upload Today's Newspaper (आज का अखबार अपलोड करें)</span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            दैनिक अखबार की PDF अपलोड करें — सिस्टम स्वतः 3D फ्लिपबुक में बदल देगा
          </p>
        </div>

        <Link
          href="/admin/epaper/published"
          className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>प्रकाशित संस्करण देखें</span>
        </Link>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-2xl font-bold text-xs space-y-3 shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">{msg}</span>
          </div>

          {resultId && (
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href={`/epaper?id=${resultId}`}
                className="bg-[#EA580C] text-white px-5 py-2 rounded-xl font-black text-xs inline-flex items-center gap-2 shadow-md hover:bg-orange-700 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-white" />
                <span>🚀 अभी ई-पेपर प्रिव्यू खोलें</span>
              </Link>

              <Link
                href="/admin/epaper/published"
                className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs inline-flex items-center gap-1.5"
              >
                <span>📋 सभी प्रकाशित संस्करण देखें</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-6">
        <h3 className="font-extrabold text-stone-900 text-base border-b border-stone-100 pb-3 flex items-center gap-2">
          <span>📰 अखबार विवरण व PDF अपलोड</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Newspaper Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Newspaper Name (अखबार का नाम) *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
              placeholder="दैनिक मान्यवर"
            />
          </div>

          {/* Edition Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Edition Date (प्रकाशन तिथि) *</label>
            <div className="relative">
              <input
                type="date"
                required
                suppressHydrationWarning
                value={form.editionDate}
                onChange={(e) => setForm({ ...form, editionDate: e.target.value })}
                className="w-full p-3 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>

          {/* Edition Type */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Edition Type (संस्करण प्रकार)</label>
            <select
              value={form.editionType}
              onChange={(e) => setForm({ ...form, editionType: e.target.value })}
              className="w-full p-3 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
            >
              <option value="दैनिक">📰 दैनिक समाचार पत्र (Daily Newspaper)</option>
              <option value="विशेष">🌟 विशेष संस्करण (Special Edition)</option>
              <option value="रविवार">☀️ रविवार विशेषांक (Sunday Special)</option>
            </select>
          </div>

          {/* Cover Image File Uploader */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-stone-700">कवर फ़ोटो (Cover Image - वैकल्पिक)</label>
              <button
                type="button"
                onClick={() => setUseCoverUrl(!useCoverUrl)}
                className="text-[10px] text-[#EA580C] hover:underline font-bold cursor-pointer"
              >
                {useCoverUrl ? '📁 फ़ाइल चुनें' : '🔗 URL दर्ज करें'}
              </button>
            </div>

            {!useCoverUrl ? (
              <div>
                {coverPreview ? (
                  <div className="p-2.5 bg-stone-50 border border-green-500 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <img src={coverPreview} alt="Cover Preview" className="w-12 h-14 object-cover rounded-lg border shadow-xs" />
                      <div>
                        <p className="text-xs font-bold text-stone-900 line-clamp-1">{coverFile?.name}</p>
                        <p className="text-[10px] text-green-600 font-bold">✓ कवर फोटो चयनित</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                      className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1 bg-red-50 rounded-lg cursor-pointer"
                    >
                      हटाएं
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="border border-dashed border-stone-300 hover:border-[#EA580C] bg-stone-50 p-3 rounded-xl text-center cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold text-stone-700">📁 कवर फ़ोटो चुनें (PNG, JPG)</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">खाली छोड़ने पर प्रथम पृष्ठ (पेज 1) स्वतः कवर बनेगा</p>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      onChange={(e) => handleCoverFileChange(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://... या /uploads/..."
                className="w-full p-3 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#EA580C]"
              />
            )}
          </div>

          {/* PDF Upload File Box */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-2">Upload Newspaper PDF File (अखबार की PDF फ़ाइल चुनें) *</label>
            <div
              className={`border-2 border-dashed p-8 rounded-2xl text-center space-y-3 transition-colors cursor-pointer ${
                file ? 'border-green-500 bg-green-50/40' : 'border-stone-300 hover:border-[#EA580C] bg-stone-50'
              }`}
              onClick={() => document.getElementById('pdf-file-input')?.click()}
            >
              <Upload className={`w-10 h-10 mx-auto ${file ? 'text-green-600' : 'text-[#EA580C]'}`} />
              <div>
                <p className="text-sm font-black text-stone-900">
                  {file ? `चुनी गई फ़ाइल: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` : 'यहाँ क्लिक करें या PDF फ़ाइल ड्रैग करें'}
                </p>
                <p className="text-[11px] text-stone-500 font-semibold mt-1">हाई-क्वालिटी प्रिंट PDF (अधिकतम 50MB)</p>
              </div>
              <input
                id="pdf-file-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-1">Description (विवरण)</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="अखबार का मुख्य आकर्षण या विवरण दर्ज करें..."
              className="w-full p-3 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#EA580C]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="bg-stone-800 hover:bg-stone-900 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Draft (ड्राफ्ट सेव करें)
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-black text-sm px-7 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Zap className="w-4 h-4 text-amber-300" />}
            <span>{loading ? 'प्रोसेसिंग व फ्लिपबुक तैयार हो रही है...' : 'Process & Publish Edition (प्रोसेस व पब्लिश करें)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
