import React from 'react';
import { db } from '@/lib/db';
import { Flame } from 'lucide-react';

export default async function BreakingNewsAdminPage() {
  const breakingItems = await db.breakingNews.findMany({
    orderBy: { priority: 'desc' },
    include: { article: true },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">ब्रेकिंग न्यूज़ टिकर (Breaking Ticker)</h1>
          <p className="text-xs text-stone-500">मुख्य पृष्ठ पर लाल टिकर में चलने वाली ब्रेकिंग खबरें</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-stone-900">वर्तमान सक्रिय टिकर आइटम</h3>

        {breakingItems.map((item) => (
          <div key={item.id} className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-red-600 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-stone-900">{item.customHeadline || item.article?.title}</p>
                <p className="text-[10px] text-stone-500">Priority: {item.priority} | Active: {item.active ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
