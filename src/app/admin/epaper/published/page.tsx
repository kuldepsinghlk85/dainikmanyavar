'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Eye,
  Trash2,
  Plus,
  Calendar,
  FileText,
  RefreshCw,
  CheckSquare,
  Square,
  Archive,
  RotateCcw,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  X,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface PageItem {
  id: string;
  pageNumber: number;
  pageTitle?: string | null;
  pageImage: string;
}

interface Edition {
  id: string;
  title: string;
  editionDate: string;
  editionType: string;
  pdfUrl?: string | null;
  coverImage?: string | null;
  description?: string | null;
  totalPages: number;
  viewCount: number;
  status: string;
  pages?: PageItem[];
}

export default function PublishedEpapersAdminPage() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [counts, setCounts] = useState({ published: 0, archived: 0, draft: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState<'PUBLISHED' | 'ARCHIVED' | 'ALL'>('PUBLISHED');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ids: string[];
    title?: string;
    date?: string;
  }>({
    isOpen: false,
    ids: [],
  });

  const fetchEditions = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/epaper/editions?status=${statusFilter}&q=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.success) {
        setEditions(data.data || []);
        if (data.counts) setCounts(data.counts);
        setSelectedIds([]);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchEditions();
  }, [statusFilter, search]);

  // Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === editions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(editions.map((e) => e.id));
    }
  };

  const isAllSelected = editions.length > 0 && selectedIds.length === editions.length;

  // Archive Handlers
  const handleArchiveSelected = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/epaper/editions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ARCHIVE', ids: targetIds }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'सफलतापूर्वक आर्काइव कर दिया गया!');
        fetchEditions();
      } else {
        alert(data.error || 'त्रुटि हुई');
      }
    } catch (err) {}
    setActionLoading(false);
  };

  const handleArchiveAllPublished = async () => {
    if (counts.published === 0) return;
    if (
      !confirm(
        `क्या आप सभी ${counts.published} पुराने प्रकाशित अखबारों को 1-क्लिक में आर्काइव में भेजना चाहते हैं?`
      )
    )
      return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/epaper/editions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ARCHIVE_ALL' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchEditions();
      }
    } catch (err) {}
    setActionLoading(false);
  };

  // Restore Handlers
  const handleRestoreSelected = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/epaper/editions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE', ids: targetIds }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'सफलतापूर्वक लाइव पब्लिश कर दिया गया!');
        fetchEditions();
      } else {
        alert(data.error || 'त्रुटि हुई');
      }
    } catch (err) {}
    setActionLoading(false);
  };

  // Delete Prompt & Confirmation Modal Handlers
  const openSingleDeleteModal = (edition: Edition) => {
    const formattedDate = new Date(edition.editionDate).toLocaleDateString('hi-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    setDeleteModal({
      isOpen: true,
      ids: [edition.id],
      title: edition.title,
      date: formattedDate,
    });
  };

  const openBulkDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      ids: selectedIds,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, ids: [] });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.ids.length === 0) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/epaper/editions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: deleteModal.ids }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'संस्करण सफलतापूर्वक हटा दिए गए!');
        closeDeleteModal();
        fetchEditions();
      } else {
        alert(data.error || 'हटाने में समस्या आई');
      }
    } catch (err) {}
    setActionLoading(false);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#EA580C]" />
            <span>Published Editions (प्रकाशित ई-पेपर संस्करण)</span>
            <span className="bg-[#EA580C] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              {counts.published} लाइव प्रकाशित
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            पुराने और ताज़ा सभी प्रकाशित अखबारों की सूची, बल्क आर्काइव एवं प्रबंधन
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Archive All Published Button */}
          {statusFilter === 'PUBLISHED' && counts.published > 0 && (
            <button
              onClick={handleArchiveAllPublished}
              disabled={actionLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="सभी पुराने प्रकाशित अखबारों को 1-क्लिक में आर्काइव करें"
            >
              <Archive className="w-4 h-4" />
              <span>📦 सभी आर्काइव करें ({counts.published})</span>
            </button>
          )}

          <Link
            href="/admin/epaper/upload"
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>➕ नया अखबार अपलोड करें</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search & View Mode */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('PUBLISHED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === 'PUBLISHED'
                ? 'bg-[#EA580C] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>प्रकाशित ({counts.published})</span>
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
            <span>सभी संस्करण ({counts.total})</span>
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="शीर्षक या तारीख खोजें..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'LIST'
                  ? 'bg-white text-[#EA580C] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="सूची / तालिका दृश्य (List View)"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">सूची</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'GRID'
                  ? 'bg-white text-[#EA580C] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="ग्रिड कार्ड्स दृश्य (Grid View)"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">ग्रिड</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Toast */}
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-extrabold flex justify-between items-center shadow-xs">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-emerald-700 font-bold hover:opacity-75">
            ×
          </button>
        </div>
      )}

      {/* Bulk Selection Action Bar */}
      {editions.length > 0 && (
        <div className="bg-[#0F172A] text-white p-3.5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
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
              <span>{isAllSelected ? 'सभी अचयनित करें' : `सभी चुनें (${editions.length})`}</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold bg-[#EA580C] text-white px-3 py-0.5 rounded-full font-mono">
              {selectedIds.length} चयनित (Selected)
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {statusFilter !== 'ARCHIVED' && (
                <button
                  onClick={() => handleArchiveSelected(selectedIds)}
                  disabled={actionLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>📦 चयनित आर्काइव करें ({selectedIds.length})</span>
                </button>
              )}

              {(statusFilter === 'ARCHIVED' || statusFilter === 'ALL') && (
                <button
                  onClick={() => handleRestoreSelected(selectedIds)}
                  disabled={actionLoading}
                  className="bg-[#16A34A] hover:bg-green-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>♻️ चयनित रिस्टोर/लाइव करें ({selectedIds.length})</span>
                </button>
              )}

              <button
                onClick={openBulkDeleteModal}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>🗑️ चयनित हटाएं ({selectedIds.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content: List or Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C] mx-auto" />
          <p className="text-xs font-bold text-stone-600 mt-2">ई-पेपर संस्करण लोड हो रहे हैं...</p>
        </div>
      ) : editions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500 space-y-3 shadow-sm">
          <Newspaper className="w-12 h-12 mx-auto text-stone-300" />
          <p className="font-extrabold text-stone-800 text-base">
            {statusFilter === 'ARCHIVED'
              ? 'कोई भी आर्काइव्ड संस्करण उपलब्ध नहीं है।'
              : 'कोई भी ई-पेपर संस्करण नहीं मिला।'}
          </p>
          <p className="text-xs text-stone-500">
            ऊपर "नया अखबार अपलोड करें" बटन दबाकर नया डिजिटल संस्करण जोड़ें।
          </p>
        </div>
      ) : viewMode === 'LIST' ? (
        /* TABLE / LIST VIEW */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-black text-stone-600 uppercase tracking-wider">
                  <th className="p-3.5 w-12 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#EA580C]" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5 w-20">कवर</th>
                  <th className="p-3.5 min-w-[140px]">तारीख</th>
                  <th className="p-3.5 min-w-[200px]">संस्करण विवरण</th>
                  <th className="p-3.5 w-24 text-center">पेज</th>
                  <th className="p-3.5 w-28 text-center">पाठक दृश्य</th>
                  <th className="p-3.5 w-28 text-center">स्थिति</th>
                  <th className="p-3.5 min-w-[200px] text-right">कार्रवाइयां</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {editions.map((ed) => {
                  const isSelected = selectedIds.includes(ed.id);
                  const formattedDate = new Date(ed.editionDate).toLocaleDateString('hi-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={ed.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-orange-50/40'
                          : ed.status === 'ARCHIVED'
                          ? 'bg-stone-50/60 opacity-80 hover:bg-stone-100/60'
                          : 'hover:bg-orange-50/20'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleSelect(ed.id)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-[#EA580C]" />
                          ) : (
                            <Square className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                          )}
                        </button>
                      </td>

                      {/* Thumbnail Cover */}
                      <td className="p-3.5">
                        <div className="w-14 h-18 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          <img
                            src={ed.coverImage || '/uploads/epaper/pages/page_1.png'}
                            alt={ed.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 font-bold text-stone-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[#EA580C]">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(ed.editionDate).toLocaleDateString('en-GB')}
                        </span>
                      </td>

                      {/* Title & Metadata */}
                      <td className="p-3.5">
                        <h3 className="font-extrabold text-stone-900 text-sm leading-snug">
                          {ed.title}
                        </h3>
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.2 rounded border border-stone-200">
                          ● {ed.editionType}
                        </span>
                      </td>

                      {/* Pages */}
                      <td className="p-3.5 text-center font-mono font-bold text-stone-700 whitespace-nowrap">
                        📄 {ed.totalPages} पेज
                      </td>

                      {/* Views */}
                      <td className="p-3.5 text-center font-mono font-bold text-stone-600 whitespace-nowrap">
                        <span className="flex items-center justify-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-stone-400" />
                          <span>{ed.viewCount}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {ed.status === 'ARCHIVED' ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                            📦 ARCHIVED
                          </span>
                        ) : ed.status === 'DRAFT' ? (
                          <span className="bg-stone-200 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            DRAFT
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 border border-green-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                            ● LIVE
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/epaper?id=${ed.id}`}
                            target="_blank"
                            className="bg-[#EA580C] hover:bg-orange-700 text-white text-[11px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>देखें</span>
                          </Link>

                          <Link
                            href={`/admin/epaper/pages?editionId=${ed.id}`}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-800 hover:text-white text-stone-800 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors border border-stone-200"
                            title="पेज बदलें या नए पेज जोड़ें"
                          >
                            <FileText className="w-3 h-3 text-[#EA580C]" />
                            <span>पेज</span>
                          </Link>

                          {ed.status !== 'ARCHIVED' ? (
                            <button
                              onClick={() => handleArchiveSelected([ed.id])}
                              className="p-1.5 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-200 rounded-lg transition-colors cursor-pointer"
                              title="आर्काइव में सुरक्षित करें"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreSelected([ed.id])}
                              className="p-1.5 bg-green-50 hover:bg-green-600 text-green-800 hover:text-white border border-green-200 rounded-lg transition-colors cursor-pointer"
                              title="पुनः लाइव प्रकाशित करें"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => openSingleDeleteModal(ed)}
                            className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="संस्करण हटाएं"
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
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {editions.map((ed) => {
            const isSelected = selectedIds.includes(ed.id);
            const formattedDate = new Date(ed.editionDate).toLocaleDateString('hi-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });

            return (
              <div
                key={ed.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#EA580C] ring-2 ring-[#EA580C]'
                    : ed.status === 'ARCHIVED'
                    ? 'border-stone-200 opacity-80'
                    : 'border-stone-200'
                }`}
              >
                <div>
                  {/* Cover Image & Overlays */}
                  <div className="relative h-48 bg-stone-100 border-b border-stone-200 overflow-hidden group">
                    <img
                      src={ed.coverImage || '/uploads/epaper/pages/page_1.png'}
                      alt={ed.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-1 rounded-lg shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(ed.id)}
                        className="cursor-pointer flex items-center justify-center"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#EA580C]" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-400 hover:text-stone-700" />
                        )}
                      </button>
                    </div>

                    {/* Page Count */}
                    <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                      📄 {ed.totalPages} पेज
                    </div>

                    {/* Edition Type */}
                    <div className="absolute bottom-3 left-3 bg-[#EA580C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      ● {ed.editionType}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] font-bold text-[#EA580C] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                    </div>

                    <h3 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-2">
                      {ed.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-stone-400" />
                        <span>{ed.viewCount} पाठक दृश्य</span>
                      </span>

                      {ed.status === 'ARCHIVED' ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-200 font-black px-2 py-0.5 rounded text-[10px]">
                          📦 ARCHIVED
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/epaper?id=${ed.id}`}
                    target="_blank"
                    className="bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ई-पेपर खोलें</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/epaper/pages?editionId=${ed.id}`}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-800 hover:text-white text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border border-stone-200"
                      title="इस एडिशन के पन्ने बदलें या नए पेज जोड़ें"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>पेज</span>
                    </Link>

                    {ed.status !== 'ARCHIVED' ? (
                      <button
                        onClick={() => handleArchiveSelected([ed.id])}
                        className="p-1.5 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-200 rounded-xl transition-colors cursor-pointer"
                        title="आर्काइव करें"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestoreSelected([ed.id])}
                        className="p-1.5 bg-green-50 hover:bg-green-600 text-green-800 hover:text-white border border-green-200 rounded-xl transition-colors cursor-pointer"
                        title="पुनः लाइव प्रकाशित करें"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => openSingleDeleteModal(ed)}
                      className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                      title="संस्करण हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (Always Requests Permission Before Deletion) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-red-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-50 px-5 py-4 border-b border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-600 text-white rounded-xl shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">
                    हटाने की पुष्टि (Confirm Deletion Permission)
                  </h3>
                  <p className="text-[11px] font-semibold text-red-700">
                    यह क्रिया स्थायी है और वापस नहीं ली जा सकती
                  </p>
                </div>
              </div>
              <button
                onClick={closeDeleteModal}
                disabled={actionLoading}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-3">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800">
                {deleteModal.ids.length > 1 ? (
                  <>
                    <p className="font-extrabold text-stone-900 text-sm mb-1">
                      क्या आप वाकई चयनित {deleteModal.ids.length} ई-पेपर संस्करणों को हमेशा के लिए हटाना चाहते हैं?
                    </p>
                    <p className="text-stone-600 text-[11px] mt-1">
                      चयनित सभी संस्करणों के पृष्ठ, छवियां और संबंधित डेटा हमेशा के लिए डिलीट हो जाएंगे।
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-extrabold text-stone-900 text-sm mb-1">
                      क्या आप वाकई इस ई-पेपर संस्करण को हमेशा के लिए हटाना चाहते हैं?
                    </p>
                    <p className="text-stone-700 text-xs font-bold mt-1">
                      अखबार: <span className="text-[#EA580C]">{deleteModal.title}</span> ({deleteModal.date})
                    </p>
                    <p className="text-stone-500 text-[11px] mt-1">
                      इस संस्करण के सभी संबंधित पेज हमेशा के लिए हटा दिए जाएंगे।
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-red-600 text-[11px] font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>कृपया पुष्टि करें कि आप इसे स्थायी रूप से हटाना चाहते हैं।</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {actionLoading
                    ? 'हटाया जा रहा है...'
                    : deleteModal.ids.length > 1
                    ? `हाँ, सभी ${deleteModal.ids.length} हटाएं`
                    : 'हाँ, हमेशा के लिए हटाएं'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
