import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatCount } from '@/lib/utils';
import { Newspaper, Eye, Heart, Share2, Volume2, Users, FolderTree, PlusCircle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const [
    totalArticles,
    publishedCount,
    draftCount,
    categoryCount,
    tagCount,
    userCount,
    recentArticles,
    viewsAggregate,
    likesAggregate,
    sharesAggregate,
    listensAggregate,
  ] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { status: 'PUBLISHED' } }),
    db.article.count({ where: { status: 'DRAFT' } }),
    db.category.count(),
    db.tag.count(),
    db.user.count(),
    db.article.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: true, author: true },
    }),
    db.article.aggregate({ _sum: { viewCount: true } }),
    db.article.aggregate({ _sum: { likeCount: true } }),
    db.article.aggregate({ _sum: { shareCount: true } }),
    db.article.aggregate({ _sum: { listenCount: true } }),
  ]);

  const stats = [
    { label: 'कुल समाचार (Total)', value: totalArticles, icon: Newspaper, color: 'bg-blue-500' },
    { label: 'प्रकाशित (Published)', value: publishedCount, icon: Newspaper, color: 'bg-green-500' },
    { label: 'कुल व्यूज (Total Views)', value: formatCount(viewsAggregate._sum.viewCount || 0), icon: Eye, color: 'bg-orange-500' },
    { label: 'ऑडियो श्रोता (Listens)', value: formatCount(listensAggregate._sum.listenCount || 0), icon: Volume2, color: 'bg-purple-500' },
    { label: 'कुल लाइक्स (Likes)', value: formatCount(likesAggregate._sum.likeCount || 0), icon: Heart, color: 'bg-red-500' },
    { label: 'कुल शेयर्स (Shares)', value: formatCount(sharesAggregate._sum.shareCount || 0), icon: Share2, color: 'bg-teal-500' },
    { label: 'श्रेणियां (Categories)', value: categoryCount, icon: FolderTree, color: 'bg-amber-500' },
    { label: 'एडमिन यूजर्स (Users)', value: userCount, icon: Users, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">एडमिन डैशबोर्ड</h1>
          <p className="text-xs text-stone-500">दैनिक मान्यवर समाचार पोर्टल का संपूर्ण ओवरव्यू</p>
        </div>
        <Link
          href="/admin/news/new"
          className="bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>नया समाचार प्रकाशित करें</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className={`${s.color} text-white p-3 rounded-lg flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-semibold">{s.label}</p>
                <p className="text-xl font-extrabold text-stone-900 mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-sm">हाल ही में जोड़े गए समाचार</h3>
          <Link href="/admin/news" className="text-xs text-[#EA580C] font-semibold hover:underline">
            सभी देखें →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
              <tr>
                <th className="p-3">शीर्षक (Headline)</th>
                <th className="p-3">श्रेणी</th>
                <th className="p-3">स्थिति</th>
                <th className="p-3">व्यूज</th>
                <th className="p-3">तारीख</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentArticles.map((art) => (
                <tr key={art.id} className="hover:bg-stone-50">
                  <td className="p-3 font-semibold text-stone-900 max-w-md truncate">{art.title}</td>
                  <td className="p-3"><span className="bg-orange-100 text-[#C2410C] px-2 py-0.5 rounded text-[11px] font-bold">{art.category.name}</span></td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${art.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {art.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{formatCount(art.viewCount)}</td>
                  <td className="p-3 text-stone-400">{new Date(art.createdAt).toLocaleDateString('hi-IN')}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/news/${art.id}`} className="text-blue-600 hover:underline font-bold">
                      संपादित करें
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
