'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function ReporterLoginPage() {
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

      router.push('/reporter');
    } catch (err: any) {
      setError('सर्वर से संपर्क करने में समस्या हुई। पुनः प्रयास करें।');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-black text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-stone-800 bg-stone-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EA580C] to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
              द
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                दैनिक मान्यवर
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  रिपोर्टर कॉर्नर
                </span>
              </h1>
              <p className="text-xs text-stone-400">संवाददाता लॉगिन पोर्टल</p>
            </div>
          </div>
          <a
            href="/"
            className="text-xs text-stone-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
          >
            मुख्य वेबसाइट देखें <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Orange Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-stone-800/80 border border-stone-700/60 text-orange-400 mb-3 shadow-inner">
                <Newspaper className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">रिपोर्टर लॉगिन</h2>
              <p className="text-xs text-stone-400 mt-1">
                अपनी रिपोर्टर आईडी, ईमेल या मोबाइल नंबर और पासवर्ड से लॉगिन करें
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  रिपोर्टर आईडी / ईमेल / मोबाइल नंबर
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="DM-REP-101 या आपका ईमेल"
                    className="w-full bg-stone-950/60 border border-stone-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  पासवर्ड
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-950/60 border border-stone-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    लॉगिन हो रहा है...
                  </>
                ) : (
                  <>
                    सुरक्षित लॉगिन करें <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-800 text-center">
              <p className="text-[11px] text-stone-400">
                नया रिपोर्टर खाता बनवाने या पासवर्ड रीसेट के लिए मुख्य संपादक या एडमिन से संपर्क करें।
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 py-4 px-6 text-center text-xs text-stone-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} दैनिक मान्यवर (Dainik Manyavar). सर्वाधिकार सुरक्षित।</span>
          <span>
            Technology Partner:{' '}
            <a
              href="https://easylauncher.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline font-medium"
            >
              EasyLauncher.net
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
