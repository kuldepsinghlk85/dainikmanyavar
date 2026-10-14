'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye,
  Heart,
  Share2,
  Volume2,
  RefreshCw,
  Smartphone,
  Monitor,
  ExternalLink,
  Edit3,
  TrendingUp,
  BarChart3,
  Layers,
  Clock,
  Sparkles,
  Radio,
  Zap,
  Info,
  Calendar,
  Users,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCount, formatHindiDate, formatHindiTimeAgo } from '@/lib/utils';

interface TopArticle {
  id: string;
  newsId: number;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  listenCount: number;
  publishedAt: string;
  author?: { name: string } | null;
  location?: { name: string } | null;
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface CategoryStat {
  id: string;
  name: string;
  slug: string;
  count: number;
  views: number;
  percent: number;
}

interface DailyTrend {
  date: string;
  views: number;
  uniqueVisitors: number;
}

interface AnalyticsData {
  filter: {
    status: string;
    period: string;
    limit: string;
    sort: string;
  };
  metrics: {
    totalLifetimeViews: number;
    liveViews: number;
    archivedViews: number;
    todayViews: number;
    weekViews: number;
    monthViews: number;
    todayUniqueReaders: number;
    weekUniqueReaders: number;
    monthUniqueReaders: number;
    totalArticles: number;
    publishedCount: number;
    archivedCount: number;
    draftCount: number;
    totalLikes: number;
    totalShares: number;
    totalListens: number;
  };
  topArticles: TopArticle[];
  categoryStats: CategoryStat[];
  deviceBreakdown: {
    mobile: { count: number; percent: number };
    desktop: { count: number; percent: number };
  };
  recentActivity: Array<{
    id: string;
    activityType: string;
    device: string;
    timestamp: string;
    user?: { fullName: string } | null;
  }>;
  dailyTrends: DailyTrend[];
}

export default function AnalyticsAdminPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'published' | 'all' | 'archived'>('published');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'week' | 'today'>('all');
  const [limitFilter, setLimitFilter] = useState<'10' | '50' | 'all'>('10');
  const [sortFilter, setSortFilter] = useState<'views' | 'latest'>('views');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchAnalytics = async (
    status = statusFilter,
    period = periodFilter,
    limit = limitFilter,
    sort = sortFilter
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/analytics?status=${status}&period=${period}&limit=${limit}&sort=${sort}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(statusFilter, periodFilter, limitFilter, sortFilter);
  }, [statusFilter, periodFilter, limitFilter, sortFilter]);

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'VIEW':
        return { text: 'समाचार पढ़ा गया', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'LIKE':
        return { text: 'लाइक किया गया', color: 'bg-red-50 text-red-700 border-red-200' };
      case 'SHARE':
        return { text: 'शेयर किया गया', color: 'bg-green-50 text-green-700 border-green-200' };
      case 'AUDIO_PLAY':
        return { text: 'ऑडियो सुना गया', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'SAVED':
        return { text: 'बुकमार्क किया गया', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { text: type, color: 'bg-stone-50 text-stone-700 border-stone-200' };
    }
  };

  const getRankBadgeStyle = (index: number) => {
    if (index === 0) return 'bg-amber-500 text-white shadow-xs font-black ring-2 ring-amber-300';
    if (index === 1) return 'bg-slate-400 text-white shadow-xs font-bold';
    if (index === 2) return 'bg-amber-700 text-white shadow-xs font-bold';
    return 'bg-stone-100 text-stone-700 border border-stone-200 font-bold';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Interactive Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#EA580C]" />
              <span>सत्यापित ऑडियंस एनालिटिक्स (Audience Analytics)</span>
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              लाइव रियल-टाइम
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            बॉट-फिल्टर व 30-मिनट डिबाउंस के साथ वास्तविक पाठकों का प्रमाणित दृश्य रिकॉर्ड (अंतिम अपडेट:{' '}
            {lastRefreshed.toLocaleTimeString('hi-IN')})
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Segmented Toggle */}
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🟢 लाइव ({data?.metrics?.publishedCount ?? '..'})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              📁 कुल समस्त ({data?.metrics?.totalArticles ?? '..'})
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'archived'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              📦 आर्काइव ({data?.metrics?.archivedCount ?? '..'})
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              कुल (All)
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === 'month'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              28 दिन
            </button>
            <button
              onClick={() => setPeriodFilter('week')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === 'week'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              7 दिन
            </button>
            <button
              onClick={() => setPeriodFilter('today')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === 'today'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              आज
            </button>
          </div>

          {/* Link to Editorial Performance */}
          <Link
            href="/admin/editorial-performance"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>संपादकीय रिपोर्ट</span>
          </Link>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAnalytics(statusFilter, periodFilter, limitFilter, sortFilter)}
            disabled={loading}
            className="p-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 rounded-xl border border-stone-200 transition-all cursor-pointer"
            title="डेटा रीफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 text-[#EA580C] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Prominent Educational Box: CMS Views vs GA4 Active Users */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4.5 text-stone-800 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs leading-relaxed">
            <h2 className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
              <span>मेट्रिक्स तुलना: CMS Article Views vs Google Analytics (GA4)</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                पारदर्शिता दिशानिर्देश
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                <span className="font-bold text-stone-900 block mb-0.5">1. CMS Article Views (यहाँ प्रदर्शित):</span>
                <span>
                  प्रत्येक समाचार पृष्ठ पर कम से कम 4 सेकंड का पठन समय, बॉट/सर्च स्पाइडर एक्सक्लूजन, और प्रति विज़िटर 30-मिनट डिबाउंस के बाद ही 1 व्यू गिना जाता है।
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                <span className="font-bold text-stone-900 block mb-0.5">2. GA4 Active Users:</span>
                <span>
                  Google Analytics सत्र (Sessions) और विशिष्ट उपयोगकर्ताओं को ट्रैक करता है। यदि पाठक ने एडब्लॉकर लगाया हो, तो वह GA में नहीं दिखता पर CMS व्यू में सुरक्षित रिकॉर्ड होता है।
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                <span className="font-bold text-stone-900 block mb-0.5">3. ऐतिहासिक डेटा सुरक्षा:</span>
                <span>
                  पोर्टल के पुराने सभी 51 समाचारों का ऐतिहासिक व्यूज डेटा बिना किसी विलोपन या हानि के पूरी तरह संरक्षित है।
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Primary Audience KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* 1. Lifetime Total Views */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold">1. लाइफटाइम कुल व्यूज़</span>
            <Eye className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-black text-stone-900 font-mono tracking-tight">
            {data ? formatCount(data.metrics.totalLifetimeViews) : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 truncate">
            समस्त {data?.metrics.totalArticles || 0} समाचारों का कुल योग
          </p>
        </div>

        {/* 2. LIVE Articles Views */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold">2. लाइव समाचार व्यूज़</span>
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
            {data ? formatCount(data.metrics.liveViews) : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 truncate">
            {data?.metrics.publishedCount || 0} प्रकाशित समाचार
          </p>
        </div>

        {/* 3. Archived Views */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold">3. आर्काइव समाचार व्यूज़</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-slate-700 font-mono tracking-tight">
            {data ? formatCount(data.metrics.archivedViews) : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 truncate">
            {data?.metrics.archivedCount || 0} संग्रहीत पुराने समाचार
          </p>
        </div>

        {/* 4. Today's Views */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold">4. आज के व्यूज़</span>
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {data ? formatCount(data.metrics.todayViews) : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 truncate">
            आज के यूनिक पाठक: {data?.metrics.todayUniqueReaders || 0}
          </p>
        </div>

        {/* 5. Last 7 Days Views */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold">5. पिछले 7 दिनों के व्यूज़</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 font-mono tracking-tight">
            {data ? formatCount(data.metrics.weekViews) : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 truncate">
            7 दिन यूनिक: {data?.metrics.weekUniqueReaders || 0}
          </p>
        </div>

        {/* 6. Last 28 Days Views */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold">6. पिछले 28 दिनों के व्यूज़</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 font-mono tracking-tight">
            {data ? formatCount(data.metrics.monthViews) : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 truncate">
            28 दिन यूनिक: {data?.metrics.monthUniqueReaders || 0}
          </p>
        </div>

        {/* 7. Total Shares */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold">7. सोशल शेयर्स (Shares)</span>
            <Share2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
            {data ? formatCount(data.metrics.totalShares) : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 truncate">
            WhatsApp / सोशल मीडिया
          </p>
        </div>

        {/* 8. Total Likes */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold">8. पाठक प्रतिक्रिया (Likes)</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-100" />
          </div>
          <p className="text-2xl font-black text-red-600 font-mono tracking-tight">
            {data ? formatCount(data.metrics.totalLikes) : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 truncate">
            पाठक सहभागिता व पुष्टि
          </p>
        </div>
      </div>

      {/* Main Grid: Articles Table + Daily Trend + Category/Device Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Viewed Articles Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                {sortFilter === 'latest' ? (
                  <>
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>ताज़ा समाचार सूची (Latest News Analysis)</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-[#EA580C]" />
                    <span>शीर्ष पढ़े गए समाचार (Top Performing Articles)</span>
                  </>
                )}
              </h3>
              <p className="text-[11px] text-stone-500">
                {statusFilter === 'published' ? 'लाइव प्रकाशित समाचार' : 'समस्त प्रकाशित व आर्काइव समाचार'}
              </p>
            </div>

            {/* Sort and Limit Controls */}
            <div className="flex items-center gap-2">
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="views">🔥 व्यूज़ के आधार पर (Top Views)</option>
                <option value="latest">⚡ ताज़ा प्रकाशित (Latest First)</option>
              </select>

              <select
                value={limitFilter}
                onChange={(e) => setLimitFilter(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="10">Top 10</option>
                <option value="50">Top 50</option>
                <option value="all">सभी (All)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">रैंक / शीर्षक</th>
                  <th className="py-2.5 px-3 text-center">स्थिति</th>
                  <th className="py-2.5 px-3 text-right">सत्यापित व्यूज़</th>
                  <th className="py-2.5 px-3 text-right">लाइक्स</th>
                  <th className="py-2.5 px-3 text-right">शेयर्स</th>
                  <th className="py-2.5 px-3 text-center">एक्शन</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      <RefreshCw className="w-5 h-5 mx-auto animate-spin text-[#EA580C] mb-2" />
                      डेटा लोड हो रहा है...
                    </td>
                  </tr>
                ) : data && data.topArticles.length > 0 ? (
                  data.topArticles.map((art, idx) => (
                    <tr key={art.id} className="hover:bg-orange-50/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${getRankBadgeStyle(
                              idx
                            )}`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-stone-900 line-clamp-1 hover:text-[#EA580C]">
                              {art.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                              {art.category && (
                                <span className="text-[#EA580C] font-semibold">
                                  {art.category.name}
                                </span>
                              )}
                              {art.location && (
                                <span>📍 {art.location.name}</span>
                              )}
                              <span>• {formatHindiTimeAgo(art.publishedAt)}</span>
                              {art.newsId ? (
                                <span className="font-mono bg-stone-100 px-1 rounded text-stone-600">
                                  ID: {art.newsId}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            art.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {art.status === 'PUBLISHED' ? 'लाइव' : 'आर्काइव'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 text-sm">
                        {formatCount(art.viewCount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-stone-600">
                        {art.likeCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-stone-600">
                        {art.shareCount}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={art.newsId ? `/news/${art.newsId}` : `/news/${encodeURIComponent(art.slug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-stone-100 text-stone-500 hover:text-stone-900 rounded-md transition-colors"
                            title="वेबसाइट पर देखें"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/admin/news/edit/${art.id}`}
                            className="p-1 hover:bg-orange-100 text-stone-500 hover:text-[#EA580C] rounded-md transition-colors"
                            title="संपादित करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      कोई समाचार उपलब्ध नहीं
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Category Breakdown & Device Ratio */}
        <div className="space-y-6">
          {/* Category Performance Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#EA580C]" />
                <span>श्रेणी अनुसार पाठक प्रतिशत</span>
              </h3>
            </div>

            <div className="space-y-3">
              {data && data.categoryStats.length > 0 ? (
                data.categoryStats.slice(0, 7).map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">{cat.name}</span>
                      <span className="font-mono text-stone-500 text-[11px]">
                        {formatCount(cat.views)} व्यूज़ ({cat.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, cat.percent)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 text-center py-4">श्रेणी डेटा लोड हो रहा है...</p>
              )}
            </div>
          </div>

          {/* Device Breakdown (Desktop vs Mobile) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>डिवाइस शेयर (Device Breakdown)</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#EA580C]" />
                  <span className="text-xs font-bold text-stone-800">मोबाइल यूज़र्स</span>
                </div>
                <span className="text-xs font-mono font-bold text-stone-900">
                  {data?.deviceBreakdown.mobile.percent || 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#EA580C] rounded-full"
                  style={{ width: `${data?.deviceBreakdown.mobile.percent || 70}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-stone-800">डेस्कटॉप यूज़र्स</span>
                </div>
                <span className="text-xs font-mono font-bold text-stone-900">
                  {data?.deviceBreakdown.desktop.percent || 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${data?.deviceBreakdown.desktop.percent || 30}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
