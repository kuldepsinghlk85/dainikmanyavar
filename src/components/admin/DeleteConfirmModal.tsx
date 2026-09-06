'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, Eye, EyeOff, X, ShieldAlert, Archive, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void> | void;
  title?: string;
  question?: string;
  itemCount?: number;
  isPermanent?: boolean;
  loading?: boolean;
  errorMessage?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'सुरक्षा सत्यापन एवं पुष्टि (Security Confirmation)',
  question,
  itemCount,
  isPermanent = false,
  loading = false,
  errorMessage = '',
}: DeleteConfirmModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setLocalError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLocalError('कृपया सुरक्षा पासवर्ड दर्ज करें।');
      return;
    }
    setLocalError('');
    onConfirm(password.trim());
  };

  const defaultQuestion =
    itemCount !== undefined && itemCount > 1
      ? `क्या आप वास्तव में इन ${itemCount} समाचारों को हटाना चाहते हैं?`
      : 'क्या आप वास्तव में इस समाचार को हटाना चाहते हैं?';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white dark:bg-[#181818] rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 dark:border-stone-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isPermanent
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isPermanent
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-amber-600 text-white shadow-sm'
              }`}
            >
              {isPermanent ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 dark:text-white">{title}</h3>
              <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                पासवर्ड सत्यापन अनिवार्य है
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Question / Notice */}
          <div className="space-y-2">
            <p className="text-sm font-extrabold text-stone-900 dark:text-white leading-snug">
              {question || defaultQuestion}
            </p>

            {/* Explanatory badge */}
            {!isPermanent ? (
              <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 flex items-start gap-2.5">
                <Archive className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
                  <span className="font-black">डेटा सुरक्षित रहेगा:</span> यह समाचार नष्ट नहीं होगा, बल्कि{' '}
                  <strong>'आर्काइव रिकॉर्ड (Archive Library)'</strong> में सुरक्षित इकट्ठा हो जाएगा। आप इसे कभी भी वहाँ से{' '}
                  <strong>1-क्लिक में पुनः रीस्टोर</strong> कर सकते हैं।
                </div>
              </div>
            ) : (
              <div className="bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2.5">
                <Trash2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-red-900 dark:text-red-200">
                  <span className="font-black">स्थायी विलोपन:</span> यह डेटा डेटाबेस से हमेशा के लिए हटा दिया जाएगा।
                  इसे बाद में रीस्टोर नहीं किया जा सकेगा।
                </div>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>सुरक्षा पासवर्ड (Security Password)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError('');
                }}
                placeholder="पासवर्ड दर्ज करें (उदा. delete123)"
                autoFocus
                disabled={loading}
                className="w-full px-3.5 py-2.5 pr-10 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#202020] text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
              <span>गलती से डिलीट होने से बचाव हेतु पासवर्ड आवश्यक है।</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">पासवर्ड: delete123</span>
            </p>
          </div>

          {/* Error Message */}
          {(localError || errorMessage) && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{localError || errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className={`px-4 py-2 text-xs font-black text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isPermanent ? 'bg-red-600 hover:bg-red-700' : 'bg-[#EA580C] hover:bg-orange-700'
              }`}
            >
              {loading ? (
                <span>प्रक्रिया जारी है...</span>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>हाँ, पासवर्ड के साथ हटाएं</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

