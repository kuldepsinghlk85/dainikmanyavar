'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AdBannerProps {
  position?: 'header_wide' | 'sidebar_box' | 'sidebar_tall' | 'sidebar_box2' | 'in_article';
  label?: string;
  sizeText?: string;
  className?: string;
}

export default function AdBanner({ position = 'header_wide', label, sizeText, className }: AdBannerProps) {
  const [adSlot, setAdSlot] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/ads?position=${position}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAdSlot(data.data);
        }
      })
      .catch(() => {});
  }, [position]);

  const isHeaderAd = position === 'header_wide';

  // If real active ad creative exists, render dynamic creative image!
  if (adSlot && adSlot.active && adSlot.desktopCreative) {
    const targetLink = adSlot.targetUrl;
    const isExternal = targetLink && targetLink.startsWith('http');

    const defaultClass = isHeaderAd
      ? "relative w-full max-w-[970px] h-[65px] sm:h-[80px] rounded-xl overflow-hidden border border-stone-200 group shadow-xs mx-auto"
      : "relative w-full rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-stone-200 group";

    const content = (
      <div className={className || defaultClass}>
        <span className="absolute top-1 right-1 bg-black/70 text-white text-[8px] px-1.5 py-0.2 rounded z-10 font-bold">
          प्रायोजित (Ad)
        </span>
        <img
          src={adSlot.desktopCreative}
          alt={adSlot.name || 'विज्ञापन'}
          className="w-full h-full object-cover block"
        />
      </div>
    );

    const marginStyle = isHeaderAd ? "block w-full my-2 flex justify-center" : "block my-3";

    if (targetLink) {
      if (isExternal) {
        return (
          <a href={targetLink} target="_blank" rel="noopener noreferrer" className={marginStyle}>
            {content}
          </a>
        );
      }
      return (
        <Link href={targetLink} className={marginStyle}>
          {content}
        </Link>
      );
    }

    return <div className={marginStyle}>{content}</div>;
  }

  // Otherwise, render styled placeholder without 404 links
  if (position === 'sidebar_box') {
    return (
      <div className="bg-[#FAF9F6] border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-stone-500 min-h-[220px]">
        <span className="font-bold text-xs text-stone-700">विज्ञापन स्थान</span>
        <span className="text-[11px] text-stone-400 my-1 font-mono">{sizeText || '300 × 250 / Sidebar Ad #1'}</span>
        <span className="text-[11px] text-[#C2410C] bg-orange-100/80 border border-orange-200 px-3 py-1 rounded-xl font-bold cursor-default select-none">
          विज्ञापन स्थान उपलब्ध
        </span>
      </div>
    );
  }

  if (position === 'sidebar_tall') {
    return (
      <div className="bg-[#FAF9F6] border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-stone-500 min-h-[260px]">
        <span className="font-bold text-xs text-stone-700">विशेष प्रचार स्थान</span>
        <span className="text-[11px] text-stone-400 my-1 font-mono">{sizeText || '300 × 300 / Sidebar Ad #2'}</span>
        <span className="text-[11px] text-[#C2410C] bg-orange-100/80 border border-orange-200 px-3 py-1 rounded-xl font-bold cursor-default select-none">
          विज्ञापन स्थान उपलब्ध
        </span>
      </div>
    );
  }

  if (position === 'sidebar_box2') {
    return (
      <div className="bg-[#FAF9F6] border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-stone-500 min-h-[200px]">
        <span className="font-bold text-xs text-stone-700">विज्ञापन स्थान</span>
        <span className="text-[11px] text-stone-400 my-1 font-mono">{sizeText || '300 × 250 / Sidebar Ad #3'}</span>
        <span className="text-[11px] text-[#C2410C] bg-orange-100/80 border border-orange-200 px-3 py-1 rounded-xl font-bold cursor-default select-none">
          विज्ञापन स्थान उपलब्ध
        </span>
      </div>
    );
  }

  return (
    <div className="my-2 bg-gradient-to-r from-stone-100 to-stone-50 border border-dashed border-stone-300 rounded-xl h-[65px] sm:h-[75px] max-w-[970px] w-full mx-auto px-4 flex items-center justify-between text-stone-600">
      <div className="text-left">
        <strong className="text-xs text-stone-800 block leading-tight">विज्ञापन स्थान</strong>
        <span className="text-[10px] text-stone-400 block font-mono">{sizeText || '970 × 90 / Responsive Top Banner'}</span>
      </div>
      <span className="text-xs text-[#C2410C] bg-orange-100/80 border border-orange-200 px-3 py-1 rounded-lg font-bold cursor-default select-none">
        विज्ञापन स्थान उपलब्ध
      </span>
    </div>
  );
}
