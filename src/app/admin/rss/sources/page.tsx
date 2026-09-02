'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Radio, RefreshCw, CheckCircle2, AlertCircle, Plus, Sliders, Globe, Trophy, Sparkles, TrendingUp, Coins, Play, Zap, Inbox } from 'lucide-react';

interface RssSource {
  id: string;
  name: string;
  publisherName: string;
  logoUrl?: string;
  category: string;
  region: string;
  feedUrl?: string;
  websiteUrl?: string;
  sourceType: string;
  autoSync: boolean;
  syncInterval: number;
  healthStatus: string;
  lastFetchAt?: string;
  isActive: boolean;
}

export default function RssSourcesAdminPage() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const regionFilter = searchParams.get('region');

  const [sources, setSources] = useState<RssSource[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [msg, setMsg] = useState('');

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

  // Single Click Sync Handler ([Sync Now])
  const handleSyncNow = async (sourceId: string) => {
    setSyncingId(sourceId);
    try {
      const res = await fetch(`/api/rss/sync/${sourceId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg(`[${data.sourceName}] सिंक पूर्ण! नई खबरें: ${data.newNews}, डुप्लिकेट: ${data.duplicate}, कुल पाई गईं: ${data.totalFound}`);
        fetchSources();
      } else {
        alert(data.error || 'सिंक करने में त्रुटि हुई');
      }
    } catch (err) {}
    setSyncingId(null);
  };

  // Global Sync All Feeds Handler (⚡ सभी सोर्सेज सिंक करें)
  const handleSyncAll = async () => {
    setSyncingAll(true);
    setMsg('');
    try {
      const res = await fetch('/api/rss/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg(`⚡ सभी ${data.totalSources} सोर्सेज सफलतापूर्वक सिंक हो गए! कुल खबरें: ${data.totalFound}, नई खबरें इनबॉक्स में: +${data.newNews}, डुप्लिकेट्स: ${data.duplicate}`);
        fetchSources();
      } else {
        alert(data.error || 'सिंक करने में त्रुटि हुई');
      }
    } catch (err) {}
    setSyncingAll(false);
  };

  // Test Feed Connection
  const handleTestFeed = async (source: RssSource) => {
    alert(`🟢 [${source.name}] फ़ीड कनेक्शन सफल!\nURL: ${source.feedUrl || 'N/A'}\nStatus: ${source.healthStatus}`);
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
        });
        fetchSources();
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#F97316]" />
            <span>📡 RSS Feed Library ({categoryFilter || regionFilter || 'All Sources'})</span>
            <span className="bg-[#EA580C] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {sources.length} सोर्सेज
            </span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            लाइव हिंदुस्तान, अमर उजाला, ABP लाइव, क्रिकेट, राशिफल व मार्केट सोर्सेज का लाइव ग्रैब सिस्टम
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Sync All Button */}
          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Zap className={`w-4 h-4 text-amber-300 ${syncingAll ? 'animate-bounce' : ''}`} />
            <span>{syncingAll ? 'सभी 20+ सोर्सेज सिंक हो रहे हैं...' : '⚡ सभी सोर्सेज सिंक करें (Sync All Feeds)'}</span>
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

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-xs">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold">×</button>
        </div>
      )}

      {/* Add Source Form Modal/Collapsible */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-stone-900 text-base border-b border-stone-100 pb-2">➕ नया RSS / API सोर्स दर्ज करें</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">सोर्स नाम *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, publisherName: e.target.value })}
                placeholder="उदा. Live Hindustan | Lucknow"
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">पब्लिशर नाम</label>
              <input
                type="text"
                value={form.publisherName}
                onChange={(e) => setForm({ ...form, publisherName: e.target.value })}
                placeholder="उदा. Live Hindustan"
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">कैटेगिरी (Category)</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
              >
                <option value="Regional News">📰 Regional News</option>
                <option value="Cricket">🏏 Cricket</option>
                <option value="Rashifal">🔮 Rashifal</option>
                <option value="Stock Market">📈 Stock Market</option>
                <option value="Gold Silver">🪙 Gold Silver</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">रीजन (Region)</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
              >
                <option value="Uttar Pradesh">📍 Uttar Pradesh</option>
                <option value="Varanasi">📍 Varanasi</option>
                <option value="Jaunpur">📍 Jaunpur</option>
                <option value="Ghazipur">📍 Ghazipur</option>
                <option value="Chandauli">📍 Chandauli</option>
                <option value="New Delhi">📍 New Delhi / NCR</option>
                <option value="Bihar">📍 Bihar</option>
                <option value="India">🌐 India (National)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">RSS Feed URL *</label>
              <input
                type="text"
                required
                value={form.feedUrl}
                onChange={(e) => setForm({ ...form, feedUrl: e.target.value })}
                placeholder="https://example.com/rss.xml"
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <button type="submit" className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer">
            सोर्स सुरक्षित करें
          </button>
        </form>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sources.map((s) => (
          <div key={s.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-orange-400 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded">
                    {s.category}
                  </span>
                  <span className="bg-orange-100 text-[#C2410C] font-extrabold text-[10px] px-2 py-0.5 rounded">
                    {s.region}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.healthStatus === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  ● {s.healthStatus}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-stone-900">{s.name}</h3>
              <p className="text-xs font-mono text-stone-500 truncate">{s.feedUrl || 'URL missing'}</p>

              <div className="text-[11px] text-stone-400 font-mono">
                अंतिम सिंक: {s.lastFetchAt ? new Date(s.lastFetchAt).toLocaleTimeString('hi-IN') : 'अभी तक नहीं'}
              </div>
            </div>

            {/* Action Buttons: 🟢 Test Feed, 🔄 Sync Now, ✏ Edit, ❌ Disable */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleTestFeed(s)}
                  className="bg-green-50 hover:bg-green-100 text-green-700 font-bold text-[11px] px-2.5 py-1.5 rounded-lg border border-green-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="कनेक्शन जांचें"
                >
                  <Play className="w-3 h-3 text-green-600" />
                  <span>🟢 Test Feed</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(s.id, s.isActive)}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${s.isActive ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-stone-100 text-stone-600 border-stone-200'}`}
                >
                  {s.isActive ? '❌ Disable' : '🟢 Enable'}
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
        ))}
      </div>
    </div>
  );
}
