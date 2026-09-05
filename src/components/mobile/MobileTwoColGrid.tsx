'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  videoDuration?: string | null;
  videoEnabled?: boolean;
}

interface MobileTwoColGridProps {
  topStories: ArticleItem[];
  worldStories: ArticleItem[];
}

export default function MobileTwoColGrid({
  topStories = [],
  worldStories = [],
}: MobileTwoColGridProps) {
  if (topStories.length === 0 && worldStories.length === 0) return null;

  const leftLead = topStories[0];
  const leftSub = topStories[1];
  const rightLead = worldStories[0];
  const rightSub = worldStories[1];

  const fallback = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80';

  return (
    <section className="bg-white dark:bg-[#141414] px-3.5 py-3 my-2 border-y border-stone-200 dark:border-stone-800 transition-colors">
      <div className="grid grid-cols-2 gap-3">
        {/* Left Column: बड़ी खबरें */}
        <div>
          <div className="border-b border-stone-200 dark:border-stone-800 pb-1 mb-2.5">
            <span className="text-[#E53935] font-black text-xs sm:text-sm uppercase tracking-wider border-b-2 border-[#E53935] pb-1 inline-block">
              बड़ी खबरें
            </span>
          </div>

          {leftLead && (
            <Link href={`/mobile/news/${leftLead.slug}`} className="block group mb-2.5">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-800 mb-1.5 shadow-2xs">
                <Image
                  src={leftLead.featuredImage || fallback}
                  alt={leftLead.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md">
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <h4 className="text-[12px] font-extrabold leading-snug text-stone-900 dark:text-stone-100 line-clamp-3 group-hover:text-[#E53935] transition-colors">
                {leftLead.title}
              </h4>
            </Link>
          )}

          {leftSub && (
            <Link href={`/mobile/news/${leftSub.slug}`} className="block group pt-2 border-t border-stone-100 dark:border-stone-800/80">
              <div className="relative aspect-[16/9] rounded-md overflow-hidden bg-stone-900 mb-1">
                <Image
                  src={leftSub.featuredImage || fallback}
                  alt={leftSub.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <p className="text-[11px] font-bold leading-tight text-stone-800 dark:text-stone-300 line-clamp-2 group-hover:text-[#E53935] transition-colors">
                {leftSub.title}
              </p>
            </Link>
          )}
        </div>

        {/* Right Column: देश-दुनिया */}
        <div>
          <div className="border-b border-stone-200 dark:border-stone-800 pb-1 mb-2.5">
            <span className="text-[#E53935] font-black text-xs sm:text-sm uppercase tracking-wider border-b-2 border-[#E53935] pb-1 inline-block">
              देश-दुनिया
            </span>
          </div>

          {rightLead && (
            <Link href={`/mobile/news/${rightLead.slug}`} className="block group mb-2.5">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-800 mb-1.5 shadow-2xs">
                <Image
                  src={rightLead.featuredImage || fallback}
                  alt={rightLead.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <h4 className="text-[12px] font-extrabold leading-snug text-stone-900 dark:text-stone-100 line-clamp-3 group-hover:text-[#E53935] transition-colors">
                {rightLead.title}
              </h4>
            </Link>
          )}

          {rightSub && (
            <Link href={`/mobile/news/${rightSub.slug}`} className="block group pt-2 border-t border-stone-100 dark:border-stone-800/80">
              <div className="relative aspect-[16/9] rounded-md overflow-hidden bg-stone-900 mb-1">
                <Image
                  src={rightSub.featuredImage || fallback}
                  alt={rightSub.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <p className="text-[11px] font-bold leading-tight text-stone-800 dark:text-stone-300 line-clamp-2 group-hover:text-[#E53935] transition-colors">
                {rightSub.title}
              </p>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
