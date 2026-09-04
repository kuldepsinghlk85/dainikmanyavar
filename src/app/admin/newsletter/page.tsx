import React from 'react';
import { db } from '@/lib/db';
import { Mail, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewsletterAdminPage() {
  const subscribers = await db.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">न्यूज़लेटर सब्सक्राइबर (Subscribers)</h1>
          <p className="text-xs text-stone-500">कुल {subscribers.length} पाठकों ने ईमेल न्यूज़लेटर सब्सक्राइब किया है</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">ईमेल पता (Email)</th>
              <th className="p-3">स्थिति (Status)</th>
              <th className="p-3">सब्सक्रिप्शन तारीख</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {subscribers.map((sub) => (
              <tr key={sub.id} className="hover:bg-stone-50">
                <td className="p-3 font-bold text-stone-900">{sub.email}</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    {sub.status}
                  </span>
                </td>
                <td className="p-3 text-stone-400">{new Date(sub.subscribedAt).toLocaleDateString('hi-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
