import React from 'react';
import { db } from '@/lib/db';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';
import { formatCount } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ShortLinksAdminPage() {
  const shortLinks = await db.shortLink.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { article: true },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">शॉर्ट लिंक्स (Short URLs Manager)</h1>
        <p className="text-xs text-stone-500">WhatsApp व सोशल मीडिया शेयरिंग हेतु जनरेट शॉर्ट कोड्स (`/s/[code]`)</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">शॉर्ट कोड (Code)</th>
              <th className="p-3">संबद्ध समाचार (Article)</th>
              <th className="p-3">क्लिक काउंट (Clicks)</th>
              <th className="p-3">शॉर्ट URL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {shortLinks.map((link) => (
              <tr key={link.id} className="hover:bg-stone-50">
                <td className="p-3 font-mono font-bold text-[#EA580C]">{link.shortCode}</td>
                <td className="p-3 font-semibold text-stone-900 max-w-xs truncate">{link.article.title}</td>
                <td className="p-3 font-mono font-bold">{formatCount(link.clickCount)}</td>
                <td className="p-3 text-[#F97316] font-mono text-[11px]">
                  http://localhost:3015/s/{link.shortCode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
