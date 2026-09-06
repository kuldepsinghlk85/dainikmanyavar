'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import HtmlContentEditor from '@/components/admin/HtmlContentEditor';
import { ArrowLeft, Save, ExternalLink, Plus, MapPin, Upload, X, CheckCircle2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface LocationItem {
  id: string;
  name: string;
  type?: string;
  image?: string;
}

export default function AddNewsPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [primaryCategoryId, setPrimaryCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isMainStory, setIsMainStory] = useState(false);
  const [status, setStatus] = useState('PUBLISHED');
  const [allowAudio, setAllowAudio] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');

  // Quick Add Location State
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('DISTRICT');
  const [newLocImage, setNewLocImage] = useState('');
  const [locUploading, setLocUploading] = useState(false);
  const [locSubmitting, setLocSubmitting] = useState(false);
  const locFileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/tags')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAvailableTags(data.data);
      })
      .catch(() => {});

    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setCategories(data.data);
      })
      .catch(() => {});

    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          // Show only districts and cities in the news location dropdown (exclude division groupings to prevent duplicate city names)
          setLocations(data.data.filter((l: any) => l.type !== 'DIVISION'));
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;
    const cleanInput = newTagName.replace(/^#+/, '').trim().toLowerCase();

    // Client-side protection: check if tag already exists in availableTags
    const existing = availableTags.find(
      (t) => t.name.replace(/^#+/, '').trim().toLowerCase() === cleanInput
    );
    if (existing) {
      if (!selectedTagIds.includes(existing.id)) {
        setSelectedTagIds((prev) => [...prev, existing.id]);
      }
      setNewTagName('');
      return;
    }

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAvailableTags((prev) => {
          if (prev.some((t) => t.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
        setSelectedTagIds((prev) => Array.from(new Set([...prev, data.data.id])));
        setNewTagName('');
      }
    } catch (err) {}
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

    const trimmed = newLocName.trim().toLowerCase();
    const existing = locations.find((l) => l.name.trim().toLowerCase() === trimmed);
    if (existing) {
      setLocationId(existing.id);
      setShowAddLocationModal(false);
      setNewLocName('');
      setNewLocImage('');
      alert(`स्थान '${existing.name}' पहले से सूची में मौजूद है और चुन लिया गया है।`);
      return;
    }

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
        setLocations((prev) => {
          if (prev.some((l) => l.id === createdLoc.id)) return prev;
          return [...prev, createdLoc];
        });
        setLocationId(createdLoc.id);
        setShowAddLocationModal(false);
        setNewLocName('');
        setNewLocImage('');
      } else {
        if (data.data && data.data.id) {
          // If server returned existing location on 409 conflict
          setLocationId(data.data.id);
          setShowAddLocationModal(false);
          setNewLocName('');
          setNewLocImage('');
        }
        alert(data.error || 'स्थान जोड़ने में समस्या आई');
      }
    } catch (err: any) {
      alert(err.message || 'स्थान जोड़ने में समस्या आई');
    }
    setLocSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !content || !primaryCategoryId) {
      setError('कृपया शीर्षक, समाचार विवरण और प्राथमिक श्रेणी अवश्य दर्ज करें।');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          excerpt,
          content,
          featuredImage: featuredImage || 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=1200&q=80',
          primaryCategoryId,
          locationId: locationId || null,
          tagIds: selectedTagIds,
          isBreaking,
          isFeatured,
          isMainStory,
          status,
          allowAudio,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/news');
        router.refresh();
      } else {
        setError(data.error || 'समाचार पोस्ट करने में त्रुटि हुई।');
      }
    } catch (err) {
      setError('सर्वर त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-stone-600" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">नया समाचार जोड़ें (Add News)</h1>
          <p className="text-xs text-stone-500">सभी फ़ील्ड्स भरें और चित्र अपलोड करें</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-bold">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">मुख्य शीर्षक (Headline) *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="समाचार का मुख्य शीर्षक दर्ज करें..."
            className="w-full p-3 border border-stone-300 rounded-lg text-base font-bold focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">उप-शीर्षक (Secondary Headline)</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="उप-शीर्षक / महत्वपूर्ण बिंदु..."
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Category, Location & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">प्राथमिक श्रेणी (Category) *</label>
            <select
              required
              value={primaryCategoryId}
              onChange={(e) => setPrimaryCategoryId(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
            >
              <option value="">श्रेणी चुनें...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>स्थान / जिला (Location)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(true)}
                  className="text-[11px] font-black text-[#EA580C] hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200 flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>नया स्थान</span>
                </button>
                <Link
                  href="/admin/locations"
                  target="_blank"
                  className="text-[11px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-0.5 hover:underline"
                  title="स्थान सूची और आर्काइव खोलें"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#F97316]"
            >
              <option value="">-- स्थान / जिला चुनें (Optional) --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  📍 {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">प्रकाशन स्थिति (Status)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-bold text-green-700 focus:outline-none focus:border-[#F97316]"
            >
              <option value="PUBLISHED">PUBLISHED (प्रकाशित)</option>
              <option value="DRAFT">DRAFT (ड्राफ्ट)</option>
              <option value="IN_REVIEW">IN_REVIEW (समीक्षाधीन)</option>
              <option value="SCHEDULED">SCHEDULED (अनुसूचित)</option>
            </select>
          </div>
        </div>

        {/* Image Uploader Integration */}
        <ImageUploader
          label="मुख्य थंबनेल चित्र (Featured Image File Upload or URL)"
          value={featuredImage}
          onChange={(url) => setFeaturedImage(url)}
        />

        {/* Multi-Tag Selector */}
        <div className="bg-orange-50/60 p-4 border border-orange-200 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <label className="block text-xs font-bold text-[#C2410C]">मल्टी टैग्स चयन (Multi-Tag Selector) *</label>
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
          <p className="text-[11px] text-stone-500 mb-3">एक समाचार में जितने चाहें टैग्स चुनें या नया टैग जोड़ें:</p>

          <div className="flex flex-wrap gap-2 mb-3 max-h-36 overflow-y-auto p-2 bg-white border border-stone-200 rounded-md">
            {availableTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer font-bold ${
                    isSelected
                      ? 'bg-[#EA580C] text-white border-[#EA580C]'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-orange-100'
                  }`}
                >
                  {isSelected ? `✓ ${tag.name}` : tag.name}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="नया टैग नाम दर्ज करें..."
              className="flex-1 p-2 text-xs border border-stone-300 rounded focus:outline-none focus:border-[#F97316]"
            />
            <button
              type="button"
              onClick={handleCreateNewTag}
              className="bg-[#F97316] text-white text-xs font-bold px-3 py-2 rounded hover:bg-[#EA580C]"
            >
              + नया टैग जोड़ें
            </button>
          </div>
        </div>

        {/* Excerpt Summary */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">संक्षिप्त विवरण (Excerpt Summary)</label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="समाचार का 2-3 पंक्तियों का संक्षिप्त विवरण..."
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* HTML & Visual Content Editor */}
        <HtmlContentEditor
          value={content}
          onChange={(html) => setContent(html)}
          required
          label="पूरा समाचार विवरण (Full Content Body - HTML/Visual Editor) *"
          placeholder="<p>समाचार की विस्तृत जानकारी यहाँ दर्ज करें या HTML डेटा पेस्ट करें...</p>"
        />

        {/* Flags & Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
            <input type="checkbox" checked={isMainStory} onChange={(e) => setIsMainStory(e.target.checked)} className="w-4 h-4 text-[#F97316]" />
            <span>मुख्य स्टोरी (Hero)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
            <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} className="w-4 h-4 text-[#F97316]" />
            <span>ब्रेकिंग न्यूज़ (Ticker)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 text-[#F97316]" />
            <span>खास खबर (Featured)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
            <input type="checkbox" checked={allowAudio} onChange={(e) => setAllowAudio(e.target.checked)} className="w-4 h-4 text-[#F97316]" />
            <span>ऑडियो TTS सक्रिय</span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            रद्द करें
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'प्रकाशित हो रहा है...' : 'समाचार प्रकाशित करें'}</span>
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
