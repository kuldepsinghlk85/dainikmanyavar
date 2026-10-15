'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Film, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';

export interface MovieArticle {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  contentType?: string | null;
  categoryName?: string | null;
  publishedAt?: string | Date | null;
}

interface MovieNewsSliderWidgetProps {
  articles: MovieArticle[];
  title?: string;
}

export default function MovieNewsSliderWidget({
  articles,
  title = 'सिनेमा व मनोरंजन',
}: MovieNewsSliderWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const validArticles = (articles || []).filter((a) => a && a.title && a.slug);

  const nextSlide = () => {
    if (validArticles.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % validArticles.length);
  };

  const prevSlide = () => {
    if (validArticles.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + validArticles.length) % validArticles.length);
  };

  useEffect(() => {
    if (validArticles.length <= 1 || isHovered) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isHovered, validArticles.length]);

  if (!validArticles || validArticles.length === 0) {
    return null;
  }

  const current = validArticles[currentIndex];
  const isReview =
    current.contentType === 'movie_review' ||
    /रिव्यू|review/i.test(current.title) ||
    /रिव्यू|review/i.test(current.slug);

  return (
    <div
      className="border border-[#E8E8E8] rounded-xl bg-white shadow-soft overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header bar matching Image 2 */}
      <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-sm">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-[#171717]">{title}</span>
              <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                सिनेमा • रिव्यू • बज़
              </span>
            </div>
          </div>
        </div>

        {/* Navigation arrows & indicator */}
        {validArticles.length > 1 && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-stone-600 mr-1">
              {currentIndex + 1}/{validArticles.length}
            </span>
            <button
              onClick={prevSlide}
              aria-label="Previous movie news"
              className="w-6 h-6 rounded-md bg-stone-100 hover:bg-orange-100 text-stone-600 hover:text-orange-600 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next movie news"
              className="w-6 h-6 rounded-md bg-stone-100 hover:bg-orange-100 text-stone-600 hover:text-orange-600 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Slide Item Container: Image with heading running along the edge */}
      <div className="p-2.5">
        <Link
          href={`/news/${current.slug}`}
          className="group relative block rounded-lg overflow-hidden bg-stone-900 aspect-[16/10] shadow-inner"
        >
          {/* Movie Image */}
          {current.featuredImage ? (
            <Image
              src={current.featuredImage}
              alt={current.title}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950 text-stone-400">
              <Film className="w-12 h-12 opacity-40" />
            </div>
          )}

          {/* Dark gradient overlay so the white heading is crisp and legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

          {/* Corner badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-orange-600/90 backdrop-blur-sm px-2 py-0.5 rounded shadow">
              {isReview ? '⭐ मूवी रिव्यू' : '🎬 सिनेमा'}
            </span>
          </div>

          {/* Heading overlay at the edge */}
          <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
            <h4 className="text-white text-sm sm:text-[15px] font-bold leading-snug line-clamp-2 group-hover:text-orange-300 transition-colors drop-shadow-md">
              {current.title}
            </h4>
          </div>
        </Link>

        {/* Dot indicators */}
        {validArticles.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {validArticles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-5 bg-orange-600'
                    : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
