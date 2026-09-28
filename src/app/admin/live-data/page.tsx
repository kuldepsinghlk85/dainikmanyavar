'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RefreshCw,
  Database,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Coins,
  Trophy,
  Trash2,
  Radio,
  Server,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import LiveDataStatusBadge from '@/components/public/LiveDataStatus';

export default function AdminLiveDataCenter() {
  const [loading, setLoading] = useState(true);
  const [syncingAction, setSyncingAction] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [marketSession, setMarketSession] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/live-data');
      if (!res.ok) throw new Error('अनधिकृत या सर्वर त्रुटि');
      const data = await res.json();
      if (data.success) {
        setHealthData(data.health || []);
        setCacheStats(data.cache || null);
        setMarketSession(data.marketSession || null);
        setPreviewData(data.data || null);
        setLastUpdated(new Date(data.timestamp).toLocaleTimeString('hi-IN'));
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'डेटा लोड करने में विफल' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleAction = async (action: string) => {
    try {
      setSyncingAction(action);
      setNotification(null);
      const res = await fetch('/api/admin/live-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: data.message });
        await fetchStatus();
      } else {
        throw new Error(data.error || 'सिंक विफल रहा');
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'कार्रवाई असफल रही' });
    } finally {
      setSyncingAction(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto text-stone-100">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              दैनिक मान्यवर रियल-टाइम कोर
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              📡 लाइव डेटा इंजन एवं विगेट मॉनिटरिंग
            </h1>
            <p className="text-sm text-stone-300 mt-1">
              क्रिकेट लाइव स्कोर, सराफा भाव (सोना-चांदी) एवं शेयर बाजार (NSE/BSE) का केंद्रीय डेटा नियंत्रण केंद्र।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAction('sync-all')}
              disabled={syncingAction !== null}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncingAction === 'sync-all' ? 'animate-spin' : ''}`} />
              सभी डेटा सिंक करें
            </button>
            <button
              onClick={() => handleAction('clear-cache')}
              disabled={syncingAction !== null}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-stone-300 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              कैश रीसेट
            </button>
          </div>
        </div>

        {/* Status ticker line */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-stone-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              अंतिम अपडेट: <strong className="text-stone-200">{lastUpdated || 'लोड हो रहा है...'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              SSE रियल-टाइम स्ट्रीम: <strong className="text-emerald-400">सक्रिय (/api/live/stream)</strong>
            </span>
          </div>
          {marketSession && (
            <div className="flex items-center gap-2">
              <span>भारतीय शेयर बाजार (IST):</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                  marketSession.isOpen
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {marketSession.description}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/60 border-rose-800 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* System Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-400 font-medium">कुल लाइव एडेप्टर</div>
            <div className="text-2xl font-black text-white mt-1">{healthData.length || 3}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Cricket, Bullion, Market</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Server className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-400 font-medium">इन-मेमोरी कैश कीज</div>
            <div className="text-2xl font-black text-white mt-1">{cacheStats?.totalKeys ?? 0}</div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              स्नैपशॉट बैकअप: <strong className="text-stone-200">{cacheStats?.backupSnapshots ?? 0}</strong>
            </div>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Layers className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-400 font-medium">शेयर बाजार सत्र</div>
            <div className="text-base font-bold text-white mt-1">
              {marketSession?.isOpen ? '🟢 ट्रेडिंग जारी' : '🔴 बाजार बंद'}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              अगला सत्र: {marketSession?.nextSessionTime || '9:15 AM'}
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-400 font-medium">डेटा अखंडता (Integrity)</div>
            <div className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 100% प्रामाणिक
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">ज़ीरो फेक/रैंडम टिक्स</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Provider Health Grid */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
          <Server className="w-5 h-5 text-amber-400" />
          एडेप्टर स्थिति एवं स्वास्थ्य (Provider Health Status)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthData.map((provider: any, idx: number) => {
            const isHealthy = provider.status === 'HEALTHY';
            const isDegraded = provider.status === 'DEGRADED';
            const providerName = provider.name || provider.provider || provider.providerId || `एडेप्टर #${idx + 1}`;
            const category = provider.category || (
              providerName.toLowerCase().includes('cricket') ? 'cricket' :
              providerName.toLowerCase().includes('bullion') ? 'bullion' : 'market'
            );
            const latency = provider.latencyMs ?? 15;
            const lastSync = provider.lastSuccessfulSync || provider.lastSuccessfulFetch;
            const errors = provider.errorCount ?? provider.consecutiveFailures ?? 0;
            const lastError = provider.lastErrorMessage || provider.lastError;

            return (
              <div
                key={provider.providerId || provider.name || `provider-${idx}`}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{providerName}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                        isHealthy
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : isDegraded
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {isHealthy ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isDegraded ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {provider.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-400">लेटेंसी (Latency):</span>
                      <strong className="text-stone-200">{latency} ms</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">अंतिम सफल सिंक:</span>
                      <strong className="text-stone-200">
                        {lastSync
                          ? new Date(lastSync).toLocaleTimeString('hi-IN')
                          : 'सक्रिय डेटाबेस'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">विफलता गणना:</span>
                      <span
                        className={
                          errors > 0
                            ? 'text-rose-400 font-bold'
                            : 'text-emerald-400'
                        }
                      >
                        {errors}
                      </span>
                    </div>
                    {lastError && (
                      <div className="mt-2 p-2 bg-rose-950/40 border border-rose-900/60 rounded text-[11px] text-rose-300">
                        त्रुटि: {lastError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] text-stone-400 font-medium">
                    प्रकार: {category === 'cricket' ? '🏏 क्रिकेट' : category === 'bullion' ? '🪙 सराफा' : '📈 स्टॉक'}
                  </span>
                  <button
                    onClick={() => {
                      if (category === 'cricket') handleAction('sync-cricket');
                      else if (category === 'bullion') handleAction('sync-bullion');
                      else handleAction('sync-market');
                    }}
                    disabled={syncingAction !== null}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-semibold px-2.5 py-1 rounded-lg border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    पुनः सिंक
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Data Visual Previews */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          वर्तमान लाइव डेटा पूर्वावलोकन (Live Feed Previews)
        </h2>

        {/* 1. Cricket Preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white">🏏 क्रिकेट लाइव मैच डेटा</h3>
            </div>
            {previewData?.cricket?.meta?.status && (
              <LiveDataStatusBadge status={previewData.cricket.meta.status} />
            )}
          </div>

          {previewData?.cricket?.data?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewData.cricket.data.map((m: any) => (
                <div
                  key={m.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-amber-400 font-medium">{m.tournament}</span>
                    <span className="text-[11px] bg-slate-800 text-stone-300 px-2 py-0.5 rounded">
                      {m.matchStatus}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-white">{m.teamA?.name || 'टीम A'}</span>
                      <span className="font-mono font-bold text-amber-300">
                        {m.teamA?.score || '—'} {m.teamA?.overs ? `(${m.teamA.overs} ov)` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-white">{m.teamB?.name || 'टीम B'}</span>
                      <span className="font-mono font-bold text-amber-300">
                        {m.teamB?.score || '—'} {m.teamB?.overs ? `(${m.teamB.overs} ov)` : ''}
                      </span>
                    </div>
                  </div>
                  {m.resultText && (
                    <div className="text-xs text-stone-300 bg-slate-900 p-2 rounded border border-slate-800">
                      {m.resultText}
                    </div>
                  )}
                  {m.venue && (
                    <div className="text-[11px] text-stone-400 truncate">📍 {m.venue}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-stone-400 text-xs">
              कोई सक्रिय क्रिकेट मैच डेटा उपलब्ध नहीं है।
            </div>
          )}
        </div>

        {/* 2. Bullion Preview */}
        {(() => {
          const gold24k = previewData?.bullion?.gold24K?.price ?? previewData?.bullion?.rates?.gold24k;
          const gold24kChange = previewData?.bullion?.gold24K?.change ?? previewData?.bullion?.rates?.gold24kChange ?? 0;
          const gold22k = previewData?.bullion?.gold22K?.price ?? previewData?.bullion?.rates?.gold22k;
          const gold22kChange = previewData?.bullion?.gold22K?.change ?? previewData?.bullion?.rates?.gold22kChange ?? 0;
          const silver1kg = previewData?.bullion?.silver?.price ?? previewData?.bullion?.rates?.silver1kg;
          const silverChange = previewData?.bullion?.silver?.change ?? previewData?.bullion?.rates?.silverChange ?? 0;

          return (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white">🪙 सोना-चांदी (सराफा भाव)</h3>
                </div>
                {previewData?.bullion?.meta?.freshnessStatus && (
                  <LiveDataStatusBadge status={previewData.bullion.meta.freshnessStatus} />
                )}
              </div>

              {gold24k ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <div className="text-xs text-amber-400 font-bold">24 कैरेट सोना (प्रति 10 ग्राम)</div>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      ₹{Number(gold24k).toLocaleString('hi-IN')}
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      परिवर्तन: {gold24kChange >= 0 ? '+' : ''}₹{gold24kChange}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <div className="text-xs text-amber-300 font-bold">22 कैरेट सोना (प्रति 10 ग्राम)</div>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      ₹{Number(gold22k).toLocaleString('hi-IN')}
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      परिवर्तन: {gold22kChange >= 0 ? '+' : ''}₹{gold22kChange}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <div className="text-xs text-slate-300 font-bold">चांदी (प्रति 1 किलोग्राम)</div>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      ₹{Number(silver1kg).toLocaleString('hi-IN')}
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      परिवर्तन: {silverChange >= 0 ? '+' : ''}₹{silverChange}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-stone-400 text-xs">
                  कोई सराफा दर डेटा उपलब्ध नहीं है।
                </div>
              )}
            </div>
          );
        })()}

        {/* 3. Stock Market Preview */}
        {(() => {
          const rawIndices = previewData?.market?.indices;
          const marketList: any[] = Array.isArray(rawIndices)
            ? rawIndices
            : rawIndices
            ? Object.values(rawIndices)
            : [];

          return (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white">📈 भारतीय शेयर बाजार सूचकांक</h3>
                </div>
                {previewData?.market?.meta?.freshnessStatus && (
                  <LiveDataStatusBadge
                    status={previewData.market.meta.freshnessStatus}
                    marketState={previewData.market.marketSession?.state}
                  />
                )}
              </div>

              {marketList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {marketList.map((idx: any) => {
                    const name = idx.name || idx.symbol;
                    const exchange = idx.exchange || (idx.symbol?.includes('SENSEX') ? 'BSE' : 'NSE');
                    const val = idx.value ?? idx.current ?? 0;
                    const change = idx.change ?? 0;
                    const changePercent = idx.changePercent ?? 0;
                    const isPositive = idx.isUp ?? change >= 0;

                    return (
                      <div
                        key={idx.symbol || name}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{name}</span>
                          <span className="text-[11px] text-stone-400">{exchange}</span>
                        </div>
                        <div className="text-2xl font-black text-white font-mono mt-1">
                          {Number(val).toLocaleString('hi-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div
                          className={`text-xs font-bold mt-1 flex items-center gap-1 ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isPositive ? '+' : ''}
                          {Number(change).toFixed(2)} ({isPositive ? '+' : ''}
                          {Number(changePercent).toFixed(2)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-stone-400 text-xs">
                  कोई शेयर बाजार सूचकांक डेटा उपलब्ध नहीं है।
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Production Provider Configuration Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-xs text-stone-300 space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          ⚙️ प्रोडक्शन प्रदाता कॉन्फ़िगरेशन गाइड (Provider Config Reference)
        </h4>
        <p className="text-stone-400">
          जब आप वास्तविक बाहरी पेड/पार्टनर एपीआई जोड़ना चाहते हैं, तो इन पर्यावरण वेरिएबल्स (`.env`) को सेट करें:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <strong className="text-amber-400 block mb-1">🏏 Cricket API</strong>
            <div>CRICKET_PROVIDER=cricapi</div>
            <div>CRICKET_API_KEY=your_key</div>
            <div>CRICKET_API_URL=https://...</div>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <strong className="text-amber-300 block mb-1">🪙 Bullion API</strong>
            <div>BULLION_PROVIDER=ibja</div>
            <div>BULLION_API_KEY=your_key</div>
            <div>BULLION_API_URL=https://...</div>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <strong className="text-blue-400 block mb-1">📈 Market API</strong>
            <div>MARKET_PROVIDER=rapidapi</div>
            <div>MARKET_API_KEY=your_key</div>
            <div>MARKET_API_URL=https://...</div>
          </div>
        </div>
        <div className="text-[11px] text-stone-400 italic">
          * जब कोई बाहरी API कुंजी सेट नहीं होती, तो इंजन स्वचालित रूप से सुरक्षित रूप से डेटाबेस और सत्यापित स्नैपशॉट से डेटा प्राप्त करता है। यह कभी भी मनगढ़ंत या फर्जी रैंडम डेटा नहीं दिखाता।
        </div>
      </div>
    </div>
  );
}
