import React from 'react';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import AdBanner from '@/components/public/AdBanner';
import { db } from '@/lib/db';
import { Coins, ArrowUpRight, ArrowDownRight, MapPin, Building2 } from 'lucide-react';

export const metadata = {
  title: 'आज का सोना-चांदी भाव (Gold & Silver Rates) | शहर अनुसार दरें | दैनिक मान्यवर',
  description: 'वाराणसी, जौनपुर, लखनऊ, दिल्ली व पटना में 24K व 22K सोना तथा चांदी का ताज़ा भाव दैनिक मान्यवर पर।',
};

export default async function GoldSilverPage() {
  const prices = await db.commodityPrice.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Coins className="w-8 h-8 text-yellow-100" />
              <span>आज का सोना-चांदी भाव (Gold & Silver Commodity Rates)</span>
            </h1>
            <p className="text-xs text-amber-100 font-bold mt-1">
              सराफा बाजार शहर अनुसार 24 कैरेट सोना, 22 कैरेट सोना तथा प्रति किलो चांदी दरें
            </p>
          </div>
          <span className="bg-white/20 text-white text-xs font-mono font-bold px-3 py-1 rounded-full">
            लाइव अपडेट्स
          </span>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex justify-between items-center shadow-xs">
            <div>
              <span className="text-xs font-black text-amber-900 uppercase">✨ 24K शुद्ध सोना (प्रति 10 ग्राम)</span>
              <p className="text-3xl font-mono font-black text-amber-950 mt-1">₹74,800</p>
              <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+₹200 तेजी (आज की दर)</span>
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
              🪙
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex justify-between items-center shadow-xs">
            <div>
              <span className="text-xs font-black text-slate-700 uppercase">🥈 शुद्ध चांदी (प्रति किलोग्राम)</span>
              <p className="text-3xl font-mono font-black text-slate-900 mt-1">₹88,900</p>
              <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded mt-2">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>-₹150 गिरावट (आज की दर)</span>
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-700 text-white flex items-center justify-center text-2xl font-black shadow-md">
              💎
            </div>
          </div>
        </div>

        {/* City-wise Rates Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-3 p-5">
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <span>प्रमुख शहरों में आज का सराफा भाव (City Wise Rates)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-amber-100/70 text-amber-950 font-black border-b border-amber-200 text-xs">
                <tr>
                  <th className="p-3">शहर (City)</th>
                  <th className="p-3">24K सोना (10 ग्राम)</th>
                  <th className="p-3">22K सोना (10 ग्राम)</th>
                  <th className="p-3">चांदी (1 किलोग्राम)</th>
                  <th className="p-3">बदलाव (Change)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {prices.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40">
                    <td className="p-3 font-bold text-stone-900 text-sm font-sans flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{p.city}</span>
                    </td>
                    <td className="p-3 font-bold text-amber-900">₹{p.gold24K.toLocaleString('hi-IN')}</td>
                    <td className="p-3 font-bold text-stone-800">₹{p.gold22K.toLocaleString('hi-IN')}</td>
                    <td className="p-3 font-bold text-slate-800">₹{p.silver.toLocaleString('hi-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${p.goldChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.goldChange >= 0 ? `+₹${p.goldChange}` : `-₹${Math.abs(p.goldChange)}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leaderboard Ad */}
        <AdBanner position="header_wide" sizeText="970 × 90 / Gold-Silver Page Banner" />
      </main>

      <Footer />
    </div>
  );
}
