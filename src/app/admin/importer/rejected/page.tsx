'use client';

import React, { useState, useEffect } from 'react';
import { Ban, RotateCcw } from 'lucide-react';

interface RejectedItem {
  id: string;
  originalTitle: string;
  publisherName: string;
  importedAt: string;
}

export default function RejectedAdminPage() {
  const [rejected, setRejected] = useState<RejectedItem[]>([]);

  const fetchRejected = async () => {
    try {
      const res = await fetch('/api/admin/importer/inbox?status=REJECTED');
      const data = await res.json();
      if (data.success) setRejected(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchRejected();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch('/api/admin/importer/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'RESTORE' }),
      });
      const data = await res.json();
      if (data.success) fetchRejected();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">रिजेक्टेड खबरें (Rejected Items)</h1>
        <p className="text-xs text-stone-500">अस्वीकृत की गई एक्सटर्नल खबरें जिन्हें प्रकाशित नहीं किया गया ({rejected.length})</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">प्रकाशक</th>
              <th className="p-3">शीर्षक (Headline)</th>
              <th className="p-3">प्राप्त समय</th>
              <th className="p-3 text-right">कार्रवाई</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rejected.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50">
                <td className="p-3 font-bold text-stone-900">{item.publisherName}</td>
                <td className="p-3 font-semibold text-stone-800 line-through">{item.originalTitle}</td>
                <td className="p-3 text-stone-400 font-mono">
                  {new Date(item.importedAt).toLocaleDateString('hi-IN')}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleRestore(item.id)}
                    className="bg-stone-100 hover:bg-orange-100 text-stone-800 hover:text-[#C2410C] font-bold px-3 py-1 rounded flex items-center gap-1 ml-auto text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore to Inbox</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
