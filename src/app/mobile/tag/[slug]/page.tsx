import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ArrowLeft, Tag as TagIcon } from 'lucide-react';
import MobileNewsList from '@/components/mobile/MobileNewsList';
import MobileCategoryChips from '@/components/mobile/MobileCategoryChips';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (_) {}

  const tag = await db.tag.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: slug },
        { name: decodedSlug },
        { name: '#' + decodedSlug },
      ],
    },
  });

  if (!tag) {
    return {
      title: `#${decodedSlug} समाचार | दैनिक मान्यवर`,
    };
  }

  return {
    title: `${tag.name} - ताज़ा ख़बरें एवं वीडियो | दैनिक मान्यवर`,
    description: `${tag.name} से जुड़ी सभी ताज़ा ख़बरें, वीडियो और अपडेट्स।`,
  };
}

export default async function MobileTagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (_) {}

  const tag = await db.tag.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: slug },
        { name: decodedSlug },
        { name: '#' + decodedSlug },
      ],
    },
    include: {
      articleTags: {
        include: {
          article: {
            include: {
              category: { select: { name: true, slug: true } },
            },
          },
        },
        orderBy: { article: { publishedAt: 'desc' } },
        take: 40,
      },
    },
  });

  if (!tag) {
    notFound();
  }

  const articles = tag.articleTags
    .map((at) => at.article)
    .filter((a) => a.status === 'PUBLISHED');

  const allCategories = await db.category.findMany({
    where: { isHeaderMenu: true },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="space-y-1 bg-stone-50 min-h-screen">
      {/* Category Chips Bar */}
      <MobileCategoryChips categories={allCategories} activeSlug="" />

      {/* Header Bar */}
      <div className="bg-white p-3.5 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/mobile"
            className="p-1 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-1.5">
            <TagIcon className="w-4 h-4 text-[#EA580C]" />
            <h1 className="text-base font-black text-stone-900 tracking-tight">
              {tag.name.startsWith('#') ? tag.name : `#${tag.name}`}
            </h1>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full">
          {articles.length} समाचार
        </span>
      </div>

      {/* News List */}
      <div className="bg-white">
        {articles.length > 0 ? (
          <MobileNewsList articles={articles} />
        ) : (
          <div className="text-center py-12 px-4 space-y-2">
            <p className="text-stone-500 text-sm font-semibold">
              इस टैग में अभी कोई प्रकाशित समाचार नहीं है।
            </p>
            <Link
              href="/mobile"
              className="inline-block text-xs font-bold text-[#EA580C] hover:underline"
            >
              ← मुख्य पृष्ठ पर लौटें
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
