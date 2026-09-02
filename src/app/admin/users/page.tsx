import React from 'react';
import { db } from '@/lib/db';
import { UserCheck, Shield } from 'lucide-react';

export default async function UsersAdminPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">एडमिन यूजर्स एवं रोल (RBAC)</h1>
        <p className="text-xs text-stone-500">कंट्रोल पैनल के उपयोगकर्ता और उनकी अनुमति (Super Admin, Editor, Reporter)</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3">नाम (Name)</th>
              <th className="p-3">ईमेल (Email)</th>
              <th className="p-3">रोल (Role)</th>
              <th className="p-3">स्थिति</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-stone-50">
                <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{u.name}</span>
                </td>
                <td className="p-3 font-mono">{u.email}</td>
                <td className="p-3">
                  <span className="bg-orange-100 text-[#C2410C] px-2 py-0.5 rounded text-[10px] font-bold">
                    {u.role}
                  </span>
                </td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    {u.active ? 'Active' : 'Inactive'}
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
