'use client';

import React from 'react';
import Link from 'next/link';

export interface TagItem {
  name: string;
  slug: string;
}

interface PopularTagsSectionProps {
  tags?: TagItem[];
}

const DEFAULT_TAGS: TagItem[] = [
  { name: '#फिल्मों_के_रिव्यू', slug: 'फिल्मों-के-रिव्यू' },
  { name: '#फिल्में', slug: 'फिल्में' },
  { name: '#मनोरंजन', slug: 'मनोरंजन' },
  { name: '#बॉलीवुड', slug: 'बॉलीवुड' },
  { name: '#जौनपुर', slug: 'jaunpur' },
  { name: '#उत्तर_प्रदेश', slug: 'uttar_pradesh' },
  { name: '#शिक्षा', slug: 'shiksha' },
  { name: '#किसान', slug: 'kisan' },
  { name: '#राजनीति', slug: 'rajneeti' },
  { name: '#स्वास्थ्य', slug: 'swasthya' },
  { name: '#रोजगार', slug: 'rojgar' },
  { name: '#विकास', slug: 'vikas' },
  { name: '#मानसून', slug: 'monsoon' },
  { name: '#देश', slug: 'desh' },
  { name: '#डिफेंस', slug: 'defence' },
  { name: '#अर्थजगत', slug: 'arthjagat' },
  { name: '#सब्सिडी', slug: 'subsidy' },
  { name: '#वायुसेना', slug: 'vayusena' },
  { name: '#हेल्थकेयर', slug: 'healthcare' },
];

export default function PopularTagsSection({ tags }: PopularTagsSectionProps) {
  const displayTags = tags && tags.length > 0 ? tags : DEFAULT_TAGS;

  return (
    <div className="border border-[#E8E8E8] rounded-xl p-3.5 bg-white shadow-soft flex flex-col justify-between">
      <div>
        <div className="border-b-2 border-[#F97316] pb-1.5 mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#171717]">🏷️ लोकप्रिय टैग</h3>
          <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            ट्रेंडिंग
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {displayTags.map((t) => (
            <Link
              key={t.slug}
              href={`/tag/${encodeURIComponent(t.slug)}`}
              className="tag-chip text-xs hover:bg-[#FFEDD5] hover:text-[#EA580C] hover:border-orange-300 hover:scale-105 transition-all py-1 px-2.5 font-medium"
            >
              {t.name.startsWith('#') ? t.name : `#${t.name}`}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
