'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Bookmark,
  History,
  Mail,
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Calendar,
  ExternalLink,
  Trash2,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import PortalAuthModal from '@/components/public/PortalAuthModal';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default function UserDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'saved' | 'history' | 'newsletter' | 'notifications'>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Saved news state
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // History state
  const [historyArticles, setHistoryArticles] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Newsletter & Notification preferences
  const [newsletterSub, setNewsletterSub] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/portal/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setEditName(data.user.fullName || '');
        setEditEmail(data.user.email || '');
        setEditCity(data.user.city || '');
        setEditState(data.user.state || 'उत्तर प्रदेश');
        setNewsletterSub(Boolean(data.user.newsletterSubscribed));
        setWhatsappAlerts(Boolean(data.user.whatsappPermission));
      } else {
        setUser(null);
      }
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch saved news when switching to saved tab
  const fetchSavedNews = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch('/api/portal/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-saved' }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedArticles(data.data || []);
      }
    } catch (_) {
    } finally {
      setLoadingSaved(false);
    }
  };

  // Fetch reading history when switching to history tab
  const fetchReadingHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/portal/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-history' }),
      });
      const data = await res.json();
      if (data.success) {
        setHistoryArticles(data.data || []);
      }
    } catch (_) {
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'saved') fetchSavedNews();
      if (activeTab === 'history') fetchReadingHistory();
    }
  }, [activeTab, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/auth/portal/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editName,
          email: editEmail,
          city: editCity,
          state: editState,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setProfileMsg({ type: 'success', text: 'प्रोफाइल विवरण सफलतापूर्वक सहेजा गया।' });
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'अपडेट विफल रहा।' });
      }
    } catch (_) {
      setProfileMsg({ type: 'error', text: 'सर्वर त्रुटि।' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePreferences = async (newsletter: boolean, whatsapp: boolean) => {
    setPrefSaving(true);
    try {
      const res = await fetch('/api/auth/portal/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletterSubscribed: newsletter,
          whatsappPermission: whatsapp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterSub(newsletter);
        setWhatsappAlerts(whatsapp);
        setUser(data.user);
      }
    } catch (_) {
    } finally {
      setPrefSaving(false);
    }
  };

  const handleRemoveSaved = async (articleId: string) => {
    try {
      await fetch('/api/portal/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-save', articleId }),
      });
      setSavedArticles((prev) => prev.filter((a) => a.id !== articleId));
    } catch (_) {}
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setUser(null);
      router.push('/');
    } catch (_) {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 font-sans">
      <Header />

      <main className="flex-1 wrap py-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#EA580C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्य पृष्ठ पर वापस जाएं</span>
          </Link>
          <span className="text-xs font-black text-[#EA580C] bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
            दैनिक मान्यवर पाठक डैशबोर्ड
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-stone-200">
            <div className="w-8 h-8 border-3 border-[#EA580C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-stone-500">डैशबोर्ड लोड हो रहा है...</p>
          </div>
        ) : !user ? (
          /* Logged out state */
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-md border border-stone-200 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[#EA580C]" />
            </div>
            <h2 className="text-lg font-black text-stone-900 mb-2">
              पाठक डैशबोर्ड में आपका स्वागत है
            </h2>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              दैनिक मान्यवर पर अपने सहेजे गए समाचार, रीडिंग हिस्ट्री, व्हाट्सएप न्यूज़ अलर्ट एवं न्यूज़लेटर सेटिंग्स को प्रबंधित करने के लिए कृपया लॉगिन या रजिस्टर करें।
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-700 hover:to-orange-800 text-white text-xs font-black rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              लॉगिन / नया खाता बनाएं →
            </button>
          </div>
        ) : (
          /* Logged in Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Left Sidebar Menu */}
            <div className="lg:col-span-1 space-y-4">
              {/* User Profile Card */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#EA580C] to-amber-500 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-black shadow-md shadow-orange-600/20 mb-3">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 className="font-black text-stone-900 text-sm">{user.fullName}</h3>
                <p className="text-[11px] font-bold text-stone-500 flex items-center justify-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-stone-400" />
                  +91 {user.mobileNumber}
                </p>
                {user.city && (
                  <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {user.city}, {user.state || 'उत्तर प्रदेश'}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-center gap-2">
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-green-600" />
                    सक्रिय पाठक (Active)
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="bg-white rounded-2xl p-2 shadow-xs border border-stone-200 space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>मेरी प्रोफाइल (My Profile)</span>
                </button>

                <button
                  onClick={() => setActiveTab('saved')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                    activeTab === 'saved'
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>सहेजे गए समाचार (Saved News)</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>रीडिंग हिस्ट्री (Reading History)</span>
                </button>

                <button
                  onClick={() => setActiveTab('newsletter')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                    activeTab === 'newsletter'
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>न्यूज़लेटर सेटिंग्स (Newsletter)</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>व्हाट्सएप अलर्ट (WhatsApp Alerts)</span>
                </button>

                <div className="pt-2 border-t border-stone-100 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>लॉगआउट (Logout)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Main Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 min-h-[420px]">
                {/* TAB 1: PROFILE */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-base font-black text-stone-900 pb-3 border-b border-stone-100 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#EA580C]" />
                      <span>व्यक्तिगत विवरण (Personal Profile)</span>
                    </h2>

                    {profileMsg && (
                      <div
                        className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                          profileMsg.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {profileMsg.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{profileMsg.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            पूरा नाम (Full Name)
                          </label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            मोबाइल नंबर (Mobile Number)
                          </label>
                          <input
                            type="text"
                            disabled
                            value={user.mobileNumber}
                            className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 text-stone-500 cursor-not-allowed"
                          />
                          <p className="text-[10px] text-stone-400 mt-0.5">मोबाइल नंबर बदला नहीं जा सकता</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            ईमेल पता (Email Address)
                          </label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="example@mail.com"
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            शहर (City)
                          </label>
                          <input
                            type="text"
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            placeholder="उदा. वाराणसी"
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          राज्य (State)
                        </label>
                        <input
                          type="text"
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {savingProfile ? 'सहेजा जा रहा है...' : 'परिवर्तन सहेजें (Save Changes)'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 2: SAVED NEWS */}
                {activeTab === 'saved' && (
                  <div>
                    <h2 className="text-base font-black text-stone-900 pb-3 border-b border-stone-100 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-[#EA580C]" />
                        <span>सहेजे गए समाचार (My Saved News)</span>
                      </div>
                      <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                        कुल: {savedArticles.length}
                      </span>
                    </h2>

                    {loadingSaved ? (
                      <p className="text-xs text-stone-500 py-6 text-center">लोड हो रहा है...</p>
                    ) : savedArticles.length === 0 ? (
                      <div className="py-12 text-center text-stone-500">
                        <Bookmark className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                        <p className="text-xs font-bold">आपने अभी तक कोई समाचार सेव नहीं किया है।</p>
                        <p className="text-[11px] text-stone-400 mt-1">किसी भी समाचार के नीचे &quot;सेव करें&quot; बटन पर क्लिक कर उसे यहां जोड़ें।</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedArticles.map((art) => (
                          <div
                            key={art.id}
                            className="flex items-center justify-between gap-3 p-3 bg-stone-50 hover:bg-orange-50/50 rounded-xl border border-stone-200 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {art.featuredImage ? (
                                <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-stone-200">
                                  <Image
                                    src={art.featuredImage}
                                    alt={art.title}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 font-bold text-[10px]">
                                  दैनिक
                                </div>
                              )}
                              <div className="min-w-0">
                                <Link
                                  href={`/news/${art.slug}`}
                                  className="text-xs font-bold text-stone-900 hover:text-[#EA580C] line-clamp-1 transition-colors"
                                >
                                  {art.title}
                                </Link>
                                <p className="text-[10px] text-stone-400 mt-0.5">
                                  {new Date(art.publishedAt).toLocaleDateString('hi-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Link
                                href={`/news/${art.slug}`}
                                className="p-1.5 bg-white hover:bg-orange-100 text-[#EA580C] rounded-lg border border-stone-200 transition-colors"
                                title="पढ़ें"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleRemoveSaved(art.id)}
                                className="p-1.5 bg-white hover:bg-red-100 text-red-600 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                                title="हटाएं"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: READING HISTORY */}
                {activeTab === 'history' && (
                  <div>
                    <h2 className="text-base font-black text-stone-900 pb-3 border-b border-stone-100 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-[#EA580C]" />
                        <span>रीडिंग हिस्ट्री (My Reading History)</span>
                      </div>
                      <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                        अंतिम {historyArticles.length} समाचार
                      </span>
                    </h2>

                    {loadingHistory ? (
                      <p className="text-xs text-stone-500 py-6 text-center">इतिहास लोड हो रहा है...</p>
                    ) : historyArticles.length === 0 ? (
                      <div className="py-12 text-center text-stone-500">
                        <History className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                        <p className="text-xs font-bold">रीडिंग हिस्ट्री उपलब्ध नहीं है।</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {historyArticles.map((art, idx) => (
                          <div
                            key={art.logId || idx}
                            className="flex items-center justify-between gap-3 p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-100 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/news/${art.slug}`}
                                className="text-xs font-bold text-stone-800 hover:text-[#EA580C] line-clamp-1 transition-colors"
                              >
                                {art.title}
                              </Link>
                              <span className="text-[10px] text-stone-400 mt-0.5 block">
                                पढ़ा गया: {new Date(art.timestamp).toLocaleString('hi-IN')}
                              </span>
                            </div>
                            <Link
                              href={`/news/${art.slug}`}
                              className="text-[11px] font-bold text-[#EA580C] hover:underline flex items-center gap-1 flex-shrink-0"
                            >
                              <span>पुनः पढ़ें</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: NEWSLETTER SETTINGS */}
                {activeTab === 'newsletter' && (
                  <div>
                    <h2 className="text-base font-black text-stone-900 pb-3 border-b border-stone-100 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#EA580C]" />
                      <span>दैनिक न्यूज़लेटर सेटिंग्स (Newsletter Settings)</span>
                    </h2>

                    <div className="max-w-xl space-y-4">
                      <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-black text-xs text-stone-900 mb-1">
                              दैनिक न्यूज़लेटर ईमेल डाइजेस्ट
                            </h4>
                            <p className="text-[11px] text-stone-600 leading-relaxed">
                              उत्तर प्रदेश, देश और दुनिया की मुख्य खबरों का सार हर सुबह सीधे आपके इनबॉक्स में प्राप्त करें।
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={newsletterSub}
                              disabled={prefSaving}
                              onChange={(e) => handleUpdatePreferences(e.target.checked, whatsappAlerts)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EA580C]"></div>
                          </label>
                        </div>
                      </div>

                      <div className="text-xs text-stone-500 space-y-1 pl-1">
                        <p>✓ ईमेल: <span className="font-bold text-stone-700">{user.email || '(ईमेल सेट नहीं है - प्रोफाइल से जोड़ें)'}</span></p>
                        <p>✓ स्थिति: <span className="font-bold text-stone-700">{newsletterSub ? 'सक्रिय सब्सक्राइबर' : 'निष्क्रिय'}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: NOTIFICATION PREFERENCES (WHATSAPP) */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-base font-black text-stone-900 pb-3 border-b border-stone-100 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-[#EA580C]" />
                      <span>व्हाट्सएप न्यूज़ अलर्ट प्राथमिकताएं (Notification Preferences)</span>
                    </h2>

                    <div className="max-w-xl space-y-4">
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-black text-xs text-green-900 mb-1 flex items-center gap-1.5">
                              <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                              <span>व्हाट्सएप ब्रेकिंग न्यूज़ अलर्ट</span>
                            </h4>
                            <p className="text-[11px] text-green-800 leading-relaxed">
                              जैसे ही कोई बड़ी ब्रेकिंग न्यूज़ या विशेष समाचार प्रकाशित होता है, तुरंत व्हाट्सएप संदेश के माध्यम से सूचना प्राप्त करें।
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={whatsappAlerts}
                              disabled={prefSaving}
                              onChange={(e) => handleUpdatePreferences(newsletterSub, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A34A]"></div>
                          </label>
                        </div>
                      </div>

                      <div className="text-xs text-stone-500 space-y-1 pl-1">
                        <p>✓ पंजीकृत व्हाट्सएप नंबर: <span className="font-bold text-stone-700">+91 {user.mobileNumber}</span></p>
                        <p>✓ स्थिति: <span className="font-bold text-stone-700">{whatsappAlerts ? 'अलर्ट चालू हैं' : 'अलर्ट बंद हैं'}</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Auth Modal */}
      <PortalAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowAuthModal(false);
          fetchUserProfile();
        }}
      />
    </div>
  );
}
