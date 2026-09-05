'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sliders,
  ArrowUp,
  ArrowDown,
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
  Sparkles,
  Eye
} from 'lucide-react';

interface SliderItem {
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

export default function AdminSliderPage() {
  const [items, setItems] = useState<SliderItem[]>([]);
  const [storyCount, setStoryCount] = useState<number>(10);
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

  const fetchSliderData = async () => {
    try {
      const res = await fetch('/api/admin/slider');
      const data = await res.json();
      if (data.success && data.data) {
        setStoryCount(data.data.storyCount || 10);
        setSectionEnabled(data.data.enabled !== false);
        const sorted = (data.data.items || []).sort((a: SliderItem, b: SliderItem) => a.order - b.order);
        setItems(sorted);
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Error loading slider:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliderData();
  }, []);

  // Search published articles to add
  const handleSearchArticles = async (q: string) => {
    setSearchQuery(q);
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/admin/slider?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        // Exclude already added articles
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

  // Add article to slider
  const handleAddArticle = (art: SearchArticle) => {
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 1;
    const newItem: SliderItem = {
      id: art.id,
      newsId: art.newsId,
      title: art.title,
      slug: art.slug,
      featuredImage: art.featuredImage,
      publishedAt: art.publishedAt,
      order: nextOrder,
      enabled: true,
      category: art.category,
    };
    setItems((prev) => [...prev, newItem]);
    setSearchResults((prev) => prev.filter((a) => a.id !== art.id));
    setIsDirty(true);
    setMsg('समाचार स्लाइडर सूची में जोड़ दिया गया! सहेजने के लिए "क्रम व सेटिंग्स सुरक्षित करें" पर क्लिक करें।');
  };

  // Move item UP
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    // Re-assign 1-based order
    const reordered = next.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    setIsDirty(true);
  };

  // Move item DOWN
  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    // Re-assign 1-based order
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

  // Remove from slider
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
      const res = await fetch('/api/admin/slider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyCount,
          enabled: sectionEnabled,
          items: items.map((item, idx) => ({
            id: item.id,
            order: idx + 1,
            enabled: item.enabled,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg('✅ मुख्य स्लाइडर का अनुक्रम व सेटिंग्स सफलतापूर्वक सुरक्षित हो गए!');
        setIsDirty(false);
        fetchSliderData();
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(data.error || 'सुरक्षित करने में समस्या आई');
      }
    } catch (err: any) {
      alert(err.message || 'सर्वर त्रुटि');
    } finally {
      setSaving(false);
    }
  };

  const countOptions = [5, 8, 10, 12, 15];

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 text-[#EA580C]">
              <Flame className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              मुख्य स्लाइडर व टॉप न्यूज़ प्रबंधक
            </h1>
          </div>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            होमपेज पर टॉप में चलने वाली मुख्य खबरों का अनुक्रम (क्रम 1, 2, 3...), सक्रियता एवं स्लाइडर संख्या निर्धारित करें
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span>लाइव देखें</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'सुरक्षित हो रहा है...' : 'क्रम व सेटिंग्स सुरक्षित करें'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-xs animate-in fade-in">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Section 1: Settings Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* Slider Count Selector (User's Exact Request: 5 to 10+ News) */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#EA580C]" />
              <span>स्लाइडर में चलने वाले समाचारों की संख्या (Slider Story Count)</span>
            </label>
            <p className="text-[11px] text-stone-500 font-medium">
              चुनें कि होमपेज के टॉप स्लाइडर में कुल कितने मुख्य समाचार एक के बाद एक स्लाइड होंगे:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {countOptions.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    setStoryCount(cnt);
                    setIsDirty(true);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    storyCount === cnt
                      ? 'bg-[#EA580C] text-white shadow-sm ring-2 ring-orange-200'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cnt} समाचार {cnt === 10 ? '⭐ (अनुशंसित)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Section Enable/Disable Switch */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-stone-800 block">स्लाइडर विजिबिलिटी</span>
              <span className="text-[11px] font-bold text-stone-500">
                {sectionEnabled ? '🟢 होमपेज पर सक्रिय' : '🔴 होमपेज से छुपा हुआ'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSectionEnabled(!sectionEnabled);
                setIsDirty(true);
              }}
              className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                sectionEnabled ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  sectionEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center pt-3 border-t border-stone-100 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600">
              वर्तमान में कुल समाचार: <strong>{items.length}</strong> | सक्रिय: <strong>{items.filter((i) => i.enabled).length}</strong>
            </span>
            {isDirty && (
              <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                ⚠️ असहेजे बदलाव (कृपया ऊपर सेव करें)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-stone-900 hover:bg-black text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            <span>➕ अन्य समाचार स्लाइडर में जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Section 2: Reorderable News Sequence List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-black text-stone-700 uppercase tracking-wider">
          <div className="flex items-center gap-8">
            <span className="w-16 text-center">क्रम (Order)</span>
            <span>समाचार विवरण (News Headline)</span>
          </div>
          <div className="flex items-center gap-12 pr-4">
            <span>स्लाइडर स्थिति</span>
            <span>हटाएं</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <Sliders className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="font-bold text-sm text-stone-700">स्लाइडर में कोई समाचार नहीं जुड़ा है</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              आप 'अन्य समाचार स्लाइडर में जोड़ें' बटन दबाकर डेटाबेस से किसी भी खबर को चुनकर स्लाइडर में शामिल कर सकते हैं।
            </p>
            <button
              onClick={handleOpenAddModal}
              className="bg-[#EA580C] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>समाचार जोड़ें</span>
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
                  className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                    item.enabled ? 'hover:bg-orange-50/20' : 'bg-stone-50/60 opacity-65'
                  }`}
                >
                  {/* Left: Sequence Position & Up/Down Arrows */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-xl border border-stone-200 shrink-0">
                      <span className="w-7 h-7 bg-[#EA580C] text-white font-mono font-black text-xs rounded-lg flex items-center justify-center shadow-xs">
                        #{index + 1}
                      </span>

                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={isFirst}
                          title="ऊपर ले जाएं (Move Up)"
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={isLast}
                          title="नीचे ले जाएं (Move Down)"
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Image */}
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                      {item.featuredImage ? (
                        <Image src={item.featuredImage} alt={item.title} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">No Pic</div>
                      )}
                    </div>

                    {/* Headline & Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {item.newsId ? (
                          <span className="font-mono text-[10px] font-black bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded">
                            #{item.newsId}
                          </span>
                        ) : null}
                        {item.category?.name && (
                          <span className="text-[10px] font-bold text-[#EA580C] bg-orange-50 px-2 py-0.2 rounded border border-orange-200">
                            {item.category.name}
                          </span>
                        )}
                        {index === 0 && (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded border border-emerald-300">
                            ⭐ मुख्य लीड स्टोरी (#1 First)
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Toggle Enable & Remove Action */}
                  <div className="flex items-center gap-6 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleEnable(item.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                        item.enabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {item.enabled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>सक्रिय</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-stone-400" />
                          <span>निष्क्रिय</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                      title="स्लाइडर से हटाएं"
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

      {/* Article Picker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#EA580C]" />
                <h3 className="font-extrabold text-stone-900 text-sm">
                  स्लाइडर में जोड़ने हेतु समाचार चुनें
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-stone-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchArticles(e.target.value)}
                  placeholder="शीर्षक से समाचार खोजें..."
                  className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-stone-100">
              {searchLoading ? (
                <div className="p-8 text-center text-xs font-bold text-stone-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#EA580C]" />
                  <span>समाचार खोजे जा रहे हैं...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-stone-400">
                  कोई अनुपयुक्त समाचार नहीं मिला या सभी पहले से जुड़े हैं।
                </div>
              ) : (
                searchResults.map((art) => (
                  <div key={art.id} className="pt-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-12 h-10 rounded-md overflow-hidden bg-stone-100 shrink-0">
                        {art.featuredImage ? (
                          <Image src={art.featuredImage} alt={art.title} fill unoptimized className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {art.newsId && (
                            <span className="font-mono text-[9px] font-bold bg-stone-200 px-1 rounded">
                              #{art.newsId}
                            </span>
                          )}
                          {art.category?.name && (
                            <span className="text-[9px] font-bold text-orange-700 bg-orange-50 px-1.5 rounded">
                              {art.category.name}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-stone-900 text-xs line-clamp-1">
                          {art.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddArticle(art)}
                      className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer shadow-xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>जोड़ें</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                पूर्ण (Done)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
