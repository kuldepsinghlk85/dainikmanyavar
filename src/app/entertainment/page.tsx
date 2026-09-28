import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiTimeAgo } from '@/lib/utils';
import { Film, Star, Sparkles, Tv, Eye, Calendar, Award, ChevronRight } from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'मनोरंजन व बॉलीवुड (Entertainment & Bollywood) | दैनिक मान्यवर',
  description: 'बॉलीवुड की ताज़ा खबरें, मूवी रिव्यू, OTT रिलीज़ और सेलिब्रिटी गपशप पढ़ें दैनिक मान्यवर पर।',
};

export default async function EntertainmentPage() {
  // Fetch movie reviews
  const reviews = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      contentType: 'movie_review',
    },
    take: 12,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
      author: true,
      movieReview: {
        include: {
          movie: true,
        },
      },
    },
  });

  // Fetch entertainment news (category matching manoranjan/entertainment or bollywood)
  const entertainmentNews = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      contentType: { not: 'movie_review' },
      OR: [
        { category: { slug: { in: ['manoranjan', 'entertainment', 'bollywood', 'cinema'] } } },
        { category: { name: { contains: 'मनोरंजन' } } },
      ],
    },
    take: 18,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
      author: true,
    },
  });

  const featuredReview = reviews.find((r) => r.movieReview?.isFeaturedReview) || reviews[0];
  const remainingReviews = reviews.filter((r) => r.id !== featuredReview?.id);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <TopBar />
      <Header />
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        {/* Hub Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-pink-950 to-stone-950 text-white p-6 sm:p-10 shadow-xl border border-purple-900/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              दैनिक मान्यवर मनोरंजन डेस्क
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              बॉलीवुड, सिनेमा व मूवी रिव्यू
            </h1>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              फिल्म समीक्षा, स्टार इंटरव्यू, बॉक्स ऑफिस कलेक्शन और ओटीटी की सबसे विश्वसनीय खबरें।
            </p>
          </div>
        </div>

        {/* Featured Movie Review Section */}
        {featuredReview && featuredReview.movieReview && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                मुख्य मूवी रिव्यू (Featured Review)
              </h2>
              <span className="text-xs text-red-600 font-bold uppercase tracking-wider">
                दैनिक मान्यवर रेटिंग
              </span>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-5 relative h-72 sm:h-96 md:h-auto min-h-[300px] bg-stone-900">
                  <Image
                    src={
                      featuredReview.movieReview.movie.poster ||
                      featuredReview.featuredImage ||
                      'https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={featuredReview.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
                  {featuredReview.movieReview.movie.ottPlatform && (
                    <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5" />
                      {featuredReview.movieReview.movie.ottPlatform}
                    </div>
                  )}
                </div>

                <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full text-amber-700 font-black text-sm">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{featuredReview.movieReview.rating.toFixed(1)} / 5</span>
                      </div>
                      {featuredReview.movieReview.verdict && (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-extrabold">
                          {featuredReview.movieReview.verdict}
                        </span>
                      )}
                    </div>

                    <Link href={`/movie-review/${featuredReview.slug}`}>
                      <h3 className="text-2xl sm:text-3xl font-black text-stone-900 hover:text-red-600 transition-colors leading-tight">
                        {featuredReview.title}
                      </h3>
                    </Link>

                    <p className="text-stone-600 text-sm sm:text-base line-clamp-3 leading-relaxed">
                      {featuredReview.excerpt || 'फिल्म का विस्तृत रिव्यू पढ़ें और जानें कलाकारों की परफॉर्मेंस व निर्देशन का स्तर...'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs text-stone-600 pt-2 border-t border-stone-100">
                      {featuredReview.movieReview.movie.director && (
                        <div>
                          <span className="text-stone-400 font-bold block text-[10px]">निर्देशक:</span>
                          <span className="font-bold text-stone-800">{featuredReview.movieReview.movie.director}</span>
                        </div>
                      )}
                      {featuredReview.movieReview.movie.cast && (
                        <div>
                          <span className="text-stone-400 font-bold block text-[10px]">मुख्य कलाकार:</span>
                          <span className="font-bold text-stone-800 line-clamp-1">{featuredReview.movieReview.movie.cast}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div className="text-xs text-stone-400">
                      {formatHindiTimeAgo(featuredReview.publishedAt)}
                    </div>
                    <Link
                      href={`/movie-review/${featuredReview.slug}`}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                      पूरा रिव्यू पढ़ें <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Reviews Grid */}
        {remainingReviews.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-red-600" />
                नवीनतम फिल्म समीक्षाएं (Latest Reviews)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {remainingReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-48 bg-stone-100 overflow-hidden">
                    <Image
                      src={
                        rev.movieReview?.movie.poster ||
                        rev.featuredImage ||
                        'https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={rev.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {rev.movieReview && (
                      <div className="absolute top-3 right-3 bg-stone-900/90 backdrop-blur-sm text-amber-400 font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.movieReview.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {rev.movieReview?.verdict && (
                      <div className="absolute bottom-3 left-3 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                        {rev.movieReview.verdict}
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/movie-review/${rev.slug}`}>
                        <h3 className="font-extrabold text-sm text-stone-900 hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                          {rev.title}
                        </h3>
                      </Link>
                      {rev.movieReview?.movie.cast && (
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                          स्टार्स: {rev.movieReview.movie.cast}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                      <span>{formatHindiTimeAgo(rev.publishedAt)}</span>
                      <Link
                        href={`/movie-review/${rev.slug}`}
                        className="text-red-600 font-bold hover:underline"
                      >
                        समीक्षा ➔
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bollywood & Entertainment News Feed */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              बॉलीवुड गपशप व मनोरंजन समाचार
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entertainmentNews.map((news) => (
              <div
                key={news.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <Image
                    src={news.featuredImage || '/logo.png'}
                    alt={news.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {news.category?.name || 'मनोरंजन'}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <Link href={`/news/${news.slug}`}>
                    <h3 className="font-extrabold text-sm text-stone-900 hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {news.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {news.excerpt || news.title}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                    <span>{formatHindiTimeAgo(news.publishedAt)}</span>
                    <Link href={`/news/${news.slug}`} className="text-red-600 font-bold hover:underline">
                      पढ़ें ➔
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
