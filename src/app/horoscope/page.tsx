import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import AdBanner from '@/components/public/AdBanner';
import AudioPlayer from '@/components/public/AudioPlayer';
import { db } from '@/lib/db';
import { Sparkles, Heart, Briefcase, Activity, Landmark, Key, Palette } from 'lucide-react';

export const metadata = {
  title: 'आज का राशिफल (Daily Horoscope) | 12 राशियाँ | दैनिक मान्यवर',
  description: 'मेष से लेकर मीन तक सभी 12 राशियों का आज का दैनिक राशिफल, लव लाइफ, करियर, स्वास्थ्य व वित्त फलादेश।',
};

import { ensureDailyDataSynced } from '@/lib/autoUpdateService';

export default async function HoroscopePage() {
  await ensureDailyDataSynced();
  const horoscopes = await db.horoscope.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-8">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white p-6 rounded-2xl shadow-md flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-200" />
              <span>आज का दैनिक राशिफल (Daily Horoscope & Astrology)</span>
            </h1>
            <p className="text-xs text-amber-100 font-bold mt-1">
              सभी 12 राशियों का सटीक दैनिक ज्योतिष फलादेश, करियर, प्रेम, स्वास्थ्य एवं उपाय
            </p>
          </div>
          <span className="bg-white/20 text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border border-white/30">
            📅 {new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* 12 Zodiac Sign Grid Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-stone-900 border-b-2 border-[#EA580C] pb-2 flex items-center gap-2">
            <span>🔮 अपनी राशि चुनें एवं आज का भविष्यफल जानें</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {horoscopes.map((h) => {
              const tags = h.tagsJson ? JSON.parse(h.tagsJson) : ['#राशिफल', `#${h.zodiacHindi}`];

              return (
                <div key={h.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
                          {h.zodiacSign}
                        </span>
                        <h3 className="text-lg font-extrabold text-stone-900 mt-0.5">{h.zodiacHindi}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black text-lg flex items-center justify-center shadow-sm">
                        ✨
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 font-medium leading-relaxed mt-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                      {h.prediction}
                    </p>

                    {/* Detailed Categories */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
                      {h.love && (
                        <div className="p-2 bg-pink-50 text-pink-900 rounded-lg border border-pink-100 flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
                          <span className="truncate">{h.love}</span>
                        </div>
                      )}
                      {h.career && (
                        <div className="p-2 bg-blue-50 text-blue-900 rounded-lg border border-blue-100 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="truncate">{h.career}</span>
                        </div>
                      )}
                      {h.health && (
                        <div className="p-2 bg-green-50 text-green-900 rounded-lg border border-green-100 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                          <span className="truncate">{h.health}</span>
                        </div>
                      )}
                      {h.finance && (
                        <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{h.finance}</span>
                        </div>
                      )}
                    </div>

                    {/* Lucky Numbers & Colors */}
                    <div className="flex items-center justify-between text-xs font-bold text-stone-600 mt-3 pt-3 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>शुभ अंक: {h.luckyNumber || '7'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-orange-600" />
                        <span>शुभ रंग: {h.luckyColor || 'पीला'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Audio Player Footer */}
                  <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                    <div className="flex gap-1">
                      {tags.slice(0, 2).map((t: string) => (
                        <span key={t} className="text-[9px] font-bold text-[#EA580C]">
                          {t}
                        </span>
                      ))}
                    </div>
                    <AudioPlayer articleId={h.id} title={h.title} content={h.prediction} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Header Ad Slot */}
        <AdBanner position="header_wide" sizeText="970 × 90 / Astrology Page Leaderboard" />
      </main>

      <Footer />
    </div>
  );
}
