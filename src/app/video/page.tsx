import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiTimeAgo, formatCount } from '@/lib/utils';
import { Play, Film, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'वीडियो न्यूज़ बुलेटिन | दैनिक मान्यवर',
  description: 'दैनिक मान्यवर वीडियो बुलेटिन - उत्तर प्रदेश, जौनपुर व देश-दुनिया की बड़ी वीडियो ख़बरें।',
};

export default async function VideoListPage() {
  // Fetch video-enabled articles or latest published articles with video coverage
  const videoArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      videoEnabled: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 30,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  const fallbackArticles = videoArticles.length < 4 ? await db.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 12,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  }) : [];

  const allVideos = videoArticles.length > 0 ? videoArticles : fallbackArticles;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-6">
        {/* Video Hub Header */}
        <div className="bg-stone-900 text-white border border-stone-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  वीडियो न्यूज़ बुलेटिन
                </h1>
                <span className="text-xs font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  LIVE & VOD
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                दैनिक मान्यवर वीडियो नेटवर्क | जौनपुर, पूर्वांचल व देश-दुनिया की प्रमुख वीडियो कवरेज
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-stone-800 text-stone-300 px-3 py-1.5 rounded-full border border-stone-700 font-mono">
              कुल {allVideos.length} वीडियो
            </span>
            <Link
              href="/"
              className="text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1 bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-full border border-stone-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              मुख्य पृष्ठ
            </Link>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allVideos.map((art) => (
            <Link
              key={art.id}
              href={`/video/${art.slug}`}
              className="border border-stone-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative w-full h-[210px] bg-black overflow-hidden">
                  <Image
                    src={art.videoThumbnail || art.featuredImage || 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80'}
                    alt={art.title}
                    fill
                    unoptimized
                    className="object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                    {art.category && (
                      <span className="text-[10px] font-black bg-[#EA580C] text-white px-2.5 py-0.5 rounded shadow-sm">
                        {art.category.name}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {art.videoDuration || '03:45'}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-extrabold text-stone-900 leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors">
                    {art.title}
                  </h3>
                  {art.excerpt && (
                    <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-4 pb-3 text-xs text-stone-400 flex justify-between border-t border-stone-100 pt-2 font-mono">
                <span>{formatHindiTimeAgo(art.publishedAt)}</span>
                <span>👁 {formatCount(art.viewCount)}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
