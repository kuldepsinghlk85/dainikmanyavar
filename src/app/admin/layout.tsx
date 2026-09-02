'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOut, Menu, X, Globe, ShieldCheck } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeUser = {
    name: 'एडमिन यूजर',
    role: 'SUPER_ADMIN',
  };

  return (
    <div className="min-h-screen flex bg-stone-100 font-sans">
      {/* Desktop Sidebar (Sticky Left) */}
      <div className="hidden md:block sticky top-0 h-screen flex-shrink-0 z-30">
        <AdminSidebar userName={activeUser.name} userRole={activeUser.role} />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
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
      <div className="flex-1 flex flex-col min-w-0">
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
              className="text-xs bg-orange-100 text-[#EA580C] border border-orange-200 px-3 py-1.5 rounded-xl font-bold hover:bg-orange-200 transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>मुख्य वेबसाइट देखें</span>
            </Link>

            <span className="hidden sm:inline-flex text-[11px] bg-green-100 text-green-700 px-2.5 py-1 rounded-lg font-bold border border-green-200">
              🟢 सर्वर सक्रिय (Online)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 font-bold hidden lg:inline">
              दैनिक मान्यवर कंट्रोल पैनल | {new Date().toLocaleDateString('hi-IN')}
            </span>

            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट</span>
              </button>
            </form>
          </div>
        </header>

        {/* Page Children Content */}
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
