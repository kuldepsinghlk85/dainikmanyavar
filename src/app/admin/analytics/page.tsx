import React from 'react';
import { db } from '@/lib/db';
import { formatCount } from '@/lib/utils';
import { Eye, Heart, Share2, Volume2, TrendingUp, BarChart3 } from 'lucide-react';

export default async function AnalyticsAdminPage() {
  const [
    totalViews,
    totalLikes,
    totalShares,
    totalListens,
    topArticles,
    topCategories,
  ] = await Promise.all([
    db.article.aggregate({ _sum: { viewCount: true } }),
    db.article.aggregate({ _sum: { likeCount: true } }),
    db.article.aggregate({ _sum: { shareCount: true } }),
    db.article.aggregate({ _sum: { listenCount: true } }),
    db.article.findMany({
      orderBy: { viewCount: 'desc' },
      take: 10,
      include: { category: true },
    }),
    db.category.findMany({
      include: {
        _count: { select: { articles: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">फर्स्ट-पार्टी एनालिटिक्स (Analytics)</h1>
          <p className="text-xs text-stone-500">पाठकों की सहभागिता, व्यूज और ऑडियो सुनने का विस्तृत विश्लेषण</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="bg-orange-500 text-white p-3 rounded-lg"><Eye className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-stone-500 font-bold">कुल व्यूज (Total Views)</p>
            <p className="text-2xl font-extrabold text-stone-900">{formatCount(totalViews._sum.viewCount || 0)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="bg-red-500 text-white p-3 rounded-lg"><Heart className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-stone-500 font-bold">कुल लाइक्स (Likes)</p>
            <p className="text-2xl font-extrabold text-stone-900">{formatCount(totalLikes._sum.likeCount || 0)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="bg-green-500 text-white p-3 rounded-lg"><Share2 className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-stone-500 font-bold">कुल शेयर्स (Shares)</p>
            <p className="text-2xl font-extrabold text-stone-900">{formatCount(totalShares._sum.shareCount || 0)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="bg-purple-500 text-white p-3 rounded-lg"><Volume2 className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-stone-500 font-bold">ऑडियो लिस्टन (Listens)</p>
            <p className="text-2xl font-extrabold text-stone-900">{formatCount(totalListens._sum.listenCount || 0)}</p>
          </div>
        </div>
      </div>

      {/* Top 10 Articles Performance */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-stone-900 mb-4">सर्वाधिक पढ़े गए समाचार (Top 10 Most Viewed)</h3>

        <div className="space-y-3">
          {topArticles.map((art, index) => (
            <div key={art.id} className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-3 max-w-xl">
                <span className="w-6 h-6 bg-[#F97316] text-white text-xs font-bold rounded flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-stone-900 truncate">{art.title}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-stone-500 font-mono">
                <span>👁 {formatCount(art.viewCount)}</span>
                <span>❤ {formatCount(art.likeCount)}</span>
                <span>🔊 {formatCount(art.listenCount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
