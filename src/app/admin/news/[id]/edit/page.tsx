'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, CheckCircle2, Image as ImageIcon, Volume2, Tag as TagIcon, Sparkles, ExternalLink, Plus, MapPin, Upload, X, FolderArchive, Bell, Share2, FileText } from 'lucide-react';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import HtmlContentEditor from '@/components/admin/HtmlContentEditor';
import ParagraphBlockEditor from '@/components/admin/ParagraphBlockEditor';
import AutoTranslateButton from '@/components/admin/AutoTranslateButton';
import DistrictMultiSelector, { LocationItem } from '@/components/admin/DistrictMultiSelector';
import SocialPostGeneratorModal from '@/components/admin/SocialPostGeneratorModal';

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
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
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
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [articleNewsId, setArticleNewsId] = useState<number | undefined>(undefined);

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

  const [contentType, setContentType] = useState('news');
  const [movieTitle, setMovieTitle] = useState('');
  const [movieTitleHindi, setMovieTitleHindi] = useState('');
  const [movieDirector, setMovieDirector] = useState('');
  const [movieCast, setMovieCast] = useState('');
  const [ottPlatform, setOttPlatform] = useState('');
  const [rating, setRating] = useState('3.5');
  const [verdict, setVerdict] = useState('');
  const [positives, setPositives] = useState('');
  const [negatives, setNegatives] = useState('');
  const [spoilersContent, setSpoilersContent] = useState('');

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch('/api/categories').then((r) => r.json()).catch(() => ({})),
      fetch('/api/locations').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/tags').then((r) => r.json()).catch(() => ({})),
      fetch(`/api/articles/${id}`).then((r) => r.json()).catch(() => ({})),
    ])
      .then(([catData, locData, tagData, artData]) => {
        if (catData.success && catData.data) setCategories(catData.data);

        const locs = locData.success && locData.data ? locData.data.filter((l: any) => l.type !== 'DIVISION') : [];
        setLocations(locs);

        if (tagData.success && Array.isArray(tagData.data)) setAllTags(tagData.data);

        if (artData.success && artData.data) {
          const a = artData.data;
          if (a.newsId) setArticleNewsId(a.newsId);
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

          // Resolve selected districts from both locationId AND matching tags
          const initialLocIds: string[] = [];
          if (a.locationId) {
            initialLocIds.push(a.locationId);
          }
          if (Array.isArray(a.tags)) {
            for (const t of a.tags) {
              const cleanTag = (t.name || '').replace(/^#+/, '').trim().toLowerCase();
              const matched = locs.find(
                (l: any) => l.name.trim().toLowerCase() === cleanTag || (l.slug || '').toLowerCase() === cleanTag
              );
              if (matched && !initialLocIds.includes(matched.id)) {
                initialLocIds.push(matched.id);
              }
            }
          }
          setSelectedLocationIds(initialLocIds);

          if (a.contentType) setContentType(a.contentType);
          if (a.movieReview) {
            const mr = a.movieReview;
            if (mr.movie?.title) setMovieTitle(mr.movie.title);
            if (mr.movie?.titleHindi) setMovieTitleHindi(mr.movie.titleHindi);
            if (mr.movie?.director) setMovieDirector(mr.movie.director);
            if (mr.movie?.cast) setMovieCast(mr.movie.cast);
            if (mr.movie?.ottPlatform) setOttPlatform(mr.movie.ottPlatform);
            if (mr.rating) setRating(mr.rating.toString());
            if (mr.verdict) setVerdict(mr.verdict);
            if (mr.positives) setPositives(mr.positives);
            if (mr.negatives) setNegatives(mr.negatives);
            if (mr.spoilersContent) setSpoilersContent(mr.spoilersContent);
          }
        } else {
          setErrorMsg(artData?.error || 'समाचार प्राप्त नहीं हो सका');
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
    const cleanInput = newTagName.replace(/^#+/, '').trim().toLowerCase();

    // Check if tag already exists in allTags
    const existing = allTags.find(
      (t) => t.name.replace(/^#+/, '').trim().toLowerCase() === cleanInput
    );
    if (existing) {
      handleToggleTag(existing.name);
      setNewTagName('');
      return;
    }

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

  const handleLocationIdsChange = (newIds: string[]) => {
    setSelectedLocationIds(newIds);
    const primaryId = newIds[0] || '';

    // Synchronize tagsString: add tags for selected locations, remove tags for unselected locations
    const currentTags = form.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const allLocNames = locations.map((l) => l.name.trim().toLowerCase());
    const selectedLocNames = newIds
      .map((id) => locations.find((l) => l.id === id)?.name.trim())
      .filter(Boolean) as string[];

    // Keep tags that are NOT any removed location
    const nonLocationTags = currentTags.filter((t) => {
      const clean = t.replace(/^#+/, '').trim().toLowerCase();
      if (allLocNames.includes(clean) && !selectedLocNames.map((s) => s.toLowerCase()).includes(clean)) {
        return false;
      }
      return true;
    });

    // Add selected location tags if missing
    const updatedTags = [...nonLocationTags];
    selectedLocNames.forEach((name) => {
      const tagWithHash = `#${name}`;
      if (!updatedTags.some((t) => t.replace(/^#+/, '').trim().toLowerCase() === name.toLowerCase())) {
        updatedTags.push(tagWithHash);
      }
    });

    setForm((prev) => ({
      ...prev,
      locationId: primaryId,
      tagsString: updatedTags.join(', '),
    }));
  };

  const handleQuickInlineAddLocation = async (name: string) => {
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type: 'DISTRICT',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const createdLoc = data.data;
        setLocations((prev) => {
          if (prev.some((l) => l.id === createdLoc.id)) return prev;
          return [...prev, createdLoc];
        });
        handleLocationIdsChange([...selectedLocationIds, createdLoc.id]);
        setMsg(`स्थान '${createdLoc.name}' सफलतापूर्वक जुड़ गया और चयनित हो गया!`);
      } else if (data.data?.id) {
        if (!selectedLocationIds.includes(data.data.id)) {
          handleLocationIdsChange([...selectedLocationIds, data.data.id]);
        }
      } else {
        alert(data.error || 'स्थान जोड़ने में समस्या आई');
      }
    } catch (err: any) {
      alert(err.message || 'स्थान जोड़ने में समस्या आई');
    }
  };

  const handleQuickCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    setLocSubmitting(true);
    try {
      const trimmed = newLocName.trim().toLowerCase();
      const existing = locations.find((l) => l.name.trim().toLowerCase() === trimmed);
      if (existing) {
        if (!selectedLocationIds.includes(existing.id)) {
          handleLocationIdsChange([...selectedLocationIds, existing.id]);
        }
        setShowAddLocationModal(false);
        setNewLocName('');
        setNewLocImage('');
        setLocSubmitting(false);
        return;
      }

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
        handleLocationIdsChange([...selectedLocationIds, createdLoc.id]);
        setShowAddLocationModal(false);
        setNewLocName('');
        setNewLocImage('');
        setMsg(`स्थान '${createdLoc.name}' सफलतापूर्वक जुड़ गया और चयनित हो गया! इसका चित्र आर्काइव में सुरक्षित हो गया।`);
      } else {
        if (data.data && data.data.id) {
          if (!selectedLocationIds.includes(data.data.id)) {
            handleLocationIdsChange([...selectedLocationIds, data.data.id]);
          }
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

  const handleSubmitInternal = async (overrideStatus?: string, redirectToPush = false) => {
    setSaving(true);
    setMsg('');
    setErrorMsg('');

    const finalStatus = overrideStatus || form.status || 'DRAFT';
    if (overrideStatus && overrideStatus !== form.status) {
      setForm((prev) => ({ ...prev, status: overrideStatus }));
    }

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
          status: finalStatus,
          primaryCategoryId: form.categoryId,
          locationId: selectedLocationIds[0] || null,
          locationIds: selectedLocationIds,
          tags: tagsArray,
          contentType,
          movieReview:
            contentType === 'movie_review' || contentType === 'series_review'
              ? {
                  movieTitle: movieTitle || form.title,
                  movieTitleHindi,
                  director: movieDirector,
                  cast: movieCast,
                  ottPlatform,
                  rating,
                  verdict,
                  positives,
                  negatives,
                  spoilersContent,
                }
              : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (redirectToPush) {
          router.push(`/admin/notifications?newsId=${id}`);
        } else {
          setMsg(
            finalStatus === 'DRAFT'
              ? '✅ समाचार ड्राफ्ट (DRAFT) के रूप में सफलतापूर्वक सहेज दिया गया!'
              : '✅ समाचार सफलतापूर्वक लाइव प्रकाशित (Published) हो गया!'
          );
        }
      } else {
        setErrorMsg(data.error || 'अद्यतन करने में समस्या आई');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitInternal(form.status || 'DRAFT', false);
  };

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmitInternal('DRAFT', false);
  };

  const handlePublishDirectly = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmitInternal('PUBLISHED', false);
  };

  const handleSaveAndPush = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmitInternal('PUBLISHED', true);
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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-stone-900">✏️ समाचार संपादित करें (Edit News)</h1>
            {form.status === 'DRAFT' ? (
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 border border-amber-500 shadow-xs flex items-center gap-1.5 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-900"></span>
                <span>🟡 स्थिति: ड्राफ्ट मोड (DRAFT)</span>
              </span>
            ) : form.status === 'PUBLISHED' ? (
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-white border border-emerald-600 shadow-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <span>🟢 स्थिति: लाइव प्रकाशित (LIVE)</span>
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-stone-200 text-stone-800 border border-stone-400 shadow-xs">
                📦 {form.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 🌐 Auto Translate to Hindi Button */}
          <AutoTranslateButton
            currentData={{
              title: form.title,
              subtitle: form.subtitle,
              excerpt: form.excerpt,
              content: form.content,
            }}
            onTranslate={(translated) => {
              setForm((prev) => ({
                ...prev,
                title: translated.title ?? prev.title,
                subtitle: translated.subtitle ?? prev.subtitle,
                excerpt: translated.excerpt ?? prev.excerpt,
                content: translated.content ?? prev.content,
              }));
            }}
          />

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

          <Link
            href={`/admin/notifications?newsId=${id}`}
            className="text-xs font-extrabold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>🔔 पुश नोटिफिकेशन</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowSocialModal(true)}
            className="text-xs font-extrabold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="आधिकारिक सोशल मीडिया पोस्ट बनाएं"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>📱 सोशल पोस्ट बनाएं</span>
          </button>
        </div>
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
        {/* Top Header Section: Headline & Featured Image (मुख्य चित्र सबसे ऊपर हेडिंग में) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 border-b border-stone-200 bg-stone-50/50 p-4 sm:p-5 rounded-2xl border">
          {/* Left Column (7 cols): Main Headline & Subtitle / Excerpt */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Headline */}
            <div>
              <label className="block text-xs font-extrabold text-stone-900 mb-1.5 flex items-center justify-between">
                <span>मुख्य समाचार शीर्षक (Headline) *</span>
                <span className="text-[10px] text-stone-400 font-bold">शीर्षक आकर्षक व स्पष्ट रखें</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="यहाँ मुख्य शीर्षक दर्ज करें..."
                className="w-full p-3 border border-stone-300 rounded-xl text-sm sm:text-base font-bold text-stone-900 focus:outline-hidden focus:border-[#EA580C]"
              />
            </div>

            {/* Short Subtitle / Excerpt */}
            <div>
              <label className="block text-xs font-extrabold text-stone-900 mb-1.5">
                संक्षिप्त सारांश / सब-टाइटल (Excerpt)
              </label>
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="मुख्य समाचार का 2 लाइन सारांश..."
                className="w-full p-3 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-hidden focus:border-[#EA580C]"
              />
            </div>
          </div>

          {/* Right Column (5 cols): Featured Image directly at the top in heading section */}
          <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <ImageUploadWidget
              value={form.featuredImage}
              onChange={(url) => setForm({ ...form, featuredImage: url })}
              label="मुख्य चित्र (Featured Image) *"
            />
          </div>
        </div>

        {/* ✍️ फोटो अपलोड के साथ पैराग्राफ (Paragraphs with Photo Uploads - User's Exact Feature) */}
        <ParagraphBlockEditor
          value={form.content}
          onChange={(html) => setForm({ ...form, content: html })}
          label="3. फोटो अपलोड के साथ पैराग्राफ (Paragraphs with Photo Uploads)"
          subtitleHint="प्रत्येक पैराग्राफ खंड के लिए उप-शीर्षक, विवरण और फोटो बदलें या नया जोड़ें।"
        />

        {/* Category, Content Type & District Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-stone-100">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-stone-900 mb-1.5">
                सामग्री प्रकार (Content Type)
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 bg-white"
              >
                <option value="news">📰 सामान्य समाचार (News Article)</option>
                <option value="breaking_news">⚡ ब्रेकिंग न्यूज़ (Breaking News Flash)</option>
                <option value="movie_review">🎬 मूवी रिव्यू / फिल्म समीक्षा (Movie Review)</option>
                <option value="series_review">📺 वेब सीरीज़ रिव्यू (Web Series Review)</option>
                <option value="editorial">✍️ संपादकीय (Editorial)</option>
                <option value="opinion">💡 राय व विचार (Opinion / Column)</option>
                <option value="explainer">🔍 व्याख्या व विश्लेषण (Explainer)</option>
                <option value="feature">📄 विशेष फीचर लेख (Special Feature)</option>
                <option value="interview">🎤 साक्षात्कार (Interview)</option>
              </select>
            </div>

            {/* Conditional Movie Review Fields in Edit */}
            {(contentType === 'movie_review' || contentType === 'series_review') && (
              <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
                <span className="font-black text-amber-900 text-xs block">🎬 फिल्म समीक्षा व रेटिंग</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">फिल्म (English)</label>
                    <input
                      type="text"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      placeholder="उदा: Jawan"
                      className="w-full p-1.5 border border-stone-300 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">रेटिंग (Stars / 5)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full p-1.5 border border-stone-300 rounded text-xs font-black text-amber-700 bg-white"
                    >
                      <option value="5.0">⭐⭐⭐⭐⭐ 5.0</option>
                      <option value="4.5">⭐⭐⭐⭐½ 4.5</option>
                      <option value="4.0">⭐⭐⭐⭐ 4.0</option>
                      <option value="3.5">⭐⭐⭐½ 3.5</option>
                      <option value="3.0">⭐⭐⭐ 3.0</option>
                      <option value="2.5">⭐⭐½ 2.5</option>
                      <option value="2.0">⭐⭐ 2.0</option>
                      <option value="1.5">⭐½ 1.5</option>
                      <option value="1.0">⭐ 1.0</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">निर्देशक</label>
                    <input
                      type="text"
                      value={movieDirector}
                      onChange={(e) => setMovieDirector(e.target.value)}
                      placeholder="Director"
                      className="w-full p-1.5 border border-stone-300 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">निर्णय (Verdict)</label>
                    <input
                      type="text"
                      value={verdict}
                      onChange={(e) => setVerdict(e.target.value)}
                      placeholder="उदा: पैसा वसूल"
                      className="w-full p-1.5 border border-stone-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">कलाकार (Cast)</label>
                  <input
                    type="text"
                    value={movieCast}
                    onChange={(e) => setMovieCast(e.target.value)}
                    placeholder="Actors"
                    className="w-full p-1.5 border border-stone-300 rounded text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-900 mb-0.5">स्पॉइलर सामग्री (छिपी हुई)</label>
                  <textarea
                    rows={2}
                    value={spoilersContent}
                    onChange={(e) => setSpoilersContent(e.target.value)}
                    placeholder="क्लाइमेक्स या मुख्य ट्विस्ट..."
                    className="w-full p-1.5 border border-stone-300 rounded text-xs bg-white"
                  />
                </div>
              </div>
            )}

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

            <DistrictMultiSelector
              locations={locations}
              selectedIds={selectedLocationIds}
              onChange={handleLocationIdsChange}
              onOpenAddModal={() => setShowAddLocationModal(true)}
              onQuickInlineAdd={handleQuickInlineAddLocation}
            />

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

        {/* Tags Section */}
        <div className="space-y-3 bg-stone-50/80 p-4 rounded-2xl border border-stone-200 pt-4">
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

        {/* 📢 विशेष रूप से हाइलाइटेड प्रकाशन स्थिति (Specially Highlighted Publishing Status) */}
        <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3.5 shadow-sm ${
          form.status === 'DRAFT'
            ? 'bg-gradient-to-br from-amber-50 via-orange-50/40 to-stone-50 border-amber-400 ring-2 ring-amber-300/30'
            : form.status === 'PUBLISHED'
            ? 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-stone-50 border-emerald-500 ring-2 ring-emerald-300/30'
            : 'bg-stone-50 border-stone-300'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-white shadow-xs border border-stone-200">
                📢
              </span>
              <div>
                <span className="text-sm font-black text-stone-900 tracking-wide flex items-center gap-2">
                  <span>प्रकाशन स्थिति (Publishing Status) *</span>
                </span>
                <p className="text-[11px] text-stone-600 font-medium">
                  यहाँ से तय करें कि समाचार पोर्टल पर लाइव होगा अथवा ड्राफ्ट में सुरक्षित रहेगा
                </p>
              </div>
            </div>

            {/* Dynamic Prominent Current Status Pill */}
            {form.status === 'DRAFT' ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 border border-amber-500 shadow-sm animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-950"></span>
                <span>वर्तमान स्थिति: 🟡 DRAFT (ड्राफ्ट — अप्रसारित)</span>
              </span>
            ) : form.status === 'PUBLISHED' ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white border border-emerald-700 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <span>वर्तमान स्थिति: 🟢 PUBLISHED (लाइव — सार्वजनिक)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-stone-200 text-stone-900 border border-stone-400 shadow-sm">
                <span>वर्तमान स्थिति: 📦 {form.status}</span>
              </span>
            )}
          </div>

          {/* 2 Big High-Contrast Selectable Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* DRAFT CARD */}
            <label
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                form.status === 'DRAFT'
                  ? 'bg-amber-50/90 border-amber-500 ring-4 ring-amber-300/40 shadow-md'
                  : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50/30'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={form.status === 'DRAFT'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-5 h-5 accent-amber-600 cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                  <span className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                    <span className="text-base">📝</span>
                    <span>DRAFT (ड्राफ्ट मोड)</span>
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-400">
                    एडमिन केवल / अप्रसारित
                  </span>
                </div>
                <p className="text-xs font-medium text-amber-900/90 leading-relaxed">
                  यह समाचार वेबसाइट पर <strong>दिखाई नहीं देगा</strong>। केवल आपके एडमिन पैनल में ड्राफ्ट रहेगा ताकि आप समीक्षा या संपादन कर सकें।
                </p>
              </div>
            </label>

            {/* PUBLISHED CARD */}
            <label
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                form.status === 'PUBLISHED'
                  ? 'bg-emerald-50/90 border-emerald-600 ring-4 ring-emerald-300/40 shadow-md'
                  : 'bg-white border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={form.status === 'PUBLISHED'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                  <span className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                    <span className="text-base">🌐</span>
                    <span>PUBLISHED (लाइव करें)</span>
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-400">
                    सार्वजनिक (Live Now)
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-900/90 leading-relaxed">
                  यह समाचार वेबसाइट पर <strong>तुरंत लाइव</strong> हो जाएगा और सभी पाठक एवं दर्शक इसे सार्वजनिक रूप से पढ़ सकेंगे।
                </p>
              </div>
            </label>
          </div>

          <p className="text-[11px] font-bold text-stone-600 flex items-center gap-1.5 pt-1">
            <span className="text-amber-600">💡</span>
            <span>नोट: ड्राफ्ट में समाचार केवल एडमिन को दिखता है। प्रकाशित करने पर यह पोर्टल पर लाइव हो जाता है।</span>
          </p>
        </div>

        {/* Submit Action Bar */}
        <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              ← वापस जाएं
            </button>

            {/* Fulfills: लाइव वेबसाइट पर देखें ऑप्शन यहां पर हो */}
            {form.slug && (
              <Link
                href={`/news/${form.slug}`}
                target="_blank"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 border border-emerald-300 shadow-xs transition-all active:scale-95 cursor-pointer"
                title="इस समाचार को लाइव वेबसाइट पर नए टैब में खोलें"
              >
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>👁️ लाइव वेबसाइट पर देखें</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 1. ड्राफ्ट में सेव करें */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              title="समाचार को ड्राफ्ट के रूप में सहेजें (वेबसाइट पर लाइव नहीं होगा)"
            >
              <FileText className="w-4 h-4" />
              <span>{saving ? 'सहेजा जा रहा है...' : '📁 ड्राफ्ट में सेव करें (Save as Draft)'}</span>
            </button>

            {/* 2. सीधे प्रकाशित करें */}
            <button
              type="button"
              onClick={handlePublishDirectly}
              disabled={saving}
              className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              title="समाचार को सीधे पोर्टल पर लाइव प्रकाशित करें"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'प्रकाशित हो रहा है...' : '🚀 सीधे प्रकाशित करें (Publish Live)'}</span>
            </button>

            {/* 3. प्रकाशित करें और पुश नोटिफिकेशन भेजें */}
            <button
              type="button"
              onClick={handleSaveAndPush}
              disabled={saving}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              title="समाचार लाइव प्रकाशित करें और पाठकों को पुश नोटिफिकेशन भेजें"
            >
              <Bell className="w-4 h-4 animate-bounce" />
              <span>{saving ? 'सहेजा जा रहा है...' : '🔔 प्रकाशित करें और पुश भेजें'}</span>
            </button>
          </div>
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

      {/* Social Post Creator Modal */}
      {showSocialModal && (
        <SocialPostGeneratorModal
          isOpen={showSocialModal}
          onClose={() => setShowSocialModal(false)}
          article={{
            id,
            newsId: articleNewsId,
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt,
            featuredImage: form.featuredImage,
          }}
        />
      )}
    </div>
  );
}
