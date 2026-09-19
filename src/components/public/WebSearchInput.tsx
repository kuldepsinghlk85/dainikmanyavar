'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import VoiceInputButton from '@/components/public/VoiceInputButton';

export default function WebSearchInput({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="खबर, विषय, ज़िला या व्यक्ति खोजें..."
        className="w-full pl-10 pr-28 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all shadow-xs"
      />
      <Search className="w-5 h-5 text-stone-400 absolute left-3.5 pointer-events-none" />
      <div className="absolute right-2 flex items-center gap-1.5">
        <VoiceInputButton
          onTranscript={(text) => {
            setValue(text);
            router.push(`/search?q=${encodeURIComponent(text)}`);
          }}
          size="md"
          placeholderHint="खोजने के लिए बोलिए..."
          currentValue={value}
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          खोजें
        </button>
      </div>
    </form>
  );
}
