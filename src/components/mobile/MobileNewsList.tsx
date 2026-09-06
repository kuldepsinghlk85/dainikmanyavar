'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Share2, Check, Crown, Play } from 'lucide-react';
import { formatHindiTimeAgo } from '@/lib/utils';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  publishedAt: string | Date;
  viewCount?: number;
  category?: { name: string; slug?: string } | null;
  videoDuration?: string | null;
  videoEnabled?: boolean;
  videoUrl?: string | null;
}

interface MobileNewsListProps {
  articles: ArticleItem[];
  sectionTitle?: string;
  viewAllLink?: string;
  buttonText?: string;
  icon?: React.ReactNode;
}

export default function MobileNewsList({
  articles,
  sectionTitle,
  viewAllLink,
  buttonText = 'सभी खबरें',
  icon,
}: MobileNewsListProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dm_bookmarked_ids') || '[]');
      setBookmarkedIds(saved);
    } catch (_) {}
  }, []);

  if (!articles || articles.length === 0) return null;

  const toggleBookmark = (e: React.MouseEvent, artId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let updated: string[];
      if (bookmarkedIds.includes(artId)) {
        updated = bookmarkedIds.filter((id) => id !== artId);
      } else {
        updated = [...bookmarkedIds, artId];
      }
      setBookmarkedIds(updated);
      localStorage.setItem('dm_bookmarked_ids', JSON.stringify(updated));
    } catch (_) {}
  };

  const handleShareSocial = (e: React.MouseEvent, art: ArticleItem) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/news/${art.slug}`;
    const text = art.title;

    if (navigator.share) {
      navigator.share({ title: text, url }).catch(() => {});
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          setCopiedId(art.id);
          setTimeout(() => setCopiedId(null), 2000);
        }).catch(() => {});
      }
    }
  };

  return (
    <section className="bg-white dark:bg-[#141414] border-y border-stone-200 dark:border-stone-800 px-3.5 py-3 my-2 shadow-2xs transition-colors">
      {/* Section Header matching Image 2 & Amar Ujala */}
      {sectionTitle && (
        <div className="flex items-center justify-between pb-2.5 pt-0.5 border-b border-stone-200 dark:border-stone-800 mb-2">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 text-sm">
                {icon}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#E53935] shrink-0" />
            )}
            <h3 className="text-[16px] font-black text-stone-900 dark:text-white tracking-tight">
              {sectionTitle}
            </h3>
          </div>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="border border-[#E53935] text-[#E53935] hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95 font-extrabold text-[11px] px-2.5 py-0.5 rounded transition-colors shrink-0"
            >
              {buttonText}
            </Link>
          )}
        </div>
      )}

      {/* Cards List matching Amar Ujala Screenshots */}
      <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
        {articles.map((art, index) => {
          const fallbackImg = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80';
          const imgSrc = art.featuredImage || fallbackImg;
          const isBookmarked = bookmarkedIds.includes(art.id);
          const formattedDate = formatHindiTimeAgo(art.publishedAt);
          const showCrown = index % 3 === 0;

          return (
            <article key={art.id} className="py-3">
              <Link href={`/mobile/news/${art.slug}`} className="block group">
                {/* Top Content Row: Left Headline + Right 4:3 Thumbnail */}
                <div className="flex gap-3 items-start justify-between">
                  {/* Left: Headline & Category Date */}
                  <div className="flex-1 min-w-0 pr-1 flex flex-col justify-between self-stretch">
                    <h4 className="text-[14px] sm:text-[15px] leading-snug text-stone-900 dark:text-stone-100 tracking-tight font-extrabold line-clamp-3 group-hover:text-[#E53935] transition-colors">
                      {art.title}
                    </h4>

                    {/* Bottom Meta: Category • Date */}
                    <div className="pt-2 text-[11px] text-stone-500 dark:text-stone-400 font-bold flex items-center gap-1.5">
                      <span className="text-stone-800 dark:text-stone-300">
                        {art.category?.name || 'देश'}
                      </span>
                      <span className="text-stone-400">•</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Right: Rounded 4:3 Thumbnail with Play button & Crown */}
                  <div className="relative w-28 h-20 sm:w-32 sm:h-22 rounded-lg overflow-hidden shrink-0 bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
                    <Image
                      src={imgSrc}
                      alt={art.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />

                    {/* Video Play Overlay */}
                    {art.videoEnabled && art.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xs">
                          <Play className="w-3 h-3 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Crown Badge matching Amar Ujala */}
                    {showCrown && (
                      <div className="absolute bottom-1 left-1 bg-amber-500/90 p-0.5 rounded shadow-xs">
                        <Crown className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Row: Bookmark & Share */}
                <div className="flex items-center justify-end gap-3 pt-2 text-stone-500 dark:text-stone-400">
                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleBookmark(e, art.id)}
                    className={`p-1 active:scale-90 transition-transform cursor-pointer ${
                      isBookmarked ? 'text-amber-500 fill-amber-500' : 'hover:text-amber-500'
                    }`}
                    title={isBookmarked ? 'सहेजा गया' : 'बुकमार्क करें'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={(e) => handleShareSocial(e, art)}
                    className="p-1 hover:text-[#E53935] active:scale-90 transition-transform cursor-pointer"
                    title="शेयर करें"
                  >
                    {copiedId === art.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
