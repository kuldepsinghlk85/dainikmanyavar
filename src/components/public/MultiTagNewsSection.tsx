'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MultiTagNewsSection() {
  const items = [
    {
      id: '1',
      title: 'मानसून से कई जिलों में भारी बारिश, जनजीवन प्रभावित',
      slug: 'monsoon-heavy-rainfall-up-districts-alert',
      featuredImage: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=700&q=80',
      tags: ['#बारिश', '#मानसून', '#उत्तर_प्रदेश'],
    },
    {
      id: '2',
      title: 'किसानों की आय बढ़ाने के लिए नई सब्सिडी योजना',
      slug: 'farmers-income-boost-new-subsidy-scheme',
      featuredImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80',
      tags: ['#किसान', '#सब्सिडी', '#सरकार'],
    },
    {
      id: '3',
      title: 'युवाओं के लिए रोजगार मेला आयोजित, कई कंपनियां शामिल',
      slug: 'jaunpur-job-fair-youth-employment-drive',
      featuredImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80',
      tags: ['#रोजगार', '#युवा', '#जौनपुर'],
    },
  ];

  return (
    <div className="border border-[#E8E8E8] rounded-xl p-4 bg-white shadow-soft">
      <div className="flex justify-between items-center border-b-2 border-[#F97316] pb-2 mb-3">
        <h3 className="text-xl font-bold text-[#171717]"># मल्टी टैग न्यूज़</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {items.map((item) => (
          <div key={item.id} className="group">
            <div className="relative w-full h-[120px] rounded-lg overflow-hidden bg-stone-100 mb-2">
              <Image
                src={item.featuredImage}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <span key={t} className="text-[10px] bg-white/90 text-[#C2410C] font-bold px-1.5 py-0.5 rounded border border-orange-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <Link href={`/news/${item.slug}`}>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug group-hover:text-[#F97316] transition-colors">
                {item.title}
              </h4>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
