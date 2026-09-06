'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Monitor } from 'lucide-react';

export default function MobileFooter() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-6 pb-20 px-4 mt-4 border-t-4 border-[#EA580C] text-xs space-y-4">
      {/* Brand & Slogan */}
      <div className="space-y-1.5">
        <Link href="/mobile" className="inline-block">
          <Image
            src="/mobile-logo-dark.png?v=2"
            alt="दैनिक मान्यवर"
            width={180}
            height={45}
            unoptimized
            className="h-9 w-auto object-contain"
          />
        </Link>
        <p className="text-[11px] text-stone-400 font-bold">
          निष्पक्ष एवं निर्भीक राष्ट्रीय हिंदी दैनिक समाचार पत्र
        </p>
      </div>

      {/* Switch to Desktop */}
      <div className="pt-2">
        <Link
          href="/?view=desktop"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-400 font-black rounded-xl border border-stone-700 transition-colors"
        >
          <Monitor className="w-4 h-4" />
          <span>🖥️ पूरा डेस्कटॉप वर्जन खोलें</span>
        </Link>
      </div>

      {/* Links */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] font-bold text-stone-400 pt-2 border-t border-stone-800">
        <Link href="/mobile" className="hover:text-white">होम</Link>
        <Link href="/epaper" className="hover:text-white">ई-पेपर</Link>
        <Link href="/video" className="hover:text-white">वीडियो</Link>
        <Link href="/contact" className="hover:text-white">संपर्क करें</Link>
        <Link href="/contact" className="hover:text-white">विज्ञापन दरें</Link>
      </div>

      {/* Copyright */}
      <div className="text-center text-[10px] text-stone-500 font-mono pt-2 border-t border-stone-800">
        &copy; {new Date().getFullYear()} दैनिक मान्यवर (Dainik Manyavar). सर्वाधिकार सुरक्षित।
      </div>
    </footer>
  );
}
