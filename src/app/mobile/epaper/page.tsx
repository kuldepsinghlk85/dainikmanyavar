import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import MobileFooter from '@/components/mobile/MobileFooter';
import EpaperFlipbookViewer from '@/components/public/EpaperFlipbookViewer';
import EpaperDateSelector from '@/components/public/EpaperDateSelector';
import { Newspaper, Calendar, Archive, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MobileEpaperPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; date?: string }>;
}) {
  const { id, date } = await searchParams;

  // 1. Fetch Targeted or Latest Edition
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

  // Fallback to latest published edition
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

  // 2. Fetch recent archive editions
  const archiveEditions = await db.epaperEdition.findMany({
    where: { status: 'PUBLISHED' },
    take: 12,
    orderBy: { editionDate: 'desc' },
    select: {
      id: true,
      title: true,
      editionDate: true,
      coverImage: true,
      totalPages: true,
    },
  });

  return (
    <div className="bg-stone-100 dark:bg-[#0D0D0D] min-h-screen flex flex-col pb-16 transition-colors">
      <MobileHeader />

      {/* Sub-header Navigation */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414]">
        <Link
          href="/mobile"
          className="flex items-center gap-1.5 text-xs font-black text-stone-700 dark:text-stone-300 hover:text-[#EA580C]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ</span>
        </Link>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
          <EpaperDateSelector
            defaultDate={
              selectedEdition ? new Date(selectedEdition.editionDate).toISOString().split('T')[0] : ''
            }
          />
        </div>
      </div>

      {/* Main Epaper Reader */}
      <main className="p-2 sm:p-4 space-y-4 flex-1 max-w-lg mx-auto w-full">
        {selectedEdition ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h1 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-[#EA580C]" />
                <span>{selectedEdition.title}</span>
              </h1>
              <span className="text-[11px] font-bold text-stone-500 font-mono">
                {new Date(selectedEdition.editionDate).toLocaleDateString('hi-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <EpaperFlipbookViewer edition={selectedEdition} />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-2 my-6">
            <Newspaper className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
              आज का ई-पेपर उपलब्ध नहीं है
            </h3>
            <p className="text-xs text-stone-500">कृपया नीचे दिए गए पिछले संस्करणों में से चुनें।</p>
          </div>
        )}

        {/* Previous Editions Archive */}
        {archiveEditions.length > 0 && (
          <section className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>पुराने अखबार (E-Paper Archive)</span>
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              {archiveEditions.map((item) => {
                const isSelected = selectedEdition?.id === item.id;
                const formattedDate = new Date(item.editionDate).toLocaleDateString('hi-IN', {
                  day: '2-digit',
                  month: 'short',
                });

                return (
                  <Link
                    key={item.id}
                    href={`/mobile/epaper?id=${item.id}`}
                    className={`block rounded-xl overflow-hidden border p-1.5 transition-all text-center ${
                      isSelected
                        ? 'border-[#EA580C] bg-orange-50/50 dark:bg-orange-950/20 ring-1 ring-[#EA580C]'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] hover:border-stone-300'
                    }`}
                  >
                    <div className="aspect-[3/4] bg-stone-200 dark:bg-stone-800 rounded-lg overflow-hidden relative mb-1.5">
                      <img
                        src={item.coverImage || '/uploads/epaper/pages/page_1.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-[11px] font-black text-stone-800 dark:text-stone-200 leading-tight">
                      {formattedDate}
                    </p>
                    <p className="text-[9px] text-stone-500 font-mono">{item.totalPages} पेज</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <MobileFooter />
      <MobileBottomNav />
    </div>
  );
}
