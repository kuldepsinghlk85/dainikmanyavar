'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock,
  ExternalLink,
  Users,
  CheckCheck,
  RefreshCw,
  Sparkles,
  Smartphone,
  Share2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function WhatsAppBroadcastPage() {
  const [stats, setStats] = useState({ totalSent: 0, delivered: 0, opened: 0, failed: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Form
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [customHeadline, setCustomHeadline] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'newsletter'>('newsletter');
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBroadcastData = async () => {
    setLoading(true);
    try {
      // 1. Fetch broadcast stats & logs
      const res = await fetch('/api/admin/portal-users/broadcast');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setLogs(data.logs || []);
      }

      // 2. Fetch latest published articles for selection
      const artRes = await fetch('/api/articles?limit=15');
      const artData = await artRes.json();
      if (artData.articles) {
        setArticles(artData.articles);
        if (artData.articles.length > 0 && !selectedArticleId) {
          setSelectedArticleId(artData.articles[0].id);
          setCustomHeadline(artData.articles[0].title);
        }
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcastData();
  }, []);

  const handleArticleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const artId = e.target.value;
    setSelectedArticleId(artId);
    const chosen = articles.find((a) => a.id === artId);
    if (chosen) {
      setCustomHeadline(chosen.title);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHeadline.trim()) {
      setNotification({ type: 'error', text: 'समाचार हेडलाइन दर्ज करें।' });
      return;
    }

    setSending(true);
    setNotification(null);

    try {
      const res = await fetch('/api/admin/portal-users/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: targetAudience,
          articleId: selectedArticleId || undefined,
          customHeadline: customHeadline.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setNotification({ type: 'error', text: data.error || 'ब्रॉडकास्ट भेजने में विफल।' });
      } else {
        setNotification({
          type: 'success',
          text: data.message || 'व्हाट्सएप अलर्ट सफलतापूर्वक भेज दिया गया!',
        });
        fetchBroadcastData();
      }
    } catch (_) {
      setNotification({ type: 'error', text: 'सर्वर त्रुटि।' });
    } finally {
      setSending(false);
    }
  };

  const openRate = stats.totalSent > 0 ? ((stats.opened / stats.totalSent) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
            <span>व्हाट्सएप न्यूज़ अलर्ट सिस्टम (WhatsApp News Alert)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            ताज़ा खबरों के प्रकाशन पर पाठकों को स्वचालित व्हाट्सएप अलर्ट एवं डिलीवरी ट्रैकिंग
          </p>
        </div>

        <button
          onClick={fetchBroadcastData}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>ताज़ा करें</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* KPI Delivery Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sent */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200">
          <p className="text-xs font-bold text-stone-500 uppercase">कुल भेजे गए अलर्ट</p>
          <h3 className="text-2xl font-black text-stone-900 font-mono mt-1">{stats.totalSent}</h3>
          <p className="text-[10px] text-stone-400 mt-0.5">Total Sent</p>
        </div>

        {/* Delivered */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200">
          <p className="text-xs font-bold text-blue-600 uppercase">सफलतापूर्वक डिलीवर</p>
          <h3 className="text-2xl font-black text-blue-700 font-mono mt-1">{stats.delivered}</h3>
          <p className="text-[10px] text-blue-500 mt-0.5">Delivered to WhatsApp</p>
        </div>

        {/* Opened */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200">
          <p className="text-xs font-bold text-green-600 uppercase">क्लिक व पढ़ा गया (Opened)</p>
          <h3 className="text-2xl font-black text-green-700 font-mono mt-1">{stats.opened}</h3>
          <p className="text-[10px] text-green-600 font-bold mt-0.5">ओपन रेट: {openRate}%</p>
        </div>

        {/* Failed */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200">
          <p className="text-xs font-bold text-stone-400 uppercase">विफल (Failed)</p>
          <h3 className="text-2xl font-black text-stone-500 font-mono mt-1">{stats.failed}</h3>
          <p className="text-[10px] text-stone-400 mt-0.5">Undelivered / Bounced</p>
        </div>
      </div>

      {/* Broadcast Composer & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-xs border border-stone-200 space-y-4">
          <h3 className="text-sm font-black text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <Send className="w-4 h-4 text-[#EA580C]" />
            <span>नया व्हाट्सएप न्यूज़ अलर्ट जारी करें</span>
          </h3>

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            {/* Pick Article */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                प्रकाशित समाचार चुनें (Select Article)
              </label>
              <select
                value={selectedArticleId}
                onChange={handleArticleSelect}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-medium"
              >
                <option value="">-- कस्टम संदेश लिखें (समाचार चुनें बिना) --</option>
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Headline */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                संदेश हेडलाइन (News Headline) *
              </label>
              <textarea
                rows={2}
                required
                value={customHeadline}
                onChange={(e) => setCustomHeadline(e.target.value)}
                placeholder="दैनिक मान्यवर: ब्रेकिंग न्यूज़ हेडलाइन दर्ज करें..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] font-semibold text-stone-900"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block font-bold text-stone-700 mb-1.5">
                भेजने का लक्ष्य (Send To Target):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                    targetAudience === 'newsletter'
                      ? 'border-[#EA580C] bg-orange-50/50 text-[#EA580C]'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === 'newsletter'}
                    onChange={() => setTargetAudience('newsletter')}
                    className="text-[#EA580C]"
                  />
                  <div>
                    <p className="font-bold">न्यूज़लेटर सब्सक्राइबर्स</p>
                    <p className="text-[10px] text-stone-500">केवल सहमति दिए पाठक</p>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                    targetAudience === 'all'
                      ? 'border-[#EA580C] bg-orange-50/50 text-[#EA580C]'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === 'all'}
                    onChange={() => setTargetAudience('all')}
                    className="text-[#EA580C]"
                  />
                  <div>
                    <p className="font-bold">समस्त यूज़र्स (All Users)</p>
                    <p className="text-[10px] text-stone-500">सभी पंजीकृत पाठक</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-stone-400 font-bold">
                शॉर्ट URL स्वतः जनरेट होगा (/n/xxxxxx)
              </span>

              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs rounded-xl shadow-md shadow-green-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'भेजा जा रहा है...' : 'Send Now (अभी भेजें)'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* WhatsApp Mobile Preview Mockup */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-xs border border-stone-200 flex flex-col items-center">
          <p className="text-xs font-black text-stone-600 uppercase tracking-wider mb-3">
            व्हाट्सएप संदेश पूर्वावलोकन (Preview)
          </p>

          <div className="w-full max-w-[290px] bg-[#075E54] rounded-3xl p-3 text-white shadow-xl">
            {/* Phone header */}
            <div className="flex items-center gap-2 pb-2 border-b border-white/20 mb-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1">
                <Image src="/logo.png" alt="दैनिक मान्यवर" width={40} height={20} className="object-contain" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs truncate">दैनिक मान्यवर समाचार</p>
                <p className="text-[9px] text-green-200">आधिकारिक न्यूज़ अलर्ट</p>
              </div>
            </div>

            {/* Chat bubble */}
            <div className="bg-[#E7FFDB] text-stone-900 rounded-2xl rounded-tl-xs p-3 shadow-md text-xs space-y-2">
              <p className="font-black text-[#EA580C] text-[11px] border-b border-stone-200 pb-1">
                दैनिक मान्यवर
              </p>
              <p className="text-stone-600 text-[10px] font-bold">
                नई खबर:
              </p>
              <p className="font-bold text-stone-900 leading-snug">
                {customHeadline || 'यहाँ मुख्य समाचार की हेडलाइन दिखाई देगी...'}
              </p>
              <div className="pt-1 text-[11px]">
                <p className="text-stone-600 text-[10px]">पढ़ने के लिए क्लिक करें:</p>
                <span className="text-blue-700 font-bold underline font-mono text-[10px] block mt-0.5">
                  dainikmanyavar.com/n/abc123
                </span>
              </div>
              <div className="flex justify-end items-center gap-1 text-[9px] text-stone-400 pt-0.5">
                <span>अभी</span>
                <CheckCheck className="w-3 h-3 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Logs Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#EA580C]" />
            <span>हाल ही में भेजे गए अलर्ट्स का इतिहास (Notification Logs)</span>
          </h3>
          <span className="text-xs text-stone-500 font-bold">अंतिम {logs.length} संदेश</span>
        </div>

        {loading ? (
          <p className="text-xs text-stone-500 py-8 text-center">लोड हो रहा है...</p>
        ) : logs.length === 0 ? (
          <p className="text-xs text-stone-400 py-8 text-center">अभी तक कोई अलर्ट लॉग उपलब्ध नहीं है।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100/70 text-stone-700 uppercase font-black text-[10px]">
                  <th className="p-3.5">प्राप्तकर्ता (User)</th>
                  <th className="p-3.5">व्हाट्सएप नंबर</th>
                  <th className="p-3.5">संदेश पूर्वावलोकन</th>
                  <th className="p-3.5">शॉर्ट URL</th>
                  <th className="p-3.5">डिलीवरी स्थिति</th>
                  <th className="p-3.5">ओपन स्टेटस</th>
                  <th className="p-3.5">भेजने का समय</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="p-3.5 font-bold text-stone-900">
                      {log.user?.fullName || 'पाठक'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-stone-700">
                      +91 {log.whatsappNumber}
                    </td>
                    <td className="p-3.5 max-w-xs text-stone-800 line-clamp-1">
                      {log.messageText?.split('\n')[2] || log.messageText}
                    </td>
                    <td className="p-3.5 font-mono text-[10px] text-blue-600 font-bold">
                      {log.shortUrl ? (
                        <Link href={log.shortUrl} target="_blank" className="hover:underline flex items-center gap-1">
                          <span>{log.shortUrl.replace(/^https?:\/\/[^\/]+/, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        डिलीवर (SENT)
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.openedStatus === 'OPENED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {log.openedStatus === 'OPENED' ? 'पढ़ा गया (OPENED)' : 'अपठित'}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-500 text-[11px] whitespace-nowrap">
                      {new Date(log.sentTime).toLocaleString('hi-IN')}
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
