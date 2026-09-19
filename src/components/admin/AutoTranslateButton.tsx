'use client';

import React, { useState } from 'react';
import { Languages, RefreshCw, Check, Sparkles } from 'lucide-react';

interface AutoTranslateButtonProps {
  currentData: {
    title?: string;
    subtitle?: string;
    excerpt?: string;
    content?: string;
    tags?: string[];
  };
  onTranslate: (translated: {
    title?: string;
    subtitle?: string;
    excerpt?: string;
    content?: string;
    tags?: string[];
  }) => void;
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AutoTranslateButton({
  currentData,
  onTranslate,
  className = '',
  label = '🌐 हिंदी में अनुवाद करें (Auto Translate)',
  size = 'md',
}: AutoTranslateButtonProps) {
  const [translating, setTranslating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTranslate = async () => {
    // Check if there is anything to translate
    const hasContent =
      Boolean(currentData.title?.trim()) ||
      Boolean(currentData.subtitle?.trim()) ||
      Boolean(currentData.excerpt?.trim()) ||
      Boolean(currentData.content?.trim());

    if (!hasContent) {
      alert('कृपया अनुवाद करने के लिए पहले शीर्षक या विवरण लिखें!');
      return;
    }

    setTranslating(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: currentData,
        }),
      });

      const data = await res.json();
      if (data.success && data.translated) {
        onTranslate(data.translated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      } else {
        alert(data.error || 'अनुवाद करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }
    } catch (err: any) {
      console.error('Translation error:', err);
      alert('अनुवाद सेवा से संपर्क नहीं हो सका।');
    } finally {
      setTranslating(false);
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1 text-[11px]'
      : size === 'lg'
      ? 'px-4 py-2.5 text-sm font-black'
      : 'px-3.5 py-2 text-xs font-bold';

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={translating}
      className={`inline-flex items-center gap-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 ${
        success
          ? 'bg-emerald-600 text-white'
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white'
      } ${sizeClasses} ${className}`}
      title="अंग्रेज़ी से हिंदी में अनुवाद करें"
    >
      {translating ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
          <span>हिंदी अनुवाद हो रहा है...</span>
        </>
      ) : success ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-200" />
          <span>✓ हिंदी अनुवाद संपन्न!</span>
        </>
      ) : (
        <>
          <Languages className="w-3.5 h-3.5 text-amber-300" />
          <span>{label}</span>
          <Sparkles className="w-3 h-3 text-amber-200 opacity-80" />
        </>
      )}
    </button>
  );
}
