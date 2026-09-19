'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileBrandLogo() {
  const [siteLogo, setSiteLogo] = useState<string>('/uploads/1788514240911_adlogomain.jpg');
  const [siteTagline, setSiteTagline] = useState<string>('सब पर नजर  सबकी खबर');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.site_logo) {
            setSiteLogo(data.data.site_logo);
          }
          const tagline = data.data.site_tagline || data.data.site_subtitle;
          if (tagline !== undefined && tagline !== null) {
            setSiteTagline(tagline);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Link
      href="/mobile"
      className="inline-flex flex-col items-center group select-none py-0.5"
      title="दैनिक मान्यवर"
    >
      <div className="relative h-8 sm:h-9 w-auto flex items-center justify-center dark:bg-white/95 dark:rounded-md dark:px-1 dark:py-0.5 transition-colors">
        <Image
          src={siteLogo || '/logo.png'}
          alt="दैनिक मान्यवर"
          width={280}
          height={70}
          priority
          unoptimized
          className="h-8 sm:h-9 w-auto object-contain"
        />
      </div>
      {siteTagline && (
        <p className="text-[9px] sm:text-[10px] font-bold text-stone-700 dark:text-stone-300 tracking-wider text-center mt-0.5 font-serif border-t border-stone-200/80 dark:border-stone-700 pt-0.5 w-full whitespace-nowrap">
          {siteTagline}
        </p>
      )}
    </Link>
  );
}

