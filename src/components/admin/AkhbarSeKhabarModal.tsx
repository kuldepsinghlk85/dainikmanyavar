'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  ClipboardPaste,
  FileText,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Eye,
  Check,
  X,
  ShieldCheck,
  Tag,
  MapPin,
  FolderTree,
  Calendar,
  User,
  Hash,
  RotateCcw,
} from 'lucide-react';
import { EditorialStory } from '@/lib/akhbar-se-khabar/benchmarkData';

interface SampleItem {
  id: string;
  filename: string;
  imageUrl: string;
  label: string;
  badge: string;
  totalStories: number;
  sampleHeadlines: string[];
}

export interface EnrichedEditorialStory extends EditorialStory {
  resolvedCategoryId?: string;
  resolvedCategoryName?: string;
  resolvedLocationId?: string;
  resolvedLocationName?: string;
  resolvedTagIds?: string[];
  status?: string;
}

interface AkhbarSeKhabarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDraft: (draft: EnrichedEditorialStory) => void;
  existingFormFilled?: boolean;
}

export default function AkhbarSeKhabarModal({
  isOpen,
  onClose,
  onApplyDraft,
  existingFormFilled = false,
}: AkhbarSeKhabarModalProps) {
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'STORY_SELECT' | 'REVIEW'>('INPUT');
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Results State
  const [extractedStories, setExtractedStories] = useState<EnrichedEditorialStory[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [sourceFileUrl, setSourceFileUrl] = useState<string | undefined>();
  const [rawText, setRawText] = useState('');

  // Active review story (editable fields)
  const [activeStory, setActiveStory] = useState<EnrichedEditorialStory | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load samples on mount
  useEffect(() => {
    if (isOpen) {
      setLoadingSamples(true);
      fetch('/api/admin/akhbar-se-khabar')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.samples) {
            setSamples(data.samples);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingSamples(false));
    }
  }, [isOpen]);

  // Global Paste Listener (Ctrl+V) when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processUploadedFile(file);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  // Process a selected sample clipping
  const handleSelectSample = async (sampleId: string) => {
    setStep('PROCESSING');
    setProcessingStatus('अखबार की कतरन पढ़ी जा रही है...');
    setErrorMessage('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch('/api/admin/akhbar-se-khabar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.success && data.stories?.length > 0) {
        handleExtractionSuccess(data);
      } else {
        setErrorMessage(data.error || 'दस्तावेज़ पढ़ने में समस्या आई।');
        setStep('INPUT');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setErrorMessage('सर्वर से उत्तर मिलने में अधिक समय लगा (टाइमआउट)। कृपया पुनः प्रयास करें।');
      } else {
        setErrorMessage(err.message || 'सर्वर से संपर्क नहीं हो सका।');
      }
      setStep('INPUT');
    }
  };

  // Process an uploaded file (PDF / Image)
  const processUploadedFile = async (file: File) => {
    setStep('PROCESSING');
    setProcessingStatus(`'${file.name}' अपलोड और प्रोसेस हो रहा है...`);
    setErrorMessage('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/akhbar-se-khabar', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.success && data.stories?.length > 0) {
        handleExtractionSuccess(data);
      } else {
        setErrorMessage(data.error || 'दस्तावेज़ से समाचार तैयार नहीं हो सका।');
        setStep('INPUT');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setErrorMessage('फ़ाइल प्रोसेस करने में अधिक समय लगा (टाइमआउट)। कृपया पुनः प्रयास करें।');
      } else {
        setErrorMessage(err.message || 'अपलोड या प्रोसेसिंग में त्रुटि हुई।');
      }
      setStep('INPUT');
    }
  };

  // Handle Clipboard button click
  const handleClipboardButtonClick = async () => {
    try {
      if (!navigator.clipboard?.read) {
        alert('कृपया कीबोर्ड से Ctrl+V दबाकर क्लिपबोर्ड का स्क्रीनशॉट यहाँ पेस्ट करें।');
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `clipboard_screenshot_${Date.now()}.png`, { type: imageType });
          processUploadedFile(file);
          return;
        }
      }
      alert('क्लिपबोर्ड में कोई इमेज या स्क्रीनशॉट नहीं मिला। कृपया पहले Print Screen या स्क्रीनशॉट कॉपी करें और फिर पेस्ट करें।');
    } catch (err) {
      alert('क्लिपबोर्ड तक सीधी पहुँच की अनुमति नहीं मिली। कृपया स्क्रीन पर कहीं भी क्लिक करके कीबोर्ड से Ctrl+V दबाएं।');
    }
  };

  // Handle successful extraction
  const handleExtractionSuccess = (data: any) => {
    setExtractedStories(data.stories);
    setSourceFileUrl(data.sourceFileUrl);
    setRawText(data.rawText || '');

    if (data.stories.length > 1) {
      setStep('STORY_SELECT');
    } else {
      setActiveStory(data.stories[0]);
      setSelectedStoryIndex(0);
      setStep('REVIEW');
    }
  };

  // Choose a story from multi-story list
  const handleSelectStoryFromList = (index: number) => {
    setSelectedStoryIndex(index);
    setActiveStory(extractedStories[index]);
    setStep('REVIEW');
  };

  // Final Action: Apply to Editor Form
  const handleApplyToForm = () => {
    if (!activeStory) return;

    if (existingFormFilled) {
      if (!confirm('सावधानी: आपके फ़ॉर्म में पहले से कुछ जानकारी भरी हुई है। क्या आप इस नए समाचार ड्राफ्ट से उसे बदलना चाहते हैं?')) {
        return;
      }
    }

    onApplyDraft(activeStory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EA580C] text-white rounded-2xl shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>अखबार से खबर</span>
                  <span className="bg-orange-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full uppercase">
                    AI News Draft
                  </span>
                </h2>
              </div>
              <p className="text-xs text-stone-300 font-medium">
                PDF, प्रेस विज्ञप्ति, ईमेल का स्क्रीनशॉट या अखबार की कतरन से 1-क्लिक में हिंदी समाचार तैयार करें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: INPUT (Upload / Paste / Samples) */}
          {step === 'INPUT' && (
            <div className="space-y-6">
              {/* Drag & Drop Upload Zone + Paste Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-orange-300 hover:border-[#EA580C] bg-orange-50/30 hover:bg-orange-50/60 rounded-3xl p-8 text-center transition-all cursor-pointer group flex flex-col items-center justify-center space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processUploadedFile(file);
                  }}
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-orange-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-[#EA580C]" />
                </div>

                <div>
                  <h3 className="font-black text-stone-900 text-base">
                    कंप्यूटर से PDF या इमेज चुनें
                  </h3>
                  <p className="text-xs text-stone-500 font-medium mt-1">
                    PDF, JPG, PNG, WEBP स्वीकार्य हैं (स्कैन किए गए दस्तावेज भी समर्थित हैं)
                  </p>
                </div>

                {/* Keyboard Paste Hint Badge */}
                <div className="bg-white/90 border border-orange-200 text-orange-950 px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
                  <ClipboardPaste className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>या सीधे कीबोर्ड से <kbd className="bg-stone-200 px-1 py-0.2 rounded font-mono text-[10px]">Ctrl+V</kbd> दबाकर स्क्रीनशॉट पेस्ट करें</span>
                </div>
              </div>

              {/* Paste from Clipboard Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleClipboardButtonClick}
                  className="bg-stone-900 hover:bg-black text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ClipboardPaste className="w-4 h-4 text-orange-400" />
                  <span>📋 क्लिपबोर्ड से इमेज पेस्ट करें (Ctrl+V)</span>
                </button>
              </div>

              {/* 5 Real Benchmark Newspaper Samples */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#EA580C]" />
                    <span>5 नमूना अखबार कतरनें (1-क्लिक परीक्षण के लिए)</span>
                  </span>
                  <span className="text-[11px] font-medium text-stone-500">
                    दैनिक मान्यवर वास्तविक कतरनें
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {samples.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSample(s.id)}
                      className="bg-white p-3 rounded-2xl border border-stone-200 hover:border-[#EA580C] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="relative h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                          <img
                            src={s.imageUrl}
                            alt={s.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-2 right-2 bg-stone-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {s.badge}
                          </div>
                        </div>

                        <h4 className="text-xs font-black text-stone-900 line-clamp-2 leading-tight">
                          {s.label}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-[#EA580C]">
                        <span>इस कतरन से ड्राफ्ट बनाएं</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING ANIMATION */}
          {step === 'PROCESSING' && (
            <div className="p-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <RefreshCw className="w-16 h-16 animate-spin text-[#EA580C]" />
              </div>
              <h3 className="text-base font-black text-stone-900">{processingStatus}</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                दैनिक मान्यवर पत्रकारिता शैली में तथ्यों का विश्लेषण, उल्टा पिरामिड संरचना, श्रेणियां, जनपद और पैराग्राफ ब्लॉक तैयार किए जा रहे हैं...
              </p>
            </div>
          )}

          {/* STEP 3: MULTI-STORY SELECTION (When source has > 1 story) */}
          {step === 'STORY_SELECT' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-xs">
                      दस्तावेज़ में {extractedStories.length} अलग-अलग समाचार पहचाने गए
                    </h4>
                    <p className="text-[11px] text-amber-700">
                      कृपया वह समाचार चुनें जिसका ड्राफ्ट आप एडिटोरियल फॉर्म में भरना चाहते हैं:
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {extractedStories.map((story, idx) => (
                  <div
                    key={story.id || idx}
                    onClick={() => handleSelectStoryFromList(idx)}
                    className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-[#EA580C] hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <span className="bg-[#EA580C] text-white px-2 py-0.5 rounded font-black">
                          समाचार #{idx + 1}
                        </span>
                        <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold border border-stone-200">
                          {story.categorySuggestion}
                        </span>
                        {story.districtSuggestion && (
                          <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold border border-stone-200">
                            📍 {story.districtSuggestion}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-stone-900 text-sm leading-snug">
                        {story.headline}
                      </h3>

                      <p className="text-xs text-stone-500 line-clamp-2">
                        {story.excerpt}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="bg-stone-100 group-hover:bg-[#EA580C] text-stone-800 group-hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <span>यह ड्राफ्ट चुनें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep('INPUT')}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  ← वापस जाएं और अन्य फ़ाइल चुनें
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & FACT-CHECK PANEL (स्रोत और समीक्षा) */}
          {step === 'REVIEW' && activeStory && (
            <div className="space-y-6">
              {/* Back to multi-story selection if > 1 stories exist */}
              {extractedStories.length > 1 && (
                <div className="flex items-center justify-between bg-stone-100 p-3 rounded-2xl text-xs font-bold text-stone-700">
                  <span>समाचार {selectedStoryIndex + 1} / {extractedStories.length} देख रहे हैं</span>
                  <button
                    type="button"
                    onClick={() => setStep('STORY_SELECT')}
                    className="text-[#EA580C] hover:underline flex items-center gap-1 font-black cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>अन्य समाचार चुनें</span>
                  </button>
                </div>
              )}

              {/* Two Column Layout: Left Fact-Check & Right Form Draft */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* LEFT: स्रोत और समीक्षा (Fact-Check & Source Notes) */}
                <div className="lg:col-span-5 space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-black text-stone-900 uppercase tracking-wider text-[11px]">
                      स्रोत एवं तथ्य जाँच (Fact-Check & Source)
                    </span>
                  </div>

                  {/* Original Clipping Reference */}
                  {sourceFileUrl && (
                    <div className="space-y-1 bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">
                        मूल स्रोत कतरन (Original Reference Clipping)
                      </span>
                      <div className="relative h-40 w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                        <img
                          src={sourceFileUrl}
                          alt="Original Clipping"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Identified Entities */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                      पहचाने गए मुख्य तथ्य
                    </span>

                    {/* Names */}
                    {activeStory.factCheck?.names?.length > 0 && (
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 space-y-1">
                        <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                          <User className="w-3 h-3 text-blue-600" /> प्रमुख नाम:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {activeStory.factCheck.names.map((n, i) => (
                            <span key={i} className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-[10px] font-bold">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locations */}
                    {activeStory.factCheck?.locations?.length > 0 && (
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 space-y-1">
                        <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-600" /> स्थान / शहर:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {activeStory.factCheck.locations.map((l, i) => (
                            <span key={i} className="bg-red-50 text-red-900 px-2 py-0.5 rounded text-[10px] font-bold">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dates & Numbers */}
                    {(activeStory.factCheck?.numbers?.length > 0 || activeStory.factCheck?.dates?.length > 0) && (
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 space-y-1">
                        <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                          <Hash className="w-3 h-3 text-amber-600" /> आंकड़े एवं तारीखें:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {activeStory.factCheck.dates?.map((d, i) => (
                            <span key={i} className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                              📅 {d}
                            </span>
                          ))}
                          {activeStory.factCheck.numbers?.map((num, i) => (
                            <span key={i} className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded text-[10px] font-bold">
                              🔢 {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Caveats / Unconfirmed Notes */}
                  {activeStory.factCheck?.unconfirmedNotes?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl space-y-1 text-amber-900">
                      <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> संपादकीय समीक्षा नोट:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {activeStory.factCheck.unconfirmedNotes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw Source Text Preview */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                      मूल स्रोत टेक्स्ट (Raw Source Text)
                    </span>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200 font-mono text-[10px] text-stone-600 max-h-36 overflow-y-auto leading-relaxed">
                      {activeStory.factCheck?.rawOcrSnippet || rawText.substring(0, 500)}
                    </div>
                  </div>
                </div>

                {/* RIGHT: तैयार समाचार ड्राफ्ट (Generated Editorial News Draft) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Headline */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-800">
                      1. मुख्य शीर्षक (Headline)
                    </label>
                    <textarea
                      rows={2}
                      value={activeStory.headline}
                      onChange={(e) => setActiveStory({ ...activeStory, headline: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-xl text-sm font-black text-stone-900 focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>

                  {/* Secondary Headline */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-800">
                      2. उप-शीर्षक (Secondary Headline)
                    </label>
                    <input
                      type="text"
                      value={activeStory.secondaryHeadline}
                      onChange={(e) => setActiveStory({ ...activeStory, secondaryHeadline: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>

                  {/* Extracted News Photo Preview (NOT the full clipping) */}
                  {activeStory.featuredImage && (
                    <div className="space-y-1.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          कतरन से निकाला गया समाचार फोटो (Extracted News Photo)
                        </span>
                        <span className="text-[10px] text-stone-500 font-bold">
                          फॉर्म में मुख्य चित्र बनेगा
                        </span>
                      </div>
                      <div className="relative h-44 w-full rounded-lg overflow-hidden border border-emerald-300 bg-white">
                        <img
                          src={activeStory.featuredImage}
                          alt="Extracted News Photo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Metadata Chips (Category & District & Format) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-500 block">श्रेणी (Category)</span>
                      <span className="font-black text-xs text-[#EA580C]">
                        {activeStory.resolvedCategoryName || activeStory.categorySuggestion}
                      </span>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-500 block">संबंधित जनपद (District)</span>
                      <span className="font-black text-xs text-stone-800">
                        📍 {activeStory.resolvedLocationName || activeStory.districtSuggestion}
                      </span>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-500 block">प्रकाशन स्थिति</span>
                      <span className="font-black text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                        Draft (प्रारूप)
                      </span>
                    </div>
                  </div>

                  {/* Excerpt Summary */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-800">
                      3. संक्षिप्त विवरण (Excerpt Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={activeStory.excerpt}
                      onChange={(e) => setActiveStory({ ...activeStory, excerpt: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>

                  {/* Paragraph Blocks Preview */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-800 flex items-center justify-between">
                      <span>4. पैराग्राफ ब्लॉक व्यवस्था ({activeStory.paragraphBlocks.length} ब्लॉक्स)</span>
                      <span className="text-[10px] text-stone-500 font-normal">फॉर्म में ब्लॉक एडिटर के साथ खुलेगा</span>
                    </label>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {activeStory.paragraphBlocks.map((block, bIdx) => (
                        <div key={bIdx} className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1 text-xs">
                          {block.subtitle && (
                            <h5 className="font-black text-stone-900 text-xs">
                              {block.subtitle}
                            </h5>
                          )}
                          <p className="text-stone-700 leading-relaxed text-[11px]">
                            {block.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('INPUT')}
                  className="px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  ← नया दस्तावेज़ चुनें
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-300 transition-colors cursor-pointer"
                  >
                    रद्द करें
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyToForm}
                    className="bg-[#EA580C] hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>एडिटोरियल फॉर्म में भरें (Apply to Form)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
