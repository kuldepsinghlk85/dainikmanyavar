import React from 'react';
import { db } from '@/lib/db';
import { MapPin } from 'lucide-react';

export default async function LocationsAdminPage() {
  const locations = await db.location.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">स्थान एवं जिले (Locations)</h1>
        <p className="text-xs text-stone-500">उत्तर प्रदेश एवं पूर्वांचल के जिलों और शहरों की सूची</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">स्थान नाम (Location)</th>
              <th className="p-3">प्रकार (Type)</th>
              <th className="p-3">Slug</th>
              <th className="p-3">संबद्ध समाचार (Articles)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {locations.map((loc) => (
              <tr key={loc.id} className="hover:bg-stone-50">
                <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{loc.name}</span>
                </td>
                <td className="p-3">
                  <span className="bg-orange-100 text-[#C2410C] px-2 py-0.5 rounded text-[10px] font-bold">
                    {loc.type}
                  </span>
                </td>
                <td className="p-3 font-mono text-stone-400">{loc.slug}</td>
                <td className="p-3 font-bold text-stone-800">{loc._count.articles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
