'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Home,
  Newspaper,
  Video,
  Grid,
  Search,
  Menu,
  Share2,
  MapPin,
  FolderTree,
  Monitor,
  Phone,
  ArrowUp,
  ArrowDown,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_MOBILE_MENU_CONFIG,
  MobileMenuConfig,
  BottomNavItem,
} from '@/lib/mobileMenuDefaults';

export default function MobileMenuAdminPage() {
  const [config, setConfig] = useState<MobileMenuConfig>(DEFAULT_MOBILE_MENU_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/mobile-menu');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/mobile-menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'सेटिंग्स सफलतापूर्वक सहेजी गईं!');
      } else {
        setErrorMsg(data.error || 'सेव करने में समस्या आई।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'त्रुटि हुई।');
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (confirm('क्या आप मोबाइल मेनू की सभी सेटिंग्स डिफ़ॉल्ट पर रीसेट करना चाहते हैं?')) {
      setConfig(DEFAULT_MOBILE_MENU_CONFIG);
      setMsg('डिफ़ॉल्ट सेटिंग्स लोड की गईं। कृपया "सेव करें" बटन दबाकर सुरक्षित करें।');
    }
  };

  // Toggle Bottom Nav Item
  const toggleBottomNavItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      bottomNav: prev.bottomNav.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    }));
  };

  // Update Bottom Nav Item Label
  const updateBottomNavLabel = (id: string, newLabel: string) => {
    setConfig((prev) => ({
      ...prev,
      bottomNav: prev.bottomNav.map((item) =>
        item.id === id ? { ...item, label: newLabel } : item
      ),
    }));
  };

  // Reorder Bottom Nav Item
  const moveBottomNavItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...config.bottomNav];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // re-assign order numbers
    newItems.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setConfig((prev) => ({ ...prev, bottomNav: newItems }));
  };

  // Toggle Header Buttons
  const toggleHeaderButton = (key: keyof MobileMenuConfig['header']) => {
    setConfig((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [key]: !prev.header[key],
      },
    }));
  };

  // Toggle Drawer Items
  const toggleDrawerItem = (key: keyof MobileMenuConfig['drawer']) => {
    setConfig((prev) => ({
      ...prev,
      drawer: {
        ...prev.drawer,
        [key]: !prev.drawer[key],
      },
    }));
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'Newspaper':
        return <Newspaper className="w-5 h-5" />;
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Grid':
        return <Grid className="w-5 h-5" />;
      case 'Search':
        return <Search className="w-5 h-5" />;
      default:
        return <Grid className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#EA580C]" />
            <span>मोबाइल ऐप मेनू प्रबंधन (Mobile Menu Control)</span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            मोबाइल ऐप के निचले नेविगेशन बार, शीर्ष हेडर और साइड मेन्यू (ड्रॉअर) के बटनों को ऑन/ऑफ व कस्टमाइज़ करें
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            type="button"
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-stone-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>डिफ़ॉल्ट रीसेट</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            type="button"
            className="bg-[#EA580C] hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'सहेजा जा रहा है...' : 'सेटिंग्स सहेजें (Save Changes)'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center animate-fade-in shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{msg}</span>
          </span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold hover:opacity-75">
            ×
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center animate-fade-in shadow-xs">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </span>
          <button onClick={() => setErrorMsg('')} className="text-red-700 font-bold hover:opacity-75">
            ×
          </button>
        </div>
      )}

      {/* Main Grid: Controls on Left, Live Mobile Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* SECTION 1: Bottom Navigation Bar Buttons */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#EA580C]" />
                  <span>1. निचला नेविगेशन बार (Bottom Navigation Bar)</span>
                </h2>
                <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                  मोबाइल स्क्रीन के सबसे नीचे दिखने वाले मुख्य नेविगेशन बटनों को ऑन या ऑफ करें
                </p>
              </div>
              <span className="bg-orange-100 text-[#EA580C] text-[10px] font-black px-2 py-0.5 rounded-full">
                {config.bottomNav.filter((b) => b.enabled).length} सक्रिय
              </span>
            </div>

            <div className="space-y-2.5">
              {config.bottomNav.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    item.enabled
                      ? 'bg-stone-50/70 border-stone-200'
                      : 'bg-stone-100/50 border-dashed border-stone-300 opacity-60'
                  }`}
                >
                  {/* Left: Drag / Order buttons & Icon */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveBottomNavItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-25 cursor-pointer rounded hover:bg-stone-200"
                        title="ऊपर ले जाएं"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBottomNavItem(index, 'down')}
                        disabled={index === config.bottomNav.length - 1}
                        className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-25 cursor-pointer rounded hover:bg-stone-200"
                        title="नीचे ले जाएं"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                      {getIconComponent(item.icon)}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateBottomNavLabel(item.id, e.target.value)}
                        className="font-bold text-xs text-stone-900 bg-white border border-stone-200 px-2 py-1 rounded-lg focus:outline-none focus:border-[#EA580C] w-28"
                        placeholder="बटन का नाम"
                      />
                      <span className="block text-[10px] font-mono text-stone-400 mt-0.5">
                        ID: {item.id} • Path: {item.href}
                      </span>
                    </div>
                  </div>

                  {/* Right: Toggle Switch Button */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-extrabold ${
                        item.enabled ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    >
                      {item.enabled ? 'सक्रिय' : 'बंद'}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleBottomNavItem(item.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.enabled ? 'bg-[#EA580C]' : 'bg-stone-300'
                      }`}
                      role="switch"
                      aria-checked={item.enabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Top Header Buttons */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Menu className="w-4 h-4 text-purple-600" />
                <span>2. शीर्ष हेडर बार बटन (Top Header Buttons)</span>
              </h2>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                मोबाइल हेडर के दोनों कोनों पर दिखने वाले बटनों को नियंत्रित करें
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Menu Button */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2.5">
                  <Menu className="w-4 h-4 text-stone-700" />
                  <div>
                    <span className="block text-xs font-black text-stone-900">मेन्यू बटन</span>
                    <span className="block text-[10px] text-stone-400">हैमबर्गर मेन्यू आइकन</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleHeaderButton('menuButton')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.header.menuButton ? 'bg-purple-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.header.menuButton ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* ePaper Badge */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2.5">
                  <Newspaper className="w-4 h-4 text-[#EA580C]" />
                  <div>
                    <span className="block text-xs font-black text-stone-900">ई-पेपर शॉर्टकट</span>
                    <span className="block text-[10px] text-stone-400">हेडर में ई-पेपर पिल बैज</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleHeaderButton('epaperBadge')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.header.epaperBadge ? 'bg-[#EA580C]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.header.epaperBadge ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Search Button */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="block text-xs font-black text-stone-900">खोजें (सर्च) बटन</span>
                    <span className="block text-[10px] text-stone-400">सर्च बार खोलने का आइकन</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleHeaderButton('searchButton')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.header.searchButton ? 'bg-blue-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.header.searchButton ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Share Button */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="block text-xs font-black text-stone-900">शेयर ऐप बटन</span>
                    <span className="block text-[10px] text-stone-400">व्हाट्सएप/सोशल शेयरिंग</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleHeaderButton('shareButton')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.header.shareButton ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.header.shareButton ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: Side Drawer Items */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Grid className="w-4 h-4 text-amber-600" />
                <span>3. स्लाइडर ड्रॉअर मेनू (Side Drawer Sections)</span>
              </h2>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                मेन्यू पर टैप करने पर खुलने वाले साइड पैनल के विभिन्न सेक्शंस को ऑन/ऑफ करें
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-black text-stone-900">होमपेज लिंक</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDrawerItem('homeLink')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.drawer.homeLink ? 'bg-[#EA580C]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.drawer.homeLink ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-black text-stone-900">डिजिटल ई-पेपर लिंक</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDrawerItem('epaperLink')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.drawer.epaperLink ? 'bg-[#EA580C]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.drawer.epaperLink ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-black text-stone-900">वीडियो बुलेटिन लिंक</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDrawerItem('videoLink')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.drawer.videoLink ? 'bg-[#EA580C]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.drawer.videoLink ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#EA580C]" />
                  <span className="text-xs font-black text-stone-900">जिला समाचार ग्रिड</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDrawerItem('showDistricts')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.drawer.showDistricts ? 'bg-[#EA580C]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.drawer.showDistricts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-black text-stone-900">सभी श्रेणियां सूची</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDrawerItem('showCategories')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.drawer.showCategories ? 'bg-[#EA580C]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.drawer.showCategories ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-black text-stone-900">डेस्कटॉप वर्ज़न स्विच</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDrawerItem('showDesktopSwitch')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.drawer.showDesktopSwitch ? 'bg-[#EA580C]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.drawer.showDesktopSwitch ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-black text-stone-900">संपर्क व सोशल लिंक्स</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDrawerItem('showContact')}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.drawer.showContact ? 'bg-[#EA580C]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                      config.drawer.showContact ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Preview Widget (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#EA580C]" />
                <span>लाइव मोबाइल स्क्रीन प्रीव्यू (Live Preview)</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                रियल-टाइम
              </span>
            </div>

            {/* Mobile Device Frame Mockup */}
            <div className="mx-auto w-[280px] sm:w-[300px] h-[520px] bg-stone-100 rounded-[36px] p-2.5 shadow-2xl border-[5px] border-stone-800 flex flex-col justify-between overflow-hidden relative">
              {/* Top Speaker / Camera Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-stone-800 rounded-full z-30" />

              {/* Mobile Screen Header */}
              <div className="bg-white pt-5 pb-2 px-2.5 border-b border-stone-200 flex items-center justify-between shadow-2xs z-20">
                <div className="flex items-center gap-1">
                  {config.header.menuButton && (
                    <button
                      type="button"
                      onClick={() => setPreviewDrawerOpen(!previewDrawerOpen)}
                      className="p-1 text-stone-700 hover:text-stone-950 rounded-full hover:bg-stone-100"
                    >
                      <Menu className="w-4 h-4" />
                    </button>
                  )}
                  {config.header.epaperBadge && (
                    <span className="bg-orange-50 text-[#C2410C] font-black text-[9px] px-1.5 py-0.5 rounded-full border border-orange-200">
                      ई-पेपर
                    </span>
                  )}
                </div>

                <div className="font-black text-xs text-stone-900 tracking-tight">
                  दैनिक मान्यवर
                </div>

                <div className="flex items-center gap-1">
                  {config.header.searchButton && (
                    <Search className="w-3.5 h-3.5 text-stone-600" />
                  )}
                  {config.header.shareButton && (
                    <Share2 className="w-3.5 h-3.5 text-stone-600" />
                  )}
                </div>
              </div>

              {/* Center Feed Area */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto relative">
                {previewDrawerOpen ? (
                  <div className="absolute inset-0 bg-white z-20 p-3 space-y-2 text-[10px] font-bold text-stone-700">
                    <div className="flex justify-between items-center border-b pb-1 font-black text-stone-900">
                      <span>साइड मेन्यू (Drawer)</span>
                      <button
                        type="button"
                        onClick={() => setPreviewDrawerOpen(false)}
                        className="text-red-600"
                      >
                        ✕ बंद
                      </button>
                    </div>
                    {config.drawer.homeLink && <div>🏠 होमपेज</div>}
                    {config.drawer.epaperLink && <div>📰 डिजिटल ई-पेपर</div>}
                    {config.drawer.videoLink && <div>🎥 वीडियो बुलेटिन</div>}
                    {config.drawer.showDistricts && (
                      <div className="pt-1 text-orange-700">📍 जिला समाचार सेक्शन</div>
                    )}
                    {config.drawer.showCategories && (
                      <div className="pt-1 text-stone-500">📂 श्रेणियां मेन्यू</div>
                    )}
                    {config.drawer.showDesktopSwitch && (
                      <div className="pt-1 text-stone-400">🖥️ डेस्कटॉप वर्ज़न</div>
                    )}
                    {config.drawer.showContact && (
                      <div className="pt-1 text-stone-400">📞 संपर्क व सोशल</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                      <div className="h-2 w-12 bg-orange-200 rounded" />
                      <div className="h-3 w-4/5 bg-stone-800 rounded" />
                      <div className="h-2 w-1/2 bg-stone-300 rounded" />
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                      <div className="h-2 w-14 bg-stone-200 rounded" />
                      <div className="h-3 w-full bg-stone-800 rounded" />
                      <div className="h-2 w-2/3 bg-stone-300 rounded" />
                    </div>
                    <div className="text-center pt-2">
                      <span className="text-[10px] text-stone-400 font-semibold">
                        (होमपेज समाचार फ़ीड)
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Navigation Bar Mockup */}
              <div className="bg-white border-t border-stone-200 px-1 py-1 shadow-md z-20">
                <div className="flex items-center justify-around">
                  {config.bottomNav
                    .filter((item) => item.enabled)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-center gap-0.5 py-0.5 text-[8px] font-black text-stone-700"
                      >
                        <div className="w-3.5 h-3.5 flex items-center justify-center">
                          {getIconComponent(item.icon)}
                        </div>
                        <span className="truncate max-w-[42px]">{item.label}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-1">
              <p className="text-[11px] text-stone-500 font-medium">
                कुल <strong>{config.bottomNav.filter((b) => b.enabled).length}</strong> बटन नीचे बार में दिखेंगे।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
