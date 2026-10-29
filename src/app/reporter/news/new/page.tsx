'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Mic,
  Clipboard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Tag,
  UserCheck,
  Eye,
} from 'lucide-react';
import VoiceInputButton from '@/components/public/VoiceInputButton';
import ParagraphBlockEditor from '@/components/admin/ParagraphBlockEditor';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import ReporterHeader from '@/components/reporter/ReporterHeader';
import PortalLatestNewsFeed from '@/components/reporter/PortalLatestNewsFeed';

interface AdditionalImage {
  url: string;
  caption: string;
}

export default function ReporterNewStoryPage() {
  const router = useRouter();

  // Reporter Session Info
  const [profile, setProfile] = useState<{
    id: string;
    reporterId: string;
    fullName: string;
    designation: string;
    district: string | null;
    photo: string | null;
  } | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Form Fields
  const [headline, setHeadline] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<AdditionalImage[]>([]);
  const [sourceNote, setSourceNote] = useState('');

  // Dropdown options
  const [categories, setCategories] = useState<Array<{ id: string; name: string; nameHi?: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string; nameHi?: string }>>([]);

  // UI state
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);

  const featuredFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Reporter Session, Categories, and Locations
  useEffect(() => {
    fetch('/api/reporter/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push('/reporter/login');
          return;
        }
        setProfile(data.data.profile);
        if (data.data.stats) {
          setStats(data.data.stats);
        }
        if (data.data.profile.district) {
          setLocationName(data.data.profile.district);
        }
        if (data.data.profile.locationId) {
          setLocationId(data.data.profile.locationId);
        }
      })
      .catch(() => router.push('/reporter/login'));

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

    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLocations(data.data);
        }
      })
      .catch(() => {});

    // Restore local autosaved draft if available
    try {
      const local = localStorage.getItem('reporter_new_draft');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.headline) setHeadline(parsed.headline);
        if (parsed.subtitle) setSubtitle(parsed.subtitle);
        if (parsed.excerpt) setExcerpt(parsed.excerpt);
        if (parsed.content) setContent(parsed.content);
        if (parsed.featuredImage) setFeaturedImage(parsed.featuredImage);
        if (parsed.categoryId) setCategoryId(parsed.categoryId);
        if (parsed.locationName) setLocationName(parsed.locationName);
        if (parsed.sourceNote) setSourceNote(parsed.sourceNote);
        if (parsed.additionalImages) setAdditionalImages(parsed.additionalImages);
      }
    } catch (_) {}
  }, []);

  // Autosave to localStorage every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (headline.trim() || content.trim()) {
        try {
          localStorage.setItem(
            'reporter_new_draft',
            JSON.stringify({
              headline,
              subtitle,
              excerpt,
              content,
              featuredImage,
              categoryId,
              locationName,
              locationId,
              sourceNote,
              additionalImages,
              savedAt: new Date().toISOString(),
            })
          );
          setAutoSavedTime(
            new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
          );
        } catch (_) {}
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [headline, subtitle, excerpt, content, featuredImage, categoryId, locationName, locationId, sourceNote, additionalImages]);

  // Handle Featured Image Upload
  const handleFeaturedImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingFeatured(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'reporter');
      formData.append('caption', file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFeaturedImage(data.url);
      } else {
        setErrorMsg(data.error || 'फोटो अपलोड करने में त्रुटि हुई');
      }
    } catch (_) {
      setErrorMsg('फोटो अपलोड करने में समस्या आई');
    } finally {
      setUploadingFeatured(false);
    }
  };

  // Handle Additional Image Upload
  const handleAdditionalImageUpload = async (file: File, index: number) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'reporter_extra');
      formData.append('caption', file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setAdditionalImages((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], url: data.url };
          return updated;
        });
      }
    } catch (_) {
      alert('अतिरिक्त फोटो अपलोड करने में समस्या आई');
    }
  };

  const addAdditionalImageSlot = () => {
    setAdditionalImages((prev) => [...prev, { url: '', caption: '' }]);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveAdditionalImage = (index: number, direction: 'up' | 'down') => {
    setAdditionalImages((prev) => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // Clipboard Paste Helper
  const handleClipboardPaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
          setSuccessMsg('क्लिपबोर्ड से टेक्स्ट पेस्ट कर दिया गया');
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      } else {
        alert('कृपया सीधे टेक्स्ट एरिया में पेस्ट (Ctrl+V) करें');
      }
    } catch (_) {
      alert('क्लिपबोर्ड एक्सेस करने की अनुमति नहीं है। कृपया मैन्युअल पेस्ट करें।');
    }
  };

  // Submit Handler
  const handleSubmit = async (submitStatus: 'DRAFT' | 'SUBMITTED') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!headline.trim()) {
      setErrorMsg('कृपया मुख्य शीर्षक दर्ज करें');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('कृपया समाचार का पूरा विवरण दर्ज करें');
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
        locationId: locationId || null,
        locationName: locationName.trim() || null,
        eventDate: eventDate ? new Date(eventDate).toISOString() : null,
        excerpt: excerpt.trim() || headline.trim().slice(0, 160),
        content,
        featuredImage: featuredImage || null,
        additionalImages: additionalImages.filter((img) => img.url),
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

      // Clear local autosave draft
      try {
        localStorage.removeItem('reporter_new_draft');
      } catch (_) {}

      setSuccessMsg(
        submitStatus === 'DRAFT'
          ? 'खबर ड्राफ्ट में सुरक्षित कर ली गई है!'
          : 'खबर एडमिन को समीक्षा के लिए सफलतापूर्वक भेज दी गई है!'
      );

      setTimeout(() => {
        router.push('/reporter');
      }, 1200);
    } catch (err: any) {
      setErrorMsg('सर्वर से संपर्क करने में समस्या आई');
      setSavingDraft(false);
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between">
      {/* 1. Authentic Dainik Manyavar Header for Entire Reporter Section */}
      <ReporterHeader profile={profile} stats={stats} />

      {/* 2. Sub-Header Action Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/reporter"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
              title="डैशबोर्ड पर वापस जाएं"
            >
              <ArrowLeft className="w-4 h-4 text-[#EA580C]" />
              <span className="hidden sm:inline">डैशबोर्ड</span>
            </Link>
            <div className="border-l border-stone-200 pl-3">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-stone-900 flex items-center gap-2">
                <span>नई खबर तैयार करें</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  संवाददाता फॉर्म
                </span>
              </h1>
              {autoSavedTime && (
                <p className="text-[10px] text-stone-400">
                  स्वतः ड्राफ्ट सुरक्षित: {autoSavedTime}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons in Sub-Header */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              disabled={savingDraft || submittingReview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-stone-500" />}
              <span className="hidden sm:inline">ड्राफ्ट सेव करें</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('SUBMITTED')}
              disabled={savingDraft || submittingReview}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-black shadow-md shadow-orange-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submittingReview ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>समीक्षा हेतु भेजें</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* 1. Top Header Section: Headline & Featured Image (मुख्य चित्र सबसे ऊपर हेडिंग में - एडमिन जैसा लुक) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            {/* Left Column (7 cols): Main Headline, Subtitle & Excerpt */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>मुख्य समाचार शीर्षक (Main Headline) *</span>
                  </label>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <VoiceInputButton
                      onTranscript={(full) => setHeadline(full)}
                      mode="replace"
                      currentValue={headline}
                      size="sm"
                    />
                    <span className="text-[11px] text-stone-400">बोलकर लिखें</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="समाचार का मुख्य और आकर्षक शीर्षक दर्ज करें..."
                  className="w-full text-base sm:text-lg font-bold bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl px-4 py-3 text-stone-900 dark:text-white focus:outline-none focus:border-[#EA580C] transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-stone-800 dark:text-stone-200">
                    उप-शीर्षक (Subtitle / Second Lead)
                  </label>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <VoiceInputButton
                      onTranscript={(full) => setSubtitle(full)}
                      mode="replace"
                      currentValue={subtitle}
                      size="sm"
                    />
                    <span className="text-[11px] text-stone-400">बोलकर लिखें</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="वैकल्पिक उप-शीर्षक (खबर का पूरक संदर्भ)..."
                  className="w-full text-sm bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl px-4 py-2.5 text-stone-900 dark:text-white focus:outline-none focus:border-[#EA580C] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-stone-800 dark:text-stone-200">
                    संक्षिप्त सारांश / विवरण (Excerpt / Intro Summary)
                  </label>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <VoiceInputButton
                      onTranscript={(full) => setExcerpt(full)}
                      mode="replace"
                      currentValue={excerpt}
                      size="sm"
                    />
                    <span className="text-[11px] text-stone-400">बोलकर लिखें</span>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="खबर का 1-2 पंक्तियों में मुख्य सार..."
                  className="w-full text-xs sm:text-sm bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl p-3 text-stone-900 dark:text-white focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            {/* Right Column (5 cols): Featured Image directly at the top with Computer & Gallery upload */}
            <div className="lg:col-span-5 bg-stone-50/70 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
              <ImageUploadWidget
                value={featuredImage}
                onChange={(url) => setFeaturedImage(url)}
                label="मुख्य चित्र (Featured Image) *"
              />
            </div>
          </div>

          {/* 2. ✍️ फोटो अपलोड के साथ पैराग्राफ व पूर्ण HTML / विज़ुअल एडिटर (Exact Admin Look & Feel) */}
          <ParagraphBlockEditor
            value={content}
            onChange={(html) => setContent(html)}
            label="3. फोटो अपलोड के साथ पैराग्राफ (Paragraphs with Photo Uploads)"
            subtitleHint="प्रत्येक पैराग्राफ खंड के लिए उप-शीर्षक, विवरण और फोटो बदलें या नया जोड़ें। बोल्ड, इटैलिक, बड़ा फॉन्ट और विज़ुअल एडिटर का उपयोग करें।"
          />

          {/* 3. Category, District & Event Date */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  समाचार की श्रेणी (Category) *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:border-[#EA580C]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameHi || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  संबंधित जिला / कार्यक्षेत्र
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="उदा. जौनपुर, वाराणसी, लखनऊ..."
                  className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  घटना की तारीख (Event Date - यदि आवश्यक हो)
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>
          </div>





          {/* Card 6: Source & Note for Editor */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              वैकल्पिक स्रोत या संपादक के लिए नोट (Note for Editor)
            </label>
            <p className="text-[11px] text-stone-400 mb-2">
              यदि कोई विशेष स्रोत, प्रत्यक्षदर्शी या डेस्क एडिटर के लिए कोई संदेश हो तो यहाँ लिखें (यह जनता को नहीं दिखेगा)
            </p>
            <textarea
              rows={2}
              value={sourceNote}
              onChange={(e) => setSourceNote(e.target.value)}
              placeholder="संपादक के लिए कोई टिप्पणी या संदर्भ..."
              className="w-full text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Card 7: Verified Reporter Card (Byline Verification) */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-stone-50 dark:from-stone-900 dark:via-orange-950/20 dark:to-stone-900 border-2 border-orange-200 dark:border-orange-900/40 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black flex items-center justify-center text-lg shadow-md shrink-0 overflow-hidden">
                {profile?.photo ? (
                  <img src={profile.photo} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  profile?.fullName?.slice(0, 1) || 'र'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> प्रमाणित रिपोर्टर विवरण (Reporter Byline)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-orange-200 dark:border-orange-800 text-[10px] font-bold text-stone-600 dark:text-stone-300">
                    {profile?.reporterId}
                  </span>
                </div>
                <p className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">
                  रिपोर्टर: {profile?.fullName} | {profile?.designation || 'संवाददाता'}
                  {locationName ? ` | ${locationName}` : ''}
                </p>
                <p className="text-[11px] text-stone-400">
                  यह खबर आपके प्रमाणित संवाददाता खाते से सबमिट होगी। सुरक्षा कारणों से रिपोर्टर पहचान अपरिवर्तनीय है।
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Submission Actions */}
          <div className="pt-2 pb-6 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              disabled={savingDraft || submittingReview}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>ड्राफ्ट सेव करें (Save as Draft)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('SUBMITTED')}
              disabled={savingDraft || submittingReview}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-black shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submittingReview ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>एडमिन को समीक्षा के लिए भेजें (Submit for Review)</span>
            </button>
          </div>
        </div>

        {/* Live Portal News Feed (एडमिन पैनल की मुख्य खबरें नीचे दिखती रहें) */}
        <PortalLatestNewsFeed />
      </main>

      {/* Mandatory Technology Partner Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800/80 py-4 px-6 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} दैनिक मान्यवर (Dainik Manyavar). सर्वाधिकार सुरक्षित।</span>
          <span>
            Technology Partner:{' '}
            <a
              href="https://easylauncher.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EA580C] hover:underline font-bold"
            >
              EasyLauncher.net
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
