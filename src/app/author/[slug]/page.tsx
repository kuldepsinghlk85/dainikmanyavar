import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiTimeAgo } from '@/lib/utils';
import { User, MapPin, Feather, CheckCircle, Newspaper } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const author = await db.author.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug }, { name: decodedSlug }],
    },
  });

  if (!author) {
    return { title: 'लेखक प्रोफ़ाइल | दैनिक मान्यवर' };
  }

  return {
    title: `${author.name} (स्तंभकार / लेखक) | दैनिक मान्यवर`,
    description: author.bio || `${author.name} के सभी लेख, विश्लेषण और खबरें पढ़ें दैनिक मान्यवर पर।`,
  };
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const author = await db.author.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug }, { name: decodedSlug }],
    },
    include: {
      articles: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 30,
        include: {
          category: true,
        },
      },
    },
  });

  if (!author) {
    notFound();
  }

  const getAuthorTypeLabel = (type?: string) => {
    switch (type) {
      case 'columnist':
        return 'वरिष्ठ स्तंभकार';
      case 'editor':
        return 'संपादक';
      case 'reviewer':
        return 'फिल्म समीक्षक';
      case 'guest_author':
        return 'अतिथि लेखक';
      default:
        return 'संवाददाता / रिपोर्टर';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <TopBar />
      <Header />
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-stone-100 border-4 border-red-50 shadow-md shrink-0">
              <Image
                src={author.photo || '/logo.png'}
                alt={author.name}
                fill
                className="object-cover"
                sizes="128px"
                priority
              />
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-1.5">
                  {author.name}
                  {author.isVerified && (
                    <CheckCircle className="w-5 h-5 text-blue-600 fill-blue-100" />
                  )}
                </h1>
                <span className="bg-stone-100 text-stone-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-stone-200">
                  {getAuthorTypeLabel(author.authorType)}
                </span>
              </div>

              {author.designation && (
                <div className="text-sm font-semibold text-red-600">
                  {author.designation}
                </div>
              )}

              {author.city && (
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{author.city}</span>
                </div>
              )}

              {author.bio && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
                  {author.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Articles Written By Author */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-red-600" />
              {author.name} द्वारा प्रकाशित लेख व खबरें ({author.articles.length})
            </h2>
          </div>

          {author.articles.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-stone-400 text-sm">
              अभी इस लेखक द्वारा कोई प्रकाशित लेख उपलब्ध नहीं है।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {author.articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-44 bg-stone-100 overflow-hidden">
                    <Image
                      src={art.featuredImage || '/logo.png'}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {art.category?.name || 'समाचार'}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <Link href={`/news/${art.slug}`}>
                      <h3 className="font-black text-sm text-stone-900 hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {art.excerpt || art.title}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                      <span>{formatHindiTimeAgo(art.publishedAt)}</span>
                      <Link href={`/news/${art.slug}`} className="text-red-600 font-bold hover:underline">
                        पढ़ें ➔
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
