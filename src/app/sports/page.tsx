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
import { Trophy, Activity, Award } from 'lucide-react';

export const metadata = {
  title: 'खेल समाचार (Sports News) | क्रिकेट, बैडमिंटन, फुटबॉल व एथलेटिक्स | दैनिक मान्यवर',
  description: 'राष्ट्रीय व अंतरराष्ट्रीय खेल जगत की ताज़ा खबरें, मैच अपडेट्स व खिलाड़ियों के इंटरव्यू दैनिक मान्यवर पर।',
};

import { ensureDailyDataSynced } from '@/lib/autoUpdateService';

export default async function SportsPage() {
  await ensureDailyDataSynced();
  const cricketMatches = await db.cricketMatch.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-200" />
              <span>खेल जगत (Sports Hub)</span>
            </h1>
            <p className="text-xs text-orange-100 font-bold mt-1">
              क्रिकेट, फुटबॉल, बैडमिंटन, हॉकी, एथलेटिक्स एवं स्थानीय खेल प्रतियोगिताएं
            </p>
          </div>
        </div>

        {/* Sports Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-lg font-black text-stone-900 border-b-2 border-[#EA580C] pb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#F97316]" />
              <span>ताजा खेल खबरें</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {cricketMatches.map((m) => (
                <article key={m.id} className="border border-stone-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="relative w-full h-40 bg-stone-100">
                      <Image
                        src={m.featuredImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'}
                        alt={m.matchTitle}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#EA580C] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                        {m.tournament || 'खेल'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-base font-extrabold text-stone-900 leading-snug hover:text-[#F97316]">
                        {m.newsHeadline || m.matchTitle}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {m.newsSummary}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500">
                    <span className="font-mono">{m.venue || 'खेल मैदान'}</span>
                    <AudioPlayer articleId={m.id} title={m.newsHeadline || m.matchTitle} content={m.newsSummary || m.matchTitle} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <AdBanner position="sidebar_box" sizeText="300 × 250 / Sports Sidebar Ad" />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
