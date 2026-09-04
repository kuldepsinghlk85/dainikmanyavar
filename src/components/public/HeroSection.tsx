'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AudioPlayer from './AudioPlayer';
import { formatHindiDate, formatCount } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ExternalLink, Flame } from 'lucide-react';

interface Tag {
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  publishedAt: Date | string;
  viewCount: number;
  likeCount: number;
  tags?: Tag[];
}

interface HeroSectionProps {
  articles?: Article[] | null;
  mainStory?: Article | null;
}

export default function HeroSection({ articles = [], mainStory }: HeroSectionProps) {
  // Combine articles list or fallback to single mainStory
  const sliderArticles: Article[] = (articles && articles.length > 0)
    ? articles
    : (mainStory ? [mainStory] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play Slider every 5 seconds
  useEffect(() => {
    if (sliderArticles.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderArticles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderArticles.length, isHovered]);

  if (sliderArticles.length === 0) return null;

  const currentArticle = sliderArticles[currentIndex] || sliderArticles[0];

  const defaultTags = [
    { name: '#उत्तर प्रदेश', slug: 'uttar_pradesh' },
    { name: '#जौनपुर', slug: 'jaunpur' },
    { name: '#विकास', slug: 'vikas' },
    { name: '#किसान', slug: 'kisan' },
  ];

  const tags = currentArticle.tags && currentArticle.tags.length > 0
    ? currentArticle.tags
    : defaultTags;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderArticles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sliderArticles.length) % sliderArticles.length);
  };

  return (
    <div className="space-y-3">
      {/* News Slider Container */}
      <article
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative grid grid-cols-1 lg:grid-cols-[1.12fr_1fr] gap-5 border border-[#E8E8E8] p-4 rounded-xl shadow-soft bg-white group/slider"
      >
        {/* Slide Counter Badge */}
        {sliderArticles.length > 1 && (
          <div className="absolute top-6 left-6 z-20 bg-stone-900/80 backdrop-blur-xs text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-stone-700 flex items-center gap-1 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse"></span>
            <span>स्लाइड {currentIndex + 1} / {sliderArticles.length}</span>
          </div>
        )}

        {/* Featured Image Box */}
        <div className="relative w-full h-[260px] sm:h-[320px] rounded-lg overflow-hidden bg-stone-100 group">
          <Image
            src={currentArticle.featuredImage || 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=1200&q=80'}
            alt={currentArticle.title}
            fill
            unoptimized
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Navigation Arrow Controls */}
          {sliderArticles.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-10">
              <button
                onClick={handlePrev}
                className="pointer-events-auto p-2 bg-stone-900/70 hover:bg-[#EA580C] text-white rounded-full transition-colors cursor-pointer shadow-lg"
                title="पिछली खबर"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="pointer-events-auto p-2 bg-stone-900/70 hover:bg-[#EA580C] text-white rounded-full transition-colors cursor-pointer shadow-lg"
                title="अगली खबर"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Content & Metadata */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Top Bar: Multiple Tag Chips & Slide Dots */}
            <div className="flex justify-between items-start gap-2 mb-3">
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 5).map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="tag-chip hover:bg-[#FFEDD5]"
                  >
                    {tag.name.startsWith('#') ? tag.name : `#${tag.name}`}
                  </Link>
                ))}
              </div>

              {/* Dots Indicator */}
              {sliderArticles.length > 1 && (
                <div className="flex items-center gap-1">
                  {sliderArticles.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentIndex === idx ? 'w-5 bg-[#EA580C]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title & Summary */}
            <Link href={`/news/${currentArticle.slug}`}>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] leading-tight mb-3 hover:text-[#F97316] transition-colors">
                {currentArticle.title}
              </h2>
            </Link>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4">
              {currentArticle.excerpt || currentArticle.subtitle}
            </p>
          </div>

          <div>
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pb-2 border-b border-stone-100">
              <span>📅 {formatHindiDate(currentArticle.publishedAt)}</span>
              <span>👁 {formatCount(currentArticle.viewCount)}</span>
              <span>❤ {formatCount(currentArticle.likeCount)}</span>
            </div>

            {/* Audio TTS Player */}
            <AudioPlayer articleId={currentArticle.id} title={currentArticle.title} content={currentArticle.content} />
          </div>
        </div>
      </article>

      {/* Link to Open All Latest News in New Tab */}
      <Link
        href="/category/latest"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] hover:from-orange-700 hover:to-[#EA580C] text-white p-3.5 rounded-xl font-extrabold text-sm flex items-center justify-between shadow-md transition-all group border border-orange-600/30"
      >
        <div className="flex items-center gap-2.5">
          <span className="p-1 bg-white/20 rounded-lg text-lg">🔥</span>
          <span className="text-base tracking-wide">लेटेस्ट न्यूज़ देखें (View All Latest News)</span>
        </div>

        <div className="bg-white/20 group-hover:bg-white/30 text-white px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs">
          <span>सभी ताज़ा खबरें नए टैब में खोलें</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </Link>
    </div>
  );
}
