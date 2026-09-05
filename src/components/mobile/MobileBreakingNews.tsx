'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';

interface BreakingItem {
  id: string;
  title: string;
  slug?: string;
  article?: { slug: string };
}

interface MobileBreakingNewsProps {
  items?: BreakingItem[];
}

export default function MobileBreakingNews({ items = [] }: MobileBreakingNewsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const current = items[index];
  const targetSlug = current.article?.slug || current.slug;
  const href = targetSlug ? `/mobile/news/${targetSlug}` : '/mobile';

  return (
    <div className="bg-red-50 border-y border-red-200 px-3 py-1.5 flex items-center gap-2">
      <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 tracking-wide uppercase shadow-xs animate-pulse">
        <Flame className="w-3 h-3 fill-white" />
        <span>ब्रेकिंग</span>
      </span>

      <Link
        href={href}
        className="flex-1 text-xs font-extrabold text-stone-900 truncate hover:text-red-700 active:underline"
      >
        {current.title}
      </Link>

      {items.length > 1 && (
        <span className="text-[10px] font-mono font-bold text-stone-400 shrink-0">
          {index + 1}/{items.length}
        </span>
      )}
    </div>
  );
}
