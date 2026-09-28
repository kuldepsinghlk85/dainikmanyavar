'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  RefreshCw,
  Trash2,
  FileText,
  Eye,
  CheckSquare,
  Square,
  AlertOctagon,
  Zap,
  Languages,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import ImporterSubNav from '@/components/admin/ImporterSubNav';

interface ClusterItemSummary {
  id: string;
  publisherName: string;
  originalTitle: string;
  sourceUrl: string;
  importedAt: string;
}

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
  editorialStatus?: string;
  city?: string;
  state?: string;
  similarityPercentage?: number;
  duplicateOfId?: string;
  clusterId?: string;
  cluster?: {
    id: string;
    title: string;
    itemCount: number;
    items?: ClusterItemSummary[];
  };
}

export default function ImportInboxAdminPage() {
  const [items, setItems] = useState<ImportItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  // Filtering states
  const [statusTab, setStatusTab] = useState<'NEW' | 'ALL' | 'DUPLICATE'>('NEW');
  const [publisherFilter, setPublisherFilter] = useState<string>('ALL');

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusTab !== 'ALL') params.append('status', statusTab);
      if (publisherFilter !== 'ALL') params.append('publisher', publisherFilter);

      const res = await fetch(`/api/admin/importer/inbox?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
        setSelectedIds([]);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchInbox();
  }, [statusTab, publisherFilter]);

  const handleSyncAllFeeds = async () => {
    setSyncingAll(true);
    setMsg('');
    try {
      const res = await fetch('/api/rss/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg(`⚡ सभी ${data.totalSources} सोर्सेज सफलतापूर्वक सिंक हो गए! नई खबरें: +${data.newNews}`);
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
        setMsg(`✅ दैनिक मान्यवर ड्राफ्ट सफलतापूर्वक बन गया!`);
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

  const handleTranslateItem = async (id: string) => {
    setTranslatingId(id);
    try {
      const res = await fetch('/api/admin/importer/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'TRANSLATE_ITEM' }),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, ...data.item } : i))
        );
        setMsg('🌐 खबर का शीर्षक, विवरण व टैग्स हिंदी में अनुवादित हो गए!');
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(data.error || 'अनुवाद में समस्या आई');
      }
    } catch (err) {
      alert('नेटवर्क समस्या');
    } finally {
      setTranslatingId(null);
    }
  };

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sub Navigation Links */}
      <ImporterSubNav />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>📥 RSS न्यूज़ इनबॉक्स (Editorial Queue)</span>
            <span className="bg-[#EA580C] text-white text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              {items.length} खबरें
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            सत्यापित RSS फ़ीड्स से एकत्रित समाचार — मल्टी-सोर्स तुलना, डुप्लिकेट जांच, और 1-क्लिक ड्राफ्ट जनरेटर
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Sync All Button */}
          <button
            onClick={handleSyncAllFeeds}
            disabled={syncingAll}
            className="bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Zap className={`w-4 h-4 text-amber-300 ${syncingAll ? 'animate-bounce' : ''}`} />
            <span className="text-white font-bold">{syncingAll ? 'सोर्सेज सिंक हो रहे हैं...' : 'लाइव सोर्सेज सिंक करें (Sync)'}</span>
          </button>

          {/* Clear All Inbox Button */}
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={bulkLoading}
              className="bg-[#DC2626] hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer flex-shrink-0"
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
          <button onClick={() => setMsg('')} className="text-green-700 font-bold cursor-pointer">×</button>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex flex-col gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          <span className="text-xs font-extrabold text-stone-500 uppercase mr-1">स्टेटस:</span>
          {[
            { key: 'NEW', label: '📥 नई खबरें (New Review)' },
            { key: 'ALL', label: '📋 सभी (All)' },
            { key: 'DUPLICATE', label: '⚠️ संभावित डुप्लिकेट्स (Duplicates)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                statusTab === tab.key
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Publisher Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          <span className="text-xs font-extrabold text-stone-500 uppercase mr-1">पब्लिशर:</span>
          {['ALL', 'Live Hindustan', 'Amar Ujala', 'Dainik Bhaskar', 'Dainik Jagran'].map((pub) => (
            <button
              key={pub}
              onClick={() => setPublisherFilter(pub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                publisherFilter === pub
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {pub === 'ALL' ? 'सभी पब्लिशर्स' : pub}
            </button>
          ))}
        </div>
      </div>

      {/* Select All & Bulk Actions Banner */}
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

      {/* Empty State */}
      {items.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <Inbox className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">इनबॉक्स में कोई खबर उपलब्ध नहीं है</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            फ़ीड्स से नई खबरें प्राप्त करने के लिए ऊपर &quot;लाइव सोर्सेज सिंक करें&quot; बटन पर क्लिक करें।
          </p>
        </div>
      )}

      {/* Inbox Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const tags: string[] = item.suggestedTagsJson ? JSON.parse(item.suggestedTagsJson) : [];
          const clusterCount = item.cluster?.items?.length || (item.clusterId ? 1 : 0);
          const isClusterExpanded = expandedClusterId === item.clusterId;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                isSelected ? 'border-[#EA580C] ring-2 ring-orange-200' : 'border-stone-200'
              }`}
            >
              <div className="space-y-3">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    {item.city && (
                      <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded">
                        📍 {item.city}
                      </span>
                    )}
                    {item.status === 'DUPLICATE' && (
                      <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>{item.similarityPercentage || 80}% समानता</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-mono text-stone-400">
                      {item.sourcePublishedAt ? new Date(item.sourcePublishedAt).toLocaleTimeString('hi-IN') : ''}
                    </span>
                    {/[a-zA-Z]{3,}/.test(item.originalTitle) ? (
                      <span className="text-[9.5px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                        EN
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                        ✓ HI
                      </span>
                    )}
                  </div>
                </div>

                {/* Content block */}
                <div className="flex gap-3">
                  {item.imageUrl && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                      <img src={item.imageUrl} alt={item.originalTitle} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-2">
                      {item.originalTitle}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">{item.originalExcerpt}</p>
                  </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tags.map((t, idx) => (
                      <span key={idx} className="bg-orange-50 text-[#C2410C] text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Multi-Source Story Cluster Badge & Expansion */}
                {item.cluster && item.cluster.items && item.cluster.items.length > 1 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>मल्टी-सोर्स स्टोरी: {item.cluster.items.length} पब्लिशर्स द्वारा कवर्ड</span>
                      </div>
                      <button
                        onClick={() => setExpandedClusterId(isClusterExpanded ? null : item.clusterId!)}
                        className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{isClusterExpanded ? 'छुपाएं' : 'अन्य सोर्सेज देखें'}</span>
                        {isClusterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isClusterExpanded && (
                      <div className="pt-2 border-t border-indigo-200/60 space-y-1.5 text-xs">
                        {item.cluster.items.map((otherItem) => (
                          <div key={otherItem.id} className="flex items-start justify-between gap-2 p-1.5 bg-white rounded-lg border border-indigo-100">
                            <div className="min-w-0">
                              <span className="font-bold text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded mr-1">
                                {otherItem.publisherName}
                              </span>
                              <span className="text-stone-800 text-[11px]">{otherItem.originalTitle}</span>
                            </div>
                            <a
                              href={otherItem.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-stone-400 hover:text-orange-600 flex-shrink-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-1.5">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                    title="ओरिजिनल न्यूज़ स्रोत देखें"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/[a-zA-Z]{3,}/.test(item.originalTitle) && (
                    <button
                      onClick={() => handleTranslateItem(item.id)}
                      disabled={translatingId === item.id}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold px-2 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer"
                      title="हिंदी में अनुवाद करें"
                    >
                      <Languages className={`w-3.5 h-3.5 ${translatingId === item.id ? 'animate-spin' : ''}`} />
                      <span>{translatingId === item.id ? 'अनुवाद...' : 'हिंदी'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleSingleReject(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="खबर हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleCreateSingleDraft(item.id)}
                  disabled={convertingId === item.id}
                  className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
                >
                  <FileText className={`w-3.5 h-3.5 ${convertingId === item.id ? 'animate-bounce' : ''}`} />
                  <span>{convertingId === item.id ? 'ड्राफ्ट बन रहा...' : '✍️ ड्राफ्ट बनाएं'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
