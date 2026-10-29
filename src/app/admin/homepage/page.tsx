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
  Megaphone,
  Film,
  Palette,
  Image as ImageIcon,
  Upload,
  Eye,
  Loader2,
  RefreshCw,
  Check
} from 'lucide-react';
import SectionHeaderBar from '@/components/public/SectionHeaderBar';

export default function HomepageAdminPage() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  // Header Theme & Animation States
  const [headerTheme, setHeaderTheme] = useState('default');
  const [headerAnimation, setHeaderAnimation] = useState('shimmer');
  const [headerCustomImage, setHeaderCustomImage] = useState('');
  const [savingHeaderTheme, setSavingHeaderTheme] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [widgetSettings, setWidgetSettings] = useState({
    widget_cricket_enabled: 'true',
    widget_horoscope_enabled: 'true',
    widget_stock_enabled: 'true',
    widget_gold_silver_enabled: 'true',
    widget_movie_slider_enabled: 'true',
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
          if (d.data.header_bar_theme) setHeaderTheme(d.data.header_bar_theme);
          if (d.data.header_bar_animation) setHeaderAnimation(d.data.header_bar_animation);
          if (d.data.header_bar_custom_image) setHeaderCustomImage(d.data.header_bar_custom_image);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveHeaderTheme = async () => {
    setSavingHeaderTheme(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header_bar_theme: headerTheme,
          header_bar_animation: headerAnimation,
          header_bar_custom_image: headerCustomImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('🎨 हेडर बार डिज़ाइन थीम व एनिमेशन सफलतापूर्वक अपडेट कर दिया गया! होमपेज पर बदलाव लाइव हो चुके हैं।');
        setTimeout(() => setMsg(''), 5000);
      } else {
        alert(data.error || 'थीम सेटिंग्स सुरक्षित करने में समस्या आई');
      }
    } catch (err: any) {
      alert(err.message || 'नेटवर्क त्रुटि');
    } finally {
      setSavingHeaderTheme(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', 'Header Bar Festive Strip');
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setHeaderCustomImage(data.data.url);
        setHeaderTheme('custom');
        setMsg('🖼️ फेस्टिव इमेज पट्टी सफलतापूर्वक अपलोड हो गई! नीचे दिए सेव बटन पर क्लिक करके लागू करें।');
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(data.error || 'इमेज अपलोड विफल');
      }
    } catch (err: any) {
      alert(err.message || 'इमेज अपलोड में त्रुटि');
    } finally {
      setUploadingImage(false);
    }
  };

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
    {
      key: 'widget_movie_slider_enabled',
      title: '🎬 फिल्मों का न्यूज़ स्लाइडर (Movie News Slider Widget)',
      desc: 'साइडबार में फिल्मों, मूवी रिव्यू व सिनेमा समाचार का ऑटो-स्लाइडिंग इमेज व हेडिंग विजेट',
      icon: Film,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      manageHref: '/admin/articles?category=manoranjan',
      manageLabel: 'सिनेमा खबरें प्रबंधित करें',
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

      {/* SECTION: Header Bar Design Themes & Background Animation (User's Exact Request) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#EA580C] shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-stone-900">
                  हेडर बार डिज़ाइन व फेस्टिवल थीम मैनेजर (Header Themes & Animation)
                </h2>
                <span className="bg-orange-100 text-[#EA580C] text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-200">
                  नया फीचर
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                होमपेज के हेडर बार (ताजा खबरें, जिले की खबरें आदि) में बैकग्राउंड एनीमेशन, फेस्टिवल थीम्स व कस्टम इमेज पट्टी सेट करें
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveHeaderTheme}
            disabled={savingHeaderTheme}
            className="w-full sm:w-auto bg-[#EA580C] hover:bg-orange-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savingHeaderTheme ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>सेव हो रहा है...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>थीम सेटिंग्स सुरक्षित करें (Save)</span>
              </>
            )}
          </button>
        </div>

        {/* Live Interactive Preview Box */}
        <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-stone-700">
              <Eye className="w-4 h-4 text-[#EA580C]" />
              <span>लाइव रीयल-टाइम प्रीव्यू (Live Real-Time Preview)</span>
            </div>
            <span className="text-[11px] font-bold text-stone-500">
              होमपेज पर ऐसा दिखाई देगा
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
            <SectionHeaderBar
              title="🕒 ताजा खबरें"
              action={
                <span className="text-xs text-[#EA580C] font-bold hover:underline cursor-pointer">
                  और देखें →
                </span>
              }
              themeConfig={{
                theme: headerTheme,
                animation: headerAnimation,
                customImage: headerCustomImage,
              }}
            />
            <div className="text-[11px] text-stone-400 font-medium text-center py-1">
              (यह हेडर बार 'जिले की खबरें', 'मल्टी टैग न्यूज़', 'वीडियो बुलेटिन' और 'ट्रेंडिंग' पर भी समान रूप से लागू रहेगा)
            </div>
          </div>
        </div>

        {/* Step 1: Festival & Design Themes Grid */}
        <div className="space-y-3">
          <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
            <span>1. हेडर डिज़ाइन थीम चुनें (Select Festival / Color Theme):</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                id: 'default',
                title: 'क्लासिक मान्यवर (Default)',
                desc: 'पारंपरिक ओरिजिनल ऑरेंज एक्सेंट व सौम्य लाइट शिमर',
                bgClass: 'bg-gradient-to-r from-orange-50 via-amber-50 to-transparent border-b-2 border-orange-500',
                badge: '🧡 क्लासिक',
                badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
              },
              {
                id: 'diwali',
                title: 'दीपावली महोत्सव (Diwali)',
                desc: 'डीप गोल्डन एम्बर, जगमगाती आभा व स्वर्णिम रोशनी',
                bgClass: 'bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-50 border-b-2 border-amber-500',
                badge: '🪔 दीपोत्सव',
                badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
              },
              {
                id: 'holi',
                title: 'होली रंगोत्सव (Holi)',
                desc: 'सतरंगी पेस्टल रंगों का सौम्य संगम व जीवंत ऊर्जा',
                bgClass: 'bg-gradient-to-r from-rose-100 via-amber-100 via-emerald-100 to-sky-100 border-b-2 border-rose-500',
                badge: '🎨 रंगोत्सव',
                badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
              },
              {
                id: 'navratri',
                title: 'नवरात्रि / दुर्गा पूजा (Navratri)',
                desc: 'भगवा व गेंदा पुष्प की पावन व भक्तिमय छटा',
                bgClass: 'bg-gradient-to-r from-orange-100 via-amber-100 to-red-50 border-b-2 border-orange-600',
                badge: '🚩 पावन पर्व',
                badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
              },
              {
                id: 'tricolor',
                title: 'तिरंगा / राष्ट्रीय पर्व (Tricolor)',
                desc: 'केसरिया-श्वेत-हरा राष्ट्रीय गौरव का प्रतीक',
                bgClass: 'bg-gradient-to-r from-orange-100 via-white to-emerald-100 border-b-2 border-orange-500',
                badge: '🇮🇳 राष्ट्र गौरव',
                badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              },
              {
                id: 'royal',
                title: 'रॉयल मरून व गोल्ड (Royal Velvet)',
                desc: 'शाही मखमली मरून व स्वर्णिम किनारी का वैभव',
                bgClass: 'bg-gradient-to-r from-rose-950/10 via-amber-900/10 to-transparent border-b-2 border-amber-600',
                badge: '👑 शाही वैभव',
                badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
              },
              {
                id: 'custom',
                title: 'कस्टम इमेज पट्टी (Custom Festive Strip)',
                desc: 'त्योहारों की तोरण / झालर / स्पेशल पैटर्न पट्टी का बैकग्राउंड',
                bgClass: 'bg-white border-b-2 border-orange-600',
                badge: '🖼️ कस्टम पैटर्न',
                badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
              },
            ].map((th) => {
              const isSelected = headerTheme === th.id;
              return (
                <button
                  type="button"
                  key={th.id}
                  onClick={() => setHeaderTheme(th.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#EA580C] bg-orange-50/40 ring-2 ring-orange-500/30 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${th.badgeColor}`}>
                        {th.badge}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-xs text-stone-900 mb-1">{th.title}</div>
                    <p className="text-[11px] text-stone-500 leading-tight mb-3">{th.desc}</p>
                  </div>

                  {/* Visual Strip Preview Bar */}
                  <div className={`h-4 rounded-lg w-full ${th.bgClass} shadow-2xs mt-auto`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Background Animation Options */}
        <div className="space-y-3 pt-3 border-t border-stone-100">
          <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
            <span>2. बैकग्राउंड एनीमेशन प्रभाव (Background Animation Effect):</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'shimmer',
                title: '✨ लाइट शिमर स्वीप (Light Shimmer)',
                desc: 'सौम्य चमकीली रोशनी की लहर जो निरंतर प्रवाहित होती है',
              },
              {
                id: 'pulse',
                title: '💫 सॉफ्ट पल्स ग्लो (Breathing Pulse)',
                desc: 'मद्धिम सुनहरी रोशनी की धड़कन जो शांत आभा देती है',
              },
              {
                id: 'wave',
                title: '🌊 ग्रेडिएंट वेव (Gradient Wave)',
                desc: 'रंगों की सौम्य गतिमान तरंग',
              },
              {
                id: 'none',
                title: '⏸️ स्थिर (Static / No Animation)',
                desc: 'बिना किसी एनीमेशन के स्थिर पृष्ठभूमि',
              },
            ].map((anim) => {
              const isSelected = headerAnimation === anim.id;
              return (
                <button
                  type="button"
                  key={anim.id}
                  onClick={() => setHeaderAnimation(anim.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#EA580C] bg-orange-50/50 ring-2 ring-orange-500/30'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="font-extrabold text-xs text-stone-900 flex items-center justify-between mb-1">
                    <span>{anim.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#EA580C] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight">{anim.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Custom Festive Image Strip Options (Only visible or active when selected) */}
        <div className="space-y-3 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#EA580C]" />
              <span>3. कस्टम फेस्टिव इमेज पट्टी (Custom Festive Pattern / Banner Strip):</span>
            </label>
            {headerTheme !== 'custom' && (
              <span className="text-[11px] text-stone-400 font-medium">
                (कस्टम इमेज पट्टी को लागू करने के लिए ऊपर 'कस्टम इमेज पट्टी' थीम चुनें)
              </span>
            )}
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="फेस्टिव इमेज URL दर्ज करें (उदा. /uploads/... या ऑनलाइन इमेज लिंक)"
                value={headerCustomImage}
                onChange={(e) => {
                  setHeaderCustomImage(e.target.value);
                  if (headerTheme !== 'custom' && e.target.value) {
                    setHeaderTheme('custom');
                  }
                }}
                className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />

              <label className="bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs px-4 py-2 rounded-xl border border-stone-300 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>अपलोड हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-stone-600" />
                    <span>कम्प्यूटर से इमेज अपलोड करें</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {headerCustomImage && (
                <button
                  type="button"
                  onClick={() => setHeaderCustomImage('')}
                  className="text-stone-500 hover:text-red-600 text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 hover:border-red-200 hover:bg-red-50 transition-colors"
                >
                  हटाएं
                </button>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500">त्वरित फेस्टिव प्रीसेट्स:</span>
              {[
                {
                  label: '🌼 गेंदा पुष्प तोरण (Marigold Toran)',
                  url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
                },
                {
                  label: '✨ स्वर्णिम फेस्टिव लाइट्स (Golden Lights)',
                  url: 'https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=1200&q=80',
                },
                {
                  label: '🪔 दीपावली दीया पैटर्न (Diya Pattern)',
                  url: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=1200&q=80',
                },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setHeaderCustomImage(p.url);
                    setHeaderTheme('custom');
                  }}
                  className="text-[10px] font-extrabold bg-white hover:bg-orange-50 text-stone-700 hover:text-[#EA580C] border border-stone-200 hover:border-orange-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveHeaderTheme}
            disabled={savingHeaderTheme}
            className="w-full sm:w-auto bg-[#EA580C] hover:bg-orange-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savingHeaderTheme ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>सेव हो रहा है...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>थीम सेटिंग्स सुरक्षित करें (Save)</span>
              </>
            )}
          </button>
        </div>
      </div>

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
                  {sec.key === 'section_trending_enabled' && (
                    <Link
                      href="/admin/trending"
                      className="text-[11px] font-extrabold text-[#EA580C] hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                    >
                      <Flame className="w-3 h-3" />
                      <span>खबरों को ऊपर-नीचे सेट करें ➔</span>
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
