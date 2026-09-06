'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Archive, RotateCcw, Search, CheckSquare, Square, AlertCircle, Clock, ArrowLeft, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

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
  const [msg, setMsg] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ids: string[];
    itemCount: number;
    question?: string;
    errorMessage?: string;
  }>({
    isOpen: false,
    ids: [],
    itemCount: 0,
  });

  const fetchArchivedNews = async () => {
    try {
      const res = await fetch(`/api/admin/archive/news?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
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

  // 1-Click Restore & Republish ALL Archived Articles
  const handleRestoreAll = async () => {
    if (articles.length === 0) return;
    if (!confirm(`क्या आप सभी ${articles.length} आर्काइव्ड खबरों को 1-क्लिक में रिस्टोर व रिपब्लिश (Live Publish) करना चाहते हैं? वे तुरंत पोर्टल पर मुख्य पन्नों पर लाइव दिखने लगेंगी।`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/archive/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE_ALL' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'सभी खबरें सफलतापूर्वक रिस्टोर व रिपब्लिश हो गईं!');
        fetchArchivedNews();
      }
    } catch (err) {}
    setLoading(false);
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
        setMsg(data.message || `${selectedIds.length} खबरें सफलतापूर्वक रिस्टोर व रिपब्लिश हो गईं!`);
        fetchArchivedNews();
      }
    } catch (err) {}
    setLoading(false);
  };

  // Single Article Restore
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
        setMsg(data.message);
        fetchArchivedNews();
      }
    } catch (err) {}
    setLoading(false);
  };

  // Delete Selected Permanently with Password & Modal
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      ids: selectedIds,
      itemCount: selectedIds.length,
      question: `क्या आप चुनी गई ${selectedIds.length} खबरों को डेटाबेस से हमेशा के लिए हटाना चाहते हैं?`,
      errorMessage: '',
    });
  };

  const handleSingleDelete = (id: string) => {
    setDeleteModal({
      isOpen: true,
      ids: [id],
      itemCount: 1,
      question: 'क्या आप इस खबर को डेटाबेस से हमेशा के लिए हटाना चाहते हैं?',
      errorMessage: '',
    });
  };

  const handleConfirmPermanentDelete = async (password: string) => {
    setLoading(true);
    setDeleteModal((prev) => ({ ...prev, errorMessage: '' }));

    try {
      const res = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PERMANENT_DELETE',
          ids: deleteModal.ids,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteModal((prev) => ({
          ...prev,
          errorMessage: data.error || 'पासवर्ड गलत है या डिलीट करने में समस्या आई।',
        }));
        setLoading(false);
        return;
      }

      setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      setMsg(data.message || 'खबरें सफलतापूर्वक डेटाबेस से हटा दी गईं।');
      setSelectedIds([]);
      fetchArchivedNews();
    } catch (err: any) {
      setDeleteModal((prev) => ({
        ...prev,
        errorMessage: err.message || 'सर्वर से संपर्क नहीं हो सका।',
      }));
    }
    setLoading(false);
  };

  const isAllSelected = articles.length > 0 && selectedIds.length === articles.length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/admin/news"
              className="text-xs font-bold text-stone-600 hover:text-[#EA580C] flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>सभी समाचार (All News)</span>
            </Link>
          </div>

          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>📦 न्यूज़ आर्काइव लाइब्रेरी (Archive Library)</span>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              {articles.length} आर्काइव्ड खबरें
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            यहाँ पुरानी खबरें सुरक्षित रहती हैं। एक क्लिक में चयनित या सभी खबरों को रिस्टोर (Live Republish) करें।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1-Click Restore All Button */}
          {articles.length > 0 && (
            <button
              onClick={handleRestoreAll}
              disabled={loading}
              className="bg-[#16A34A] hover:bg-green-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              title="सभी आर्काइव्ड खबरों को पोर्टल पर वापस लाइव पब्लिश करें"
            >
              <RotateCcw className="w-4 h-4" />
              <span>♻️ 1-क्लिक: सभी {articles.length} खबरें रिस्टोर करें</span>
            </button>
          )}

          {/* Auto Archive Control */}
          <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-stone-700">पुराने:</span>
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
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              आर्काइव करें
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center animate-fade-in">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold hover:opacity-75">×</button>
        </div>
      )}

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
            <span>{isAllSelected ? 'सभी अचयनित करें (Deselect All)' : `सभी ${articles.length} चुनें (Select All)`}</span>
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestoreSelected}
                disabled={loading}
                className="bg-[#16A34A] hover:bg-green-700 text-white px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>♻️ चयनित {selectedIds.length} रिस्टोर व रिपब्लिश करें</span>
              </button>

              <button
                onClick={handleDeleteSelected}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                title="स्थायी रूप से हटाएं"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>हटाएं</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Archived Articles Grid/List */}
      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500 space-y-3 shadow-sm">
            <Archive className="w-12 h-12 mx-auto text-stone-300" />
            <p className="font-extrabold text-stone-800 text-base">कोई भी आर्काइव्ड समाचार नहीं है</p>
            <p className="text-xs text-stone-500">
              समाचारों को आर्काइव करने के लिए{' '}
              <Link href="/admin/news" className="text-[#EA580C] font-bold hover:underline">
                सभी समाचार (All News)
              </Link>{' '}
              पेज पर जाएं।
            </p>
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

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSingleRestore(art.id)}
                    disabled={loading}
                    className="bg-[#16A34A] hover:bg-green-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="इस खबर को वापस मुख्य साइट पर रिपब्लिश करें"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>रिस्टोर व रिपब्लिश करें</span>
                  </button>

                  <button
                    onClick={() => handleSingleDelete(art.id)}
                    disabled={loading}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer border border-red-200"
                    title="डेटाबेस से स्थायी रूप से हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Permanent Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmPermanentDelete}
        title="🔐 सुरक्षा सत्यापन: स्थायी विलोपन"
        question={deleteModal.question}
        itemCount={deleteModal.itemCount}
        isPermanent={true}
        loading={loading}
        errorMessage={deleteModal.errorMessage}
      />
    </div>
  );
}
