'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Share2 } from 'lucide-react';
import { formatHindiTimeAgo } from '@/lib/utils';

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  publishedAt: string | Date;
  viewCount?: number;
  category?: { name: string; slug: string } | null;
}

export default function MobileHeroCard({ article }: { article: ArticleData }) {
  if (!article) return null;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/news/${article.slug}`;
    if (navigator.share) {
      navigator.share({ title: article.title, url }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + url)}`, '_blank');
    }
  };

  return (
    <article className="bg-white border-b border-stone-200 overflow-hidden">
      <Link href={`/mobile/news/${article.slug}`} className="block active:opacity-95">
        {/* Cover Image 16:10 with Smart In-Frame Arrangement */}
        <div className="relative w-full aspect-[16/10] bg-stone-950 overflow-hidden">
          {/* Layer 1: Ambient Background Color Blur */}
          <Image
            src={article.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
            alt=""
            fill
            unoptimized
            className="object-cover blur-lg scale-115 opacity-40 select-none pointer-events-none"
          />
          {/* Layer 2: Properly Contained Main Image */}
          <Image
            src={article.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
            alt={article.title}
            fill
            unoptimized
            priority
            className="object-contain p-1 z-10"
          />
          {article.category && (
            <span className="absolute top-2.5 left-2.5 z-20 bg-[#EA580C] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md">
              {article.category.name}
            </span>
          )}
        </div>

        {/* Text Content */}
        <div className="p-3.5 space-y-2">
          <h2 className="text-lg font-black text-stone-900 leading-snug tracking-tight hover:text-[#EA580C]">
            {article.title}
          </h2>

          {article.excerpt && (
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
              {article.excerpt}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500 font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{formatHindiTimeAgo(article.publishedAt)}</span>
              </span>
              {typeof article.viewCount === 'number' && article.viewCount > 0 && (
                <span className="flex items-center gap-1 font-mono">
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                  <span>{article.viewCount}</span>
                </span>
              )}
            </div>

            <button
              onClick={handleShare}
              className="p-1.5 text-stone-500 hover:text-green-600 rounded-full active:bg-stone-100 cursor-pointer"
              title="शेयर करें"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
