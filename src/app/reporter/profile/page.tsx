'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  CheckCircle,
  FileText,
  Eye,
  LogOut,
  Camera,
  Loader2,
} from 'lucide-react';
import ReporterHeader from '@/components/reporter/ReporterHeader';
import PortalLatestNewsFeed from '@/components/reporter/PortalLatestNewsFeed';

export default function ReporterProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reporter/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push('/reporter/login');
          return;
        }
        setProfile(data.data.profile);
        setUser(data.data.user);
        setStats(data.data.stats);
        setLoading(false);
      })
      .catch(() => router.push('/reporter/login'));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/reporter/logout', { method: 'POST' });
      router.push('/reporter/login');
    } catch (_) {
      router.push('/reporter/login');
    }
  };

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

      const updateRes = await fetch('/api/reporter/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: data.url }),
      });
      const updateData = await updateRes.json();
      if (updateData.success) {
        setProfile((prev: any) => (prev ? { ...prev, photo: data.url } : prev));
        alert('प्रोफ़ाइल फोटो सफलतापूर्वक अपडेट हो गई!');
      } else {
        alert(updateData.error || 'प्रोफ़ाइल सहेजने में समस्या आई');
      }
    } catch (_) {
      alert('फोटो अपलोड करने में समस्या आई');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center text-xs text-stone-400">
        लोड हो रहा है...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between">
      {/* Dainik Manyavar Authentic Website Style Header */}
      <ReporterHeader profile={profile} stats={stats} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Top Profile Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-stone-100 dark:border-stone-800 text-center sm:text-left">
            {/* Interactive Photo Box */}
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
                className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#EA580C] to-amber-500 overflow-hidden border-4 border-white dark:border-stone-800 shadow-xl flex items-center justify-center text-white text-3xl font-black shrink-0 cursor-pointer group-hover:border-orange-300 transition-all"
                title="क्लिक करके अपनी फोटो अपलोड करें या बदलें"
              >
                {uploadingPhoto ? (
                  <div className="flex flex-col items-center justify-center text-white text-[10px]">
                    <Loader2 className="w-6 h-6 animate-spin mb-1" />
                    <span>अपलोडिंग...</span>
                  </div>
                ) : profile?.photo ? (
                  <img src={profile.photo} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  profile?.fullName?.slice(0, 1) || 'र'
                )}

                {/* Camera Overlay on Hover */}
                {!uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition-opacity">
                    <Camera className="w-6 h-6 mb-1" />
                    <span>फोटो बदलें</span>
                  </div>
                )}
              </div>

              {/* Direct Camera Badge Button */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white text-orange-600 hover:bg-orange-50 shadow-md border border-orange-200 text-xs font-bold flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title="फोटो अपलोड करें"
              >
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-stone-900 dark:text-white">{profile?.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-extrabold tracking-wide">
                  {profile?.reporterId}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs font-bold">
                  <CheckCircle className="w-3 h-3" /> सक्रिय संवाददाता
                </span>
              </div>
              <p className="text-sm font-bold text-stone-500 dark:text-stone-400 flex items-center justify-center sm:justify-start gap-2">
                <Briefcase className="w-4 h-4 text-orange-600" />
                <span>{profile?.designation || 'संवाददाता'}</span>
                {profile?.district && (
                  <span>• <MapPin className="w-3.5 h-3.5 inline text-orange-600" /> {profile.district}</span>
                )}
              </p>
              {profile?.bio && (
                <p className="text-xs text-stone-600 dark:text-stone-300 pt-2 leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase">ईमेल पता</p>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{user?.email || '—'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <Phone className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase">मोबाइल नंबर</p>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{profile?.mobileNumber || '—'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase">संबंधित जिला / कार्यक्षेत्र</p>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{profile?.district || 'दैनिक मान्यवर ब्यूरो'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase">अधिकार व एक्सेस</p>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">संवाददाता (Reporter Role)</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          {stats && (
            <div className="p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40">
              <h3 className="text-xs font-black uppercase text-orange-600 dark:text-orange-400 mb-3 tracking-wider">
                आपकी खबरें और पाठक आंकड़े
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-stone-900 rounded-xl">
                  <p className="text-[10px] text-stone-400 font-bold">कुल भेजी</p>
                  <p className="text-lg font-black text-stone-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded-xl">
                  <p className="text-[10px] text-stone-400 font-bold">समीक्षा में</p>
                  <p className="text-lg font-black text-blue-600">{stats.pendingReview}</p>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded-xl">
                  <p className="text-[10px] text-stone-400 font-bold">प्रकाशित</p>
                  <p className="text-lg font-black text-green-600">{stats.published}</p>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded-xl">
                  <p className="text-[10px] text-stone-400 font-bold">कुल पाठक व्यूज़</p>
                  <p className="text-lg font-black text-[#EA580C]">{stats.totalViews.toLocaleString('hi-IN')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 text-center text-xs text-stone-400">
            नोट: नाम, पदनाम, कार्यक्षेत्र या पासवर्ड बदलने के लिए मुख्य संपादक या एडमिन से संपर्क करें।
          </div>
        </div>

        {/* Live Portal News Feed (एडमिन पैनल की मुख्य खबरें नीचे दिखती रहें) */}
        <PortalLatestNewsFeed />
      </main>

      {/* Mandatory Technology Partner Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800/80 py-4 px-6 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
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
