'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function SpoilerToggle({ spoilerText }: { spoilerText: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-5 space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>स्पॉइलर अलर्ट (Spoiler Alert) — कहानी के मुख्य राज़</span>
        </div>
        <button
          onClick={() => setShow(!show)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
        >
          {show ? (
            <>
              <EyeOff className="w-3.5 h-3.5" /> स्पॉइलर छुपाएं
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" /> स्पॉइलर पढ़ें
            </>
          )}
        </button>
      </div>

      {show ? (
        <div className="pt-2 text-xs text-stone-800 leading-relaxed border-t border-amber-200 whitespace-pre-line animate-in fade-in duration-200">
          {spoilerText}
        </div>
      ) : (
        <p className="text-[11px] text-amber-800/80 italic">
          यदि आपने अभी तक यह फिल्म या सीरीज़ नहीं देखी है, तो सस्पेंस बनाए रखने के लिए स्पॉइलर न खोलें।
        </p>
      )}
    </div>
  );
}
