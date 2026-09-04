'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Trash2, CheckCircle2, Radio, RefreshCw } from 'lucide-react';

export default function AdminCricketPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [homepageActive, setHomepageActive] = useState(true);
  const [form, setForm] = useState({
    matchTitle: '',
    tournament: 'एशिया कप 2026',
    teamA: 'भारत (IND)',
    teamB: 'ऑस्ट्रेलिया (AUS)',
    scoreA: '',
    scoreB: '',
    matchStatus: 'LIVE',
    resultText: '',
    venue: 'ईडन गार्डन्स, कोलकाता',
    newsHeadline: '',
    newsSummary: '',
  });

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/admin/cricket');
      const data = await res.json();
      if (data.success) setMatches(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchMatches();
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setHomepageActive(d.data.widget_cricket_enabled !== 'false');
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
        body: JSON.stringify({ widget_cricket_enabled: nextState ? 'true' : 'false' }),
      });
      setMsg(nextState ? '✅ क्रिकेट विगेट होमपेज पर सक्रिय (दिखाया गया)!' : '🔒 क्रिकेट विगेट होमपेज से छिपा दिया गया!');
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {}
  };

  const handleAutoSyncNow = async () => {
    setSyncing(true);
    setMsg('');
    try {
      const res = await fetch('/api/auto-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg('✅ आज के क्रिकेट लाइव स्कोर व ताज़ा खेल समाचार स्वतः अपडेट हो गए!');
        fetchMatches();
        setTimeout(() => setMsg(''), 4000);
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
      const res = await fetch('/api/admin/cricket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('क्रिकेट मैच व रिपोर्ट सफलतापूर्वक पब्लिश हो गई!');
        setForm({
          matchTitle: '',
          tournament: 'एशिया कप 2026',
          teamA: 'भारत (IND)',
          teamB: 'ऑस्ट्रेलिया (AUS)',
          scoreA: '',
          scoreB: '',
          matchStatus: 'LIVE',
          resultText: '',
          venue: 'ईडन गार्डन्स, कोलकाता',
          newsHeadline: '',
          newsSummary: '',
        });
        fetchMatches();
      }
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस मैच रिकॉर्ड को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/admin/cricket?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg('मैच रिकॉर्ड हटा दिया गया!');
        fetchMatches();
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#F97316]" />
            <span>क्रिकेट प्रबंधन (Cricket Match & Score CMS)</span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            लाइव स्कोर, मैच परिणाम, टूर्नामेंट विवरण एवं विशेष मैच रिपोर्ट (ऑटोमैटिक अपडेट समर्थित)
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

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-stone-900 border-b border-stone-100 pb-2">➕ नया क्रिकेट मैच / स्कोर कार्ड जोड़ें</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">मैच शीर्षक *</label>
            <input
              type="text"
              required
              value={form.matchTitle}
              onChange={(e) => setForm({ ...form, matchTitle: e.target.value })}
              placeholder="उदा. भारत बनाम ऑस्ट्रेलिया - एशिया कप"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">टूर्नामेंट नाम</label>
            <input
              type="text"
              value={form.tournament}
              onChange={(e) => setForm({ ...form, tournament: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">टीम A</label>
            <input
              type="text"
              value={form.teamA}
              onChange={(e) => setForm({ ...form, teamA: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">टीम B</label>
            <input
              type="text"
              value={form.teamB}
              onChange={(e) => setForm({ ...form, teamB: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">स्कोर टीम A</label>
            <input
              type="text"
              value={form.scoreA}
              onChange={(e) => setForm({ ...form, scoreA: e.target.value })}
              placeholder="312/6 (50 ओवर)"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">स्कोर टीम B</label>
            <input
              type="text"
              value={form.scoreB}
              onChange={(e) => setForm({ ...form, scoreB: e.target.value })}
              placeholder="278/10 (47.2 ओवर)"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">मैच स्थिति (Status)</label>
            <select
              value={form.matchStatus}
              onChange={(e) => setForm({ ...form, matchStatus: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-red-600"
            >
              <option value="LIVE">🔴 LIVE</option>
              <option value="UPCOMING">Upcoming (आगामी)</option>
              <option value="RESULT">Result (परिणाम)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">परिणाम / स्टेटस टेक्स्ट</label>
            <input
              type="text"
              value={form.resultText}
              onChange={(e) => setForm({ ...form, resultText: e.target.value })}
              placeholder="उदा. भारत ने 34 रनों से मैच जीता"
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">मैच रिपोर्ट मुख्य शीर्षक</label>
          <input
            type="text"
            value={form.newsHeadline}
            onChange={(e) => setForm({ ...form, newsHeadline: e.target.value })}
            placeholder="समाचार हेडलाइन लिखें..."
            className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">मैच रिपोर्ट संक्षिप्त विवरण</label>
          <textarea
            rows={2}
            value={form.newsSummary}
            onChange={(e) => setForm({ ...form, newsSummary: e.target.value })}
            className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
          />
        </div>

        <button type="submit" className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer">
          सुरक्षित करें व पब्लिश करें
        </button>
      </form>

      {/* Published Matches Management Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-3 p-5">
        <h3 className="font-extrabold text-stone-900 text-base border-b border-stone-100 pb-2">
          📋 हाल ही के क्रिकेट मैच एवं रिपोर्ट्स ({matches.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 font-extrabold text-stone-700 border-b border-stone-200">
              <tr>
                <th className="p-3">मैच शीर्षक</th>
                <th className="p-3">टूर्नामेंट</th>
                <th className="p-3">स्कोर</th>
                <th className="p-3">स्थिति</th>
                <th className="p-3 text-right">कार्रवाई (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {matches.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900 max-w-xs truncate">{m.matchTitle}</td>
                  <td className="p-3 text-stone-600">{m.tournament}</td>
                  <td className="p-3 font-mono font-bold text-amber-800">{m.scoreA || 'N/A'} vs {m.scoreB || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${m.matchStatus === 'LIVE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {m.matchStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(m.id)}
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
