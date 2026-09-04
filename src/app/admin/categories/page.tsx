'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Check, Eye, EyeOff, Trash2, Edit2, ArrowUp, ArrowDown, RefreshCw, AlertCircle } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  order: number;
  isHeaderMenu: boolean;
  articleCount?: number;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState('1');
  const [isHeaderMenu, setIsHeaderMenu] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit category modal/inline state
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editOrder, setEditOrder] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), order, isHeaderMenu }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `श्रेणी "${name.trim()}" सफलता से बनाई गई!` });
        setName('');
        setSlug('');
        setOrder('1');
        fetchCategories();
      } else {
        setMessage({ type: 'error', text: data.error || 'त्रुटि हुई।' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'सर्वर त्रुटि।' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle Header Menu (Enable / Disable)
  const handleToggleMenu = async (cat: CategoryItem) => {
    const newStatus = !cat.isHeaderMenu;

    // Optimistic UI update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isHeaderMenu: newStatus } : c))
    );

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, isHeaderMenu: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `"${cat.name}" को मेनू में ${newStatus ? 'सक्रिय (प्रदर्शित)' : 'निष्क्रिय (छिपाया)'} कर दिया गया।`,
        });
      } else {
        // Rollback on failure
        fetchCategories();
        setMessage({ type: 'error', text: data.error || 'मेनू टॉगल करने में विफल।' });
      }
    } catch (err) {
      fetchCategories();
      setMessage({ type: 'error', text: 'सर्वर त्रुटि।' });
    }
  };

  // Change Order (Up / Down)
  const handleChangeOrder = async (cat: CategoryItem, delta: number) => {
    const newOrder = Math.max(0, cat.order + delta);
    setCategories((prev) =>
      prev
        .map((c) => (c.id === cat.id ? { ...c, order: newOrder } : c))
        .sort((a, b) => a.order - b.order)
    );

    try {
      await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, order: newOrder }),
      });
      fetchCategories();
    } catch (err) {}
  };

  // Save Inline Edit
  const handleSaveEdit = async () => {
    if (!editingCat || !editName.trim()) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCat.id,
          name: editName.trim(),
          slug: editSlug.trim(),
          order: editOrder,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `श्रेणी "${editName}" का विवरण अपडेट हो गया!` });
        setEditingCat(null);
        fetchCategories();
      } else {
        setMessage({ type: 'error', text: data.error || 'अपडेट विफल।' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'सर्वर त्रुटि।' });
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!confirm(`क्या आप वाकई श्रेणी "${cat.name}" को हटाना चाहते हैं?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `श्रेणी "${cat.name}" सफलतापूर्वक हटा दी गई!` });
        fetchCategories();
      } else {
        setMessage({ type: 'error', text: data.error || 'हटाने में विफल।' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'सर्वर त्रुटि।' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">श्रेणियां प्रबंधन (Create & Manage Categories)</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            नयी श्रेणियां जोड़ें, नेविगेशन मेनू क्रमबद्ध करें और होमपेज मेनू में जब चाहें तब सक्रिय/निष्क्रिय करें
          </p>
        </div>
        <button
          onClick={fetchCategories}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          रिफ्रेश करें
        </button>
      </div>

      {/* Alert / Notification message */}
      {message && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all shadow-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-stone-400 hover:text-stone-700 ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create Category Form */}
      <form onSubmit={handleCreateCategory} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#F97316]" />
          <span>नयी श्रेणी जोड़ें (Create New Category)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">श्रेणी नाम (Category Name) *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा. व्यापार, स्थानीय..."
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-bold focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Slug (अंग्रेज़ी यूआरएल)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="vyapar, local..."
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">क्रम संख्या (Order)</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isHeaderMenu}
              onChange={(e) => setIsHeaderMenu(e.target.checked)}
              className="w-4 h-4 accent-[#F97316] rounded"
            />
            <span>हेडर नेविगेशन मेनू में प्रदर्शित करें</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'बनाया जा रहा है...' : 'श्रेणी जोड़ें'}</span>
          </button>
        </div>
      </form>

      {/* Edit Category Modal / Overlay */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-extrabold text-stone-900">
                श्रेणी संपादित करें (Edit Category)
              </h3>
              <button
                onClick={() => setEditingCat(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">श्रेणी नाम (Name)</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-bold focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-mono focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">क्रम संख्या (Order)</label>
                <input
                  type="number"
                  value={editOrder}
                  onChange={(e) => setEditOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-mono focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs font-bold shadow-sm"
              >
                सहेजें (Save Changes)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category List & Menu Toggle Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-stone-800">कुल श्रेणियां: {categories.length}</h3>
            <p className="text-[11px] text-stone-500">
              मेनू स्थिति बटन पर क्लिक करके किसी भी श्रेणी को होमपेज नेविगेशन बार में तुरंत दिखाएँ या छिपाएँ
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              मेनू में सक्रिय: {categories.filter((c) => c.isHeaderMenu).length}
            </span>
            <span className="flex items-center gap-1.5 text-stone-500 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span>
              छिपा हुआ: {categories.filter((c) => !c.isHeaderMenu).length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200 select-none">
              <tr>
                <th className="p-3 w-24">क्रम (Order)</th>
                <th className="p-3">श्रेणी नाम</th>
                <th className="p-3">Slug</th>
                <th className="p-3 text-center">कुल समाचार</th>
                <th className="p-3 text-center">नेविगेशन मेनू टॉगल</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-orange-50/30 transition-colors">
                  {/* Order column with Up/Down quick buttons */}
                  <td className="p-3 font-mono font-bold text-stone-800">
                    <div className="flex items-center gap-1">
                      <span className="w-6 text-center">{cat.order}</span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleChangeOrder(cat, -1)}
                          title="क्रम ऊपर करें"
                          className="p-0.5 hover:bg-stone-200 rounded text-stone-500 hover:text-stone-900 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChangeOrder(cat, 1)}
                          title="क्रम नीचे करें"
                          className="p-0.5 hover:bg-stone-200 rounded text-stone-500 hover:text-stone-900 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Name */}
                  <td className="p-3 font-bold text-stone-900 text-sm">
                    {cat.name}
                  </td>

                  {/* Slug */}
                  <td className="p-3 text-stone-500 font-mono">
                    /{cat.slug}
                  </td>

                  {/* Article Count */}
                  <td className="p-3 text-center font-bold text-[#EA580C]">
                    <span className="bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full font-mono">
                      {cat.articleCount || 0}
                    </span>
                  </td>

                  {/* 1-Click Interactive Menu Toggle Button */}
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleMenu(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                        cat.isHeaderMenu
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                      }`}
                      title={cat.isHeaderMenu ? 'क्लिक करके मेनू से छिपाएं' : 'क्लिक करके मेनू में दिखाएं'}
                    >
                      {cat.isHeaderMenu ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>हाँ (सक्रिय मेनू)</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                          <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                          <span>नहीं (छिपा हुआ)</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions (Edit & Delete) */}
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCat(cat);
                          setEditName(cat.name);
                          setEditSlug(cat.slug);
                          setEditOrder(cat.order);
                        }}
                        title="संपादित करें"
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        title="हटाएं"
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
