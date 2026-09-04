import React from 'react';
import { db } from '@/lib/db';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditLogsAdminPage() {
  const auditLogs = await db.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">ऑडिट लॉग (Audit Activity Logs)</h1>
        <p className="text-xs text-stone-500">कंट्रोल पैनल में किए गए सभी बदलावों की समयबद्ध लॉग प्रविष्टियां</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">समय (Timestamp)</th>
              <th className="p-3">उपयोगकर्ता (User)</th>
              <th className="p-3">कार्रवाई (Action)</th>
              <th className="p-3">ऑब्जेक्ट (Target)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-stone-50">
                <td className="p-3 text-stone-400 font-mono">
                  {new Date(log.timestamp).toLocaleString('hi-IN')}
                </td>
                <td className="p-3 font-bold text-stone-800">{log.userName || 'System Admin'}</td>
                <td className="p-3">
                  <span className="bg-orange-100 text-[#C2410C] px-2 py-0.5 rounded text-[10px] font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="p-3 font-mono text-stone-500">{log.objectType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
