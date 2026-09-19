'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import HtmlContentEditor from '@/components/admin/HtmlContentEditor';
import VoiceInputButton from '@/components/public/VoiceInputButton';
import AutoTranslateButton from '@/components/admin/AutoTranslateButton';
import {
  Film,
  ArrowLeft,
  Save,
  Star,
  Flame,
  Trophy,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  Video,
  Tag as TagIcon,
  X,
  Plus,
} from 'lucide-react';

export default function AddManoranjanArticlePage() {
  const router = useRouter();

  // Core Article Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [subtype, setSubtype] = useState<'movies' | 'movie_review' | 'viral' | 'cricket_buzz'>('movies');
  const [status, setStatus] = useState('PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(false);

  // Movie Review Specific Fields
  const [movieName, setMovieName] = useState('');
  const [rating, setRating] = useState<number>(4.0);
  const [verdict, setVerdict] = useState('');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');

  // Video / Reel Specific Fields
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('1:00');

  // Tags State
  const [tags, setTags] = useState<string[]>(['#मनोरंजन']);
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = (newTag: string) => {
    let clean = newTag.trim();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('कृपया आर्टिकल का मुख्य शीर्षक अवश्य दर्ज करें।');
      return;
    }
    if (!content.trim()) {
      setError('कृपया आर्टिकल का विस्तृत विवरण (लेख) अवश्य लिखें।');
      return;
    }

    setLoading(true);

    const reviewData =
      subtype === 'movie_review'
        ? {
            movieName: movieName || title,
            rating,
            verdict: verdict || subtitle,
            director,
            cast,
          }
        : null;

    try {
      const res = await fetch('/api/admin/manoranjan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || (subtype === 'movie_review' && verdict ? `वर्डिक्ट: ${verdict}` : ''),
          excerpt: subtitle.trim() || verdict.trim() || '',
          content,
          featuredImage,
          subtype,
          reviewData,
          status,
          isFeatured,
          videoUrl: videoUrl.trim(),
          videoDuration: videoDuration.trim() || '1:00',
          tags,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/manoranjan');
      } else {
        setError(data.error || 'आर्टिकल सुरक्षित करने में समस्या आई');
      }
    } catch (err: any) {
      setError(err.message || 'नेटवर्क समस्या');
    } finally {
      setLoading(false);
    }
  };

  const subtypes = [
    {
      id: 'movies',
      label: '🎬 फिल्में व सिनेमा',
      desc: 'बॉलीवुड, टॉलीवुड, फिल्म ट्रेलर, बॉक्स ऑफिस व सितारों की खबरें',
      color: 'border-red-500 bg-red-50/50 text-red-900',
    },
    {
      id: 'movie_review',
      label: '⭐ फिल्मों के रिव्यू',
      desc: 'स्टार रेटिंग (★) व वर्डिक्ट के साथ नई फिल्मों व वेब सीरीज की समीक्षा',
      color: 'border-amber-500 bg-amber-50/50 text-amber-900',
    },
    {
      id: 'viral',
      label: '🔥 दिलचस्प खबरें',
      desc: 'सोशल मीडिया ट्रेंड्स, अजीबोगरीब किस्से व हटके वायरल कहानियां',
      color: 'border-purple-500 bg-purple-50/50 text-purple-900',
    },
    {
      id: 'cricket_buzz',
      label: '🏏 क्रिकेट बज़ व गॉसिप',
      desc: 'क्रिकेटर्स की लाइफस्टाइल, मैदान के रोचक किस्से व खेल मनोरंजन',
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/manoranjan"
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-[#EA580C]" />
              <span>नया मनोरंजन आर्टिकल लिखें</span>
            </h1>
            <p className="text-xs text-stone-500">
              फोटो, रिच टेक्स्ट व बोलकर लिखने की संपूर्ण सुविधा
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* 🌐 Auto Translate to Hindi Button */}
          <AutoTranslateButton
            currentData={{ title, subtitle, content, tags }}
            onTranslate={(translated) => {
              if (translated.title) setTitle(translated.title);
              if (translated.subtitle) setSubtitle(translated.subtitle);
              if (translated.content) setContent(translated.content);
              if (translated.tags && translated.tags.length > 0) setTags(translated.tags);
            }}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'सुरक्षित हो रहा है...' : 'प्रकाशित करें (Publish)'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Sub-type Selection */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <label className="block text-xs font-black text-stone-900 uppercase tracking-wider">
            1. मनोरंजन का प्रकार चुनें (Select Category Subtype) *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subtypes.map((st) => {
              const isSelected = subtype === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSubtype(st.id as any)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? `${st.color} shadow-xs scale-[1.01]`
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-stone-900">{st.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#EA580C] bg-[#EA580C]' : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 font-medium">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Movie Review Specialized Block (Conditional) */}
        {subtype === 'movie_review' && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 p-5 rounded-2xl border-2 border-amber-300 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200 pb-2.5">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              <h3 className="text-sm font-black">मूवी रिव्यू विशेष विवरण (Movie Review Details)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  फिल्म का नाम (Movie Title)
                </label>
                <input
                  type="text"
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  placeholder="उदा. स्त्री 2 / कल्कि 2898 AD"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:border-[#EA580C] focus:outline-none"
                />
              </div>

              {/* Star Rating Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-800">
                    स्टार रेटिंग (Rating out of 5 ★):
                  </label>
                  <span className="text-xs font-black text-amber-600 font-mono bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                    {rating} / 5.0 ★
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-stone-300">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating >= star
                            ? 'fill-amber-500 text-amber-500'
                            : rating >= star - 0.5
                            ? 'fill-amber-300 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-1">
                    {[3.5, 4.0, 4.5, 5.0].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          rating === val
                            ? 'bg-amber-500 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {val}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">
                  वन-लाइन वर्डिक्ट (One-Line Verdict / संक्षिप्त फैसला)
                </label>
                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs">
                  <VoiceInputButton
                    mode="append"
                    currentValue={verdict}
                    onTranscript={(text) => setVerdict(text)}
                    placeholderHint="वर्डिक्ट बोलिए..."
                    size="sm"
                  />
                  <span className="text-[10px] font-bold text-stone-600">बोलकर लिखें</span>
                </div>
              </div>
              <input
                type="text"
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                placeholder="उदा. हंसी और डर का जबरदस्त कॉकटेल, पैसा वसूल पारिवारिक फिल्म"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:border-[#EA580C] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">निर्देशक (Director)</label>
                <input
                  type="text"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="उदा. अमर कौशिक"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">मुख्य कलाकार (Star Cast)</label>
                <input
                  type="text"
                  value={cast}
                  onChange={(e) => setCast(e.target.value)}
                  placeholder="उदा. राजकुमार राव, श्रद्धा कपूर, पंकज त्रिपाठी"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Title & Subtitle with Voice-to-Text */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-900">
                2. मुख्य शीर्षक (Article Headline / Title) *
              </label>
              <div className="flex items-center gap-1 bg-orange-50/80 px-2 py-0.5 rounded-lg border border-orange-200">
                <VoiceInputButton
                  mode="append"
                  currentValue={title}
                  onTranscript={(text) => setTitle(text)}
                  placeholderHint="शीर्षक बोलिए..."
                  size="sm"
                />
                <span className="text-[10px] font-bold text-[#EA580C]">बोलकर लिखें</span>
              </div>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="आकर्षक और प्रभावोत्पादक शीर्षक यहाँ लिखें या माइक से बोलें..."
              className="w-full p-3 bg-stone-50/50 border border-stone-300 rounded-xl text-sm font-black text-stone-900 focus:bg-white focus:border-[#EA580C] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700">
                3. उप-शीर्षक / संक्षिप्त सारांश (Subtitle / Excerpt)
              </label>
              <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">
                <VoiceInputButton
                  mode="append"
                  currentValue={subtitle}
                  onTranscript={(text) => setSubtitle(text)}
                  placeholderHint="सारांश बोलिए..."
                  size="sm"
                />
                <span className="text-[10px] font-bold text-stone-600">बोलकर लिखें</span>
              </div>
            </div>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="समाचार का 1-2 पंक्तियों में मुख्य सार..."
              className="w-full p-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:bg-white focus:border-[#EA580C] focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Photo & Poster Upload */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <label className="block text-xs font-black text-stone-900 uppercase tracking-wider">
            4. मुख्य फोटो / पोस्टर (Featured Poster / Image)
          </label>
          <ImageUploader
            value={featuredImage}
            onChange={(url) => setFeaturedImage(url)}
            category="मनोरंजन"
            label="मुख्य पोस्टर / फोटो (Featured Poster / Image)"
          />
        </div>

        {/* 5. Detailed Article Body (HtmlContentEditor + Voice Typing) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <label className="block text-xs font-black text-stone-900 uppercase tracking-wider">
            5. विस्तृत लेख / समाचार विवरण (Detailed Content) *
          </label>
          <p className="text-[11px] text-stone-500">
            अखबार की तरह पैराग्राफ, सब-हेडिंग्स, कोट्स आदि से सजाएं। एडिटर के अंदर मौजूद माइक द्वारा सीधे बोलकर भी लिख सकते हैं।
          </p>
          <HtmlContentEditor
            value={content}
            onChange={(val) => setContent(val)}
            placeholder="यहाँ विस्तृत मनोरंजन समाचार, रिव्यू या कहानी लिखें अथवा माइक द्वारा बोलें..."
          />
        </div>

        {/* 6. Video / Reel Integration (First-class Video Data Content) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-stone-900 uppercase tracking-wider">
            <Video className="w-4 h-4 text-purple-600" />
            <span>6. वीडियो / रील लिंक (Video / Reel URL) — वैकल्पिक</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            यदि इस खबर के साथ कोई वीडियो या रील जोड़ना चाहते हैं (YouTube, Shorts, Facebook, Instagram Embed या डायरेक्ट MP4), तो यहाँ दर्ज करें। यह अपने आप मोबाइल रील व वीडियो सेक्शन में जुड़ जाएगी।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/shorts/... या https://...mp4"
                className="w-full p-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-[#EA580C] focus:outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                value={videoDuration}
                onChange={(e) => setVideoDuration(e.target.value)}
                placeholder="अवधि (उदा. 0:45 या 2:30)"
                className="w-full p-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-[#EA580C] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 7. Tags (First-class Data Content Tags) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-stone-900 uppercase tracking-wider">
            <TagIcon className="w-4 h-4 text-[#EA580C]" />
            <span>7. संबंधित टैग्स (Tags / Hashtags)</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            ये टैग्स पूरे पोर्टल पर डेटा कंटेंट की तरह काम करेंगे, टैग आर्काइव में दिखेंगे और मल्टी-टैग्स मैनेजर से भी नियंत्रित होंगे।
          </p>

          {/* Quick Preset Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-stone-400 mr-1">त्वरित टैग्स जोड़ें:</span>
            {[
              '#मनोरंजन',
              '#बॉलीवुड',
              '#मूवी_रिव्यू',
              '#सिनेमा',
              '#क्रिकेट',
              '#वायरल_वीडियो',
              '#वेब_सीरीज',
              '#बॉक्स_ऑफिस',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddTag(preset)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  tags.includes(preset)
                    ? 'bg-orange-100 text-[#EA580C] border-orange-300 opacity-60 cursor-not-allowed'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
                disabled={tags.includes(preset)}
              >
                + {preset}
              </button>
            ))}
          </div>

          {/* Tag Input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
              placeholder="नया कस्टम टैग लिखें (उदा. #Stree2, #Kalki2898AD)..."
              className="flex-1 p-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-[#EA580C] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddTag(tagInput)}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>जोड़ें</span>
            </button>
          </div>

          {/* Selected Tags List */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 mr-1">चुने गए टैग्स ({tags.length}):</span>
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold px-2.5 py-1 rounded-lg"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-orange-500 hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 8. Publication Status & Features */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
            8. प्रकाशन विकल्प (Publishing Options)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">स्थिति (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:border-[#EA580C]"
              >
                <option value="PUBLISHED">🟢 तुरंत प्रकाशित करें (Published)</option>
                <option value="DRAFT">🟡 ड्राफ्ट के रूप में रखें (Draft)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#EA580C] rounded focus:ring-[#EA580C]"
                />
                <span>★ मुख्य फीचर्ड स्टोरी बनाएं (Featured Highlight)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/manoranjan"
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
          >
            रद्द करें
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'सुरक्षित हो रहा है...' : 'आर्टिकल सुरक्षित करें'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
