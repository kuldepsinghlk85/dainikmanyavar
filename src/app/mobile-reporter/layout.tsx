'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  User,
  Monitor,
  Globe,
  Bell,
  LogOut,
  Newspaper,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function MobileReporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<{
    fullName?: string;
    reporterId?: string;
    photo?: string | null;
    district?: string | null;
  } | null>(null);

  const [stats, setStats] = useState<{
    unreadNotifications?: number;
  }>({ unreadNotifications: 0 });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    // Only check session on non-login pages
    if (pathname === '/mobile-reporter/login') return;

    fetch('/api/reporter/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push('/mobile-reporter/login');
          return;
        }
        setProfile(data.data.profile);
        if (data.data.stats) {
          setStats(data.data.stats);
        }
      })
      .catch(() => {
        router.push('/mobile-reporter/login');
      });
  }, [pathname, router]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/reporter/notifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      }
    } catch (_) {}
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/reporter/notifications', { method: 'PUT' });
      setStats((prev) => ({ ...prev, unreadNotifications: 0 }));
      fetchNotifications();
    } catch (_) {}
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/reporter/logout', { method: 'POST' });
      router.push('/mobile-reporter/login');
    } catch (_) {
      router.push('/mobile-reporter/login');
    }
  };

  const isLoginPage = pathname === '/mobile-reporter/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center text-stone-900 font-sans">
      <div className="w-full max-w-md min-h-screen bg-stone-50 flex flex-col shadow-2xl border-x border-stone-200 relative pb-20">
        {/* Mobile Reporter Top Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
          {/* Top Bar with Date & Desktop Switcher */}
          <div className="bg-[#FFF7ED] border-b border-[#FED7AA] px-3 py-1 flex items-center justify-between text-[11px] font-semibold text-stone-700">
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              📍 {profile?.district || 'उत्तर प्रदेश'} ब्यूरो
            </span>
            <Link
              href="/reporter"
              className="inline-flex items-center gap-1 text-orange-800 hover:text-orange-950 font-black bg-orange-200/80 hover:bg-orange-300 px-2 py-0.5 rounded-full transition-colors"
              title="डेस्कटॉप वर्जन पर स्विच करें"
            >
              <Monitor className="w-3 h-3 text-orange-700" />
              <span>डेस्कटॉप व्यू</span>
            </Link>
          </div>

          {/* Main Mobile Header Bar */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            {/* Logo & Reporter Corner Badge */}
            <Link href="/mobile-reporter" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="दैनिक मान्यवर"
                width={160}
                height={40}
                priority
                unoptimized
                className="h-8 w-auto object-contain"
              />
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[9px] font-black tracking-wide shadow-xs uppercase">
                मोबाइल
              </span>
            </Link>

            {/* Header Right Action Icons */}
            <div className="flex items-center gap-1.5">
              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => {
                  setShowNotifModal(true);
                  fetchNotifications();
                }}
                className="relative p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
                title="सूचनाएं देखें"
              >
                <Bell className="w-4 h-4" />
                {(stats.unreadNotifications || 0) > 0 && (
                  <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {stats.unreadNotifications}
                  </span>
                )}
              </button>

              {/* Profile Avatar Pill */}
              <Link
                href="/mobile-reporter/profile"
                className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs overflow-hidden border border-orange-200 shrink-0"
                title="मेरी प्रोफाइल"
              >
                {profile?.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.fullName || 'रिपोर्टर'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.fullName?.slice(0, 1) || 'र'
                )}
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="लॉगआउट"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full px-3 py-4">
          {children}
        </main>

        {/* Mandatory Technology Partner Footer */}
        <footer className="mt-8 border-t border-stone-200 bg-white py-3 px-4 text-center text-[11px] text-stone-500">
          <div className="flex flex-col items-center justify-center gap-1">
            <span>© {new Date().getFullYear()} दैनिक मान्यवर (Dainik Manyavar)</span>
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

        {/* Native-style Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-xl px-2 py-1.5 flex items-center justify-around pointer-events-auto">
            <Link
              href="/mobile-reporter"
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                pathname === '/mobile-reporter'
                  ? 'text-[#EA580C] font-black'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px]">डैशबोर्ड</span>
            </Link>

            {/* Highlighted New Story FAB */}
            <Link
              href="/mobile-reporter/news/new"
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                pathname.startsWith('/mobile-reporter/news')
                  ? 'text-[#EA580C] font-black'
                  : 'text-stone-700 hover:text-orange-600 font-medium'
              }`}
            >
              <div className="w-10 h-10 -mt-5 rounded-full bg-gradient-to-tr from-[#EA580C] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-orange-700 mt-0.5">नई खबर</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-stone-500 hover:text-stone-900 transition-colors"
            >
              <Globe className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-medium">लाइव पोर्टल ↗</span>
            </Link>

            <Link
              href="/mobile-reporter/profile"
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                pathname === '/mobile-reporter/profile'
                  ? 'text-[#EA580C] font-black'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">मेरी प्रोफाइल</span>
            </Link>
          </div>
        </nav>

        {/* Notifications Modal Drawer */}
        {showNotifModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <h3 className="font-black text-sm text-stone-900">सूचनाएं (Notifications)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllRead}
                    className="text-xs text-orange-600 hover:underline font-bold"
                  >
                    सभी पढ़ी मार्क करें
                  </button>
                  <button
                    onClick={() => setShowNotifModal(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-3 overflow-y-auto flex-1 divide-y divide-stone-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400">कोई नई सूचना नहीं है</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`py-2.5 px-2 rounded-xl text-xs ${
                        notif.read ? 'opacity-70' : 'bg-orange-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-stone-900">{notif.title}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(notif.createdAt).toLocaleTimeString('hi-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
