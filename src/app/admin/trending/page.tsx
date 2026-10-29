'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Flame,
  Globe,
  RefreshCw,
  X,
  Eye,
  Loader2,
  Check
} from 'lucide-react';

interface TrendingAdminItem {
  id: string;
  newsId?: number;
  title: string;
  slug: string;
  featuredImage?: string | null;
  publishedAt?: string;
  order: number;
  enabled: boolean;
  category?: { name: string };
}

interface SearchArticle {
  id: string;
  newsId?: number;
  title: string;
  slug: string;
  featuredImage?: string | null;
  publishedAt: string;
  category?: { name: string };
}

export default function AdminTrendingPage() {
  const [items, setItems] = useState<TrendingAdminItem[]>([]);
  const [storyCount, setStoryCount] = useState<number>(15);
  const [sectionEnabled, setSectionEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Add Article Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchArticle[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchTrendingData = async () => {
    try {
      const res = await fetch('/api/admin/trending');
      const data = await res.json();
      if (data.success && data.data) {
        setStoryCount(data.data.storyCount || 15);
        setSectionEnabled(data.data.enabled !== false);
        const sorted = (data.data.items || []).sort((a: TrendingAdminItem, b: TrendingAdminItem) => a.order - b.order);
        setItems(sorted);
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Error loading trending:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingData();
  }, []);

  // Search published articles to add
  const handleSearchArticles = async (q: string) => {
    setSearchQuery(q);
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/admin/trending?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        const existingIds = new Set(items.map((i) => i.id));
        setSearchResults((data.data || []).filter((a: SearchArticle) => !existingIds.has(a.id)));
      }
    } catch (err) {
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    handleSearchArticles('');
  };

  // Add selected article to trending list at top or bottom
  const handleAddArticle = (art: SearchArticle) => {
    const newItem: TrendingAdminItem = {
      id: art.id,
      newsId: art.newsId,
      title: art.title,
      slug: art.slug,
      featuredImage: art.featuredImage,
      publishedAt: art.publishedAt,
      order: 1, // put at top
      enabled: true,
      category: art.category,
    };

    const next = [newItem, ...items];
    const reordered = next.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    setIsDirty(true);
    setSearchResults((prev) => prev.filter((p) => p.id !== art.id));
  };

  // Move item UP (ऊपर खिसकाएं)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    const reordered = next.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    setIsDirty(true);
  };

  // Move item DOWN (नीचे खिसकाएं)
  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    const reordered = next.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    setIsDirty(true);
  };

  // Move item directly to TOP (शीर्ष पर लाएं)
  const handleMoveToTop = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    const [target] = next.splice(index, 1);
    next.unshift(target);
    const reordered = next.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    setIsDirty(true);
  };

  // Move item directly to BOTTOM (सबसे नीचे भेजें)
  const handleMoveToBottom = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    const [target] = next.splice(index, 1);
    next.push(target);
    const reordered = next.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    setIsDirty(true);
  };

  // Toggle Enable / Disable
  const handleToggleEnable = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
    setIsDirty(true);
  };

  // Remove from trending
  const handleRemove = (id: string) => {
    const filtered = items.filter((item) => item.id !== id);
    const reordered = filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    setIsDirty(true);
  };

  // Save All Changes
  const handleSaveAll = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyCount,
          enabled: sectionEnabled,
          items: items.map((item) => ({
            id: item.id,
            order: item.order,
            enabled: item.enabled,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg('✅ ट्रेंडिंग न्यूज़ का क्रम सफलतापूर्वक सुरक्षित हो गया! होमपेज पर बदलाव लाइव हो चुके हैं।');
        setIsDirty(false);
        setTimeout(() => setMsg(''), 5000);
      } else {
        alert(data.error || 'सुरक्षित करने में समस्या आई');
      }
    } catch (err: any) {
      alert(err.message || 'नेटवर्क त्रुटि');
    } finally {
      setSaving(false);
    }
  };

  // Reset to Latest Published News
  const handleResetToLatest = async () => {
    if (!confirm('क्या आप ट्रेंडिंग क्रम को ताज़ा प्रकाशित तारीख (Newest First) के अनुसार रीसेट करना चाहते हैं?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/articles?status=PUBLISHED&limit=20');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const reordered = data.data.map((art: any, idx: number) => ({
          id: art.id,
          newsId: art.newsId,
          title: art.title,
          slug: art.slug,
          featuredImage: art.featuredImage,
          publishedAt: art.publishedAt,
          order: idx + 1,
          enabled: true,
          category: art.category,
        }));
        setItems(reordered);
        setIsDirty(true);
      }
    } catch (_) {}
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#EA580C]" />
        <p className="text-xs font-bold text-stone-500">ट्रेंडिंग न्यूज़ डेटा लोड हो रहा है...</p>
      </div>
    );
  }

  const enabledCount = items.filter((i) => i.enabled).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-orange-100 text-[#EA580C] rounded-xl shadow-2xs">
              <Flame className="w-5 h-5 animate-bounce" />
            </span>
            <h1 className="text-2xl font-black text-stone-900">
              🔥 ट्रेंडिंग न्यूज़ क्रम प्रबंधन (Trending News Order)
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            यहाँ से ट्रेंडिंग न्यूज़ को 1-क्लिक में ऊपर-नीचे खिसकाएं। जो क्रम आप यहाँ सेट करेंगे, वही होमपेज विजेट में लाइव स्क्रॉल होगा।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span>होमपेज पर देखें</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          <button
            type="button"
            onClick={handleResetToLatest}
            className="px-3.5 py-2 border border-stone-200 hover:border-orange-300 rounded-xl text-xs font-bold text-stone-700 hover:text-[#EA580C] hover:bg-orange-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="सभी खबरों को सबसे ताज़ा तारीख के अनुसार रीसेट करें"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>🔄 डिफ़ॉल्ट लेटेस्ट क्रम</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || !isDirty}
            className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              isDirty
                ? 'bg-[#EA580C] hover:bg-orange-700 text-white animate-pulse'
                : 'bg-stone-200 text-stone-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'सुरक्षित हो रहा है...' : isDirty ? '💾 क्रम सुरक्षित करें (Save)' : '✓ सुरक्षित है'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-2xs">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold cursor-pointer">×</button>
        </div>
      )}

      {/* Control Bar: Story Count & Widget Toggle */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-extrabold text-stone-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sectionEnabled}
              onChange={(e) => {
                setSectionEnabled(e.target.checked);
                setIsDirty(true);
              }}
              className="w-4 h-4 accent-[#EA580C] cursor-pointer"
            />
            <span>ट्रेंडिंग विजेट होमपेज पर सक्रिय रखें (Enabled)</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600">विजेट में खबरें (Max Stories):</span>
            <select
              value={storyCount}
              onChange={(e) => {
                setStoryCount(parseInt(e.target.value, 10));
                setIsDirty(true);
              }}
              className="p-1.5 px-3 bg-white border border-stone-300 rounded-lg text-xs font-black text-stone-800 outline-none focus:border-[#EA580C]"
            >
              <option value={5}>5 खबरें</option>
              <option value={10}>10 खबरें</option>
              <option value={15}>15 खबरें</option>
              <option value={20}>20 खबरें</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-500">
            सक्रिय: <strong className="text-stone-900">{enabledCount}</strong> / कुल: {items.length}
          </span>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>➕ नया समाचार जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Reorderable List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="text-xs font-black text-stone-800 flex items-center gap-1.5">
            <span>📋</span>
            <span>ट्रेंडिंग न्यूज़ सूची (ऊपर वाला समाचार #1 पर दिखेगा)</span>
          </div>
          <span className="text-[11px] text-stone-500 font-bold">
            💡 ⬆️ / ⬇️ बटन दबाकर क्रम बदलें और &quot;क्रम सुरक्षित करें&quot; पर क्लिक करें
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-3">
            <Flame className="w-12 h-12 mx-auto text-stone-300" />
            <p className="text-sm font-bold text-stone-600">कोई समाचार नहीं जोड़ा गया है।</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#EA580C] text-white rounded-xl text-xs font-bold"
            >
              समाचार जोड़ें
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {items.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === items.length - 1;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    !item.enabled ? 'bg-stone-50/70 opacity-60' : isFirst ? 'bg-orange-50/40 hover:bg-orange-50/70' : 'hover:bg-stone-50/80'
                  }`}
                >
                  {/* Left Info: Rank + Thumbnail + Title */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div className="flex flex-col items-center shrink-0">
                      <span
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shadow-2xs ${
                          isFirst
                            ? 'bg-[#EA580C] text-white ring-2 ring-orange-300'
                            : 'bg-stone-100 text-stone-800 border border-stone-200'
                        }`}
                      >
                        #{index + 1}
                      </span>
                      {isFirst && (
                        <span className="text-[9px] font-black text-[#EA580C] uppercase mt-0.5">Top #1</span>
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-16 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                      {item.featuredImage ? (
                        <Image
                          src={item.featuredImage}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                          फ़ोटो नहीं
                        </div>
                      )}
                    </div>

                    {/* Title & Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        {item.category && (
                          <span className="text-[10px] font-extrabold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                            {item.category.name}
                          </span>
                        )}
                        {item.newsId && (
                          <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                            #{item.newsId}
                          </span>
                        )}
                        {!item.enabled && (
                          <span className="text-[10px] font-black bg-stone-200 text-stone-600 px-2 py-0.5 rounded">
                            अक्षम (Hidden)
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Right Action Buttons: Reordering & Toggles */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Top Shortcut Button */}
                    <button
                      type="button"
                      onClick={() => handleMoveToTop(index)}
                      disabled={isFirst}
                      className="p-2 border border-stone-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-stone-600 hover:text-[#EA580C] transition-colors cursor-pointer"
                      title="सीधे सबसे ऊपर लाएं (#1)"
                    >
                      <ChevronsUp className="w-4 h-4" />
                    </button>

                    {/* Move Up Button */}
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst}
                      className="p-2 border border-stone-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-stone-600 hover:text-[#EA580C] transition-colors cursor-pointer flex items-center gap-1"
                      title="एक स्थान ऊपर खिसकाएं"
                    >
                      <ArrowUp className="w-4 h-4" />
                      <span className="text-[11px] font-bold hidden md:inline">ऊपर</span>
                    </button>

                    {/* Move Down Button */}
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast}
                      className="p-2 border border-stone-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-stone-600 hover:text-[#EA580C] transition-colors cursor-pointer flex items-center gap-1"
                      title="एक स्थान नीचे खिसकाएं"
                    >
                      <ArrowDown className="w-4 h-4" />
                      <span className="text-[11px] font-bold hidden md:inline">नीचे</span>
                    </button>

                    {/* Bottom Shortcut Button */}
                    <button
                      type="button"
                      onClick={() => handleMoveToBottom(index)}
                      disabled={isLast}
                      className="p-2 border border-stone-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-stone-600 hover:text-[#EA580C] transition-colors cursor-pointer"
                      title="सीधे सबसे नीचे भेजें"
                    >
                      <ChevronsDown className="w-4 h-4" />
                    </button>

                    {/* Toggle Enable/Disable Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleEnable(item.id)}
                      className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                        item.enabled
                          ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                          : 'border-stone-200 bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                      title={item.enabled ? 'विजेट में सक्रिय (सक्षम)' : 'विजेट से छिपा हुआ (अक्षम)'}
                    >
                      {item.enabled ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-2 border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="ट्रेंडिंग लिस्ट से हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Article Search Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-orange-100 text-[#EA580C] rounded-lg">
                  <Plus className="w-4 h-4" />
                </span>
                <h3 className="font-black text-base text-stone-900">
                  ट्रेंडिंग में नया समाचार जोड़ें (Add to Trending)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="pt-4 pb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="समाचार शीर्षक से खोजें..."
                  value={searchQuery}
                  onChange={(e) => handleSearchArticles(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:border-[#EA580C] outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 pr-1">
              {searchLoading ? (
                <div className="py-12 text-center text-stone-400 text-xs font-bold">
                  खोज जारी है...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs font-bold">
                  कोई अप्रयुक्त समाचार नहीं मिला।
                </div>
              ) : (
                searchResults.map((art) => (
                  <div
                    key={art.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-12 h-10 rounded bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                        {art.featuredImage ? (
                          <Image
                            src={art.featuredImage}
                            alt={art.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        {art.category && (
                          <span className="text-[10px] font-bold text-stone-500 block">
                            {art.category.name} {art.newsId ? `• #${art.newsId}` : ''}
                          </span>
                        )}
                        <h4 className="text-xs font-extrabold text-stone-900 truncate">
                          {art.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddArticle(art)}
                      className="px-3 py-1.5 bg-[#EA580C] hover:bg-orange-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>जोड़ें</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
