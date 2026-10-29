'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Newspaper,
  PlusCircle,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Globe,
  XCircle,
  Eye,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  RefreshCw,
  UserCheck,
  ChevronRight,
  MapPin,
  BadgeAlert,
  Camera,
  Loader2,
  Upload,
  Smartphone,
} from 'lucide-react';
import ReporterHeader from '@/components/reporter/ReporterHeader';
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

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function ReporterDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<ReporterProfile | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
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
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Notification Modal
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Photo Upload State
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'reporter');
      formData.append('caption', `${profile?.fullName || 'reporter'}_photo`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success || !data.url) {
        alert(data.error || 'फोटो अपलोड करने में समस्या आई');
        setUploadingPhoto(false);
        return;
      }

      // Update reporter profile in database
      const updateRes = await fetch('/api/reporter/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: data.url }),
      });
      const updateData = await updateRes.json();
      if (updateData.success) {
        setProfile((prev) => (prev ? { ...prev, photo: data.url } : prev));
      } else {
        alert(updateData.error || 'प्रोफ़ाइल सहेजने में समस्या आई');
      }
    } catch (_) {
      alert('फोटो अपलोड करने में समस्या आई');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const fetchProfileAndStats = async () => {
    try {
      const res = await fetch('/api/reporter/me');
      const data = await res.json();
      if (!res.ok || !data.success) {
        router.push('/reporter/login');
        return;
      }
      setProfile(data.data.profile);
      setUser(data.data.user);
      setStats(data.data.stats);
    } catch (e) {
      router.push('/reporter/login');
    }
  };

  const fetchSubmissions = async (statusFilter = activeTab) => {
    try {
      setRefreshing(true);
      const url = statusFilter && statusFilter !== 'ALL'
        ? `/api/reporter/submissions?status=${statusFilter}`
        : '/api/reporter/submissions';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await fetch('/api/reporter/notifications');
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/reporter/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setStats((prev) => ({ ...prev, unreadNotifications: 0 }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfileAndStats();
    fetchSubmissions(activeTab);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchSubmissions(tab);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/reporter/logout', { method: 'POST' });
      router.push('/reporter/login');
    } catch (_) {
      router.push('/reporter/login');
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm('क्या आप इस ड्राफ्ट को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/reporter/submissions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchSubmissions(activeTab);
        fetchProfileAndStats();
      } else {
        alert(data.error || 'हटाने में समस्या आई');
      }
    } catch (_) {
      alert('हटाने में समस्या आई');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700">
            <FileText className="w-3 h-3" /> ड्राफ्ट
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
            <Clock className="w-3 h-3" /> समीक्षा हेतु लंबित
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 animate-pulse" /> समीक्षा जारी
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800">
            <BadgeAlert className="w-3 h-3 text-orange-600" /> सुधार की आवश्यकता
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> स्वीकृत (ड्राफ्ट)
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800">
            <Globe className="w-3 h-3" /> प्रकाशित
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800">
            <XCircle className="w-3 h-3" /> अस्वीकृत
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.headline.toLowerCase().includes(q) ||
      (sub.locationName && sub.locationName.toLowerCase().includes(q)) ||
      (sub.category && sub.category.nameHi && sub.category.nameHi.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between">
      {/* Dainik Manyavar Authentic Website Style Header for Reporter */}
      <ReporterHeader
        profile={profile}
        stats={stats}
        onOpenNotifications={() => {
          setShowNotifModal(true);
          fetchNotifications();
        }}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {/* Reporter Welcome Card */}
        <div className="mb-6 bg-gradient-to-r from-orange-600 via-[#EA580C] to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-orange-600/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5 flex-wrap sm:flex-nowrap">
            {/* Interactive Photo Upload Box */}
            <div className="relative group shrink-0">
              <input
                type="file"
                ref={photoInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div
                onClick={() => photoInputRef.current?.click()}
                className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 overflow-hidden flex items-center justify-center shadow-inner cursor-pointer group-hover:border-white transition-all"
                title="क्लिक करके अपनी फोटो अपलोड करें या बदलें"
              >
                {uploadingPhoto ? (
                  <div className="flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin mb-1" />
                    <span className="text-[9px] font-bold">अपलोडिंग...</span>
                  </div>
                ) : profile?.photo ? (
                  <img src={profile.photo} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black">{profile?.fullName?.slice(0, 1) || 'र'}</span>
                )}

                {/* Camera Overlay on Hover */}
                {!uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>फोटो बदलें</span>
                  </div>
                )}
              </div>

              {/* Direct Camera Badge Button */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white text-orange-600 hover:bg-orange-50 shadow-md border border-orange-200 text-[11px] font-bold flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title="फोटो अपलोड करें"
              >
                {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{profile?.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-xs font-bold tracking-wider">
                  {profile?.reporterId}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-orange-100 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{profile?.designation || 'संवाददाता'}</span>
                {profile?.district && (
                  <span className="inline-flex items-center gap-1">
                    • <MapPin className="w-3 h-3" /> {profile.district}
                  </span>
                )}
              </p>

              {/* Click to upload photo helper */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-100 hover:text-white bg-black/15 hover:bg-black/25 px-2.5 py-1 rounded-lg mt-2 cursor-pointer transition-colors"
              >
                <Camera className="w-3 h-3" />
                <span>{uploadingPhoto ? 'फोटो अपलोड हो रही है...' : 'फोटो अपलोड करें / बदलें'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/mobile-reporter"
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="मोबाइल रिपोर्टर इंटरफेस खोलें"
            >
              <Smartphone className="w-4 h-4 text-orange-200" />
              <span>मोबाइल व्यू</span>
            </Link>
            <Link
              href="/reporter/news/new"
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white hover:bg-orange-50 text-orange-600 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> नई खबर लिखें
            </Link>
          </div>
        </div>

        {/* 6 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {/* 1. Total */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-[11px] font-bold">कुल खबरें</span>
              <FileText className="w-4 h-4 text-stone-500" />
            </div>
            <p className="text-2xl font-black text-stone-900 dark:text-white">{stats.total}</p>
          </div>

          {/* 2. Pending */}
          <div className="bg-white dark:bg-stone-900 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-blue-500 mb-1">
              <span className="text-[11px] font-bold">समीक्षा लंबित</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.pendingReview}</p>
          </div>

          {/* 3. Changes Requested */}
          <div className="bg-white dark:bg-stone-900 border border-orange-200 dark:border-orange-900/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-orange-500 mb-1">
              <span className="text-[11px] font-bold">सुधार हेतु वापस</span>
              <BadgeAlert className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{stats.changesRequested}</p>
          </div>

          {/* 4. Approved */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-emerald-500 mb-1">
              <span className="text-[11px] font-bold">स्वीकृत खबरें</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
          </div>

          {/* 5. Published */}
          <div className="bg-white dark:bg-stone-900 border border-green-200 dark:border-green-900/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-green-600 mb-1">
              <span className="text-[11px] font-bold">प्रकाशित खबरें</span>
              <Globe className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-black text-green-600 dark:text-green-400">{stats.published}</p>
          </div>

          {/* 6. Total Views */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-900 dark:to-orange-950/30 border border-orange-200 dark:border-orange-900/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-orange-600 dark:text-orange-400 mb-1">
              <span className="text-[11px] font-bold">कुल पाठक व्यूज़</span>
              <Eye className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-black text-[#EA580C]">{stats.totalViews.toLocaleString('hi-IN')}</p>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            {/* Scrollable Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-bold">
              {[
                { id: 'ALL', label: 'सभी खबरें' },
                { id: 'DRAFT', label: 'ड्राफ्ट' },
                { id: 'SUBMITTED', label: 'समीक्षा हेतु भेजी' },
                { id: 'CHANGES_REQUESTED', label: 'सुधार के लिए वापस' },
                { id: 'APPROVED', label: 'स्वीकृत' },
                { id: 'PUBLISHED', label: 'प्रकाशित' },
                { id: 'REJECTED', label: 'अस्वीकृत' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="शीर्षक या जिला खोजें..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Submissions List */}
          {loading ? (
            <div className="py-12 text-center text-stone-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
              <p className="text-xs">डेटा लोड हो रहा है...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
              <Newspaper className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-600 dark:text-stone-400">इस श्रेणी में कोई खबर उपलब्ध नहीं है</p>
              <p className="text-xs text-stone-400 mt-1 mb-4">आप नई खबर लिखकर एडमिन को समीक्षा के लिए भेज सकते हैं।</p>
              <Link
                href="/reporter/news/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
              >
                <PlusCircle className="w-3.5 h-3.5" /> नई खबर लिखें
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 p-3 rounded-2xl transition-colors"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-20 h-16 rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700 flex items-center justify-center">
                      {sub.featuredImage ? (
                        <img
                          src={sub.featuredImage}
                          alt={sub.headline}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Newspaper className="w-6 h-6 text-stone-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getStatusBadge(sub.status)}
                        {sub.category && (
                          <span className="text-[11px] font-bold text-stone-500">
                            {sub.category.nameHi}
                          </span>
                        )}
                        {sub.locationName && (
                          <span className="text-[11px] text-stone-400 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {sub.locationName}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400">
                          {new Date(sub.createdAt).toLocaleDateString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate max-w-2xl">
                        {sub.headline}
                      </h3>

                      {/* Editor comment callout if returned for changes or rejected */}
                      {sub.editorComment && (sub.status === 'CHANGES_REQUESTED' || sub.status === 'REJECTED') && (
                        <div className="mt-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[11px] text-red-700 dark:text-red-300">
                          <strong>संपादकीय टिप्पणी:</strong> {sub.editorComment}
                        </div>
                      )}

                      {/* Real View Count for Published */}
                      {sub.status === 'PUBLISHED' && sub.article && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-green-700 dark:text-green-400 font-bold">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{sub.article.viewCount || 0} पाठक व्यूज़</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* If Draft or Changes Requested -> Edit */}
                    {(sub.status === 'DRAFT' || sub.status === 'CHANGES_REQUESTED') && (
                      <Link
                        href={`/reporter/news/${sub.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        {sub.status === 'CHANGES_REQUESTED' ? 'सुधार करें' : 'संपादित करें'}
                      </Link>
                    )}

                    {/* Delete draft */}
                    {sub.status === 'DRAFT' && (
                      <button
                        onClick={() => handleDeleteDraft(sub.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                        title="ड्राफ्ट हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Published -> View on Website */}
                    {sub.status === 'PUBLISHED' && sub.article && (
                      <a
                        href={`/news/${sub.article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all"
                      >
                        वेबसाइट पर देखें <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Published -> Request Revision */}
                    {sub.status === 'PUBLISHED' && (
                      <Link
                        href={`/reporter/news/${sub.id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-stone-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                        title="प्रकाशित खबर में संशोधन का अनुरोध करें"
                      >
                        संशोधन अनुरोध
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Portal News Feed (एडमिन पैनल की मुख्य खबरें नीचे दिखती रहें) */}
        <PortalLatestNewsFeed />
      </main>

      {/* Notifications Drawer / Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                <h3 className="font-black text-base text-stone-900 dark:text-white">आपकी सूचनाएं (Notifications)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-orange-600 hover:underline font-bold"
                >
                  सभी पढ़ी हुई मार्क करें
                </button>
                <button
                  onClick={() => setShowNotifModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 divide-y divide-stone-100 dark:divide-stone-800">
              {loadingNotifs ? (
                <div className="py-8 text-center text-xs text-stone-400">लोड हो रहा है...</div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">कोई नई सूचना नहीं है</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`py-3 ${notif.read ? 'opacity-70' : 'bg-orange-50/40 dark:bg-orange-950/20 p-2.5 rounded-xl'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-white">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(notif.createdAt).toLocaleTimeString('hi-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Technology Partner Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800/80 py-4 px-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} दैनिक मान्यवर (Dainik Manyavar). सर्वाधिकार सुरक्षित।</span>
          <span>
            Technology Partner:{' '}
            <a
              href="https://easylauncher.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EA580C] hover:underline font-bold"
            >
              EasyLauncher.net
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
