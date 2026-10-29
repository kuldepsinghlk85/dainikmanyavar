'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  Globe,
  FileText,
  BadgeAlert,
  XCircle,
  Eye,
  Edit3,
  Search,
  Camera,
  Loader2,
  MapPin,
  ExternalLink,
  Monitor,
  Flame,
  ChevronRight,
} from 'lucide-react';
import PortalLatestNewsFeed from '@/components/reporter/PortalLatestNewsFeed';

interface ReporterProfile {
  id: string;
  reporterId: string;
  fullName: string;
  designation: string;
  district: string | null;
  photo: string | null;
  mobileNumber: string | null;
  bio: string | null;
}

interface Stats {
  total: number;
  pendingReview: number;
  changesRequested: number;
  approved: number;
  published: number;
  rejected: number;
  totalViews: number;
  unreadNotifications: number;
}

interface Submission {
  id: string;
  headline: string;
  subtitle: string | null;
  status: string;
  locationName: string | null;
  featuredImage: string | null;
  createdAt: string;
  editorComment: string | null;
  revisionRequested: boolean;
  category?: {
    name: string;
    nameHi: string;
  } | null;
  article?: {
    id: string;
    slug: string;
    viewCount: number;
    status: string;
  } | null;
}

export default function MobileReporterDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<ReporterProfile | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pendingReview: 0,
    changesRequested: 0,
    approved: 0,
    published: 0,
    rejected: 0,
    totalViews: 0,
    unreadNotifications: 0,
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchDashboardData = async () => {
    try {
      const [meRes, subRes] = await Promise.all([
        fetch('/api/reporter/me'),
        fetch('/api/reporter/submissions'),
      ]);

      const meData = await meRes.json();
      if (!meData.success) {
        router.push('/mobile-reporter/login');
        return;
      }
      setProfile(meData.data.profile);
      if (meData.data.stats) {
        setStats(meData.data.stats);
      }

      const subData = await subRes.json();
      if (subData.success) {
        setSubmissions(subData.data || []);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल फोटो (JPG, PNG, WebP) चुनें');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('फोटो का साइज 5MB से कम होना चाहिए');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const upRes = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.success || !upData.data?.url) {
        throw new Error(upData.error || 'फोटो अपलोड विफल रहा');
      }

      const uploadedUrl = upData.data.url;

      const profRes = await fetch('/api/reporter/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: uploadedUrl }),
      });
      const profData = await profRes.json();
      if (profData.success) {
        setProfile((prev) => (prev ? { ...prev, photo: uploadedUrl } : prev));
      }
    } catch (err: any) {
      alert(err.message || 'फोटो अपडेट करने में समस्या हुई');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700">
            <FileText className="w-2.5 h-2.5" /> ड्राफ्ट
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-2.5 h-2.5" /> समीक्षा लंबित
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-2.5 h-2.5 animate-pulse" /> समीक्षा जारी
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
            <BadgeAlert className="w-2.5 h-2.5 text-orange-600" /> सुधार आवश्यक
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5" /> स्वीकृत
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">
            <Globe className="w-2.5 h-2.5" /> प्रकाशित
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-2.5 h-2.5" /> अस्वीकृत
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeTab === 'PENDING') {
      if (sub.status !== 'SUBMITTED' && sub.status !== 'UNDER_REVIEW') return false;
    } else if (activeTab === 'CHANGES') {
      if (sub.status !== 'CHANGES_REQUESTED') return false;
    } else if (activeTab === 'APPROVED') {
      if (sub.status !== 'APPROVED') return false;
    } else if (activeTab === 'PUBLISHED') {
      if (sub.status !== 'PUBLISHED') return false;
    } else if (activeTab === 'DRAFT') {
      if (sub.status !== 'DRAFT') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHead = sub.headline.toLowerCase().includes(q);
      const matchLoc = sub.locationName?.toLowerCase().includes(q);
      const matchCat = sub.category?.nameHi?.toLowerCase().includes(q);
      return matchHead || matchLoc || matchCat;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. Mobile Reporter Welcome Card with Avatar Upload */}
      <div className="bg-gradient-to-r from-orange-600 via-[#EA580C] to-amber-600 rounded-3xl p-4 text-white shadow-lg shadow-orange-600/15">
        <div className="flex items-center gap-3">
          {/* Avatar with Camera badge */}
          <div className="relative shrink-0">
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div
              onClick={() => photoInputRef.current?.click()}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/50 overflow-hidden flex items-center justify-center cursor-pointer shadow-inner"
              title="फोटो बदलने के लिए टैप करें"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : profile?.photo ? (
                <img src={profile.photo} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black">{profile?.fullName?.slice(0, 1) || 'र'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white text-orange-600 shadow-md border border-orange-200"
              title="फोटो अपलोड करें"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base font-black truncate">{profile?.fullName || 'संवाददाता'}</h2>
              <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono font-bold tracking-wider">
                {profile?.reporterId}
              </span>
            </div>
            <p className="text-xs text-orange-100 font-medium mt-0.5 truncate">
              {profile?.designation || 'संवाददाता'} • {profile?.district || 'उत्तर प्रदेश'}
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[10px]">
              <span className="bg-black/20 px-2 py-0.5 rounded-full font-bold">
                कुल खबरें: {stats.total}
              </span>
              <span className="bg-emerald-950/40 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                प्रकाशित: {stats.published}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Big Touch Action: Send New Story */}
      <Link
        href="/mobile-reporter/news/new"
        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 text-white shadow-lg shadow-orange-600/25 active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-black text-sm">नई खबर भेजें</h3>
            <p className="text-[11px] text-orange-100">बोलकर या लिखकर खबर तुरंत भेजें</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-orange-200" />
      </Link>

      {/* 3. Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`p-2.5 rounded-2xl border transition-all ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : 'bg-white border-stone-200 text-stone-700'
          }`}
        >
          <span className="text-base font-black block leading-none">{stats.pendingReview}</span>
          <span className="text-[10px] font-bold mt-1 block">समीक्षा लंबित</span>
        </button>

        <button
          onClick={() => setActiveTab('CHANGES')}
          className={`p-2.5 rounded-2xl border transition-all ${
            activeTab === 'CHANGES'
              ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
              : 'bg-white border-stone-200 text-stone-700'
          }`}
        >
          <span className="text-base font-black block leading-none">{stats.changesRequested}</span>
          <span className="text-[10px] font-bold mt-1 block">सुधार हेतु</span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`p-2.5 rounded-2xl border transition-all ${
            activeTab === 'APPROVED'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
              : 'bg-white border-stone-200 text-stone-700'
          }`}
        >
          <span className="text-base font-black block leading-none">{stats.approved}</span>
          <span className="text-[10px] font-bold mt-1 block">स्वीकृत</span>
        </button>

        <button
          onClick={() => setActiveTab('PUBLISHED')}
          className={`p-2.5 rounded-2xl border transition-all ${
            activeTab === 'PUBLISHED'
              ? 'bg-green-600 text-white border-green-700 shadow-sm'
              : 'bg-white border-stone-200 text-stone-700'
          }`}
        >
          <span className="text-base font-black block leading-none">{stats.published}</span>
          <span className="text-[10px] font-bold mt-1 block">प्रकाशित</span>
        </button>
      </div>

      {/* 4. Filter Pills & Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="अपनी भेजी गई खबर खोजें..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-orange-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
          {[
            { id: 'ALL', label: `सभी (${stats.total})` },
            { id: 'PENDING', label: `समीक्षा (${stats.pendingReview})` },
            { id: 'CHANGES', label: `सुधार (${stats.changesRequested})` },
            { id: 'APPROVED', label: `स्वीकृत (${stats.approved})` },
            { id: 'PUBLISHED', label: `प्रकाशित (${stats.published})` },
            { id: 'DRAFT', label: 'ड्राफ्ट' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Submissions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-stone-500 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
            <p>खबरें लोड हो रही हैं...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-200 text-stone-500">
            <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-bold">इस फ़िल्टर में कोई खबर नहीं है</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => {
            const dateStr = new Date(sub.createdAt).toLocaleDateString('hi-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs space-y-2.5"
              >
                {/* Header: Status & Date */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(sub.status)}
                  <span className="text-[10px] text-stone-400">{dateStr}</span>
                </div>

                {/* Editor Remark Banner if Changes Requested */}
                {sub.editorComment && sub.status === 'CHANGES_REQUESTED' && (
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-[11px]">
                    <strong className="flex items-center gap-1 text-orange-700 font-bold mb-0.5">
                      <BadgeAlert className="w-3.5 h-3.5" />
                      संपादक का निर्देश:
                    </strong>
                    <p className="leading-relaxed">{sub.editorComment}</p>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="flex gap-3">
                  {sub.featuredImage && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      <img
                        src={sub.featuredImage}
                        alt={sub.headline}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug">
                      {sub.headline}
                    </h4>

                    <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-1 flex-wrap">
                      {sub.category && (
                        <span className="font-semibold text-orange-700">
                          {sub.category.nameHi || sub.category.name}
                        </span>
                      )}
                      {sub.locationName && (
                        <span className="flex items-center gap-0.5 text-stone-600">
                          <MapPin className="w-2.5 h-2.5" />
                          {sub.locationName}
                        </span>
                      )}
                      {sub.article && sub.status === 'PUBLISHED' && (
                        <span className="flex items-center gap-0.5 text-emerald-700 font-bold">
                          <Eye className="w-2.5 h-2.5" />
                          {sub.article.viewCount || 0} व्यूज
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <Link
                    href={`/mobile-reporter/news/${sub.id}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>संपादित करें</span>
                  </Link>

                  {sub.article && sub.status === 'PUBLISHED' && (
                    <a
                      href={`/news/${encodeURIComponent(sub.article.slug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#EA580C] hover:text-orange-700 font-bold text-[11px]"
                    >
                      <span>लाइव पढ़ें</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Live Portal Stories Feed (एडमिन पैनल की मुख्य खबरें नीचे दिखती रहें) */}
      <div className="pt-4">
        <PortalLatestNewsFeed />
      </div>

      {/* 7. Switch to Desktop Button */}
      <div className="pt-2 text-center">
        <Link
          href="/reporter"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-stone-200 hover:border-orange-300 text-stone-700 text-xs font-bold shadow-xs transition-all"
        >
          <Monitor className="w-4 h-4 text-[#EA580C]" />
          <span>कंप्यूटर / डेस्कटॉप व्यू पर जाएं</span>
        </Link>
      </div>
    </div>
  );
}
