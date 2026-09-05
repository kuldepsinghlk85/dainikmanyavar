'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOut, Menu, X, Globe, ShieldCheck } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeUser, setActiveUser] = useState({
    name: 'एडमिन यूजर',
    role: 'SUPER_ADMIN',
  });

  useEffect(() => {
    setMounted(true);
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setActiveUser({
            name: data.user.name || 'एडमिन यूजर',
            role: data.user.role || 'SUPER_ADMIN',
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex bg-stone-100 font-sans" suppressHydrationWarning>
        <div className="flex-1 flex items-center justify-center p-8 text-xs font-bold text-stone-400">
          दैनिक मान्यवर एडमिन कंसोल लोड हो रहा है...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-stone-100 font-sans" suppressHydrationWarning>
      {/* Desktop Sidebar (Sticky Left) */}
      <div className="hidden md:block sticky top-0 h-screen flex-shrink-0 z-30" suppressHydrationWarning>
        <AdminSidebar userName={activeUser.name} userRole={activeUser.role} />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" suppressHydrationWarning>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#0F172A] flex flex-col z-50">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <AdminSidebar userName={activeUser.name} userRole={activeUser.role} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0" suppressHydrationWarning>
        {/* Top Navigation Header */}
        <header className="bg-white border-b border-stone-200 py-3 px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer flex items-center gap-1.5 font-bold text-xs"
            >
              <Menu className="w-5 h-5 text-[#EA580C]" />
              <span>नेविगेशन मेनू</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#EA580C] px-3 py-1.5 rounded-lg border border-stone-200 hover:border-orange-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>मुख्य वेबसाइट देखें</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Badge */}
            {activeUser.role === 'SUPER_ADMIN' || activeUser.role === 'ADMINISTRATOR' ? (
              <div className="flex items-center gap-2">
                <span className="bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 shadow-xs">
                  <span>👑 सुपर एडमिन (Super Admin)</span>
                </span>
                <Link
                  href="/admin/editor"
                  className="hidden md:flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                >
                  <span>🎯 संपादक डेस्क ओवरसाइट</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-900 border border-blue-300 px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 shadow-xs">
                  <span>✍️ संपादक पैनल (News Editor)</span>
                </span>
                <Link
                  href="/admin/editor"
                  className="hidden md:flex items-center gap-1 bg-[#EA580C] hover:bg-orange-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                >
                  <span>🎯 संपादक कार्यक्षेत्र</span>
                </Link>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[11px] font-bold border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>सर्वर सक्रिय (Online)</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-stone-400 border-l border-stone-200 pl-3">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Dainik Manyavar CMS v2.0</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto" suppressHydrationWarning>
          {children}
        </main>
      </div>
    </div>
  );
}
