'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';
import { ArrowLeft, Save, Eye, Heart, Share2, Volume2, RotateCcw, History } from 'lucide-react';
import { formatCount } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Revision {
  id: string;
  revisionNumber: number;
  title: string;
  changeNote?: string;
  createdAt: string;
}

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
  const [forceTrending, setForceTrending] = useState(false);
  const [status, setStatus] = useState('PUBLISHED');
  const [allowAudio, setAllowAudio] = useState(true);

  // Popularity stats
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [listenCount, setListenCount] = useState(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Fetch article details
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const a = data.data;
          setTitle(a.title || '');
          setSubtitle(a.subtitle || '');
          setExcerpt(a.excerpt || '');
          setContent(a.content || '');
          setFeaturedImage(a.featuredImage || '');
          setPrimaryCategoryId(a.primaryCategoryId || '');
          setIsBreaking(a.isBreaking || false);
          setIsFeatured(a.isFeatured || false);
          setIsMainStory(a.isMainStory || false);
          setForceTrending(a.forceTrending || false);
          setStatus(a.status || 'PUBLISHED');
          setAllowAudio(a.allowAudio !== undefined ? a.allowAudio : true);

          setViewCount(a.viewCount || 0);
          setLikeCount(a.likeCount || 0);
          setShareCount(a.shareCount || 0);
          setListenCount(a.listenCount || 0);

          if (a.tags) {
            setSelectedTagIds(a.tags.map((t: any) => t.id));
          }
          if (a.revisions) {
            setRevisions(a.revisions);
          }
        }
      })
      .catch(() => {});

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
  }, [id]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!confirm('क्या आप इस संस्करण (Revision) को रीस्टोर करना चाहते हैं?')) return;
    try {
      const res = await fetch('/api/admin/revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTitle(data.data.title);
        setContent(data.data.content);
        setSuccessMsg(`संस्करण सफलतापूर्वक पुनर्स्थापित (Restored) हुआ!`);
      }
    } catch (err) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          excerpt,
          content,
          featuredImage,
          primaryCategoryId,
          tagIds: selectedTagIds,
          isBreaking,
          isFeatured,
          isMainStory,
          forceTrending,
          status,
          allowAudio,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('समाचार सफलतापूर्वक अद्यतन (Updated) हुआ!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(data.error || 'अद्यतन करने में त्रुटि हुई।');
      }
    } catch (err) {
      setError('सर्वर त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-stone-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">समाचार संशोधित करें (Modify News)</h1>
            <p className="text-xs text-stone-500">संपादित करें, मीडिया अपलोड करें, संस्करण इतिहास देखें</p>
          </div>
        </div>
      </div>

      {/* Popularity Metrics Panel */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 text-[#EA580C] rounded-lg"><Eye className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] text-stone-500 font-bold">व्यूज (Views)</p>
            <p className="text-lg font-extrabold text-stone-900">{formatCount(viewCount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Heart className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] text-stone-500 font-bold">लाइक्स (Likes)</p>
            <p className="text-lg font-extrabold text-stone-900">{formatCount(likeCount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Share2 className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] text-stone-500 font-bold">शेयर्स (Shares)</p>
            <p className="text-lg font-extrabold text-stone-900">{formatCount(shareCount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Volume2 className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] text-stone-500 font-bold">ऑडियो लिस्टन (Listens)</p>
            <p className="text-lg font-extrabold text-stone-900">{formatCount(listenCount)}</p>
          </div>
        </div>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-xs font-bold">{successMsg}</div>}
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
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">प्राथमिक श्रेणी (Category)</label>
            <select
              value={primaryCategoryId}
              onChange={(e) => setPrimaryCategoryId(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
            >
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

        {/* Image Uploader */}
        <ImageUploader
          label="मुख्य थंबनेल चित्र (Featured Image File Upload or URL)"
          value={featuredImage}
          onChange={(url) => setFeaturedImage(url)}
        />

        {/* Multi-Tag Selector */}
        <div className="bg-orange-50/60 p-4 border border-orange-200 rounded-lg">
          <label className="block text-xs font-bold text-[#C2410C] mb-1">मल्टी टैग्स चयन (Multi-Tag Selector)</label>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-white border border-stone-200 rounded-md">
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
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">संक्षिप्त विवरण (Excerpt Summary)</label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">पूरा समाचार विवरण (Full Content HTML/Text)</label>
          <textarea
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-stone-300 rounded-lg text-sm font-sans focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Toggles */}
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
            <input type="checkbox" checked={forceTrending} onChange={(e) => setForceTrending(e.target.checked)} className="w-4 h-4 text-[#F97316]" />
            <span>FORCE TRENDING</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
            <input type="checkbox" checked={allowAudio} onChange={(e) => setAllowAudio(e.target.checked)} className="w-4 h-4 text-[#F97316]" />
            <span>ऑडियो TTS सक्रिय</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'सुरक्षित हो रहा है...' : 'परिवर्तन सुरक्षित करें'}</span>
          </button>
        </div>
      </form>

      {/* Revision Snapshots History Panel */}
      {revisions.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-[#F97316]" />
            <span>संस्करण इतिहास (Revision Snapshots History)</span>
          </h3>

          <div className="space-y-2">
            {revisions.map((rev) => (
              <div key={rev.id} className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-800">
                    Revision v{rev.revisionNumber} — {rev.title}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleString('hi-IN')} {rev.changeNote ? `(${rev.changeNote})` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestoreRevision(rev.id)}
                  className="bg-stone-200 hover:bg-orange-100 text-stone-800 hover:text-[#C2410C] px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Version</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
