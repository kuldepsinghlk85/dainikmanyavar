'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Inbox, RefreshCw, Trash2, FileText, Eye, CheckSquare, Square, AlertOctagon, Zap } from 'lucide-react';

interface ImportItem {
  id: string;
  originalTitle: string;
  originalExcerpt: string;
  imageUrl?: string;
  publisherName: string;
  sourceUrl: string;
  sourcePublishedAt: string;
  suggestedTagsJson?: string;
  status: string;
}

export default function ImportInboxAdminPage() {
  const [items, setItems] = useState<ImportItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const fetchInbox = async () => {
    try {
      const res = await fetch('/api/admin/importer/inbox?status=NEW');
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
        setSelectedIds([]);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleSyncAllFeeds = async () => {
    setSyncingAll(true);
    setMsg('');
    try {
      const res = await fetch('/api/rss/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg(`⚡ सभी ${data.totalSources} सोर्सेज सफलतापूर्वक सिंक हो गए! नई खबरें इनबॉक्स में जोड़ी गईं: +${data.newNews}`);
        fetchInbox();
      }
    } catch (err) {}
    setSyncingAll(false);
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

  const handleBulkCreateDrafts = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    let successCount = 0;

    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/rss/create-draft/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) successCount++;
      } catch (err) {}
    }

    setMsg(`${successCount} खबरों के दैनिक मान्यवर ड्राफ्ट्स सफलतापूर्वक बना दिए गए!`);
    setBulkLoading(false);
    fetchInbox();
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`क्या आप चुनी गई ${selectedIds.length} खबरों को इनबॉक्स से हटाना चाहते हैं?`)) return;

    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/importer/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action: 'DELETE_SELECTED' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'चुनी गई खबरें इनबॉक्स से हटा दी गईं।');
        fetchInbox();
      }
    } catch (err) {}
    setBulkLoading(false);
  };

  const handleClearAll = async () => {
    if (!confirm(`⚠️ क्या आप इनबॉक्स की सभी ${items.length} खबरों को हटाना चाहते हैं?`)) return;

    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/importer/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLEAR_ALL' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('इनबॉक्स की सभी खबरें खाली कर दी गईं।');
        fetchInbox();
      }
    } catch (err) {}
    setBulkLoading(false);
  };

  const handleCreateSingleDraft = async (id: string) => {
    setConvertingId(id);
    try {
      const res = await fetch(`/api/rss/create-draft/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ ड्राफ्ट बन गया!`);
        fetchInbox();
        if (data.editUrl) {
          window.location.href = data.editUrl;
        }
      } else {
        alert(data.error || 'ड्राफ्ट बनाने में समस्या आई');
      }
    } catch (err) {}
    setConvertingId(null);
  };

  const handleSingleReject = async (id: string) => {
    try {
      const res = await fetch('/api/admin/importer/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'DELETE' }),
      });
      const data = await res.json();
      if (data.success) fetchInbox();
    } catch (err) {}
  };

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>📥 इम्पोर्ट इनबॉक्स (News Import Inbox)</span>
            <span className="bg-[#EA580C] text-white text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              {items.length} खबरें
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            एक्सटर्नल RSS सोर्सेज से प्राप्त खबरें — समीक्षा करें, 1-क्लिक ड्राफ्ट बनाएं या हटाएं
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Sync All Button */}
          <button
            onClick={handleSyncAllFeeds}
            disabled={syncingAll}
            className="bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Zap className={`w-4 h-4 text-amber-300 ${syncingAll ? 'animate-bounce' : ''}`} />
            <span>{syncingAll ? 'सोर्सेज सिंक हो रहे हैं...' : '⚡ सभी सोर्सेज से सिंक करें (Sync Live Feeds)'}</span>
          </button>

          {/* Solid Red Clear All Inbox Button */}
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={bulkLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              <AlertOctagon className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-white font-bold whitespace-nowrap">इनबॉक्स खाली करें ({items.length})</span>
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-xs">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold">×</button>
        </div>
      )}

      {/* Select All & Bulk Actions High-Contrast Banner */}
      {items.length > 0 && (
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
              {selectedIds.length} खबरें चयनित
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkCreateDrafts}
                disabled={bulkLoading}
                className="bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>चयनित का ड्राफ्ट बनाएं ({selectedIds.length})</span>
              </button>

              <button
                onClick={handleBulkReject}
                disabled={bulkLoading}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-white" />
                <span>चयनित हटाएं ({selectedIds.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inbox Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const tags: string[] = item.suggestedTagsJson ? JSON.parse(item.suggestedTagsJson) : [];

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                isSelected ? 'border-[#EA580C] ring-2 ring-orange-200' : 'border-stone-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleSelect(item.id)} className="cursor-pointer">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#EA580C]" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-300 hover:text-stone-500" />
                      )}
                    </button>
                    <span className="bg-slate-900 text-orange-400 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded">
                      {item.publisherName}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-stone-400">
                    {new Date(item.sourcePublishedAt).toLocaleTimeString('hi-IN')}
                  </span>
                </div>

                <div className="flex gap-3">
                  {item.imageUrl && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                      <img src={item.imageUrl} alt={item.originalTitle} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-2">
                      {item.originalTitle}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">{item.originalExcerpt}</p>
                  </div>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tags.map((t, idx) => (
                      <span key={idx} className="bg-orange-50 text-[#C2410C] text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-stone-500 hover:text-stone-900 text-[11px] font-bold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>स्रोत देखें</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateSingleDraft(item.id)}
                    disabled={convertingId === item.id}
                    className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-white" />
                    <span>{convertingId === item.id ? 'Drafting...' : 'Create Dainik Manyavar Draft'}</span>
                  </button>

                  <button
                    onClick={() => handleSingleReject(item.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg border border-red-200 transition-colors cursor-pointer"
                    title="इनबॉक्स से हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
          <Inbox className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-extrabold text-stone-800">इनबॉक्स में कोई खबर नहीं है</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            ऊपर बटन दबाकर सभी 20+ लाइव सोर्सेज से ताज़ा खबरें फ़ेच करें।
          </p>
          <button
            onClick={handleSyncAllFeeds}
            disabled={syncingAll}
            className="bg-green-600 hover:bg-green-700 text-white font-black text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>⚡ सभी सोर्सेज से ताज़ा खबरें लाएं</span>
          </button>
        </div>
      )}
    </div>
  );
}
