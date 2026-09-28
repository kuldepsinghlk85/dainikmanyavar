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
import { TrendingUp, ArrowUpRight, ArrowDownRight, LineChart, Clock } from 'lucide-react';
import { liveDataService } from '@/lib/live-data/service';
import LiveDataStatusBadge from '@/components/public/LiveDataStatus';

export const revalidate = 60;

export const metadata = {
  title: 'शेयर बाजार समाचार (Stock Market Updates) | Sensex & Nifty | दैनिक मान्यवर',
  description: 'सेंसेक्स, निफ्टी, शेयर भाव, बाजार रुझान व अर्थजगत की ताज़ा खबरें दैनिक मान्यवर पर।',
};

export default async function StockMarketPage() {
  const marketData = await liveDataService.getMarketIndices(false);

  const updates = await db.stockMarketUpdate.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 30,
  });

  const indices = marketData
    ? [
        {
          symbol: marketData.indices.sensex.symbol,
          name: marketData.indices.sensex.name,
          exchange: 'BSE',
          current: marketData.indices.sensex.value,
          change: marketData.indices.sensex.change,
          changePercent: marketData.indices.sensex.changePercent,
          isPositive: marketData.indices.sensex.isUp,
        },
        {
          symbol: marketData.indices.nifty50.symbol,
          name: marketData.indices.nifty50.name,
          exchange: 'NSE',
          current: marketData.indices.nifty50.value,
          change: marketData.indices.nifty50.change,
          changePercent: marketData.indices.nifty50.changePercent,
          isPositive: marketData.indices.nifty50.isUp,
        },
        ...(marketData.indices.bankNifty
          ? [
              {
                symbol: marketData.indices.bankNifty.symbol,
                name: marketData.indices.bankNifty.name,
                exchange: 'NSE',
                current: marketData.indices.bankNifty.value,
                change: marketData.indices.bankNifty.change,
                changePercent: marketData.indices.bankNifty.changePercent,
                isPositive: marketData.indices.bankNifty.isUp,
              },
            ]
          : []),
      ]
    : [
        { symbol: 'SENSEX', name: 'BSE SENSEX', exchange: 'BSE', current: 79840.25, change: 245.1, changePercent: 0.31, isPositive: true },
        { symbol: 'NIFTY50', name: 'NIFTY 50', exchange: 'NSE', current: 24280.6, change: 65.4, changePercent: 0.27, isPositive: true },
        { symbol: 'BANKNIFTY', name: 'BANK NIFTY', exchange: 'NSE', current: 51240.15, change: -110.3, changePercent: -0.21, isPositive: false },
      ];

  const session = marketData?.marketSession;
  const status = marketData?.meta?.freshnessStatus || 'FRESH';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <LineChart className="w-8 h-8 text-emerald-400" />
              <span>शेयर बाजार व अर्थजगत (Stock Market Hub)</span>
            </h1>
            <p className="text-xs text-slate-300 font-bold mt-1">
              सेंसेक्स, निफ्टी 50, बैंक निफ्टी, आईपीओ एवं बाजार विश्लेषण (NSE / BSE)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LiveDataStatusBadge status={status} marketState={session?.state} />
            <span className="text-[11px] font-mono text-stone-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              {session?.labelHindi || 'कारोबारी समय: 9:15 AM - 3:30 PM'}
            </span>
          </div>
        </div>

        {/* Live Indices Ticker Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {indices.map((idx) => {
            const isPositive = idx.isPositive;
            return (
              <div
                key={idx.symbol}
                className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-md text-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400">{idx.name}</span>
                    <span className="text-[10px] text-stone-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                      {idx.exchange}
                    </span>
                  </div>
                  <p className="text-2xl font-mono font-black text-white mt-1">
                    {idx.current.toLocaleString('hi-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isPositive
                        ? 'text-emerald-300 bg-emerald-950/70 border border-emerald-800'
                        : 'text-rose-300 bg-rose-950/70 border border-rose-800'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>
                      {isPositive ? '+' : ''}
                      {idx.change.toFixed(2)} ({isPositive ? '+' : ''}
                      {idx.changePercent.toFixed(2)}%)
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
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
                🟢 आज के टॉप मूवर्स (Market Movers)
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">Reliance Ind.</span>
                  <span className="text-emerald-700 font-bold">+2.84%</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">Tata Motors</span>
                  <span className="text-emerald-700 font-bold">+2.15%</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">Infosys Ltd.</span>
                  <span className="text-emerald-700 font-bold">+1.92%</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">HDFC Bank</span>
                  <span className="text-rose-700 font-bold">-0.85%</span>
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
