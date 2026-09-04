'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Clock,
  Sparkles,
  Megaphone,
  Newspaper,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'NEWS_TIP', label: '📰 समाचार / खबर की सूचना दें', desc: 'कोई बड़ी खबर, प्रेस नोट या घटना का विवरण साझा करें' },
  { id: 'ADVERTISEMENT', label: '📢 विज्ञापन के लिए संपर्क करें', desc: 'प्रिंट, ई-पेपर अथवा डिजिटल पोर्टल पर विज्ञापन हेतु' },
  { id: 'CAREER', label: '💼 पत्रकारिता / रिपोर्टर आवेदन', desc: 'ज़िला, तहसील व ब्लॉक स्तर पर संवाददाता बनने हेतु' },
  { id: 'EDITORIAL', label: '✍️ संपादकीय / लेख / विचार', desc: 'अपना आलेख, कविता, विचार या विशेष टिप्पणी भेजें' },
  { id: 'GRIEVANCE', label: '⚖️ शिकायत / सुधार / खंडन', desc: 'प्रकाशित खबर पर कोई आपत्ति या तथ्य सुधार अनुरोध' },
  { id: 'GENERAL', label: '❓ सामान्य पूछताछ / अन्य', desc: 'किसी भी अन्य सहायता या जानकारी के लिए' },
];

const CATEGORY_BANNERS: Record<string, { title: string; subtitle: string; icon: any; color: string }> = {
  ADVERTISEMENT: {
    title: '📢 विज्ञापन के लिए संपर्क करें (Advertise With Us)',
    subtitle: 'दैनिक मान्यवर के लाखों डिजिटल पाठकों एवं ई-पेपर तक अपने व्यापार, संस्था अथवा ब्रांड का प्रचार पहुँचाएं।',
    icon: Megaphone,
    color: 'from-amber-600 to-orange-700',
  },
  NEWS_TIP: {
    title: '📰 समाचार / खबर की सूचना दें (Send News Scoop)',
    subtitle: 'अपने क्षेत्र, ज़िले अथवा समाज से जुड़ी कोई भी महत्वपूर्ण खबर, जनसमस्या या प्रेस नोट हमारे न्यूज़डेस्क को भेजें।',
    icon: Newspaper,
    color: 'from-red-600 to-rose-800',
  },
  CAREER: {
    title: '💼 पत्रकारिता एवं रिपोर्टर आवेदन (Join As Reporter)',
    subtitle: 'दैनिक मान्यवर डिजिटल नेटवर्क के साथ जुड़कर पत्रकारिता में अपना भविष्य बनाएं। अपने ज़िले से प्रतिनिधि बनें।',
    icon: Briefcase,
    color: 'from-emerald-600 to-teal-800',
  },
  DEFAULT: {
    title: 'संपर्क करें (Contact Us)',
    subtitle: 'दैनिक मान्यवर की संपादकीय टीम, विज्ञापन विभाग या पाठक सेवा प्रकोष्ठ से सीधे जुड़ें।',
    icon: MessageSquare,
    color: 'from-[#EA580C] to-[#C2410C]',
  },
};

