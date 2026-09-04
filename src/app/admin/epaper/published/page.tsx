'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Eye, Trash2, Plus, Calendar, FileText, BarChart3, RefreshCw } from 'lucide-react';

interface Edition {
  id: string;
  title: string;
  editionDate: string;
  editionType: string;
  pdfUrl?: string;
  coverImage?: string;
  totalPages: number;
  viewCount: number;
  status: string;
}

export default function PublishedEpapersAdminPage() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEditions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/epaper/editions?status=PUBLISHED');
      const data = await res.json();
      if (data.success) setEditions(data.data || []);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchEditions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस ई-पेपर संस्करण को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/epaper/editions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchEditions();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#EA580C]" />
            <span>Published Editions (प्रकाशित ई-पेपर संस्करण)</span>
            <span className="bg-[#EA580C] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {editions.length} प्रकाशित
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            पाठकों के लिए लाइव उपलब्ध सभी डिजिटल अखबारों की सूची
          </p>
        </div>

        <Link
          href="/admin/epaper/upload"
          className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>➕ नया अखबार अपलोड करें</span>
        </Link>
      </div>

      {/* Editions Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C] mx-auto" />
          <p className="text-xs font-bold text-stone-600 mt-2">प्रकाशित संस्करण लोड हो रहे हैं...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {editions.map((ed) => (
            <div key={ed.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                {/* Cover Image */}
                <div className="relative h-48 bg-stone-100 border-b border-stone-200 overflow-hidden group">
                  <img src={ed.coverImage || '/uploads/epaper/pages/page_1.png'} alt={ed.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                    📄 {ed.totalPages} पेज
                  </div>
                  <div className="absolute top-3 left-3 bg-[#EA580C] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    ● {ed.editionType}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-bold text-[#EA580C] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(ed.editionDate).toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>

                  <h3 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-2">{ed.title}</h3>

                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-stone-400" />
                      <span>{ed.viewCount} पाठक दृश्य</span>
                    </span>
                    <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      LIVE
                    </span>
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

                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/epaper/pages?editionId=${ed.id}`}
                    className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold"
                    title="पेज प्रबंधित करें"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDelete(ed.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="संस्करण हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
