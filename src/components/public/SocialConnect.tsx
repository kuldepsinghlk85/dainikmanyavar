'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, CheckCircle2, Heart, MessageCircle, Share2, Youtube, Instagram, Facebook, Globe, Send } from 'lucide-react';
import { OFFICIAL_SOCIAL_LINKS, OFFICIAL_HANDLES } from '@/lib/social';

export default function SocialConnect() {
  const socialChannels = [
    {
      name: 'वेबसाइट',
      handle: 'dainikmanyavar.com',
      url: OFFICIAL_SOCIAL_LINKS.website,
      bg: 'bg-gradient-to-r from-orange-600 to-amber-600',
      text: 'text-white',
      icon: <Globe className="w-4 h-4 shrink-0" />,
      actionText: 'विज़िट करें',
    },
    {
      name: 'यूट्यूब',
      handle: OFFICIAL_HANDLES.youtube,
      url: OFFICIAL_SOCIAL_LINKS.youtube,
      bg: 'bg-[#FF0000]',
      text: 'text-white',
      icon: <Youtube className="w-4 h-4 shrink-0" />,
      actionText: 'सब्सक्राइब',
    },
    {
      name: 'इंस्टाग्राम',
      handle: OFFICIAL_HANDLES.instagram,
      url: OFFICIAL_SOCIAL_LINKS.instagram,
      bg: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]',
      text: 'text-white',
      icon: <Instagram className="w-4 h-4 shrink-0" />,
      actionText: 'फॉलो करें',
    },
    {
      name: 'फेसबुक',
      handle: 'दैनिक मान्यवर ऑफिशियल पेज',
      url: OFFICIAL_SOCIAL_LINKS.facebook,
      bg: 'bg-[#1877F2]',
      text: 'text-white',
      icon: <Facebook className="w-4 h-4 shrink-0" />,
      actionText: 'लाइक करें',
    },
    {
      name: 'व्हाट्सएप',
      handle: '+91 93361 81297',
      url: OFFICIAL_SOCIAL_LINKS.whatsapp,
      bg: 'bg-[#25D366]',
      text: 'text-white',
      icon: <span className="font-bold text-sm">💬</span>,
      actionText: 'जुड़ें',
    },
    {
      name: 'टेलीग्राम',
      handle: '@dainikmanyawar',
      url: OFFICIAL_SOCIAL_LINKS.telegram,
      bg: 'bg-[#229ED9]',
      text: 'text-white',
      icon: <Send className="w-4 h-4 shrink-0" />,
      actionText: 'ज्वाइन करें',
    },
  ];

  return (
    <section className="my-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#EA580C] pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#EA580C] rounded-xs inline-block"></span>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>दैनिक मान्यवर ऑफिशियल सोशल मीडिया</span>
              <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Official Channels
              </span>
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            दैनिक मान्यवर के आधिकारिक चैनलों से जुड़ें, ताज़ा वीडियो बुलेटिन देखें और सोशल मीडिया पर हमें फ़ॉलो करें
          </p>
        </div>

        <a
          href={OFFICIAL_SOCIAL_LINKS.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>dainikmanyavar.com</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Official Quick Connect Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {socialChannels.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${s.bg} ${s.text} p-3 rounded-xl shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between group cursor-pointer`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black tracking-tight">{s.name}</span>
              {s.icon}
            </div>
            <div className="mt-2 pt-1 border-t border-white/20 flex items-center justify-between text-[11px] font-bold">
              <span className="truncate opacity-95">{s.actionText}</span>
              <ExternalLink className="w-3 h-3 opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </a>
        ))}
      </div>

      {/* Official Posts & Feeds Showcase Section (YouTube, Instagram, Facebook) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {/* 1. YouTube Official Post & Video Bulletin Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-[#FF0000] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5" />
              <div>
                <h4 className="text-xs font-black tracking-tight">यूट्यूब ऑफिशियल चैनल</h4>
                <p className="text-[10px] text-red-100 font-mono">{OFFICIAL_HANDLES.youtube}</p>
              </div>
            </div>
            <span className="bg-white text-[#FF0000] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              SUBSCRIBE
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-stone-50/50">
            {/* Video preview / banner */}
            <a
              href={OFFICIAL_SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-video rounded-xl overflow-hidden bg-stone-900 group cursor-pointer block border border-stone-200"
            >
              <img
                src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=700&q=80"
                alt="दैनिक मान्यवर यूट्यूब बुलेटिन"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all">
                  <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-1 rounded-md truncate">
                दैनिक मान्यवर न्यूज़ बुलेटिन व लाइव डिबेट्स
              </div>
            </a>

            <div className="space-y-1">
              <h5 className="text-xs font-black text-stone-900 line-clamp-2 leading-snug">
                देश, प्रदेश और जनहित की निष्पक्ष रिपोर्टिंग देखें हमारे ऑफिशियल यूट्यूब चैनल पर।
              </h5>
              <p className="text-[11px] text-stone-500 font-medium">
                हर बड़ी ब्रेकिंग न्यूज़ और वीडियो ग्राउंड रिपोर्ट सबसे पहले
              </p>
            </div>

            <a
              href={OFFICIAL_SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-[#FF0000] hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Youtube className="w-4 h-4" />
              <span>चैनल सब्सक्राइब करें ({OFFICIAL_HANDLES.youtube})</span>
            </a>
          </div>
        </div>

        {/* 2. Instagram Official Post & Reel Showcase Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram className="w-5 h-5" />
              <div>
                <h4 className="text-xs font-black tracking-tight">इंस्टाग्राम ऑफिशियल</h4>
                <p className="text-[10px] text-pink-100 font-mono">{OFFICIAL_HANDLES.instagram}</p>
              </div>
            </div>
            <span className="bg-white text-[#FD1D1D] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              FOLLOW
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-stone-50/50">
            {/* Instagram Profile & Post mockup */}
            <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                      <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-stone-900">dainikmanyavarofficial</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                    </div>
                    <span className="text-[10px] text-stone-400">आधिकारिक न्यूज़ हैंडल</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-stone-400">पोस्ट</span>
              </div>

              <a
                href={OFFICIAL_SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-lg overflow-hidden bg-stone-900 group cursor-pointer block border border-stone-200"
              >
                <img
                  src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=700&q=80"
                  alt="दैनिक मान्यवर इंस्टाग्राम पोस्ट"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-end p-3 text-white">
                  <span className="bg-[#EA580C] text-white text-[9.5px] font-black px-2 py-0.5 rounded-full w-fit mb-1">
                    BREAKING UPDATE
                  </span>
                  <p className="text-xs font-black line-clamp-2 leading-tight">
                    दैनिक मान्यवर: निष्पक्ष और निर्भीक पत्रकारिता की ताज़ा अपडेट्स
                  </p>
                </div>
              </a>

              {/* Engagement icons */}
              <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-rose-600">
                    <Heart className="w-3.5 h-3.5 fill-rose-600" /> 1.5K
                  </span>
                  <span className="flex items-center gap-1 font-bold text-stone-600">
                    <MessageCircle className="w-3.5 h-3.5" /> 230
                  </span>
                </div>
                <Share2 className="w-3.5 h-3.5 text-stone-400" />
              </div>
            </div>

            <a
              href={OFFICIAL_SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-opacity cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>इंस्टाग्राम पर फॉलो करें ({OFFICIAL_HANDLES.instagram})</span>
            </a>
          </div>
        </div>

        {/* 3. Facebook Official Page & Post Showcase Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-[#1877F2] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Facebook className="w-5 h-5" />
              <div>
                <h4 className="text-xs font-black tracking-tight">फेसबुक ऑफिशियल पेज</h4>
                <p className="text-[10px] text-blue-100">ID: 61595721003030</p>
              </div>
            </div>
            <span className="bg-white text-[#1877F2] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              PAGE LIKE
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-stone-50/50">
            {/* Facebook Post Mockup */}
            <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                  <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h6 className="text-xs font-black text-stone-900">दैनिक मान्यवर</h6>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-600 text-white" />
                  </div>
                  <p className="text-[10px] text-stone-400">आधिकारिक फेसबुक पेज • 🌐 सार्वजनिक</p>
                </div>
              </div>

              <div className="text-xs text-stone-800 leading-relaxed font-medium bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                हर ताज़ा राजनीतिक, सामाजिक व जनहितकारी खबर सीधे अपने फेसबुक फ़ीड पर पाने के लिए दैनिक मान्यवर पेज को लाइक व फ़ॉलो करें।
              </div>

              <a
                href={OFFICIAL_SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-16/9 rounded-lg overflow-hidden bg-stone-900 group cursor-pointer block border border-stone-200"
              >
                <img
                  src="https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=700&q=80"
                  alt="दैनिक मान्यवर फेसबुक पेज"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-2.5 text-white">
                  <p className="text-[11px] font-bold truncate">
                    दैनिक मान्यवर — सच के साथ... समाज के लिए...
                  </p>
                </div>
              </a>

              {/* Interaction Bar */}
              <div className="flex items-center justify-between text-stone-500 pt-1 border-t border-stone-100 text-[11px] font-bold">
                <span>👍 2.8K लाइक्स</span>
                <span>💬 412 कमेंट्स</span>
                <span>↗️ 650 शेयर्स</span>
              </div>
            </div>

            <a
              href={OFFICIAL_SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-[#1877F2] hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Facebook className="w-4 h-4" />
              <span>फेसबुक पेज लाइक व फ़ॉलो करें</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
