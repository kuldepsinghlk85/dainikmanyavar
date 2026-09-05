'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Eye,
  Share2,
  Heart,
  Volume2,
  Download,
  Bookmark,
  Smartphone,
  Monitor,
  Clock,
  ExternalLink,
  RefreshCw,
  Filter,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function UserActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 30, totalPages: 1 });
  const [activityType, setActivityType] = useState('');
  const [device, setDevice] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activityType) params.set('activityType', activityType);
      if (device) params.set('device', device);
      params.set('page', String(page));
      params.set('limit', '30');

      const res = await fetch(`/api/admin/portal-users/activity?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
        setPagination(data.pagination);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [activityType, device]);

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'VIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <Eye className="w-3 h-3" />
            <span>समाचार पढ़ा (VIEW)</span>
          </span>
        );
      case 'SHARE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
            <Share2 className="w-3 h-3" />
            <span>शेयर किया (SHARE)</span>
          </span>
        );
      case 'LIKE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            <Heart className="w-3 h-3" />
            <span>पसंद (LIKE)</span>
          </span>
        );
      case 'SAVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <Bookmark className="w-3 h-3" />
            <span>सेव किया (SAVED)</span>
          </span>
        );
      case 'AUDIO_PLAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            <Volume2 className="w-3 h-3" />
            <span>ऑडियो सुना (AUDIO)</span>
          </span>
        );
      case 'DOWNLOAD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
            <Download className="w-3 h-3" />
            <span>डाउनलोड (DOWNLOAD)</span>
          </span>
        );
      case 'READ_TIME':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
            <Clock className="w-3 h-3" />
            <span>रीड टाइम (READ_TIME)</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#EA580C]" />
            <span>यूज़र एक्टिविटी लॉग (User Activity Logs)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            पाठकों द्वारा समाचार पढ़ने, शेयर करने, लाइक करने, ऑडियो सुनने व सहेजने की रीयल-टाइम ट्रैकिंग
          </p>
        </div>

        <button
          onClick={() => fetchLogs(pagination.page)}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>रिफ्रेश करें</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
          <Filter className="w-4 h-4 text-[#EA580C]" />
          <span>गतिविधि प्रकार:</span>
        </div>

        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          className="px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-bold text-stone-800"
        >
          <option value="">सभी गतिविधियां (All Types)</option>
          <option value="VIEW">समाचार पढ़ा (VIEW)</option>
          <option value="SHARE">शेयर किया (SHARE)</option>
          <option value="LIKE">पसंद किया (LIKE)</option>
          <option value="SAVED">सहेजा गया (SAVED)</option>
          <option value="AUDIO_PLAY">ऑडियो सुना (AUDIO_PLAY)</option>
          <option value="DOWNLOAD">डाउनलोड (DOWNLOAD)</option>
          <option value="READ_TIME">पठन अवधि (READ_TIME)</option>
        </select>

        <select
          value={device}
          onChange={(e) => setDevice(e.target.value)}
          className="px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-bold text-stone-800"
        >
          <option value="">सभी डिवाइसेज (All Devices)</option>
          <option value="mobile">मोबाइल (Mobile)</option>
          <option value="web">वेबसाइट (Web / Desktop)</option>
        </select>

        <span className="text-xs text-stone-400 ml-auto font-bold">
          कुल रिकॉर्ड्स: {pagination.total}
        </span>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-stone-500">
            <div className="w-8 h-8 border-3 border-[#EA580C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold">लॉग्स लोड हो रहे हैं...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <Activity className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-bold">कोई एक्टिविटी लॉग नहीं मिला।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100/70 text-stone-700 uppercase font-black text-[10px]">
                  <th className="p-3.5">पाठक (User)</th>
                  <th className="p-3.5">गतिविधि (Activity)</th>
                  <th className="p-3.5">संबंधित समाचार (News Article)</th>
                  <th className="p-3.5">अवधि (Duration)</th>
                  <th className="p-3.5">डिवाइस</th>
                  <th className="p-3.5">समय (Timestamp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-orange-50/30 transition-colors">
                    {/* User */}
                    <td className="p-3.5">
                      {log.user ? (
                        <div>
                          <p className="font-bold text-stone-900">{log.user.fullName}</p>
                          <p className="text-[10px] text-stone-500 font-mono">+91 {log.user.mobileNumber}</p>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">अतिथि पाठक (Guest Reader)</span>
                      )}
                    </td>

                    {/* Activity Badge */}
                    <td className="p-3.5">
                      {getActivityBadge(log.activityType)}
                    </td>

                    {/* Article */}
                    <td className="p-3.5 max-w-xs">
                      {log.article ? (
                        <Link
                          href={`/news/${log.article.slug}`}
                          target="_blank"
                          className="font-bold text-stone-900 hover:text-[#EA580C] line-clamp-1 flex items-center gap-1 transition-colors"
                        >
                          <span>{log.article.title}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0 text-stone-400" />
                        </Link>
                      ) : (
                        <span className="text-stone-400 italic">पोर्टल ब्राउज़िंग</span>
                      )}
                    </td>

                    {/* Duration / Read Time */}
                    <td className="p-3.5 text-stone-600">
                      {log.readTime ? `${log.readTime} सेकंड` : '—'}
                    </td>

                    {/* Device */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-600">
                        {log.device === 'mobile' ? (
                          <>
                            <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                            <span>मोबाइल</span>
                          </>
                        ) : (
                          <>
                            <Monitor className="w-3.5 h-3.5 text-blue-600" />
                            <span>डेस्कटॉप</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="p-3.5 text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('hi-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchLogs(pagination.page - 1)}
              className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
            >
              ← पिछला पृष्ठ
            </button>
            <span className="font-bold text-stone-600">
              पृष्ठ {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchLogs(pagination.page + 1)}
              className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
            >
              अगला पृष्ठ →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
