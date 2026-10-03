'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileBrandLogo() {
  const [mobileLogo, setMobileLogo] = useState<string>('/mobile-brand-logo.jpg');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.mobile_logo) {
            setMobileLogo(data.data.mobile_logo);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Link
      href="/mobile"
      className="inline-flex items-center group select-none py-0.5 active:scale-95 transition-transform"
      title="दैनिक मान्यवर - मुख्य पृष्ठ"
    >
      <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 flex items-center justify-center rounded-xl overflow-hidden bg-white shadow-xs border border-stone-200/90 dark:border-stone-700 transition-colors">
        <Image
          src={mobileLogo || '/mobile-brand-logo.jpg'}
          alt="दैनिक मान्यवर"
          width={120}
          height={120}
          priority
          unoptimized
          className="w-full h-full object-contain p-0.5"
        />
      </div>
    </Link>
  );
}

