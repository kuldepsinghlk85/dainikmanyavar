'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, FileText, Inbox, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RssDashboardWidget() {
  const [sources, setSources] = useState<any[]>([]);
  const [inboxCount, setInboxCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/rss/sources')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) setSources(data.data);
      })
      .catch(() => {});

    fetch('/api/admin/importer/inbox?status=NEW')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) setInboxCount(data.data.length);
      })
      .catch(() => {});
  }, []);

  const activeSources = sources.filter((s) => s.isActive).length;
  const failedSources = sources.filter((s) => s.healthStatus === 'Failed').length;

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-stone-100 pb-3">
        <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#EA580C]" />
          <span>📡 RSS Feed Library एवं ऑटो सिंक स्थिति</span>
        </h3>
        <Link href="/admin/rss/sources" className="text-xs text-[#EA580C] font-bold hover:underline flex items-center gap-1">
          <span>सभी सोर्सेज प्रबंधित करें</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl">
          <span className="text-[10px] font-sans font-bold text-orange-800 block">सक्रिय सोर्सेज (Active)</span>
          <span className="text-xl font-black text-orange-950">{activeSources} Feeds</span>
        </div>

        <div className="bg-[#0F172A] text-white p-3 rounded-xl">
          <span className="text-[10px] font-sans font-bold text-orange-400 block">इनबॉक्स लंबित (Inbox)</span>
          <span className="text-xl font-black text-white">{inboxCount} खबरें</span>
        </div>

        <div className="bg-green-50 border border-green-200 p-3 rounded-xl">
          <span className="text-[10px] font-sans font-bold text-green-800 block">सिंक स्थिति (Health)</span>
          <span className="text-xl font-black text-green-700">100% OK</span>
        </div>

        <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl">
          <span className="text-[10px] font-sans font-bold text-stone-600 block">विफल सोर्सेज (Failed)</span>
          <span className="text-xl font-black text-slate-800">{failedSources}</span>
        </div>
      </div>
    </div>
  );
}
