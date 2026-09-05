import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import {
  Target,
  DownloadCloud,
  FileEdit,
  Sliders,
  Flame,
  Smartphone,
  Inbox,
  Radio,
  Newspaper,
  CheckCircle2,
  Clock,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Eye,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditorDeskPage() {
  const session = await getAdminSession();
  const isSuperAdmin = session?.role === 'SUPER_ADMIN' || session?.role === 'ADMINISTRATOR';

  // Fetch live editorial data in parallel
  const [
    pendingImports,
    externalFeeds,
    draftArticles,
    sliderStories,
    breakingTickers,
    homepageSections,
    recentPublished,
  ] = await Promise.all([
    // 1. Downloaded news pending in import inbox
    db.newsImportItem.findMany({
      where: { status: 'PENDING' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { source: true },
    }),
    // 2. Special external feeds
    db.externalSpecialFeedItem.findMany({
      where: { status: 'NEW' },
      take: 4,
      orderBy: { fetchedAt: 'desc' },
    }),
    // 3. Draft articles to review & edit
    db.article.findMany({
      where: { status: 'DRAFT' },
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: { category: true },
    }),
    // 4. Hero Slider stories
    db.article.findMany({
      where: { isMainStory: true, status: 'PUBLISHED' },
      take: 5,
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true, slug: true, featuredImage: true, publishedAt: true },
    }),
    // 5. Breaking tickers
    db.breakingNews.findMany({
      where: { active: true },
      take: 5,
      orderBy: { priority: 'desc' },
      include: { article: { select: { title: true, slug: true } } },
    }),
    // 6. Homepage widgets status
    db.homepageSection.findMany({
      take: 8,
      orderBy: { order: 'asc' },
    }),
    // 7. Recent published news
    db.article.findMany({
      where: { status: 'PUBLISHED' },
      take: 5,
      orderBy: { publishedAt: 'desc' },
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      {isSuperAdmin ? (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  सुपर एडमिन ओवरसाइट मोड (Super Admin Oversight)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black mt-0.5 leading-tight">
                संपादक कार्यक्षेत्र एवं लेआउट डिस्प्ले मॉनिटर
              </h2>
              <p className="text-xs text-orange-100 mt-0.5">
                आप एडिटर द्वारा डाउनलोड की गई खबरों, ड्राफ्ट्स, मुख्य स्लाइडर, टिकर व सभी लेआउट सेटिंग्स की सीधी निगरानी व प्रबंधन कर रहे हैं।
              </p>
            </div>
          </div>

          <Link
            href="/admin/settings"
            className="hidden sm:inline-flex px-3.5 py-2 bg-white text-orange-800 hover:bg-orange-50 font-black text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            ⚙️ कोर सेटिंग्स देखें
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#EA580C] via-orange-600 to-amber-600 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  संपादक कार्यक्षेत्र (Editorial Desk)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black mt-0.5 leading-tight">
                समाचार डाउनलोड, संपादन, लेआउट व डिस्प्ले सेटिंग्स
              </h2>
              <p className="text-xs text-orange-100 mt-0.5">
                फ़ीड्स से खबरें डाउनलोड करें, संपादित करें और मुख्य स्लाइडर, टिकर व मोबाइल ऐप पर पाठकों के लिए प्रदर्शित करें।
              </p>
            </div>
          </div>

          <Link
            href="/admin/news/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-white text-orange-800 hover:bg-orange-50 font-black text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नया समाचार जोड़ें</span>
          </Link>
        </div>
      )}

      {/* Editorial Workflow Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Link
          href="/admin/importer/inbox"
          className="bg-white p-3.5 rounded-2xl shadow-xs border border-stone-200 hover:border-[#EA580C] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase">डाउनलोड इनबॉक्स</span>
            <Inbox className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-xl font-black text-stone-900 mt-1 font-mono">{pendingImports.length}</h3>
          <p className="text-[10px] text-blue-600 font-bold mt-0.5">नए इनपुट उपलब्ध</p>
        </Link>

        <Link
          href="/admin/news?status=DRAFT"
          className="bg-white p-3.5 rounded-2xl shadow-xs border border-stone-200 hover:border-[#EA580C] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase">ड्राफ्ट समीक्षा</span>
            <FileEdit className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-xl font-black text-stone-900 mt-1 font-mono">{draftArticles.length}</h3>
          <p className="text-[10px] text-amber-600 font-bold mt-0.5">संपादन व सेटिंग हेतु</p>
        </Link>

        <Link
          href="/admin/slider"
          className="bg-white p-3.5 rounded-2xl shadow-xs border border-stone-200 hover:border-[#EA580C] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase">मुख्य स्लाइडर सेट</span>
            <Sparkles className="w-4 h-4 text-[#EA580C] group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-xl font-black text-[#EA580C] mt-1 font-mono">{sliderStories.length}</h3>
          <p className="text-[10px] text-orange-600 font-bold mt-0.5">टॉप लीड स्टोरीज़</p>
        </Link>

        <Link
          href="/admin/breaking"
          className="bg-white p-3.5 rounded-2xl shadow-xs border border-stone-200 hover:border-[#EA580C] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase">सक्रिय टिकर</span>
            <Flame className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-xl font-black text-red-600 mt-1 font-mono">{breakingTickers.length}</h3>
          <p className="text-[10px] text-red-600 font-bold mt-0.5">ब्रेकिंग न्यूज़ लाइव</p>
        </Link>

        <Link
          href="/admin/mobile-menu"
          className="bg-white p-3.5 rounded-2xl shadow-xs border border-stone-200 hover:border-[#EA580C] transition-all group col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase">मोबाइल ऐप मेनू</span>
            <Smartphone className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-xl font-black text-purple-700 mt-1 font-mono">सक्रिय</h3>
          <p className="text-[10px] text-purple-600 font-bold mt-0.5">बटन सेटिंग्स ऑन</p>
        </Link>
      </div>

      {/* 3-Pillar Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PILLAR 1: NEWS DOWNLOAD & INBOX (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-blue-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-4 h-4 text-blue-700" />
                <h3 className="font-black text-xs text-blue-950 uppercase tracking-wider">
                  1. न्यूज़ डाउनलोड एवं इनबॉक्स
                </h3>
              </div>
              <Link
                href="/admin/importer/inbox"
                className="text-[11px] font-bold text-blue-700 hover:underline"
              >
                सभी देखें →
              </Link>
            </div>

            <div className="p-3 space-y-2.5 text-xs">
              {pendingImports.length === 0 ? (
                <div className="py-8 text-center text-stone-400">
                  <Inbox className="w-8 h-8 mx-auto mb-1 text-stone-300" />
                  <p className="font-bold">इनबॉक्स में कोई लंबित खबर नहीं है।</p>
                </div>
              ) : (
                pendingImports.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-stone-100 hover:border-blue-200 bg-stone-50/50 hover:bg-blue-50/20 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] text-stone-400 mb-1">
                      <span className="font-bold text-blue-700 truncate">{item.source?.name || 'RSS फ़ीड'}</span>
                      <span>{new Date(item.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="font-bold text-stone-900 line-clamp-2 leading-tight">
                      {item.originalTitle}
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/importer/inbox`}
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-md shadow-xs"
                      >
                        एडिट व इम्पोर्ट करें
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
              <Link
                href="/admin/rss/sources"
                className="font-bold text-stone-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>RSS स्रोत लाइब्रेरी</span>
              </Link>
              <Link
                href="/admin/external-content/inbox"
                className="font-bold text-stone-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>विशेष फ़ीड्स</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* PILLAR 2: REVIEW & DRAFTS (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-amber-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-700" />
                <h3 className="font-black text-xs text-amber-950 uppercase tracking-wider">
                  2. समीक्षा, संपादन व तैयारी
                </h3>
              </div>
              <Link
                href="/admin/news?status=DRAFT"
                className="text-[11px] font-bold text-amber-700 hover:underline"
              >
                सभी ड्राफ्ट्स ({draftArticles.length}) →
              </Link>
            </div>

            <div className="p-3 space-y-2.5 text-xs">
              {draftArticles.length === 0 ? (
                <div className="py-8 text-center text-stone-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-green-500" />
                  <p className="font-bold">सभी ड्राफ्ट्स प्रकाशित / सेट किए जा चुके हैं!</p>
                </div>
              ) : (
                draftArticles.map((art) => (
                  <div
                    key={art.id}
                    className="p-2.5 rounded-xl border border-stone-100 hover:border-amber-200 bg-stone-50/50 hover:bg-amber-50/20 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] text-stone-400 mb-1">
                      <span className="font-bold text-amber-700">{art.category?.name || 'अवर्गीकृत'}</span>
                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">DRAFT</span>
                    </div>
                    <p className="font-bold text-stone-900 line-clamp-2 leading-tight">
                      {art.title}
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/news/${art.id}`}
                        className="px-2.5 py-1 bg-[#EA580C] hover:bg-orange-700 text-white font-bold text-[10px] rounded-md shadow-xs flex items-center gap-1"
                      >
                        <FileEdit className="w-3 h-3" />
                        <span>संपादित करें & सेट करें</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
              <Link
                href="/admin/news"
                className="font-bold text-stone-600 hover:text-[#EA580C] flex items-center gap-1"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>सभी समाचार सूची</span>
              </Link>
              <Link
                href="/admin/news/new"
                className="font-bold text-[#EA580C] hover:underline flex items-center gap-1"
              >
                <span>नया जोड़ें +</span>
              </Link>
            </div>
          </div>
        </div>

        {/* PILLAR 3: DISPLAY & STAGING SETTINGS (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-orange-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#EA580C]" />
                <h3 className="font-black text-xs text-orange-950 uppercase tracking-wider">
                  3. लेआउट एवं डिस्प्ले सेटिंग्स
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                लाइव पोर्टल
              </span>
            </div>

            <div className="p-3 space-y-3 text-xs">
              {/* Slider Control Block */}
              <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>मुख्य स्लाइडर (Hero Slider)</span>
                  </span>
                  <Link
                    href="/admin/slider"
                    className="text-[10px] font-bold text-[#EA580C] bg-white px-2 py-0.5 rounded border border-orange-200 hover:bg-orange-100"
                  >
                    सेटिंग्स बदलें →
                  </Link>
                </div>
                <p className="text-[11px] text-stone-600">
                  वर्तमान में <strong>{sliderStories.length}</strong> मुख्य खबरें पोर्टल के टॉप स्लाइडर पर सेट हैं।
                </p>
                <div className="space-y-1">
                  {sliderStories.slice(0, 2).map((s, idx) => (
                    <p key={s.id} className="text-[10px] text-stone-700 truncate">
                      • <span className="font-bold">#{idx + 1}:</span> {s.title}
                    </p>
                  ))}
                </div>
              </div>

              {/* Breaking Ticker Control Block */}
              <div className="p-3 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-stone-900 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-600" />
                    <span>ब्रेकिंग टिकर (Breaking Ticker)</span>
                  </span>
                  <Link
                    href="/admin/breaking"
                    className="text-[10px] font-bold text-red-700 bg-white px-2 py-0.5 rounded border border-red-200 hover:bg-red-100"
                  >
                    टिकर सेट करें →
                  </Link>
                </div>
                <p className="text-[11px] text-stone-600">
                  वर्तमान में <strong>{breakingTickers.length}</strong> ब्रेकिंग हेडलाइंस स्क्रीन पर चल रही हैं।
                </p>
              </div>

              {/* Mobile Menu & Homepage Widgets */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/admin/mobile-menu"
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-purple-300 bg-stone-50 hover:bg-purple-50/30 text-center transition-colors block"
                >
                  <Smartphone className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <p className="font-bold text-[11px] text-stone-900">मोबाइल ऐप मेनू</p>
                  <p className="text-[9px] text-stone-400">बटन ऑन/ऑफ</p>
                </Link>

                <Link
                  href="/admin/homepage"
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-orange-300 bg-stone-50 hover:bg-orange-50/30 text-center transition-colors block"
                >
                  <Sliders className="w-4 h-4 text-[#EA580C] mx-auto mb-1" />
                  <p className="font-bold text-[11px] text-stone-900">होमपेज विगेट्स</p>
                  <p className="text-[9px] text-stone-400">क्रम व लेआउट</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
