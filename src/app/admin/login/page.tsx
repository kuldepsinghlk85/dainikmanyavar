'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'लॉगिन असफल रहा। कृपया ईमेल और पासवर्ड की जांच करें।');
      }
    } catch (err) {
      setError('सर्वर से संपर्क करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="दैनिक मान्यवर"
            width={320}
            height={80}
            priority
            className="mx-auto h-auto w-auto max-h-16 object-contain mb-3"
          />
          <h1 className="text-xl font-extrabold text-stone-900">एडमिन लॉगिन कंट्रोल पैनल</h1>
          <p className="text-xs text-stone-500 mt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>सुरक्षित दैनिक मान्यवर CMS</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs mb-5 font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>ईमेल पता (Email)</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ईमेल पता दर्ज करें"
              className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>पासवर्ड (Password)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड दर्ज करें"
                className="w-full p-3 pr-10 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                title={showPassword ? 'पासवर्ड छिपाएं' : 'पासवर्ड दिखाएं'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'सत्यापित हो रहा है...' : 'सुरक्षित लॉगिन करें'}
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-stone-400 border-t border-stone-100 pt-4">
          दैनिक मान्यवर डिजिटल नेटवर्क • सुरक्षित प्रमाणीकरण
        </div>
      </div>
    </div>
  );
}
