'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Smartphone, X, ArrowRight } from 'lucide-react';

export default function MobileRedirectBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    const dismissed = sessionStorage.getItem('dismiss_mobile_banner');
    if (isMobile && !dismissed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <aside aria-label="मोबाइल संस्करण सूचना" className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3.5 py-2 text-xs flex items-center justify-between shadow-md sticky top-0 z-50 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2 min-w-0 mr-2">
        <Smartphone className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
        <span className="font-bold truncate text-[11px] sm:text-xs">
          📱 मोबाइल पर आसान पढ़ने के लिए नया मोबाइल वर्शन देखें
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/mobile"
          className="bg-white text-[#C2410C] font-black px-3 py-1 rounded-full shadow-xs hover:bg-orange-50 text-[11px] flex items-center gap-1 active:scale-95"
        >
          <span>मोबाइल वर्शन</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={() => {
            sessionStorage.setItem('dismiss_mobile_banner', 'true');
            setShow(false);
          }}
          className="p-1 text-white/80 hover:text-white rounded-full cursor-pointer"
          title="बंद करें"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
