'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Film,
  PlusCircle,
  ExternalLink,
  Search,
  Star,
  Flame,
  Trophy,
  Sliders,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  RefreshCw,
  Sparkles,
  Smartphone,
  Globe,
  Radio,
  Zap,
  Inbox,
  Clock,
  ArrowRight,
  Send,
  Coins,
  Tv,
  Check,
  Languages,
} from 'lucide-react';

interface ManoranjanArticle {
  id: string;
  newsId: number;
  title: string;
  subtitle: string | null;
  slug: string;
  featuredImage: string | null;
  gallery: string | null;
  sourceType: string | null;
  status: string;
  isFeatured: boolean;
  isBreaking: boolean;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
}

interface RssSource {
  id: string;
  name: string;
  publisherName: string;
  logoUrl?: string | null;
  category: string;
  region: string;
  feedUrl?: string | null;
  websiteUrl?: string | null;
  sourceType: string;
  healthStatus: string;
  lastFetchAt?: string | null;
  isActive: boolean;
}

interface RssImportItem {
  id: string;
  originalTitle: string;
  originalExcerpt: string | null;
  imageUrl: string | null;
  publisherName: string;
  sourceUrl: string;
  sourcePublishedAt: string | null;
  suggestedTagsJson: string | null;
  status: string;
  source?: {
    id: string;
    name: string;
    publisherName: string;
    category: string;
    region: string;
  };
}

