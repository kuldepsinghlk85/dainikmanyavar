'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Archive, RotateCcw, Search, CheckSquare, Square, AlertCircle, Clock } from 'lucide-react';

interface ArchivedArticle {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  excerpt?: string;
  updatedAt: string;
  publishedAt: string;
  category?: { name: string };
  location?: { name: string };
}

export default function NewsArchiveAdminPage() {
  const [articles, setArticles] = useState<ArchivedArticle[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [daysOlder, setDaysOlder] = useState(30);
  const [loading, setLoading] = useState(false);

  const fetchArchivedNews = async () => {
    try {
      const res = await fetch(`/api/admin/archive/news?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
        setSelectedIds([]);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchArchivedNews();
  }, [search]);

  const handleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((a) => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Restore Selected Articles back to Live Published
  const handleRestoreSelected = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/archive/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE', ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchArchivedNews();
      }
    } catch (err) {}
    setLoading(false);
  };

  // Auto-Archive Older News
  const handleAutoArchive = async () => {
    if (!confirm(`क्या आप ${daysOlder} दिन से पुरानी सभी खबरों को आर्काइव में डालना चाहते हैं?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/archive/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ARCHIVE_OLDER', daysOlder }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchArchivedNews();
      }
    } catch (err) {}
    setLoading(false);
  };

  const isAllSelected = articles.length > 0 && selectedIds.length === articles.length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>📦 न्यूज़ आर्काइवर लाइब्रेरी (News Archive Library)</span>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              {articles.length} आर्काइव्ड खबरें
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            पुराने समाचारों को आर्काइव में सुरक्षित रखने और पुनः रिस्टोर (Live Published) करने का स्थान
          </p>
        </div>

        {/* Auto Archive Control */}
        <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-stone-700">पुराने समाचार:</span>
          <select
            value={daysOlder}
            onChange={(e) => setDaysOlder(Number(e.target.value))}
            className="p-1 border border-stone-300 rounded text-xs font-bold"
          >
            <option value={15}>15 दिन से पुराने</option>
            <option value={30}>30 दिन से पुराने</option>
            <option value={60}>60 दिन से पुराने</option>
            <option value={90}>90 दिन से पुराने</option>
          </select>
          <button
            onClick={handleAutoArchive}
            disabled={loading}
            className="bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            आर्काइव करें
          </button>
        </div>
      </div>

      {/* Search & Bulk Toolbar */}
      <div className="bg-[#0F172A] text-white p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-xs font-extrabold text-white hover:text-orange-400 cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-[#F97316]" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{isAllSelected ? 'सभी चुनें (Deselect All)' : 'सभी चुनें (Select All)'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-black bg-[#EA580C] text-white px-2.5 py-0.5 rounded-full font-mono">
            {selectedIds.length} खबर चयनित
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="आर्काइव में खोजें..."
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#F97316]"
            />
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleRestoreSelected}
              disabled={loading}
              className="bg-[#16A34A] hover:bg-green-700 text-white px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>चुनी गई {selectedIds.length} खबरें रिस्टोर करें (Restore to Live)</span>
            </button>
          )}
        </div>
      </div>

      {/* Archived Articles Grid/List */}
      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500 space-y-3 shadow-sm">
            <Archive className="w-12 h-12 mx-auto text-stone-300" />
            <p className="font-extrabold text-stone-800 text-base">कोई भी आर्काइव्ड समाचार नहीं है</p>
            <p className="text-xs text-stone-500">ऊपर "पुराने समाचार आर्काइव करें" बटन दबाएं</p>
          </div>
        ) : (
          articles.map((art) => {
            const isSelected = selectedIds.includes(art.id);
            return (
              <div
                key={art.id}
                className={`bg-white p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 shadow-xs ${
                  isSelected ? 'border-[#EA580C] bg-orange-50/20' : 'border-stone-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button onClick={() => handleToggleSelect(art.id)} className="cursor-pointer">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#EA580C]" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                    )}
                  </button>

                  <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                    <Image
                      src={art.featuredImage || 'https://via.placeholder.com/150'}
                      alt={art.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] mb-1">
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                        📦 ARCHIVED
                      </span>
                      {art.category && (
                        <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold">
                          {art.category.name}
                        </span>
                      )}
                      <span className="text-stone-400 font-mono">
                        {new Date(art.publishedAt).toLocaleDateString('hi-IN')}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-stone-900 text-sm truncate">{art.title}</h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedIds([art.id]);
                    handleRestoreSelected();
                  }}
                  className="bg-[#16A34A] hover:bg-green-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>रिस्टोर करें</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
