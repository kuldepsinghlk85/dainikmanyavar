'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Share2, Check } from 'lucide-react';
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
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dm_bookmarked_ids') || '[]');
      if (saved.includes(article.id)) setBookmarked(true);
    } catch (_) {}
  }, [article.id]);

  if (!article) return null;

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('dm_bookmarked_ids') || '[]');
      let updated: string[];
      if (saved.includes(article.id)) {
        updated = saved.filter((id) => id !== article.id);
        setBookmarked(false);
      } else {
        updated = [...saved, article.id];
        setBookmarked(true);
      }
      localStorage.setItem('dm_bookmarked_ids', JSON.stringify(updated));
    } catch (_) {}
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/news/${article.slug}`;
    if (navigator.share) {
      navigator.share({ title: article.title, url }).catch(() => {});
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      }
    }
  };

  const fallback = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
  const [imgSrc, setImgSrc] = useState(article.featuredImage || fallback);

  useEffect(() => {
    setImgSrc(article.featuredImage || fallback);
  }, [article.featuredImage]);

  const formattedDate = formatHindiTimeAgo(article.publishedAt);

  return (
    <article className="bg-white dark:bg-[#141414] border-b border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
      <Link href={`/mobile/news/${article.slug}`} className="block group">
        {/* Headline at Top matching Amar Ujala Image 2 */}
        <div className="px-3.5 pt-3 pb-2">
          <h2 className="text-[17px] sm:text-[19px] font-black text-stone-900 dark:text-stone-50 leading-snug tracking-tight group-hover:text-[#E53935] transition-colors">
            {article.title}
          </h2>
        </div>

        {/* Cover Image 16:10 with Smart In-Frame Arrangement */}
        <div className="relative w-full aspect-[16/10] bg-stone-950 overflow-hidden">
          {/* Layer 1: Ambient Background Color Blur */}
          <Image
            src={imgSrc}
            alt=""
            fill
            unoptimized
            onError={() => setImgSrc(fallback)}
            className="object-cover blur-lg scale-115 opacity-40 select-none pointer-events-none"
          />
          {/* Layer 2: Contained Main Image */}
          <Image
            src={imgSrc}
            alt={article.title}
            fill
            unoptimized
            priority
            onError={() => setImgSrc(fallback)}
            className="object-contain p-1 z-10 transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Bottom Meta Row matching Amar Ujala: Category • Date | Bookmark + Share */}
        <div className="px-3.5 py-2.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-stone-800 dark:text-stone-200">
              {article.category?.name || 'विशेष'}
            </span>
            <span className="text-stone-400">•</span>
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bookmark Icon */}
            <button
              type="button"
              onClick={toggleBookmark}
              className={`p-1 active:scale-90 transition-transform cursor-pointer ${
                bookmarked ? 'text-amber-500 fill-amber-500' : 'text-stone-500 dark:text-stone-400 hover:text-amber-500'
              }`}
              title={bookmarked ? 'सहेजा गया' : 'बुकमार्क करें'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Share Icon */}
            <button
              type="button"
              onClick={handleShare}
              className="p-1 text-stone-500 dark:text-stone-400 hover:text-[#E53935] active:scale-90 transition-transform cursor-pointer"
              title="शेयर करें"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
