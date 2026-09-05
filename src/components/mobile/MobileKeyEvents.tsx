'use client';

import React from 'react';
import Link from 'next/link';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
}

export default function MobileKeyEvents({ article }: { article?: ArticleItem | null }) {
  if (!article) return null;

  return (
    <section className="bg-white dark:bg-[#141414] px-4 py-4 my-2 border-y border-stone-200 dark:border-stone-800 text-center transition-colors">
      {/* Red Pill Badge matching Amar Ujala */}
      <div className="inline-block mb-2.5">
        <span className="bg-[#E53935] text-white text-[11px] font-black px-3.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
          आज के अहम घटनाक्रम
        </span>
      </div>

      {/* Prominent Lead Headline */}
      <Link href={`/mobile/news/${article.slug}`} className="block group">
        <h2 className="text-[17.5px] sm:text-[19px] font-black leading-snug text-stone-900 dark:text-white group-hover:text-[#E53935] transition-colors">
          {article.title}
        </h2>
      </Link>
    </section>
  );
}
