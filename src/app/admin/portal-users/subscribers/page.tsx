'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Users,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Send,
  UserCheck,
  UserX,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/portal-users/stats');
      const data = await res.json();
      if (data.success && data.data?.users) {
        setStats({
          total: data.data.users.newsletterSubs + data.data.users.unsubscribedSubs,
          active: data.data.users.activeSubs,
          unsubscribed: data.data.users.unsubscribedSubs,
        });
      }

      // Fetch user rows
      const userRes = await fetch('/api/admin/portal-users?limit=100');
      const userData = await userRes.json();
      if (userData.success) {
        setSubscribers(userData.data || []);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filteredList = subscribers.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.mobileNumber.includes(search) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return u.newsletterSubscribed;
    if (statusFilter === 'unsubscribed') return !u.newsletterSubscribed;
    return true;
  });

  const handleToggleSubscription = async (user: any) => {
    try {
      const nextState = !user.newsletterSubscribed;
      await fetch('/api/admin/portal-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, newsletterSubscribed: nextState }),
      });
      fetchSubscribers();
    } catch (_) {}
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#EA580C]" />
            <span>न्यूज़लेटर सब्सक्राइबर्स (Newsletter Subscribers)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            वेबसाइट एवं ऐप पाठकों की सक्रिय व निष्क्रिय न्यूज़लेटर सदस्यता की सूची
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/portal-users/broadcast"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>न्यूज़लेटर संदेश भेजें</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Subscribers */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">कुल पाठकों की सूची</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{stats.total}</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">रजिस्टर्ड यूज़र्स</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-[#EA580C]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">सक्रिय सब्सक्राइबर्स</p>
            <h3 className="text-2xl font-black text-green-700 mt-1">{stats.active}</h3>
            <p className="text-[11px] text-green-600 mt-0.5">न्यूज़लेटर प्राप्त करने के इच्छुक</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Unsubscribed Users */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">अनसब्सक्राइब किए यूज़र्स</p>
            <h3 className="text-2xl font-black text-stone-500 mt-1">{stats.unsubscribed}</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">सदस्यता बंद</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम, ईमेल या मोबाइल से खोजें..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              सभी ({subscribers.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-white text-green-700 shadow-xs' : 'text-stone-600'
              }`}
            >
              सक्रिय (Active)
            </button>
            <button
              onClick={() => setStatusFilter('unsubscribed')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'unsubscribed' ? 'bg-white text-stone-700 shadow-xs' : 'text-stone-600'
              }`}
            >
              अनसब्सक्राइब
            </button>
          </div>

          <button
            onClick={fetchSubscribers}
            className="p-2 text-stone-500 hover:text-stone-800 rounded-xl border border-stone-200 hover:bg-stone-50"
            title="रिफ्रेश करें"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-stone-500">
            <div className="w-8 h-8 border-3 border-[#EA580C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold">सब्सक्राइबर्स लोड हो रहे हैं...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <Mail className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-bold">कोई सब्सक्राइबर नहीं मिला।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100/70 text-stone-700 uppercase font-black tracking-wider text-[10px]">
                  <th className="p-3.5">पाठक का नाम</th>
                  <th className="p-3.5">ईमेल (Email)</th>
                  <th className="p-3.5">मोबाइल नंबर</th>
                  <th className="p-3.5">पंजीकरण तिथि</th>
                  <th className="p-3.5">सब्सक्रिप्शन स्थिति</th>
                  <th className="p-3.5 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {filteredList.map((u) => (
                  <tr key={u.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-stone-900">
                      {u.fullName}
                    </td>
                    <td className="p-3.5 text-stone-700">
                      {u.email || <span className="text-stone-300 italic">ईमेल नहीं दिया गया</span>}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-stone-600">
                      +91 {u.mobileNumber}
                    </td>
                    <td className="p-3.5 text-stone-500 text-[11px]">
                      {new Date(u.registrationDate).toLocaleDateString('hi-IN')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          u.newsletterSubscribed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {u.newsletterSubscribed ? 'सक्रिय सब्सक्राइबर' : 'अनसब्सक्राइब्ड'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleSubscription(u)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          u.newsletterSubscribed
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {u.newsletterSubscribed ? 'अनसब्सक्राइब करें' : 'सक्रिय करें'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
