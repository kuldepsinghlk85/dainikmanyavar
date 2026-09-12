'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Flame,
  Upload,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Film,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Globe,
  Sliders,
  Play,
  Volume2,
  RefreshCw,
} from 'lucide-react';
import { DEFAULT_FESTIVE_CONFIG, FestiveCard, FestiveConfig } from '@/lib/festive';
import SanatanSpecialSection from '@/components/public/SanatanSpecialSection';

export default function FestiveAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const [config, setConfig] = useState<FestiveConfig>(DEFAULT_FESTIVE_CONFIG);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load existing config
  useEffect(() => {
    fetch('/api/admin/festive')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setConfig(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load festive settings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (customConfig?: FestiveConfig) => {
    const dataToSave = customConfig || config;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/festive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({
          text: dataToSave.enabled
            ? '✅ सेटिंग्स सफलतापूर्वक सुरक्षित कर दी गईं! फेस्टिव सेक्शन लाइव सक्रिय है।'
            : '🔒 सेटिंग्स सुरक्षित! फेस्टिव सेक्शन होमपेज से हटा दिया गया है।',
          type: 'success',
        });
        setConfig(dataToSave);
      } else {
        setMessage({ text: json.error || 'सेव करने में त्रुटि हुई', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'नेटवर्क त्रुटि', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleToggleEnabled = () => {
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    handleSave(updated);
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'क्या आप वाकई वर्तमान सेटिंग्स को रीसेट करके मूल प्रोटोटाइप (श्रीकृष्ण जन्माष्टमी व सनातन विशेष) को लागू करना चाहते हैं?'
      )
    ) {
      const restored = { ...DEFAULT_FESTIVE_CONFIG, enabled: config.enabled };
      setConfig(restored);
      handleSave(restored);
    }
  };

  // Upload handler for card media (image or video)
  const handleCardFileUpload = async (file: File, index: number) => {
    if (!file) return;
    setUploadingIndex(index);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'फेस्टिव');
    formData.append('caption', `Festive Media Card ${index + 1}`);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm');
        const updatedCards = [...config.cards];
        updatedCards[index] = {
          ...updatedCards[index],
          mediaUrl: data.url,
          type: isVideo ? 'video' : 'image',
        };
        setConfig({ ...config, cards: updatedCards });
        setMessage({ text: 'मीडिया फाइल सफलतापूर्वक अपलोड हो गई!', type: 'success' });
      } else {
        setMessage({ text: data.error || 'अपलोड विफल रहा', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'अपलोड में त्रुटि', type: 'error' });
    } finally {
      setUploadingIndex(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Upload handler for Fullscreen Poster Lightbox Image
  const handlePosterFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingPoster(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'फेस्टिव_पोस्टर');
    formData.append('caption', 'Festive Lightbox Poster');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setConfig({ ...config, posterModalImage: data.url });
        setMessage({ text: 'फुल पोस्टर इमेज सफलतापूर्वक अपलोड हो गई!', type: 'success' });
      } else {
        setMessage({ text: data.error || 'अपलोड विफल रहा', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'अपलोड में त्रुटि', type: 'error' });
    } finally {
      setUploadingPoster(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleCardChange = (index: number, field: keyof FestiveCard, value: any) => {
    const updatedCards = [...config.cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setConfig({ ...config, cards: updatedCards });
  };

  const handleAddCard = () => {
    const newCard: FestiveCard = {
      id: `card-${Date.now()}`,
      type: 'image',
      mediaUrl: '/imgg.jpg',
      badge: 'विशेष',
      badgeIcon: '✨',
      tag: 'नया अपडेट',
      title: 'दैनिक मान्यवर विशेष प्रस्तुति',
      subtitle: 'समाचार, संस्कृति और निष्पक्ष पत्रकारिता का डिजिटल संगम...',
      footerText: '📱 QR कोड स्कैन कर वेबसाइट देखें',
      linkUrl: '',
      linkText: 'विस्तार से',
    };
    setConfig({ ...config, cards: [...config.cards, newCard] });
  };

  const handleRemoveCard = (index: number) => {
    if (config.cards.length <= 1) {
      alert('कम से कम 1 कार्ड होना आवश्यक है');
      return;
    }
    const updated = config.cards.filter((_, i) => i !== index);
    setConfig({ ...config, cards: updated });
  };

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.cards.length) return;

    const updated = [...config.cards];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setConfig({ ...config, cards: updated });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-stone-600">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
          <span className="font-semibold text-lg">फेस्टिव अपलोडर लोड हो रहा है...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>विशेष कमर्शियल / फेस्टिव मॉड्यूल (CMS)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2.5">
            <span>फेस्टिव अपलोडर व कमर्शियल शोकेस</span>
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            होमपेज पर चलने वाले फेस्टिव बैनर, वीडियो रील्स व स्पेशल पोस्टर्स को नियंत्रित व अपलोड करें।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Homepage link */}
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 shadow-sm transition"
          >
            <Globe className="w-4 h-4 text-stone-500" />
            <span>होमपेज देखें</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          {/* Reset Defaults button */}
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 transition shadow-sm"
            title="मूल श्रीकृष्ण जन्माष्टमी व सनातन प्रोटोटाइप रीस्टोर करें"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>डिफ़ॉल्ट प्रोटोटाइप रीस्टोर</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md hover:shadow transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>सुरक्षित हो रहा है...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>परिवर्तन सुरक्षित करें</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Feedback Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all shadow-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-red-50 border border-red-300 text-red-900'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* MASTER ENABLE / DISABLE HERO CARD */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border-2 transition-all shadow-sm ${
          config.enabled
            ? 'bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 border-emerald-500/50 text-white'
            : 'bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-red-500/50 text-stone-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  config.enabled ? 'bg-emerald-400 animate-ping' : 'bg-red-500'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                फेस्टिव सेक्शन स्थिति (Status)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <span>{config.enabled ? '🟢 लाइव सक्रिय (ACTIVE ON HOMEPAGE)' : '🔴 निष्क्रिय (DISABLED / OFF)'}</span>
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
              {config.enabled
                ? 'यह कमर्शियल व फेस्टिव शोकेस होमपेज के टॉप पर सभी पाठकों को प्रदर्शित हो रहा है।'
                : 'यह सेक्शन वर्तमान में बंद है। होमपेज पर पाठकों को कुछ भी नहीं दिखेगा।'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleEnabled}
              className={`px-5 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 cursor-pointer ${
                config.enabled
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{config.enabled ? 'सेक्शन बंद करें (Turn OFF)' : 'सेक्शन चालू करें (Turn ON)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB SWITCHER: Editor vs Live Preview */}
      <div className="flex items-center border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'editor'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>अपलोडर व सेटिंग्स एडिटर</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'preview'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>लाइव प्रीव्यू (Interactive Preview)</span>
        </button>
      </div>

      {/* TAB 1: EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* SECTION 1: HEADER & BANNER DETAILS */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>1. मुख्य शीर्षक एवं हेडर सेटिंग्स (Header Details)</span>
              </h3>
              <span className="text-xs text-stone-500 font-medium">बैनर के ऊपरी भाग की ब्रांडिंग</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  हेडर टैग आइकन / इमोजी
                </label>
                <input
                  type="text"
                  value={config.headerTagIcon || '✨'}
                  onChange={(e) => setConfig({ ...config, headerTagIcon: e.target.value })}
                  placeholder="✨ या 🕉️ या 🌻"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  हेडर टैग टेक्स्ट
                </label>
                <input
                  type="text"
                  value={config.headerTag}
                  onChange={(e) => setConfig({ ...config, headerTag: e.target.value })}
                  placeholder="श्रीकृष्ण जन्माष्टमी एवं लॉन्च विशेष"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ब्रांड नाम (Prefix)
                </label>
                <input
                  type="text"
                  value={config.brandPrefix}
                  onChange={(e) => setConfig({ ...config, brandPrefix: e.target.value })}
                  placeholder="दैनिक मान्यवर"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  मुख्य शीर्षक (Main Title)
                </label>
                <input
                  type="text"
                  value={config.mainTitle}
                  onChange={(e) => setConfig({ ...config, mainTitle: e.target.value })}
                  placeholder="लॉन्च एवं सनातन विशेष"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                उप-शीर्षक / विवरण (Subtitle / Slogan)
              </label>
              <textarea
                rows={2}
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                placeholder="इस पावन अवसर पर आपके अपने समाचार पत्र का नया डिजिटल अवतार..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Lightbox / Full Poster Upload */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>बड़ा पोस्टर (Lightbox Zoom Modal Image)</span>
                </h4>
                <p className="text-[11px] text-amber-700">
                  पाठक जब &quot;बड़ा पोस्टर देखें&quot; पर क्लिक करेंगे, तब यह इमेज फुल स्क्रीन में खुलेगी।
                </p>
                <p className="text-[11px] text-stone-600 font-mono break-all">
                  वर्तमान: {config.posterModalImage || '/imgg.jpg'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={posterFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePosterFileUpload(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => posterFileInputRef.current?.click()}
                  disabled={uploadingPoster}
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPoster ? 'अपलोड हो रहा है...' : 'नया पोस्टर अपलोड करें'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: CARDS & REELS MANAGER */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                  <Film className="w-4 h-4 text-orange-600" />
                  <span>2. कार्ड्स एवं वीडियो रील्स प्रबंधक ({config.cards.length} कार्ड्स)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  प्रोटोटाइप के अनुसार सामान्यतः 3 कार्ड्स (1 पोस्टर + 2 वीडियो रील्स) सबसे आकर्षक दिखते हैं।
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नया कार्ड जोड़ें</span>
              </button>
            </div>

            {/* List of Cards */}
            <div className="space-y-6">
              {config.cards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="p-4 sm:p-5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-4 transition hover:border-amber-400/80"
                >
                  {/* Card Header Bar */}
                  <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-sm text-stone-800">
                        कार्ड #{idx + 1}: {card.title || 'शीर्षक विहीन'}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          card.type === 'video'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {card.type === 'video' ? '🎥 वीडियो रील' : '🖼️ पोस्टर फोटो'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveCard(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white hover:bg-stone-200 text-stone-600 disabled:opacity-30 border border-stone-200"
                        title="ऊपर ले जाएं"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCard(idx, 'down')}
                        disabled={idx === config.cards.length - 1}
                        className="p-1 rounded bg-white hover:bg-stone-200 text-stone-600 disabled:opacity-30 border border-stone-200"
                        title="नीचे ले जाएं"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(idx)}
                        className="p-1 rounded bg-white hover:bg-red-50 text-red-600 border border-stone-200 hover:border-red-300"
                        title="कार्ड हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Form Body */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Media Preview & File Upload */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-700">
                        मीडिया फाइल (फोटो या वीडियो)
                      </label>
                      <div className="relative h-44 rounded-xl overflow-hidden bg-black/90 border border-stone-300 flex items-center justify-center group">
                        {card.type === 'video' ? (
                          <video
                            src={card.mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={card.mediaUrl}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Hover Overlay with Upload Button */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[idx]?.click()}
                            disabled={uploadingIndex === idx}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {uploadingIndex === idx ? 'अपलोड हो रहा है...' : 'फाइल बदलें / अपलोड'}
                            </span>
                          </button>
                          <span className="text-[10px] text-stone-300 mt-1">
                            {card.type === 'video' ? 'MP4, WebM (वीडियो)' : 'JPG, PNG, WebP (इमेज)'}
                          </span>
                        </div>
                      </div>

                      {/* Hidden File Picker */}
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[idx] = el;
                        }}
                        accept={card.type === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCardFileUpload(file, idx);
                        }}
                      />

                      <div className="flex items-center gap-2">
                        {/* Type Toggle */}
                        <select
                          value={card.type}
                          onChange={(e) =>
                            handleCardChange(idx, 'type', e.target.value as 'image' | 'video')
                          }
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-semibold"
                        >
                          <option value="image">🖼️ पोस्टर इमेज</option>
                          <option value="video">🎥 वीडियो रील (MP4)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[idx]?.click()}
                          disabled={uploadingIndex === idx}
                          className="flex-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{uploadingIndex === idx ? '...' : 'अपलोड'}</span>
                        </button>
                      </div>

                      {/* URL input */}
                      <div>
                        <input
                          type="text"
                          value={card.mediaUrl}
                          onChange={(e) => handleCardChange(idx, 'mediaUrl', e.target.value)}
                          placeholder="/imgg.jpg या /sanatan1.mp4"
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-300 text-stone-600 font-mono"
                        />
                      </div>
                    </div>

                    {/* Middle Inputs: Badges & Tags */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            बैज 1 आइकन/इमोजी
                          </label>
                          <input
                            type="text"
                            value={card.badgeIcon || ''}
                            onChange={(e) => handleCardChange(idx, 'badgeIcon', e.target.value)}
                            placeholder="🔥 या 🦚 या 🔱"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            बैज 1 टेक्स्ट
                          </label>
                          <input
                            type="text"
                            value={card.badge}
                            onChange={(e) => handleCardChange(idx, 'badge', e.target.value)}
                            placeholder="लॉन्च या श्रीकृष्ण जन्मोत्सव"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          टैग / बैज 2 (राइट साइड)
                        </label>
                        <input
                          type="text"
                          value={card.tag}
                          onChange={(e) => handleCardChange(idx, 'tag', e.target.value)}
                          placeholder="आधिकारिक घोषणा या सनातन रील #1"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          कार्ड मुख्य शीर्षक (Title)
                        </label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => handleCardChange(idx, 'title', e.target.value)}
                          placeholder="दैनिक मान्यवर का लॉन्च"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 font-bold"
                        />
                      </div>
                    </div>

                    {/* Right Inputs: Description & Links */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          विवरण (Subtitle / Description)
                        </label>
                        <textarea
                          rows={2}
                          value={card.subtitle}
                          onChange={(e) => handleCardChange(idx, 'subtitle', e.target.value)}
                          placeholder="नई सोच, नई ऊर्जा और नए संकल्प के साथ..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300"
                        />
                      </div>

                      {card.type === 'image' && (
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            फ़ुटर हिंट टेक्स्ट
                          </label>
                          <input
                            type="text"
                            value={card.footerText || ''}
                            onChange={(e) => handleCardChange(idx, 'footerText', e.target.value)}
                            placeholder="📱 QR कोड स्कैन कर वेबसाइट देखें"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            कस्टम लिंक URL (वैकल्पिक)
                          </label>
                          <input
                            type="text"
                            value={card.linkUrl || ''}
                            onChange={(e) => handleCardChange(idx, 'linkUrl', e.target.value)}
                            placeholder="खाली रखें (ज़ूम के लिए) या https://..."
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            बटन टेक्स्ट
                          </label>
                          <input
                            type="text"
                            value={card.linkText || ''}
                            onChange={(e) => handleCardChange(idx, 'linkText', e.target.value)}
                            placeholder="विस्तार से"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: BOTTOM TICKER & BRAND PLEDGE */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Globe className="w-4 h-4 text-stone-700" />
              <span>3. बॉटम टिकर एवं ब्रांड प्रतिज्ञा (Footer Ticker Details)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ब्रांड स्लोगन / प्रतिज्ञा
                </label>
                <input
                  type="text"
                  value={config.tickerText}
                  onChange={(e) => setConfig({ ...config, tickerText: e.target.value })}
                  placeholder="दैनिक मान्यवर - निष्पक्ष, निर्भीक, जन-सरोकारों को समर्पित पत्रकारिता"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  संपादकीय कार्यालय
                </label>
                <input
                  type="text"
                  value={config.tickerOffice}
                  onChange={(e) => setConfig({ ...config, tickerOffice: e.target.value })}
                  placeholder="जौनपुर / लखनऊ"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Sticky Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-bold transition"
            >
              रीसेट करें
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'सुरक्षित हो रहा है...' : 'परिवर्तन सुरक्षित करें'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-700" />
              <span>यह लाइव इंटरएक्टिव प्रीव्यू है। आप वीडियो रील्स, ऑडियो और ज़ूम बटन को टेस्ट कर सकते हैं।</span>
            </div>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition"
            >
              {saving ? 'सुरक्षित हो रहा है...' : 'अभी लाइव लागू करें'}
            </button>
          </div>

          {/* Interactive Component Render */}
          <div className="rounded-3xl border border-stone-300 bg-stone-900 p-2 sm:p-4 shadow-2xl">
            <SanatanSpecialSection config={{ ...config, enabled: true }} />
          </div>
        </div>
      )}
    </div>
  );
}
