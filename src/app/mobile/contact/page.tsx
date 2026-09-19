'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import MobileFooter from '@/components/mobile/MobileFooter';
import { ArrowLeft, Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import VoiceInputButton from '@/components/public/VoiceInputButton';

export default function MobileContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', category: 'NEWS_TIP', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      setError('कृपया नाम, मोबाइल नंबर और संदेश भरें।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'संदेश भेजने में विफल।');
      }
    } catch (_) {
      setError('नेटवर्क त्रुटि, कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-100 dark:bg-[#0D0D0D] min-h-screen flex flex-col pb-16 transition-colors">
      <MobileHeader />

      {/* Sub-header Navigation */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414]">
        <Link
          href="/mobile"
          className="flex items-center gap-1.5 text-xs font-black text-stone-700 dark:text-stone-300 hover:text-[#EA580C]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ</span>
        </Link>
        <span className="text-xs font-bold text-[#EA580C]">संपर्क करें</span>
      </div>

      <main className="p-4 space-y-4 flex-1 max-w-lg mx-auto w-full">
        {/* Office Contact Cards */}
        <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
          <h1 className="text-base font-black text-stone-900 dark:text-white">
            दैनिक मान्यवर - संपर्क कार्यालय
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            निष्पक्ष, निर्भीक एवं जन-सरोकारों को समर्पित हिंदी दैनिक समाचार पत्र।
          </p>

          <div className="space-y-2 pt-2 text-xs font-medium text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#EA580C] shrink-0" />
              <span>संपादकीय कार्यालय: जौनपुर / लखनऊ, उत्तर प्रदेश</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#EA580C] shrink-0" />
              <span>ईमेल: info@dainikmanyavar.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#EA580C] shrink-0" />
              <span>वेबसाइट: www.dainikmanyavar.com</span>
            </div>
          </div>
        </div>

        {/* Contact / News Tip Form */}
        <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
            <Send className="w-4 h-4 text-[#EA580C]" />
            <span>समाचार टिप या संदेश भेजें</span>
          </h2>

          {submitted ? (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
              <p className="text-sm font-bold">आपका संदेश सफलतापूर्वक भेज दिया गया है!</p>
              <p className="text-xs text-green-700">हमारी संपादकीय टीम शीघ्र ही आपसे संपर्क करेगी।</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    आपका नाम *
                  </label>
                  <VoiceInputButton
                    onTranscript={(txt) => setForm((prev) => ({ ...prev, name: txt }))}
                    currentValue={form.name}
                    placeholderHint="अपना नाम बोलिए..."
                    size="sm"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  placeholder="अपना पूरा नाम लिखें"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  मोबाइल नंबर *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  placeholder="10 अंकों का मोबाइल नंबर"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  विषय / श्रेणी
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-medium"
                >
                  <option value="NEWS_TIP">ताजा खबर / न्यूज टिप</option>
                  <option value="ADVERTISEMENT">विज्ञापन (Advertisement)</option>
                  <option value="EDITORIAL">संपादकीय शिकायत या सुझाव</option>
                  <option value="GENERAL">सामान्य संपर्क</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    संदेश *
                  </label>
                  <VoiceInputButton
                    mode="append"
                    currentValue={form.message}
                    onTranscript={(txt) => setForm((prev) => ({ ...prev, message: txt }))}
                    placeholderHint="संदेश बोलिए..."
                    size="sm"
                  />
                </div>
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  placeholder="अपना संदेश या समाचार विवरण लिखें..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#EA580C] hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? 'भेजा जा रहा है...' : 'संदेश भेजें'}
              </button>
            </form>
          )}
        </div>
      </main>

      <MobileFooter />
      <MobileBottomNav />
    </div>
  );
}
