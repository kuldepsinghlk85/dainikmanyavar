import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import ShareBar from '@/components/public/ShareBar';
import { db } from '@/lib/db';
import { formatHindiDate, formatHindiTimeAgo } from '@/lib/utils';
import { generateMovieReviewJsonLd } from '@/lib/seo';
import {
  Star,
  StarHalf,
  Tv,
  Film,
  User,
  Clock,
  Calendar,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Award,
  ChevronLeft,
} from 'lucide-react';
import SpoilerToggle from '@/components/public/SpoilerToggle';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const article = await db.article.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug }],
    },
    include: {
      movieReview: { include: { movie: true } },
    },
  });

  if (!article) {
    return { title: 'मूवी रिव्यू | दैनिक मान्यवर' };
  }

  const movie = article.movieReview?.movie;
  const title = movie ? `${movie.title} मूवी रिव्यू (Rating: ${article.movieReview?.rating}/5)` : article.title;

  return {
    title: `${title} | दैनिक मान्यवर`,
    description: article.excerpt || article.title,
    openGraph: {
      title: `${title} | दैनिक मान्यवर`,
      description: article.excerpt || article.title,
      images: [{ url: movie?.poster || article.featuredImage || '/logo.png' }],
    },
  };
}

export default async function MovieReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const article = await db.article.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug }],
    },
    include: {
      category: true,
      author: true,
      movieReview: {
        include: {
          movie: true,
        },
      },
      tags: { include: { tag: true } },
    },
  });

  if (!article || !article.movieReview) {
    notFound();
  }

  const review = article.movieReview;
  const movie = review.movie;

  // Generate Google Rich Review Schema
  const jsonLd = generateMovieReviewJsonLd({
    movieTitle: movie.title,
    movieTitleHindi: movie.titleHindi || undefined,
    slug: article.slug,
    rating: review.rating,
    director: movie.director || undefined,
    posterImage: movie.poster || article.featuredImage || undefined,
    authorName: article.author?.name || undefined,
    reviewBody: article.excerpt || article.title,
    datePublished: article.publishedAt,
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />);
      } else if (rating >= i - 0.5) {
        stars.push(<StarHalf key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-stone-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <TopBar />
      <Header />
      <Navigation />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-bold">
          <Link href="/" className="hover:text-red-600">होम</Link>
          <span>/</span>
          <Link href="/entertainment" className="hover:text-red-600">मनोरंजन</Link>
          <span>/</span>
          <span className="text-stone-800 line-clamp-1">फिल्म समीक्षा: {movie.title}</span>
        </div>

        {/* Film Scorecard Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-stone-900 via-purple-950 to-stone-900 text-white p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Poster */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-48 sm:w-56 h-72 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-stone-700">
                  <Image
                    src={movie.poster || article.featuredImage || '/logo.png'}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="224px"
                    priority
                  />
                  {movie.ottPlatform && (
                    <div className="absolute top-3 left-3 bg-purple-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                      {movie.ottPlatform}
                    </div>
                  )}
                </div>
              </div>

              {/* Movie Meta Details */}
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                  <Film className="w-3.5 h-3.5" />
                  दैनिक मान्यवर मूवी रिव्यू
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {movie.titleHindi ? `${movie.titleHindi} (${movie.title})` : movie.title}
                </h1>

                {/* Star Rating & Verdict Badge */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 bg-stone-800/90 px-3.5 py-1.5 rounded-xl border border-stone-700">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="font-black text-lg text-amber-400 ml-1">
                      {review.rating.toFixed(1)}/5
                    </span>
                  </div>

                  {review.verdict && (
                    <span className="bg-amber-500 text-stone-950 font-black text-xs px-3.5 py-2 rounded-xl shadow">
                      🏆 {review.verdict}
                    </span>
                  )}
                </div>

                {/* Film Specifications */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-300 pt-3 border-t border-stone-800">
                  {movie.director && (
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">निर्देशक</span>
                      <span className="font-bold text-white">{movie.director}</span>
                    </div>
                  )}
                  {movie.genre && (
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">शैली (Genre)</span>
                      <span className="font-bold text-white">{movie.genre}</span>
                    </div>
                  )}
                  {movie.runtime && (
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">अवधि (Runtime)</span>
                      <span className="font-bold text-white">{movie.runtime}</span>
                    </div>
                  )}
                  {movie.cast && (
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">मुख्य कलाकार</span>
                      <span className="font-bold text-white">{movie.cast}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Ratings Scoreboard */}
          {(review.directionRating || review.actingRating || review.storyRating || review.musicRating) && (
            <div className="bg-stone-50 border-t border-stone-200 p-4 sm:p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                विस्तृत रेटिंग विश्लेषण (Detailed Scorecard)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {review.directionRating && (
                  <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                    <span className="text-stone-500 text-xs block">निर्देशन (Direction)</span>
                    <span className="text-lg font-black text-stone-900">{review.directionRating}/5</span>
                  </div>
                )}
                {review.actingRating && (
                  <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                    <span className="text-stone-500 text-xs block">अभिनय (Acting)</span>
                    <span className="text-lg font-black text-stone-900">{review.actingRating}/5</span>
                  </div>
                )}
                {review.storyRating && (
                  <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                    <span className="text-stone-500 text-xs block">कहानी (Story)</span>
                    <span className="text-lg font-black text-stone-900">{review.storyRating}/5</span>
                  </div>
                )}
                {review.musicRating && (
                  <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                    <span className="text-stone-500 text-xs block">संगीत (Music)</span>
                    <span className="text-lg font-black text-stone-900">{review.musicRating}/5</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Highlights: Positives & Negatives */}
        {(review.positives || review.negatives) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {review.positives && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  फिल्म की खूबियां (Positives)
                </div>
                <div className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                  {review.positives}
                </div>
              </div>
            )}

            {review.negatives && (
              <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-red-800 font-extrabold text-sm">
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  कमी कहां रह गई (Negatives)
                </div>
                <div className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                  {review.negatives}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Article Body */}
        <article className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 text-xs text-stone-500">
            <div>
              समीक्षक: <span className="font-bold text-stone-900">{article.author?.name || 'दैनिक मान्यवर डेस्क'}</span>
            </div>
            <div>{formatHindiDate(article.publishedAt)}</div>
          </div>

          <div
            className="prose prose-stone max-w-none text-stone-800 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Hidden Spoiler Section */}
          {review.spoilersContent && (
            <SpoilerToggle spoilerText={review.spoilersContent} />
          )}

          {/* Social Share Bar */}
          <div className="pt-6 border-t border-stone-200">
            <ShareBar title={article.title} slug={article.slug} articleId={article.id} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
