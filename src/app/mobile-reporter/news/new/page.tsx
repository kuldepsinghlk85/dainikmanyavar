'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  Camera,
  Image as ImageIcon,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Tag,
  Clipboard,
  Sparkles,
} from 'lucide-react';
import VoiceInputButton from '@/components/public/VoiceInputButton';
import ParagraphBlockEditor from '@/components/admin/ParagraphBlockEditor';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import PortalLatestNewsFeed from '@/components/reporter/PortalLatestNewsFeed';

export default function MobileReporterNewStoryPage() {
  const router = useRouter();

  // Form Fields
  const [headline, setHeadline] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [sourceNote, setSourceNote] = useState('');

  // Dropdown options
  const [categories, setCategories] = useState<Array<{ id: string; name: string; nameHi?: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string; nameHi?: string }>>([]);

  // UI state
  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);

  useEffect(() => {
    // 1. Session check & fetch reporter district
    fetch('/api/reporter/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push('/mobile-reporter/login');
          return;
        }
        if (data.data.profile.district) {
          setLocationName(data.data.profile.district);
        }
      })
      .catch(() => router.push('/mobile-reporter/login'));

    // 2. Categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
          if (data.data.length > 0) {
            setCategoryId(data.data[0].id);
          }
        }
      })
      .catch(() => {});

    // 3. Locations
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLocations(data.data);
        }
      })
      .catch(() => {});

    // Restore local autosaved draft
    try {
      const local = localStorage.getItem('mobile_reporter_new_draft');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.headline) setHeadline(parsed.headline);
        if (parsed.subtitle) setSubtitle(parsed.subtitle);
        if (parsed.content) setContent(parsed.content);
        if (parsed.featuredImage) setFeaturedImage(parsed.featuredImage);
        if (parsed.categoryId) setCategoryId(parsed.categoryId);
        if (parsed.locationName) setLocationName(parsed.locationName);
        if (parsed.sourceNote) setSourceNote(parsed.sourceNote);
      }
    } catch (_) {}
  }, [router]);

  // Autosave to localStorage every 15s
  useEffect(() => {
    const timer = setInterval(() => {
      if (headline.trim() || content.trim()) {
        try {
          localStorage.setItem(
            'mobile_reporter_new_draft',
            JSON.stringify({
              headline,
              subtitle,
              content,
              featuredImage,
              categoryId,
              locationName,
              sourceNote,
              savedAt: new Date().toISOString(),
            })
          );
          setAutoSavedTime(
            new Date().toLocaleTimeString('hi-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        } catch (_) {}
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [headline, subtitle, content, featuredImage, categoryId, locationName, sourceNote]);

  const handleSubmit = async (submitStatus: 'DRAFT' | 'SUBMITTED') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!headline.trim()) {
      setErrorMsg('कृपया मुख्य शीर्षक दर्ज करें');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!content.trim()) {
      setErrorMsg('कृपया समाचार का विवरण दर्ज करें');
      return;
    }

    if (submitStatus === 'DRAFT') {
      setSavingDraft(true);
    } else {
      setSubmittingReview(true);
    }

    try {
      const payload = {
        headline: headline.trim(),
        subtitle: subtitle.trim() || null,
        categoryId: categoryId || null,
        locationName: locationName.trim() || null,
        eventDate: eventDate ? new Date(eventDate).toISOString() : null,
        excerpt: headline.trim().slice(0, 160),
        content,
        featuredImage: featuredImage || null,
        sourceNote: sourceNote.trim() || null,
        status: submitStatus,
      };

      const res = await fetch('/api/reporter/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'खबर सुरक्षित करने में समस्या आई');
        setSavingDraft(false);
        setSubmittingReview(false);
        return;
      }

      try {
        localStorage.removeItem('mobile_reporter_new_draft');
      } catch (_) {}

      setSuccessMsg(
        submitStatus === 'DRAFT'
          ? 'खबर ड्राफ्ट में सुरक्षित कर ली गई है!'
          : 'खबर एडमिन को समीक्षा के लिए सफलतापूर्वक भेज दी गई है!'
      );

      setTimeout(() => {
        router.push('/mobile-reporter');
      }, 1200);
    } catch (_) {
      setErrorMsg('सर्वर से संपर्क करने में समस्या आई');
      setSavingDraft(false);
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <Link
          href="/mobile-reporter"
          className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4 text-[#EA580C]" />
          <span>डैशबोर्ड</span>
        </Link>
        <div className="text-right">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
            नई खबर
          </span>
          {autoSavedTime && (
            <p className="text-[9px] text-stone-400 mt-0.5">ऑटो-सेव: {autoSavedTime}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Main Headline with Hindi Voice Input */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-stone-900 flex items-center gap-1">
            <span>मुख्य शीर्षक (Headline)</span>
            <span className="text-red-500">*</span>
          </label>
          <VoiceInputButton
            onTranscript={(text) => setHeadline(text)}
            currentValue={headline}
            mode="replace"
            size="sm"
            placeholderHint="शीर्षक बोलें..."
          />
        </div>
        <textarea
          rows={2}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="समाचार का मुख्य शीर्षक लिखें या माइक दबाकर बोलें..."
          className="w-full p-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-bold focus:outline-hidden focus:border-orange-500 shadow-xs"
        />

        {/* Subtitle */}
        <div>
          <label className="text-[11px] font-bold text-stone-600 block mb-1">
            उप-शीर्षक (वैकल्पिक)
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="खबर से जुड़ा महत्वपूर्ण उप-शीर्षक..."
            className="w-full p-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* 2. Category & District */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs space-y-3">
        <div>
          <label className="text-xs font-black text-stone-900 flex items-center gap-1 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-orange-600" />
            <span>समाचार श्रेणी (Category)</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold focus:outline-hidden focus:border-orange-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameHi || c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-black text-stone-900 flex items-center gap-1 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span>स्थान / जिला (Location)</span>
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="जौनपुर, वाराणसी, लखनऊ..."
            className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* 3. Featured Image (Camera / Gallery Upload) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs space-y-2">
        <label className="text-xs font-black text-stone-900 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
            <span>मुख्य फोटो (Featured Photo)</span>
          </span>
          <span className="text-[10px] text-stone-400 font-normal">गैलरी / कैमरा</span>
        </label>

        <ImageUploadWidget
          value={featuredImage}
          onChange={(url) => setFeaturedImage(url)}
          label="मुख्य फोटो अपलोड करें या गैलरी से चुनें"
        />
      </div>

      {/* 4. Detailed News Content with Paragraph Block Editor */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs space-y-2">
        <label className="text-xs font-black text-stone-900 flex items-center gap-1">
          <span>समाचार का पूरा विवरण</span>
          <span className="text-red-500">*</span>
        </label>

        <ParagraphBlockEditor
          value={content}
          onChange={(html) => setContent(html)}
          label="पैराग्राफ जोड़ें, फोटो लगाएं या बोलकर लिखें"
        />
      </div>

      {/* 5. Source Note / Reference */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs space-y-1.5">
        <label className="text-xs font-bold text-stone-700">
          स्रोत / विशेष टिप्पणी (वैकल्पिक)
        </label>
        <input
          type="text"
          value={sourceNote}
          onChange={(e) => setSourceNote(e.target.value)}
          placeholder="जैसे: प्रत्यक्षदर्शी के अनुसार, प्रेस नोट..."
          className="w-full p-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-orange-500"
        />
      </div>

      {/* 6. Live Portal News Reference Section */}
      <div className="pt-2">
        <PortalLatestNewsFeed />
      </div>

      {/* 7. Sticky Mobile Action Bar at Bottom */}
      <div className="fixed bottom-14 left-0 right-0 z-40 flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl rounded-2xl p-2 flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={savingDraft || submittingReview}
            className="flex-1 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-stone-500" />}
            <span>ड्राफ्ट सेव</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={savingDraft || submittingReview}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 text-white text-xs font-black shadow-md shadow-orange-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {submittingReview ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>समीक्षा हेतु भेजें 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
}
