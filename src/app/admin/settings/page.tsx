'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState({
    site_name: 'दैनिक मान्यवर',
    site_subtitle: 'सच के साथ... समाज के लिए...',
    whatsapp_number: '+91 93352 48009',
    contact_email: 'info@dainikmanyawar.in',
    contact_address: 'जौनपुर, उत्तर प्रदेश, भारत',
    tts_provider: 'web_speech',
    festival_banner_enabled: 'true',
    festival_banner_title: '🎁 रक्षाबंधन पर्व की हार्दिक शुभकामनाएं! | दैनिक मान्यवर परिवार',
    festival_banner_image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    festival_banner_link: '#',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('साइट सेटिंग्स सफलता से सुरक्षित की गईं!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {}
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">साइट सेटिंग्स (Site Settings)</h1>
        <p className="text-xs text-stone-500">पोर्टल का नाम, दैनिक पर्व/त्योहार विश बैनर, संपर्क विवरण और TTS सेटिंग्स</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Header Festival Wish Banner Settings (GIF / Image Upload) */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#C2410C] font-extrabold text-sm border-b border-orange-200 pb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2>दैनिक पर्व/त्योहार विश बैनर (Header Festival Wish Banner - GIF/Image)</h2>
          </div>

          <p className="text-xs text-stone-600">
            विशेष अवसरों (जैसे रक्षाबंधन, स्वतंत्रता दिवस, दिवाली) के लिए हेडर में विश बैनर/GIF प्रदर्शित करें:
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">शुभकामना संदेश (Wish Message Title)</label>
              <input
                type="text"
                value={settings.festival_banner_title}
                onChange={(e) => handleChange('festival_banner_title', e.target.value)}
                placeholder="उदा. 🎁 रक्षाबंधन पर्व की हार्दिक शुभकामनाएं!"
                className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">GIF / इमेज बैनर URL (Banner Image/GIF URL)</label>
              <input
                type="text"
                value={settings.festival_banner_image}
                onChange={(e) => handleChange('festival_banner_image', e.target.value)}
                placeholder="https://domain.com/wish-banner.gif"
                className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">टारगेट लिंक (Link URL)</label>
                <input
                  type="text"
                  value={settings.festival_banner_link}
                  onChange={(e) => handleChange('festival_banner_link', e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">बैनर स्थिति (Status)</label>
                <select
                  value={settings.festival_banner_enabled}
                  onChange={(e) => handleChange('festival_banner_enabled', e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white font-bold text-green-700"
                >
                  <option value="true">सक्रिय (Active - Show on Header)</option>
                  <option value="false">निष्क्रिय (Inactive)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">सामान्य सेटिंग्स</h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">पोर्टल का नाम (Site Name)</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => handleChange('site_name', e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">टैगलाइन / सब-टाइटल</label>
            <input
              type="text"
              value={settings.site_subtitle}
              onChange={(e) => handleChange('site_subtitle', e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp संपर्क नंबर</label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">संपर्क ईमेल (Contact Email)</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">TTS प्रदाता (Audio TTS Provider)</label>
            <select
              value={settings.tts_provider}
              onChange={(e) => handleChange('tts_provider', e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm"
            >
              <option value="web_speech">Web Speech Synthesis API (Default)</option>
              <option value="google">Google Cloud Text-to-Speech API</option>
              <option value="azure">Azure Neural Speech</option>
              <option value="elevenlabs">ElevenLabs Hindi TTS</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'सुरक्षित हो रहा है...' : 'सेटिंग्स सुरक्षित करें'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
