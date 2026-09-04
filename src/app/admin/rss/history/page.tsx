'use client';

import React, { useState, useEffect } from 'react';
import { History, RefreshCw } from 'lucide-react';

export default function RssSyncHistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/rss/history');
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <History className="w-6 h-6 text-[#F97316]" />
            <span>📜 सिंक इतिहास एवं लॉग्ज़ (Import Sync History)</span>
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            सभी एक्सटर्नल RSS/API सोर्सेज की सिंक हिस्ट्री, नया आयात, डुप्लिकेट्स व एरर लॉग्ज़
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>रीफ्रेश</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-5 space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 font-extrabold text-stone-800 border-b border-stone-200">
              <tr>
                <th className="p-3">सोर्स (Source Name)</th>
                <th className="p-3">दिनांक व समय</th>
                <th className="p-3">कुल पाई गईं</th>
                <th className="p-3">नया आयात (Imported)</th>
                <th className="p-3">डुप्लिकेट्स</th>
                <th className="p-3">असफल (Failed)</th>
                <th className="p-3">स्थिति (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50">
                  <td className="p-3 font-sans font-bold text-stone-900">{log.source?.name || 'RSS Feed'}</td>
                  <td className="p-3 text-stone-600">{new Date(log.startedAt).toLocaleString('hi-IN')}</td>
                  <td className="p-3 font-bold text-stone-800">{log.itemsFound}</td>
                  <td className="p-3 font-bold text-green-700">+{log.itemsImported}</td>
                  <td className="p-3 text-amber-700">{log.duplicatesFound}</td>
                  <td className="p-3 text-red-600">{log.failedItems}</td>
                  <td className="p-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {log.status}
                    </span>
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
