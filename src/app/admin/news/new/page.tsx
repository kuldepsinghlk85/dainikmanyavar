'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import HtmlContentEditor from '@/components/admin/HtmlContentEditor';
import ParagraphBlockEditor, { ParagraphBlock, serializeBlocksToHtml } from '@/components/admin/ParagraphBlockEditor';
import VoiceInputButton from '@/components/public/VoiceInputButton';
import AutoTranslateButton from '@/components/admin/AutoTranslateButton';
import DistrictMultiSelector from '@/components/admin/DistrictMultiSelector';
import AkhbarSeKhabarBanner from '@/components/admin/AkhbarSeKhabarBanner';
import { EnrichedEditorialStory } from '@/components/admin/AkhbarSeKhabarModal';
import { ArrowLeft, Save, ExternalLink, Plus, MapPin, Upload, X, CheckCircle2, Bell, FileText, Send } from 'lucide-react';

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
  slug?: string;
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
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isMainStory, setIsMainStory] = useState(false);
  const [status, setStatus] = useState('DRAFT');
  const [allowAudio, setAllowAudio] = useState(true);

  // Content Type, Movie Review & Push states
  const [contentType, setContentType] = useState('news');
  const [sendPushNotification, setSendPushNotification] = useState(false);
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
    setSelectedTagIds((prev) => {
      const isSelecting = !prev.includes(tagId);
      const next = isSelecting ? [...prev, tagId] : prev.filter((id) => id !== tagId);

      if (isSelecting && !locationId) {
        const tag = availableTags.find((t) => t.id === tagId);
        if (tag) {
          const cleanName = tag.name.replace(/^#+/, '').trim().toLowerCase();
          const matchedLoc = locations.find(
            (l) => l.name.trim().toLowerCase() === cleanName || (l.slug && l.slug.trim().toLowerCase() === cleanName)
          );
          if (matchedLoc) {
            setLocationId(matchedLoc.id);
          }
        }
      }
      return next;
    });
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

  const handleLocationIdsChange = (newIds: string[]) => {
    setSelectedLocationIds(newIds);
    setLocationId(newIds[0] || '');

    // Sync with selectedTagIds
    const locNames = locations.map((l) => l.name.trim().toLowerCase());
    const selectedLocNames = newIds
      .map((id) => locations.find((l) => l.id === id)?.name.trim().toLowerCase())
      .filter(Boolean) as string[];

    const remainingTagIds = selectedTagIds.filter((tid) => {
      const tag = availableTags.find((t) => t.id === tid);
      if (!tag) return true;
      const cleanName = tag.name.replace(/^#+/, '').trim().toLowerCase();
      if (locNames.includes(cleanName) && !selectedLocNames.includes(cleanName)) {
        return false;
      }
      return true;
    });

    const updatedTagIds = [...remainingTagIds];
    selectedLocNames.forEach((name) => {
      const matchedTag = availableTags.find(
        (t) => t.name.replace(/^#+/, '').trim().toLowerCase() === name
      );
      if (matchedTag && !updatedTagIds.includes(matchedTag.id)) {
        updatedTagIds.push(matchedTag.id);
      }
    });

    setSelectedTagIds(updatedTagIds);
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

    const trimmed = newLocName.trim().toLowerCase();
    const existing = locations.find((l) => l.name.trim().toLowerCase() === trimmed);
    if (existing) {
      if (!selectedLocationIds.includes(existing.id)) {
        handleLocationIdsChange([...selectedLocationIds, existing.id]);
      }
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
        handleLocationIdsChange([...selectedLocationIds, createdLoc.id]);
        setShowAddLocationModal(false);
        setNewLocName('');
        setNewLocImage('');
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
    setError('');

    if (!title || !content || !primaryCategoryId) {
      setError('कृपया शीर्षक, समाचार विवरण और प्राथमिक श्रेणी अवश्य दर्ज करें।');
      return;
    }

    const finalStatus = overrideStatus || status || 'DRAFT';
    if (overrideStatus && overrideStatus !== status) {
      setStatus(overrideStatus);
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
          locationId: selectedLocationIds[0] || null,
          locationIds: selectedLocationIds,
          tagIds: selectedTagIds,
          isBreaking,
          isFeatured,
          isMainStory,
          status: finalStatus,
          allowAudio,
          contentType,
          sendPushNotification: redirectToPush ? false : sendPushNotification,
          movieReview:
            contentType === 'movie_review' || contentType === 'series_review'
              ? {
                  movieTitle: movieTitle || title,
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
        if (redirectToPush && data.data?.id) {
          router.push(`/admin/notifications?newsId=${data.data.id}`);
        } else {
          router.push('/admin/news');
        }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitInternal(status || 'DRAFT', false);
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

  const handleApplyAkhbarDraft = (draft: EnrichedEditorialStory) => {
    if (draft.headline) setTitle(draft.headline);
    if (draft.secondaryHeadline) setSubtitle(draft.secondaryHeadline);
    if (draft.excerpt) setExcerpt(draft.excerpt);
    if (draft.contentType) setContentType(draft.contentType);
    if (draft.resolvedCategoryId) setPrimaryCategoryId(draft.resolvedCategoryId);
    if (draft.resolvedLocationId) {
      handleLocationIdsChange([draft.resolvedLocationId]);
    }
    if (draft.resolvedTagIds && draft.resolvedTagIds.length > 0) {
      setSelectedTagIds(draft.resolvedTagIds);
    }
    if (draft.featuredImage) {
      setFeaturedImage(draft.featuredImage);
    }
    if (draft.paragraphBlocks && draft.paragraphBlocks.length > 0) {
      const blocks: ParagraphBlock[] = draft.paragraphBlocks.map((b, idx) => ({
        id: 'block_' + Date.now() + '_' + idx,
        subtitle: b.subtitle || '',
        text: b.text || '',
        imageUrl: '',
        imageCaption: b.imageCaption || '',
      }));
      setContent(serializeBlocksToHtml(blocks));
    }
    // Strictly force publication status to DRAFT
    setStatus('DRAFT');
  };

  // Auto-apply pending draft from /admin/akhbar-se-khabar if stored
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const pending = sessionStorage.getItem('dm_pending_akhbar_draft');
      if (pending) {
        sessionStorage.removeItem('dm_pending_akhbar_draft');
        const draft = JSON.parse(pending);
        handleApplyAkhbarDraft(draft);
      }
    } catch (err) {
      console.error('Failed to load pending akhbar draft:', err);
    }
  }, [availableTags, locations, categories]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-stone-600" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold text-stone-900">नया समाचार जोड़ें (Add News)</h1>
              {status === 'DRAFT' ? (
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 border border-amber-500 shadow-xs flex items-center gap-1.5 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-900"></span>
                  <span>🟡 स्थिति: ड्राफ्ट मोड (DRAFT)</span>
                </span>
              ) : (
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-white border border-emerald-600 shadow-xs flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                  <span>🟢 स्थिति: लाइव प्रकाशित (LIVE)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">सभी फ़ील्ड्स भरें और चित्र अपलोड करें</p>
          </div>
        </div>

        {/* 🌐 Auto Translate to Hindi Button */}
        <AutoTranslateButton
          currentData={{ title, subtitle, excerpt, content }}
          onTranslate={(translated) => {
            if (translated.title) setTitle(translated.title);
            if (translated.subtitle) setSubtitle(translated.subtitle);
            if (translated.excerpt) setExcerpt(translated.excerpt);
            if (translated.content) setContent(translated.content);
          }}
        />
      </div>

      {/* 📰 अखबार से खबर (PDF / इमेज / क्लिपबोर्ड से समाचार तैयार करें) */}
      <AkhbarSeKhabarBanner
        onApplyDraft={handleApplyAkhbarDraft}
        existingFormFilled={Boolean(title.trim() || content.trim())}
      />

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-bold">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        {/* Top Header Section: Headline & Featured Image (मुख्य चित्र सबसे ऊपर हेडिंग में) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-5 border-b border-stone-200 bg-stone-50/50 p-4 sm:p-5 rounded-2xl border">
          {/* Left Column (7 cols): Title & Subtitle */}
          <div className="lg:col-span-7 space-y-4">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">मुख्य शीर्षक (Headline) *</label>
                <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-lg">
                  <VoiceInputButton
                    mode="append"
                    onTranscript={(txt) => setTitle(txt)}
                    currentValue={title}
                    placeholderHint="मुख्य शीर्षक बोलिए..."
                    size="sm"
                  />
                  <span className="text-[10px] font-bold text-stone-600 select-none">बोलकर लिखें</span>
                </div>
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="समाचार का मुख्य शीर्षक दर्ज करें..."
                className="w-full p-3 border border-stone-300 rounded-lg text-base font-bold focus:outline-hidden focus:border-[#F97316]"
              />
            </div>

            {/* Subtitle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">उप-शीर्षक (Secondary Headline)</label>
                <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-lg">
                  <VoiceInputButton
                    mode="append"
                    onTranscript={(txt) => setSubtitle(txt)}
                    currentValue={subtitle}
                    placeholderHint="उप-शीर्षक बोलिए..."
                    size="sm"
                  />
                  <span className="text-[10px] font-bold text-stone-600 select-none">बोलकर लिखें</span>
                </div>
              </div>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="उप-शीर्षक / महत्वपूर्ण बिंदु..."
                className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-hidden focus:border-[#F97316]"
              />
            </div>
          </div>

          {/* Right Column (5 cols): Featured Image directly at the top in heading section */}
          <div className="lg:col-span-5 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <ImageUploader
              label="मुख्य चित्र (Featured Image) *"
              value={featuredImage}
              onChange={(url) => setFeaturedImage(url)}
            />
          </div>
        </div>

        {/* Content Type Selector */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              सामग्री प्रकार (Content Type / Format) *
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-bold bg-white focus:outline-none focus:border-[#F97316]"
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

          {/* Conditional Movie Review Fields */}
          {(contentType === 'movie_review' || contentType === 'series_review') && (
            <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <span>🎬 फिल्म समीक्षा व रेटिंग विवरण (Movie Scorecard Details)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">फिल्म का नाम (English) *</label>
                  <input
                    type="text"
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    placeholder="उदा: Jawan, Stree 2..."
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">फिल्म का नाम (हिंदी)</label>
                  <input
                    type="text"
                    value={movieTitleHindi}
                    onChange={(e) => setMovieTitleHindi(e.target.value)}
                    placeholder="उदा: जवान, स्त्री 2..."
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">रेटिंग (Stars out of 5) *</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs font-black text-amber-700 bg-white"
                  >
                    <option value="5.0">⭐⭐⭐⭐⭐ (5.0 / 5) - ऑल टाइम क्लासिक</option>
                    <option value="4.5">⭐⭐⭐⭐½ (4.5 / 5) - शानदार / ब्लॉकबस्टर</option>
                    <option value="4.0">⭐⭐⭐⭐ (4.0 / 5) - बेहतरीन</option>
                    <option value="3.5">⭐⭐⭐½ (3.5 / 5) - पैसा वसूल</option>
                    <option value="3.0">⭐⭐⭐ (3.0 / 5) - एक बार देखने लायक</option>
                    <option value="2.5">⭐⭐½ (2.5 / 5) - औसत</option>
                    <option value="2.0">⭐⭐ (2.0 / 5) - कमज़ोर</option>
                    <option value="1.5">⭐½ (1.5 / 5) - निराशाजनक</option>
                    <option value="1.0">⭐ (1.0 / 5) - मत देखिए</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">निर्देशक (Director)</label>
                  <input
                    type="text"
                    value={movieDirector}
                    onChange={(e) => setMovieDirector(e.target.value)}
                    placeholder="उदा: Atlee..."
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">मुख्य कलाकार (Cast)</label>
                  <input
                    type="text"
                    value={movieCast}
                    onChange={(e) => setMovieCast(e.target.value)}
                    placeholder="उदा: Shah Rukh Khan, Nayanthara..."
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">प्लेटफ़ॉर्म / रिलीज़ (Platform)</label>
                  <input
                    type="text"
                    value={ottPlatform}
                    onChange={(e) => setOttPlatform(e.target.value)}
                    placeholder="उदा: सिनेमाघर / Netflix / Prime..."
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">खूबियां (Positives)</label>
                  <textarea
                    rows={2}
                    value={positives}
                    onChange={(e) => setPositives(e.target.value)}
                    placeholder="• शानदार एक्शन सीन्स&#10;• कलाकारों का अभिनय..."
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-red-800 mb-1">कमियां (Negatives)</label>
                  <textarea
                    rows={2}
                    value={negatives}
                    onChange={(e) => setNegatives(e.target.value)}
                    placeholder="• स्क्रीनप्ले दूसरे हाफ में धीमा&#10;• गानों की गैरजरूरी भरमार..."
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  ⚠️ स्पॉइलर कंटेंट (Spoiler Details - Hidden behind user click)
                </label>
                <textarea
                  rows={2}
                  value={spoilersContent}
                  onChange={(e) => setSpoilersContent(e.target.value)}
                  placeholder="कहानी के ट्विस्ट्स या क्लाइमेक्स (यह पाठक के क्लिक करने पर ही दिखेगा)..."
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          )}
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

          <div className="md:col-span-2">
            <DistrictMultiSelector
              locations={locations}
              selectedIds={selectedLocationIds}
              onChange={handleLocationIdsChange}
              onOpenAddModal={() => setShowAddLocationModal(true)}
              onQuickInlineAdd={handleQuickInlineAddLocation}
            />
          </div>
        </div>

        {/* 📢 विशेष रूप से हाइलाइटेड प्रकाशन स्थिति (Specially Highlighted Publishing Status) */}
        <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3.5 shadow-sm ${
          status === 'DRAFT'
            ? 'bg-gradient-to-br from-amber-50 via-orange-50/40 to-stone-50 border-amber-400 ring-2 ring-amber-300/30'
            : 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-stone-50 border-emerald-500 ring-2 ring-emerald-300/30'
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
                  यहाँ से तय करें कि समाचार तुरंत पोर्टल पर लाइव होगा अथवा ड्राफ्ट में सुरक्षित रहेगा
                </p>
              </div>
            </div>

            {/* Dynamic Prominent Current Status Pill */}
            {status === 'DRAFT' ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 border border-amber-500 shadow-sm animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-950"></span>
                <span>वर्तमान स्थिति: 🟡 DRAFT (ड्राफ्ट — अप्रसारित)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white border border-emerald-700 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <span>वर्तमान स्थिति: 🟢 PUBLISHED (लाइव — सार्वजनिक)</span>
              </span>
            )}
          </div>

          {/* 2 Big High-Contrast Selectable Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* DRAFT CARD */}
            <label
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                status === 'DRAFT'
                  ? 'bg-amber-50/90 border-amber-500 ring-4 ring-amber-300/40 shadow-md'
                  : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50/30'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={status === 'DRAFT'}
                  onChange={(e) => setStatus(e.target.value)}
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
                    ★ डिफ़ॉल्ट (ऑफलाइन)
                  </span>
                </div>
                <p className="text-xs font-medium text-amber-900/90 leading-relaxed">
                  यह समाचार वेबसाइट पर <strong>दिखाई नहीं देगा</strong>। केवल एडमिन पैनल में ड्राफ्ट रहेगा ताकि आप समीक्षा या संपादन कर सकें।
                </p>
              </div>
            </label>

            {/* PUBLISHED CARD */}
            <label
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                status === 'PUBLISHED'
                  ? 'bg-emerald-50/90 border-emerald-600 ring-4 ring-emerald-300/40 shadow-md'
                  : 'bg-white border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={status === 'PUBLISHED'}
                  onChange={(e) => setStatus(e.target.value)}
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
            <span>नोट: कतरन या OCR से बना समाचार हमेशा सुरक्षित ड्राफ्ट में रहता है, जिसे आप यहाँ से कभी भी लाइव कर सकते हैं।</span>
          </p>
        </div>

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
            <div className="relative flex-1">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="नया टैग नाम दर्ज करें..."
                className="w-full p-2 pr-9 text-xs border border-stone-300 rounded focus:outline-none focus:border-[#F97316]"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <VoiceInputButton
                  mode="append"
                  onTranscript={(txt) => setNewTagName(txt)}
                  currentValue={newTagName}
                  placeholderHint="टैग बोलिए..."
                  size="sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCreateNewTag}
              className="bg-[#F97316] text-white text-xs font-bold px-3 py-2 rounded hover:bg-[#EA580C] cursor-pointer"
            >
              + नया टैग जोड़ें
            </button>
          </div>
        </div>

        {/* Excerpt Summary */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-stone-700">संक्षिप्त विवरण (Excerpt Summary)</label>
            <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-lg">
              <VoiceInputButton
                mode="append"
                onTranscript={(txt) => setExcerpt(txt)}
                currentValue={excerpt}
                placeholderHint="संक्षिप्त विवरण बोलिए..."
                size="sm"
              />
              <span className="text-[10px] font-bold text-stone-600 select-none">बोलकर लिखें</span>
            </div>
          </div>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="समाचार का 2-3 पंक्तियों का संक्षिप्त विवरण..."
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* ✍️ फोटो अपलोड के साथ पैराग्राफ (Paragraphs with Photo Uploads - User's Exact Feature) */}
        <ParagraphBlockEditor
          value={content}
          onChange={(html) => setContent(html)}
          label="3. फोटो अपलोड के साथ पैराग्राफ (Paragraphs with Photo Uploads)"
          subtitleHint="प्रत्येक पैराग्राफ खंड के लिए उप-शीर्षक, विवरण और फोटो बदलें या नया जोड़ें।"
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

        {/* Instant Push Notification Trigger */}
        <div className="p-3.5 bg-red-50/80 rounded-xl border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-red-100 text-red-600 rounded-lg">🔔</span>
            <div>
              <div className="text-xs font-bold text-red-950">
                वेब व मोबाइल पुश नोटिफिकेशन भेजें (Send Push Broadcast)
              </div>
              <div className="text-[11px] text-red-700">
                समाचार प्रकाशित होते ही सभी सक्रिय पाठकों के फोन/स्क्रीन पर नोटिफिकेशन जाएगा
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={sendPushNotification}
            onChange={(e) => setSendPushNotification(e.target.checked)}
            className="w-4 h-4 text-red-600 rounded cursor-pointer"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-stone-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            रद्द करें
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {/* 1. ड्राफ्ट में सेव करें (Save as Draft - Default) */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="समाचार को ड्राफ्ट के रूप में सहेजें (वेबसाइट पर लाइव नहीं होगा)"
            >
              <FileText className="w-4 h-4" />
              <span>{loading ? 'सहेजा जा रहा है...' : '📁 ड्राफ्ट में सेव करें (Save as Draft)'}</span>
            </button>

            {/* 2. सीधे प्रकाशित करें (Publish Directly Live) */}
            <button
              type="button"
              onClick={handlePublishDirectly}
              disabled={loading}
              className="bg-[#EA580C] hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="समाचार को सीधे पोर्टल पर लाइव प्रकाशित करें"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'प्रकाशित हो रहा है...' : '🚀 सीधे प्रकाशित करें (Publish Live)'}</span>
            </button>

            {/* 3. प्रकाशित करें और पुश नोटिफिकेशन में भेजें */}
            <button
              type="button"
              onClick={handleSaveAndPush}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="समाचार लाइव प्रकाशित करें और पाठकों के फ़ोन/स्क्रीन पर पुश नोटिफिकेशन भेजें"
            >
              <Bell className="w-4 h-4 animate-bounce" />
              <span>{loading ? 'सहेजा जा रहा है...' : '🔔 प्रकाशित करें और पुश भेजें'}</span>
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
    </div>
  );
}
