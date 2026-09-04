'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Film, ArrowRight } from 'lucide-react';

export interface VideoItem {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string | null;
  videoThumbnail?: string | null;
  featuredImage?: string | null;
  videoDuration?: string | null;
  duration?: string | null;
  views?: string | number;
  viewCount?: number;
  category?: string | { name: string } | null;
  date?: string;
  publishedAt?: Date | string;
}

interface VideoNewsSectionProps {
  videos?: VideoItem[];
  videoNewsList?: VideoItem[];
}

export default function VideoNewsSection({ videos, videoNewsList }: VideoNewsSectionProps) {
  const itemsList = (videos && videos.length > 0) ? videos : (videoNewsList && videoNewsList.length > 0) ? videoNewsList : [];

  const main2Videos = itemsList.slice(0, 2);
  const playlistItems = itemsList.slice(2, 6);

  if (itemsList.length === 0) {
    return null;
  }

  return (
    <div className="border border-stone-200 rounded-2xl p-4 sm:p-5 bg-white shadow-soft flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center border-b-2 border-[#F97316] pb-2.5 mb-4">
          <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span>वीडियो न्यूज़ बुलेटिन</span>
          </h3>
          <Link
            href="/video"
            className="text-xs text-[#EA580C] font-bold hover:underline flex items-center gap-1 group"
          >
            और देखें <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Top 2 Video Bulletins */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {main2Videos.map((item) => {
            const img = item.videoThumbnail || item.thumbnail || item.featuredImage || 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80';
            const dur = item.videoDuration || item.duration || '03:45';
            return (
              <Link
                key={item.id}
                href={`/video/${item.slug}`}
                className="flex flex-col justify-between group"
              >
                <div className="relative w-full h-[150px] sm:h-[160px] rounded-xl overflow-hidden bg-black shadow-sm">
                  <Image
                    src={img}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="w-12 h-12 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-115 group-hover:bg-red-600 transition-all">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    {dur}
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-stone-900 mt-2.5 leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors">
                  {item.title}
                </h4>
              </Link>
            );
          })}
        </div>

        {/* Video News Playlist Section (पुरानी न्यूज़ प्लेलिस्ट) */}
        {playlistItems.length > 0 && (
          <div className="bg-stone-950 text-white p-3.5 rounded-xl border border-stone-800 space-y-2.5">
            <h4 className="text-xs font-bold text-[#F97316] flex items-center gap-1.5 border-b border-stone-800/80 pb-1.5">
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>🎥 अन्य वीडियो न्यूज़ प्लेलिस्ट (Playlist)</span>
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {playlistItems.map((playItem) => {
                const img = playItem.videoThumbnail || playItem.thumbnail || playItem.featuredImage || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80';
                const dur = playItem.videoDuration || playItem.duration || '03:00';
                return (
                  <Link
                    key={playItem.id}
                    href={`/video/${playItem.slug}`}
                    className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-stone-800/80 transition-colors group"
                  >
                    <div className="relative w-20 h-13 rounded-lg overflow-hidden bg-black flex-shrink-0">
                      <Image
                        src={img}
                        alt={playItem.title}
                        fill
                        unoptimized
                        className="object-cover opacity-80 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-stone-200 line-clamp-1 group-hover:text-[#F97316] transition-colors">
                        {playItem.title}
                      </h5>
                      <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                        {dur}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
