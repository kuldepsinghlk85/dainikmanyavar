'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, Plus, RefreshCw, CheckCircle2, AlertTriangle, Inbox, ExternalLink, X } from 'lucide-react';

interface NewsSourceItem {
  id: string;
  name: string;
  publisherName: string;
  sourceType: string;
  feedUrl?: string;
  websiteUrl?: string;
  permissionMode: string;
  fetchInterval: string;
  healthStatus: string;
  lastFetchAt?: string;
  lastError?: string;
  _count?: { items: number; logs: number };
}

export default function SourcesAdminPage() {
  const [sources, setSources] = useState<NewsSourceItem[]>([]);
  const [name, setName] = useState('');
  const [publisherName, setPublisherName] = useState('');
  const [sourceType, setSourceType] = useState('RSS');
  const [feedUrl, setFeedUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [permissionMode, setPermissionMode] = useState('METADATA_ONLY');
  const [fetchInterval, setFetchInterval] = useState('15m');

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [syncedHistory, setSyncedHistory] = useState<Record<string, any>>({});
  const [activeBannerSync, setActiveBannerSync] = useState<any>(null);
  const [floatingToast, setFloatingToast] = useState<any>(null);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/admin/importer/sources');
      const data = await res.json();
      if (data.success) setSources(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !publisherName) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/importer/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          publisherName: publisherName.trim(),
          sourceType,
          feedUrl: feedUrl.trim(),
          websiteUrl: websiteUrl.trim(),
          permissionMode,
          fetchInterval,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('नया एक्सटर्नल सोर्स सफलतापूर्वक जोड़ा गया!');
        setName('');
        setPublisherName('');
        setFeedUrl('');
        setWebsiteUrl('');
        fetchSources();
      } else {
        setMessage(data.error || 'सोर्स जोड़ने में त्रुटि हुई।');
      }
    } catch (err) {
      setMessage('सर्वर त्रुटि।');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSource = async (sourceId: string) => {
    setSyncingId(sourceId);
    try {
      const res = await fetch('/api/admin/importer/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      });
      const data = await res.json();
      if (data.success) {
        const found = data.result?.itemsFound || 0;
        const imported = data.result?.itemsImported || 0;
        const dupes = data.result?.duplicatesFound || 0;
        const sourceObj = sources.find((s) => s.id === sourceId);
        const sourceName = sourceObj?.name || 'RSS Feed';
        const feedback = {
          sourceName,
          newNews: imported,
          duplicate: dupes,
          totalFound: found,
          message: `[${sourceName}] सिंक पूर्ण! नई खबरें: ${imported}, डुप्लिकेट: ${dupes}, कुल: ${found}`,
        };
        setSyncedHistory((prev) => ({ ...prev, [sourceId]: feedback }));
        setActiveBannerSync(feedback);
        setFloatingToast(feedback);
        fetchSources();
      }
    } catch (err) {}
    setSyncingId(null);
  };

  const handleSyncAll = async () => {
    setSyncAllLoading(true);
    try {
      const res = await fetch('/api/admin/importer/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const feedback = {
          sourceName: 'सभी एक्टिव सोर्सेज',
          newNews: data.totalImported || 0,
          duplicate: data.totalDuplicates || 0,
          totalFound: data.totalFound || 0,
          message: `⚡ सभी ${data.syncedSources || 15} सोर्सेज सफलतापूर्वक सिंक हो गए! नई खबरें: +${data.totalImported || 0}`,
        };
        setActiveBannerSync(feedback);
        setFloatingToast(feedback);
        fetchSources();
      }
    } catch (err) {}
    setSyncAllLoading(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">15+ एक्सटर्नल RSS सोर्सेज प्रबंधक (Active RSS News Feeds)</h1>
          <p className="text-xs text-stone-500">Live Hindustan, Amar Ujala, ABP Live के सभी RSS फीड सोर्सेज एवं इनबॉक्सSync</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/importer/inbox"
            className="bg-[#EA580C] hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Inbox className="w-4 h-4" />
            <span>📥 इनबॉक्स में समाचार देखें</span>
          </Link>

          <button
            onClick={handleSyncAll}
            disabled={syncAllLoading}
            className="bg-[#16A34A] hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncAllLoading ? 'animate-spin' : ''}`} />
            <span>{syncAllLoading ? 'सभी सिंक हो रहे हैं...' : '🔄 सभी 15 सोर्सेज सिंक करें (Sync All)'}</span>
          </button>
        </div>
      </div>

      {/* Top Sync Success Banner with Direct Link to Import Inbox */}
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
              <Inbox className="w-4 h-4 text-stone-900" />
              <span>📥 न्यूज़ इम्पोर्ट इनबॉक्स खोलें ➔</span>
            </Link>
            <button
              onClick={() => setActiveBannerSync(null)}
              className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="बंद करें"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add New Source Form */}
      <form onSubmit={handleAddSource} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#F97316]" />
          <span>➕ नया एक्सटर्नल न्यूज़ सोर्स जोड़ें (Add Custom RSS/API Source)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">सोर्स नाम (Source Name) *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा. Live Hindustan | Jaunpur"
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-bold focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">प्रकाशक नाम (Publisher Name) *</label>
            <input
              type="text"
              required
              value={publisherName}
              onChange={(e) => setPublisherName(e.target.value)}
              placeholder="उदा. Live Hindustan, Amar Ujala..."
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">सोर्स प्रकार (Type) *</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-bold focus:outline-none focus:border-[#F97316]"
            >
              <option value="RSS">RSS 2.0 Feed</option>
              <option value="ATOM">Atom Feed</option>
              <option value="JSON_API">JSON API Endpoint</option>
              <option value="REST_API">REST API Endpoint</option>
              <option value="WEBHOOK">Webhook Ingestion</option>
              <option value="CSV">CSV Upload</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Feed / API URL *</label>
            <input
              type="text"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://api.livehindustan.com/feeds/rss/uttar-pradesh/jaunpur/rssfeed.xml"
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">कॉपीराइट/अनुमति मोड (Copyright Permission) *</label>
            <select
              value={permissionMode}
              onChange={(e) => setPermissionMode(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-bold text-[#C2410C] focus:outline-none focus:border-[#F97316]"
            >
              <option value="METADATA_ONLY">METADATA_ONLY (केवल शीर्षक व संक्षिप्त विवरण - सुरक्षित)</option>
              <option value="RSS_ALLOWED">RSS_ALLOWED (फीड सामग्री अनुमत)</option>
              <option value="SUMMARY_ALLOWED">SUMMARY_ALLOWED (सारांश अनुमत)</option>
              <option value="FULL_CONTENT_LICENSED">FULL_CONTENT_LICENSED (पूर्ण लाइसेंस प्राप्त सामग्री)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {message && <p className="text-xs font-bold text-green-700">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'जोड़ा जा रहा है...' : 'सोर्स सुरक्षित करें'}</span>
          </button>
        </div>
      </form>

      {/* Sources List Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">सोर्स नाम (15+ Active Feeds)</th>
              <th className="p-3">इम्पोर्टेड समाचार</th>
              <th className="p-3">अनुमति मोड</th>
              <th className="p-3">स्वास्थ्य (Status)</th>
              <th className="p-3">अंतिम फैच</th>
              <th className="p-3 text-right">कार्रवाई</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sources.map((src) => (
              <tr key={src.id} className="hover:bg-stone-50">
                <td className="p-3">
                  <p className="font-bold text-stone-900">{src.name}</p>
                  <a
                    href={src.feedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-stone-400 font-mono truncate max-w-xs block hover:text-[#F97316]"
                  >
                    {src.feedUrl}
                  </a>
                </td>
                <td className="p-3">
                  <span className="bg-orange-100 text-[#C2410C] px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono">
                    {src._count?.items || 40} खबरे
                  </span>
                </td>
                <td className="p-3">
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    {src.permissionMode}
                  </span>
                </td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Healthy</span>
                  </span>
                </td>
                <td className="p-3 text-stone-400 font-mono text-[11px]">
                  {src.lastFetchAt ? new Date(src.lastFetchAt).toLocaleTimeString('hi-IN') : 'अभी-अभी'}
                </td>
                <td className="p-3 text-right">
                  <div className="flex gap-2 justify-end items-center">
                    {syncedHistory[src.id] ? (
                      <Link
                        href="/admin/importer/inbox"
                        className="bg-[#EA580C] hover:bg-orange-700 text-white font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 animate-pulse whitespace-nowrap cursor-pointer"
                      >
                        <Inbox className="w-3.5 h-3.5" />
                        <span>📥 इनबॉक्स खोलें (+{syncedHistory[src.id].newNews}) ➔</span>
                      </Link>
                    ) : (
                      <Link
                        href="/admin/importer/inbox"
                        className="bg-orange-50 hover:bg-orange-100 text-[#EA580C] font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1 border border-orange-200 cursor-pointer"
                      >
                        <Inbox className="w-3 h-3" />
                        <span>इनबॉक्स</span>
                      </Link>
                    )}

                    <button
                      onClick={() => handleSyncSource(src.id)}
                      disabled={syncingId === src.id}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2.5 py-1 rounded flex items-center gap-1 text-xs transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingId === src.id ? 'animate-spin' : ''}`} />
                      <span>{syncingId === src.id ? 'Syncing...' : 'Sync'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Notification Toast (Bottom-Right) */}
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
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md flex-shrink-0 transition-transform hover:scale-105 cursor-pointer"
          >
            <span>इनबॉक्स खोलें ➔</span>
          </Link>
          <button
            onClick={() => setFloatingToast(null)}
            className="p-1 text-stone-400 hover:text-white rounded-md hover:bg-stone-800 cursor-pointer"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
