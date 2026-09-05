'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Video } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  duration?: string;
  category?: string;
}

export default function MobileVideoFeed({ videos = [] }: { videos: VideoItem[] }) {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="bg-stone-900 text-white py-3.5 my-2 border-y border-stone-800">
      <div className="flex items-center justify-between px-3.5 mb-2.5">
        <h3 className="text-xs font-black tracking-wide flex items-center gap-1.5 uppercase text-amber-400">
          <Video className="w-4 h-4 text-red-500" />
          <span>वीडियो बुलेटिन</span>
        </h3>
        <Link href="/video" className="text-[11px] font-bold text-stone-400 hover:text-white">
          सभी वीडियो &rarr;
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto px-3.5 no-scrollbar scroll-smooth">
        {videos.map((v) => (
          <Link
            key={v.id}
            href={`/mobile/news/${v.slug}`}
            className="w-44 shrink-0 group space-y-1.5 block"
          >
            <div className="relative w-44 h-28 bg-stone-800 rounded-xl overflow-hidden border border-stone-700">
              <Image
                src={v.thumbnail || 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=400&q=80'}
                alt={v.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>
              {v.duration && (
                <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
              )}
            </div>
            <h4 className="text-[11px] font-bold text-stone-200 line-clamp-2 leading-tight group-hover:text-amber-400">
              {v.title}
            </h4>
          </Link>
        ))}
      </div>
    </section>
  );
}
