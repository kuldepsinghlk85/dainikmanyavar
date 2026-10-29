'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Loader2, ArrowRight, Smartphone } from 'lucide-react';

export default function MobileReporterLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('कृपया ईमेल / रिपोर्टर आईडी और पासवर्ड दर्ज करें');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reporter/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'लॉगिन विफल रहा। कृपया सही विवरण जांचें।');
        setLoading(false);
        return;
      }

      router.push('/mobile-reporter');
    } catch (_) {
      setError('सर्वर से संपर्क करने में समस्या हुई। पुनः प्रयास करें।');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col justify-between p-4 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between py-3 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="दैनिक मान्यवर"
            width={140}
            height={36}
            priority
            unoptimized
            className="h-7 w-auto object-contain brightness-0 invert"
          />
        </Link>
        <span className="px-2.5 py-0.5 rounded-full bg-orange-600/30 text-orange-400 border border-orange-500/40 text-[10px] font-black uppercase">
          मोबाइल रिपोर्टर
        </span>
      </div>

      {/* Main Login Form */}
      <div className="my-auto py-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#EA580C] to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <Smartphone className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">संवाददाता लॉगिन</h2>
          <p className="text-xs text-stone-400 mt-1">
            दैनिक मान्यवर मोबाइल रिपोर्टर कॉर्नर में आपका स्वागत है
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              ईमेल आईडी या रिपोर्टर कोड
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="उदा. DM-REP-0101 या आपका ईमेल"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-800/80 border border-stone-700 text-white text-xs placeholder-stone-500 focus:outline-hidden focus:border-orange-500 transition-colors"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              गोपनीय पासवर्ड
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड दर्ज करें"
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-stone-800/80 border border-stone-700 text-white text-xs placeholder-stone-500 focus:outline-hidden focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 text-white text-xs font-black shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>लॉगिन करें</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/reporter/login"
            className="text-xs text-stone-400 hover:text-orange-400 transition-colors"
          >
            💻 डेस्कटॉप वर्जन लॉगिन पर जाएं
          </Link>
        </div>
      </div>

      {/* Mandatory Technology Partner Footer */}
      <footer className="border-t border-stone-800 py-3 text-center text-[10px] text-stone-500">
        <div>© {new Date().getFullYear()} दैनिक मान्यवर</div>
        <div className="mt-0.5">
          Technology Partner:{' '}
          <a
            href="https://easylauncher.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EA580C] hover:underline font-bold"
          >
            EasyLauncher.net
          </a>
        </div>
      </footer>
    </div>
  );
}
