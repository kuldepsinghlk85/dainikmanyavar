'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Flame,
  Clock,
  MapPin,
  ExternalLink,
  Eye,
  RefreshCw,
  Newspaper,
} from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  newsId?: number | null;
  featuredImage?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  viewCount: number;
  isMainStory?: boolean;
  category?: {
    id: string;
    name: string;
    nameHi?: string;
  } | null;
  location?: {
    id: string;
    name: string;
    nameHi?: string;
  } | null;
}

interface PortalLatestNewsFeedProps {
  limit?: number;
}

export default function PortalLatestNewsFeed({ limit = 2 }: PortalLatestNewsFeedProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'MAIN'>('ALL');

  const fetchNews = async (mode: 'ALL' | 'MAIN' = filterMode) => {
    setLoading(true);
    try {
      const url =
        mode === 'MAIN'
          ? `/api/articles?limit=${limit}&status=PUBLISHED&main=true`
          : `/api/articles?limit=${limit}&status=PUBLISHED`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setArticles(data.data.slice(0, limit));
      } else {
        setArticles([]);
      }
    } catch (_) {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(filterMode);
  }, [filterMode, limit]);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <section className="mt-8 mb-6 border border-orange-200/90 bg-gradient-to-b from-orange-50/50 via-white to-white rounded-3xl p-4 sm:p-6 shadow-xs">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-orange-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black tracking-wide border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
              लाइव पोर्टल
            </span>
            <span className="text-[11px] text-stone-500 font-medium">एडमिन द्वारा प्रकाशित मुख्य समाचार</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#EA580C]" />
            <span>पोर्टल की मुख्य खबरें</span>
          </h2>
        </div>

        {/* Action Controls & Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-0.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ताज़ा
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('MAIN')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                filterMode === 'MAIN'
                  ? 'bg-orange-600 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-orange-600'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              मुख्य
            </button>
          </div>

          <button
            type="button"
            onClick={() => fetchNews(filterMode)}
            disabled={loading}
            className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>लाइव वेबसाइट</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>
        </div>
      </div>

      {/* Grid of Articles - Exactly 2 Blocks, beautifully spaced */}
      <div className="pt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse space-y-3"
              >
                <div className="w-full h-44 bg-stone-200 rounded-xl" />
                <div className="h-4 bg-stone-200 rounded-md w-3/4" />
                <div className="h-3 bg-stone-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-stone-200">
            <Newspaper className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-stone-600">कोई समाचार उपलब्ध नहीं है</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {articles.slice(0, 2).map((item) => {
              const liveUrl = `/news/${encodeURIComponent(item.slug || '')}`;
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden shadow-xs"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative w-full h-44 sm:h-52 bg-stone-100 overflow-hidden">
                      {item.featuredImage ? (
                        <img
                          src={item.featuredImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400 p-4 text-center">
                          <Newspaper className="w-10 h-10 mb-1 text-stone-300" />
                          <span className="text-xs font-bold text-stone-500">दैनिक मान्यवर</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      {item.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold shadow-xs">
                          {item.category.nameHi || item.category.name}
                        </span>
                      )}

                      {/* Main Story Flame */}
                      {item.isMainStory && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-orange-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                          <Flame className="w-3 h-3" />
                          मुख्य खबर
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 pb-3">
                      {/* Location & Time (Clean, never broken) */}
                      <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-2">
                        {item.location ? (
                          <span className="inline-flex items-center gap-1 font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                            <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                            <span>{item.location.nameHi || item.location.name}</span>
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 whitespace-nowrap">
                          <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="font-bold text-stone-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-[#EA580C] transition-colors"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Footer / Action */}
                  <div className="p-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs bg-stone-50/60">
                    <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                      <Eye className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.viewCount || 0} पाठक</span>
                    </span>

                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-[#EA580C] text-orange-800 hover:text-white font-bold text-xs transition-colors shadow-2xs group/link"
                    >
                      <span>लाइव पढ़ें</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
