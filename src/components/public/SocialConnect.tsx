'use client';

import React from 'react';

export default function SocialConnect() {
  const socials = [
    { name: 'WhatsApp', url: 'https://wa.me/919336181297', bg: 'bg-[#16A34A]', text: 'text-white' },
    { name: 'Facebook', url: 'https://facebook.com/dainikmanyawar', bg: 'bg-[#1877F2]', text: 'text-white' },
    { name: 'YouTube', url: 'https://youtube.com/@dainikmanyawar', bg: 'bg-[#FF0000]', text: 'text-white' },
    { name: 'Instagram', url: 'https://instagram.com/dainikmanyawar', bg: 'bg-[#E4405F]', text: 'text-white' },
    { name: 'X / Twitter', url: 'https://x.com/dainikmanyawar', bg: 'bg-black', text: 'text-white' },
    { name: 'Telegram', url: 'https://t.me/dainikmanyawar', bg: 'bg-[#229ED9]', text: 'text-white' },
  ];

  return (
    <div className="my-6">
      <div className="border-b-2 border-[#F97316] pb-2 mb-3">
        <h3 className="text-xl font-bold text-[#171717]">🌐 सोशल मीडिया से जुड़ें</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${s.bg} ${s.text} p-3 rounded-lg text-center font-bold text-xs sm:text-sm hover:opacity-90 shadow-sm transition-all hover:-translate-y-0.5`}
          >
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}