export default function ContactForm() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    category: 'NEWS_TIP',
    subject: '',
    message: '',
  });

  // Pre-select category if provided in URL (e.g. /contact?category=ADVERTISEMENT)
  useEffect(() => {
    if (initialCategory && CATEGORIES.some((c) => c.id === initialCategory)) {
      setFormData((prev) => ({
        ...prev,
        category: initialCategory,
        subject:
          initialCategory === 'ADVERTISEMENT' && !prev.subject
            ? 'विज्ञापन दर एवं स्थान के संबंध में पूछताछ'
            : initialCategory === 'NEWS_TIP' && !prev.subject
            ? 'समाचार / प्रेस विज्ञप्ति प्रकाशनार्थ'
            : initialCategory === 'CAREER' && !prev.subject
            ? 'संवाददाता / रिपोर्टर पद हेतु आवेदन'
            : prev.subject,
      }));
    }
  }, [initialCategory]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    id: string;
    userNotified: boolean;
    editorWhatsAppUrl: string;
  } | null>(null);

  const activeBanner = CATEGORY_BANNERS[formData.category] || CATEGORY_BANNERS.DEFAULT;
  const BannerIcon = activeBanner.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('कृपया अपना नाम दर्ज करें।');
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      setError('कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!formData.subject.trim()) {
      setError('कृपया संदेश का विषय दर्ज करें।');
      return;
    }
    if (!formData.message.trim()) {
      setError('कृपया अपना संदेश या खबर का विस्तृत विवरण दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'संदेश भेजने में त्रुटि हुई।');
      }

      setSuccessData({
        id: data.id,
        userNotified: data.userNotified,
        editorWhatsAppUrl: data.editorWhatsAppUrl,
      });
    } catch (err: any) {
      setError(err.message || 'नेटवर्क समस्या के कारण संदेश नहीं भेजा जा सका।');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      location: '',
      category: 'NEWS_TIP',
      subject: '',
      message: '',
    });
    setSuccessData(null);
    setError('');
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Header Banner matching Selected Category */}
      <div className={`bg-gradient-to-r ${activeBanner.color} text-white rounded-2xl p-6 sm:p-10 shadow-sm transition-all duration-300`}>
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <BannerIcon className="w-3.5 h-3.5" />
            <span>दैनिक मान्यवर - साझा संपर्क केंद्र</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif leading-tight">
            {activeBanner.title}
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed">
            {activeBanner.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Direct Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#FED7AA]/60">
            <div className="inline-flex items-center gap-2 bg-[#FFF7ED] text-[#EA580C] px-3 py-1 rounded-full text-xs font-bold mb-4 border border-[#FED7AA]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>सीधा संपर्क सूत्र</span>
            </div>

            <h2 className="text-2xl font-bold text-stone-900 font-serif mb-3">
              संपादकीय व विज्ञापन न्यूज़डेस्क
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
              विज्ञापन दरें जानने, ताज़ा समाचार की सूचना देने अथवा पत्रकारिता से जुड़ने हेतु आप सीधे नीचे दिए गए संपर्कों पर बात कर सकते हैं।
            </p>

            <div className="space-y-4">
              {/* WhatsApp Link */}
              <a
                href="https://wa.me/919336181297"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                    WhatsApp हेल्पलाइन
                  </span>
                  <p className="font-bold text-emerald-950 text-base flex items-center gap-1">
                    +91 93361 81297
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </p>
                  <span className="text-[11px] text-emerald-700">व्हाट्सएप पर तुरंत सूचना या विज्ञापन भेजें</span>
                </div>
              </a>

              {/* Phone Call */}
              <a
                href="tel:+919336181297"
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#EA580C] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-orange-800 uppercase tracking-wide">
                    सीधा फ़ोन कॉल
                  </span>
                  <p className="font-bold text-stone-900 text-base">
                    +91 93361 81297
                  </p>
                  <span className="text-[11px] text-orange-700">प्रातः 08:00 से रात्रि 10:00 तक</span>
                </div>
              </a>

              {/* Official Email */}
              <a
                href="mailto:editor.dainikmanyavar@gmail.com"
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-stone-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
                    संपादकीय आधिकारिक ईमेल
                  </span>
                  <p className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                    editor.dainikmanyavar@gmail.com
                  </p>
                  <span className="text-[11px] text-stone-500">प्रेस विज्ञप्ति एवं विज्ञापन सामग्री हेतु</span>
                </div>
              </a>

              {/* Address */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <div className="w-10 h-10 rounded-lg bg-stone-300 text-stone-700 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
                    कार्यालय पता
                  </span>
                  <p className="font-bold text-stone-900 text-sm">
                    उत्तर प्रदेश, भारत
                  </p>
                  <span className="text-[11px] text-stone-500">दैनिक मान्यवर डिजिटल नेटवर्क</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>औसत प्रतिक्रिया समय: <strong>24 घंटे के भीतर</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#FED7AA]/60">
            {successData ? (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-stone-900 font-serif">
                    आपका संदेश सफलतापूर्वक प्राप्त हो गया है!
                  </h3>
                  <p className="text-sm text-stone-600 mt-2">
                    दैनिक मान्यवर से संपर्क करने के लिए धन्यवाद। संपादक महोदय को ईमेल व व्हाट्सएप सूचना प्रेषित कर दी गई है।
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">संदर्भ संख्या (Reference ID):</span>
                    <span className="font-mono font-bold text-stone-800">
                      #{successData.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  {successData.userNotified && (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>आपके ईमेल पर पुष्टिकरण व धन्यवाद संदेश प्रेषित कर दिया गया है।</span>
                    </div>
                  )}
                </div>

                {/* Direct WhatsApp trigger button for the editor */}
                <div className="pt-2 space-y-3 max-w-md mx-auto">
                  <a
                    href={successData.editorWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-green-700 text-white font-bold py-3 px-5 rounded-xl shadow-md transition-all text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>📲 संपादक जी को WhatsApp पर तुरंत अलर्ट भेजें</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium text-xs transition-colors"
                  >
                    नया संदेश भेजें (Submit Another Inquiry)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 font-serif">
                    एकीकृत संपर्क फॉर्म (Unified Contact Form)
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    विज्ञापन, समाचार सूचना, पत्रकारिता या शिकायत के लिए नीचे सही श्रेणी चुनें और विवरण भेजें।
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    संपर्क का उद्देश्य / श्रेणी चुनें <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            category: cat.id,
                            subject:
                              cat.id === 'ADVERTISEMENT' && (!formData.subject || formData.subject.includes('आवेदन') || formData.subject.includes('प्रेस'))
                                ? 'विज्ञापन दर एवं स्थान के संबंध में पूछताछ'
                                : cat.id === 'NEWS_TIP' && (!formData.subject || formData.subject.includes('विज्ञापन') || formData.subject.includes('आवेदन'))
                                ? 'समाचार / प्रेस विज्ञप्ति प्रकाशनार्थ'
                                : cat.id === 'CAREER' && (!formData.subject || formData.subject.includes('विज्ञापन') || formData.subject.includes('प्रेस'))
                                ? 'संवाददाता / रिपोर्टर पद हेतु आवेदन'
                                : formData.subject,
                          })
                        }
                        className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                          formData.category === cat.id
                            ? 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C] font-semibold ring-2 ring-[#EA580C]/20 shadow-sm'
                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                        }`}
                      >
                        <span className="font-bold">{cat.label}</span>
                        <span className="text-[11px] text-stone-500 font-normal mt-1 leading-tight">
                          {cat.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      आपका पूरा नाम <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. कुलदीप सिंह"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      मोबाइल / व्हाट्सएप नंबर <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="उदा. 9336181297"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      ईमेल पता (Email Address)
                      <span className="text-stone-400 font-normal ml-1">(पावती संदेश हेतु)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="उदा. editor.dainikmanyavar@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      ज़िला / शहर (City / District)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. लखनऊ, वाराणसी, प्रयागराज..."
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    विषय / मुख्य शीर्षक (Subject) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="संदेश का संक्षिप्त विषय या खबर का शीर्षक लिखें"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    विस्तृत संदेश / खबर या विज्ञापन का विवरण <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="अपनी बात, समाचार का पूरा विवरण, विज्ञापन के आकार/बजट की पूछताछ या रिपोर्टर बनने की इच्छा यहाँ विस्तार से लिखें..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs p-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent resize-y"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>संदेश भेजा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>संदेश भेजें (Submit Details)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                  🔒 आपकी जानकारी सीधे संपादक महोदय के पास ईमेल व व्हाट्सएप के माध्यम से पहुंचेगी।
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
