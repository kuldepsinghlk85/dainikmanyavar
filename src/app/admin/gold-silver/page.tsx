'use client';

import React, { useState, useEffect } from 'react';
import { Coins, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminGoldSilverPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [homepageActive, setHomepageActive] = useState(true);
  const [form, setForm] = useState({
    city: 'वाराणसी',
    gold24K: '74800',
    gold22K: '68600',
    silver: '88900',
    goldChange: '200',
    silverChange: '-150',
  });

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/admin/gold-silver');
      const data = await res.json();
      if (data.success) setPrices(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchPrices();
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setHomepageActive(d.data.widget_gold_silver_enabled !== 'false');
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleHomepage = async () => {
    const nextState = !homepageActive;
    setHomepageActive(nextState);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widget_gold_silver_enabled: nextState ? 'true' : 'false' }),
      });
      setSyncMsg(nextState ? '✅ सोना-चांदी विगेट होमपेज पर सक्रिय (दिखाया गया)!' : '🔒 सोना-चांदी विगेट होमपेज से छिपा दिया गया!');
      setTimeout(() => setSyncMsg(''), 4000);
    } catch (e) {}
  };

  const handleAutoSyncNow = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await fetch('/api/auto-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMsg('✅ आज का ताज़ा सराफा भाव स्वतः अपडेट हो गया!');
        fetchPrices();
        setTimeout(() => setSyncMsg(''), 4000);
      }
    } catch (err) {
      alert('सिंक में त्रुटि');
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/gold-silver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert('सोना-चांदी दरें सफलतापूर्वक अपडेट हो गईं!');
        fetchPrices();
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-600" />
            <span>सोना-चांदी भाव प्रबंधन (Gold Silver CMS)</span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            वाराणसी, जौनपुर, लखनऊ, दिल्ली व पटना के 24K/22K सोना तथा चांदी की दरें (ऑटोमैटिक अपडेट समर्थित)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Homepage Visibility Toggle */}
          <button
            type="button"
            onClick={handleToggleHomepage}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs border cursor-pointer ${
              homepageActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
            }`}
            title="होमपेज पर इस विगेट को दिखाने या छिपाने के लिए क्लिक करें"
          >
            <span>{homepageActive ? '🟢 होमपेज पर सक्रिय (दिख रहा है)' : '🔴 होमपेज से छिपा हुआ'}</span>
          </button>

          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ऑटो-अपडेट सक्रिय</span>
          </span>
          <button
            type="button"
            onClick={handleAutoSyncNow}
            disabled={syncing}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'अपडेट हो रहा है...' : 'अभी रीफ्रेश करें'}</span>
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{syncMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-stone-900 border-b border-stone-100 pb-2">🪙 शहर अनुसार नया सराफा भाव दर्ज करें</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">शहर (City) *</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="उदा. वाराणसी, जौनपुर"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">24K सोना (10 ग्राम) ₹</label>
            <input
              type="number"
              required
              value={form.gold24K}
              onChange={(e) => setForm({ ...form, gold24K: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono font-bold text-amber-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">22K सोना (10 ग्राम) ₹</label>
            <input
              type="number"
              required
              value={form.gold22K}
              onChange={(e) => setForm({ ...form, gold22K: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">चांदी (1 किलोग्राम) ₹</label>
            <input
              type="number"
              required
              value={form.silver}
              onChange={(e) => setForm({ ...form, silver: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">सोना बदलाव (+/-)</label>
            <input
              type="number"
              value={form.goldChange}
              onChange={(e) => setForm({ ...form, goldChange: e.target.value })}
              placeholder="200 या -150"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">चांदी बदलाव (+/-)</label>
            <input
              type="number"
              value={form.silverChange}
              onChange={(e) => setForm({ ...form, silverChange: e.target.value })}
              placeholder="-100 या 250"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
            />
          </div>
        </div>

        <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm">
          दरें अपडेट करें
        </button>
      </form>
    </div>
  );
}
