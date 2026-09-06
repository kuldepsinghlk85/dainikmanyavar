import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import MobileCategoryChips from '@/components/mobile/MobileCategoryChips';
import MobileNewsList from '@/components/mobile/MobileNewsList';
import MobileFooter from '@/components/mobile/MobileFooter';
import { ArrowLeft, Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MobileCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (_) {}

  let categoryName = '';
  let articles: any[] = [];

  if (decodedSlug === 'home' || decodedSlug === '') {
    // Treat home as latest
    categoryName = 'मुख्य समाचार (Top News)';
    articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        { publishedAt: 'desc' },
        { newsId: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 40,
      include: {
        category: { select: { name: true } },
      },
    });
  } else if (decodedSlug.toLowerCase() === 'latest' || decodedSlug.toLowerCase() === 'news') {
    categoryName = 'ताज़ा ख़बरें (All Latest News)';
    articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        { publishedAt: 'desc' },
        { newsId: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 40,
      include: {
        category: { select: { name: true } },
      },
    });
  } else {
    // 1. Try finding Category by slug, name, or id
    const category = await db.category.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug },
          { name: decodedSlug },
          { id: decodedSlug },
        ],
      },
    });

    if (category) {
      categoryName = category.name;
      articles = await db.article.findMany({
        where: { primaryCategoryId: category.id, status: 'PUBLISHED' },
        orderBy: [
          { publishedAt: 'desc' },
          { newsId: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 40,
        include: {
          category: { select: { name: true } },
        },
      });
    } else {
      // 2. Try finding Location (District / Division) e.g. jaunpur, varanasi, etc.
      const location = await db.location.findFirst({
        where: {
          OR: [
            { slug: decodedSlug },
            { slug },
            { name: decodedSlug },
          ],
        },
      });

      if (location) {
        categoryName = `${location.name} जिला समाचार`;
        articles = await db.article.findMany({
          where: { locationId: location.id, status: 'PUBLISHED' },
          orderBy: [
            { publishedAt: 'desc' },
            { newsId: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 40,
          include: {
            category: { select: { name: true } },
          },
        });
      } else {
        // 3. Graceful keyword search instead of throwing 404
        articles = await db.article.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { title: { contains: decodedSlug } },
              { excerpt: { contains: decodedSlug } },
            ],
          },
          orderBy: [{ publishedAt: 'desc' }],
          take: 30,
          include: {
            category: { select: { name: true } },
          },
        });
        categoryName = `${decodedSlug} समाचार`;
      }
    }
  }

  const allCategories = await db.category.findMany({
    where: { isHeaderMenu: true },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="space-y-1">
      {/* Category Chips Bar */}
      <MobileCategoryChips categories={allCategories} activeSlug={slug} />

      {/* Header Bar */}
      <div className="bg-white p-3.5 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/mobile" className="p-1 -ml-1 text-stone-600 hover:text-stone-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black text-stone-900">
            {categoryName}
          </h1>
        </div>
        <span className="text-[11px] font-bold text-[#EA580C] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 font-mono">
          {articles.length} खबरें
        </span>
      </div>

      {/* Articles List */}
      <MobileNewsList articles={articles} />

      {/* Footer */}
      <MobileFooter />
    </div>
  );
}
