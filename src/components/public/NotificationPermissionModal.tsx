'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, ShieldCheck } from 'lucide-react';

const DISMISS_KEY = 'dm_push_dismissed_until';
const SUBSCRIBED_KEY = 'dm_push_subscribed_token';
const DISMISS_DAYS = 7;

export default function NotificationPermissionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'denied'>('idle');

  useEffect(() => {
    // Check if push notifications are supported by browser
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }

    // Already granted or blocked natively
    if (Notification.permission === 'granted') {
      // Auto register if token not stored yet
      const existingToken = localStorage.getItem(SUBSCRIBED_KEY);
      if (!existingToken) {
        registerPushSubscription();
      }
      return;
    }

    if (Notification.permission === 'denied') {
      return;
    }

    // Check if user recently dismissed the 2-step modal
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // Show respectful prompt after small delay (3 seconds) so user gets to look at content first
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    const expireTime = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, expireTime.toString());
  };

  const registerPushSubscription = async () => {
    try {
      setStatus('loading');

      // 1. Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;

      // 2. Request native permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        setTimeout(() => setIsOpen(false), 2000);
        return;
      }

      // 3. Generate or retrieve push token identifier
      let token = localStorage.getItem(SUBSCRIBED_KEY);
      if (!token) {
        token = 'web_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
        localStorage.setItem(SUBSCRIBED_KEY, token);
      }

      // 4. Send token to server
      const deviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';
      await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          platform: 'web',
          deviceType,
          language: 'hi',
        }),
      });

      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    } catch (err) {
      console.error('Push registration failed:', err);
      setStatus('idle');
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 overflow-hidden relative">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1 rounded-full transition-colors cursor-pointer"
          aria-label="बंद करें"
        >
          <X className="w-4 h-4" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-4 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-stone-900 text-sm">सूचनाएं चालू कर दी गई हैं!</h4>
            <p className="text-xs text-stone-600">दैनिक मान्यवर की ब्रेकिंग खबरें अब आपको सबसे पहले मिलेंगी।</p>
          </div>
        ) : status === 'denied' ? (
          <div className="text-center py-3 text-xs text-stone-500">
            आपने नोटिफिकेशन की अनुमति नहीं दी। आप इसे ब्राउज़र सेटिंग्स में बदल सकते हैं।
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5 shadow-inner">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 leading-tight">
                  दैनिक मान्यवर की ब्रेकिंग खबरें पाएं
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  देश, उत्तर प्रदेश और अपने जिले की सबसे तेज़ और सटीक खबरें सीधे अपनी स्क्रीन पर पाएं।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>बिना स्पैम, कभी भी प्राथमिकताएं बदल सकते हैं।</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={registerPushSubscription}
                disabled={status === 'loading'}
                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {status === 'loading' ? 'अनुमति ली जा रही है...' : '🔔 नोटिफिकेशन चालू करें'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2.5 text-xs text-stone-600 hover:text-stone-900 font-medium rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                अभी नहीं
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
