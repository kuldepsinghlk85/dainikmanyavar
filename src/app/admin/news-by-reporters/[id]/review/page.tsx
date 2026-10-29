'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  BadgeAlert,
  Globe,
  XCircle,
  Send,
  Save,
  Trash2,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  UserCheck,
  Bell,
  Eye,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminReviewSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Editable Content Fields
  const [headline, setHeadline] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [sendPushNotification, setSendPushNotification] = useState(false);

  // Feedback Modals
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAction, setFeedbackAction] = useState<'REQUEST_CHANGES' | 'REJECT'>('REQUEST_CHANGES');
  const [feedbackComment, setFeedbackComment] = useState('');

  // Dropdown data
  const [categories, setCategories] = useState<any[]>([]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/news-by-reporters/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success || !data.data) {
        setError(data.error || 'खबर नहीं मिली');
        setLoading(false);
        return;
      }

      const sub = data.data;
      setSubmission(sub);
      setHeadline(sub.headline || '');
      setSubtitle(sub.subtitle || '');
      setCategoryId(sub.categoryId || '');
      setLocationName(sub.locationName || sub.reporterProfile?.district || '');
      setExcerpt(sub.excerpt || '');
      setContent(sub.content || '');
      setFeaturedImage(sub.featuredImage || '');
      setLoading(false);
    } catch (_) {
      setError('डेटा लोड करने में समस्या आई');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
    fetch('/api/categories').then((r) => r.json()).then((d) => d.success && setCategories(d.data || []));
  }, [id]);

  const handleAction = async (action: string, comment?: string) => {
    setActionLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const payload: any = {
        action,
        headline,
        subtitle,
        categoryId,
        locationName,
        excerpt,
        content,
        featuredImage,
        sendPushNotification,
      };

      if (comment) {
        payload.editorComment = comment;
      }

      const res = await fetch(`/api/admin/news-by-reporters/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'कार्रवाई निष्पादित करने में विफल');
        setActionLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'समीक्षा कार्रवाई सफलतापूर्वक पूर्ण हुई!');
      setShowFeedbackModal(false);
      setFeedbackComment('');
      fetchDetail();
    } catch (_) {
      setError('सर्वर से संपर्क करने में समस्या आई');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">ड्राफ्ट</span>;
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5" /> समीक्षा लंबित
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> समीक्षा जारी
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
            <BadgeAlert className="w-3.5 h-3.5" /> सुधार हेतु भेजा
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> स्वीकृत (ड्राफ्ट)
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
            <Globe className="w-3.5 h-3.5" /> प्रकाशित
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" /> अस्वीकृत
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
        <p className="text-xs">खबर लोड हो रही है...</p>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="p-8 text-center text-red-500 space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto" />
        <p className="text-sm font-bold">{error}</p>
        <Link
          href="/admin/news-by-reporters"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> वापस सूची पर जाएं
        </Link>
      </div>
    );
  }

  const reporter = submission?.reporterProfile;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/news-by-reporters"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-slate-900 dark:text-white">
                संपादकीय समीक्षा व प्रकाशन डेस्क
              </h1>
              {getStatusBadge(submission.status)}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              प्रकाशन पूर्व जांच, तथ्य सत्यापन, कॉपी संपादन एवं 1-क्लिक लाइव पब्लिशिंग
            </p>
          </div>
        </div>

        {/* Live Article Link if published */}
        {submission.status === 'PUBLISHED' && submission.article && (
          <a
            href={`/news/${submission.article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <span>लाइव खबर देखें</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reporter Identity & Contact Box */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-slate-50 dark:from-slate-900 dark:via-orange-950/20 dark:to-slate-900 border-2 border-orange-200 dark:border-orange-900/40 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white font-black flex items-center justify-center text-xl shadow-md overflow-hidden shrink-0">
              {reporter?.photo ? (
                <img src={reporter.photo} alt={reporter.fullName} className="w-full h-full object-cover" />
              ) : (
                reporter?.fullName?.slice(0, 1) || 'र'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-orange-600 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> संवाददाता विवरण
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-orange-200 text-xs font-mono font-bold text-orange-700">
                  {reporter?.reporterId}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {reporter?.fullName} <span className="text-xs font-normal text-slate-500">({reporter?.designation})</span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1 flex-wrap">
                {reporter?.district && (
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" /> {reporter.district}
                  </span>
                )}
                {reporter?.user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-orange-600" /> {reporter.user.email}
                  </span>
                )}
                {reporter?.mobileNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-orange-600" /> {reporter.mobileNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submitted Time */}
          <div className="text-left sm:text-right text-xs text-slate-400">
            <p>सबमिट दिनांक: {new Date(submission.createdAt).toLocaleString('hi-IN')}</p>
            {submission.reviewedBy && (
              <p className="text-orange-600 font-bold mt-0.5">
                समीक्षक: {submission.reviewedBy}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reporter's Source Note if present */}
      {submission.sourceNote && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> रिपोर्टर द्वारा संपादक के लिए विशेष नोट:
          </p>
          <p className="leading-relaxed pl-5">{submission.sourceNote}</p>
        </div>
      )}

      {/* Content Review & Editor Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-black uppercase text-slate-400 tracking-wider">
          समाचार संपादन व समीक्षा (Editorial Copy)
        </h2>

        {/* Headline */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            मुख्य शीर्षक (Headline)
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full text-base sm:text-lg font-bold p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            उप-शीर्षक (Subtitle)
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full text-xs sm:text-sm p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Category & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              श्रेणी (Category)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameHi || c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              जिला / स्थान (District)
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            संक्षिप्त विवरण (Excerpt)
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full text-xs p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Full Content */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            समाचार का पूरा विवरण (News Content)
          </label>
          <textarea
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-sm leading-relaxed p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Featured Image with Device Upload & Media Gallery */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <ImageUploadWidget
            value={featuredImage}
            onChange={(url) => setFeaturedImage(url)}
            label="मुख्य फोटो (Featured Image)"
          />
        </div>

        {/* Additional Images Preview */}
        {submission.additionalImagesList && submission.additionalImagesList.length > 0 && (
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              अतिरिक्त तस्वीरें व कैप्शन ({submission.additionalImagesList.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {submission.additionalImagesList.map((img: any, i: number) => (
                <div key={i} className="border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-1">
                  <img src={img.url} alt={`Extra ${i}`} className="w-full h-24 object-cover rounded-lg" />
                  <p className="text-[10px] text-slate-600 truncate">{img.caption || 'कोई कैप्शन नहीं'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Push Notification Option */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <input
            type="checkbox"
            id="pushNotify"
            checked={sendPushNotification}
            onChange={(e) => setSendPushNotification(e.target.checked)}
            className="w-4 h-4 text-orange-600 rounded"
          />
          <label htmlFor="pushNotify" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-orange-600" />
            वेबसाइट सब्सक्राइबर्स को तुरंत पुश नोटिफिकेशन भेजें (Send Push Notification on Publish)
          </label>
        </div>
      </div>

      {/* Review Action Toolbar */}
      <div className="sticky bottom-4 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {submission.status === 'SUBMITTED' && (
            <button
              onClick={() => handleAction('START_REVIEW')}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              समीक्षा शुरू करें (Start Review)
            </button>
          )}

          <button
            onClick={() => {
              setFeedbackAction('REQUEST_CHANGES');
              setShowFeedbackModal(true);
            }}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-50 text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            सुधार के लिए वापस भेजें
          </button>

          <button
            onClick={() => {
              setFeedbackAction('REJECT');
              setShowFeedbackModal(true);
            }}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            अस्वीकार करें
          </button>
        </div>

        <div className="flex items-center gap-2">
          {submission.status === 'PUBLISHED' && (
            <button
              onClick={() => handleAction('UNPUBLISH')}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              अप्रकाशित करें (Unpublish)
            </button>
          )}

          <button
            onClick={() => handleAction('APPROVE_DRAFT')}
            disabled={actionLoading}
            className="px-5 py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-black cursor-pointer disabled:opacity-50"
          >
            स्वीकृत कर ड्राफ्ट में सेव करें
          </button>

          <button
            onClick={() => handleAction('APPROVE_PUBLISH')}
            disabled={actionLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-black shadow-lg shadow-green-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            <span>स्वीकार करें और तुरंत प्रकाशित करें (Live Publish)</span>
          </button>
        </div>
      </div>

      {/* Feedback Modal (Changes Requested or Rejected) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              {feedbackAction === 'REQUEST_CHANGES' ? (
                <>
                  <BadgeAlert className="w-5 h-5 text-orange-600" /> सुधार हेतु निर्देश दर्ज करें
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" /> अस्वीकृति का कारण लिखें
                </>
              )}
            </h3>

            <p className="text-xs text-slate-400">
              यह टिप्पणी सीधे संबंधित रिपोर्टर ({reporter?.fullName}) को उनके डैशबोर्ड में दिखाई देगी।
            </p>

            <textarea
              rows={4}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder={
                feedbackAction === 'REQUEST_CHANGES'
                  ? 'उदा. शीर्षक में तारीख जोड़ें और दूसरे पैराग्राफ के आंकड़े स्पष्ट करें...'
                  : 'उदा. यह खबर असत्यापित स्रोतों पर आधारित है या पहले से प्रकाशित हो चुकी है...'
              }
              className="w-full text-xs p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => handleAction(feedbackAction, feedbackComment)}
                disabled={actionLoading || !feedbackComment.trim()}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 ${
                  feedbackAction === 'REQUEST_CHANGES'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'भेजा जा रहा है...' : 'पुष्टि करें और भेजें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
