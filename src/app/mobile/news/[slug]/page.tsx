import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatHindiTimeAgo } from '@/lib/utils';
import { ArrowLeft, Clock, Eye, Share2, MessageCircle, Volume2 } from 'lucide-react';
import MobileNewsList from '@/components/mobile/MobileNewsList';
import MobileFooter from '@/components/mobile/MobileFooter';
import AudioPlayer from '@/components/public/AudioPlayer';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, featuredImage: true },
  });
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

  const article = await db.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      location: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article || article.status !== 'PUBLISHED') {
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

  const shareUrl = `https://dainikmanyavar.com/news/${article.slug}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    article.title + '\n\nपूरा समाचार पढ़ें: ' + shareUrl
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

        {/* Featured Image */}
        {article.featuredImage && (
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
        )}

        {/* Audio News Player */}
        {article.allowAudio && (
          <div className="my-2">
            <AudioPlayer articleId={article.id} title={article.title} content={article.content} />
          </div>
        )}

        {/* Article Body */}
        <div
          className="prose prose-stone prose-sm max-w-none text-stone-800 leading-relaxed font-normal text-sm space-y-3 pt-2"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-100">
            {article.tags.map((t) => (
              <span
                key={t.tag.id}
                className="text-xs bg-stone-100 text-stone-700 font-bold px-2.5 py-1 rounded-lg"
              >
                #{t.tag.name.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}

        {/* WhatsApp Share Big Button */}
        <div className="pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-green-600 text-white font-black py-3 px-4 rounded-xl shadow-md transition-transform active:scale-98 text-sm"
          >
            <MessageCircle className="w-5 h-5" />
            <span>व्हाट्सएप पर मित्रों को शेयर करें</span>
          </a>
        </div>
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
