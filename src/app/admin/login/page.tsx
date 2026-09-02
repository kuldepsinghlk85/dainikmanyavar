'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'लॉगिन असफल रहा। ईमेल और पासवर्ड जांचें।');
      }
    } catch (err) {
      setError('सर्वर त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="दैनिक मान्यवर"
            width={320}
            height={80}
            className="mx-auto h-auto w-auto max-h-16 object-contain mb-3"
          />
          <h1 className="text-xl font-extrabold text-stone-900">एडमिन लॉगिन कंट्रोल पैनल</h1>
          <p className="text-xs text-stone-500 mt-1">सुरक्षित दैनिक मान्यवर CMS</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs mb-4 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">ईमेल पता (Email)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dainikmanyavar.in"
              className="w-full p-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">पासवर्ड (Password)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
          >
            {loading ? 'सत्यापित हो रहा है...' : 'लॉगिन करें'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-400 border-t border-stone-100 pt-4">
          डिफ़ॉल्ट क्रेडेंशियल: admin@dainikmanyavar.in / Admin@123
        </div>
      </div>
    </div>
  );
}
