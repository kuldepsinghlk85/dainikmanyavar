import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import EpaperFlipbookViewer from '@/components/public/EpaperFlipbookViewer';
import EpaperDateSelector from '@/components/public/EpaperDateSelector';
import { Newspaper, Calendar, Archive, Search, ChevronRight, FileText } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

export default async function EpaperPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; date?: string }>;
}) {
  const { id, date } = await searchParams;

  // 1. Fetch Today's or Targeted Edition
  let selectedEdition: any = null;

  if (id) {
    selectedEdition = await db.epaperEdition.findUnique({
      where: { id },
      include: {
        pages: { orderBy: { pageNumber: 'asc' } },
        ads: { where: { active: true } },
      },
    });
  } else if (date) {
    const targetDate = new Date(date);
    if (!isNaN(targetDate.getTime())) {
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      selectedEdition = await db.epaperEdition.findFirst({
        where: {
          status: 'PUBLISHED',
          editionDate: { gte: startOfDay, lte: endOfDay },
        },
        include: {
          pages: { orderBy: { pageNumber: 'asc' } },
          ads: { where: { active: true } },
        },
      });
    }
  }

  // Fallback to Latest Published Edition
  if (!selectedEdition) {
    selectedEdition = await db.epaperEdition.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { editionDate: 'desc' },
      include: {
        pages: { orderBy: { pageNumber: 'asc' } },
        ads: { where: { active: true } },
      },
    });
  }

  // 2. Fetch Archive Editions (Old Newspapers grouped by Month)
  const archiveEditions = await db.epaperEdition.findMany({
    where: { status: 'PUBLISHED' },
    take: 30,
    orderBy: { editionDate: 'desc' },
    select: {
      id: true,
      title: true,
      editionDate: true,
      editionType: true,
      coverImage: true,
      totalPages: true,
    },
  });

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900">
      <Header />
      <Navigation />

      <main className="wrap my-6 space-y-8 flex-1">
        {/* Page Title & Breadcrumb Header */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-bold mb-1">
              <Link href="/" className="hover:text-[#EA580C]">होम</Link>
              <span>/</span>
              <span className="text-[#EA580C] font-black">आज का अखबार (E-Paper)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <Newspaper className="w-8 h-8 text-[#EA580C]" />
              <span>दैनिक मान्यवर - डिजिटल ई-पेपर (Today's Newspaper)</span>
            </h1>
          </div>

          {/* Quick Date Selector */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 p-2.5 rounded-2xl">
            <Calendar className="w-4 h-4 text-[#EA580C]" />
            <span className="text-xs font-extrabold text-stone-700">तिथि चुनें:</span>
            <EpaperDateSelector defaultDate={selectedEdition ? new Date(selectedEdition.editionDate).toISOString().split('T')[0] : ''} />
          </div>
        </div>

        {/* Digital E-Paper Interactive Flipbook Reader */}
        {selectedEdition ? (
          <EpaperFlipbookViewer edition={selectedEdition} />
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
            <Newspaper className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-extrabold text-stone-800">आज का ई-पेपर उपलब्ध नहीं है</h3>
            <p className="text-xs text-stone-500">कृपया नीचे पुराने अखबार आर्काइव की सूची देखें।</p>
          </div>
        )}

        {/* Archive Section: पुराने अखबार (Historical Editions) */}
        <section className="space-y-4 pt-4 border-t border-stone-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <Archive className="w-5 h-5 text-[#EA580C]" />
              <span>पुराने अखबार (E-Paper Archive)</span>
            </h2>
            <span className="text-xs font-mono text-stone-500">विगत 30 संस्करण</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {archiveEditions.map((item) => {
              const isSelected = selectedEdition?.id === item.id;
              const formattedDate = new Date(item.editionDate).toLocaleDateString('hi-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <Link
                  key={item.id}
                  href={`/epaper?id=${item.id}`}
                  className={`bg-white rounded-2xl border p-3 transition-all hover:shadow-md flex flex-col justify-between space-y-2 group ${
                    isSelected ? 'border-[#EA580C] ring-2 ring-orange-200' : 'border-stone-200'
                  }`}
                >
                  <div className="relative h-36 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                    <img
                      src={item.coverImage || '/uploads/epaper/pages/page_1.png'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/90 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                      {item.totalPages} पेज
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold text-[#EA580C] block">
                      {formattedDate}
                    </span>
                    <h3 className="font-extrabold text-stone-900 text-xs line-clamp-1 group-hover:text-[#EA580C] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
