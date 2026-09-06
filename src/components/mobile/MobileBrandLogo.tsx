'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileBrandLogo() {
  return (
    <Link href="/mobile" className="flex items-center group select-none py-0.5" title="दैनिक मान्यवर">
      {/* Light Mode Logo (Exact Original Logo on Transparent Background) */}
      <div className="relative h-10 sm:h-11 w-32 sm:w-36 dark:hidden">
        <Image
          src="/mobile-logo.png?v=2"
          alt="दैनिक मान्यवर"
          fill
          priority
          unoptimized
          className="object-contain object-left"
        />
      </div>

      {/* Dark Mode Logo (Exact Original Logo with Clean White Text on Transparent Background) */}
      <div className="relative h-10 sm:h-11 w-32 sm:w-36 hidden dark:block">
        <Image
          src="/mobile-logo-dark.png?v=2"
          alt="दैनिक मान्यवर"
          fill
          priority
          unoptimized
          className="object-contain object-left"
        />
      </div>
    </Link>
  );
}
