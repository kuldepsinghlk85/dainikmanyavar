import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiDate, formatHindiTimeAgo } from '@/lib/utils';
import { Feather, BookOpen, User, Quote, ChevronRight } from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'संपादकीय व विचार (Editorial & Opinions) | दैनिक मान्यवर',
  description: 'दैनिक मान्यवर का वैचारिक मंच — देश, समाज, राजनीति और अर्थव्यवस्था पर गहन संपादकीय और स्वतंत्र विचार।',
};

export default async function EditorialPage() {
  const editorials = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      contentType: { in: ['editorial', 'opinion', 'explainer', 'feature'] },
    },
    take: 24,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
      author: true,
    },
  });

  const leadEditorial = editorials[0];
  const otherEditorials = editorials.slice(1);

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'editorial':
        return { label: 'संपादकीय', bg: 'bg-stone-900 text-stone-100' };
      case 'opinion':
        return { label: 'राय व विचार', bg: 'bg-blue-900 text-blue-100' };
      case 'explainer':
        return { label: 'व्याख्या / विश्लेषण', bg: 'bg-emerald-900 text-emerald-100' };
      case 'feature':
        return { label: 'विशेष लेख', bg: 'bg-purple-900 text-purple-100' };
      default:
        return { label: 'विचार', bg: 'bg-stone-800 text-white' };
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-serif">
      <TopBar />
      <Header />
      <Navigation />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* Editorial Section Header */}
        <div className="border-b-2 border-stone-800 pb-4 text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-red-700 text-xs font-sans font-bold uppercase tracking-widest">
            <Feather className="w-4 h-4" />
            दैनिक मान्यवर वैचारिक मंच
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight font-serif">
            संपादकीय, राय व विश्लेषण
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto font-sans leading-relaxed">
            सुलगते मुद्दों पर निष्पक्ष टिप्पणी, प्रबुद्ध विचारकों के लेख और समसामयिक विषयों का गहन विश्लेषण।
          </p>
        </div>

        {/* Lead Editorial Story */}
        {leadEditorial && (
          <section className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-sans font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  getBadgeLabel(leadEditorial.contentType).bg
                }`}
              >
                {getBadgeLabel(leadEditorial.contentType).label}
              </span>
              <span className="text-xs font-sans text-stone-500">
                {formatHindiDate(leadEditorial.publishedAt)}
              </span>
            </div>

            <Link href={`/news/${leadEditorial.slug}`}>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-950 hover:text-red-700 transition-colors leading-tight">
                {leadEditorial.title}
              </h2>
            </Link>

            <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-sans line-clamp-3">
              {leadEditorial.excerpt || 'संपादकीय का पूरा विवरण पढ़ें...'}
            </p>

            {/* Author Byline */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 font-sans">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-stone-200 border-2 border-stone-300">
                  <Image
                    src={leadEditorial.author?.photo || '/logo.png'}
                    alt={leadEditorial.author?.name || 'संपादक'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900">
                    {leadEditorial.author?.name || 'संपादकीय डेस्क'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {leadEditorial.author?.designation || 'वरिष्ठ स्तंभकार'}
                  </div>
                </div>
              </div>

              <Link
                href={`/news/${leadEditorial.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                विस्तृत पढ़ें <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Editorial Articles Grid */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
            <BookOpen className="w-5 h-5 text-stone-800" />
            <h3 className="text-xl font-black text-stone-900 font-serif">अन्य प्रमुख लेख व विचार</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            {otherEditorials.map((item) => {
              const badge = getBadgeLabel(item.contentType);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-stone-400">{formatHindiTimeAgo(item.publishedAt)}</span>
                    </div>

                    <Link href={`/news/${item.slug}`}>
                      <h4 className="font-black text-base text-stone-900 hover:text-red-700 transition-colors line-clamp-2 leading-snug font-serif">
                        {item.title}
                      </h4>
                    </Link>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {item.excerpt || item.title}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-stone-100 overflow-hidden relative shrink-0">
                        <Image
                          src={item.author?.photo || '/logo.png'}
                          alt={item.author?.name || 'लेखक'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-bold text-stone-800 line-clamp-1">
                        {item.author?.name || 'दैनिक मान्यवर ब्यूरो'}
                      </span>
                    </div>
                    <Link href={`/news/${item.slug}`} className="text-red-700 font-bold hover:underline shrink-0">
                      पढ़ें ➔
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
