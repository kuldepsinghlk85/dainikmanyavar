'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminHoroscopePage() {
  const [horoscopes, setHoroscopes] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    zodiacSign: 'mesh',
    zodiacHindi: 'मेष (Aries)',
    title: 'आज का राशिफल: मेष राशि',
    prediction: '',
    love: '',
    career: '',
    health: '',
    finance: '',
    luckyNumber: '9',
    luckyColor: 'लाल (Red)',
  });

  const fetchHoroscopes = async () => {
    try {
      const res = await fetch('/api/admin/horoscope');
      const data = await res.json();
      if (data.success) setHoroscopes(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchHoroscopes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('राशिफल सफलता से पब्लिश हो गया!');
        setForm({
          zodiacSign: 'mesh',
          zodiacHindi: 'मेष (Aries)',
          title: 'आज का राशिफल: मेष राशि',
          prediction: '',
          love: '',
          career: '',
          health: '',
          finance: '',
          luckyNumber: '9',
          luckyColor: 'लाल (Red)',
        });
        fetchHoroscopes();
      }
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस राशिफल रिकॉर्ड को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/admin/horoscope?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg('राशिफल रिकॉर्ड हटा दिया गया!');
        fetchHoroscopes();
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#F97316]" />
            <span>राशिफल प्रबंधन (Horoscope CMS)</span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            12 राशियों के दैनिक फलादेश, करियर, लव लाइफ, स्वास्थ्य व लकी नंबर अद्यतन व हटाएँ
          </p>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-stone-900 border-b border-stone-100 pb-2">🔮 दैनिक राशिफल अद्यतन</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">राशि (Zodiac Sign)</label>
            <select
              value={form.zodiacSign}
              onChange={(e) => {
                const val = e.target.value;
                const map: any = {
                  mesh: 'मेष (Aries)', vrishabh: 'वृषभ (Taurus)', mithun: 'मिथुन (Gemini)',
                  kark: 'कर्क (Cancer)', simha: 'सिंह (Leo)', kanya: 'कन्या (Virgo)',
                  tula: 'तुला (Libra)', vrischik: 'वृश्चिक (Scorpio)', dhanu: 'धनु (Sagittarius)',
                  makar: 'मकर (Capricorn)', kumbh: 'कुंभ (Aquarius)', meen: 'मीन (Pisces)'
                };
                setForm({ ...form, zodiacSign: val, zodiacHindi: map[val] || val, title: `आज का राशिफल: ${map[val]}` });
              }}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
            >
              <option value="mesh">मेष (Aries)</option>
              <option value="vrishabh">वृषभ (Taurus)</option>
              <option value="mithun">मिथुन (Gemini)</option>
              <option value="kark">कर्क (Cancer)</option>
              <option value="simha">सिंह (Leo)</option>
              <option value="kanya">कन्या (Virgo)</option>
              <option value="tula">तुला (Libra)</option>
              <option value="vrischik">वृश्चिक (Scorpio)</option>
              <option value="dhanu">धनु (Sagittarius)</option>
              <option value="makar">मकर (Capricorn)</option>
              <option value="kumbh">कुंभ (Aquarius)</option>
              <option value="meen">मीन (Pisces)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">शीर्षक *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">दैनिक मुख्य फलादेश (Daily Prediction) *</label>
          <textarea
            rows={2}
            required
            value={form.prediction}
            onChange={(e) => setForm({ ...form, prediction: e.target.value })}
            placeholder="आज का राशिफल विवरण लिखें..."
            className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">प्रेम जीवन (Love Life)</label>
            <input
              type="text"
              value={form.love}
              onChange={(e) => setForm({ ...form, love: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">करियर (Career)</label>
            <input
              type="text"
              value={form.career}
              onChange={(e) => setForm({ ...form, career: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <button type="submit" className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer">
          राशिफल सुरक्षित करें
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-3 p-5">
        <h3 className="font-extrabold text-stone-900 text-base border-b border-stone-100 pb-2">
          📋 प्रकाशित राशिफल रिकॉर्ड्स ({horoscopes.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 font-extrabold text-stone-700 border-b border-stone-200">
              <tr>
                <th className="p-3">राशि</th>
                <th className="p-3">शीर्षक</th>
                <th className="p-3">फलादेश</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {horoscopes.map((h) => (
                <tr key={h.id} className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-amber-900">{h.zodiacHindi}</td>
                  <td className="p-3 font-bold text-stone-900">{h.title}</td>
                  <td className="p-3 text-stone-600 max-w-md truncate">{h.prediction}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-bold p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
