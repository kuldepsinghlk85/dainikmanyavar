import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatCount } from '@/lib/utils';
import { getAdminSession } from '@/lib/auth';
import {
  Newspaper,
  Eye,
  Heart,
  Share2,
  Volume2,
  Users,
  FolderTree,
  PlusCircle,
  ShieldCheck,
  Edit3,
  DownloadCloud,
  Flame,
  Sliders,
  Settings,
  ArrowRight,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const isSuperAdmin = session?.role === 'SUPER_ADMIN' || session?.role === 'ADMINISTRATOR';

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
    pendingRssCount,
    breakingCount,
    portalUsersCount,
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
    db.newsImportItem.count({ where: { status: 'NEW' } }).catch(() => 0),
    db.breakingNews.count({ where: { active: true } }).catch(() => 0),
    db.portalUser.count().catch(() => 0),
  ]);

  const stats = [
    { label: 'कुल समाचार (Total)', value: totalArticles, icon: Newspaper, color: 'bg-blue-500' },
    { label: 'प्रकाशित (Published)', value: publishedCount, icon: Newspaper, color: 'bg-green-500' },
    { label: 'कुल व्यूज (Total Views)', value: formatCount(viewsAggregate._sum.viewCount || 0), icon: Eye, color: 'bg-orange-500' },
    { label: 'ऑडियो श्रोता (Listens)', value: formatCount(listensAggregate._sum.listenCount || 0), icon: Volume2, color: 'bg-purple-500' },
    { label: 'कुल लाइक्स (Likes)', value: formatCount(likesAggregate._sum.likeCount || 0), icon: Heart, color: 'bg-red-500' },
    { label: 'कुल शेयर्स (Shares)', value: formatCount(sharesAggregate._sum.shareCount || 0), icon: Share2, color: 'bg-teal-500' },
    { label: 'श्रेणियां (Categories)', value: categoryCount, icon: FolderTree, color: 'bg-amber-500' },
    { label: isSuperAdmin ? 'पोर्टल पाठक (Users)' : 'ड्राफ्ट समाचार', value: isSuperAdmin ? portalUsersCount : draftCount, icon: Users, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900">एडमिन डैशबोर्ड</h1>
            <span
              className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                isSuperAdmin
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}
            >
              {isSuperAdmin ? '👑 सुपर एडमिन पैनल' : '✍️ समाचार संपादक पैनल'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            दैनिक मान्यवर समाचार पोर्टल का संपूर्ण ओवरव्यू एवं नियंत्रण
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/editor"
            className="bg-stone-900 hover:bg-black text-white px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>{isSuperAdmin ? 'संपादक डेस्क ओवरसाइट' : 'संपादक कार्यक्षेत्र'}</span>
          </Link>
          <Link
            href="/admin/news/new"
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नया समाचार जोड़ें</span>
          </Link>
        </div>
      </div>

      {/* Role-specific Action Hub */}
      {isSuperAdmin ? (
        <div className="bg-gradient-to-r from-orange-500 via-[#EA580C] to-red-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                <span>सुपर एडमिन कंट्रोल एवं एडिटर ओवरसाइट (Super Admin Oversight)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                नमस्ते, {session?.name || 'सुपर एडमिन'} जी!
              </h2>
              <p className="text-xs sm:text-sm text-orange-100 max-w-2xl mt-1 leading-relaxed">
                पोर्टल की मेजर सेटिंग्स, पाठक डेटाबेस और स्टाफ रोल्स आपके पूर्ण अधिकार में हैं। इसके अतिरिक्त संपादक के कार्यों (RSS डाउनलोड, ड्राफ्ट समीक्षा, ब्रेकिंग टिकर व स्लाइडर) की लाइव निगरानी और प्रबंधन नीचे से करें:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/editor"
                className="bg-white text-[#EA580C] hover:bg-orange-50 font-black px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>संपादक डेस्क ओवरसाइट</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/admin/settings"
                className="bg-black/30 hover:bg-black/40 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Settings className="w-4 h-4" />
                <span>मेजर सेटिंग्स</span>
              </Link>
              <Link
                href="/admin/users"
                className="bg-black/30 hover:bg-black/40 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>स्टाफ रोल्स</span>
              </Link>
            </div>
          </div>

          {/* Live Editorial Pipeline Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/20">
            <Link
              href="/admin/importer/inbox"
              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl backdrop-blur-xs transition-colors flex items-center gap-2.5"
            >
              <div className="p-2 bg-blue-500/80 rounded-lg">
                <DownloadCloud className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-orange-100 font-medium">RSS इनबॉक्स पेंडिंग</p>
                <p className="text-base font-black leading-none mt-0.5">{pendingRssCount} समाचार</p>
              </div>
            </Link>

            <Link
              href="/admin/news?status=DRAFT"
              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl backdrop-blur-xs transition-colors flex items-center gap-2.5"
            >
              <div className="p-2 bg-amber-500/80 rounded-lg">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-orange-100 font-medium">ड्राफ्ट (समीक्षा प्रतीक्षारत)</p>
                <p className="text-base font-black leading-none mt-0.5">{draftCount} समाचार</p>
              </div>
            </Link>

            <Link
              href="/admin/breaking"
              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl backdrop-blur-xs transition-colors flex items-center gap-2.5"
            >
              <div className="p-2 bg-red-500/80 rounded-lg">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-orange-100 font-medium">लाइव ब्रेकिंग टिकर</p>
                <p className="text-base font-black leading-none mt-0.5">{breakingCount} सक्रिय</p>
              </div>
            </Link>

            <Link
              href="/admin/slider"
              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl backdrop-blur-xs transition-colors flex items-center gap-2.5"
            >
              <div className="p-2 bg-purple-500/80 rounded-lg">
                <Sliders className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-orange-100 font-medium">स्लाइडर एवं लेआउट</p>
                <p className="text-base font-black leading-none mt-0.5">होमपेज डिस्प्ले</p>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-2xl p-5 text-white shadow-lg border border-stone-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Edit3 className="w-4 h-4" />
                <span>समाचार संपादक कार्यक्षेत्र (News Editorial Desk)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                स्वागत है, {session?.name || 'संपादक'} जी!
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-1 leading-relaxed">
                समाचार डाउनलोड करने, एडिट/समीक्षा करने, ब्रेकिंग टिकर सेट करने और मुख्य पृष्ठ स्लाइडर लेआउट व्यवस्थित करने के लिए त्वरित टूल्स:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/editor"
                className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>पूर्ण संपादक डेस्क खोलें</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-700">
            <Link
              href="/admin/importer/inbox"
              className="bg-stone-800/80 hover:bg-stone-800 p-2.5 rounded-xl border border-stone-700 transition-colors flex items-center gap-2.5"
            >
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <DownloadCloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-stone-400 font-medium">1. RSS डाउनलोड इनबॉक्स</p>
                <p className="text-xs font-bold text-white mt-0.5">{pendingRssCount} नए समाचार</p>
              </div>
            </Link>

            <Link
              href="/admin/news?status=DRAFT"
              className="bg-stone-800/80 hover:bg-stone-800 p-2.5 rounded-xl border border-stone-700 transition-colors flex items-center gap-2.5"
            >
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-stone-400 font-medium">2. ड्राफ्ट समीक्षा</p>
                <p className="text-xs font-bold text-white mt-0.5">{draftCount} समीक्षा हेतु</p>
              </div>
            </Link>

            <Link
              href="/admin/breaking"
              className="bg-stone-800/80 hover:bg-stone-800 p-2.5 rounded-xl border border-stone-700 transition-colors flex items-center gap-2.5"
            >
              <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-stone-400 font-medium">3. ब्रेकिंग न्यूज़ टिकर</p>
                <p className="text-xs font-bold text-white mt-0.5">{breakingCount} टिकर सक्रिय</p>
              </div>
            </Link>

            <Link
              href="/admin/slider"
              className="bg-stone-800/80 hover:bg-stone-800 p-2.5 rounded-xl border border-stone-700 transition-colors flex items-center gap-2.5"
            >
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-stone-400 font-medium">4. मुख्य स्लाइडर व मेनू</p>
                <p className="text-xs font-bold text-white mt-0.5">कंटेंट डिस्प्ले</p>
              </div>
            </Link>
          </div>
        </div>
      )}

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
              {recentArticles.map((art: any) => (
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
