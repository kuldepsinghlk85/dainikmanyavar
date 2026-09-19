'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import VoiceInputButton from '@/components/public/VoiceInputButton';

export default function MobileSearchInput({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/mobile/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="मुद्दा, जिला या खबर खोजें..."
        className="w-full pl-9 pr-24 py-2 bg-white dark:bg-[#181818] text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-[#E53935]"
      />
      <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
      <div className="absolute right-1.5 flex items-center gap-1">
        <VoiceInputButton
          onTranscript={(text) => {
            setValue(text);
            router.push(`/mobile/search?q=${encodeURIComponent(text)}`);
          }}
          size="sm"
          placeholderHint="खोजने के लिए बोलिए..."
        />
        <button
          type="submit"
          className="px-2.5 py-1 bg-[#E53935] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          खोजें
        </button>
      </div>
    </form>
  );
}
