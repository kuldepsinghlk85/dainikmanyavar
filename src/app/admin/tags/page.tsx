'use client';

import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus } from 'lucide-react';

interface TagItem {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export default function TagsAdminPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags');
      const data = await res.json();
      if (data.success) setTags(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTagName('');
        setSeoTitle('');
        setSeoDescription('');
        setMessage('नया टैग सफलतापूर्वक बनाया गया!');
        fetchTags();
      }
    } catch (err) {}
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">मल्टी टैग्स प्रबंधन (Create & Manage Tags)</h1>
        <p className="text-xs text-stone-500">वेबसाइट के सभी टैग्स प्रबंधित करें और नए टैग्स बनाएं</p>
      </div>

      {/* Create Tag Form */}
      <form onSubmit={handleAddTag} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">🏷️ नया टैग बनाएं (Create New Tag)</h3>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">टैग नाम (Tag Name) *</label>
          <input
            type="text"
            required
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="उदा. #जौनपुर, #विकास, #शिक्षा..."
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-bold focus:outline-none focus:border-[#F97316]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">SEO Title (गूगल सर्च हेडिंग)</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="उदा. #जौनपुर की ताज़ा ख़बरें | दैनिक मान्यवर"
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">SEO Description</label>
            <input
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="इस टैग से जुड़ी मुख्य खबरें..."
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {message && <p className="text-xs font-bold text-green-700">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'बनाया जा रहा है...' : 'टैग सुरक्षित करें'}</span>
          </button>
        </div>
      </form>

      {/* Tags Grid */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
        <h3 className="text-sm font-bold text-stone-800 mb-3">कुल उपलब्ध टैग्स ({tags.length})</h3>

        <div className="flex flex-wrap gap-2.5">
          {tags.map((t) => (
            <div
              key={t.id}
              className="tag-chip text-xs flex items-center gap-2 bg-[#FFF1E6] border border-[#FDBA74] px-3 py-1.5 rounded-full"
            >
              <span>{t.name}</span>
              <span className="bg-[#EA580C] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {t.articleCount || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
