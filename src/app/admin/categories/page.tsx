'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Check } from 'lucide-react';

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
  const [message, setMessage] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), order, isHeaderMenu }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('नयी श्रेणी सफलता से बनाई गई!');
        setName('');
        setSlug('');
        fetchCategories();
      } else {
        setMessage(data.error || 'त्रुटि हुई।');
      }
    } catch (err) {
      setMessage('सर्वर त्रुटि।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">श्रेणियां प्रबंधन (Create & Manage Categories)</h1>
        <p className="text-xs text-stone-500">नयी श्रेणियां जोड़ें, नेविगेशन मेनू क्रमबद्ध करें</p>
      </div>

      {/* Create Category Form */}
      <form onSubmit={handleCreateCategory} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">➕ नयी श्रेणी जोड़ें (Create New Category)</h3>

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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isHeaderMenu}
              onChange={(e) => setIsHeaderMenu(e.target.checked)}
              className="w-4 h-4 text-[#F97316]"
            />
            <span>हेडर नेविगेशन मेनू में प्रदर्शित करें</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'बनाया जा रहा है...' : 'श्रेणी जोड़ें'}</span>
          </button>
        </div>

        {message && <p className="text-xs font-bold text-green-700">{message}</p>}
      </form>

      {/* Category List */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">क्रम (Order)</th>
              <th className="p-3">श्रेणी नाम</th>
              <th className="p-3">Slug</th>
              <th className="p-3">कुल समाचार</th>
              <th className="p-3">नेविगेशन मेनू</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-stone-50">
                <td className="p-3 font-mono font-bold text-stone-800">{cat.order}</td>
                <td className="p-3 font-bold text-stone-900">{cat.name}</td>
                <td className="p-3 text-stone-400 font-mono">{cat.slug}</td>
                <td className="p-3 font-bold text-[#EA580C]">{cat.articleCount || 0}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.isHeaderMenu ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                    {cat.isHeaderMenu ? 'हाँ (Menu Active)' : 'नहीं'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
