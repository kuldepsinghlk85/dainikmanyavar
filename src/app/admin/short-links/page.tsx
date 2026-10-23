import React from 'react';
import { db } from '@/lib/db';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';
import { formatCount, getPublicSiteUrl } from '@/lib/utils';
import { OFFICIAL_SOCIAL_LINKS, OFFICIAL_HANDLES } from '@/lib/social';

export const dynamic = 'force-dynamic';

export default async function ShortLinksAdminPage() {
  const shortLinks = await db.shortLink.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { article: true },
  });

  const siteUrl = getPublicSiteUrl();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">शॉर्ट लिंक्स (Short URLs Manager)</h1>
        <p className="text-xs text-stone-500">WhatsApp व सोशल मीडिया शेयरिंग हेतु जनरेट शॉर्ट कोड्स (`/s/[code]`)</p>
      </div>

      {/* Official Social Channels Strip */}
      <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-stone-800">दैनिक मान्यवर आधिकारिक सोशल हैंडल्स:</span>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <a
            href={OFFICIAL_SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF0000] text-white px-2 py-0.5 rounded flex items-center gap-1 hover:opacity-90 shadow-2xs"
          >
            ▶️ {OFFICIAL_HANDLES.youtube}
          </a>
          <a
            href={OFFICIAL_SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-pink-600 to-amber-600 text-white px-2 py-0.5 rounded flex items-center gap-1 hover:opacity-90 shadow-2xs"
          >
            📸 {OFFICIAL_HANDLES.instagram}
          </a>
          <a
            href={OFFICIAL_SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1877F2] text-white px-2 py-0.5 rounded flex items-center gap-1 hover:opacity-90 shadow-2xs"
          >
            👍 Facebook Page
          </a>
          <a
            href={OFFICIAL_SOCIAL_LINKS.website}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#EA580C] text-white px-2 py-0.5 rounded flex items-center gap-1 hover:opacity-90 shadow-2xs"
          >
            🌐 dainikmanyavar.com
          </a>
        </div>
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
                  <a
                    href={`${siteUrl}/s/${link.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {`${siteUrl}/s/${link.shortCode}`}
                    <ExternalLink className="w-3 h-3 inline opacity-70" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
