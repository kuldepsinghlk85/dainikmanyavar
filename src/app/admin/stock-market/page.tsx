'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

export default function AdminStockMarketPage() {
  const [updates, setUpdates] = useState<any[]>([]);
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
  }, []);

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
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <span>शेयर बाजार प्रबंधन (Stock Market CMS)</span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            सेंसेक्स, निफ्टी, आईपीओ, शेयर भाव व बाजार विश्लेषण पब्लिश करें
          </p>
        </div>
      </div>

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
