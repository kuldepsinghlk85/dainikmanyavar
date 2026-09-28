'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Bell,
  Send,
  Users,
  Smartphone,
  Globe,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Eye,
  Radio,
  Sparkles,
  Newspaper,
  Image as ImageIcon,
  Edit2,
  X,
} from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

export const dynamic = 'force-dynamic';

interface ArticleItem {
  id: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  content?: string;
  slug: string;
  featuredImage?: string | null;
  isBreaking?: boolean;
  category?: { id: string; name: string; slug: string } | null;
  location?: { id: string; name: string; slug: string } | null;
  createdAt: string;
}

export default function AdminNotificationCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-500 font-bold">लोड हो रहा है...</div>}>
      <NotificationCenterContent />
    </Suspense>
  );
}

function NotificationCenterContent() {
  const searchParams = useSearchParams();
  const initialNewsId = searchParams.get('newsId') || '';

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string>(initialNewsId);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [data, setData] = useState<{
    campaigns: any[];
    stats: {
      totalSubscribers: number;
      webSubscribers: number;
      mobileSubscribers: number;
      totalSent: number;
      totalOpened: number;
      openRate: string;
    };
  }>({
    campaigns: [],
    stats: {
      totalSubscribers: 0,
      webSubscribers: 0,
      mobileSubscribers: 0,
      totalSent: 0,
      totalOpened: 0,
      openRate: '0.0%',
    },
  });

  const [form, setForm] = useState({
    title: '',
    body: '',
    image: '',
    url: 'https://dainikmanyavar.com',
    targetType: 'all',
    targetValue: '',
    isBreaking: false,
    force: false,
  });

  const [previewTime, setPreviewTime] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/push/campaigns');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentArticles = async () => {
    try {
      setLoadingArticles(true);
      const res = await fetch('/api/articles?limit=50&status=PUBLISHED');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setArticles(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch recent articles:', err);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchRecentArticles();
    setPreviewTime(new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // When articles are loaded or initialNewsId changes, auto-select and populate
  useEffect(() => {
    if (initialNewsId && articles.length > 0) {
      handleSelectArticle(initialNewsId);
    }
  }, [initialNewsId, articles]);

  const handleSelectArticle = (newsId: string) => {
    setSelectedNewsId(newsId);
    if (!newsId) return;

    const article = articles.find((a) => a.id === newsId);
    if (!article) return;

    // Clean excerpt / text for body
    let bodyText = article.excerpt || article.subtitle || '';
    if (!bodyText && article.content) {
      bodyText = article.content.replace(/<[^>]+>/g, '').trim();
    }
    bodyText = bodyText.replace(/\s+/g, ' ').slice(0, 175);

    // Target audience auto-mapping
    let targetType = 'all';
    let targetValue = '';

    if (article.location?.name) {
      targetType = 'district';
      targetValue = article.location.name;
    } else if (article.category?.name) {
      targetType = 'topic';
      targetValue = article.category.name;
    }

    setForm({
      title: article.title.slice(0, 90),
      body: bodyText,
      image: article.featuredImage || '',
      url: `https://dainikmanyavar.com/news/${article.slug}`,
      targetType,
      targetValue,
      isBreaking: Boolean(article.isBreaking),
      force: false,
    });

    setFeedback({
      type: 'success',
      message: `📰 खबर "${article.title.slice(0, 40)}..." का विवरण सफलतापूर्वक फॉर्म में लोड कर दिया गया है। आप आवश्यकतानुसार फोटो या विवरण बदल सकते हैं।`,
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body || !form.url) {
      setFeedback({ type: 'error', message: 'कृपया शीर्षक, संदेश और लिंक भरें।' });
      return;
    }

    setSending(true);
    setFeedback(null);

    let finalImage = form.image?.trim() || '';
    if (finalImage && finalImage.startsWith('/')) {
      finalImage = `https://dainikmanyavar.com${finalImage}`;
    }

    let finalUrl = form.url?.trim() || '';
    if (finalUrl && finalUrl.startsWith('/')) {
      finalUrl = `https://dainikmanyavar.com${finalUrl}`;
    }

    try {
      const res = await fetch('/api/admin/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          image: finalImage,
          url: finalUrl,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: 'success',
          message: `✅ ${json.message || 'नोटिफिकेशन सफलतापूर्वक भेजा गया!'}`,
        });
        setForm({
          title: '',
          body: '',
          image: '',
          url: 'https://dainikmanyavar.com',
          targetType: 'all',
          targetValue: '',
          isBreaking: false,
          force: false,
        });
        setSelectedNewsId('');
        fetchCampaigns();
      } else {
        setFeedback({ type: 'error', message: `❌ ${json.error || 'नोटिफिकेशन भेजने में त्रुटि हुई।'}` });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'सर्वर से संपर्क नहीं हो सका।' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Bell className="w-5 h-5 animate-pulse" />
            </span>
            <h1 className="text-2xl font-black text-stone-900">
              पुश नोटिफिकेशन नियंत्रण केंद्र (Push Notification Center)
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            वेबसाइट और मोबाइल ऐप के पाठकों तक ब्रेकिंग न्यूज़ और ताज़ा अपडेट्स तुरंत भेजें
          </p>
        </div>

        <button
          onClick={fetchCampaigns}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          रिफ्रेश डेटा
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold mb-1">
            <span>कुल सब्सक्राइबर्स</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{data.stats.totalSubscribers}</div>
          <div className="text-[11px] text-stone-400 mt-1">सक्रिय रीडर्स</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold mb-1">
            <span>वेब सब्सक्राइबर्स</span>
            <Globe className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{data.stats.webSubscribers}</div>
          <div className="text-[11px] text-stone-400 mt-1">ब्राउज़र पुश</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold mb-1">
            <span>मोबाइल सब्सक्राइबर्स</span>
            <Smartphone className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{data.stats.mobileSubscribers}</div>
          <div className="text-[11px] text-stone-400 mt-1">Android & iOS ऐप</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold mb-1">
            <span>कुल भेजे गए</span>
            <Send className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{data.stats.totalSent}</div>
          <div className="text-[11px] text-stone-400 mt-1">सफल डिलीवरी</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold mb-1">
            <span>ओपन रेट (CTR)</span>
            <Eye className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-600">{data.stats.openRate}</div>
          <div className="text-[11px] text-stone-400 mt-1">{data.stats.totalOpened} क्लिक्स</div>
        </div>
      </div>

      {/* Main Grid: Create Form & Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-red-600" />
              नया पुश नोटिफिकेशन भेजें (Send Broadcast)
            </h2>
            <span className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              सिस्टम सक्रिय
            </span>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            {/* Recent Published News Dropdown Selector */}
            <div className="p-3.5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-red-900 flex items-center gap-1.5">
                  <Newspaper className="w-4 h-4 text-red-600" />
                  हालिया प्रकाशित खबरों में से चुनें (Auto-fill from News)
                </label>
                {loadingArticles && (
                  <span className="text-[11px] text-stone-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-red-600" /> लोड हो रहा है...
                  </span>
                )}
              </div>
              <select
                value={selectedNewsId}
                onChange={(e) => handleSelectArticle(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-xs bg-white text-stone-800 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="">-- प्रकाशित खबर चुनें जिससे विवरण, फोटो और श्रेणी स्वतः भर जाए --</option>
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.title.slice(0, 75)}{art.title.length > 75 ? '...' : ''} [
                    {art.category?.name || 'सामान्य'}{art.location?.name ? ` / ${art.location.name}` : ''}]
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-red-700 font-medium">
                💡 किसी भी खबर को चुनते ही उसका शीर्षक, संक्षिप्त विवरण, लिंक, फोटो, श्रेणी व जिला यहाँ स्वतः भर जाएगा।
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                नोटिफिकेशन शीर्षक (Headline) *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="उदा: वाराणसी में बड़ा हादसा, राहत कार्य जारी..."
                maxLength={90}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <div className="text-right text-[10px] text-stone-400 mt-0.5">{form.title.length}/90 अक्षर</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                संदेश विवरण (Short Message Body) *
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="उदा: कैंट स्टेशन के पास हुआ हादसा, मौके पर पहुंची पुलिस और एनडीआरएफ टीम..."
                rows={2}
                maxLength={180}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <div className="text-right text-[10px] text-stone-400 mt-0.5">{form.body.length}/180 अक्षर</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                क्लिक करने पर खुलने वाला लिंक (Target URL) *
              </label>
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://dainikmanyavar.com/news/..."
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Notification Image Selector with Photo Change Feature */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-stone-600" />
                  नोटिफिकेशन फोटो (Notification Image)
                </label>
                <button
                  type="button"
                  onClick={() => setShowImagePicker(!showImagePicker)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer bg-white hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 shadow-sm transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  {showImagePicker ? 'अपलोडर बंद करें' : '🖼️ फोटो बदलें / अपलोड करें'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {form.image ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0 group">
                    <img
                      src={form.image}
                      alt="Notification Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: '' })}
                      className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      title="फोटो हटाएं"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-dashed border-stone-300 bg-white flex flex-col items-center justify-center text-stone-400 flex-shrink-0">
                    <ImageIcon className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px]">फोटो नहीं</span>
                  </div>
                )}

                <div className="flex-1">
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="फोटो का वेब लिंक (URL) डालें या 'फोटो बदलें' बटन से अपलोड करें"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <div className="text-[10px] text-stone-500 mt-1">
                    यह फोटो यूजर के मोबाइल लॉकस्क्रीन और ब्राउज़र पॉपअप में दिखेगी।
                  </div>
                </div>
              </div>

              {showImagePicker && (
                <div className="pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-700">नई फोटो चुनें या अपलोड करें:</span>
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(false)}
                      className="text-stone-400 hover:text-stone-600 text-xs p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ImageUploader
                    value={form.image}
                    onChange={(newUrl) => {
                      setForm({ ...form, image: newUrl });
                      setShowImagePicker(false);
                    }}
                    label="कंप्यूटर या मोबाइल से नई फोटो अपलोड करें"
                    category="notifications"
                  />
                </div>
              )}
            </div>

            {/* Targeting Options */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <label className="block text-xs font-bold text-stone-800">
                लक्षित पाठक वर्ग (Target Audience)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: '📢 सभी पाठक' },
                  { id: 'district', label: '📍 जिला विशेष' },
                  { id: 'topic', label: '🏷️ विषय / टॉपिक' },
                  { id: 'platform', label: '📱 केवल मोबाइल' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, targetType: t.id })}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      form.targetType === t.id
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {form.targetType === 'district' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    जिला चुनें या टाइप करें:
                  </label>
                  <input
                    type="text"
                    value={form.targetValue}
                    onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                    placeholder="उदा: varanasi, lucknow, gorakhpur..."
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
              )}

              {form.targetType === 'topic' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    विषय / श्रेणी टाइप करें:
                  </label>
                  <input
                    type="text"
                    value={form.targetValue}
                    onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                    placeholder="उदा: cricket, politics, bollywood, crime..."
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
              )}

              {form.targetType === 'platform' && (
                <div className="flex gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="targetPlatform"
                      value="android"
                      checked={form.targetValue === 'android'}
                      onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                    />
                    Android ऐप
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="targetPlatform"
                      value="web"
                      checked={form.targetValue === 'web'}
                      onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                    />
                    वेबसाइट पाठक
                  </label>
                </div>
              )}
            </div>

            {/* Breaking News Toggle */}
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600 animate-bounce" />
                <div>
                  <div className="text-xs font-bold text-amber-900">⚡ ब्रेकिंग न्यूज़ फ्लैश (High Priority)</div>
                  <div className="text-[11px] text-amber-700">शांत समय (Quiet Hours) की सेटिंग्स को ओवरराइड करेगा</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.isBreaking}
                onChange={(e) => setForm({ ...form, isBreaking: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    भेजा जा रहा है...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    तुरंत नोटिफिकेशन भेजें (Send Broadcast Now)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-xl border border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              लाइव मोबाइल प्रीव्यू (Live Lockscreen Preview)
            </h3>

            {/* Mock Smartphone Frame */}
            <div className="max-w-[320px] mx-auto bg-stone-950 p-3 rounded-[32px] border-4 border-stone-700 shadow-2xl">
              <div className="w-24 h-4 bg-stone-800 rounded-full mx-auto mb-3" />
              
              <div className="text-center text-stone-400 text-[10px] mb-2 font-mono" suppressHydrationWarning>
                {previewTime || '10:00 AM'} • आज
              </div>

              {/* Notification Card */}
              <div className="bg-stone-800/90 backdrop-blur-md text-stone-100 rounded-2xl p-3.5 border border-stone-700/60 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-1.5 font-bold text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    दैनिक मान्यवर
                  </div>
                  <span className="text-[10px]">अभी</span>
                </div>

                <div className="font-bold text-xs text-white leading-tight">
                  {form.title || 'शीर्षक यहाँ दिखेगा (उदा: बड़ी खबर)'}
                </div>

                <div className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                  {form.body || 'यहाँ आपके संदेश का संक्षिप्त विवरण दिखेगा जो पाठक की स्क्रीन पर फ्लैश होगा...'}
                </div>

                {form.image && (
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-stone-700 mt-2">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex gap-2 pt-1 border-t border-stone-700/50 text-[10px]">
                  <span className="text-red-400 font-bold">अभी पढ़ें ➔</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-stone-600 mt-4">
                पाठक इस पर टैप करते ही सीधे आपकी खबर पर पहुंचेंगे
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns History Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex justify-between items-center">
          <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-500" />
            हाल ही में भेजे गए अभियान (Recent Campaigns)
          </h2>
          <span className="text-xs text-stone-500 font-medium">
            कुल {data.campaigns.length} अभियान
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">शीर्षक व संदेश</th>
                <th className="py-3 px-3">टारगेट</th>
                <th className="py-3 px-3">सफल डिलीवरी</th>
                <th className="py-3 px-3">क्लिक्स (Open)</th>
                <th className="py-3 px-3">समय</th>
                <th className="py-3 px-3 text-right">स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {data.campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-stone-400">
                    कोई पूर्व नोटिफिकेशन अभियान उपलब्ध नहीं है। ऊपर दिए गए फॉर्म से पहला नोटिफिकेशन भेजें।
                  </td>
                </tr>
              ) : (
                data.campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-stone-900 line-clamp-1">{c.title}</div>
                      <div className="text-stone-500 line-clamp-1 text-[11px]">{c.body}</div>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                      >
                        {c.url} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold">
                        {c.targetType === 'all'
                          ? '📢 सभी'
                          : `${c.targetType}: ${c.targetValue || '-'}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {c.successCount}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-600">{c.openCount}</span>
                      {c.successCount > 0 && (
                        <span className="text-[10px] text-stone-400 ml-1">
                          ({((c.openCount / c.successCount) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-stone-500 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('hi-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.status === 'SENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'SENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
