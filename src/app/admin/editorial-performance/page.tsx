'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Users,
  Layers,
  MapPin,
  TrendingUp,
  Download,
  Calendar,
  RefreshCw,
  Award,
  Zap,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatCount, formatHindiDate } from '@/lib/utils';

interface AuthorStat {
  name: string;
  articlesCount: number;
  totalViews: number;
  averageViews: number;
  topArticle: { title: string; views: number; newsId: number } | null;
}

interface CategoryStat {
  name: string;
  slug: string;
  articlesCount: number;
  totalViews: number;
  sharePercent: number;
  averageViews: number;
}

interface LocationStat {
  name: string;
  articlesCount: number;
  totalViews: number;
}

interface VelocityStory {
  id: string;
  newsId: number;
  title: string;
  categoryName: string;
  authorName: string;
  publishedAt: string;
  viewCount: number;
  daysSincePub: number;
  viewsPerDay: number;
  isEvergreen: boolean;
}

interface EditorialData {
  period: string;
  totalArticles: number;
  totalViews: number;
  authorStats: AuthorStat[];
  categoryStats: CategoryStat[];
  locationStats: LocationStat[];
  velocityStories: VelocityStory[];
}

export default function EditorialPerformancePage() {
  const [data, setData] = useState<EditorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | '30days' | '7days' | 'today'>('all');
  const [activeTab, setActiveTab] = useState<'author' | 'category' | 'location' | 'velocity'>('author');

  const fetchData = async (p = period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/editorial-performance?period=${p}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to load editorial performance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const handleDownloadCsv = () => {
    window.open(`/api/admin/editorial-performance?period=${period}&format=csv`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#EA580C]" />
              <span>संपादकीय प्रदर्शन रिपोर्ट (Editorial Performance)</span>
            </h1>
            <span className="text-xs bg-orange-100 text-[#C2410C] font-bold px-2.5 py-0.5 rounded-full">
              न्यूज़रूम एनालिटिक्स
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            रिपोर्टर आउटपुट, श्रेणी प्रदर्शन, जिला कवरेज और समाचार गति (Velocity) का संपूर्ण संपादकीय मूल्यांकन
          </p>
        </div>

        {/* Date Filter & Export Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Filter */}
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              कुल (All Time)
            </button>
            <button
              onClick={() => setPeriod('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === '30days' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              30 दिन
            </button>
            <button
              onClick={() => setPeriod('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === '7days' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              7 दिन
            </button>
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'today' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              आज
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            title="Excel/CSV में डाउनलोड करें"
          >
            <Download className="w-4 h-4" />
            <span>CSV डाउनलोड</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchData(period)}
            disabled={loading}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-200 transition-all cursor-pointer"
            title="रीफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 text-[#EA580C] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-500">कुल प्रकाशित समाचार</p>
          <p className="text-2xl font-black text-stone-900 font-mono mt-1">
            {data ? data.totalArticles : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">समीक्षाधीन अवधि में</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-500">कुल पाठक व्यूज़</p>
          <p className="text-2xl font-black text-orange-600 font-mono mt-1">
            {data ? formatCount(data.totalViews) : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">सत्यापित पाठक पठन</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-500">औसत व्यूज़ प्रति समाचार</p>
          <p className="text-2xl font-black text-blue-600 font-mono mt-1">
            {data && data.totalArticles > 0
              ? formatCount(Math.round(data.totalViews / data.totalArticles))
              : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">प्रभावशीलता सूचकांक</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-500">सक्रिय रिपोर्टर्स / ब्यूरो</p>
          <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {data ? data.authorStats.length : '...'}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">लेखक व योगदानकर्ता</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('author')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'author'
              ? 'bg-[#EA580C] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>रिपोर्टर / लेखक प्रदर्शन ({data?.authorStats.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('category')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'category'
              ? 'bg-[#EA580C] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>श्रेणी प्रदर्शन ({data?.categoryStats.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('location')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'location'
              ? 'bg-[#EA580C] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>जिला / लोकेशन कवरेज ({data?.locationStats.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('velocity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'velocity'
              ? 'bg-[#EA580C] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>स्टोरी वेलोसिटी व एवरग्रीन ({data?.velocityStories.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: By Author */}
      {activeTab === 'author' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#EA580C]" />
                <span>रिपोर्टर-वार उत्पादन एवं पाठक जुड़ाव</span>
              </h3>
              <p className="text-[11px] text-stone-500">कुल समाचार, कुल व्यूज़ और औसत प्रदर्शन</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-400 uppercase">
                  <th className="py-2.5 px-3">रैंक / रिपोर्टर</th>
                  <th className="py-2.5 px-3 text-center">प्रकाशित समाचार</th>
                  <th className="py-2.5 px-3 text-right">कुल व्यूज़</th>
                  <th className="py-2.5 px-3 text-right">औसत व्यूज़/समाचार</th>
                  <th className="py-2.5 px-3">सर्वश्रेष्ठ स्टोरी (Top Story)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {data && data.authorStats.length > 0 ? (
                  data.authorStats.map((auth, idx) => (
                    <tr key={auth.name} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-stone-900">{auth.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-stone-700">
                        {auth.articlesCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-orange-600 text-sm">
                        {formatCount(auth.totalViews)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-stone-600">
                        {formatCount(auth.averageViews)}
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-stone-600 text-[11px]">
                        {auth.topArticle ? (
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{auth.topArticle.title}</span>
                            <span className="font-mono text-stone-400">({formatCount(auth.topArticle.views)})</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400">
                      कोई डेटा उपलब्ध नहीं
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: By Category */}
      {activeTab === 'category' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#EA580C]" />
                <span>श्रेणी-वार पाठक हिस्सेदारी (Category Share)</span>
              </h3>
              <p className="text-[11px] text-stone-500">कुल पाठक संख्या में विभिन्न श्रेणियों का योगदान</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-400 uppercase">
                  <th className="py-2.5 px-3">श्रेणी</th>
                  <th className="py-2.5 px-3 text-center">समाचार संख्या</th>
                  <th className="py-2.5 px-3 text-right">कुल व्यूज़</th>
                  <th className="py-2.5 px-3 text-right">औसत व्यूज़</th>
                  <th className="py-2.5 px-3">रीडरशिप शेयर (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {data && data.categoryStats.length > 0 ? (
                  data.categoryStats.map((cat) => (
                    <tr key={cat.name} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-stone-900">{cat.name}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-stone-700">
                        {cat.articlesCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-orange-600 text-sm">
                        {formatCount(cat.totalViews)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-stone-600">
                        {formatCount(cat.averageViews)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className="h-full bg-[#EA580C] rounded-full"
                              style={{ width: `${Math.max(5, cat.sharePercent)}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-stone-700">{cat.sharePercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400">
                      कोई श्रेणी डेटा उपलब्ध नहीं
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: By District / Location */}
      {activeTab === 'location' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#EA580C]" />
                <span>जिला एवं क्षेत्रीय कवरेज प्रदर्शन</span>
              </h3>
              <p className="text-[11px] text-stone-500">स्थान आधारित समाचार एवं उनकी पाठक सहभागिता</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-400 uppercase">
                  <th className="py-2.5 px-3">जिला / लोकेशन</th>
                  <th className="py-2.5 px-3 text-center">प्रकाशित समाचार</th>
                  <th className="py-2.5 px-3 text-right">कुल व्यूज़</th>
                  <th className="py-2.5 px-3 text-right">औसत व्यूज़ प्रति समाचार</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {data && data.locationStats.length > 0 ? (
                  data.locationStats.map((loc) => (
                    <tr key={loc.name} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-stone-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{loc.name}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-stone-700">
                        {loc.articlesCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-orange-600 text-sm">
                        {formatCount(loc.totalViews)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-stone-600">
                        {formatCount(Math.round(loc.totalViews / loc.articlesCount))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-stone-400">
                      कोई लोकेशन डेटा उपलब्ध नहीं
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Story Velocity (Views per Day) */}
      {activeTab === 'velocity' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>समाचार वेलोसिटी सूचकांक (Views per Day since Publication)</span>
              </h3>
              <p className="text-[11px] text-stone-500">
                दैनिक औसतन रफ्तार — एवरग्रीन व लगातार पढ़े जा रहे समाचारों की पहचान
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-400 uppercase">
                  <th className="py-2.5 px-3">समाचार शीर्षक</th>
                  <th className="py-2.5 px-3 text-center">श्रेणी</th>
                  <th className="py-2.5 px-3 text-center">आयु (दिन)</th>
                  <th className="py-2.5 px-3 text-right">कुल व्यूज़</th>
                  <th className="py-2.5 px-3 text-right">व्यूज़ प्रति दिन (Velocity)</th>
                  <th className="py-2.5 px-3 text-center">प्रकार</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {data && data.velocityStories.length > 0 ? (
                  data.velocityStories.map((story) => (
                    <tr key={story.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-3 max-w-sm">
                        <p className="font-bold text-stone-900 line-clamp-1">{story.title}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">लेखक: {story.authorName}</p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-bold bg-stone-100 px-2 py-0.5 rounded-full text-stone-600">
                          {story.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-stone-600">
                        {story.daysSincePub} दिन
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                        {formatCount(story.viewCount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-amber-600 text-sm">
                        ~{story.viewsPerDay} / दिन
                      </td>
                      <td className="py-3 px-3 text-center">
                        {story.isEvergreen ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            एवरग्रीन
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">सामान्य</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      कोई डेटा उपलब्ध नहीं
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
