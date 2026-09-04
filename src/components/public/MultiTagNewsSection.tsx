'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, ArrowRight } from 'lucide-react';
import { formatHindiTimeAgo, formatCount } from '@/lib/utils';

export interface MultiTagArticle {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  publishedAt?: Date | string;
  viewCount?: number;
  tags?: Array<{
    id?: string;
    name: string;
    slug: string;
  } | string>;
}

interface MultiTagNewsSectionProps {
  articles?: MultiTagArticle[];
}

export default function MultiTagNewsSection({ articles }: MultiTagNewsSectionProps) {
  // If articles passed, use them
  const items = articles && articles.length > 0 ? articles.slice(0, 3) : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="border border-stone-200 rounded-2xl p-4 sm:p-5 bg-white shadow-soft">
      <div className="flex justify-between items-center border-b-2 border-[#F97316] pb-2.5 mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#EA580C]" />
          <h3 className="text-xl font-bold text-[#171717]">मल्टी टैग न्यूज़</h3>
        </div>
        <Link
          href="/category/latest"
          className="text-xs text-[#EA580C] font-bold hover:underline flex items-center gap-1 group"
        >
          ताज़ा ख़बरें <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group border border-stone-100 rounded-xl p-2.5 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="relative w-full h-[140px] rounded-lg overflow-hidden bg-stone-100 mb-2.5">
                <Image
                  src={item.featuredImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80'}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10 max-w-[90%]">
                  {item.tags && item.tags.slice(0, 3).map((t, index) => {
                    const tagName = typeof t === 'string' ? t : t.name;
                    const tagSlug = typeof t === 'string' ? t.replace(/^#/, '') : (t.slug || t.name.replace(/^#/, ''));
                    const cleanName = tagName.startsWith('#') ? tagName : `#${tagName}`;
                    return (
                      <Link
                        key={index}
                        href={`/tag/${encodeURIComponent(tagSlug)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] bg-white/95 hover:bg-orange-500 hover:text-white text-[#C2410C] font-bold px-2 py-0.5 rounded-md border border-orange-200/80 shadow-xs transition-colors backdrop-blur-xs"
                      >
                        {cleanName}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link href={`/news/${item.slug}`}>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug group-hover:text-[#F97316] transition-colors line-clamp-2">
                  {item.title}
                </h4>
              </Link>
            </div>

            {item.publishedAt && (
              <div className="text-[11px] text-stone-400 mt-2 flex justify-between pt-2 border-t border-stone-50 font-mono">
                <span>{formatHindiTimeAgo(item.publishedAt)}</span>
                {item.viewCount !== undefined && (
                  <span>👁 {formatCount(item.viewCount)}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
