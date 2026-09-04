'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, PlusCircle, Trash2, Edit, Eye, CheckSquare, Square, AlertOctagon, Archive, RotateCcw } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  publishedAt: string;
  category?: { name: string };
  author?: { name: string };
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');
  const [archivedCount, setArchivedCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchArchivedCount = async () => {
    try {
      const res = await fetch('/api/admin/archive/news');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setArchivedCount(data.data.length);
      }
    } catch (err) {}
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch(`/api/articles?status=${statusFilter}&limit=100&sortBy=id&order=desc`);
      const data = await res.json();
      if (data.success) {
        const sorted = (data.data || []).slice().sort((a: Article, b: Article) => {
          return b.id.localeCompare(a.id);
        });
        setArticles(sorted);
        setSelectedIds([]);
      }
      fetchArchivedCount();
    } catch (err) {}
  };

  useEffect(() => {
    fetchArticles();
  }, [statusFilter]);

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

  // 1-Click Archive All Active News
  const handleArchiveAll = async () => {
    if (articles.length === 0) return;
    if (!confirm(`क्या आप सभी ${articles.length} खबरों को 1-क्लिक में आर्काइव में सुरक्षित करना चाहते हैं? वे साइट के मुख्य पन्नों से हटकर आर्काइव लाइब्रेरी में सुरक्षित रहेंगी और कभी भी दोबारा रिपब्लिश की जा सकेंगी।`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/archive/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ARCHIVE_ALL' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'सभी खबरें सफलतापूर्वक आर्काइव में भेज दी गईं!');
        fetchArticles();
      }
    } catch (err) {}
    setLoading(false);
  };

  // Bulk Move Selected to Archive
  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`क्या आप चयनित ${selectedIds.length} खबरों को आर्काइव में भेजना चाहते हैं?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/archive/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MOVE_TO_ARCHIVE', ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || `${selectedIds.length} खबरें आर्काइव में भेज दी गईं!`);
        fetchArticles();
      }
    } catch (err) {}
    setLoading(false);
  };

  // Single Article Move to Archive
  const handleSingleArchive = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/archive/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MOVE_TO_ARCHIVE', ids: [id] }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'खबर आर्काइव में भेज दी गई!');
        fetchArticles();
      }
    } catch (err) {}
    setLoading(false);
  };

  // Bulk Restore & Republish Selected
  const handleBulkRestore = async () => {
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
        setMsg(data.message || 'खबरें सफलतापूर्वक रिस्टोर व रिपब्लिश हो गईं!');
        fetchArticles();
      }
    } catch (err) {}
    setLoading(false);
  };

  // Single Article Restore & Republish
  const handleSingleRestore = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/archive/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE', ids: [id] }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'खबर सफलतापूर्वक रिस्टोर व रिपब्लिश हो गई!');
        fetchArticles();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`क्या आप चुनी गई ${selectedIds.length} खबरों को हमेशा के लिए डिलीट करना चाहते हैं?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_SELECTED', ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'चुनी गई खबरें सफलतापूर्वक डिलीट हो गईं!');
        fetchArticles();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleClearAllArticles = async () => {
    if (!confirm(`⚠️ चेतावनी: क्या आप पोर्टल की सभी ${articles.length} खबरों को डिलीट करना चाहते हैं? यह क्रिया वापस नहीं होगी।`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLEAR_ALL' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('सभी खबरें सफलतापूर्वक डिलीट हो गईं!');
        fetchArticles();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleSingleDelete = async (id: string) => {
    if (!confirm('क्या आप इस खबर को डिलीट करना चाहते हैं?')) return;
    try {
      const res = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_SELECTED', ids: [id] }),
      });
      const data = await res.json();
      if (data.success) fetchArticles();
    } catch (err) {}
  };

  const isAllSelected = articles.length > 0 && selectedIds.length === articles.length;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex flex-wrap items-center gap-2">
            <span>सभी समाचार (All News Manager)</span>
            <span className="bg-[#EA580C] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {articles.length} {statusFilter === 'ACTIVE' ? 'सक्रिय' : statusFilter === 'ARCHIVED' ? 'आर्काइव्ड' : 'कुल'}
            </span>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              ⬇️ क्रम: ID (Newest First)
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            1-क्लिक में आर्काइव करें, रिस्टोर व रिपब्लिश करें, अथवा मल्टीपल सलेक्शन से प्रबंधित करें
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Archive All Button */}
          {statusFilter === 'ACTIVE' && articles.length > 0 && (
            <button
              onClick={handleArchiveAll}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
              title="सभी सक्रिय खबरों को आर्काइव में भेजें"
            >
              <Archive className="w-4 h-4" />
              <span>📦 1-क्लिक: सभी {articles.length} खबरें आर्काइव करें</span>
            </button>
          )}

          {/* Link to Dedicated Archive Library */}
          <Link
            href="/admin/archive/news"
            className="bg-stone-800 hover:bg-stone-900 text-amber-400 px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all border border-stone-700"
          >
            <Archive className="w-4 h-4 text-amber-400" />
            <span>📦 आर्काइव लाइब्रेरी ({archivedCount})</span>
          </Link>

          <Link
            href="/admin/news/new"
            className="bg-[#EA580C] hover:bg-orange-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नया समाचार जोड़ें</span>
          </Link>

          {articles.length > 0 && (
            <button
              onClick={handleClearAllArticles}
              disabled={loading}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
              title="सभी हटाएं"
            >
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span>डिलीट ऑल</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'ACTIVE'
              ? 'bg-[#EA580C] text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span>🟢 सक्रिय समाचार (Active Live)</span>
        </button>

        <button
          onClick={() => setStatusFilter('ARCHIVED')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'ARCHIVED'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>📦 आर्काइव्ड समाचार ({archivedCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'ALL'
              ? 'bg-stone-800 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span>📋 सभी रिकॉर्ड्स (All)</span>
        </button>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center animate-fade-in">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold hover:opacity-75">×</button>
        </div>
      )}

      {/* Select All Toolbar */}
      {articles.length > 0 && (
        <div className="bg-[#0F172A] text-white p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-xs font-extrabold text-white hover:text-orange-400 cursor-pointer transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-[#F97316]" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
              <span>{isAllSelected ? 'सभी अचयनित करें (Deselect All)' : `सभी ${articles.length} चुनें (Select All)`}</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold bg-[#EA580C] text-white px-3 py-1 rounded-full shadow-xs font-mono">
              {selectedIds.length} समाचार चयनित
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Batch Archive Button */}
              {statusFilter !== 'ARCHIVED' && (
                <button
                  onClick={handleBulkArchive}
                  disabled={loading}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Archive className="w-4 h-4" />
                  <span>📦 चयनित {selectedIds.length} खबरें आर्काइव में भेजें</span>
                </button>
              )}

              {/* Batch Restore & Republish Button */}
              {(statusFilter === 'ARCHIVED' || statusFilter === 'ALL') && (
                <button
                  onClick={handleBulkRestore}
                  disabled={loading}
                  className="bg-[#16A34A] hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>♻️ चयनित {selectedIds.length} खबरें रिस्टोर व रिपब्लिश करें</span>
                </button>
              )}

              {/* Batch Delete */}
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>🗑️ चयनित {selectedIds.length} डिलीट करें</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-5 space-y-3">
        {articles.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Archive className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="font-extrabold text-stone-700 text-sm">
              {statusFilter === 'ARCHIVED'
                ? 'कोई आर्काइव्ड खबर नहीं है।'
                : 'कोई सक्रिय खबर मौजूद नहीं है।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 font-black text-stone-800 border-b border-stone-200">
                <tr>
                  <th className="p-3 w-10">चयन</th>
                  <th className="p-3 w-28"># ID (Newest First)</th>
                  <th className="p-3">समाचार शीर्षक</th>
                  <th className="p-3">श्रेणी</th>
                  <th className="p-3">व्यूज</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3">दिनांक</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {articles.map((art) => {
                  const isSelected = selectedIds.includes(art.id);

                  return (
                    <tr key={art.id} className={`hover:bg-stone-50 transition-colors ${isSelected ? 'bg-orange-50/40' : ''}`}>
                      <td className="p-3">
                        <button onClick={() => handleToggleSelect(art.id)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#EA580C]" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-300 hover:text-stone-500" />
                          )}
                        </button>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-stone-500 font-bold" title={art.id}>
                        <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200">
                          #{art.id.slice(0, 8)}
                        </span>
                      </td>

                      <td className="p-3 font-extrabold text-stone-900 max-w-sm truncate">
                        <Link href={`/news/${art.slug}`} target="_blank" className="hover:text-[#EA580C]">
                          {art.title}
                        </Link>
                      </td>

                      <td className="p-3 font-bold text-stone-700">
                        <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded font-mono text-[11px]">
                          {art.category?.name || 'सामान्य'}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-bold text-stone-600">👁 {art.viewCount || 0}</td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            art.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : art.status === 'ARCHIVED'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {art.status === 'PUBLISHED' ? '🟢 LIVE' : art.status === 'ARCHIVED' ? '📦 ARCHIVED' : art.status}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-stone-500 text-[11px]">
                        {new Date(art.publishedAt).toLocaleDateString('hi-IN')}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <Link
                            href={`/news/${art.slug}`}
                            target="_blank"
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                            title="साइट पर देखें"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/news/${art.id}/edit`}
                            className="p-1.5 bg-orange-100 hover:bg-orange-200 text-[#C2410C] rounded-lg transition-colors"
                            title="संपादित करें"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* 1-Click Archive Button if Active */}
                          {art.status !== 'ARCHIVED' ? (
                            <button
                              onClick={() => handleSingleArchive(art.id)}
                              disabled={loading}
                              className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors cursor-pointer"
                              title="आर्काइव में भेजें"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            /* 1-Click Restore & Republish Button if Archived */
                            <button
                              onClick={() => handleSingleRestore(art.id)}
                              disabled={loading}
                              className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors cursor-pointer"
                              title="रिस्टोर व रिपब्लिश करें"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleSingleDelete(art.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
