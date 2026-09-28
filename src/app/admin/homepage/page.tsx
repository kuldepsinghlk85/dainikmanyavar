'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Save, 
  Sliders, 
  ExternalLink,
  Flame,
  LayoutTemplate,
  Layers,
  Megaphone
} from 'lucide-react';

export default function HomepageAdminPage() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const [widgetSettings, setWidgetSettings] = useState({
    widget_cricket_enabled: 'true',
    widget_horoscope_enabled: 'true',
    widget_stock_enabled: 'true',
    widget_gold_silver_enabled: 'true',
    festive_section_enabled: 'true',
    section_hero_enabled: 'true',
    section_trending_enabled: 'true',
    section_latest_enabled: 'true',
    section_district_enabled: 'true',
    section_multitag_enabled: 'true',
    section_video_enabled: 'true',
    section_tags_enabled: 'true',
    section_shabdkhoj_enabled: 'false',
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setWidgetSettings((prev) => ({
            ...prev,
            ...d.data,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    setSavingKey(key);
    setMsg('');

    // Optimistic state update
    setWidgetSettings((prev) => ({ ...prev, [key]: newValue }));

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(
          newValue === 'true'
            ? '✅ विगेट सक्रिय (Active) कर दिया गया! यह अब होमपेज पर दिखाई देगा।'
            : '🔒 विगेट निष्क्रिय (Inactive) कर दिया गया! यह अब होमपेज से हटा दिया गया है।'
        );
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(data.error || 'सेटिंग्स सुरक्षित करने में समस्या आई');
      }
    } catch (err: any) {
      alert(err.message || 'नेटवर्क त्रुटि');
    }
    setSavingKey(null);
  };

  const specialWidgets = [
    {
      key: 'widget_cricket_enabled',
      title: '🏏 क्रिकेट लाइव अपडेट्स (Cricket Live Scores)',
      desc: 'लाइव मैच स्कोरकार्ड, बॉल-बाय-बॉल स्थिति व ताज़ा खेल समाचार',
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      manageHref: '/admin/cricket',
      manageLabel: 'क्रिकेट मैच प्रबंधित करें',
    },
    {
      key: 'widget_horoscope_enabled',
      title: '🔮 आज का राशिफल (Daily Horoscope)',
      desc: '12 राशियों का दैनिक राशिफल फलकथन, लकी अंक व भविष्यवाणियां',
      icon: Sparkles,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      manageHref: '/admin/horoscope',
      manageLabel: 'राशिफल डेटा प्रबंधित करें',
    },
    {
      key: 'widget_stock_enabled',
      title: '📈 शेयर बाजार (Stock Market Sensex/Nifty)',
      desc: 'सेंसेक्स, निफ्टी, बैंक निफ्टी लाइव सूचकांक व वित्तीय समाचार',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      manageHref: '/admin/stock-market',
      manageLabel: 'शेयर बाजार प्रबंधित करें',
    },
    {
      key: 'widget_gold_silver_enabled',
      title: '🪙 सोना-चांदी भाव (Gold & Silver Commodity Rates)',
      desc: 'वाराणसी, जौनपुर, लखनऊ आदि शहरों के 24K सोना व चांदी के दैनिक भाव',
      icon: Coins,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      manageHref: '/admin/gold-silver',
      manageLabel: 'सोना-चांदी भाव प्रबंधित करें',
    },
    {
      key: 'festive_section_enabled',
      title: '✨ फेस्टिव व कमर्शियल शोकेस (Festive Showcase & Video Reels)',
      desc: 'होमपेज के टॉप पर चलने वाला फेस्टिव पोस्टर व सनातन वीडियो रील्स बैनर',
      icon: Sparkles,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      manageHref: '/admin/festive',
      manageLabel: 'फेस्टिव अपलोडर खोलें',
    },
  ];

  const mainSections = [
    { key: 'section_hero_enabled', title: 'मुख्य लीड स्टोरी (Hero Story Slider)', layout: '2:1 Grid Slider' },
    { key: 'section_trending_enabled', title: '🔥 ट्रेंडिंग न्यूज़ (Trending Widget)', layout: 'Numbered Rank List' },
    { key: 'section_latest_enabled', title: '🕒 ताजा खबरें (Latest News Cards)', layout: '4 Column Grid Cards' },
    { key: 'section_district_enabled', title: '📍 जिले की खबरें (District Tabs)', layout: 'Interactive Tabbed Grid' },
    { key: 'section_multitag_enabled', title: '# मल्टी टैग न्यूज़ (Multi-Tag Cards)', layout: '3 Column Grid Cards' },
    { key: 'section_video_enabled', title: '▶ वीडियो न्यूज़ (Video Bulletins)', layout: 'Video Playlist Player' },
    { key: 'section_tags_enabled', title: '🏷️ लोकप्रिय टैग्स (Tag Cloud)', layout: 'Pill Tags Cloud' },
    { key: 'section_shabdkhoj_enabled', title: '🧩 शब्दखोज पहेली बैनर (Mobile Word Puzzle)', layout: 'Interactive Banner' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#EA580C]" />
            <span>होमपेज सेक्शन व स्पेशल विगेट्स मैनेजर</span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            होमपेज पर प्रदर्शित होने वाले स्पेशल लाइव विगेट्स (क्रिकेट, राशिफल, शेयर बाजार, सोना-चांदी) को एक क्लिक में एक्टिव/इनएक्टिव करें
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span>होमपेज देखें (Live Website)</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Success Toast Notification */}
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-emerald-700 font-bold hover:text-emerald-950">×</button>
        </div>
      )}

      {/* SECTION 1: Special Live News Widgets (User's Exact Request) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#EA580C]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900">
                विशेष लाइव समाचार विगेट्स (Special Live News Feeds)
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                इन विगेट्स को जब चाहे सक्रिय (Active) करें अथवा होमपेज से छुपाएं (Inactive/Hide)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialWidgets.map((w) => {
            const isEnabled = (widgetSettings as any)[w.key] !== 'false';
            const Icon = w.icon;
            const isProcessing = savingKey === w.key;

            return (
              <div
                key={w.key}
                className={`p-5 rounded-2xl border transition-all duration-200 bg-white shadow-sm ${
                  isEnabled ? 'border-stone-300 ring-1 ring-stone-200' : 'border-stone-200 opacity-80 bg-stone-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${w.bgColor} ${w.color} border ${w.borderColor} shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-stone-900 text-sm">{w.title}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black mt-1 ${
                          isEnabled
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {isEnabled ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>🟢 होमपेज पर सक्रिय (ACTIVE)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>🔴 होमपेज से छिपा हुआ (HIDDEN)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* High-Contrast Interactive Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(w.key, (widgetSettings as any)[w.key])}
                    disabled={isProcessing}
                    className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-[#16A34A]' : 'bg-stone-300'
                    }`}
                    title={isEnabled ? 'निष्क्रिय / छिपाने के लिए क्लिक करें' : 'सक्रिय करने के लिए क्लिक करें'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-4">{w.desc}</p>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                  <span className="text-[11px] font-bold text-stone-400">
                    स्थिति: <strong className={isEnabled ? 'text-emerald-700' : 'text-stone-500'}>{isEnabled ? 'होमपेज पर दिखेगा' : 'अदृश्य / छिपा हुआ'}</strong>
                  </span>

                  <Link
                    href={w.manageHref}
                    className="font-extrabold text-[#EA580C] hover:text-orange-700 flex items-center gap-1 hover:underline"
                  >
                    <span>{w.manageLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: Empty Ad Placeholders On/Off (Requested by User) */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#EA580C]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900">
                खाली विज्ञापन स्थान (Empty Ad Placeholders) ऑन/ऑफ
              </h2>
              <p className="text-xs text-stone-500">
                जब किसी स्लॉट में लाइव विज्ञापन सक्रिय न हो, तो खाली बॉक्स दिखाना (Visible) है या पूरी तरह छुपाना (Invisible) है
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle('ad_placeholders_enabled', (widgetSettings as any).ad_placeholders_enabled || 'false')}
            disabled={savingKey === 'ad_placeholders_enabled'}
            className={`font-black text-xs px-4 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              (widgetSettings as any).ad_placeholders_enabled === 'true'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
            }`}
          >
            {(widgetSettings as any).ad_placeholders_enabled === 'true' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>🟢 सभी खाली बॉक्स दृश्यमान (Visible)</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-stone-500" />
                <span>🔒 सभी खाली बॉक्स छुपे हुए (Invisible)</span>
              </>
            )}
          </button>
        </div>

        {/* Individual slot controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {[
            { key: 'ad_placeholder_sidebar_tall_enabled', label: 'साइडबार #2 (300×300 विशेष प्रचार)', desc: 'लोकप्रिय टैग के ऊपर वाला खाली स्थान' },
            { key: 'ad_placeholder_sidebar_box2_enabled', label: 'साइडबार #3 (300×250 विज्ञापन)', desc: 'लोकप्रिय टैग के नीचे वाला खाली स्थान' },
            { key: 'ad_placeholder_sidebar_box_enabled', label: 'साइडबार #1 (300×250 विज्ञापन)', desc: 'टॉप साइडबार का खाली स्थान' },
            { key: 'ad_placeholder_header_wide_enabled', label: 'हेडर बैनर (970×90)', desc: 'शीर्ष हेडर का खाली स्थान' },
          ].map((item) => {
            const isSlotActive = (widgetSettings as any)[item.key] === 'true';
            return (
              <div key={item.key} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-stone-900">{item.label}</h4>
                  <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.key, isSlotActive ? 'true' : 'false')}
                  disabled={savingKey === item.key}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    isSlotActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {isSlotActive ? '🟢 विज़िबल (Visible)' : '🔒 इनविज़िबल (Hidden)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: General Homepage Content Sections */}
      <div className="space-y-4 pt-4 border-t border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-stone-900">
              मुख्य समाचार सेक्शन्स (Main Content Sections)
            </h2>
            <p className="text-[11px] text-stone-500 font-medium">
              होमपेज लेआउट के मुख्य ग्रिड सेक्शन्स की विजिबिलिटी स्थिति
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-3">
          {mainSections.map((sec, idx) => {
            const isEnabled = (widgetSettings as any)[sec.key] !== 'false';
            const isProcessing = savingKey === sec.key;

            return (
              <div
                key={sec.key}
                className="p-3.5 bg-stone-50/80 border border-stone-200 rounded-xl flex items-center justify-between hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#EA580C] text-white text-xs font-black rounded flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm">{sec.title}</h3>
                    <p className="text-[11px] text-stone-500">लेआउट प्रारूप: {sec.layout}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {sec.key === 'section_hero_enabled' && (
                    <Link
                      href="/admin/slider"
                      className="text-[11px] font-extrabold text-[#EA580C] hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>खबरों का क्रम व संख्या सेट करें ➔</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggle(sec.key, (widgetSettings as any)[sec.key])}
                    disabled={isProcessing}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isEnabled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>सक्रिय (Active)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-stone-400" />
                        <span>छिपा हुआ (Inactive)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
