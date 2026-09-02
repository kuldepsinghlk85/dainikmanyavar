'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';
import { ArrowLeft, Save } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

export default function AddNewsPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [primaryCategoryId, setPrimaryCategoryId] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isMainStory, setIsMainStory] = useState(false);
  const [status, setStatus] = useState('PUBLISHED');
  const [allowAudio, setAllowAudio] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');

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
  }, []);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAvailableTags((prev) => [...prev, data.data]);
        setSelectedTagIds((prev) => [...prev, data.data.id]);
        setNewTagName('');
      }
    } catch (err) {}
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

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-xs font-bold text-[#C2410C] mb-1">मल्टी टैग्स चयन (Multi-Tag Selector) *</label>
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

        {/* HTML Content */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">पूरा समाचार विवरण (Full Content HTML/Text) *</label>
          <textarea
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<p>समाचार की विस्तृत जानकारी यहाँ दर्ज करें...</p>"
            className="w-full p-3 border border-stone-300 rounded-lg text-sm font-sans focus:outline-none focus:border-[#F97316]"
          />
        </div>

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
            className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100"
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
    </div>
  );
}
