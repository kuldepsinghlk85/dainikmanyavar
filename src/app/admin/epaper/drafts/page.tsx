'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit3, Eye, Trash2, Plus, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';

interface Edition {
  id: string;
  title: string;
  editionDate: string;
  editionType: string;
  coverImage?: string;
  totalPages: number;
  status: string;
}

export default function DraftEpapersAdminPage() {
  const [drafts, setDrafts] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/epaper/editions?status=DRAFT');
      const data = await res.json();
      if (data.success) setDrafts(data.data || []);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस ड्राफ्ट को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/epaper/editions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchDrafts();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-amber-500" />
            <span>Draft Editions (ड्राफ्ट ई-पेपर संस्करण)</span>
            <span className="bg-amber-500 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {drafts.length} ड्राफ्ट्स
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            वे संस्करण जो अभी तक पाठकों के लिए लाइव पब्लिश नहीं हुए हैं
          </p>
        </div>

        <Link
          href="/admin/epaper/upload"
          className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>➕ नया ड्राफ्ट बनाएं</span>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C] mx-auto" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
          <Edit3 className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-extrabold text-stone-800">कोई ड्राफ्ट ई-पेपर नहीं है</h3>
          <p className="text-xs text-stone-500">सभी तैयार अखबार प्रकाशित हैं।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drafts.map((ed) => (
            <div key={ed.id} className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="relative h-44 bg-stone-100 border-b border-stone-200 overflow-hidden">
                  <img src={ed.coverImage || '/uploads/epaper/pages/page_1.png'} alt={ed.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    DRAFT
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(ed.editionDate).toLocaleDateString('hi-IN')}</span>
                  </div>
                  <h3 className="font-extrabold text-stone-900 text-sm line-clamp-2">{ed.title}</h3>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/epaper/pages?editionId=${ed.id}`}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>एडिट व पब्लिश करें</span>
                </Link>

                <button
                  onClick={() => handleDelete(ed.id)}
                  className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
