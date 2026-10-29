'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Upload,
  ClipboardPaste,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Tag as TagIcon,
  FolderTree,
  User,
  Hash,
  Eye,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Copy,
  ExternalLink,
  Info,
  Clock,
  Trash2,
  Check,
  X,
  Send,
  Calendar,
  Newspaper,
  BookOpen,
} from 'lucide-react';
import { EnrichedEditorialStory } from '@/components/admin/AkhbarSeKhabarModal';

interface BenchmarkSample {
  id: string;
  title: string;
  sourceType: string;
  sourceName: string;
  sourceDate: string;
  imageFileName: string;
  previewUrl: string;
  description: string;
}

interface AkhbarDraftItem {
  id: string;
  newsId: number;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  status: string;
  contentType: string;
  source?: string;
  sourceClippingTitle?: string;
  sourceClippingUrl?: string;
  sourceDate?: string;
  category?: { id: string; name: string; slug: string };
  location?: { id: string; name: string; slug: string };
  tags: string[];
  factCheck?: {
    names: string[];
    dates: string[];
    locations: string[];
    numbers: string[];
    sourceType: string;
    unconfirmedNotes: string[];
  } | null;
  createdAt: string;
  publishedAt?: string;
}

export default function AkhbarSeKhabarPage() {
  const router = useRouter();

  // Active Tab: 'drafts' (अखबार ड्राफ्ट डेस्क) or 'extract' (कतरन से खबर बनाएं)
  const [activeTab, setActiveTab] = useState<'drafts' | 'extract'>('drafts');

  // Drafts state
  const [drafts, setDrafts] = useState<AkhbarDraftItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [draftFilter, setDraftFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Preview Modal state
  const [previewItem, setPreviewItem] = useState<AkhbarDraftItem | null>(null);

  // Extractor / Samples state
  const [samples, setSamples] = useState<BenchmarkSample[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Extracted Result state
  const [extractedStories, setExtractedStories] = useState<EnrichedEditorialStory[]>([]);
  const [activeStory, setActiveStory] = useState<EnrichedEditorialStory | null>(null);
  const [sourceFileUrl, setSourceFileUrl] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load Drafts List
  const fetchDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const res = await fetch('/api/admin/akhbar-se-khabar?action=drafts');
      const data = await res.json();
      if (data.success && data.drafts) {
        setDrafts(data.drafts);
      }
    } catch (err) {
      console.error('Failed to load akhbar drafts:', err);
    } finally {
      setLoadingDrafts(false);
    }
  };

  useEffect(() => {
    fetchDrafts();

    // Load benchmark samples
    fetch('/api/admin/akhbar-se-khabar')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.samples) {
          setSamples(data.samples);
        }
      })
      .catch((err) => console.error('Failed to load benchmark samples:', err));
  }, []);

  // 2. Global Ctrl+V clipboard paste listener for extract tab
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            setActiveTab('extract');
            processImageFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Action: Publish Draft (Approve & Publish to live website)
  const handlePublishDraft = async (item: AkhbarDraftItem) => {
    if (
      !confirm(
        `क्या आप समाचार "${item.title}" को स्वीकृत करके वेबसाइट पर तुरंत प्रकाशित करना चाहते हैं?`
      )
    ) {
      return;
    }

    setActionLoadingId(item.id);
    try {
      const res = await fetch('/api/admin/akhbar-se-khabar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_draft', articleId: item.id }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'प्रकाशन में विफल');
      }

      setSuccessMessage(`समाचार "${item.title}" सफलतापूर्वक वेबसाइट पर लाइव प्रकाशित कर दिया गया है!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      await fetchDrafts();
    } catch (err: any) {
      alert(err.message || 'प्रकाशन में समस्या आई');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Unpublish back to Draft
  const handleUnpublishDraft = async (item: AkhbarDraftItem) => {
    if (!confirm(`क्या आप इस समाचार को वापस प्रारूप (ड्राफ्ट) में सुरक्षित करना चाहते हैं?`)) {
      return;
    }

    setActionLoadingId(item.id);
    try {
      const res = await fetch('/api/admin/akhbar-se-khabar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish_draft', articleId: item.id }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'अप्रकाशित करने में विफल');
      }

      setSuccessMessage(`समाचार को वापस प्रारूप (ड्राफ्ट) में कर दिया गया है।`);
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchDrafts();
    } catch (err: any) {
      alert(err.message || 'समस्या आई');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Delete Draft
  const handleDeleteDraft = async (item: AkhbarDraftItem) => {
    if (!confirm(`सावधानी: क्या आप वाकई समाचार "${item.title}" को हटाना चाहते हैं?`)) {
      return;
    }

    setActionLoadingId(item.id);
    try {
      const res = await fetch('/api/admin/akhbar-se-khabar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_draft', articleId: item.id }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'हटाने में विफल');
      }

      setDrafts((prev) => prev.filter((d) => d.id !== item.id));
      if (previewItem?.id === item.id) setPreviewItem(null);
    } catch (err: any) {
      alert(err.message || 'हटाने में समस्या आई');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Draft in Editor Form
  const handleEditDraft = (item: AkhbarDraftItem) => {
    router.push(`/admin/news/${item.id}/edit`);
  };

  // Process File upload (Image or PDF)
  const processImageFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus('दस्तावेज़ पढ़ा जा रहा है (OCR / Vision Extraction)...');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/akhbar-se-khabar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'दस्तावेज़ से खबर तैयार करने में समस्या आई');
      }

      handleProcessSuccess(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'सामग्री पढ़ने में विफल');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Process Benchmark Sample
  const handleSelectSample = async (sampleId: string) => {
    setIsProcessing(true);
    setProcessingStatus('नमूना कतरन लोड कर हिंदी समाचार ड्राफ्ट तैयार किया जा रहा है...');
    setError(null);

    try {
      const res = await fetch('/api/admin/akhbar-se-khabar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'नमूना प्रोसेस करने में विफल');
      }

      handleProcessSuccess(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'नमूना पढ़ने में विफल');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Handle Clipboard button click
  const handleClipboardButtonClick = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        alert('कृपया सीधे कीबोर्ड से Ctrl+V दबाएं।');
        return;
      }

      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `clipboard_${Date.now()}.png`, { type: imageType });
          processImageFile(file);
          return;
        }
      }
      alert('क्लिपबोर्ड में कोई स्क्रीनशॉट नहीं मिला! पहले Print Screen / Snipping Tool से कॉपी करें, फिर यहां पेस्ट करें।');
    } catch (err: any) {
      alert('क्लिपबोर्ड एक्सेस की अनुमति नहीं मिली। कृपया कीबोर्ड शॉर्टकट Ctrl+V दबाएं।');
    }
  };

  // Result population
  const handleProcessSuccess = (data: {
    stories: EnrichedEditorialStory[];
    sourceFileUrl?: string;
    rawText?: string;
  }) => {
    setExtractedStories(data.stories);
    setSourceFileUrl(data.sourceFileUrl || null);
    setRawText(data.rawText || '');
    setActiveStory(data.stories[0]);
    setSelectedStoryIndex(0);

    const resultsElement = document.getElementById('akhbar-results-view');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Forward Draft directly to /admin/news/new
  const handleOpenInEditor = () => {
    if (!activeStory) return;
    try {
      sessionStorage.setItem('dm_pending_akhbar_draft', JSON.stringify(activeStory));
      router.push('/admin/news/new');
    } catch (err) {
      console.error('Failed to store draft in session:', err);
      router.push('/admin/news/new');
    }
  };

  // Copy structured text to clipboard
  const handleCopyDraft = () => {
    if (!activeStory) return;
    const blocksText = (activeStory.paragraphBlocks || [])
      .map((b) => (b.subtitle ? `### ${b.subtitle}\n${b.text}` : b.text))
      .join('\n\n');

    const fullDraft = `शीर्षक: ${activeStory.headline}\nउप-शीर्षक: ${activeStory.secondaryHeadline || '—'}\nश्रेणी: ${activeStory.categorySuggestion || '—'}\nजनपद: ${activeStory.districtSuggestion || '—'}\n\nसार / लीड:\n${activeStory.excerpt}\n\nविस्तृत समाचार:\n${blocksText}`;

    navigator.clipboard.writeText(fullDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Filtered drafts
  const filteredDrafts = drafts.filter((d) => {
    if (draftFilter === 'ALL') return true;
    return d.status === draftFilter;
  });

  const draftCount = drafts.filter((d) => d.status === 'DRAFT').length;
  const publishedCount = drafts.filter((d) => d.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#EA580C] text-white rounded-2xl shadow-sm">
            <Newspaper className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                अखबार से खबर (Newspaper to News Studio)
              </h1>
              <span className="bg-[#EA580C] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                Independent Module
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              अखबार कतरनों से स्वचालित समाचार ड्राफ्ट, तथ्य-जाँच और 1-क्लिक अप्रूवल प्रणाली (वेबसाइट से पूर्ण सुरक्षित पृथक्करण)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/news/new"
            className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#EA580C]" />
            <span>नया समाचार जोड़ें</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-2xl text-xs font-black flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Tab Switcher */}
      <div className="flex border-b border-stone-200 gap-4">
        <button
          onClick={() => setActiveTab('drafts')}
          className={`pb-3 px-1 text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'drafts'
              ? 'border-[#EA580C] text-[#EA580C]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>अखबार ड्राफ्ट डेस्क (Akhbar Drafts Desk)</span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'drafts' ? 'bg-[#EA580C] text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {draftCount} ड्राफ्ट प्रतीक्षित
          </span>
        </button>

        <button
          onClick={() => setActiveTab('extract')}
          className={`pb-3 px-1 text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'extract'
              ? 'border-[#EA580C] text-[#EA580C]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>नई कतरन से खबर बनाएं (Extract New Clipping)</span>
        </button>
      </div>

      {/* TAB 1: AKHBAR DRAFTS DESK */}
      {activeTab === 'drafts' && (
        <div className="space-y-6">
          {/* Isolation & Workflow Notice */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-black text-amber-950">
                स्वतंत्र मॉड्यूल एवं ड्राफ्ट सुरक्षा नियम:
              </h4>
              <p className="leading-relaxed text-stone-700">
                ये सभी समाचार अखबार की कतरनों से निकाले गए हैं और वर्तमान में <strong>प्रारूप (DRAFT)</strong> स्थिति में सुरक्षित हैं। जब तक आप <strong>&quot;स्वीकृत कर प्रकाशित करें (Approve & Publish)&quot;</strong> बटन नहीं दबाते, तब तक यह समाचार वेबसाइट के होमपेज, श्रेणी या जनपद पेज पर प्रदर्शित नहीं होगा। केवल स्वीकृत होने के बाद ही यह लाइव होगा।
              </p>
            </div>
          </div>

          {/* Stats & Filters Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setDraftFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  draftFilter === 'ALL'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                सभी समाचार ({drafts.length})
              </button>

              <button
                onClick={() => setDraftFilter('DRAFT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  draftFilter === 'DRAFT'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>ड्राफ्ट / अप्रूवल प्रतीक्षित ({draftCount})</span>
              </button>

              <button
                onClick={() => setDraftFilter('PUBLISHED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  draftFilter === 'PUBLISHED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>वेबसाइट पर प्रकाशित ({publishedCount})</span>
              </button>
            </div>

            <button
              onClick={fetchDrafts}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>रिफ्रेश सूची</span>
            </button>
          </div>

          {/* Drafts Cards List */}
          {loadingDrafts ? (
            <div className="p-12 text-center text-stone-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#EA580C]" />
              <p className="text-xs font-bold">ड्राफ्ट समाचार लोड हो रहे हैं...</p>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 text-stone-500 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-stone-300" />
              <p className="font-bold text-sm">इस फ़िल्टर में कोई समाचार नहीं मिला</p>
              <button
                onClick={() => setDraftFilter('ALL')}
                className="text-xs text-[#EA580C] font-black underline cursor-pointer"
              >
                सभी समाचार देखें
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrafts.map((item) => {
                const isPublished = item.status === 'PUBLISHED';
                const isLoading = actionLoadingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border transition-all p-5 flex flex-col lg:flex-row items-start gap-5 shadow-xs hover:shadow-md ${
                      isPublished ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-200 hover:border-orange-300'
                    }`}
                  >
                    {/* Featured Image Thumbnail */}
                    <div className="relative w-full lg:w-48 h-36 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                      {item.featuredImage ? (
                        <Image
                          src={item.featuredImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <FileText className="w-8 h-8" />
                        </div>
                      )}

                      {/* Source badge overlay */}
                      <span className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs">
                        {item.sourceClippingTitle?.slice(0, 24) || 'अखबार कतरन'}
                      </span>
                    </div>

                    {/* Middle: Content & Facts */}
                    <div className="flex-1 space-y-2">
                      {/* Meta Pills */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        {/* Status Badge */}
                        {isPublished ? (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>वेबसाइट पर प्रकाशित (LIVE)</span>
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>प्रारूप (DRAFT) — अप्रूवल प्रतीक्षित</span>
                          </span>
                        )}

                        {/* Category */}
                        {item.category && (
                          <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md font-bold border border-stone-200">
                            {item.category.name}
                          </span>
                        )}

                        {/* Location */}
                        {item.location && (
                          <span className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded-md font-bold border border-red-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span>{item.location.name}</span>
                          </span>
                        )}

                        <span className="text-[10px] text-stone-600 font-medium">
                          ID: #{item.newsId} • {item.sourceDate || '29 अक्टूबर 2026'}
                        </span>
                      </div>

                      {/* Headline */}
                      <h3 className="font-black text-stone-900 text-base leading-snug hover:text-[#EA580C] transition-colors">
                        {item.title}
                      </h3>

                      {/* Subtitle */}
                      {item.subtitle && (
                        <p className="text-xs font-bold text-stone-600 leading-snug">
                          {item.subtitle}
                        </p>
                      )}

                      {/* Excerpt */}
                      {item.excerpt && (
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {item.excerpt}
                        </p>
                      )}

                      {/* Fact Check Preview Tags */}
                      {item.factCheck && (
                        <div className="pt-1 flex items-center gap-1.5 flex-wrap text-[10px]">
                          {item.factCheck.names?.slice(0, 3).map((n, i) => (
                            <span key={i} className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-bold">
                              👤 {n}
                            </span>
                          ))}
                          {item.factCheck.locations?.slice(0, 2).map((l, i) => (
                            <span key={i} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold">
                              📍 {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions Box */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-2 shrink-0 w-full lg:w-44 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                      {/* APPROVE & PUBLISH BUTTON */}
                      {!isPublished ? (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handlePublishDraft(item)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer flex-1 lg:flex-none disabled:opacity-50"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>स्वीकृत कर प्रकाशित करें</span>
                        </button>
                      ) : (
                        <div className="space-y-1.5 w-full">
                          <Link
                            href={`/news/${item.slug}`}
                            target="_blank"
                            className="bg-stone-900 hover:bg-black text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors w-full"
                          >
                            <span>वेबसाइट पर देखें</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleUnpublishDraft(item)}
                            className="text-stone-500 hover:text-stone-800 text-[11px] font-bold w-full text-center py-1 transition-colors cursor-pointer"
                          >
                            वापस ड्राफ्ट करें
                          </button>
                        </div>
                      )}

                      {/* PREVIEW BUTTON */}
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-1 lg:flex-none"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-600" />
                        <span>तथ्य समीक्षा</span>
                      </button>

                      {/* EDIT IN FORM */}
                      <button
                        type="button"
                        onClick={() => handleEditDraft(item)}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-1 lg:flex-none"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>एडिट करें</span>
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDeleteDraft(item)}
                        className="text-red-500 hover:text-red-700 text-[11px] font-bold py-1 px-2 transition-colors cursor-pointer ml-auto lg:ml-0"
                      >
                        हटाएं
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXTRACT NEW CLIPPING (UPLOADER & SAMPLES) */}
      {activeTab === 'extract' && (
        <div className="space-y-6">
          {/* Main Upload & Paste Container */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <h2 className="text-lg font-black text-stone-900">
                कतरन, PDF या ईमेल स्क्रीनशॉट अपलोड करें
              </h2>
              <p className="text-xs text-stone-500">
                PDF, JPG, PNG या WEBP फाइल खींचकर डालें या स्क्रीनशॉट लेकर सीधे <kbd className="bg-stone-200 px-1 py-0.5 rounded font-mono text-[10px]">Ctrl+V</kbd> दबाएं
              </p>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  processImageFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-[#EA580C] bg-orange-50/60 scale-[0.99]'
                  : 'border-stone-300 hover:border-[#EA580C] hover:bg-stone-50/80 bg-stone-50/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processImageFile(e.target.files[0]);
                  }
                }}
              />

              <div className="p-4 bg-orange-100/80 text-[#EA580C] rounded-2xl shadow-xs">
                <Upload className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <p className="font-black text-stone-800 text-sm">
                  कंप्यूटर से फ़ाइल चुनें या यहाँ ड्रैग करें
                </p>
                <p className="text-xs text-stone-500">
                  PDF (एकल व बहुपृष्ठ), JPG, JPEG, PNG, WEBP (अधिकतम 20MB)
                </p>
              </div>
            </div>

            {/* Clipboard Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClipboardButtonClick}
                className="bg-stone-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2.5 shadow-sm transition-all cursor-pointer"
              >
                <ClipboardPaste className="w-4 h-4 text-orange-400" />
                <span>📋 क्लिपबोर्ड से इमेज पेस्ट करें (Print Screen / Ctrl+V)</span>
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading Spinner */}
            {isProcessing && (
              <div className="p-8 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="inline-block animate-spin text-[#EA580C]">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <p className="font-black text-stone-800 text-sm">{processingStatus}</p>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  दैनिक मान्यवर पत्रकारिता शैली में तथ्यों का विश्लेषण, उल्टा पिरामिड संरचना, श्रेणियां, जनपद और पैराग्राफ ब्लॉक तैयार किए जा रहे हैं...
                </p>
              </div>
            )}
          </div>

          {/* 5 Real Benchmark Newspaper Samples Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#EA580C]" />
                  <span>5 वास्तविक अखबार कतरनें (1-क्लिक टेस्ट)</span>
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  सिस्टम की सटीकता जांचने के लिए इनमें से किसी भी नमूना कतरन पर क्लिक करें
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {samples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectSample(s.id)}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-[#EA580C] hover:shadow-lg transition-all p-4 cursor-pointer flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                      <Image
                        src={s.previewUrl}
                        alt={s.title}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs">
                        {s.sourceName}
                      </span>
                    </div>

                    <h4 className="font-black text-stone-900 text-xs sm:text-sm line-clamp-2 group-hover:text-[#EA580C] transition-colors leading-snug">
                      {s.title}
                    </h4>

                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] font-bold text-stone-500">
                    <span>{s.sourceDate}</span>
                    <span className="text-[#EA580C] font-black flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      1-क्लिक टेस्ट →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results View Container */}
          {extractedStories.length > 0 && activeStory && (
            <div id="akhbar-results-view" className="space-y-6 pt-6 border-t-2 border-stone-200">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-black text-sm">
                      दस्तावेज़ से प्रकाशन-योग्य ड्राफ्ट सफलतापूर्वक तैयार!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      स्थिति: <span className="font-bold underline">प्रारूप (DRAFT)</span> — समीक्षा करें और आवश्यकतानुसार एडिटोरियल फॉर्म में भेजें।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-stone-600" />
                    <span>{copied ? 'कॉपी हो गया!' : 'टेक्स्ट कॉपी करें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenInEditor}
                    className="bg-[#EA580C] hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>एडिटोरियल फॉर्म में खोलें (Open in Add News)</span>
                  </button>
                </div>
              </div>

              {/* Multi-story Tab Selector if more than 1 story detected */}
              {extractedStories.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-stone-700">
                    <Layers className="w-4 h-4 text-[#EA580C]" />
                    <span>पहचाने गए {extractedStories.length} समाचार:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {extractedStories.map((story, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedStoryIndex(idx);
                          setActiveStory(story);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left whitespace-nowrap transition-all border cursor-pointer ${
                          selectedStoryIndex === idx
                            ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-sm'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        समाचार #{idx + 1}: {story.headline.slice(0, 35)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-side Review Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Fact-Check & Source Info (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-black text-stone-900 text-xs uppercase tracking-wider">
                        स्रोत एवं तथ्य जाँच (Fact-Check)
                      </h4>
                    </div>

                    {/* Source File Preview */}
                    {sourceFileUrl && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                          मूल कतरन / दस्तावेज़
                        </span>
                        <div className="relative h-44 w-full rounded-xl overflow-hidden border border-stone-300 bg-white">
                          <Image
                            src={sourceFileUrl}
                            alt="Source Document"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Identified Entities */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                        पहचाने गए मुख्य तथ्य
                      </span>

                      {activeStory.factCheck?.names?.length > 0 && (
                        <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
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

                      {activeStory.factCheck?.locations?.length > 0 && (
                        <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
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

                      {(activeStory.factCheck?.numbers?.length > 0 || activeStory.factCheck?.dates?.length > 0) && (
                        <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                          <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                            <Hash className="w-3 h-3 text-amber-600" /> आंकड़े एवं तारीखें:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {[...(activeStory.factCheck.numbers || []), ...(activeStory.factCheck.dates || [])].map((num, i) => (
                              <span key={i} className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Editorial Draft (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                    {/* Meta Pills */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="bg-orange-50 text-[#EA580C] px-3 py-1 rounded-full font-black border border-orange-200 flex items-center gap-1">
                        <FolderTree className="w-3.5 h-3.5" />
                        <span>श्रेणी: {activeStory.categorySuggestion}</span>
                      </span>

                      {activeStory.districtSuggestion && (
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full font-black border border-red-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>जनपद: {activeStory.districtSuggestion}</span>
                        </span>
                      )}

                      <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-bold border border-stone-200">
                        प्रारूप: {activeStory.contentType === 'news' ? 'सामान्य समाचार' : activeStory.contentType}
                      </span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                        मुख्य शीर्षक (Headline)
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
                        {activeStory.headline}
                      </h2>
                    </div>

                    {/* Secondary Headline */}
                    {activeStory.secondaryHeadline && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                          उप-शीर्षक (Secondary Headline)
                        </span>
                        <p className="text-sm font-bold text-stone-700 leading-snug">
                          {activeStory.secondaryHeadline}
                        </p>
                      </div>
                    )}

                    {/* Extracted News Photo (NOT the full clipping) */}
                    {activeStory.featuredImage && (
                      <div className="space-y-1.5 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            कतरन से निकाला गया मुख्य चित्र (Extracted News Photo)
                          </span>
                          <span className="text-[10px] text-stone-500 font-bold">
                            केवल फोटो (कतरन का टेक्स्ट/विज्ञापन नहीं)
                          </span>
                        </div>
                        <div className="relative h-56 sm:h-64 w-full rounded-lg overflow-hidden border border-emerald-300 bg-white">
                          <Image
                            src={activeStory.featuredImage}
                            alt="Extracted News Photo"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Lead Summary */}
                    <div className="space-y-1 bg-amber-50/50 p-4 rounded-xl border border-amber-200/80">
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                        लीड पैराग्राफ / सारांश (Inverted Pyramid Lead)
                      </span>
                      <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                        {activeStory.excerpt}
                      </p>
                    </div>

                    {/* Paragraph Blocks */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                        विस्तृत समाचार पैराग्राफ ब्लॉक ({activeStory.paragraphBlocks?.length || 0})
                      </span>

                      <div className="space-y-3">
                        {activeStory.paragraphBlocks?.map((block, idx) => (
                          <div key={idx} className="bg-stone-50/80 p-4 rounded-xl border border-stone-200 space-y-1.5">
                            {block.subtitle && (
                              <h5 className="font-extrabold text-stone-900 text-xs text-[#EA580C]">
                                {block.subtitle}
                              </h5>
                            )}
                            <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                              {block.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    {activeStory.tagSuggestions && activeStory.tagSuggestions.length > 0 && (
                      <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mr-1">
                          टैग्स:
                        </span>
                        {activeStory.tagSuggestions.map((t: string, i: number) => (
                          <span key={i} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[11px] font-bold">
                            #{t.replace(/^#+/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAIL PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {previewItem.status === 'PUBLISHED' ? 'लाइव प्रकाशित' : 'प्रारूप (DRAFT)'}
                </span>
                <span className="text-xs text-stone-400">ID: #{previewItem.newsId}</span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Image & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {previewItem.featuredImage && (
                  <div className="relative h-44 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <Image
                      src={previewItem.featuredImage}
                      alt={previewItem.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                      निकाली गई मुख्य तस्वीर
                    </span>
                  </div>
                )}

                {previewItem.sourceClippingUrl && (
                  <div className="relative h-44 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <Image
                      src={previewItem.sourceClippingUrl}
                      alt="Source Clipping"
                      fill
                      className="object-contain"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                      मूल अखबार कतरन
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-lg font-black text-stone-900 leading-snug">
                  {previewItem.title}
                </h2>
                {previewItem.subtitle && (
                  <p className="text-xs font-bold text-stone-600">
                    {previewItem.subtitle}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              {previewItem.excerpt && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-stone-800 leading-relaxed font-medium">
                  {previewItem.excerpt}
                </div>
              )}

              {/* Fact Check Entities */}
              {previewItem.factCheck && (
                <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <h4 className="text-[11px] font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>पहचाने गए मुख्य तथ्य एवं सत्यापन</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {previewItem.factCheck.names?.length > 0 && (
                      <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-500">प्रमुख नाम:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {previewItem.factCheck.names.map((n, i) => (
                            <span key={i} className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-[10px] font-bold">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewItem.factCheck.locations?.length > 0 && (
                      <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-500">स्थान / जनपद:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {previewItem.factCheck.locations.map((l, i) => (
                            <span key={i} className="bg-red-50 text-red-900 px-2 py-0.5 rounded text-[10px] font-bold">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                बंद करें
              </button>

              <div className="flex items-center gap-2">
                {previewItem.status !== 'PUBLISHED' ? (
                  <button
                    onClick={() => {
                      const item = previewItem;
                      setPreviewItem(null);
                      handlePublishDraft(item);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>स्वीकृत कर प्रकाशित करें</span>
                  </button>
                ) : (
                  <Link
                    href={`/news/${previewItem.slug}`}
                    target="_blank"
                    className="bg-[#EA580C] hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5"
                  >
                    <span>वेबसाइट पर देखें ↗</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
