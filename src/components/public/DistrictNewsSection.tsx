'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatHindiTimeAgo, formatCount } from '@/lib/utils';

interface DistrictStory {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  publishedAt: Date | string;
  viewCount: number;
  district: string;
}

interface DistrictNewsSectionProps {
  stories?: DistrictStory[];
}

export default function DistrictNewsSection({ stories }: DistrictNewsSectionProps) {
  const [activeDistrict, setActiveDistrict] = useState('जौनपुर');

  const districts = ['जौनपुर', 'वाराणसी', 'प्रयागराज', 'लखनऊ', 'सुल्तानपुर'];

  const defaultStories: DistrictStory[] = [
    { id: '1', title: 'शाहगंज में विकास कार्यों का अधिकारियों ने किया निरीक्षण', slug: 'shahganj-jaunpur-development-work-inspection', featuredImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=700&q=80', publishedAt: new Date(Date.now() - 3600000 * 6), viewCount: 3400, district: 'जौनपुर' },
    { id: '2', title: 'किसानों की आय बढ़ाने के लिए नई योजना का ऐलान', slug: 'farmers-income-boost-new-subsidy-scheme', featuredImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80', publishedAt: new Date(Date.now() - 3600000 * 8), viewCount: 2900, district: 'वाराणसी' },
    { id: '3', title: 'युवाओं के लिए जौनपुर में विशाल रोजगार मेला आयोजित', slug: 'jaunpur-job-fair-youth-employment-drive', featuredImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80', publishedAt: new Date(Date.now() - 3600000 * 10), viewCount: 2600, district: 'जौनपुर' },
    { id: '4', title: 'मानसून का कहर: नदियां उफान पर, अलर्ट जारी', slug: 'monsoon-heavy-rainfall-up-districts-alert', featuredImage: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=700&q=80', publishedAt: new Date(Date.now() - 3600000 * 12), viewCount: 16300, district: 'प्रयागराज' },
  ];

  const storyList = stories && stories.length > 0 ? stories : defaultStories;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center border-b-2 border-[#F97316] pb-2 mb-3">
        <h3 className="text-xl font-bold text-[#171717]">📍 जिले की खबरें</h3>
        <Link href="/district/jaunpur" className="text-xs text-[#EA580C] font-semibold hover:underline">
          और देखें →
        </Link>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 mb-3.5 no-scrollbar">
        {districts.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDistrict(d)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
              activeDistrict === d
                ? 'bg-[#F97316] text-white border-[#F97316]'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-orange-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Grid of Small Stories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {storyList.map((story) => (
          <div key={story.id} className="border-b border-stone-200 pb-3 flex flex-col justify-between">
            <div>
              <div className="relative w-full h-[105px] rounded-lg overflow-hidden bg-stone-100 mb-2">
                <Image
                  src={story.featuredImage || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=700&q=80'}
                  alt={story.title}
                  fill
                  className="object-cover"
                />
              </div>
              <Link href={`/news/${story.slug}`}>
                <b className="text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-2 hover:text-[#F97316] transition-colors">
                  {story.title}
                </b>
              </Link>
            </div>
            <div className="text-[11px] text-stone-400 mt-2 flex justify-between">
              <span>{formatHindiTimeAgo(story.publishedAt)}</span>
              <span>👁 {formatCount(story.viewCount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
