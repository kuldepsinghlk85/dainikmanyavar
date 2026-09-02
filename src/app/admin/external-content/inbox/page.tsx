'use client';

import React, { useState, useEffect } from 'react';
import { Inbox, CheckCircle2, XCircle, RefreshCw, Sparkles, Trophy, TrendingUp, Coins } from 'lucide-react';

interface FeedItem {
  id: string;
  moduleType: string;
  sourceName: string;
  title: string;
  summary: string;
  suggestedTags: string;
  status: string;
  fetchedAt: string;
}

export default function ExternalContentInboxPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [activeModule, setActiveModule] = useState<string>('ALL');

  const fetchItems = async () => {
    try {
      const url = activeModule === 'ALL' ? '/api/admin/external-content/inbox' : `/api/admin/external-content/inbox?moduleType=${activeModule}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchItems();
  }, [activeModule]);

  const handleSyncFeeds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/external-content/fetch', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg(`सफलतापूर्वक ${data.count} नए विशेष समाचार इनबॉक्स में प्राप्त हुए!`);
        fetchItems();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch('/api/admin/external-content/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchItems();
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#F97316]" />
            <span>विशेष ऑटो इनबॉक्स (External Content Review Panel)</span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            क्रिकेट, राशिफल, शेयर बाजार व सोना-चांदी के ऑटो फ़ीड्स — समीक्षा करें व पब्लिश करें
          </p>
        </div>

        <button
          onClick={handleSyncFeeds}
          disabled={loading}
          className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'सिंक हो रहा है...' : '🔄 सभी विशेष फ़ीड्स सिंक करें'}</span>
        </button>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Module Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs">
        <button
          onClick={() => setActiveModule('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer ${activeModule === 'ALL' ? 'bg-[#EA580C] text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
        >
          सभी (All Special Feeds)
        </button>
        <button
          onClick={() => setActiveModule('CRICKET')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer ${activeModule === 'CRICKET' ? 'bg-[#EA580C] text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
        >
          🏏 क्रिकेट (Cricket)
        </button>
        <button
          onClick={() => setActiveModule('HOROSCOPE')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer ${activeModule === 'HOROSCOPE' ? 'bg-[#EA580C] text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
        >
          🔮 राशिफल (Horoscope)
        </button>
        <button
          onClick={() => setActiveModule('STOCK_MARKET')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer ${activeModule === 'STOCK_MARKET' ? 'bg-[#EA580C] text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
        >
          📈 शेयर बाजार (Market)
        </button>
        <button
          onClick={() => setActiveModule('GOLD_SILVER')}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer ${activeModule === 'GOLD_SILVER' ? 'bg-[#EA580C] text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
        >
          🪙 सोना-चांदी (Gold-Silver)
        </button>
      </div>

      {/* Inbox Items Grid */}
      <div className="space-y-4">
        {items.map((item) => {
          const tags = item.suggestedTags ? JSON.parse(item.suggestedTags) : [];

          return (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-orange-400 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded">
                    📡 {item.sourceName}
                  </span>
                  <span className="bg-orange-100 text-[#C2410C] font-extrabold text-[10px] px-2 py-0.5 rounded">
                    {item.moduleType}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-stone-900 leading-snug">{item.title}</h3>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{item.summary}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t: string) => (
                    <span key={t} className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {item.status === 'NEW' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAction(item.id, 'APPROVE')}
                    className="bg-[#16A34A] hover:bg-green-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>स्वीकार करें व पब्लिश करें</span>
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'REJECT')}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>रिजेक्ट</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
