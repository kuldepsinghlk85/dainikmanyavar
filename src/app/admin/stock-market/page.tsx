'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminStockMarketPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [homepageActive, setHomepageActive] = useState(true);
  const [form, setForm] = useState({
    title: '',
    company: 'भारतीय शेयर बाजार',
    symbol: 'SENSEX',
    price: '85,240.50',
    changePrice: '+480.20',
    changePercent: '+0.57%',
    movement: 'UP',
    indexName: 'SENSEX',
    content: '',
  });

  const fetchUpdates = async () => {
    try {
      const res = await fetch('/api/admin/stock-market');
      const data = await res.json();
      if (data.success) setUpdates(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchUpdates();
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setHomepageActive(d.data.widget_stock_enabled !== 'false');
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
        body: JSON.stringify({ widget_stock_enabled: nextState ? 'true' : 'false' }),
      });
      setSyncMsg(nextState ? '✅ शेयर बाजार विगेट होमपेज पर सक्रिय (दिखाया गया)!' : '🔒 शेयर बाजार विगेट होमपेज से छिपा दिया गया!');
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
        setSyncMsg('✅ आज का सेंसेक्स, निफ्टी व शेयर बाजार डेटा स्वतः अपडेट हो गया!');
        fetchUpdates();
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
      const res = await fetch('/api/admin/stock-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert('शेयर बाजार अपडेट सफलतापूर्वक सुरक्षित हो गया!');
        fetchUpdates();
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <span>शेयर बाजार प्रबंधन (Stock Market CMS)</span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            सेंसेक्स, निफ्टी, आईपीओ, शेयर भाव व बाजार विश्लेषण (ऑटोमैटिक अपडेट समर्थित)
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
        <h3 className="font-extrabold text-stone-900 border-b border-stone-100 pb-2">📈 नया बाजार अपडेट जोड़ें</h3>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">मुख्य शीर्षक *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="उदा. सेंसेक्स 85,000 के पार, निफ्टी में भी तेजी..."
            className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">इंडेक्स / कंपनी नाम</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">इंडेक्स मान (Index Value)</label>
            <input
              type="text"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="85,240.50"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">बदलाव प्रतिशत (Change %)</label>
            <input
              type="text"
              value={form.changePercent}
              onChange={(e) => setForm({ ...form, changePercent: e.target.value })}
              placeholder="+0.57%"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">बाजार समाचार विवरण *</label>
          <textarea
            rows={4}
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
          />
        </div>

        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm">
          बाजार खबर पब्लिश करें
        </button>
      </form>
    </div>
  );
}
