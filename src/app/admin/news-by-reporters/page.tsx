'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Newspaper,
  UserCheck,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Globe,
  XCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Lock,
  Upload,
  UserPlus,
  Loader2,
  BadgeAlert,
  ChevronRight,
  ShieldCheck,
  Power,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ReporterProfile {
  id: string;
  reporterId: string;
  fullName: string;
  designation: string;
  district: string | null;
  photo: string | null;
  mobileNumber?: string | null;
  bio?: string | null;
  active: boolean;
  user?: {
    id: string;
    email: string;
    active: boolean;
  };
  stats?: {
    totalSubmissions: number;
    pendingSubmissions: number;
    publishedSubmissions: number;
  };
}

interface SubmissionItem {
  id: string;
  headline: string;
  subtitle: string | null;
  status: string;
  locationName: string | null;
  featuredImage: string | null;
  createdAt: string;
  editorComment: string | null;
  revisionRequested: boolean;
  reporterProfile: {
    id: string;
    reporterId: string;
    fullName: string;
    designation: string;
    district: string | null;
    photo: string | null;
    user?: { email: string };
  };
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

function AdminNewsByReportersPageInner() {
  const searchParams = useSearchParams();
  const urlStatus = searchParams?.get('status');
  const [activeTab, setActiveTab] = useState<'queue' | 'reporters'>('queue');

  // Submissions State
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [statusFilter, setStatusFilter] = useState(urlStatus || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  // Reporters State
  const [reporters, setReporters] = useState<ReporterProfile[]>([]);
  const [loadingReporters, setLoadingReporters] = useState(false);
  const [showAddReporterModal, setShowAddReporterModal] = useState(false);
  const [editingReporter, setEditingReporter] = useState<ReporterProfile | null>(null);

  // Categories & Locations
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Add/Edit Reporter Form State
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repMobile, setRepMobile] = useState('');
  const [repPassword, setRepPassword] = useState('');
  const [repId, setRepId] = useState('');
  const [repDesignation, setRepDesignation] = useState('संवाददाता');
  const [repDistrict, setRepDistrict] = useState('');
  const [repBio, setRepBio] = useState('');
  const [repPhoto, setRepPhoto] = useState('');
  const [submittingRep, setSubmittingRep] = useState(false);
  const [repFormError, setRepFormError] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoadingQueue(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (districtFilter) params.set('district', districtFilter);
      if (categoryFilter) params.set('categoryId', categoryFilter);

      const res = await fetch(`/api/admin/news-by-reporters?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(data.data || []);
        if (data.stats) {
          setPendingCount(data.stats.pendingCount || 0);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQueue(false);
    }
  };

  const fetchReporters = async () => {
    try {
      setLoadingReporters(true);
      const res = await fetch('/api/admin/reporters');
      const data = await res.json();
      if (res.ok && data.success) {
        setReporters(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReporters(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetch('/api/categories').then((r) => r.json()).then((d) => d.success && setCategories(d.data || []));
    fetch('/api/locations').then((r) => r.json()).then((d) => d.success && setLocations(d.data || []));
  }, [statusFilter, districtFilter, categoryFilter]);

  useEffect(() => {
    if (activeTab === 'reporters') {
      fetchReporters();
    }
  }, [activeTab]);

  const handleCreateOrUpdateReporter = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepFormError(null);
    setSubmittingRep(true);

    try {
      const payload: any = {
        fullName: repName.trim(),
        email: repEmail.trim(),
        mobileNumber: repMobile.trim() || null,
        designation: repDesignation.trim(),
        district: repDistrict.trim() || null,
        bio: repBio.trim() || null,
        photo: repPhoto.trim() || null,
      };

      if (!editingReporter) {
        payload.password = repPassword;
        if (repId.trim()) payload.reporterId = repId.trim().toUpperCase();

        const res = await fetch('/api/admin/reporters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setRepFormError(data.error || 'रिपोर्टर बनाने में विफल');
          setSubmittingRep(false);
          return;
        }
      } else {
        if (repPassword.trim()) {
          payload.password = repPassword.trim();
        }
        const res = await fetch(`/api/admin/reporters/${editingReporter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setRepFormError(data.error || 'अपडेट करने में विफल');
          setSubmittingRep(false);
          return;
        }
      }

      setShowAddReporterModal(false);
      setEditingReporter(null);
      resetRepForm();
      fetchReporters();
    } catch (err) {
      setRepFormError('सर्वर से संपर्क करने में समस्या आई');
    } finally {
      setSubmittingRep(false);
    }
  };

