'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Radio, RefreshCw, CheckCircle2, AlertCircle, Plus, Sliders, Globe, Play, Zap, Inbox, X, Trash2, AlertTriangle, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import ImporterSubNav from '@/components/admin/ImporterSubNav';

interface RssSource {
  id: string;
  name: string;
  publisherName: string;
  logoUrl?: string;
  category: string;
  region: string;
  country?: string;
  state?: string;
  city?: string;
  feedUrl?: string;
  websiteUrl?: string;
  sourceType: string;
  autoSync: boolean;
  syncInterval: number;
  healthStatus: string;
  verificationStatus?: string; // VERIFIED, UNVERIFIED, FAILED, DISABLED
  lastError?: string | null;
  lastFetchAt?: string;
  lastSuccessfulFetch?: string;
  lastItemDate?: string;
  itemsReceived?: number;
  isActive: boolean;
}

interface SyncedFeedback {
  sourceId?: string;
  sourceName: string;
  newNews: number;
  duplicate: number;
  totalFound: number;
  message: string;
}

export default function RssSourcesAdminPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-stone-500">RSS सोर्सेज लोड हो रहे हैं...</div>}>
      <RssSourcesContent />
    </React.Suspense>
  );
}

function RssSourcesContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const regionFilter = searchParams.get('region');

  const [sources, setSources] = useState<RssSource[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [msg, setMsg] = useState('');
  const [syncedHistory, setSyncedHistory] = useState<Record<string, SyncedFeedback>>({});
  const [activeBannerSync, setActiveBannerSync] = useState<SyncedFeedback | null>(null);
  const [floatingToast, setFloatingToast] = useState<SyncedFeedback | null>(null);

  // Filter state
  const [publisherFilter, setPublisherFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');

  // Add Source Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    publisherName: '',
    category: categoryFilter || 'Regional News',
    region: regionFilter || 'Uttar Pradesh',
    feedUrl: '',
    websiteUrl: '',
    sourceType: 'RSS',
    city: '',
    state: 'Uttar Pradesh',
  });

  const fetchSources = async () => {
    try {
      let url = '/api/rss/sources';
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (regionFilter) params.append('region', regionFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setSources(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchSources();
  }, [categoryFilter, regionFilter]);

  // Single Click Sync Handler
  const handleSyncNow = async (sourceId: string) => {
    setSyncingId(sourceId);
    try {
      const res = await fetch(`/api/rss/sync/${sourceId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const feedback: SyncedFeedback = {
          sourceId,
          sourceName: data.sourceName || 'RSS Feed',
          newNews: data.newNews || 0,
          duplicate: data.duplicate || 0,
          totalFound: data.totalFound || 0,
          message: `[${data.sourceName}] सिंक पूर्ण! नई खबरें: ${data.newNews}, डुप्लिकेट: ${data.duplicate}, कुल पाई गईं: ${data.totalFound}`,
        };
        setSyncedHistory((prev) => ({ ...prev, [sourceId]: feedback }));
        setActiveBannerSync(feedback);
        setFloatingToast(feedback);
        setMsg(feedback.message);
        fetchSources();
      } else {
        alert(data.error || 'सिंक करने में त्रुटि हुई');
      }
    } catch (err: any) {
      alert(`सिंक त्रुटि: ${err.message}`);
    }
    setSyncingId(null);
  };

  // Test Feed Connection
  const handleTestFeed = async (source: RssSource) => {
    if (!source.feedUrl) {
      alert('फ़ील्ड URL मौजूद नहीं है');
      return;
    }
    setTestingId(source.id);
    try {
      const res = await fetch(`/api/rss/sync/${source.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`🟢 फ़ीड टेस्ट सफल!\nसोर्स: ${source.name}\nकुल खबरें पाई गईं: ${data.totalFound}\nनई खबरें: ${data.newNews}\nडुप्लिकेट: ${data.duplicate}\nरिस्पॉन्स टाइम: ${data.responseTimeMs || 0}ms`);
        fetchSources();
      } else {
        alert(`🔴 फ़ीड टेस्ट विफल!\nत्रुटि: ${data.error || 'अज्ञात त्रुटि'}`);
      }
    } catch (err: any) {
      alert(`🔴 कनेक्शन त्रुटि: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  // Global Sync All Feeds Handler
  const handleSyncAll = async () => {
    setSyncingAll(true);
    setMsg('');
    try {
      const res = await fetch('/api/rss/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const feedback: SyncedFeedback = {
          sourceName: `सभी ${data.totalSources} सोर्सेज`,
          newNews: data.newNews || 0,
          duplicate: data.duplicate || 0,
          totalFound: data.totalFound || 0,
          message: `⚡ सभी ${data.totalSources} सोर्सेज सफलतापूर्वक सिंक हो गए! कुल खबरें: ${data.totalFound}, नई खबरें इनबॉक्स में: +${data.newNews}, डुप्लिकेट्स: ${data.duplicate}`,
        };
        setActiveBannerSync(feedback);
        setFloatingToast(feedback);
        setMsg(feedback.message);
        fetchSources();
      } else {
        alert(data.error || 'सिंक करने में त्रुटि हुई');
      }
    } catch (err) {}
    setSyncingAll(false);
  };

  // Toggle Source Active/Disable Status
  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await fetch('/api/rss/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      fetchSources();
    } catch (err) {}
  };

  // Delete Source
  const handleDeleteSource = async (id: string, name: string) => {
    if (!confirm(`क्या आप "${name}" RSS सोर्स को स्थायी रूप से हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch(`/api/rss/sources?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg(`"${name}" सोर्स सफलता से हटा दिया गया`);
        fetchSources();
      } else {
        alert(data.error || 'हटाने में समस्या आई');
      }
    } catch (err) {
      alert('नेटवर्क समस्या');
    }
  };

  // Add Source Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rss/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('नया RSS सोर्स सफलता से जोड़ा गया!');
        setShowAddForm(false);
        setForm({
          name: '',
          publisherName: '',
          category: 'Regional News',
          region: 'Uttar Pradesh',
          feedUrl: '',
          websiteUrl: '',
          sourceType: 'RSS',
          city: '',
          state: 'Uttar Pradesh',
        });
        fetchSources();
      }
    } catch (err) {}
  };

  // Filter sources
  const filteredSources = sources.filter((s) => {
    if (publisherFilter !== 'ALL' && s.publisherName !== publisherFilter) return false;
    if (verificationFilter === 'VERIFIED' && s.verificationStatus !== 'VERIFIED') return false;
    if (verificationFilter === 'UNVERIFIED' && s.verificationStatus !== 'UNVERIFIED') return false;
    if (verificationFilter === 'FAILED' && s.verificationStatus !== 'FAILED') return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sub Navigation Links */}
      <ImporterSubNav />

      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#F97316]" />
            <span>📡 RSS Feed Manager & Library</span>
            <span className="bg-[#EA580C] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {sources.length} सोर्सेज
            </span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            लाइव हिंदुस्तान, अमर उजाला, दैनिक भास्कर, दैनिक जागरण आदि आधिकारिक न्यूज़ सोर्सेज का ऑटो-कलेक्शन सिस्टम
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Sync All Button */}
          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Zap className={`w-4 h-4 text-amber-300 ${syncingAll ? 'animate-bounce' : ''}`} />
            <span className="text-white font-bold">{syncingAll ? 'सभी सोर्सेज सिंक हो रहे हैं...' : 'सभी सोर्सेज सिंक करें (Sync All Feeds)'}</span>
          </button>

          <Link
            href="/admin/importer/inbox"
            className="bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Inbox className="w-4 h-4 text-orange-400" />
            <span>📥 इनबॉक्स देखें</span>
          </Link>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'फॉर्म बंद करें' : '➕ नया RSS सोर्स जोड़ें'}</span>
          </button>
        </div>
      </div>

      {/* Top Sync Success Banner */}
      {activeBannerSync && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 border border-white/20 shadow-xs">
              <Inbox className="w-6 h-6 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full">
                  सिंक सफल
                </span>
                <h4 className="font-black text-sm sm:text-base">
                  {activeBannerSync.sourceName}: {activeBannerSync.newNews > 0 ? `+${activeBannerSync.newNews} नई खबरें प्राप्त हुईं` : 'सिंक पूर्ण हुआ'}
                </h4>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-1">
                {activeBannerSync.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-shrink-0">
            <Link
              href="/admin/importer/inbox"
              className="flex-1 md:flex-initial bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Inbox className="w-4 h-4 text-stone-950" />
              <span>इनबॉक्स में खबरें देखें ➔</span>
            </Link>
            <button
              onClick={() => setActiveBannerSync(null)}
              className="p-2 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Add Source Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-orange-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2 border-b pb-3">
            <span>➕ नया RSS फ़ीड सोर्स जोड़ें</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">सोर्स का नाम *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="उदा. Live Hindustan | Jaunpur"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">पब्लिशर का नाम *</label>
              <input
                type="text"
                required
                value={form.publisherName}
                onChange={(e) => setForm({ ...form, publisherName: e.target.value })}
                placeholder="उदा. Live Hindustan, Amar Ujala"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">RSS XML फ़ीड URL *</label>
              <input
                type="url"
                required
                value={form.feedUrl}
                onChange={(e) => setForm({ ...form, feedUrl: e.target.value })}
                placeholder="https://example.com/rss.xml"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">वेबसाइट URL</label>
              <input
                type="url"
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">कैटेगरी</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Regional News">Regional News (प्रादेशिक)</option>
                <option value="National">National (देश)</option>
                <option value="Breaking News">Breaking News (ताजा खबर)</option>
                <option value="Entertainment">Entertainment (मनोरंजन)</option>
                <option value="Editorial">Editorial (संपादकीय / विचार)</option>
                <option value="Cricket">Cricket (क्रिकेट)</option>
                <option value="Stock Market">Stock Market (शेयर बाजार)</option>
                <option value="Gold Silver">Gold Silver (सोना-चांदी)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">क्षेत्र / शहर (City / Region)</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value, region: e.target.value || form.region })}
                placeholder="उदा. Jaunpur, Varanasi, Lucknow"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button type="submit" className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer">
            सोर्स सुरक्षित करें
          </button>
        </form>
      )}

      {/* Publisher & Verification Filter Tabs */}
      <div className="flex flex-col gap-3">
        {/* Publisher Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          <span className="text-xs font-extrabold text-stone-500 uppercase mr-1">पब्लिशर:</span>
          {['ALL', 'Live Hindustan', 'Amar Ujala', 'Dainik Bhaskar', 'Dainik Jagran'].map((pub) => (
            <button
              key={pub}
              onClick={() => setPublisherFilter(pub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                publisherFilter === pub
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {pub === 'ALL' ? 'सभी पब्लिशर्स' : pub}
            </button>
          ))}
        </div>

        {/* Verification Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          <span className="text-xs font-extrabold text-stone-500 uppercase mr-1">स्टेटस:</span>
          {[
            { key: 'ALL', label: 'सभी स्टेटस' },
            { key: 'VERIFIED', label: '✓ सत्यापित (Verified Active)' },
            { key: 'UNVERIFIED', label: '⚠️ जांच आवश्यक (Unverified)' },
            { key: 'FAILED', label: '✕ अनुपलब्ध (Failed 404/410)' },
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setVerificationFilter(status.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                verificationFilter === status.key
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSources.map((s) => (
          <div key={s.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-slate-900 text-orange-400 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded">
                    {s.publisherName}
                  </span>
                  <span className="bg-orange-100 text-[#C2410C] font-extrabold text-[10px] px-2 py-0.5 rounded">
                    {s.category}
                  </span>
                  {s.city && (
                    <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                      📍 {s.city}
                    </span>
                  )}
                </div>

                {/* Verification Badge */}
                <div>
                  {s.verificationStatus === 'VERIFIED' && (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>VERIFIED</span>
                    </span>
                  )}
                  {s.verificationStatus === 'UNVERIFIED' && (
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      <span>UNVERIFIED</span>
                    </span>
                  )}
                  {s.verificationStatus === 'FAILED' && (
                    <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldX className="w-3 h-3 text-rose-600" />
                      <span>FAILED</span>
                    </span>
                  )}
                  {(!s.verificationStatus || s.verificationStatus === 'DISABLED') && (
                    <span className="bg-stone-100 text-stone-600 border border-stone-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                      DISABLED
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-extrabold text-base text-stone-900">{s.name}</h3>
              <p className="text-xs font-mono text-stone-500 truncate" title={s.feedUrl || ''}>
                {s.feedUrl || 'URL missing'}
              </p>

              {/* Error Note if any */}
              {s.lastError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-900 font-medium flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{s.lastError}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                <span>अंतिम सिंक: {s.lastFetchAt ? new Date(s.lastFetchAt).toLocaleTimeString('hi-IN') : 'अभी तक नहीं'}</span>
                <span>प्राप्त खबरें: {s.itemsReceived || 0}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2.5">
              {/* If recently synced */}
              {syncedHistory[s.id] && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in duration-200">
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-blue-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>सिंक सफल! {syncedHistory[s.id].newNews > 0 ? `+${syncedHistory[s.id].newNews} नई खबरें मिलीं` : 'नई खबरें नहीं'}</span>
                    </div>
                    <p className="text-[10px] text-blue-700 font-medium truncate">
                      कुल पाई गईं: {syncedHistory[s.id].totalFound} | डुप्लिकेट: {syncedHistory[s.id].duplicate}
                    </p>
                  </div>
                  <Link
                    href="/admin/importer/inbox"
                    className="bg-[#EA580C] hover:bg-orange-700 text-white font-black text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-transform hover:scale-105 whitespace-nowrap flex-shrink-0"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>📥 इनबॉक्स खोलें ➔</span>
                  </Link>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleTestFeed(s)}
                    disabled={testingId === s.id}
                    className="bg-green-50 hover:bg-green-100 text-green-700 font-bold text-[11px] px-2.5 py-1.5 rounded-lg border border-green-200 flex items-center gap-1 transition-colors cursor-pointer"
                    title="कनेक्शन जांचें"
                  >
                    <Play className={`w-3 h-3 text-green-600 ${testingId === s.id ? 'animate-spin' : ''}`} />
                    <span>{testingId === s.id ? 'जांच जारी...' : '🟢 Test'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(s.id, s.isActive)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${s.isActive ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-stone-100 text-stone-600 border-stone-200'}`}
                  >
                    {s.isActive ? '❌ Disable' : '🟢 Enable'}
                  </button>

                  <button
                    onClick={() => handleDeleteSource(s.id, s.name)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] px-2 py-1.5 rounded-lg border border-red-200 flex items-center gap-1 transition-colors cursor-pointer"
                    title="सोर्स हटाएं"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>

                {/* Single Click Sync Button */}
                <button
                  onClick={() => handleSyncNow(s.id)}
                  disabled={syncingId === s.id}
                  className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingId === s.id ? 'animate-spin' : ''}`} />
                  <span>{syncingId === s.id ? 'सिंक जारी...' : '🔄 Sync Now'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Notification Toast */}
      {floatingToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-950/95 text-white backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-stone-700 max-w-sm sm:max-w-md flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-10 h-10 rounded-xl bg-[#EA580C]/20 text-[#EA580C] flex items-center justify-center flex-shrink-0 border border-orange-500/30">
            <Inbox className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-white truncate">
              {floatingToast.sourceName} सिंक हो गया!
            </p>
            <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
              +{floatingToast.newNews} नई खबरें इनबॉक्स में उपलब्ध हैं
            </p>
          </div>
          <Link
            href="/admin/importer/inbox"
            className="bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs transition-transform hover:scale-105 whitespace-nowrap cursor-pointer"
          >
            खोलें
          </Link>
          <button
            onClick={() => setFloatingToast(null)}
            className="p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
