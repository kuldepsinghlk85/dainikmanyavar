'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  PlusCircle,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  Power,
  X,
  Search,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface ArticleOption {
  id: string;
  title: string;
  slug: string;
}

interface BreakingItem {
  id: string;
  articleId?: string | null;
  customHeadline?: string | null;
  priority: number;
  active: boolean;
  isArchived: boolean;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  article?: ArticleOption | null;
}

export default function BreakingNewsAdminPage() {
  const [items, setItems] = useState<BreakingItem[]>([]);
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [counts, setCounts] = useState({ active: 0, archived: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BreakingItem | null>(null);
  const [formData, setFormData] = useState({
    customHeadline: '',
    articleId: '',
    priority: 1,
    active: true,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch(
        `/api/admin/breaking?status=${statusFilter}&q=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
        if (data.articles) setArticles(data.articles);
        if (data.counts) setCounts(data.counts);
        setSelectedIds([]);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter, search]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      customHeadline: '',
      articleId: '',
      priority: 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BreakingItem) => {
    setEditingItem(item);
    setFormData({
      customHeadline: item.customHeadline || '',
      articleId: item.articleId || '',
      priority: item.priority || 1,
      active: item.active,
    });
    setIsModalOpen(true);
  };

  const handleArticleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const artId = e.target.value;
    setFormData((prev) => {
      const selectedArt = articles.find((a) => a.id === artId);
      return {
        ...prev,
        articleId: artId,
        customHeadline: prev.customHeadline || (selectedArt ? selectedArt.title : ''),
      };
    });
  };

  const handleSaveTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customHeadline.trim()) {
      alert('कृपया ब्रेकिंग टिकर हेडलाइन दर्ज करें!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        action: editingItem ? 'UPDATE' : 'CREATE',
        id: editingItem?.id,
        customHeadline: formData.customHeadline.trim(),
        articleId: formData.articleId || null,
        priority: Number(formData.priority),
        active: formData.active,
      };

      const res = await fetch('/api/admin/breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setMsg(data.message || 'सफलतापूर्वक सहेजा गया!');
        setIsModalOpen(false);
        fetchItems();
      } else {
        alert(data.error || 'त्रुटि हुई');
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch('/api/admin/breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_ACTIVE', id }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchItems();
      }
    } catch (err) {}
  };

  const handleSingleArchive = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ARCHIVE', ids: [id] }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchItems();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`क्या आप चयनित ${selectedIds.length} टिकर को आर्काइव में भेजना चाहते हैं?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ARCHIVE', ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchItems();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleArchiveAll = async () => {
    if (items.length === 0) return;
    if (
      !confirm(
        `क्या आप सभी ${counts.active} सक्रिय ब्रेकिंग टिकर को 1-क्लिक में आर्काइव में भेजना चाहते हैं?`
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ARCHIVE_ALL' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchItems();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleSingleRestore = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE', ids: [id] }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchItems();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE', ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchItems();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleRestoreAll = async () => {
    if (counts.archived === 0) return;
    if (!confirm(`क्या आप सभी ${counts.archived} आर्काइव्ड टिकर को 1-क्लिक में रिस्टोर व लाइव करना चाहते हैं?`))
      return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE_ALL' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchItems();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`क्या आप ${ids.length} टिकर को हमेशा के लिए हटाना चाहते हैं?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/breaking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchItems();
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  // Active items for live preview
  const liveTickerText = items
    .filter((i) => i.active && !i.isArchived)
    .map((i) => i.customHeadline || i.article?.title)
    .join('  •  ');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-600 animate-pulse" />
            <span>ब्रेकिंग न्यूज़ टिकर (Breaking Ticker Manager)</span>
            <span className="bg-red-100 text-red-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {counts.active} लाइव
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            मुख्य पृष्ठ के लाल टिकर में चलने वाली ब्रेकिंग खबरें जोड़ें, संपादित करें और आर्काइव करें
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Add Ticker Button */}
          <button
            onClick={handleOpenAddModal}
            className="bg-[#EA580C] hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नया ब्रेकिंग टिकर जोड़ें</span>
          </button>

          {/* 1-Click Archive All Active */}
          {statusFilter === 'ACTIVE' && counts.active > 0 && (
            <button
              onClick={handleArchiveAll}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              title="सभी सक्रिय टिकर आर्काइव करें"
            >
              <Archive className="w-4 h-4" />
              <span>📦 सभी आर्काइव करें ({counts.active})</span>
            </button>
          )}

          {/* 1-Click Restore All */}
          {statusFilter === 'ARCHIVED' && counts.archived > 0 && (
            <button
              onClick={handleRestoreAll}
              disabled={loading}
              className="bg-[#16A34A] hover:bg-green-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              title="सभी आर्काइव्ड टिकर रिस्टोर करें"
            >
              <RotateCcw className="w-4 h-4" />
              <span>♻️ सभी रिस्टोर करें ({counts.archived})</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Marquee Preview */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-4 overflow-hidden space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-stone-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span>लाइव वेबसाइट टिकर प्रीव्यू (Live Frontend Preview)</span>
          </span>
          <span className="text-[11px] font-mono text-stone-400">
            {items.filter((i) => i.active && !i.isArchived).length} सक्रिय हेडलाइंस
          </span>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-2.5 flex items-center gap-3 shadow-inner">
          <div className="bg-black/30 text-white font-black text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5 shrink-0 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
            <span>BREAKING</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap text-xs font-bold flex-1">
            <div className="inline-block animate-marquee">
              {liveTickerText || 'फिलहाल कोई सक्रिय ब्रेकिंग टिकर नहीं है। कृपया ऊपर से नया टिकर जोड़ें।'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === 'ACTIVE'
                ? 'bg-[#DC2626] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>सक्रिय टिकर ({counts.active})</span>
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
            <span>📦 आर्काइव्ड ({counts.archived})</span>
          </button>

          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === 'ALL'
                ? 'bg-stone-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>सभी ({counts.total})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="टिकर हेडलाइन खोजें..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-[#EA580C]"
          />
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center animate-fade-in">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold hover:opacity-75">
            ×
          </button>
        </div>
      )}

      {/* Bulk Selection Bar */}
      {items.length > 0 && (
        <div className="bg-[#0F172A] text-white p-3.5 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-4">
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
              <span>{isAllSelected ? 'सभी अचयनित करें' : `सभी ${items.length} चुनें`}</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold bg-[#EA580C] text-white px-3 py-0.5 rounded-full font-mono">
              {selectedIds.length} चयनित
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {statusFilter !== 'ARCHIVED' && (
                <button
                  onClick={handleBulkArchive}
                  disabled={loading}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>📦 चयनित आर्काइव करें ({selectedIds.length})</span>
                </button>
              )}

              {(statusFilter === 'ARCHIVED' || statusFilter === 'ALL') && (
                <button
                  onClick={handleBulkRestore}
                  disabled={loading}
                  className="bg-[#16A34A] hover:bg-green-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>♻️ चयनित रिस्टोर करें ({selectedIds.length})</span>
                </button>
              )}

              <button
                onClick={() => handleDelete(selectedIds)}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>हटाएं</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ticker Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500 space-y-3 shadow-sm">
            <Flame className="w-12 h-12 mx-auto text-stone-300" />
            <p className="font-extrabold text-stone-800 text-base">
              {statusFilter === 'ARCHIVED'
                ? 'कोई भी आर्काइव्ड टिकर उपलब्ध नहीं है।'
                : 'कोई भी सक्रिय ब्रेकिंग टिकर नहीं है।'}
            </p>
            <p className="text-xs text-stone-500">
              ऊपर "नया ब्रेकिंग टिकर जोड़ें" बटन दबाकर नई ब्रेकिंग खबर शुरू करें।
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                  isSelected
                    ? 'border-[#EA580C] bg-orange-50/25 ring-1 ring-[#EA580C]'
                    : item.active && !item.isArchived
                    ? 'border-red-200 hover:border-red-300'
                    : 'border-stone-200 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleSelect(item.id)}
                    className="cursor-pointer mt-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#EA580C]" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                    )}
                  </button>

                  <div className="mt-0.5">
                    <Flame
                      className={`w-5 h-5 ${
                        item.active && !item.isArchived
                          ? 'text-red-600 animate-pulse'
                          : 'text-stone-400'
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {/* Status Badges */}
                      {item.isArchived ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-black">
                          📦 ARCHIVED
                        </span>
                      ) : item.active ? (
                        <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded font-black flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          LIVE सक्रिय
                        </span>
                      ) : (
                        <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded font-bold">
                          ⚪ PAUSED निष्क्रय
                        </span>
                      )}

                      {/* Priority Badge */}
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold ${
                          item.priority >= 3
                            ? 'bg-red-50 text-red-700 border border-red-200 font-black'
                            : item.priority === 2
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        ⚡ प्राथमिकता: {item.priority}
                        {item.priority >= 3 ? ' (अति-महत्वपूर्ण)' : item.priority === 2 ? ' (उच्च)' : ' (सामान्य)'}
                      </span>

                      <span className="text-stone-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString('hi-IN')}
                      </span>
                    </div>

                    <h3 className="font-black text-stone-900 text-sm leading-snug">
                      {item.customHeadline || item.article?.title}
                    </h3>

                    {/* Linked Article if any */}
                    {item.article && (
                      <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <span className="font-semibold">लिंक की गई खबर:</span>
                        <Link
                          href={`/news/${item.article.slug}`}
                          target="_blank"
                          className="text-[#EA580C] hover:underline flex items-center gap-0.5 font-bold truncate max-w-md"
                        >
                          <span>{item.article.title}</span>
                          <ExternalLink className="w-3 h-3 inline shrink-0" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {/* Quick Toggle Active (if not archived) */}
                  {!item.isArchived && (
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`p-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                        item.active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-200'
                      }`}
                      title={item.active ? 'टिकर बंद करें' : 'टिकर चालू करें'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{item.active ? 'चालू' : 'बंद'}</span>
                    </button>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 bg-stone-100 hover:bg-orange-100 hover:text-[#EA580C] text-stone-700 rounded-xl transition-colors cursor-pointer"
                    title="संपादित करें"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* Archive / Restore Button */}
                  {!item.isArchived ? (
                    <button
                      onClick={() => handleSingleArchive(item.id)}
                      disabled={loading}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition-colors cursor-pointer"
                      title="आर्काइव में भेजें"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSingleRestore(item.id)}
                      disabled={loading}
                      className="p-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl transition-colors cursor-pointer"
                      title="रिस्टोर व रिपब्लिश करें"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete([item.id])}
                    disabled={loading}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl transition-colors cursor-pointer"
                    title="हमेशा के लिए हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Ticker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                <span>{editingItem ? 'ब्रेकिंग टिकर संपादित करें' : 'नया ब्रेकिंग टिकर जोड़ें'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTicker} className="space-y-4">
              {/* Headline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-800">
                  ब्रेकिंग हेडलाइन (Headline) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.customHeadline}
                  onChange={(e) => setFormData({ ...formData, customHeadline: e.target.value })}
                  placeholder="उदा. UP में नई शिक्षा नीति को लेकर बड़ा फैसला | जौनपुर में विकास कार्यों की समीक्षा..."
                  className="w-full p-3 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
                  required
                />
                <p className="text-[11px] text-stone-500 flex justify-between">
                  <span>यह टेक्स्ट मुख्य पृष्ठ के लाल टिकर में स्क्रॉल होगा।</span>
                  <span className="font-mono">{formData.customHeadline.length} अक्षर</span>
                </p>
              </div>

              {/* Link with Published Article */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-800">
                  प्रकाशित खबर से जोड़ें (वैकल्पिक - लिंक)
                </label>
                <select
                  value={formData.articleId}
                  onChange={handleArticleSelect}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#EA580C]"
                >
                  <option value="">-- किसी खबर से लिंक न करें (केवल टेक्स्ट टिकर) --</option>
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.title}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-400">
                  खबर चुनने पर पाठक टिकर पर क्लिक करके सीधे पूरी खबर पढ़ सकेंगे।
                </p>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-stone-800">
                    प्राथमिकता (Priority)
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-[#EA580C]"
                  >
                    <option value={1}>1 - सामान्य (Normal)</option>
                    <option value={2}>2 - उच्च (High)</option>
                    <option value={3}>3 - अति-महत्वपूर्ण (Top Urgent)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-stone-800">
                    स्थिति (Live Status)
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-[#EA580C] rounded"
                      />
                      <span>तुरंत लाइव चालू करें</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>{editingItem ? 'अपडेट करें' : 'सहेजें व लाइव करें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
