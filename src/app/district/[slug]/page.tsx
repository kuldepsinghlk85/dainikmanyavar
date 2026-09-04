import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiTimeAgo, formatCount } from '@/lib/utils';
import { MapPin, Newspaper, ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const location = await db.location.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { name: decodedSlug },
      ],
    },
  });

  if (!location) {
    return {
      title: 'जिले की ख़बरें | दैनिक मान्यवर',
      description: 'उत्तर प्रदेश के सभी जिलों की ताज़ा ख़बरें पढ़ें।',
    };
  }

  return {
    title: `${location.name} जिले की ताज़ा ख़बरें और समाचार | दैनिक मान्यवर`,
    description: `${location.name} जिले से जुड़ी सभी ताज़ा ख़बरें, ब्रेकिंग न्यूज़, ग्राउंड रिपोर्ट और घटनाएं पढ़ें दैनिक मान्यवर पर।`,
  };
}

export default async function DistrictNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // Find location by slug or name
  const location = await db.location.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { name: decodedSlug },
      ],
    },
  });

  if (!location) {
    notFound();
  }

  // Fetch all other locations for quick switching
  const allLocations = await db.location.findMany({
    orderBy: { name: 'asc' },
  });

  // Fetch published articles for this district
  const articles = await db.article.findMany({
    where: {
      locationId: location.id,
      status: 'PUBLISHED',
    },
    orderBy: { publishedAt: 'desc' },
    take: 40,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  const formattedArticles = articles.map((a) => ({
    ...a,
    tags: a.tags.map((t) => t.tag),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-6 flex-1 space-y-6">
        {/* District Header */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#F97316] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-[#EA580C]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
                    {location.name} समाचार
                  </h1>
                  <span className="text-xs font-bold bg-orange-50 text-[#EA580C] px-2.5 py-1 rounded-full border border-orange-200">
                    जिला
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  दैनिक मान्यवर संवाददाता नेटवर्क | {location.name} व आस-पास के क्षेत्रों की ताज़ा रिपोर्ट
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full border border-stone-200 font-mono">
                कुल {formattedArticles.length} ख़बरें
              </span>
              <Link
                href="/"
                className="text-xs font-semibold text-stone-600 hover:text-[#EA580C] flex items-center gap-1 bg-stone-100 hover:bg-orange-50 px-3 py-1.5 rounded-full border border-stone-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                मुख्य पृष्ठ
              </Link>
            </div>
          </div>

          {/* Quick District Navigation Bar */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              अन्य जिले चुनें:
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {allLocations.map((loc) => {
                const isActive = loc.id === location.id;
                return (
                  <Link
                    key={loc.id}
                    href={`/district/${loc.slug}`}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-white hover:border-orange-300'
                    }`}
                  >
                    📍 {loc.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty State if No Articles */}
        {formattedArticles.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 bg-orange-100 text-[#EA580C] rounded-full flex items-center justify-center mx-auto">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {location.name} जिले के लिए अभी कोई विशेष समाचार नहीं है
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              हमारे ब्यूरो रिपोर्टर इस जिले से जुड़ी ताज़ा जानकारियां जल्द ही साझा करेंगे। कृपया तब तक प्रदेश के अन्य जिलों के समाचार देखें।
            </p>
            <div className="pt-2">
              <Link
                href="/category/latest"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                ताज़ा मुख्य समाचार देखें →
              </Link>
            </div>
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {formattedArticles.map((art) => (
              <article
                key={art.id}
                className="border border-stone-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-full h-[200px] bg-stone-100 overflow-hidden">
                    <Image
                      src={art.featuredImage || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=700&q=80'}
                      alt={art.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                      {art.category && (
                        <span className="text-[10px] font-black bg-[#EA580C] text-white px-2.5 py-0.5 rounded shadow-sm">
                          {art.category.name}
                        </span>
                      )}
                      <span className="text-[10px] font-bold bg-white/95 text-stone-800 px-2 py-0.5 rounded border border-stone-200 shadow-sm">
                        📍 {location.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <Link href={`/news/${art.slug}`}>
                      <h3 className="text-base font-extrabold text-stone-900 leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors">
                        {art.title}
                      </h3>
                    </Link>
                    {art.excerpt && (
                      <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-3 text-xs text-stone-400 flex justify-between border-t border-stone-100 pt-2 font-mono">
                  <span>{formatHindiTimeAgo(art.publishedAt)}</span>
                  <span>👁 {formatCount(art.viewCount)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
