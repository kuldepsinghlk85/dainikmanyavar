'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  Newspaper,
  ChevronRight,
  Clock,
  UserCheck,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  X,
  Radio,
  Eye,
} from 'lucide-react';

interface ReporterSubmissionAlert {
  id: string;
  headline: string;
  subtitle: string | null;
  featuredImage: string | null;
  status: string;
  revisionRequested: boolean;
  locationName: string | null;
  createdAt: string;
  reporterProfile: {
    id: string;
    reporterId: string;
    fullName: string;
    designation: string;
    district: string | null;
    photo: string | null;
  };
}

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'अभी-अभी';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} मिनट पहले`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} घंटे पहले`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} दिन पहले`;
}

export function ReporterAlertsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [submissions, setSubmissions] = useState<ReporterSubmissionAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reporter-alerts');
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingCount(data.pendingCount || 0);
        setSubmissions(data.latestSubmissions || []);
      }
    } catch (_) {
      // ignore network errors on poll
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell / Alert Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
          pendingCount > 0
            ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300 ring-2 ring-red-400/30'
            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
        }`}
        title="रिपोर्टर न्यूज़ अलर्ट व सूचनाएं"
      >
        <div className="relative">
          <Bell className={`w-4 h-4 ${pendingCount > 0 ? 'text-red-600 animate-bounce' : 'text-stone-500'}`} />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
            </span>
          )}
        </div>

        <span className="hidden sm:inline">
          {pendingCount > 0 ? '🚨 नई रिपोर्टर खबर' : 'रिपोर्टर अलर्ट'}
        </span>

        {pendingCount > 0 ? (
          <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
            {pendingCount}
          </span>
        ) : (
          <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-600 text-[10px] font-bold">
            0
          </span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between border-b border-stone-700">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-black tracking-wide">
                रिपोर्टर खबरें (अलर्ट व समीक्षा)
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={fetchAlerts}
                title="रिफ्रेश करें"
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-700/50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-700/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pending Summary Pill */}
          <div className="bg-orange-50 dark:bg-orange-950/40 px-3.5 py-2 border-b border-orange-100 dark:border-orange-900/50 flex items-center justify-between text-[11px]">
            <span className="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              समीक्षा हेतु लंबित खबरें:
            </span>
            <span className="font-mono font-black px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px]">
              {pendingCount}
            </span>
          </div>

          {/* Submissions List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  कोई नई खबर लंबित नहीं है
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  सभी रिपोर्टर खबरों की समीक्षा पूरी हो चुकी है।
                </p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors space-y-1.5"
                >
                  {/* Reporter byline & timestamp */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-[10px] overflow-hidden shrink-0">
                        {sub.reporterProfile.photo ? (
                          <img
                            src={sub.reporterProfile.photo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          sub.reporterProfile.fullName.slice(0, 1)
                        )}
                      </div>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {sub.reporterProfile.fullName}
                      </span>
                      <span className="text-[10px] font-mono text-orange-600 bg-orange-50 px-1 rounded">
                        {sub.reporterProfile.reporterId}
                      </span>
                      {sub.reporterProfile.district && (
                        <span className="text-[10px] text-stone-400">
                          ({sub.reporterProfile.district})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] flex items-center gap-0.5 text-stone-400 shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(sub.createdAt)}
                    </span>
                  </div>

                  {/* Headline */}
                  <p className="text-xs font-bold text-stone-900 dark:text-white line-clamp-2 leading-snug">
                    {sub.headline}
                  </p>

                  {/* Badges & Action Link */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {sub.revisionRequested ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          🔄 संशोधन अनुरोध
                        </span>
                      ) : sub.status === 'UNDER_REVIEW' ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          🔍 समीक्षा जारी
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          ⏳ नई खबर सबमिट
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/admin/news-by-reporters/${sub.id}/review`}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EA580C] hover:bg-orange-600 text-white text-[11px] font-bold shadow-xs transition-colors"
                    >
                      <span>समीक्षा करें व एक्शन लें</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: View All Reporter News */}
          <div className="p-2.5 bg-stone-50 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800">
            <Link
              href="/admin/news-by-reporters?status=PENDING"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Newspaper className="w-3.5 h-3.5 text-orange-400" />
              <span>📋 सभी रिपोर्टरों की भेजी गई न्यूज़ एक साथ देखें</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Prominent Alert Banner rendered at the top of admin pages
 * Displays when there are pending reporter submissions.
 */
export function ReporterAlertBanner() {
  const [pendingCount, setPendingCount] = useState(0);
  const [latestSub, setLatestSub] = useState<ReporterSubmissionAlert | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/admin/reporter-alerts');
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingCount(data.pendingCount || 0);
        if (data.latestSubmissions && data.latestSubmissions.length > 0) {
          setLatestSub(data.latestSubmissions[0]);
        } else {
          setLatestSub(null);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed || pendingCount === 0 || !latestSub) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs border-b border-orange-700/50">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span className="p-1.5 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-white animate-bounce" />
        </span>
        <div className="truncate flex-1">
          <span className="font-black bg-white text-orange-700 px-2 py-0.5 rounded-full text-[11px] mr-2 shadow-xs">
            अलर्ट: {pendingCount} नई रिपोर्टर खबर{pendingCount > 1 ? 'ें' : ''}
          </span>
          <span className="font-semibold text-white/95">
            नवीनतम: <strong>{latestSub.reporterProfile.fullName}</strong>
            {latestSub.reporterProfile.district ? ` (${latestSub.reporterProfile.district})` : ''} ने भेजी:{' '}
            <span className="italic text-amber-100 underline decoration-amber-300/50">
              "{latestSub.headline}"
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Direct Review Link */}
        <Link
          href={`/admin/news-by-reporters/${latestSub.id}/review`}
          className="inline-flex items-center gap-1 bg-white text-stone-900 hover:bg-stone-100 px-3 py-1 rounded-lg text-xs font-black shadow-xs transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-orange-600" />
          <span>विवरण देखें व एक्शन लें</span>
        </Link>

        {/* View All Reporter News */}
        <Link
          href="/admin/news-by-reporters?status=PENDING"
          className="hidden md:inline-flex items-center gap-1 bg-stone-900/70 hover:bg-stone-900 text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/30 transition-colors"
        >
          <Newspaper className="w-3.5 h-3.5 text-orange-300" />
          <span>सभी रिपोर्टरों की न्यूज़ ({pendingCount})</span>
        </Link>

        {/* Dismiss Banner Button */}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
          title="यह अलर्ट छुपाएं"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