  const resetRepForm = () => {
    setRepName('');
    setRepEmail('');
    setRepMobile('');
    setRepPassword('');
    setRepId('');
    setRepDesignation('संवाददाता');
    setRepDistrict('');
    setRepBio('');
    setRepPhoto('');
    setRepFormError(null);
  };

  const handleEditClick = (rep: ReporterProfile) => {
    setEditingReporter(rep);
    setRepName(rep.fullName);
    setRepEmail(rep.user?.email || '');
    setRepMobile(rep.mobileNumber || '');
    setRepPassword('');
    setRepId(rep.reporterId);
    setRepDesignation(rep.designation);
    setRepDistrict(rep.district || '');
    setRepBio(rep.bio || '');
    setRepPhoto(rep.photo || '');
    setShowAddReporterModal(true);
  };

  const handleToggleReporterActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reporters/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchReporters();
      } else {
        alert(data.error || 'स्थिति बदलने में समस्या आई');
      }
    } catch (_) {
      alert('स्थिति बदलने में समस्या आई');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
            ड्राफ्ट
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> समीक्षा हेतु लंबित
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 animate-pulse" /> समीक्षा जारी
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <BadgeAlert className="w-3 h-3 text-orange-600" /> सुधार हेतु भेजा
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> स्वीकृत (ड्राफ्ट)
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <Globe className="w-3 h-3" /> प्रकाशित
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-orange-500" />
              News by News Reporter
            </h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold shadow-sm animate-pulse">
                {pendingCount} समीक्षा हेतु लंबित
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            संवाददाताओं द्वारा भेजी गई खबरें, संपादकीय समीक्षा, अनुमोदन, प्रकाशन एवं रिपोर्टर प्रबंधन
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#EA580C] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            खबरें समीक्षा सूची ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('reporters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reporters'
                ? 'bg-[#EA580C] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            रिपोर्टर प्रबंधन (Reporters)
          </button>
        </div>
      </div>

      {/* TAB 1: SUBMISSIONS QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQueue()}
                placeholder="शीर्षक, रिपोर्टर खोजें..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">सभी स्थितियां (All Status)</option>
              <option value="PENDING">⚡ केवल समीक्षा लंबित (Pending)</option>
              <option value="SUBMITTED">सबमिट की गई (Submitted)</option>
              <option value="UNDER_REVIEW">समीक्षा जारी (Under Review)</option>
              <option value="CHANGES_REQUESTED">सुधार हेतु भेजी (Changes Requested)</option>
              <option value="APPROVED">स्वीकृत ड्राफ्ट (Approved)</option>
              <option value="PUBLISHED">प्रकाशित (Published)</option>
              <option value="REJECTED">अस्वीकृत (Rejected)</option>
            </select>

            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="">सभी जिले (All Districts)</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="">सभी श्रेणियां (All Categories)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameHi || c.name}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchQueue}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> रिफ्रेश करें
            </button>
          </div>

          {/* Submissions Table / Cards */}
          {loadingQueue ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-orange-500 mb-2" />
              <p className="text-xs">रिपोर्टर खबरें लोड हो रही हैं...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Newspaper className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">कोई खबर नहीं मिली</p>
              <p className="text-xs text-slate-400 mt-0.5">चुने गए फ़िल्टर के अनुसार कोई खबर रिकॉर्ड में नहीं है।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">फोटो / थंबनेल</th>
                    <th className="py-3 px-3">समाचार शीर्षक एवं विवरण</th>
                    <th className="py-3 px-3">रिपोर्टर पहचान</th>
                    <th className="py-3 px-3">जिला / श्रेणी</th>
                    <th className="py-3 px-3">तारीख</th>
                    <th className="py-3 px-3">स्थिति</th>
                    <th className="py-3 px-3 text-right">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Thumbnail */}
                      <td className="py-3 px-3">
                        <div className="w-16 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                          {sub.featuredImage ? (
                            <img src={sub.featuredImage} alt="Thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <Newspaper className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* Headline & Revision Note */}
                      <td className="py-3 px-3 max-w-md">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-2 text-xs sm:text-sm">
                          {sub.headline}
                        </p>
                        {sub.subtitle && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {sub.subtitle}
                          </p>
                        )}
                        {sub.revisionRequested && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                            🔄 संशोधन अनुरोध प्राप्त
                          </span>
                        )}
                        {sub.article && sub.status === 'PUBLISHED' && (
                          <div className="flex items-center gap-1 text-[11px] text-green-600 font-bold mt-1">
                            <Eye className="w-3 h-3" />
                            <span>{sub.article.viewCount || 0} पाठक व्यूज़</span>
                          </div>
                        )}
                      </td>

                      {/* Reporter Profile */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-600 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                            {sub.reporterProfile.photo ? (
                              <img src={sub.reporterProfile.photo} alt={sub.reporterProfile.fullName} className="w-full h-full object-cover" />
                            ) : (
                              sub.reporterProfile.fullName.slice(0, 1)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {sub.reporterProfile.fullName}
                            </p>
                            <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400">
                              {sub.reporterProfile.reporterId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* District & Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-bold text-slate-700 dark:text-slate-300">
                          {sub.locationName || sub.reporterProfile.district || '—'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {sub.category?.nameHi || sub.category?.name || 'सामान्य'}
                        </p>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                        {new Date(sub.createdAt).toLocaleDateString('hi-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(sub.status)}
                      </td>

                      {/* Review Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/news-by-reporters/${sub.id}/review`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          <span>समीक्षा करें</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE REPORTERS */}
      {activeTab === 'reporters' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                पंजीकृत रिपोर्टर सूची ({reporters.length})
              </h2>
              <p className="text-xs text-slate-400">
                नए रिपोर्टर जोड़ें, उनके विवरण संपादित करें, और अकाउंट सक्रिय या निष्क्रिय करें
              </p>
            </div>

            <button
              onClick={() => {
                resetRepForm();
                setEditingReporter(null);
                setShowAddReporterModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ नया रिपोर्टर जोड़ें</span>
            </button>
          </div>

          {loadingReporters ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
              <p className="text-xs">रिपोर्टर लोड हो रहे हैं...</p>
            </div>
          ) : reporters.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <UserCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">कोई रिपोर्टर पंजीकृत नहीं है</p>
              <p className="text-xs text-slate-400 mt-1 mb-3">ऊपर दिए बटन से पहला रिपोर्टर खाता जोड़ें।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">फोटो</th>
                    <th className="py-3 px-3">रिपोर्टर का नाम व आईडी</th>
                    <th className="py-3 px-3">पदनाम व जिला</th>
                    <th className="py-3 px-3">ईमेल व मोबाइल</th>
                    <th className="py-3 px-3 text-center">खबरें (कुल / लंबित / लाइव)</th>
                    <th className="py-3 px-3 text-center">स्थिति</th>
                    <th className="py-3 px-3 text-right">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reporters.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm overflow-hidden shrink-0">
                          {rep.photo ? (
                            <img src={rep.photo} alt={rep.fullName} className="w-full h-full object-cover" />
                          ) : (
                            rep.fullName.slice(0, 1)
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{rep.fullName}</p>
                        <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          {rep.reporterId}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-bold text-slate-700 dark:text-slate-300">{rep.designation}</p>
                        <p className="text-[11px] text-slate-400">{rep.district || '—'}</p>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="text-slate-700 dark:text-slate-300">{rep.user?.email || '—'}</p>
                        <p className="text-[11px] text-slate-400">{rep.mobileNumber || '—'}</p>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{rep.stats?.totalSubmissions || 0}</span>
                          <span>/</span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">{rep.stats?.pendingSubmissions || 0}</span>
                          <span>/</span>
                          <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">{rep.stats?.publishedSubmissions || 0}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleReporterActive(rep.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all ${
                            rep.active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title="क्लिक करके स्थिति बदलें"
                        >
                          <Power className="w-3 h-3" />
                          <span>{rep.active ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(rep)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>संपादित करें</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Reporter Modal */}
      {showAddReporterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-500" />
                {editingReporter ? 'रिपोर्टर विवरण व पासवर्ड संपादित करें' : 'नया रिपोर्टर खाता बनाएं'}
              </h3>
              <button
                onClick={() => setShowAddReporterModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateReporter} className="p-5 overflow-y-auto space-y-4 flex-1">
              {repFormError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                  {repFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="उदा. राहुल कुमार"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">ईमेल पता (Email) *</label>
                  <input
                    type="email"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    placeholder="reporter@dainikmanyavar.in"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">मोबाइल नंबर (Mobile Number)</label>
                  <input
                    type="tel"
                    value={repMobile}
                    onChange={(e) => setRepMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    रिपोर्टर आईडी {editingReporter ? '(अपरिवर्तनीय)' : '(वैकल्पिक)'}
                  </label>
                  <input
                    type="text"
                    value={repId}
                    onChange={(e) => setRepId(e.target.value)}
                    placeholder="DM-REP-101 (स्वतः जनरेट हेतु खाली छोड़ें)"
                    disabled={!!editingReporter}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">पदनाम (Designation)</label>
                  <select
                    value={repDesignation}
                    onChange={(e) => setRepDesignation(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="संवाददाता">संवाददाता</option>
                    <option value="जिला संवाददाता">जिला संवाददाता</option>
                    <option value="विशेष संवाददाता">विशेष संवाददाता</option>
                    <option value="ब्यूरो चीफ">ब्यूरो चीफ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">संबंधित जिला और कार्यक्षेत्र</label>
                <input
                  type="text"
                  value={repDistrict}
                  onChange={(e) => setRepDistrict(e.target.value)}
                  placeholder="उदा. जौनपुर, वाराणसी..."
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {editingReporter ? 'नया पासवर्ड (यदि बदलना हो तभी भरें)' : 'पासवर्ड *'}
                </label>
                <input
                  type="password"
                  value={repPassword}
                  onChange={(e) => setRepPassword(e.target.value)}
                  placeholder="कम से कम 6 अक्षर"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required={!editingReporter}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">प्रोफाइल फोटो URL (वैकल्पिक)</label>
                <input
                  type="url"
                  value={repPhoto}
                  onChange={(e) => setRepPhoto(e.target.value)}
                  placeholder="https://... या /uploads/..."
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">संक्षिप्त परिचय (Bio)</label>
                <textarea
                  rows={2}
                  value={repBio}
                  onChange={(e) => setRepBio(e.target.value)}
                  placeholder="रिपोर्टर के बारे में 1-2 पंक्तियां..."
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddReporterModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={submittingRep}
                  className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingRep ? 'सहेजा जा रहा है...' : editingReporter ? 'अपडेट सहेजें' : 'खाता बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNewsByReportersPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-400">लोड हो रहा है...</div>}>
      <AdminNewsByReportersPageInner />
    </React.Suspense>
  );
}
