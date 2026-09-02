import React from 'react';
import { db } from '@/lib/db';
import { Users, UserCheck } from 'lucide-react';

export default async function AuthorsAdminPage() {
  const authors = await db.author.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">संवाददाता एवं रिपोर्टर (Reporters)</h1>
        <p className="text-xs text-stone-500">दैनिक मान्यवर के अधिकृत पत्रकारों और ब्यूरो चीफ की सूची</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {authors.map((author) => (
          <div key={author.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white font-bold flex items-center justify-center text-sm">
                {author.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">{author.name}</h3>
                <p className="text-xs text-stone-500">{author.designation || 'वरिष्ठ संवाददाता'}</p>
                <p className="text-[11px] text-stone-400">📍 {author.city || 'जौनपुर'}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-orange-100 text-[#C2410C] px-2.5 py-1 rounded-full text-xs font-bold block">
                {author._count.articles} समाचार
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
