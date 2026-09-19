import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatHindiTimeAgo, getPublicSiteUrl } from '@/lib/utils';
import { ArrowLeft, Clock, Eye, Share2, MessageCircle, Volume2 } from 'lucide-react';
import MobileNewsList from '@/components/mobile/MobileNewsList';
import MobileFooter from '@/components/mobile/MobileFooter';
import AudioPlayer from '@/components/public/AudioPlayer';
import UserActivityTracker from '@/components/public/UserActivityTracker';
import ShareBar from '@/components/public/ShareBar';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (_) {}

  let article = await db.article.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug },
        { id: decodedSlug },
        { id: slug },
      ],
    },
    select: { title: true, excerpt: true, featuredImage: true },
  });
  if (!article) {
    const numMatch = decodedSlug.match(/(\d+)$/);
    if (numMatch) {
      const newsIdNum = parseInt(numMatch[1], 10);
      article = await db.article.findFirst({
        where: {
          OR: [
            { newsId: newsIdNum },
            { slug: { endsWith: `-${numMatch[1]}` } },
          ],
        },
        select: { title: true, excerpt: true, featuredImage: true },
      });
    }
  }
  if (!article) return {};
  return {
    title: `${article.title} | दैनिक मान्यवर मोबाइल`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

export default async function MobileNewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (_) {}

  let article = await db.article.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug },
        { id: decodedSlug },
        { id: slug },
      ],
    },
    include: {
      category: true,
      author: true,
      location: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article) {
    const numMatch = decodedSlug.match(/(\d+)$/);
    if (numMatch) {
      const newsIdNum = parseInt(numMatch[1], 10);
      article = await db.article.findFirst({
        where: {
          OR: [
            { newsId: newsIdNum },
            { slug: { endsWith: `-${numMatch[1]}` } },
          ],
        },
        include: {
          category: true,
          author: true,
          location: true,
          tags: { include: { tag: true } },
        },
      });
    }
  }

  if (!article || (article.status !== 'PUBLISHED' && article.status !== 'ARCHIVED')) {
    notFound();
  }

  // Increment view count asynchronously
  db.article
    .update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  // Fetch related articles
  const relatedArticles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      primaryCategoryId: article.primaryCategoryId,
      id: { not: article.id },
    },
    orderBy: [{ newsId: 'desc' }, { publishedAt: 'desc' }],
    take: 6,
    include: {
      category: { select: { name: true } },
    },
  });

  let reviewData: any = null;
  if (article.gallery) {
    try {
      reviewData = JSON.parse(article.gallery);
    } catch (_) {}
  }

  const siteUrl = getPublicSiteUrl();
  const shareUrl = `${siteUrl}/mobile/news/${encodeURIComponent(article.slug)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    article.title + '\n\nपूरा समाचार मोबाइल पर पढ़ें: ' + shareUrl
  )}`;

  return (
    <article className="bg-white min-h-screen">
      {/* Sub-header Navigation */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-stone-200 bg-stone-50">
        <Link
          href="/mobile"
          className="flex items-center gap-1.5 text-xs font-black text-stone-700 hover:text-[#EA580C]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ</span>
        </Link>
        {article.category && (
          <Link
            href={`/mobile/category/${article.category.slug}`}
            className="text-[11px] font-black bg-orange-100 text-[#C2410C] px-2.5 py-0.5 rounded-full"
          >
            {article.category.name}
          </Link>
        )}
      </div>

      <div className="p-4 space-y-3.5">
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug tracking-tight">
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <h2 className="text-sm font-bold text-stone-600 border-l-2 border-[#EA580C] pl-2 leading-relaxed">
            {article.subtitle}
          </h2>
        )}

        {/* Meta Bar */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 py-1 border-y border-stone-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{formatHindiTimeAgo(article.publishedAt)}</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              <span>{article.viewCount + 1}</span>
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>व्हाट्सएप</span>
          </a>
        </div>

        {/* Movie Review Card (for entertainment review items) */}
        {reviewData && (reviewData.rating || reviewData.verdict) && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-2xl p-4 text-white shadow-md space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎬</span>
                <span className="text-xs font-black tracking-wider uppercase text-amber-200">रिव्यू स्कोरकार्ड</span>
              </div>
              {reviewData.rating && (
                <div className="bg-black/35 px-3 py-1 rounded-full text-amber-300 font-black text-xs">
                  {'★'.repeat(Math.floor(reviewData.rating))} {reviewData.rating}/5
                </div>
              )}
            </div>
            {reviewData.verdict && (
              <div className="text-xs">
                <span className="text-orange-100 font-bold">वर्डिक्ट: </span>
                <span className="font-black bg-white/20 px-2 py-0.5 rounded text-white">{reviewData.verdict}</span>
              </div>
            )}
          </div>
        )}

        {/* Video / Reel Player or Featured Image */}
        {article.videoEnabled && article.videoUrl ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-stone-800">
            {article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be') ? (
              <iframe
                src={`https://www.youtube.com/embed/${article.videoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}`}
                title={article.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={article.videoUrl}
                controls
                poster={article.featuredImage || ''}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        ) : article.featuredImage ? (
          <div className="relative w-full aspect-[16/10] bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              unoptimized
              priority
              className="object-cover"
            />
          </div>
        ) : null}

        {/* Audio News Player */}
        {article.allowAudio && (
          <div className="my-2">
            <AudioPlayer articleId={article.id} title={article.title} content={article.content} />
          </div>
        )}

        {/* Social Share Bar */}
        <ShareBar
          articleId={article.id}
          title={article.title}
          slug={article.slug}
          initialLikeCount={article.likeCount}
          categoryName={article.category?.name}
          reviewData={reviewData}
          isMobile={true}
        />

        {/* User Activity & Bookmark Tracker */}
        <UserActivityTracker
          newsId={article.id}
          newsTitle={article.title}
          newsSlug={article.slug}
          isMobile={true}
        />

        {/* Article Body */}
        <div
          className="prose prose-stone prose-sm max-w-none text-stone-800 leading-relaxed font-normal text-sm space-y-3 pt-2"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Clickable Tags (First-class Data Content) */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-100">
            {article.tags.map((t) => (
              <Link
                key={t.tag.id}
                href={`/mobile/tag/${t.tag.slug}`}
                className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold px-2.5 py-1 rounded-lg border border-orange-200 transition-colors"
              >
                #{t.tag.name.replace(/^#/, '')}
              </Link>
            ))}
          </div>
        )}

        {/* Bottom Social Share Bar */}
        <ShareBar
          articleId={article.id}
          title={article.title}
          slug={article.slug}
          initialLikeCount={article.likeCount}
          categoryName={article.category?.name}
          reviewData={reviewData}
          isMobile={true}
        />
      </div>

      {/* Related News Feed */}
      {relatedArticles.length > 0 && (
        <div className="mt-4">
          <MobileNewsList
            articles={relatedArticles}
            sectionTitle="संबंधित ख़बरें"
          />
        </div>
      )}

      {/* Footer */}
      <MobileFooter />
    </article>
  );
}
