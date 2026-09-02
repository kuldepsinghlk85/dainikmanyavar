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
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, LineChart } from 'lucide-react';

export const metadata = {
  title: 'शेयर बाजार समाचार (Stock Market Updates) | Sensex & Nifty | दैनिक मान्यवर',
  description: 'सेंसेक्स, निफ्टी, शेयर भाव, बाजार रुझान व अर्थजगत की ताज़ा खबरें दैनिक मान्यवर पर।',
};

export default async function StockMarketPage() {
  const updates = await db.stockMarketUpdate.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <LineChart className="w-8 h-8 text-emerald-400" />
              <span>शेयर बाजार व अर्थजगत (Stock Market Hub)</span>
            </h1>
            <p className="text-xs text-slate-300 font-bold mt-1">
              सेंसेक्स, निफ्टी 50, शेयर भाव, आईपीओ, कमोडिटी एवं बाजार विश्लेषण
            </p>
          </div>
        </div>

        {/* Live Indices Ticker Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-xs font-black text-stone-700">SENSEX</span>
              <p className="text-xl font-mono font-black text-stone-900 mt-0.5">85,240.50</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+480.20 (+0.57%)</span>
              </span>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-xs font-black text-stone-700">NIFTY 50</span>
              <p className="text-xl font-mono font-black text-stone-900 mt-0.5">26,015.80</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+145.60 (+0.56%)</span>
              </span>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-xs font-black text-stone-700">BANK NIFTY</span>
              <p className="text-xl font-mono font-black text-stone-900 mt-0.5">54,120.30</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+210.40 (+0.39%)</span>
              </span>
            </div>
          </div>

          <div className="bg-red-950/10 border border-red-200 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-xs font-black text-stone-700">USD / INR</span>
              <p className="text-xl font-mono font-black text-stone-900 mt-0.5">₹83.92</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>-0.08 (-0.09%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-lg font-black text-stone-900 border-b-2 border-[#EA580C] pb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>शेयर बाजार की प्रमुख खबरें व विश्लेषण</span>
            </h2>

            <div className="space-y-5">
              {updates.map((u) => {
                const tags = u.tagsJson ? JSON.parse(u.tagsJson) : ['#शेयर_बाजार', '#Sensex', '#Nifty'];

                return (
                  <article key={u.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
                    <div className="relative w-full h-44 sm:h-auto rounded-xl overflow-hidden bg-stone-100">
                      <Image
                        src={u.featuredImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'}
                        alt={u.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {tags.map((t: string) => (
                            <span key={t} className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                              {t}
                            </span>
                          ))}
                        </div>

                        <h3 className="text-base font-extrabold text-stone-900 leading-snug hover:text-[#F97316]">
                          {u.title}
                        </h3>

                        <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
                          {u.content}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                        <span className="font-mono">{new Date(u.publishedAt).toLocaleDateString('hi-IN')}</span>
                        <AudioPlayer articleId={u.id} title={u.title} content={u.content} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <AdBanner position="sidebar_box" sizeText="300 × 250 / Market Sidebar Ad" />

            {/* Top Gainers / Losers Widget */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
              <h3 className="font-extrabold text-stone-900 text-sm border-b border-stone-200 pb-2">
                🟢 आज के टॉप गेनर्स (Top Gainers)
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">Reliance Ind.</span>
                  <span className="text-emerald-700 font-bold">+2.84%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">Tata Motors</span>
                  <span className="text-emerald-700 font-bold">+2.15%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">Infosys Ltd.</span>
                  <span className="text-emerald-700 font-bold">+1.92%</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
