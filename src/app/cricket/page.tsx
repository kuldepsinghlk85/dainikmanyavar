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
import { Trophy, Calendar, MapPin, Play, Radio } from 'lucide-react';

export const metadata = {
  title: 'क्रिकेट समाचार व लाइव स्कोरकार्ड | दैनिक मान्यवर',
  description: 'भारत व अंतरराष्ट्रीय क्रिकेट मैच स्कोर, शेड्यूल, नतीजे व क्रिकेट ताज़ा ख़बरें दैनिक मान्यवर पर।',
};

export default async function CricketPage() {
  const matches = await db.cricketMatch.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });

  const liveMatches = matches.filter((m) => m.matchStatus === 'LIVE');
  const otherMatches = matches.filter((m) => m.matchStatus !== 'LIVE');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-200" />
              <span>क्रिकेट हब (Cricket Hub & Live Scores)</span>
            </h1>
            <p className="text-xs text-orange-100 font-bold mt-1">
              लाइव मैच स्कोरकार्ड, परिणाम, आगामी मुकाबले एवं विशेष मैच रिपोर्ट
            </p>
          </div>
          <span className="bg-white/20 text-white text-xs font-mono font-bold px-3 py-1 rounded-full">
            {matches.length} रिकॉर्ड्स
          </span>
        </div>

        {/* LIVE Matches Ticker Card */}
        {liveMatches.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-600 animate-pulse" />
              <span>लाइव मैच अपडेट्स (Live Scores)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((m) => (
                <div key={m.id} className="bg-stone-900 text-white p-5 rounded-2xl border border-red-600/40 shadow-lg space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded animate-pulse">LIVE</span>
                    <span className="text-stone-400 font-bold">{m.tournament}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="space-y-1">
                      <p className="font-extrabold text-base text-amber-400">{m.teamA}</p>
                      <p className="text-sm font-mono text-stone-200">{m.scoreA || 'बल्लेबाजी जारी'}</p>
                    </div>

                    <div className="text-stone-500 font-black text-sm">VS</div>

                    <div className="space-y-1 text-right">
                      <p className="font-extrabold text-base text-amber-400">{m.teamB}</p>
                      <p className="text-sm font-mono text-stone-200">{m.scoreB || 'अभी शुरुआत'}</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-stone-950 rounded-xl text-xs text-orange-300 font-bold text-center border border-stone-800">
                    {m.resultText || 'मैच रोमांचक मोड़ पर'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cricket Stories & Match Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-lg font-black text-stone-900 border-b-2 border-[#EA580C] pb-2">
              🏏 ताज़ा क्रिकेट समाचार व मैच रिपोर्ट
            </h2>

            <div className="space-y-5">
              {matches.map((m) => {
                const tags = m.tagsJson ? JSON.parse(m.tagsJson) : ['#क्रिकेट', '#भारत'];

                return (
                  <article key={m.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
                    <div className="relative w-full h-44 sm:h-auto rounded-xl overflow-hidden bg-stone-100">
                      <Image
                        src={m.featuredImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'}
                        alt={m.matchTitle}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {tags.map((t: string) => (
                            <span key={t} className="text-[10px] font-bold bg-orange-50 text-[#C2410C] px-2 py-0.5 rounded-full border border-orange-200">
                              {t}
                            </span>
                          ))}
                        </div>

                        <h3 className="text-base font-extrabold text-stone-900 leading-snug hover:text-[#F97316]">
                          {m.newsHeadline || m.matchTitle}
                        </h3>

                        <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
                          {m.newsSummary || `${m.teamA} बनाम ${m.teamB} मुकाबला (${m.tournament})`}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                        <span className="font-mono">📍 {m.venue || 'अंतरराष्ट्रीय मैदान'}</span>
                        <AudioPlayer articleId={m.id} title={m.newsHeadline || m.matchTitle} content={m.newsSummary || m.matchTitle} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <AdBanner position="sidebar_box" sizeText="300 × 250 / Cricket Sidebar Ad" />

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
              <h3 className="font-extrabold text-stone-900 text-sm border-b border-stone-200 pb-2">
                📊 मैच परिणाम व शेड्यूल
              </h3>
              <div className="space-y-3 text-xs">
                {otherMatches.map((m) => (
                  <div key={m.id} className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                    <p className="font-bold text-stone-800">{m.matchTitle}</p>
                    <p className="text-[11px] text-green-700 font-bold">{m.resultText || 'शेड्यूल तय'}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
