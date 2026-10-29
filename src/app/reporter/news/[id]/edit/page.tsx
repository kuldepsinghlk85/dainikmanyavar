'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  Clipboard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BadgeAlert,
  UserCheck,
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

export default function ReporterEditStoryPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params?.id as string;

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
  const [status, setStatus] = useState('DRAFT');
  const [editorComment, setEditorComment] = useState<string | null>(null);

  // Revision state for Published news
  const [isPublished, setIsPublished] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');

  // Dropdown options
  const [categories, setCategories] = useState<Array<{ id: string; name: string; nameHi?: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string; nameHi?: string }>>([]);

  // UI state
  const [pageLoading, setPageLoading] = useState(true);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const featuredFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Session check
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
      })
      .catch(() => router.push('/reporter/login'));

    // 2. Categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
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

    // 4. Fetch Submission Data
    if (submissionId) {
      fetch(`/api/reporter/submissions/${submissionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.success || !data.data) {
            setErrorMsg('खबर नहीं मिली या आपको इसे देखने की अनुमति नहीं है');
            setPageLoading(false);
            return;
          }
          const sub = data.data;
          setHeadline(sub.headline || '');
          setSubtitle(sub.subtitle || '');
          setCategoryId(sub.categoryId || '');
          setLocationId(sub.locationId || '');
          setLocationName(sub.locationName || '');
          if (sub.eventDate) {
            setEventDate(sub.eventDate.slice(0, 10));
          }
          setExcerpt(sub.excerpt || '');
          setContent(sub.content || '');
          setFeaturedImage(sub.featuredImage || '');
          setSourceNote(sub.sourceNote || '');
          setStatus(sub.status);
          setEditorComment(sub.editorComment || null);
          setIsPublished(sub.status === 'PUBLISHED');

          if (sub.additionalImages) {
            try {
              setAdditionalImages(JSON.parse(sub.additionalImages));
            } catch (_) {}
          }
          setPageLoading(false);
        })
        .catch(() => {
          setErrorMsg('डेटा लोड करने में समस्या आई');
          setPageLoading(false);
        });
    }
  }, [submissionId]);

  // Featured image upload
  const handleFeaturedImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingFeatured(true);
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
        alert(data.error || 'अपलोड में त्रुटि हुई');
      }
    } catch (_) {
      alert('अपलोड में समस्या आई');
    } finally {
      setUploadingFeatured(false);
    }
  };

  // Additional Image upload
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

  const handleClipboardPaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
        }
      } else {
        alert('कृपया सीधे टेक्स्ट एरिया में पेस्ट करें');
      }
    } catch (_) {
      alert('क्लिपबोर्ड एक्सेस की अनुमति नहीं है');
    }
  };

  const handleSave = async (submitStatus: 'DRAFT' | 'SUBMITTED') => {
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
      const payload: any = {
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
        status: isPublished ? 'PUBLISHED' : submitStatus,
      };

      if (isPublished && revisionNote.trim()) {
        payload.requestRevision = true;
        payload.revisionNote = revisionNote.trim();
      }

      const res = await fetch(`/api/reporter/submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'अपडेट करने में समस्या आई');
        setSavingDraft(false);
        setSubmittingReview(false);
        return;
      }

      setSuccessMsg(
        isPublished
          ? 'संशोधन अनुरोध एडमिन को भेज दिया गया है!'
          : submitStatus === 'DRAFT'
          ? 'ड्राफ्ट सफलतापूर्वक अपडेट किया गया!'
          : 'संशोधित खबर समीक्षा के लिए एडमिन को भेज दी गई है!'
      );

      setTimeout(() => {
        router.push('/reporter');
      }, 1200);
    } catch (_) {
      setErrorMsg('सर्वर से संपर्क करने में समस्या आई');
      setSavingDraft(false);
      setSubmittingReview(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
          <p className="text-xs">खबर लोड हो रही है...</p>
        </div>
      </div>
    );
  }

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
                <span>खबर संपादित करें</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  {status}
                </span>
              </h1>
            </div>
          </div>

          {/* Action Buttons in Sub-Header */}
          <div className="flex items-center gap-2">
            {!isPublished && (
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={savingDraft || submittingReview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-stone-500" />}
                <span className="hidden sm:inline">ड्राफ्ट अपडेट करें</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave('SUBMITTED')}
              disabled={savingDraft || submittingReview}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-black shadow-md shadow-orange-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submittingReview ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isPublished ? 'संशोधन अनुरोध भेजें' : 'समीक्षा हेतु भेजें'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {/* Editor Comment Alert if Returned for Changes */}
        {editorComment && status === 'CHANGES_REQUESTED' && (
          <div className="mb-6 p-4 rounded-3xl bg-orange-50 dark:bg-orange-950/50 border-2 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200">
            <div className="flex items-center gap-2 mb-1 text-sm font-black text-orange-700 dark:text-orange-400">
              <BadgeAlert className="w-5 h-5" />
              <span>संपादक की टिप्पणी (सुधार निर्देश):</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold pl-7">{editorComment}</p>
          </div>
        )}

        {/* If Published -> Revision Request Notice */}
        {isPublished && (
          <div className="mb-6 p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-sm font-black text-blue-700 dark:text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>यह खबर वेबसाइट पर लाइव प्रकाशित है</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              लाइव खबर को सीधे नहीं हटाया जाएगा। आप यहाँ संशोधित कॉपी और संपादक के लिए संशोधन नोट दर्ज करें। संपादक के अनुमोदन के बाद ही बदलाव लाइव होंगे।
            </p>
            <div>
              <label className="block text-xs font-bold mb-1">संशोधन का कारण (Reason for Revision):</label>
              <input
                type="text"
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="उदा. नए आंकड़े अपडेट किए गए हैं..."
                className="w-full text-xs bg-white dark:bg-stone-900 border border-blue-200 dark:border-blue-700 rounded-xl px-3 py-2 text-stone-900 dark:text-white"
              />
            </div>
          </div>
        )}

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



          {/* Card 6: Verified Reporter Byline */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-stone-50 dark:from-stone-900 dark:via-orange-950/20 dark:to-stone-900 border-2 border-orange-200 dark:border-orange-900/40 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black flex items-center justify-center text-lg shrink-0 overflow-hidden">
                {profile?.photo ? (
                  <img src={profile.photo} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  profile?.fullName?.slice(0, 1) || 'र'
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> प्रमाणित रिपोर्टर पहचान
                </p>
                <p className="text-sm font-bold text-stone-900 dark:text-white">
                  रिपोर्टर: {profile?.fullName} | {profile?.designation} | {profile?.reporterId}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 pb-6 flex items-center justify-end gap-3">
            {!isPublished && (
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={savingDraft || submittingReview}
                className="px-6 py-3 rounded-2xl border-2 border-stone-300 dark:border-stone-700 text-xs font-black cursor-pointer disabled:opacity-50"
              >
                ड्राफ्ट अपडेट करें
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave('SUBMITTED')}
              disabled={savingDraft || submittingReview}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 text-white text-xs font-black shadow-xl shadow-orange-600/30 cursor-pointer disabled:opacity-50"
            >
              {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isPublished ? 'संशोधन अनुरोध सबमिट करें' : 'समीक्षा हेतु भेजें'}</span>
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
