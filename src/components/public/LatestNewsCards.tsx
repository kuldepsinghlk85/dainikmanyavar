'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatHindiTimeAgo, formatCount } from '@/lib/utils';

interface Tag {
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  publishedAt: Date | string;
  viewCount: number;
  tags?: any[];
}

interface LatestNewsCardsProps {
  articles?: Article[];
}

export default function LatestNewsCards({ articles }: LatestNewsCardsProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center border-b-2 border-[#F97316] pb-2 mb-4">
        <h3 className="text-xl font-bold text-[#171717]">🕒 ताजा खबरें</h3>
        <Link href="/category/latest" target="_blank" className="text-xs text-[#EA580C] font-semibold hover:underline">
          और देखें →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {articles.map((art) => {
          const rawTags = (art.tags && art.tags.length > 0) ? art.tags.slice(0, 3) : [];

          return (
            <article
              key={art.id}
              className="border border-[#E8E8E8] rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Image with Tag Chips overlaid */}
                <div className="relative w-full h-[130px] bg-stone-100">
                  <Image
                    src={art.featuredImage || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=700&q=80'}
                    alt={art.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {/* Overlay Tag Chips */}
                  {rawTags.length > 0 && (
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%] z-10">
                      {rawTags.map((t: any) => {
                        const tagObj = t.tag || t;
                        const tagName = typeof tagObj === 'string' ? tagObj : tagObj?.name || 'खबर';
                        const tagSlug = tagObj?.slug || 'news';
                        return (
                          <Link
                            key={tagSlug}
                            href={`/tag/${tagSlug}`}
                            className="text-[10px] font-bold bg-white/95 text-[#C2410C] px-2 py-0.5 rounded-full border border-orange-200 shadow-sm hover:bg-orange-100"
                          >
                            {tagName.startsWith('#') ? tagName : `#${tagName}`}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-3">
                  <Link href={`/news/${art.slug}`}>
                    <h4 className="text-sm font-bold text-stone-900 leading-snug line-clamp-2 hover:text-[#F97316] transition-colors mb-2">
                      {art.title}
                    </h4>
                  </Link>
                </div>
              </div>

              <div className="px-3 pb-3 pt-0 text-[11px] text-stone-500 flex justify-between items-center border-t border-stone-50">
                <span>{formatHindiTimeAgo(art.publishedAt)}</span>
                <span>👁 {formatCount(art.viewCount)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
