'use client';

import React, { useState, useEffect } from 'react';
import { CopyCheck, AlertTriangle } from 'lucide-react';
import ImporterSubNav from '@/components/admin/ImporterSubNav';

interface DuplicateItem {
  id: string;
  originalTitle: string;
  publisherName: string;
  similarityPercentage?: number;
  importedAt: string;
}

export default function DuplicatesAdminPage() {
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);

  useEffect(() => {
    fetch('/api/admin/importer/inbox?status=DUPLICATE')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDuplicates(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <ImporterSubNav />
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">डुप्लिकेट समाचार (Duplicates Ingested)</h1>
        <p className="text-xs text-stone-500">विभिन्न सोर्सेज से प्राप्त समान या एक जैसी खबरें ({duplicates.length})</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">सोर्स/प्रकाशक</th>
              <th className="p-3">शीर्षक (Headline)</th>
              <th className="p-3">समानता (Similarity %)</th>
              <th className="p-3">प्राप्त समय</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {duplicates.map((dup) => (
              <tr key={dup.id} className="hover:bg-stone-50">
                <td className="p-3 font-bold text-stone-900">{dup.publisherName}</td>
                <td className="p-3 font-semibold text-stone-800">{dup.originalTitle}</td>
                <td className="p-3">
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                    {dup.similarityPercentage || 90}% Match
                  </span>
                </td>
                <td className="p-3 text-stone-400 font-mono">
                  {new Date(dup.importedAt).toLocaleTimeString('hi-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
