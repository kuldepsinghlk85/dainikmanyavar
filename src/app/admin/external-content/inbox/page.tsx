'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  Clock,
  Sparkles,
  Trophy,
  TrendingUp,
  Coins,
  Filter,
} from 'lucide-react';
import { formatHindiTimeAgo } from '@/lib/utils';

interface FeedItem {
  id: string;
  moduleType: string;
  sourceName: string;
  title: string;
  summary: string;
  suggestedTags: string;
  status: string;
  fetchedAt: string;
}

export default function ExternalContentInboxPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeModule, setActiveModule] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showClearModal, setShowClearModal] = useState(false);

  const fetchItems = async () => {
    try {
      const url =
        activeModule === 'ALL'
          ? '/api/admin/external-content/inbox'
          : `/api/admin/external-content/inbox?moduleType=${activeModule}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
    setSelectedIds([]);
  }, [activeModule]);

  // Filter items by status on client-side
  const filteredItems = useMemo(() => {
    if (statusFilter === 'ALL') return items;
    return items.filter((item) => item.status === statusFilter);
  }, [items, statusFilter]);

  // Counts for status filters
  const counts = useMemo(() => {
    return {
      all: items.length,
      new: items.filter((i) => i.status === 'NEW').length,
      approved: items.filter((i) => i.status === 'APPROVED').length,
      rejected: items.filter((i) => i.status === 'REJECTED').length,
    };
  }, [items]);

  const showNotification = (text: string, isError = false) => {
    if (isError) {
      setErrorMsg(text);
      setMsg('');
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setMsg(text);
      setErrorMsg('');
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const handleSyncFeeds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/external-content/fetch', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification(`सफलतापूर्वक ${data.count} नए विशेष समाचार इनबॉक्स में प्राप्त हुए!`);
        fetchItems();
      } else {
        showNotification(data.error || 'सिंक करने में त्रुटि आई', true);
      }
    } catch (err) {
      showNotification('सिंक करने में नेटवर्क त्रुटि आई', true);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch('/api/admin/external-content/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchItems();
      } else {
        showNotification(data.error || 'कार्यवाही विफल रही', true);
      }
    } catch (err) {
      showNotification('सर्वर से संपर्क नहीं हो सका', true);
    }
  };

  // Single Item Delete
  const handleDeleteItem = async (id: string, title?: string) => {
    const confirmText = title
      ? `क्या आप इस लिंक को डिलीट करना चाहते हैं?\n\n"${title.slice(0, 60)}..."`
      : 'क्या आप इस लिंक को डिलीट करना चाहते हैं?';

    if (!window.confirm(confirmText)) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/external-content/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'DELETE' }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setSelectedIds((prev) => prev.filter((itemKey) => itemKey !== id));
        showNotification(data.message || 'लिंक सफलतापूर्वक डिलीट कर दिया गया!');
      } else {
        showNotification(data.error || 'डिलीट करने में त्रुटि आई', true);
      }
    } catch (err) {
      showNotification('सर्वर त्रुटि: डिलीट नहीं हो सका', true);
    }
    setActionLoading(false);
  };

  // Bulk Delete Selected Items
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`क्या आप चुने हुए ${selectedIds.length} लिंक को इनबॉक्स से हमेशा के लिए हटाना चाहते हैं?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/external-content/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLEAR_ALL', ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
        setSelectedIds([]);
        showNotification(data.message || `${selectedIds.length} लिंक सफलतापूर्वक हटा दिए गए!`);
      } else {
        showNotification(data.error || 'डिलीट करने में त्रुटि आई', true);
      }
    } catch (err) {
      showNotification('सर्वर त्रुटि: चुने हुए लिंक नहीं हटाए जा सके', true);
    }
    setActionLoading(false);
  };

  // Clear Inbox (All, Current Tab, or Processed)
  const handleClearInbox = async (scope: 'ALL' | 'CURRENT_TAB' | 'PROCESSED') => {
    setShowClearModal(false);
    setActionLoading(true);

    try {
      const payload: any = { action: 'CLEAR_ALL' };
      if (scope === 'CURRENT_TAB' && activeModule !== 'ALL') {
        payload.moduleType = activeModule;
      } else if (scope === 'PROCESSED') {
        // Clear only already approved or rejected items
        const processedIds = items
          .filter((i) => i.status === 'APPROVED' || i.status === 'REJECTED')
          .map((i) => i.id);
        if (processedIds.length === 0) {
          showNotification('कोई स्वीकृत या रिजेक्टेड लिंक नहीं मिला।');
          setActionLoading(false);
          return;
        }
        payload.ids = processedIds;
      }

      const res = await fetch('/api/admin/external-content/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || 'इनबॉक्स सफलतापूर्वक क्लियर कर दिया गया!');
        fetchItems();
        setSelectedIds([]);
      } else {
        showNotification(data.error || 'क्लियर करने में त्रुटि आई', true);
      }
    } catch (err) {
      showNotification('सर्वर त्रुटि: इनबॉक्स क्लियर नहीं हो सका', true);
    }
    setActionLoading(false);
  };

  // Select / Deselect All
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getModuleLabel = (mod: string) => {
    switch (mod) {
      case 'CRICKET':
        return '🏏 क्रिकेट';
      case 'HOROSCOPE':
        return '🔮 राशिफल';
      case 'STOCK_MARKET':
        return '📈 शेयर बाजार';
      case 'GOLD_SILVER':
        return '🪙 सोना-चांदी';
      default:
        return 'सभी विशेष फ़ीड्स';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header Card */}
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#F97316]" />
            <span>विशेष ऑटो इनबॉक्स (External Content Review Panel)</span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            क्रिकेट, राशिफल, शेयर बाजार व सोना-चांदी के ऑटो फ़ीड्स — समीक्षा करें, पब्लिश करें अथवा लिंक हटाएं
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Clear Inbox Button */}
          <button
            onClick={() => setShowClearModal(true)}
            disabled={actionLoading || items.length === 0}
            className={`font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              items.length === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300'
            }`}
            title="इनबॉक्स के सभी या चयनित लिंक क्लियर करें"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>🗑️ इनबॉक्स क्लियर करें</span>
          </button>

          {/* Sync Feeds Button */}
          <button
            onClick={handleSyncFeeds}
            disabled={loading || actionLoading}
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'सिंक हो रहा है...' : '🔄 सभी विशेष फ़ीड्स सिंक करें'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Module Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveModule('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeModule === 'ALL'
                ? 'bg-[#EA580C] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            सभी (All Special Feeds) ({items.length})
          </button>
          <button
            onClick={() => setActiveModule('CRICKET')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeModule === 'CRICKET'
                ? 'bg-[#EA580C] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🏏 क्रिकेट (Cricket)
          </button>
          <button
            onClick={() => setActiveModule('HOROSCOPE')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeModule === 'HOROSCOPE'
                ? 'bg-[#EA580C] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🔮 राशिफल (Horoscope)
          </button>
          <button
            onClick={() => setActiveModule('STOCK_MARKET')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeModule === 'STOCK_MARKET'
                ? 'bg-[#EA580C] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            📈 शेयर बाजार (Market)
          </button>
          <button
            onClick={() => setActiveModule('GOLD_SILVER')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeModule === 'GOLD_SILVER'
                ? 'bg-[#EA580C] text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🪙 सोना-चांदी (Gold-Silver)
          </button>
        </div>

        {/* Secondary Status Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>स्थिति अनुसार:</span>
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                सभी ({counts.all})
              </button>
              <button
                onClick={() => setStatusFilter('NEW')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  statusFilter === 'NEW'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                नए ({counts.new})
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  statusFilter === 'APPROVED'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-800 hover:bg-green-100'
                }`}
              >
                स्वीकृत ({counts.approved})
              </button>
              <button
                onClick={() => setStatusFilter('REJECTED')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  statusFilter === 'REJECTED'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-800 hover:bg-red-100'
                }`}
              >
                रिजेक्टेड ({counts.rejected})
              </button>
            </div>
          </div>

          {/* Bulk Select Control Bar */}
          {filteredItems.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer"
              >
                {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-[#EA580C]" />
                ) : (
                  <Square className="w-4 h-4 text-stone-400" />
                )}
                <span>
                  {selectedIds.length === filteredItems.length ? 'सभी अचयनित करें' : 'सभी चुनें'}
                </span>
              </button>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>चुने हुए हटाएं ({selectedIds.length})</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inbox Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-3">
          <div className="w-14 h-14 bg-orange-50 text-[#EA580C] rounded-2xl flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-800">
            {items.length === 0
              ? 'इनबॉक्स में कोई लिंक उपलब्ध नहीं है'
              : 'इस फ़िल्टर में कोई लिंक नहीं मिला'}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            {items.length === 0
              ? 'सभी विशेष समाचार क्लियर हो चुके हैं। नए समाचार प्राप्त करने के लिए "सभी विशेष फ़ीड्स सिंक करें" पर क्लिक करें।'
              : 'कृपया अन्य फ़िल्टर चुनें या नया डेटा सिंक करें।'}
          </p>
          <div className="pt-2">
            <button
              onClick={handleSyncFeeds}
              className="px-4 py-2 bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              🔄 नए फ़ीड्स सिंक करें
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredItems.map((item) => {
            const tags = item.suggestedTags ? JSON.parse(item.suggestedTags) : [];
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-2xl border transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  isSelected
                    ? 'border-orange-400 bg-orange-50/20 shadow-md ring-1 ring-orange-300'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Left Section: Selection Checkbox & Details */}
                <div className="flex items-start gap-3.5 max-w-3xl">
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className="mt-1 cursor-pointer text-stone-400 hover:text-[#EA580C] transition-colors"
                    title="चयन करें"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#EA580C]" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                    )}
                  </button>

                  <div className="space-y-2">
                    {/* Source & Status Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-slate-900 text-orange-400 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded shadow-xs">
                        📡 {item.sourceName}
                      </span>
                      <span className="bg-orange-100 text-[#C2410C] font-extrabold text-[10px] px-2.5 py-0.5 rounded">
                        {item.moduleType}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : item.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {item.status === 'APPROVED'
                          ? '✓ स्वीकृत (APPROVED)'
                          : item.status === 'REJECTED'
                          ? '✕ अस्वीकृत (REJECTED)'
                          : '⚡ नया (NEW)'}
                      </span>
                      {item.fetchedAt && (
                        <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-300" />
                          <span>{formatHindiTimeAgo(item.fetchedAt)}</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Summary */}
                    <h3 className="font-extrabold text-base text-stone-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>

                    {/* Suggested Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((t: string) => (
                          <span
                            key={t}
                            className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Area */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  {item.status === 'NEW' && (
                    <>
                      <button
                        onClick={() => handleAction(item.id, 'APPROVE')}
                        className="bg-[#16A34A] hover:bg-green-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        title="स्वीकार करें और संबंधित मॉड्यूल में लाइव पब्लिश करें"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>स्वीकार करें</span>
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'REJECT')}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        title="अस्वीकार करें"
                      >
                        <XCircle className="w-4 h-4 text-stone-500" />
                        <span>रिजेक्ट</span>
                      </button>
                    </>
                  )}

                  {/* Individual Delete Link Button (Always available for every item) */}
                  <button
                    onClick={() => handleDeleteItem(item.id, item.title)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    title="इस लिंक को इनबॉक्स से हमेशा के लिए डिलीट करें"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>डिलीट</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Inbox Modal Dialog */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  इनबॉक्स क्लियर करें (Clear Inbox)
                </h3>
                <p className="text-xs text-stone-500">
                  कृपया चुनें कि आप कौन से लिंक हटाना चाहते हैं:
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Clear Current Tab */}
              {activeModule !== 'ALL' && (
                <button
                  onClick={() => handleClearInbox('CURRENT_TAB')}
                  className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-orange-400 hover:bg-orange-50/40 transition-all flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700 group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      केवल वर्तमान श्रेणी के लिंक हटाएं ({getModuleLabel(activeModule)})
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      केवल इस टैब के {filteredItems.length} लिंक हटाए जाएंगे, अन्य सुरक्षित रहेंगे।
                    </p>
                  </div>
                </button>
              )}

              {/* Option 2: Clear Processed Only */}
              <button
                onClick={() => handleClearInbox('PROCESSED')}
                className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    केवल स्वीकृत व रिजेक्टेड लिंक हटाएं ({counts.approved + counts.rejected})
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    पुराने प्रोसेस्ड लिंक हटेंगे, नए (NEW) लिंक सुरक्षित रहेंगे।
                  </p>
                </div>
              </button>

              {/* Option 3: Clear All Links */}
              <button
                onClick={() => handleClearInbox('ALL')}
                className="w-full text-left p-3 rounded-xl border border-red-200 bg-red-50/30 hover:bg-red-50 transition-all flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-red-100 text-red-700 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-900">
                    पूरा इनबॉक्स खाली करें (Clear All {items.length} Links)
                  </h4>
                  <p className="text-[11px] text-red-600">
                    इनबॉक्स के सभी लिंक हमेशा के लिए डिलीट हो जाएंगे।
                  </p>
                </div>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
