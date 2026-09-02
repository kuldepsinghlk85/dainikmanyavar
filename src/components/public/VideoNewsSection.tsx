'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Film } from 'lucide-react';

interface VideoNewsSectionProps {
  videos?: Array<{
    id: string;
    title: string;
    slug: string;
    videoThumbnail?: string | null;
    featuredImage?: string | null;
    videoDuration?: string | null;
    viewCount: number;
    publishedAt: Date | string;
  }>;
}

export default function VideoNewsSection({ videos }: VideoNewsSectionProps) {
  const defaultVideos = [
    {
      id: 'v1',
      title: 'दिन की सबसे बड़ी खबरें — वीडियो बुलेटिन | जौनपुर व पूर्वांचल हलचल',
      slug: 'jaunpur-daily-video-bulletin-2026',
      videoThumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80',
      videoDuration: '3:12',
      viewCount: 2300,
      publishedAt: new Date(),
    },
    {
      id: 'v2',
      title: 'यूपी विधानसभा सत्र: मुख्य मुद्दों पर सरकार का पक्ष और चर्चा',
      slug: 'up-vidhan-sabha-session-video-2026',
      videoThumbnail: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80',
      videoDuration: '4:45',
      viewCount: 1800,
      publishedAt: new Date(),
    },
    {
      id: 'v3',
      title: 'जौनपुर स्मार्ट सिटी प्रोजेक्ट: नए पुल और चौड़ीकरण कार्य की ग्राउंड रिपोर्ट',
      slug: 'jaunpur-smart-city-video-report-2026',
      videoThumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80',
      videoDuration: '5:20',
      viewCount: 3100,
      publishedAt: new Date(),
    },
    {
      id: 'v4',
      title: 'पूर्वांचल किसान मेला: नई तकनीकों और सरकारी योजनाओं का सजीव प्रदर्शन',
      slug: 'purvanchal-kisan-mela-video-bulletin-2026',
      videoThumbnail: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80',
      videoDuration: '2:40',
      viewCount: 1500,
      publishedAt: new Date(),
    },
  ];

  const items = videos && videos.length > 0 ? videos : defaultVideos;
  const main2Videos = items.slice(0, 2);
  const playlistItems = items.slice(2, 6).length > 0 ? items.slice(2, 6) : defaultVideos.slice(2, 4);

  return (
    <div className="border border-[#E8E8E8] rounded-xl p-4 bg-white shadow-soft flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center border-b-2 border-[#F97316] pb-1.5 mb-3">
          <h3 className="text-lg font-bold text-[#171717] flex items-center gap-2">
            <span>▶ वीडियो न्यूज़ बुलेटिन</span>
          </h3>
          <Link href={`/video/${main2Videos[0]?.slug}`} target="_blank" className="text-xs text-[#EA580C] font-semibold hover:underline">
            और देखें →
          </Link>
        </div>

        {/* Top 2 Video Bulletins */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {main2Videos.map((item) => (
            <Link key={item.id} href={`/video/${item.slug}`} target="_blank" className="flex flex-col justify-between group">
              <div className="relative w-full h-[135px] rounded-lg overflow-hidden bg-black">
                <Image
                  src={item.videoThumbnail || item.featuredImage || 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80'}
                  alt={item.title}
                  fill
                  className="object-cover opacity-85 group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-10 h-10 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                  {item.videoDuration || '3:00'}
                </div>
              </div>

              <h4 className="text-xs font-bold text-stone-900 mt-2 leading-snug line-clamp-2 group-hover:text-[#F97316]">
                {item.title}
              </h4>
            </Link>
          ))}
        </div>

        {/* Video News Playlist Section (पुरानी न्यूज़ प्लेलिस्ट) */}
        <div className="bg-stone-900 text-white p-3 rounded-lg border border-stone-800 space-y-2">
          <h4 className="text-xs font-bold text-[#F97316] flex items-center gap-1.5 border-b border-stone-800 pb-1">
            <Film className="w-3.5 h-3.5" />
            <span>🎥 पुरानी वीडियो न्यूज़ प्लेलिस्ट (Playlist)</span>
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {playlistItems.map((playItem) => (
              <Link
                key={playItem.id}
                href={`/video/${playItem.slug}`}
                target="_blank"
                className="flex items-center gap-2.5 p-1.5 rounded hover:bg-stone-800 transition-colors group"
              >
                <div className="relative w-16 h-11 rounded overflow-hidden bg-black flex-shrink-0">
                  <Image
                    src={playItem.videoThumbnail || playItem.featuredImage || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80'}
                    alt={playItem.title}
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-[11px] font-bold text-stone-200 line-clamp-1 group-hover:text-[#F97316]">
                    {playItem.title}
                  </h5>
                  <span className="text-[9px] text-stone-400 font-mono">{playItem.videoDuration || '3:00'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
