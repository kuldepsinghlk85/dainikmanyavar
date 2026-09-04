'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, CheckCircle2, Image as ImageIcon, Volume2, Tag as TagIcon, Sparkles, ExternalLink, Plus, MapPin, Upload, X, FolderArchive } from 'lucide-react';
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
  const [allTags, setAllTags] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [tagLoading, setTagLoading] = useState(false);

  // Quick Add Location State
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('DISTRICT');
  const [newLocImage, setNewLocImage] = useState('');
  const [locUploading, setLocUploading] = useState(false);
  const [locSubmitting, setLocSubmitting] = useState(false);
  const locFileInputRef = useRef<HTMLInputElement>(null);

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

    // Fetch All Tags
    fetch('/api/admin/tags')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setAllTags(d.data);
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

  const selectedTagNames = form.tagsString
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const handleToggleTag = (tagName: string) => {
    const cleanTag = tagName.replace(/^#/, '').trim();
    const tagFormatted = `#${cleanTag}`;

    const exists = selectedTagNames.some(
      (st) => st.replace(/^#/, '').trim().toLowerCase() === cleanTag.toLowerCase()
    );

    let updated: string[];
    if (exists) {
      updated = selectedTagNames.filter(
        (st) => st.replace(/^#/, '').trim().toLowerCase() !== cleanTag.toLowerCase()
      );
    } else {
      updated = [...selectedTagNames, tagFormatted];
    }
    setForm((prev) => ({ ...prev, tagsString: updated.join(', ') }));
  };

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;
    setTagLoading(true);
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      const d = await res.json();
      if (d.success && d.data) {
        const createdTag = d.data;
        setAllTags((prev) =>
          prev.some((t) => t.id === createdTag.id) ? prev : [...prev, createdTag]
        );
        handleToggleTag(createdTag.name);
        setNewTagName('');
      }
    } catch (err) {}
    setTagLoading(false);
  };

  const handleLocImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocUploading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('category', 'स्थान आर्काइव');
      uploadForm.append('caption', `स्थान चित्र: ${newLocName || file.name}`);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadForm });
      const data = await res.json();
      if (data.success && data.url) {
        setNewLocImage(data.url);
      }
    } catch (err) {
      console.error(err);
    }
    setLocUploading(false);
  };

  const handleQuickCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    setLocSubmitting(true);
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLocName.trim(),
          type: newLocType,
          image: newLocImage || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const createdLoc = data.data;
        setLocations((prev) => [...prev, createdLoc]);
        setForm((prev) => ({ ...prev, locationId: createdLoc.id }));
        setShowAddLocationModal(false);
        setNewLocName('');
        setNewLocImage('');
        setMsg(`स्थान '${createdLoc.name}' सफलतापूर्वक जुड़ गया और चुना गया! इसका चित्र आर्काइव में सुरक्षित हो गया।`);
      } else {
        alert(data.error || 'स्थान जोड़ने में समस्या आई');
      }
    } catch (err: any) {
      alert(err.message || 'स्थान जोड़ने में समस्या आई');
    }
    setLocSubmitting(false);
  };

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-stone-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>स्थान / जिला (Location)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLocationModal(true)}
                    className="text-[11px] font-black text-[#EA580C] hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded border border-orange-200 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>नया स्थान जोड़ें</span>
                  </button>
                  <Link
                    href="/admin/locations"
                    target="_blank"
                    className="text-[11px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-0.5 hover:underline"
                    title="स्थान सूची और आर्काइव प्रबंधित करें"
                  >
                    <span>स्थान सूची</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
              <select
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 bg-white"
              >
                <option value="">-- स्थान चुनें --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    📍 {loc.name} {loc.type ? `(${loc.type})` : ''}
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
          {/* Tags Section */}
          <div className="space-y-3 bg-stone-50/80 p-4 rounded-2xl border border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                <TagIcon className="w-4 h-4 text-[#EA580C]" />
                <span>मल्टी-टैग्स (Multi-Tags)</span>
              </label>

              {/* Link to Create / Manage Tags */}
              <Link
                href="/admin/tags"
                target="_blank"
                className="text-xs font-black text-[#EA580C] hover:text-orange-700 flex items-center gap-1 hover:underline"
                title="नया टैग बनाने या मैनेज करने के लिए टैग्स पेज खोलें"
              >
                <span>➕ नए टैग बनाएं (Manage Tags)</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Comma Separated Tags Input */}
            <input
              type="text"
              value={form.tagsString}
              onChange={(e) => setForm({ ...form, tagsString: e.target.value })}
              placeholder="#उत्तर_प्रदेश, #पूर्वांचल, #जौनपुर"
              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
            />
            <p className="text-[11px] text-stone-500">
              कोमा (,) से अलग करके टैग्स दर्ज करें अथवा नीचे दिए गए टैग्स पर क्लिक करके जोड़ें:
            </p>

            {/* Quick Inline Tag Creator */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateNewTag();
                  }
                }}
                placeholder="नया टैग नाम लिखें (उदा. #वाराणसी_विकास)..."
                className="flex-1 p-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#EA580C]"
              />
              <button
                type="button"
                onClick={handleCreateNewTag}
                disabled={tagLoading || !newTagName.trim()}
                className="bg-[#EA580C] hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नया टैग जोड़ें</span>
              </button>
            </div>

            {/* Available Tags List (Click to Add / Remove) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
                <span>उपलब्ध टैग्स ({allTags.length}) — क्लिक करके जोड़ें / हटाएं:</span>
                {allTags.length > 6 && (
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="टैग खोजें..."
                    className="p-1 px-2 text-[11px] bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#EA580C] w-28"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-white border border-stone-200 rounded-xl">
                {allTags
                  .filter((t) =>
                    tagSearch ? t.name.toLowerCase().includes(tagSearch.toLowerCase()) : true
                  )
                  .map((tag) => {
                    const tagDisplay = tag.name.startsWith('#') ? tag.name : `#${tag.name}`;
                    const cleanTag = tag.name.replace(/^#/, '').toLowerCase();
                    const isSelected = selectedTagNames.some(
                      (st) => st.replace(/^#/, '').toLowerCase() === cleanTag
                    );

                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => handleToggleTag(tag.name)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-orange-50 hover:border-orange-300'
                        }`}
                        title={isSelected ? 'हटाने के लिए क्लिक करें' : 'जोड़ने के लिए क्लिक करें'}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{tagDisplay}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
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

      {/* Quick Add Location Modal */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#EA580C]">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-stone-900">नया स्थान जोड़ें (Quick Add Location)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLocationModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateLocation} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-stone-800 mb-1">
                  स्थान का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. जौनपुर, मछलीशहर, वाराणसी"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:border-[#EA580C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-800 mb-1">
                  स्थान का प्रकार
                </label>
                <select
                  value={newLocType}
                  onChange={(e) => setNewLocType(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 bg-white focus:border-[#EA580C] outline-none"
                >
                  <option value="DISTRICT">जिला (District)</option>
                  <option value="CITY">शहर / नगर (City/Town)</option>
                  <option value="TEHSIL">तहसील (Tehsil)</option>
                  <option value="STATE">राज्य (State)</option>
                  <option value="REGION">क्षेत्र (Region)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-800 mb-1">
                  स्थान चित्र / फ़ोटो (Optional)
                </label>
                <p className="text-[11px] text-stone-500 mb-2">
                  यह चित्र स्वतः <strong className="text-orange-600">स्थान आर्काइव (Media Archival)</strong> में भविष्य के उपयोग हेतु सुरक्षित हो जाएगा।
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={locFileInputRef}
                    accept="image/*"
                    onChange={handleLocImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => locFileInputRef.current?.click()}
                    disabled={locUploading}
                    className="px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>{locUploading ? 'अपलोड हो रहा है...' : 'चित्र अपलोड करें'}</span>
                  </button>

                  <input
                    type="text"
                    placeholder="या फ़ोटो URL पेस्ट करें"
                    value={newLocImage}
                    onChange={(e) => setNewLocImage(e.target.value)}
                    className="flex-1 p-2 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 outline-none"
                  />
                </div>

                {newLocImage && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <img
                      src={newLocImage}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-stone-300 shadow-xs"
                    />
                    <div className="text-[11px] flex-1">
                      <span className="text-green-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> चित्र तैयार है
                      </span>
                      <span className="text-stone-500 truncate block max-w-[200px]">{newLocImage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewLocImage('')}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={locSubmitting || locUploading}
                  className="px-5 py-2 bg-[#EA580C] hover:bg-orange-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{locSubmitting ? 'जोड़ा जा रहा है...' : 'स्थान जोड़ें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
