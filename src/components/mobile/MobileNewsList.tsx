'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Share2, Sparkles, MapPin, Landmark, Flame } from 'lucide-react';
import { formatHindiTimeAgo } from '@/lib/utils';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  publishedAt: string | Date;
  viewCount?: number;
  category?: { name: string; slug?: string } | null;
}

interface MobileNewsListProps {
  articles: ArticleItem[];
  sectionTitle?: string;
  viewAllLink?: string;
}

export default function MobileNewsList({ articles, sectionTitle, viewAllLink }: MobileNewsListProps) {
  if (!articles || articles.length === 0) return null;

  const handleShare = (e: React.MouseEvent, art: ArticleItem) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/news/${art.slug}`;
    if (navigator.share) {
      navigator.share({ title: art.title, url }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(art.title + ' ' + url)}`, '_blank');
    }
  };

  // Helper to parse title, extract custom icon and provide a smart contextual subtitle
  const parseHeaderInfo = (title: string) => {
    let icon = '📰';
    let cleanTitle = title;
    let subtitle = 'दैनिक मान्यवर विशेष कवरेज';
    let gradientBg = 'from-stone-900 via-stone-850 to-stone-950';
    let iconBg = 'bg-orange-500/20 border-orange-500/30 text-orange-400';
    let buttonColor = 'bg-[#EA580C] hover:bg-orange-600 text-white';

    if (title.includes('📍') || title.includes('जौनपुर')) {
      icon = '📍';
      cleanTitle = title.replace('📍', '').trim();
      subtitle = 'जनपद व आसपास की प्रमुख हलचल';
      gradientBg = 'from-stone-900 via-amber-950/40 to-stone-900';
      iconBg = 'bg-amber-500/20 border-amber-500/30 text-amber-400';
      buttonColor = 'bg-amber-600 hover:bg-amber-700 text-white';
    } else if (title.includes('🏛️') || title.includes('उत्तर प्रदेश')) {
      icon = '🏛️';
      cleanTitle = title.replace('🏛️', '').trim();
      subtitle = 'प्रादेशिक व राज्यस्तरीय मुख्य समाचार';
      gradientBg = 'from-stone-900 via-indigo-950/40 to-stone-900';
      iconBg = 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300';
      buttonColor = 'bg-[#EA580C] hover:bg-orange-600 text-white';
    } else if (title.includes('ताज़ा') || title.includes('सुर्खियां')) {
      icon = '🔥';
      cleanTitle = title.replace('🔥', '').trim();
      subtitle = 'लाइव ब्रेकिंग व ताज़ा अपडेट्स';
      gradientBg = 'from-stone-900 via-red-950/40 to-stone-900';
      iconBg = 'bg-red-500/20 border-red-500/30 text-red-400';
      buttonColor = 'bg-red-600 hover:bg-red-700 text-white';
    }

    return { icon, cleanTitle, subtitle, gradientBg, iconBg, buttonColor };
  };

  const headerInfo = sectionTitle ? parseHeaderInfo(sectionTitle) : null;

  return (
    <section className="my-3 px-2.5">
      {/* Redesigned Premium Section Header Banner */}
      {headerInfo && (
        <div className={`relative overflow-hidden rounded-2xl p-3 mb-2.5 bg-gradient-to-r ${headerInfo.gradientBg} text-white shadow-xs border border-stone-800/90`}>
          {/* Subtle Ambient Decorative Blur */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* Left Header Title & Badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl ${headerInfo.iconBg} border flex items-center justify-center text-base shrink-0 shadow-inner`}>
                <span>{headerInfo.icon}</span>
              </div>
              <div className="truncate">
                <h3 className="text-[14px] sm:text-base font-black text-white tracking-tight leading-tight flex items-center gap-1.5">
                  <span>{headerInfo.cleanTitle}</span>
                </h3>
                <p className="text-[10px] text-stone-300 font-semibold tracking-wide mt-0.5 truncate">
                  {headerInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Right 'सभी देखें' Action Button */}
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className={`${headerInfo.buttonColor} active:scale-95 text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1 transition-all shrink-0 border border-white/15`}
              >
                <span>सभी देखें</span>
                <span className="text-xs">&rarr;</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Alternating Color News Cards Feed */}
      <div className="space-y-2.5">
        {articles.map((art, index) => {
          const isEven = index % 2 === 0;
          const fallbackImg = 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=300&q=80';
          const imgSrc = art.featuredImage || fallbackImg;

          return (
            <article
              key={art.id}
              className={`rounded-2xl transition-all duration-150 active:scale-[0.985] overflow-hidden border shadow-xs ${
                isEven
                  ? 'bg-white border-stone-200/90 border-l-[5px] border-l-[#EA580C] hover:border-orange-300'
                  : 'bg-gradient-to-br from-amber-50/60 via-stone-50 to-orange-50/35 border-amber-200/80 border-l-[5px] border-l-stone-900 hover:border-amber-400'
              }`}
            >
              <Link href={`/mobile/news/${art.slug}`} className="flex gap-3 items-center p-3">
                {/* Left Content (approx 65%) */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Category Pill with Alternating Style */}
                  <div className="flex items-center gap-1.5">
                    {art.category && (
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                          isEven
                            ? 'bg-orange-50 text-[#EA580C] border-orange-200/80'
                            : 'bg-stone-900 text-amber-300 border-stone-800 shadow-2xs'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isEven ? 'bg-[#EA580C]' : 'bg-amber-400'}`} />
                        <span>{art.category.name}</span>
                      </span>
                    )}
                  </div>

                  {/* Headline */}
                  <h4 className={`text-[13px] sm:text-sm font-extrabold leading-snug line-clamp-3 tracking-tight ${
                    isEven ? 'text-stone-900' : 'text-stone-950'
                  }`}>
                    {art.title}
                  </h4>

                  {/* Footer Meta Row */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                    <span className="flex items-center gap-1 font-medium text-stone-500">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{formatHindiTimeAgo(art.publishedAt)}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleShare(e, art)}
                      className="text-stone-400 hover:text-green-600 active:text-green-600 p-1.5 rounded-full hover:bg-green-50 active:bg-green-100 transition-colors"
                      title="व्हाट्सएप व सोशल मीडिया पर शेयर करें"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Thumbnail: Smart In-Frame Arrangement (No Image Overflow / No Cutoff) */}
                <div className="relative w-24 h-22 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-stone-950 shrink-0 border border-stone-200/90 shadow-2xs group">
                  {/* Layer 1: Ambient Background Color Blur */}
                  <Image
                    src={imgSrc}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover blur-md scale-125 opacity-35 select-none pointer-events-none"
                  />

                  {/* Layer 2: Contained Foreground Image - 100% of the image fits inside the frame */}
                  <Image
                    src={imgSrc}
                    alt={art.title}
                    fill
                    unoptimized
                    className="object-contain p-1 z-10 transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Layer 3: Glass Edge Rim */}
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 z-20 pointer-events-none" />
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
