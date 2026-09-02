'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, CheckCircle2, Image as ImageIcon, Volume2, Tag as TagIcon, Sparkles } from 'lucide-react';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';

export default function EditArticleAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    categoryId: '',
    locationId: '',
    status: 'PUBLISHED',
    allowAudio: true,
    seoTitle: '',
    seoDescription: '',
    tagsString: '',
    slug: '',
  });

  useEffect(() => {
    if (!id) return;

    // Fetch Categories
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setCategories(d.data);
      })
      .catch(() => {});

    // Fetch Locations
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setLocations(d.data);
      })
      .catch(() => {});

    // Fetch Article Details
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const a = data.data;
          setForm({
            title: a.title || '',
            subtitle: a.subtitle || '',
            excerpt: a.excerpt || '',
            content: a.content || '',
            featuredImage: a.featuredImage || '',
            categoryId: a.primaryCategoryId || a.categoryId || a.category?.id || '',
            locationId: a.locationId || a.location?.id || '',
            status: a.status || 'PUBLISHED',
            allowAudio: a.allowAudio !== undefined ? a.allowAudio : true,
            seoTitle: a.seoTitle || '',
            seoDescription: a.seoDescription || '',
            tagsString: Array.isArray(a.tags) ? a.tags.map((t: any) => t.name).join(', ') : '',
            slug: a.slug || '',
          });
        } else {
          setErrorMsg(data.error || 'समाचार प्राप्त नहीं हो सका');
        }
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const tagsArray = form.tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          primaryCategoryId: form.categoryId,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg('✅ समाचार सफलतापूर्वक अद्यतन (Updated) हो गया!');
      } else {
        setErrorMsg(data.error || 'अद्यतन करने में समस्या आई');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 font-bold">
        🔄 समाचार विवरण लोड हो रहा है...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <Link href="/admin/news" className="text-xs text-[#EA580C] font-bold hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>समाचार सूची पर वापस जाएं</span>
          </Link>
          <h1 className="text-2xl font-black text-stone-900">✏️ समाचार संपादित करें (Edit News)</h1>
        </div>

        {form.slug && (
          <Link
            href={`/news/${form.slug}`}
            target="_blank"
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 border border-stone-300 transition-colors"
          >
            <Eye className="w-4 h-4 text-[#EA580C]" />
            <span>👁 लाइव साइट पर देखें</span>
          </Link>
        )}
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-xs">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-700 font-bold">×</button>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        {/* Main Headline */}
        <div>
          <label className="block text-xs font-extrabold text-stone-900 mb-1.5">
            मुख्य समाचार शीर्षक (Headline) *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="यहाँ मुख्य शीर्षक दर्ज करें..."
            className="w-full p-3 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
          />
        </div>

        {/* Short Subtitle / Excerpt */}
        <div>
          <label className="block text-xs font-extrabold text-stone-900 mb-1.5">
            संक्षिप्त सारांश / सब-टाइटल (Excerpt)
          </label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="मुख्य समाचार का 2 लाइन सारांश..."
            className="w-full p-3 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-[#EA580C]"
          />
        </div>

        {/* Content Body */}
        <div>
          <label className="block text-xs font-extrabold text-stone-900 mb-1.5">
            विस्तृत समाचार सामग्री (Content Body) *
          </label>
          <textarea
            rows={10}
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="यहाँ पूरा समाचार लिखें या पेस्ट करें..."
            className="w-full p-3 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:border-[#EA580C] leading-relaxed"
          />
        </div>

        {/* Image & Audio Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-stone-100">
          <div>
            <ImageUploadWidget
              value={form.featuredImage}
              onChange={(url) => setForm({ ...form, featuredImage: url })}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-stone-900 mb-1.5">
                श्रेणी (Category)
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
              >
                <option value="">-- श्रेणी चुनें --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-900 mb-1.5">
                स्थान / जिला (Location)
              </label>
              <select
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
              >
                <option value="">-- स्थान चुनें --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    📍 {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowAudio}
                  onChange={(e) => setForm({ ...form, allowAudio: e.target.checked })}
                  className="w-4 h-4 accent-[#EA580C]"
                />
                <Volume2 className="w-4 h-4 text-[#EA580C]" />
                <span>🔊 ऑडियो न्यूज़ प्लेयर इनेबल करें (Audio Engine)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tags & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
          <div>
            <label className="block text-xs font-extrabold text-stone-900 mb-1.5 flex items-center gap-1.5">
              <TagIcon className="w-4 h-4 text-[#EA580C]" />
              <span>मल्टी-टैग्स (Comma Separated Tags)</span>
            </label>
            <input
              type="text"
              value={form.tagsString}
              onChange={(e) => setForm({ ...form, tagsString: e.target.value })}
              placeholder="#उत्तर_प्रदेश, #पूर्वांचल, #जौनपुर"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
            />
            <p className="text-[11px] text-stone-400 mt-1">कोमा (,) से अलग करके कई टैग्स दर्ज करें</p>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-stone-900 mb-1.5">
              प्रकाशन स्थिति (Publishing Status)
            </label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-green-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={form.status === 'PUBLISHED'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="accent-green-600"
                />
                <span>🟢 PUBLISHED (लाइव)</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={form.status === 'DRAFT'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="accent-amber-600"
                />
                <span>🟡 DRAFT (ड्राफ्ट)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="pt-6 border-t border-stone-200 flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'अद्यतन हो रहा है...' : '💾 समाचार अद्यतन करें (Save Changes)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
