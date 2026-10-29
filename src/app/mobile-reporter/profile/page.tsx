'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Camera,
  Loader2,
  CheckCircle,
  FileText,
  Eye,
  LogOut,
  Monitor,
  Globe,
  Clock,
  BadgeAlert,
} from 'lucide-react';

export default function MobileReporterProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/reporter/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push('/mobile-reporter/login');
          return;
        }
        setProfile(data.data.profile);
        setUser(data.data.user);
        setStats(data.data.stats);
        setLoading(false);
      })
      .catch(() => router.push('/mobile-reporter/login'));
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल फोटो (JPG, PNG, WebP) चुनें');
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
        setProfile((prev: any) => (prev ? { ...prev, photo: uploadedUrl } : prev));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'फोटो अपडेट करने में समस्या हुई');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/reporter/logout', { method: 'POST' });
      router.push('/mobile-reporter/login');
    } catch (_) {
      router.push('/mobile-reporter/login');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-stone-500 space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
        <p>प्रोफाइल लोड हो रही है...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Profile Avatar Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 text-center shadow-xs relative">
        <div className="relative inline-block mx-auto mb-3">
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <div
            onClick={() => photoInputRef.current?.click()}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#EA580C] to-amber-500 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-black cursor-pointer"
            title="फोटो अपलोड करने के लिए टैप करें"
          >
            {uploadingPhoto ? (
              <Loader2 className="w-7 h-7 animate-spin text-white" />
            ) : profile?.photo ? (
              <img src={profile.photo} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              profile?.fullName?.slice(0, 1) || 'र'
            )}
          </div>

          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white text-orange-600 shadow-md border border-orange-200 cursor-pointer"
            title="फोटो बदलें"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-lg font-black text-stone-900">{profile?.fullName}</h2>
        <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-mono font-bold">
          {profile?.reporterId}
        </span>
        <p className="text-xs text-stone-500 mt-1 font-medium">
          {profile?.designation || 'संवाददाता'} • {profile?.district || 'उत्तर प्रदेश'} ब्यूरो
        </p>

        {saveSuccess && (
          <p className="text-xs text-green-600 font-bold mt-2">फोटो सफलतापूर्वक अपडेट हो गई!</p>
        )}
      </div>

      {/* 2. Key Performance Stats */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-xs">
        <h3 className="text-xs font-black text-stone-900 mb-3 uppercase tracking-wide">
          पत्रकारिता रिपोर्ट व प्रदर्शन
        </h3>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
            <span className="text-xl font-black text-stone-900 block">{stats?.total || 0}</span>
            <span className="text-[11px] font-bold text-stone-500 mt-0.5 block">कुल खबरें</span>
          </div>
          <div className="p-3 rounded-2xl bg-green-50 border border-green-100">
            <span className="text-xl font-black text-green-700 block">{stats?.published || 0}</span>
            <span className="text-[11px] font-bold text-green-600 mt-0.5 block">लाइव प्रकाशित</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-xl font-black text-emerald-700 block">{stats?.approved || 0}</span>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5 block">स्वीकृत</span>
          </div>
          <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100">
            <span className="text-xl font-black text-orange-600 block">{stats?.totalViews || 0}</span>
            <span className="text-[11px] font-bold text-orange-700 mt-0.5 block">कुल पाठक (Views)</span>
          </div>
        </div>
      </div>

      {/* 3. Account Information */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-black text-stone-900 uppercase tracking-wide">
          व्यक्तिगत व संपर्क विवरण
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>ईमेल आईडी</span>
            </span>
            <span className="font-bold text-stone-900">{user?.email || '—'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>मोबाइल नंबर</span>
            </span>
            <span className="font-bold text-stone-900">{profile?.mobileNumber || '—'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50">
            <span className="text-stone-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>कार्यक्षेत्र (ब्यूरो)</span>
            </span>
            <span className="font-bold text-stone-900">{profile?.district || 'उत्तर प्रदेश'}</span>
          </div>
        </div>
      </div>

      {/* 4. Switcher & Actions */}
      <div className="space-y-2 pt-2">
        <Link
          href="/reporter"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-stone-200 hover:border-orange-300 text-stone-800 text-xs font-black shadow-xs transition-all"
        >
          <Monitor className="w-4 h-4 text-[#EA580C]" />
          <span>कंप्यूटर / डेस्कटॉप व्यू पर जाएं</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>लॉगआउट करें</span>
        </button>
      </div>
    </div>
  );
}
