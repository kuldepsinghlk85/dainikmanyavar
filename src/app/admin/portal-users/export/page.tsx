'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DownloadCloud,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  Users,
  Calendar,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ExportUsersPage() {
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [imported, setImported] = useState('');
  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  const fetchMatchingCount = async () => {
    setLoadingCount(true);
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (state) params.set('state', state);
      if (status) params.set('status', status);
      if (newsletter) params.set('newsletter', newsletter);
      if (imported) params.set('imported', imported);
      params.set('limit', '1');

      const res = await fetch(`/api/admin/portal-users?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.pagination) {
        setMatchingCount(data.pagination.total);
      }
    } catch (_) {
    } finally {
      setLoadingCount(false);
    }
  };

  useEffect(() => {
    fetchMatchingCount();
  }, [city, state, status, newsletter, imported]);

  const handleExportDownload = () => {
    const params = new URLSearchParams();
    params.set('format', format);
    if (city) params.set('city', city);
    if (state) params.set('state', state);
    if (status) params.set('status', status);
    if (newsletter) params.set('newsletter', newsletter);
    if (imported) params.set('imported', imported);

    window.open(`/api/admin/portal-users/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 text-[#EA580C]" />
            <span>यूज़र एक्सपोर्ट कंसोल (Export Users)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            पंजीकृत पाठकों एवं सब्सक्राइबर्स का डाटा एक्सेल (.xlsx) या .csv फॉर्मेट में डाउनलोड करें
          </p>
        </div>

        <Link
          href="/admin/portal-users"
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors"
        >
          ← सभी यूज़र्स पर वापस जाएं
        </Link>
      </div>

      {/* Export Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200 max-w-2xl mx-auto space-y-6">
        {/* Format Selector */}
        <div>
          <label className="block text-xs font-black text-stone-900 uppercase tracking-wider mb-2">
            1. एक्सपोर्ट फ़ाइल प्रारूप चुनें (Select File Format)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('xlsx')}
              className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                format === 'xlsx'
                  ? 'border-[#EA580C] bg-orange-50/50 text-[#EA580C]'
                  : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6 flex-shrink-0 text-green-600" />
              <div className="text-left">
                <p className="font-black text-xs">Microsoft Excel (.xlsx)</p>
                <p className="text-[10px] text-stone-400">अनुशंसित स्प्रेडशीट फॉर्मेट</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                format === 'csv'
                  ? 'border-[#EA580C] bg-orange-50/50 text-[#EA580C]'
                  : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
              }`}
            >
              <FileText className="w-6 h-6 flex-shrink-0 text-blue-600" />
              <div className="text-left">
                <p className="font-black text-xs">CSV Text File (.csv)</p>
                <p className="text-[10px] text-stone-400">कॉमा सेपरेटेड वैल्यूज</p>
              </div>
            </button>
          </div>
        </div>

        {/* Filter Criteria */}
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <label className="block text-xs font-black text-stone-900 uppercase tracking-wider mb-2">
            2. फ़िल्टर मापदंड (Filter Criteria)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* City */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">शहर (City)</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-medium"
              >
                <option value="">सभी शहर (All Cities)</option>
                <option value="वाराणसी">वाराणसी</option>
                <option value="जौनपुर">जौनपुर</option>
                <option value="लखनऊ">लखनऊ</option>
                <option value="प्रयागराज">प्रयागराज</option>
                <option value="आजमगढ़">आजमगढ़</option>
                <option value="गाजीपुर">गाजीपुर</option>
                <option value="दिल्ली">दिल्ली</option>
              </select>
            </div>

            {/* Newsletter Status */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">न्यूज़लेटर स्थिति</label>
              <select
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-medium"
              >
                <option value="">सभी यूज़र्स</option>
                <option value="true">केवल सक्रिय न्यूज़लेटर सब्सक्राइबर्स</option>
                <option value="false">केवल अनसब्सक्राइब</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">अकाउंट स्थिति (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-medium"
              >
                <option value="">सक्रिय एवं ब्लॉक्ड दोनों</option>
                <option value="ACTIVE">केवल सक्रिय (Active)</option>
                <option value="BLOCKED">केवल अवरुद्ध (Blocked)</option>
              </select>
            </div>

            {/* User Type */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">यूज़र का स्रोत (Origin)</label>
              <select
                value={imported}
                onChange={(e) => setImported(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-medium"
              >
                <option value="">सभी स्रोत</option>
                <option value="true">केवल एक्सेल से इम्पोर्ट किए गए</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matching Count Summary */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#EA580C]" />
            <span className="text-xs font-bold text-stone-700">चयनित फ़िल्टर के अनुसार कुल यूज़र्स:</span>
          </div>
          <span className="text-base font-black text-stone-900 font-mono">
            {loadingCount ? '...' : `${matchingCount ?? 0} यूज़र्स`}
          </span>
        </div>

        {/* Download Button */}
        <button
          type="button"
          onClick={handleExportDownload}
          disabled={matchingCount === 0 || loadingCount}
          className="w-full py-3.5 bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-700 hover:to-orange-800 text-white font-black text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <DownloadCloud className="w-4 h-4" />
          <span>{format.toUpperCase()} फ़ाइल डाउनलोड करें (Download Now)</span>
        </button>
      </div>
    </div>
  );
}
