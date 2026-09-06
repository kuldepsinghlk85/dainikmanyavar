'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatHindiTimeAgo, formatCount } from '@/lib/utils';
import { MapPin, Newspaper, Loader2, ArrowRight } from 'lucide-react';

export interface LocationItem {
  id: string;
  name: string;
  slug: string;
}

export interface DistrictStory {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  publishedAt: Date | string;
  viewCount: number;
  locationId?: string | null;
  location?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  category?: {
    name: string;
    slug?: string;
  } | null;
  district?: string;
}

interface DistrictNewsSectionProps {
  initialLocations?: LocationItem[];
  initialArticles?: DistrictStory[];
}

const DEFAULT_DISTRICTS: LocationItem[] = [
  { id: 'fb0971f1-ebb0-412c-bc19-ed8179d331c5', name: 'जौनपुर', slug: 'jaunpur' },
  { id: '73c2aa30-78bb-4293-943c-6cd2d2d2028f', name: 'वाराणसी', slug: 'varanasi' },
  { id: 'ce5a034a-61b7-433b-b9ed-a96a9a5b9965', name: 'प्रयागराज', slug: 'prayagraj' },
  { id: '9c75fe27-9583-45fd-9520-26060401231c', name: 'लखनऊ', slug: 'lucknow' },
  { id: 'd01feada-2862-47df-be32-71edefe448d3', name: 'मऊ', slug: 'mau' },
  { id: 'cdd6c611-d302-4cb2-9e57-b8357cf038e1', name: 'सुल्तानपुर', slug: 'sultanpur' },
  { id: '15cdf010-c6b2-4a64-8f71-cecc79d110b4', name: 'मिर्ज़ापुर', slug: 'mirzapur' },
];

