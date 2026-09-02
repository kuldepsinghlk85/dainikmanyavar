'use client';

import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';

export default function AdminGoldSilverPage() {
  const [prices, setPrices] = useState<any[]>([]);
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
  }, []);

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
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-600" />
            <span>सोना-चांदी भाव प्रबंधन (Gold Silver CMS)</span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            वाराणसी, जौनपुर, लखनऊ, दिल्ली व पटना के 24K/22K सोना तथा चांदी की दरें अद्यतन करें
          </p>
        </div>
      </div>

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
