'use client';

import React from 'react';

interface DateSelectorProps {
  defaultDate: string;
}

export default function EpaperDateSelector({ defaultDate }: DateSelectorProps) {
  return (
    <form action="/epaper" method="GET">
      <input
        type="date"
        name="date"
        defaultValue={defaultDate}
        onChange={(e) => e.target.form?.submit()}
        className="bg-white border border-stone-300 rounded-xl px-2.5 py-1 text-xs font-mono font-bold cursor-pointer"
      />
    </form>
  );
}
