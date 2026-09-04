'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, Radio, Copy, Ban, History, Settings } from 'lucide-react';

export default function ImporterSubNav() {
  const pathname = usePathname();

  const subLinks = [
    { label: '📥 इम्पोर्ट इनबॉक्स', href: '/admin/importer/inbox', icon: Inbox },
    { label: '📡 सभी RSS सोर्सेज', href: '/admin/rss/sources', icon: Radio },
    { label: '⚠️ डुप्लिकेट्स', href: '/admin/importer/duplicates', icon: Copy },
    { label: '❌ अस्वीकृत', href: '/admin/importer/rejected', icon: Ban },
    { label: '📜 सिंक हिस्ट्री', href: '/admin/rss/history', icon: History },
    { label: '⚙️ सेटिंग्स', href: '/admin/importer/settings', icon: Settings },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 pt-1 no-scrollbar">
      {subLinks.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs ${
              isActive
                ? 'bg-[#EA580C] text-white shadow-md'
                : 'bg-white text-stone-800 hover:bg-stone-100 hover:text-stone-950 border border-stone-300'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#EA580C]'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
