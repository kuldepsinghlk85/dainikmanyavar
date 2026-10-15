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
  const cleanSlug = decodedSlug.replace(/^#+/, '').trim();

  const tag = await db.tag.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: cleanSlug },
        { slug: slug },
        { name: decodedSlug },
        { name: cleanSlug },
        { name: '#' + cleanSlug },
      ],
    },
  });

  if (!tag) {
    const isReview = /रिव्यू|review/i.test(decodedSlug);
    const isFilm = /फिल्म|film|movie|cinema|सिनेमा/i.test(decodedSlug);
    const titleName = isReview ? 'फिल्मों के रिव्यू' : isFilm ? 'फिल्में' : cleanSlug;
    return {
      title: `#${titleName} समाचार | दैनिक मान्यवर`,
      description: `${titleName} से जुड़ी सभी ताज़ा ख़बरें और अपडेट्स।`,
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
  const cleanSlug = decodedSlug.replace(/^#+/, '').trim();

  // Find all matching tags
  const matchingTags = await db.tag.findMany({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: cleanSlug },
        { slug: slug },
        { name: decodedSlug },
        { name: cleanSlug },
        { name: '#' + cleanSlug },
        { name: '#' + decodedSlug },
      ],
    },
  });

  const matchingLocation = await db.location.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: cleanSlug },
        { slug: slug },
        { name: decodedSlug },
        { name: cleanSlug },
      ],
    },
  });

  const isReviewTag =
    /रिव्यू|review/i.test(decodedSlug) ||
    matchingTags.some((t) => /रिव्यू|review/i.test(t.name) || /रिव्यू|review/i.test(t.slug));

  const isFilmTag =
    /फिल्म|film|movie|cinema|सिनेमा/i.test(decodedSlug) ||
    matchingTags.some(
      (t) =>
        /फिल्म|film|movie|cinema|सिनेमा/i.test(t.name) ||
        /फिल्म|film|movie|cinema|सिनेमा/i.test(t.slug)
    );

  let primaryTag: any =
    matchingTags[0] ||
    (matchingLocation
      ? {
          id: matchingLocation.id,
          name: `#${matchingLocation.name}`,
          slug: matchingLocation.slug,
        }
      : null);

  if (!primaryTag && !matchingLocation) {
    if (isReviewTag) {
      primaryTag = {
        id: 'virtual-review',
        name: '#फिल्मों_के_रिव्यू',
        slug: 'फिल्मों-के-रिव्यू',
      };
    } else if (isFilmTag) {
      primaryTag = {
        id: 'virtual-film',
        name: '#फिल्में',
        slug: 'फिल्में',
      };
    }
  }

  if (!primaryTag && !matchingLocation) {
    notFound();
  }

  const tagIds = matchingTags.map((t) => t.id);

  let articles: any[] = [];

  if (tagIds.length > 0) {
    const taggedArticles = await db.articleTag.findMany({
      where: {
        tagId: { in: tagIds },
        article: { status: 'PUBLISHED' },
      },
      include: {
        article: {
          include: {
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { article: { publishedAt: 'desc' } },
      take: 40,
    });
    articles = taggedArticles.map((t) => t.article);
  }

  // Fallback for film & review tags or location tags
  if (articles.length === 0) {
    if (isReviewTag) {
      articles = await db.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { contentType: 'movie_review' },
            { category: { slug: 'manoranjan' } },
            { title: { contains: 'रिव्यू' } },
          ],
        },
        include: {
          category: { select: { name: true, slug: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        take: 30,
      });
    } else if (isFilmTag) {
      articles = await db.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { category: { slug: 'manoranjan' } },
            { contentType: 'movie_review' },
          ],
        },
        include: {
          category: { select: { name: true, slug: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        take: 30,
      });
    } else if (matchingLocation) {
      articles = await db.article.findMany({
        where: {
          locationId: matchingLocation.id,
          status: 'PUBLISHED',
        },
        include: {
          category: { select: { name: true, slug: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 30,
      });
    }
  }

  const allCategories = await db.category.findMany({
    where: {
      isHeaderMenu: true,
      articles: { some: { status: 'PUBLISHED' } },
    },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true },
    take: 15,
  });

  const tagName = primaryTag?.name || (matchingLocation ? `#${matchingLocation.name}` : `#${cleanSlug}`);

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
              {tagName.startsWith('#') ? tagName : `#${tagName}`}
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
