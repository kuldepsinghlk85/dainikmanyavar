'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HoroscopeWidget() {
  const [horoscopes, setHoroscopes] = useState<any[]>([]);
  const [selectedZodiac, setSelectedZodiac] = useState<string>('mesh');

  useEffect(() => {
    fetch('/api/horoscope')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setHoroscopes(data.data);
      })
      .catch(() => {});
  }, []);

  if (!horoscopes || horoscopes.length === 0) return null;

  const current = horoscopes.find((h) => h.zodiacSign === selectedZodiac) || horoscopes[0];

  const zodiacList = [
    { sign: 'mesh', name: 'मेष' }, { sign: 'vrishabh', name: 'वृषभ' },
    { sign: 'mithun', name: 'मिथुन' }, { sign: 'kark', name: 'कर्क' },
    { sign: 'simha', name: 'सिंह' }, { sign: 'kanya', name: 'कन्या' },
    { sign: 'tula', name: 'तुला' }, { sign: 'vrischik', name: 'वृश्चिक' },
    { sign: 'dhanu', name: 'धनु' }, { sign: 'makar', name: 'मकर' },
    { sign: 'kumbh', name: 'कुंभ' }, { sign: 'meen', name: 'मीन' }
  ];

  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-md space-y-3">
      <div className="flex justify-between items-center border-b border-amber-400/40 pb-2">
        <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-yellow-100">
          <Sparkles className="w-4 h-4 text-yellow-200" />
          <span>आज का राशिफल (Daily Horoscope)</span>
        </h3>
        <Link href="/horoscope" className="text-xs text-amber-100 font-bold hover:underline flex items-center gap-1">
          <span>12 राशियां देखें</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Zodiac Sign Chips Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap no-scrollbar py-1">
        {zodiacList.map((z) => (
          <button
            key={z.sign}
            onClick={() => setSelectedZodiac(z.sign)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedZodiac === z.sign ? 'bg-white text-orange-600 shadow-sm' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {z.name}
          </button>
        ))}
      </div>

      {/* Selected Horoscope Card Detail */}
      {current && (
        <div className="bg-white/10 p-3.5 rounded-xl border border-white/20 space-y-1.5 backdrop-blur-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-yellow-200">{current.zodiacHindi}</span>
            <span className="text-[10px] font-mono text-amber-100">लकी अंक: {current.luckyNumber || '7'}</span>
          </div>
          <p className="text-xs text-white leading-relaxed line-clamp-3">{current.prediction}</p>
        </div>
      )}
    </div>
  );
}
