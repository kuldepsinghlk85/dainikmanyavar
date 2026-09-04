'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Save, CheckCircle2, Upload, Image as ImageIcon, Trash2, RefreshCw, Link as LinkIcon } from 'lucide-react';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState({
    site_name: 'दैनिक मान्यवर',
    site_subtitle: 'सच के साथ... समाज के लिए...',
    site_logo: '/logo.png',
    whatsapp_number: '+91 93361 81297',
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

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [useBannerUrl, setUseBannerUrl] = useState(false);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [useLogoUrl, setUseLogoUrl] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'त्योहार');
      formData.append('caption', settings.festival_banner_title || 'त्योहार विश बैनर');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        handleChange('festival_banner_image', data.url);
      } else {
        alert(data.error || 'अपलोड में त्रुटि हुई');
      }
    } catch (err) {
      alert('इमेज अपलोड करने में समस्या आई');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'लोगो');
      formData.append('caption', 'पोर्टल मुख्य लोगो');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        handleChange('site_logo', data.url);
      } else {
        alert(data.error || 'अपलोड में त्रुटि हुई');
      }
    } catch (err) {
      alert('लोगो अपलोड करने में समस्या आई');
    } finally {
      setUploadingLogo(false);
    }
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
    <div className="space-y-6 max-w-4xl">
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
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#C2410C] font-extrabold text-sm border-b border-orange-200 pb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2>दैनिक पर्व/त्योहार विश बैनर (Header Festival Wish Banner - GIF/Image)</h2>
          </div>

          <p className="text-xs text-stone-600">
            विशेष अवसरों (जैसे रक्षाबंधन, जन्माष्टमी, स्वतंत्रता दिवस, दिवाली) के लिए हेडर में विश बैनर/GIF प्रदर्शित करें:
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">शुभकामना संदेश (Wish Message Title)</label>
              <input
                type="text"
                value={settings.festival_banner_title}
                onChange={(e) => handleChange('festival_banner_title', e.target.value)}
                placeholder="उदा. 🎁 जन्माष्टमी पर्व की हार्दिक शुभकामनाएं! | दैनिक मान्यवर परिवार"
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white font-bold text-stone-900"
              />
            </div>

            {/* Festival Banner Image/GIF Uploader */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-stone-800">
                  GIF / इमेज बैनर (Banner Image / Animated GIF) *
                </label>
                <button
                  type="button"
                  onClick={() => setUseBannerUrl(!useBannerUrl)}
                  className="text-[11px] text-[#EA580C] hover:underline font-bold cursor-pointer"
                >
                  {useBannerUrl ? '📁 फ़ाइल अपलोड बॉक्स का उपयोग करें' : '🔗 URL द्वारा जोड़ें'}
                </button>
              </div>

              {!useBannerUrl ? (
                <div>
                  {settings.festival_banner_image ? (
                    <div className="p-3 bg-white border-2 border-dashed border-green-500 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={settings.festival_banner_image}
                          alt="Festival Banner"
                          className="w-20 h-16 object-contain bg-stone-100 rounded-xl border border-stone-200 shadow-xs"
                        />
                        <div>
                          <p className="text-xs font-black text-stone-900 font-mono line-clamp-1">
                            {settings.festival_banner_image.split('/').pop()}
                          </p>
                          <p className="text-[10px] text-green-600 font-bold mt-0.5">✓ विश बैनर सक्रिय है</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-[#C2410C] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          बदलें
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('festival_banner_image', '')}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          हटाएं
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-[#EA580C] bg-white hover:bg-orange-50/30 p-6 rounded-2xl text-center space-y-2 cursor-pointer transition-all"
                    >
                      <Upload className="w-8 h-8 text-[#EA580C] mx-auto" />
                      <div>
                        <p className="text-xs font-black text-stone-900">
                          {uploadingBanner ? 'अपलोड हो रहा है...' : 'यहाँ क्लिक करें या त्योहार विश इमेज/GIF चुनें (Choose File)'}
                        </p>
                        <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                          समर्थित प्रारूप: GIF, PNG, JPG, JPEG, WebP (एनिमेटेड GIF समर्थित)
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/gif, image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleBannerFileUpload}
                  />
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={settings.festival_banner_image}
                    onChange={(e) => handleChange('festival_banner_image', e.target.value)}
                    placeholder="https://domain.com/wish-banner.gif"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white font-mono"
                  />
                  {settings.festival_banner_image && (
                    <div className="mt-2 p-2 bg-white border rounded-xl flex items-center gap-3">
                      <img src={settings.festival_banner_image} alt="Preview" className="w-16 h-12 object-contain rounded" />
                      <span className="text-[10px] text-stone-500 font-mono">इमेज प्रिव्यू</span>
                    </div>
                  )}
                </div>
              )}

              {/* Live Header Banner Preview Simulator */}
              {settings.festival_banner_image && (
                <div className="mt-3 p-3 bg-stone-900 rounded-2xl border border-stone-800 space-y-1.5">
                  <p className="text-[10px] font-mono text-stone-400">वेबसाइट हेडर में ऐसा दिखेगा (Live Header Simulator):</p>
                  <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white px-3.5 py-1.5 rounded-xl shadow-xs border border-orange-400 max-w-sm h-[52px]">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/20">
                      <img
                        src={settings.festival_banner_image}
                        alt="Festival Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[9px] uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.2 rounded-full w-fit mb-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-yellow-200 animate-pulse" />
                        <span>विशेष पर्व संदेश</span>
                      </div>
                      <p className="text-[11px] font-bold leading-tight line-clamp-2 drop-shadow-sm">
                        {settings.festival_banner_title || 'पर्व की हार्दिक शुभकामनाएं!'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">टारगेट लिंक (Link URL)</label>
                <input
                  type="text"
                  value={settings.festival_banner_link}
                  onChange={(e) => handleChange('festival_banner_link', e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">बैनर स्थिति (Status)</label>
                <select
                  value={settings.festival_banner_enabled}
                  onChange={(e) => handleChange('festival_banner_enabled', e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white font-bold text-green-700"
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

          {/* Portal Logo Uploader */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-xs font-bold text-stone-900">
                  पोर्टल मुख्य लोगो (Portal Main Header Logo)
                </label>
                <p className="text-[11px] text-stone-500">
                  हैडर में प्रदर्शित होने वाला आधिकारिक लोगो (पारदर्शी PNG सर्वोत्तम है)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseLogoUrl(!useLogoUrl)}
                className="text-[11px] text-[#EA580C] hover:underline font-bold cursor-pointer"
              >
                {useLogoUrl ? '📁 फ़ाइल चुनें' : '🔗 URL दर्ज करें'}
              </button>
            </div>

            {!useLogoUrl ? (
              <div>
                {settings.site_logo ? (
                  <div className="p-3 bg-white border border-stone-300 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center">
                        <img
                          src={settings.site_logo}
                          alt="Logo Preview"
                          className="h-10 max-w-[140px] object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800 font-mono line-clamp-1">
                          {settings.site_logo.split('/').pop()}
                        </p>
                        <p className="text-[10px] text-green-600 font-bold">✓ वर्तमान सक्रिय लोगो</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-[#C2410C] rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        नया लोगो अपलोड करें
                      </button>
                      {settings.site_logo !== '/logo.png' && (
                        <button
                          type="button"
                          onClick={() => handleChange('site_logo', '/logo.png')}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          डिफ़ॉल्ट रिसेट
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-[#EA580C] bg-white hover:bg-orange-50/20 p-5 rounded-xl text-center space-y-2 cursor-pointer transition-all"
                  >
                    <Upload className="w-6 h-6 text-[#EA580C] mx-auto" />
                    <p className="text-xs font-bold text-stone-800">
                      {uploadingLogo ? 'लोगो अपलोड हो रहा है...' : 'यहाँ क्लिक करके नया लोगो अपलोड करें (Upload Logo)'}
                    </p>
                    <p className="text-[10px] text-stone-500">समर्थित फॉर्मेट: PNG, WebP, SVG, JPG (अनुशंसित आकार: 460×100 px)</p>
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  className="hidden"
                  onChange={handleLogoFileUpload}
                />
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={settings.site_logo}
                  onChange={(e) => handleChange('site_logo', e.target.value)}
                  placeholder="https://domain.com/logo.png या /logo.png"
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white font-mono"
                />
                {settings.site_logo && (
                  <div className="mt-2 p-2 bg-white border rounded-xl flex items-center gap-3">
                    <img src={settings.site_logo} alt="Logo" className="h-8 object-contain" />
                    <span className="text-[10px] text-stone-500 font-mono">लोगो प्रिव्यू</span>
                  </div>
                )}
              </div>
            )}
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