export default function AdminManoranjanPage() {
  const searchParams = useSearchParams();
  const initialDesk = searchParams.get('tab') === 'rss' ? 'rss_desk' : 'articles';

  const [activeDesk, setActiveDesk] = useState<'articles' | 'rss_desk'>(initialDesk);

  // Articles & Widgets State
  const [articles, setArticles] = useState<ManoranjanArticle[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    movies: 0,
    viral: 0,
    cricket_buzz: 0,
    movie_review: 0,
  });
  const [settings, setSettings] = useState<Record<string, string>>({
    section_manoranjan_enabled: 'true',
    mobile_manoranjan_enabled: 'true',
    manoranjan_widget_reviews_enabled: 'true',
    manoranjan_widget_viral_enabled: 'true',
    manoranjan_widget_cricket_enabled: 'true',
    manoranjan_widget_films_enabled: 'true',
  });
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Personal RSS Desk State
  const [rssSources, setRssSources] = useState<RssSource[]>([]);
  const [rssItems, setRssItems] = useState<RssImportItem[]>([]);
  const [rssCounts, setRssCounts] = useState({ totalSources: 0, newItems: 0, draftedItems: 0 });
  const [rssSubcat, setRssSubcat] = useState<string>('all');
  const [loadingRss, setLoadingRss] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [itemProcessingId, setItemProcessingId] = useState<string | null>(null);
  const [translatingItemId, setTranslatingItemId] = useState<string | null>(null);
  const [rssFeedback, setRssFeedback] = useState<string>('');

  // 1. Fetch Articles & Settings
  const fetchManoranjanData = async () => {
    setLoadingArticles(true);
    try {
      const url = new URL('/api/admin/manoranjan', window.location.origin);
      if (selectedTab !== 'all') url.searchParams.set('subtype', selectedTab);
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && data.data) {
        setArticles(data.data.articles || []);
        setCounts(data.data.counts || { all: 0, movies: 0, viral: 0, cricket_buzz: 0, movie_review: 0 });
        if (data.data.settings) {
          setSettings(data.data.settings);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingArticles(false);
    }
  };

  // 2. Fetch Personal RSS Desk Data
  const fetchRssData = async (subcat = rssSubcat) => {
    setLoadingRss(true);
    try {
      const url = new URL('/api/admin/manoranjan/rss', window.location.origin);
      if (subcat !== 'all') url.searchParams.set('subcat', subcat);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && data.data) {
        setRssSources(data.data.sources || []);
        setRssItems(data.data.items || []);
        setRssCounts(data.data.counts || { totalSources: 0, newItems: 0, draftedItems: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch RSS data:', err);
    } finally {
      setLoadingRss(false);
    }
  };

  useEffect(() => {
    fetchManoranjanData();
  }, [selectedTab]);

  useEffect(() => {
    if (activeDesk === 'rss_desk') {
      fetchRssData(rssSubcat);
    }
  }, [activeDesk, rssSubcat]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchManoranjanData();
  };

  const handleToggleWidget = async (key: string) => {
    const currentVal = settings[key] !== 'false';
    const nextVal = currentVal ? 'false' : 'true';

    setSavingKey(key);
    setSettings((prev) => ({ ...prev, [key]: nextVal }));

    try {
      const res = await fetch('/api/admin/manoranjan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateSettings: true,
          settings: { [key]: nextVal },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(
          nextVal === 'true'
            ? '✅ विजेट सक्रिय (Active) कर दिया गया!'
            : '🔒 विजेट निष्क्रिय (Inactive) कर दिया गया!'
        );
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setSettings((prev) => ({ ...prev, [key]: currentVal ? 'true' : 'false' }));
    } finally {
      setSavingKey(null);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`क्या आप वाकई "${title}" को हटाना चाहते हैं?`)) return;

    try {
      const res = await fetch(`/api/admin/manoranjan?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('🗑️ आर्टिकल सफलता से हटा दिया गया!');
        setTimeout(() => setStatusMsg(''), 3000);
        fetchManoranjanData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // RSS Handlers
  const handleSyncAllRss = async () => {
    setSyncingAll(true);
    setRssFeedback('');
    try {
      const res = await fetch('/api/admin/manoranjan/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_ALL', subcat: rssSubcat }),
      });
      const data = await res.json();
      if (data.success) {
        setRssFeedback(
          `⚡ सभी ${data.totalSources} मनोरंजन सोर्सेज सिंक हो गए! नई खबरें: +${data.newNews} (कुल पाई गईं: ${data.totalFound})`
        );
        fetchRssData(rssSubcat);
      } else {
        alert(data.error || 'सिंक करने में त्रुटि');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncSource = async (sourceId: string) => {
    setSyncingSourceId(sourceId);
    setRssFeedback('');
    try {
      const res = await fetch('/api/admin/manoranjan/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_ONE', sourceId }),
      });
      const data = await res.json();
      if (data.success) {
        setRssFeedback(`⚡ ${data.message || 'सिंक पूर्ण!'}`);
        fetchRssData(rssSubcat);
      } else {
        alert(data.error || 'सिंक करने में त्रुटि');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingSourceId(null);
    }
  };

  const handleCreateDraft = async (itemId: string, subtype?: string) => {
    setItemProcessingId(itemId);
    try {
      const res = await fetch('/api/admin/manoranjan/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_DRAFT', importItemId: itemId, customSubtype: subtype }),
      });
      const data = await res.json();
      if (data.success) {
        setRssFeedback(`✅ ड्राफ्ट बन गया!`);
        fetchRssData(rssSubcat);
        fetchManoranjanData();
      } else {
        alert(data.error || 'ड्राफ्ट बनाने में त्रुटि');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemProcessingId(null);
    }
  };

  const handlePublishLive = async (itemId: string, subtype?: string) => {
    setItemProcessingId(itemId);
    try {
      const res = await fetch('/api/admin/manoranjan/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PUBLISH_LIVE', importItemId: itemId, customSubtype: subtype }),
      });
      const data = await res.json();
      if (data.success) {
        setRssFeedback(`🚀 खबर मनोरंजन पोर्टल पर लाइव प्रकाशित हो गई! (ID: #${data.articleId.slice(0, 5)})`);
        fetchRssData(rssSubcat);
        fetchManoranjanData();
      } else {
        alert(data.error || 'प्रकाशित करने में त्रुटि');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemProcessingId(null);
    }
  };

  const handleDeleteRssItem = async (itemId: string) => {
    try {
      const res = await fetch('/api/admin/manoranjan/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_ITEM', importItemId: itemId }),
      });
      const data = await res.json();
      if (data.success) {
        setRssItems((prev) => prev.filter((i) => i.id !== itemId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTranslateItem = async (itemId: string) => {
    setTranslatingItemId(itemId);
    try {
      const res = await fetch('/api/admin/manoranjan/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TRANSLATE_ITEM', importItemId: itemId }),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setRssItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, ...data.item } : i))
        );
        setRssFeedback('🌐 खबर का शीर्षक, विवरण व टैग्स हिंदी में अनुवादित हो गए!');
        setTimeout(() => setRssFeedback(''), 4000);
      } else {
        alert(data.error || 'अनुवाद करने में समस्या आई');
      }
    } catch (err: any) {
      alert(err.message || 'नेटवर्क समस्या');
    } finally {
      setTranslatingItemId(null);
    }
  };

  const parseReviewMetadata = (galleryJson: string | null) => {
    if (!galleryJson) return null;
    try {
      return JSON.parse(galleryJson);
    } catch {
      return null;
    }
  };

  const getSubtypeBadge = (subtype: string | null, galleryJson: string | null) => {
    const review = parseReviewMetadata(galleryJson);
    switch (subtype) {
      case 'movie_review':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-[11px] px-2 py-0.5 rounded-md border border-amber-500/20">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>रिव्यू {review?.rating ? `(${review.rating}★)` : ''}</span>
          </span>
        );
      case 'viral':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 font-extrabold text-[11px] px-2 py-0.5 rounded-md border border-purple-500/20">
            <Flame className="w-3 h-3 text-purple-600" />
            <span>दिलचस्प खबर</span>
          </span>
        );
      case 'cricket_buzz':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px] px-2 py-0.5 rounded-md border border-emerald-500/20">
            <Trophy className="w-3 h-3 text-emerald-600" />
            <span>क्रिकेट बज़</span>
          </span>
        );
      case 'movies':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-700 dark:text-red-400 font-extrabold text-[11px] px-2 py-0.5 rounded-md border border-red-500/20">
            <Film className="w-3 h-3 text-red-600" />
            <span>सिनेमा / फिल्म</span>
          </span>
        );
    }
  };

  const widgetControls = [
    {
      key: 'section_manoranjan_enabled',
      title: 'वेबसाइट होमपेज मनोरंजन सेक्शन',
      desc: 'मुख्य वेबसाइट (Desktop) के होमपेज पर मनोरंजन का पूरा शोकेस सेक्शन दिखाएं',
      icon: Globe,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      key: 'mobile_manoranjan_enabled',
      title: 'मोबाइल होमपेज मनोरंजन सेक्शन',
      desc: 'मोबाइल संस्करण (/mobile) के होमपेज पर विशेष मनोरंजन कार्ड्स प्रदर्शित करें',
      icon: Smartphone,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      key: 'manoranjan_widget_reviews_enabled',
      title: '⭐ फिल्मों के रिव्यू (Movie Reviews)',
      desc: 'स्टार रेटिंग (★) व वर्डिक्ट वाले मूवी रिव्यू कार्ड्स को सक्रिय/निष्क्रिय करें',
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      key: 'manoranjan_widget_viral_enabled',
      title: '🔥 दिलचस्प व हटके खबरें (Viral Odd News)',
      desc: 'मनोरंजन सेक्शन के अंदर अजीबोगरीब व दिलचस्प वायरल खबरों की पट्टी दिखाएं',
      icon: Flame,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      key: 'manoranjan_widget_cricket_enabled',
      title: '🏏 क्रिकेट बज़ व मनोरंजन (Cricket Buzz)',
      desc: 'क्रिकेटर्स के गॉसिप, रोचक खुलासे व खेल मनोरंजन के कार्ड्स दिखाएं',
      icon: Trophy,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      key: 'manoranjan_widget_films_enabled',
      title: '🎬 बॉलीवुड व सिनेमा खबरें (Movies & Cinema)',
      desc: 'फिल्मों के ट्रेलर, बॉक्स ऑफिस व सितारों की ताज़ा हलचल दिखाएं',
      icon: Film,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Top Header & Main Desk Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-7 h-7 text-[#EA580C]" />
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              मनोरंजन हब (Entertainment Desk)
            </h1>
            <span className="bg-orange-100 text-[#EA580C] text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
              हब
            </span>
          </div>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            फिल्में, दिलचस्प खबरें, क्रिकेट बज़, मूवी रिव्यू और पर्सनल RSS फ़ीड्स का एकीकृत नियंत्रण
          </p>
        </div>

        {/* View Switcher: Articles vs RSS Desk */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1 border border-stone-200">
            <button
              onClick={() => setActiveDesk('articles')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeDesk === 'articles'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>📰 आर्टिकल्स & विजेट्स</span>
            </button>

            <button
              onClick={() => {
                setActiveDesk('rss_desk');
                fetchRssData();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeDesk === 'rss_desk'
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${activeDesk === 'rss_desk' ? 'text-white' : 'text-[#EA580C]'}`} />
              <span>📡 पर्सनल RSS फ़ीड्स</span>
              {rssCounts.totalSources > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeDesk === 'rss_desk' ? 'bg-white/25 text-white' : 'bg-[#EA580C]/10 text-[#EA580C]'}`}>
                  {rssCounts.totalSources}
                </span>
              )}
            </button>
          </div>

          <Link
            href="/manoranjan"
            target="_blank"
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-stone-300 hover:bg-stone-50 text-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span>पब्लिक पोर्टल</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>
        </div>
      </div>

      {/* Global Status Message */}
      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* =============================================================== */}
      {/* 📡 PERSONAL RSS FEEDS DESK SECTION                              */}
      {/* =============================================================== */}
      {activeDesk === 'rss_desk' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* RSS Desk Header Bar with 1-Click Sync */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full">
                    लाइव एग्रीगेटर
                  </span>
                  <h2 className="text-lg font-black tracking-tight">
                    📡 मनोरंजन पर्सनल RSS फ़ीड्स हब (Entertainment RSS & Ingest Desk)
                  </h2>
                </div>
                <p className="text-xs text-stone-300 font-medium mt-1">
                  बॉलीवुड, हॉलीवुड, बॉक्स ऑफिस, ओटीटी, वायरल वीडियो, क्रिकेट व गोल्ड-सिल्वर के 25+ सोर्सेज से सीधे मनोरंजन पोर्टल में पोस्ट करें
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* 1-Click Sync All Entertainment Feeds */}
                <button
                  onClick={handleSyncAllRss}
                  disabled={syncingAll}
                  className="bg-[#16A34A] hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Zap className={`w-4 h-4 text-amber-300 ${syncingAll ? 'animate-bounce' : ''}`} />
                  <span>
                    {syncingAll
                      ? 'मनोरंजन सोर्सेज सिंक हो रहे हैं...'
                      : '⚡ सभी मनोरंजन फ़ीड्स सिंक करें'}
                  </span>
                </button>

                <Link
                  href="/admin/importer/inbox"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  <Inbox className="w-4 h-4 text-orange-400" />
                  <span>मुख्य इनबॉक्स</span>
                </Link>

                <Link
                  href="/admin/rss/sources?category=Entertainment"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  <Radio className="w-4 h-4 text-amber-300" />
                  <span>सभी सोर्सेज</span>
                </Link>
              </div>
            </div>

            {/* RSS Feedback Banner */}
            {rssFeedback && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{rssFeedback}</span>
              </div>
            )}
          </div>

          {/* Subcategory Filter Pills for RSS Sources */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'सभी मनोरंजन (All)', icon: Radio },
              { id: 'bollywood', label: '🎬 बॉलीवुड', icon: Film },
              { id: 'hollywood', label: '🌟 हॉलीवुड', icon: Globe },
              { id: 'box_office', label: '💰 बॉक्स ऑफिस', icon: Trophy },
              { id: 'ott', label: '📺 ओटीटी व वेब सीरीज', icon: Tv },
              { id: 'viral', label: '🔥 वायरल वीडियो', icon: Flame },
              { id: 'cricket', label: '🏏 क्रिकेट बज़', icon: Trophy },
              { id: 'gold_silver', label: '🪙 सोना-चांदी', icon: Coins },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = rssSubcat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setRssSubcat(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs ring-2 ring-stone-900'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#EA580C]' : 'text-stone-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Source Shelf: Horizontal Grid of Entertainment Sources */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#EA580C]" />
                <h3 className="text-xs font-black text-stone-900">
                  सक्रिय मनोरंजन RSS सोर्सेज ({rssSources.length} सोर्सेज)
                </h3>
              </div>
              <span className="text-[11px] text-stone-500 font-semibold">
                सोर्स पर क्लिक करके तुरंत ताज़ा खबरें मंगाएं
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {rssSources.map((source) => {
                const isSyncing = syncingSourceId === source.id;
                return (
                  <div
                    key={source.id}
                    className="p-3 bg-stone-50/70 hover:bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between gap-2 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-orange-100 text-[#EA580C] text-[9.5px] font-black uppercase px-2 py-0.5 rounded">
                          {source.region || source.category}
                        </span>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${source.healthStatus === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          ● {source.healthStatus}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-stone-900 mt-1 line-clamp-1">
                        {source.name}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        अंतिम सिंक: {source.lastFetchAt ? new Date(source.lastFetchAt).toLocaleTimeString('hi-IN') : 'अभी तक नहीं'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSyncSource(source.id)}
                      disabled={isSyncing}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white hover:bg-orange-50 border border-stone-200 hover:border-orange-300 text-stone-700 hover:text-[#EA580C] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#EA580C]' : 'text-stone-400'}`} />
                      <span>{isSyncing ? 'सिंक हो रहा है...' : '⚡ सिंक करें'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Ingest Feed (ताज़ा प्राप्त खबरें) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-[#EA580C]" />
                  <span>मनोरंजन इनबॉक्स: नई प्राप्त खबरें ({rssItems.length})</span>
                </h3>
                <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                  1-क्लिक में दैनिक मान्यवर ड्राफ्ट बनाएं या सीधे मनोरंजन पोर्टल पर लाइव प्रकाशित करें
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchRssData(rssSubcat)}
                  disabled={loadingRss}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRss ? 'animate-spin text-[#EA580C]' : ''}`} />
                  <span>रिफ्रेश</span>
                </button>
              </div>
            </div>

            {loadingRss ? (
              <div className="p-12 text-center text-stone-500 text-xs flex items-center justify-center gap-2 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-[#EA580C]" />
                <span>मनोरंजन फ़ीड्स की खबरें लोड हो रही हैं...</span>
              </div>
            ) : rssItems.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-orange-50 text-[#EA580C] rounded-2xl flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-stone-900">
                  इस कैटेगिरी में कोई नई खबर इनबॉक्स में नहीं है
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  ताज़ा बॉलीवुड, हॉलीवुड या वायरल खबरें प्राप्त करने के लिए ऊपर दिए गए "⚡ सभी मनोरंजन फ़ीड्स सिंक करें" बटन पर क्लिक करें।
                </p>
                <button
                  onClick={handleSyncAllRss}
                  disabled={syncingAll}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>⚡ अभी RSS फ़ीड्स सिंक करें</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {rssItems.map((item) => {
                  const isProcessing = itemProcessingId === item.id;
                  const itemTags: string[] = item.suggestedTagsJson
                    ? JSON.parse(item.suggestedTagsJson)
                    : [];

                  return (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Thumbnail */}
                        <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.originalTitle}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Film className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold text-[#EA580C] bg-orange-50 border border-orange-200 px-2 py-0.2 rounded-md">
                              {item.publisherName}
                            </span>
                            {item.source?.region && (
                              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.2 rounded-md">
                                {item.source.region}
                              </span>
                            )}
                            <span className="text-[10px] font-medium text-stone-400 font-mono">
                              {item.sourcePublishedAt
                                ? new Date(item.sourcePublishedAt).toLocaleTimeString('hi-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'अभी'}
                            </span>
                            {/[a-zA-Z]{3,}/.test(item.originalTitle) ? (
                              <span className="text-[9.5px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                अंग्रेज़ी (EN)
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                ✓ हिंदी (HI)
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-black text-stone-900 line-clamp-2 leading-snug">
                            {item.originalTitle}
                          </h4>

                          {item.originalExcerpt && (
                            <p className="text-[11px] font-medium text-stone-500 line-clamp-1">
                              {item.originalExcerpt}
                            </p>
                          )}

                          {/* Suggested Tags */}
                          {itemTags.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              {itemTags.slice(0, 4).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9.5px] font-mono font-bold text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: 1-Click Draft, 1-Click Publish Live, View Source, Dismiss */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                        {/* 1-Click Translate Button */}
                        {(/[a-zA-Z]{3,}/.test(item.originalTitle) || /[a-zA-Z]{3,}/.test(item.originalExcerpt || '')) && (
                          <button
                            type="button"
                            disabled={translatingItemId === item.id}
                            onClick={() => handleTranslateItem(item.id)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                            title="खबर का शीर्षक व विवरण तुरंत हिंदी में अनुवाद करें"
                          >
                            <Languages className={`w-3.5 h-3.5 ${translatingItemId === item.id ? 'animate-spin' : ''}`} />
                            <span>{translatingItemId === item.id ? 'अनुवाद...' : '🌐 हिंदी अनुवाद'}</span>
                          </button>
                        )}

                        {/* 1-Click Draft Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleCreateDraft(item.id)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                          <span>{isProcessing ? 'ड्राफ्ट बन रहा है...' : '✍️ ड्राफ्ट बनाएं'}</span>
                        </button>

                        {/* 1-Click Publish Directly to Manoranjan */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handlePublishLive(item.id)}
                          className="px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isProcessing ? 'पोस्ट हो रहा है...' : '🚀 तुरंत प्रकाशित करें'}</span>
                        </button>

                        {/* View Source */}
                        <Link
                          href={item.sourceUrl}
                          target="_blank"
                          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                          title="मूल खबर देखें"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Delete/Dismiss */}
                        <button
                          type="button"
                          onClick={() => handleDeleteRssItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="इनबॉक्स से हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* 📰 ARTICLES & IN-MODULE WIDGET CONTROLS SECTION                 */}
      {/* =============================================================== */}
      {activeDesk === 'articles' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#EA580C]" />
              <span>मनोरंजन आर्टिकल्स व विजेट सेटिंग्स</span>
            </h2>

            <Link
              href="/admin/manoranjan/new"
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नया मनोरंजन आर्टिकल लिखें</span>
            </Link>
          </div>

          {/* IN-MODULE WIDGET & DISPLAY CONTROLS */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#EA580C]" />
                <h2 className="text-sm font-black text-stone-900">
                  मनोरंजन विजेट एवं सेक्शन ऑन/ऑफ कंट्रोल (In-Module Display Controls)
                </h2>
              </div>
              <span className="text-[11px] font-bold text-stone-500">
                जब दिखाना हो केवल तभी चालू रखें
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {widgetControls.map((w) => {
                const isEnabled = settings[w.key] !== 'false';
                const Icon = w.icon;
                const isSaving = savingKey === w.key;

                return (
                  <div
                    key={w.key}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isEnabled
                        ? 'bg-white border-stone-300 shadow-2xs'
                        : 'bg-stone-50/70 border-stone-200 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${w.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-3.5 h-3.5 ${w.color}`} />
                        </div>
                        <span className="text-xs font-bold text-stone-900 leading-tight">
                          {w.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleToggleWidget(w.key)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[10.5px] text-stone-500 leading-snug">
                      {w.desc}
                    </p>

                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-bold">
                      <span className="text-stone-400">स्थिति:</span>
                      <span className={isEnabled ? 'text-emerald-700' : 'text-stone-500'}>
                        {isEnabled ? '✓ सक्रिय (Live)' : '✕ छुपा हुआ (Hidden)'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subtype Filtering Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedTab === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>सभी मनोरंजन खबरें</span>
              <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-inherit font-mono">
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('movies')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === 'movies'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>🎬 फिल्में</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700 font-mono">
                {counts.movies}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('movie_review')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === 'movie_review'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>⭐ फिल्मों के रिव्यू</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700 font-mono">
                {counts.movie_review}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('viral')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === 'viral'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>🔥 दिलचस्प खबरें</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700 font-mono">
                {counts.viral}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('cricket_buzz')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === 'cricket_buzz'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>🏏 क्रिकेट की खबरें</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700 font-mono">
                {counts.cricket_buzz}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="मनोरंजन आर्टिकल, फिल्म या कीवर्ड खोजें..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#EA580C]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              खोजें
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTab('all');
                }}
                className="px-3 py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200"
              >
                रीसेट
              </button>
            )}
          </form>

          {/* Articles Table / Cards */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            {loadingArticles ? (
              <div className="p-12 text-center text-stone-500 text-xs flex items-center justify-center gap-2 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-[#EA580C]" />
                <span>मनोरंजन आर्टिकल्स लोड हो रहे हैं...</span>
              </div>
            ) : articles.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-orange-50 text-[#EA580C] rounded-2xl flex items-center justify-center mx-auto">
                  <Film className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-stone-900">अभी कोई मनोरंजन आर्टिकल नहीं है</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  फिल्में, दिलचस्प किस्से, क्रिकेट बज़ या फिल्मों के रिव्यू लिखने के लिए नया आर्टिकल जोड़ें।
                </p>
                <Link
                  href="/admin/manoranjan/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#C2410C]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>पहला मनोरंजन आर्टिकल लिखें</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {articles.map((art) => {
                  return (
                    <div
                      key={art.id}
                      className="p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          {art.featuredImage ? (
                            <Image
                              src={art.featuredImage}
                              alt={art.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Film className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getSubtypeBadge(art.sourceType, art.gallery)}
                            {art.status === 'PUBLISHED' ? (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                                प्रकाशित
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
                                ड्राफ्ट
                              </span>
                            )}
                            {art.isFeatured && (
                              <span className="text-[10px] font-extrabold text-orange-700 bg-orange-50 px-2 py-0.2 rounded-full border border-orange-200">
                                ★ फीचर्ड
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-black text-stone-900 line-clamp-1 leading-snug">
                            {art.title}
                          </h4>

                          {art.subtitle && (
                            <p className="text-[11px] font-semibold text-stone-500 line-clamp-1">
                              {art.subtitle}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] font-medium text-stone-400 pt-0.5">
                            <span>
                              {new Date(art.publishedAt || art.createdAt).toLocaleDateString('hi-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span>•</span>
                            <span>{art.viewCount || 0} व्यूज</span>
                            <span>•</span>
                            <span className="font-mono">ID: #{art.newsId || art.id.slice(0, 5)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Link
                          href={`/news/${art.slug}`}
                          target="_blank"
                          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                          title="लाइव देखें"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/admin/manoranjan/edit/${art.id}`}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#EA580C]" />
                          <span>एडिट</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id, art.title)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
