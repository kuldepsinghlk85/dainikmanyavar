import React from 'react';
import { db } from '@/lib/db';
import { History, CheckCircle2, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryAdminPage() {
  const logs = await db.newsImportLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: 50,
    include: { source: true },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">इम्पोर्ट हिस्ट्री एवं लॉग (Import History & Sync Audit Logs)</h1>
        <p className="text-xs text-stone-500">सभी एक्सटर्नल सोर्सेज की सिंक एक्टिविटी और लॉग्स</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">समय (Timestamp)</th>
              <th className="p-3">सोर्स (Source)</th>
              <th className="p-3">मिले समाचार</th>
              <th className="p-3">इम्पोर्टेड (New)</th>
              <th className="p-3">डुप्लिकेट्स</th>
              <th className="p-3">स्थिति (Status)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-stone-50">
                <td className="p-3 text-stone-400 font-mono">
                  {new Date(log.startedAt).toLocaleString('hi-IN')}
                </td>
                <td className="p-3 font-bold text-stone-900">{log.source.name}</td>
                <td className="p-3 font-mono font-bold">{log.itemsFound}</td>
                <td className="p-3 font-mono font-bold text-green-700">{log.itemsImported}</td>
                <td className="p-3 font-mono font-bold text-amber-700">{log.duplicatesFound}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>{log.status}</span>
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
