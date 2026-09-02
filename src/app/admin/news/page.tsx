'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, PlusCircle, Trash2, Edit, Eye, CheckSquare, Square, AlertOctagon } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles?status=ALL&limit=100');
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
        setSelectedIds([]);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchArticles();
  }, []);

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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`क्या आप चुनी गई ${selectedIds.length} खबरों को डिलीट करना चाहते हैं?`)) return;

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>सभी समाचार (All News Manager)</span>
            <span className="bg-[#EA580C] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {articles.length} खबरें
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            कुल {articles.length} समाचार सूचीबद्ध हैं — मल्टीपल सलेक्शन व डिलीट विकल्प
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {articles.length > 0 && (
            <button
              onClick={handleClearAllArticles}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <AlertOctagon className="w-4 h-4 text-white" />
              <span>⚠️ सभी {articles.length} खबरें हटाएं (Delete All)</span>
            </button>
          )}

          <Link
            href="/admin/news/new"
            className="bg-[#EA580C] hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नया समाचार जोड़ें</span>
          </Link>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold">×</button>
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
              <span>{isAllSelected ? 'सभी चुनें (Deselect All)' : 'सभी चुनें (Select All)'}</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold bg-[#EA580C] text-white px-3 py-1 rounded-full shadow-xs font-mono">
              {selectedIds.length} समाचार चयनित
            </span>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>🗑️ चयनित {selectedIds.length} खबरें डिलीट करें (Delete Selected)</span>
            </button>
          )}
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-5 space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 font-black text-stone-800 border-b border-stone-200">
              <tr>
                <th className="p-3 w-10">चयन</th>
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
                  <tr key={art.id} className={`hover:bg-stone-50 ${isSelected ? 'bg-orange-50/40' : ''}`}>
                    <td className="p-3">
                      <button onClick={() => handleToggleSelect(art.id)} className="cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#EA580C]" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-300 hover:text-stone-500" />
                        )}
                      </button>
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
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-stone-500 text-[11px]">
                      {new Date(art.publishedAt).toLocaleDateString('hi-IN')}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/news/${art.slug}`}
                          target="_blank"
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                          title="साइट पर देखें"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/admin/news/${art.id}/edit`}
                          className="p-1.5 bg-orange-100 hover:bg-orange-200 text-[#C2410C] rounded-lg transition-colors"
                          title="संपादित करें"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

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
      </div>
    </div>
  );
}