export default function DistrictNewsSection({
  initialLocations,
  initialArticles = [],
}: DistrictNewsSectionProps) {
  const [locations, setLocations] = useState<LocationItem[]>(
    initialLocations && initialLocations.length > 0 ? initialLocations : DEFAULT_DISTRICTS
  );

  // Active district state - defaults to the first district on the left (the one with the most news)
  const [activeDistrict, setActiveDistrict] = useState<LocationItem>(() => {
    if (initialLocations && initialLocations.length > 0) {
      return initialLocations[0];
    }
    return DEFAULT_DISTRICTS[0];
  });

  // In-memory cache of articles per location slug or id
  const [articlesCache, setArticlesCache] = useState<Record<string, DistrictStory[]>>(() => {
    const cache: Record<string, DistrictStory[]> = {};
    if (initialArticles && initialArticles.length > 0) {
      for (const art of initialArticles) {
        const key = art.location?.slug || art.location?.name || art.district || 'other';
        if (!cache[key]) cache[key] = [];
        cache[key].push(art);

        if (art.location?.id) {
          if (!cache[art.location.id]) cache[art.location.id] = [];
          cache[art.location.id].push(art);
        }
      }
    }
    return cache;
  });

  const [loading, setLoading] = useState(false);

  // If locations weren't provided, fetch dynamically only active districts with published articles ordered by news count DESC
  useEffect(() => {
    if (!initialLocations || initialLocations.length === 0) {
      fetch('/api/locations?type=DISTRICT&onlyActive=true&withArticlesOnly=true&orderBy=articlesCount')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setLocations(data.data);
            setActiveDistrict(data.data[0]);
          }
        })
        .catch(() => {});
    }
  }, [initialLocations]);

  // Load articles when active district changes if not in cache
  useEffect(() => {
    if (!activeDistrict?.slug) return;

    const cacheKey = activeDistrict.slug;
    const idKey = activeDistrict.id;

    // Check if we already have articles cached for this district
    if (articlesCache[cacheKey] !== undefined || articlesCache[idKey] !== undefined) {
      return;
    }

    setLoading(true);
    fetch(`/api/articles?district=${encodeURIComponent(activeDistrict.slug)}&limit=8`)
      .then((res) => res.json())
      .then((resData) => {
        const fetchedList: DistrictStory[] = resData.data || [];
        setArticlesCache((prev) => ({
          ...prev,
          [cacheKey]: fetchedList,
          [idKey]: fetchedList,
        }));
      })
      .catch(() => {
        setArticlesCache((prev) => ({
          ...prev,
          [cacheKey]: [],
        }));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeDistrict, articlesCache]);

  // Get current active stories
  const currentStories = useMemo(() => {
    if (!activeDistrict) return [];
    return (
      articlesCache[activeDistrict.slug] ||
      articlesCache[activeDistrict.id] ||
      articlesCache[activeDistrict.name] ||
      []
    );
  }, [activeDistrict, articlesCache]);

  return (
    <div className="mt-6 border border-stone-200 rounded-2xl p-4 sm:p-5 bg-white shadow-soft">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-[#F97316] pb-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#EA580C]" />
          <h3 className="text-xl font-bold text-[#171717]">जिले की खबरें</h3>
          {activeDistrict && (
            <span className="hidden sm:inline-block text-xs font-semibold bg-orange-100 text-[#EA580C] px-2.5 py-0.5 rounded-full">
              {activeDistrict.name}
            </span>
          )}
        </div>
        <Link
          href={`/district/${activeDistrict?.slug || 'jaunpur'}`}
          className="text-xs text-[#EA580C] font-bold hover:underline flex items-center gap-1 group"
        >
          और देखें <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Horizontal Tabs for Districts */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 mb-4 no-scrollbar">
        {locations.map((d) => {
          const isActive = activeDistrict?.id === d.id || activeDistrict?.name === d.name;
          return (
            <button
              key={d.id || d.slug}
              type="button"
              onClick={() => setActiveDistrict(d)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-orange-50 hover:text-[#EA580C] hover:border-orange-200'
              }`}
            >
              {d.name}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-stone-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
          <span className="text-xs font-medium">{activeDistrict.name} की खबरें लोड हो रही हैं...</span>
        </div>
      ) : currentStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentStories.slice(0, 4).map((story) => (
            <div
              key={story.id}
              className="border-b sm:border-b-0 sm:border border-stone-200 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-md transition-shadow group bg-white"
            >
              <div>
                <div className="relative w-full h-[120px] rounded-lg overflow-hidden bg-stone-100 mb-2.5">
                  <Image
                    src={
                      story.featuredImage ||
                      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=700&q=80'
                    }
                    alt={story.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {story.category && (
                    <span className="absolute top-2 left-2 text-[9px] font-black bg-[#EA580C] text-white px-2 py-0.5 rounded shadow-sm">
                      {story.category.name}
                    </span>
                  )}
                </div>
                <Link href={`/news/${story.slug}`}>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors">
                    {story.title}
                  </h4>
                </Link>
              </div>
              <div className="text-[11px] text-stone-400 mt-2.5 flex justify-between pt-2 border-t border-stone-100 font-mono">
                <span>{formatHindiTimeAgo(story.publishedAt)}</span>
                <span>👁 {formatCount(story.viewCount)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State for District with no articles yet */
        <div className="py-8 px-4 text-center bg-stone-50 border border-stone-200/80 rounded-xl">
          <div className="w-10 h-10 bg-orange-100 text-[#EA580C] rounded-full flex items-center justify-center mx-auto mb-2">
            <Newspaper className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-800">
            {activeDistrict.name} जिले के लिए अभी कोई विशेष समाचार नहीं है
          </h4>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            हमारे ब्यूरो संवाददाता जल्द ही {activeDistrict.name} की ताज़ा ख़बरें यहाँ अपडेट करेंगे।
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Link
              href={`/district/${activeDistrict.slug}`}
              className="text-xs font-bold text-[#EA580C] hover:underline"
            >
              {activeDistrict.name} का पेज देखें →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
