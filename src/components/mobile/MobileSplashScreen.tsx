'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function MobileSplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if splash was already shown in this session
    try {
      const alreadyShown = sessionStorage.getItem('dm_splash_seen');
      if (!alreadyShown) {
        setVisible(true);
        sessionStorage.setItem('dm_splash_seen', '1');

        const fadeTimer = setTimeout(() => {
          setFadeOut(true);
        }, 1100);

        const removeTimer = setTimeout(() => {
          setVisible(false);
        }, 1500);

        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(removeTimer);
        };
      }
    } catch (_) {
      // In case sessionStorage is blocked
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={() => setVisible(false)}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-white via-orange-50/40 to-amber-50 select-none cursor-pointer transition-opacity duration-400 ease-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ willChange: 'opacity' }}
    >
      <div className="flex flex-col items-center text-center px-6 animate-in fade-in zoom-in-95 duration-500">
        {/* App Icon Container */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-5 rounded-3xl bg-white shadow-2xl shadow-orange-500/20 p-2.5 border border-orange-100 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="दैनिक मान्यवर"
            width={128}
            height={128}
            priority
            unoptimized
            className="w-full h-full object-contain"
          />
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-1">
          दैनिक मान्यवर
        </h1>
        <p className="text-xs sm:text-sm font-bold text-orange-600 tracking-wide">
          सच के साथ... समाज के लिए...
        </p>

        {/* Minimal pulse loader */}
        <div className="mt-8 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></span>
        </div>
      </div>

      {/* Technology Partner footer badge */}
      <div className="absolute bottom-6 text-[11px] text-stone-400 font-mono">
        Technology Partner: EasyLauncher.net
      </div>
    </div>
  );
}
