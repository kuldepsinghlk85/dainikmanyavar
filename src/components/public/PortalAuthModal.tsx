'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, User, Phone, Mail, MapPin, Lock, KeyRound, CheckCircle2, AlertCircle, Sparkles, MessageCircle } from 'lucide-react';

interface PortalAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  initialTab?: 'login' | 'register';
}

export default function PortalAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'register',
}: PortalAuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Register state
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('उत्तर प्रदेश');
  const [regPassword, setRegPassword] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(true);
  const [whatsappPermission, setWhatsappPermission] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Login state
  const [loginMobile, setLoginMobile] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setErrorMsg('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('पंजीकरण के लिए नियम एवं शर्तें स्वीकार करना आवश्यक है।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          fullName: fullName.trim(),
          mobileNumber: cleanMobile,
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          password: regPassword.trim() || undefined,
          newsletterSubscribed,
          whatsappPermission,
          termsAccepted: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'पंजीकरण विफल रहा।');
      } else {
        setSuccessMsg(data.message || 'पंजीकरण सफल रहा!');
        if (onSuccess) onSuccess(data.user);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg('सर्वर से संपर्क नहीं हो पाया।');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const cleanMobile = loginMobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setErrorMsg('कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', mobileNumber: cleanMobile }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error);
      } else {
        setOtpSent(true);
        setSuccessMsg(data.message || 'OTP भेजा गया! (टेस्ट OTP: 1234)');
        setLoginOtp('1234'); // auto-fill simulated OTP for convenience
      }
    } catch (err) {
      setErrorMsg('OTP भेजने में विफल।');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanMobile = loginMobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setErrorMsg('कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          mobileNumber: cleanMobile,
          isOtpMode,
          password: isOtpMode ? undefined : loginPassword,
          otp: isOtpMode ? loginOtp : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'लॉगिन विफल रहा।');
      } else {
        setSuccessMsg(data.message || 'लॉगिन सफल!');
        if (onSuccess) onSuccess(data.user);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setErrorMsg('लॉगिन करने में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 z-10 animate-in zoom-in-95 duration-200">
        {/* Header with Dainik Manyavar saffron banner */}
        <div className="bg-gradient-to-r from-[#EA580C] via-[#F97316] to-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-28 h-8 bg-white/10 rounded px-1 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="दैनिक मान्यवर"
                width={120}
                height={32}
                className="h-6 w-auto object-contain brightness-0 invert"
              />
            </div>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              पाठक सेवा
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 text-xs font-black transition-all cursor-pointer ${
              tab === 'register'
                ? 'border-b-2 border-[#EA580C] text-[#EA580C] bg-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            ✨ नया खाता बनाएं (Register)
          </button>
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 text-xs font-black transition-all cursor-pointer ${
              tab === 'login'
                ? 'border-b-2 border-[#EA580C] text-[#EA580C] bg-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            🔑 लॉगिन करें (Login)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= REGISTER TAB ================= */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  पूरा नाम (Full Name) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="उदा. राहुल शर्मा"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  मोबाइल नंबर (Mobile Number) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2 text-xs font-bold text-stone-400">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">10 अंकों का सक्रिय नंबर दर्ज करें</p>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ईमेल पता (Email Address) <span className="text-stone-400 font-normal">(वैकल्पिक)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">शहर (City)</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="उदा. वाराणसी"
                      className="w-full pl-8 pr-2 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">राज्य (State)</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="उत्तर प्रदेश"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  पासवर्ड सेट करें (Password) <span className="text-stone-400 font-normal">(कम से कम 4 अक्षर)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              {/* Toggles: Newsletter & WhatsApp */}
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsletterSubscribed}
                    onChange={(e) => setNewsletterSubscribed(e.target.checked)}
                    className="rounded text-[#EA580C] focus:ring-[#EA580C] w-4 h-4"
                  />
                  <span className="font-semibold">☑ दैनिक न्यूज़लेटर की सदस्यता लें (Newsletter)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappPermission}
                    onChange={(e) => setWhatsappPermission(e.target.checked)}
                    className="rounded text-[#16A34A] focus:ring-[#16A34A] w-4 h-4"
                  />
                  <span className="font-semibold text-green-700 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    व्हाट्सएप पर ताज़ा समाचार अलर्ट प्राप्त करें
                  </span>
                </label>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2 border-t border-stone-100">
                <label className="flex items-start gap-2 text-[11px] text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded text-[#EA580C] focus:ring-[#EA580C] w-4 h-4 mt-0.5"
                  />
                  <span>
                    मैं दैनिक मान्यवर के{' '}
                    <span className="text-[#EA580C] font-bold underline">नियम एवं शर्तें</span>{' '}
                    और गोपनीयता नीति को स्वीकार करता/करती हूँ।
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-700 hover:to-orange-800 text-white font-black text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'कृपया प्रतीक्षा करें...' : 'अभी रजिस्टर करें (Register Now)'}
              </button>
            </form>
          )}

          {/* ================= LOGIN TAB ================= */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  मोबाइल नंबर (Mobile Number)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2 text-xs font-bold text-stone-400">+91</div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              {/* Mode Toggle: Password vs OTP */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-bold text-stone-600">लॉगिन का माध्यम:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOtpMode(false)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      !isOtpMode
                        ? 'bg-[#EA580C] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    पासवर्ड
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOtpMode(true)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      isOtpMode
                        ? 'bg-[#EA580C] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    मोबाइल OTP
                  </button>
                </div>
              </div>

              {!isOtpMode ? (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पासवर्ड (Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700">
                    OTP दर्ज करें (4-अंक)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="1234"
                      className="flex-1 px-3 py-2 text-xs text-center tracking-widest font-mono font-bold border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {otpSent ? 'पुनः भेजें' : 'OTP मंगाएं'}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400">परीक्षण हेतु डिफॉल्ट OTP: <span className="font-bold text-stone-700 font-mono">1234</span></p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-700 hover:to-orange-800 text-white font-black text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'प्रतीक्षा करें...' : 'लॉगिन करें (Login)'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs text-[#EA580C] hover:underline font-bold"
                >
                  खाता नहीं है? अभी नया खाता बनाएं →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
