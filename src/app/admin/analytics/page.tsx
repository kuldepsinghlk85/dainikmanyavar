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

interface AnalyticsData {
  filter: {
    status: string;
    period: string;
  };
  summary: {
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalListens: number;
    totalArticles: number;
    publishedCount: number;
    archivedCount: number;
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
}

export default function AnalyticsAdminPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'published' | 'all'>('published');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'week' | 'today'>('all');
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
              <span>फर्स्ट-पार्टी एनालिटिक्स (Analytics)</span>
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              लाइव सिंक
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            पाठकों की लाइव सहभागिता, व्यूज़, ऑडियो सुनने और श्रेणी-वार प्रदर्शन का सटीक विश्लेषण
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
              🟢 लाइव समाचार ({data?.summary?.publishedCount ?? '..'})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              📁 सभी + आर्काइव ({data ? (data.summary.publishedCount + data.summary.archivedCount) : '..'})
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

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-13 h-13 rounded-2xl bg-orange-50 text-[#EA580C] border border-orange-100 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-500">
              {statusFilter === 'published' ? 'लाइव व्यूज़ (Live Views)' : 'कुल व्यूज़ (Total Views)'}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 font-mono tracking-tight">
              {data ? formatCount(data.summary.totalViews) : '...'}
            </p>
            <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5">
              {statusFilter === 'published' ? 'पोर्टल पर सक्रिय 26 समाचारों से' : 'समस्त 50 प्रकाशित व आर्काइव ख़बरों से'}
            </p>
          </div>
        </div>

        {/* Total Likes */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-13 h-13 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 fill-red-100" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-500">कुल लाइक्स (Likes)</p>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 font-mono tracking-tight">
              {data ? formatCount(data.summary.totalLikes) : '...'}
            </p>
            <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5">
              पाठक पसंद व प्रतिक्रिया
            </p>
          </div>
        </div>

        {/* Total Shares */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-500">कुल शेयर्स (Shares)</p>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 font-mono tracking-tight">
              {data ? formatCount(data.summary.totalShares) : '...'}
            </p>
            <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5">
              WhatsApp व सोशल मीडिया प्रसार
            </p>
          </div>
        </div>

        {/* Total Audio Listens */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-500">ऑडियो लिसन (Listens)</p>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 font-mono tracking-tight">
              {data ? formatCount(data.summary.totalListens) : '...'}
            </p>
            <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5">
              AI ऑडियो समाचार बुलेटिन
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Top 10 Most Viewed Articles + Category/Device Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Viewed Articles Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                {sortFilter === 'latest' ? (
                  <>
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>
                      ताज़ा समाचार एनालिटिक्स (
                      {limitFilter === '10' && 'Top 10'}
                      {limitFilter === '50' && 'Top 50'}
                      {limitFilter === 'all' && 'सभी All'}
                      {' '}Latest News)
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-[#EA580C]" />
                    <span>
                      सर्वाधिक पढ़े गए समाचार (
                      {limitFilter === '10' && 'Top 10'}
                      {limitFilter === '50' && 'Top 50'}
                      {limitFilter === 'all' && 'सभी All'}
                      {' '}Most Viewed)
                    </span>
                  </>
                )}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {sortFilter === 'latest'
                  ? 'हाल ही में प्रकाशित ताज़ा समाचारों के व्यूज़, लाइक्स और ऑडियो लिसन का रियल-टाइम एनालिटिक्स'
                  : statusFilter === 'published'
                  ? 'लाइव वेबसाइट पर वर्तमान में सबसे अधिक पढ़े जा रहे समाचार (डुप्लीकेट मुक्त)'
                  : 'सभी प्रकाशित व आर्काइव ऐतिहासिक समाचारों की व्यूज़ रैंकिंग'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Sort Toggle: Views vs Latest */}
              <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSortFilter('views')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    sortFilter === 'views'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="सर्वाधिक व्यूज अनुसार"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#EA580C]" />
                  सर्वाधिक पढ़े गए
                </button>
                <button
                  type="button"
                  onClick={() => setSortFilter('latest')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    sortFilter === 'latest'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="नवीनतम / ताज़ा समाचार"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ताज़ा समाचार (Latest)
                </button>
              </div>

              {/* Limit Segmented Control: Top 10, Top 50, All */}
              <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLimitFilter('10')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    limitFilter === '10'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  टॉप 10
                </button>
                <button
                  type="button"
                  onClick={() => setLimitFilter('50')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    limitFilter === '50'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  टॉप 50
                </button>
                <button
                  type="button"
                  onClick={() => setLimitFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    limitFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  सभी (All)
                </button>
              </div>

              <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200 font-mono">
                कुल {data?.topArticles.length ?? 0} समाचार
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C] mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-500">डेटा सिंक हो रहा है...</p>
            </div>
          ) : !data || data.topArticles.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              कोई समाचार डेटा उपलब्ध नहीं है।
            </div>
          ) : (
            <div className="divide-y divide-stone-100 max-h-[850px] overflow-y-auto pr-1">
              {data.topArticles.map((art, index) => (
                <div
                  key={art.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-stone-50/80 -mx-2 px-2 rounded-xl transition-colors"
                >
                  {/* Left: Rank, Title, Category & Meta */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 mt-0.5 ${getRankBadgeStyle(
                        index
                      )}`}
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {art.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-[#EA580C] border border-orange-200">
                            {art.category.name}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            art.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {art.status === 'PUBLISHED' ? 'लाइव' : 'आर्काइव'}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">#{art.newsId}</span>
                        {art.publishedAt && (
                          <span className="text-[10px] text-stone-500 font-sans font-medium flex items-center gap-1">
                            • {formatHindiDate(art.publishedAt)}
                            {sortFilter === 'latest' && (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200/60">
                                {formatHindiTimeAgo(art.publishedAt)}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 mt-1 leading-snug line-clamp-2 group-hover:text-[#EA580C] transition-colors">
                        {art.title}
                      </h4>
                    </div>
                  </div>

                  {/* Right: Metrics & Quick Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 pl-9 sm:pl-0 border-t sm:border-t-0 border-stone-100">
                    {/* View, Like, Listen Counts */}
                    <div className="flex items-center gap-2.5 text-xs text-stone-600 font-mono font-bold bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/70">
                      <span className="text-orange-600 flex items-center gap-1" title="व्यूज़">
                        <Eye className="w-3.5 h-3.5" />
                        {formatCount(art.viewCount)}
                      </span>
                      <span className="text-stone-300">|</span>
                      <span className="text-red-500 flex items-center gap-1" title="लाइक्स">
                        <Heart className="w-3.5 h-3.5 fill-red-500" />
                        {formatCount(art.likeCount)}
                      </span>
                      <span className="text-stone-300">|</span>
                      <span className="text-purple-600 flex items-center gap-1" title="ऑडियो लिसन">
                        <Volume2 className="w-3.5 h-3.5" />
                        {formatCount(art.listenCount)}
                      </span>
                    </div>

                    {/* Quick Link Buttons */}
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/news/${encodeURIComponent(art.slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-stone-400 hover:text-[#EA580C] hover:bg-orange-50 rounded-md transition-colors"
                        title="वेबसाइट पर देखें"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/admin/news/${art.id}`}
                        className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-md transition-colors"
                        title="एडिट करें"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Category Performance & Device Breakdown */}
        <div className="space-y-6">
          {/* Category Breakdown Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#EA580C]" />
                <span>श्रेणी-वार सहभागिता (Categories)</span>
              </h3>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                व्यूज़ शेयर
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-stone-400">लोड हो रहा है...</div>
            ) : !data || data.categoryStats.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">कोई श्रेणी डेटा नहीं मिला</div>
            ) : (
              <div className="space-y-3">
                {data.categoryStats.slice(0, 7).map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
                        {cat.name}
                      </span>
                      <div className="text-[11px] font-mono font-bold text-stone-600 flex items-center gap-2">
                        <span>{formatCount(cat.views)} व्यूज़</span>
                        <span className="text-stone-400 font-normal">({cat.percent}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-[#EA580C] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, cat.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device & Engagement Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#EA580C]" />
                <span>डिवाइस सहभागिता (Device Insights)</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                पाठकों का डिवाइस वितरण (मोबाइल बनाम कंप्यूटर)
              </p>
            </div>

            <div className="space-y-3">
              {/* Mobile Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1 text-stone-700">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" /> मोबाइल (Mobile Readers)
                  </span>
                  <span className="font-mono text-blue-600">
                    {data?.deviceBreakdown.mobile.percent ?? 73}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${data?.deviceBreakdown.mobile.percent ?? 73}%` }}
                  />
                </div>
              </div>

              {/* Desktop Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1 text-stone-700">
                    <Monitor className="w-3.5 h-3.5 text-stone-600" /> डेस्कटॉप (Desktop / Web)
                  </span>
                  <span className="font-mono text-stone-600">
                    {data?.deviceBreakdown.desktop.percent ?? 27}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-600 rounded-full transition-all"
                    style={{ width: `${data?.deviceBreakdown.desktop.percent ?? 27}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Reader Activity Feed */}
          {data && data.recentActivity && data.recentActivity.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
                <Clock className="w-4 h-4 text-[#EA580C]" />
                <span>हालिया पाठक गतिविधियां (Live Activity)</span>
              </h3>

              <div className="space-y-2">
                {data.recentActivity.slice(0, 5).map((log) => {
                  const badge = getActivityLabel(log.activityType);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-stone-50/70 border border-stone-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                          {badge.text}
                        </span>
                        <span className="text-stone-500 font-mono text-[10px]">
                          {log.device === 'mobile' ? '📱 Mobile' : '💻 Web'}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
