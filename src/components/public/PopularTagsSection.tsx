'use client';

import React from 'react';
import Link from 'next/link';

export default function PopularTagsSection() {
  const tags = [
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

  return (
    <div className="border border-[#E8E8E8] rounded-xl p-3.5 bg-white shadow-soft flex flex-col justify-between">
      <div>
        <div className="border-b-2 border-[#F97316] pb-1.5 mb-3">
          <h3 className="text-lg font-bold text-[#171717]">🏷️ लोकप्रिय टैग</h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tag/${t.slug}`}
              className="tag-chip text-xs hover:bg-[#FFEDD5] hover:scale-105 transition-all py-1 px-2.5"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
