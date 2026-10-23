'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Sparkles,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { OFFICIAL_SOCIAL_LINKS, OFFICIAL_HANDLES, buildSocialPostCaption } from '@/lib/social';

interface SocialPostGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    id: string;
    newsId?: number;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: string;
  };
}

export default function SocialPostGeneratorModal({
  isOpen,
  onClose,
  article,
}: SocialPostGeneratorModalProps) {
  const [copied, setCopied] = useState(false);
  const [caption, setCaption] = useState('');

  // Short share URL
  const shortUrl = article.newsId && article.newsId > 0
    ? `https://dainikmanyavar.com/n/${article.newsId}`
    : `https://dainikmanyavar.com/news/${encodeURIComponent(article.slug || article.id)}`;

  useEffect(() => {
    if (article) {
      setCaption(
        buildSocialPostCaption({
          title: article.title || '',
          shortUrl,
          excerpt: article.excerpt || '',
        })
      );
    }
  }, [article, shortUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setCaption(
      buildSocialPostCaption({
        title: article.title || '',
        shortUrl,
        excerpt: article.excerpt || '',
      })
    );
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(caption);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const openFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-start justify-between gap-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span>सोशल मीडिया पोस्ट क्रिएटर</span>
                <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Official Channels
                </span>
              </h2>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                Facebook, Instagram, YouTube व WhatsApp हेतु 1-क्लिक रेडी-टू-पोस्ट कैप्शन
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Official Channel Signature Badges */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
              <span>दैनिक मान्यवर आधिकारिक सोशल चैनल लिंक्स (शामिल हैं):</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[#EA580C] hover:underline flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                title="कैप्शन रीसेट करें"
              >
                <RefreshCw className="w-3 h-3" /> रीसेट
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="bg-[#FF0000] text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Youtube className="w-3 h-3" /> {OFFICIAL_HANDLES.youtube}
              </span>
              <span className="bg-gradient-to-r from-pink-600 to-amber-600 text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Instagram className="w-3 h-3" /> {OFFICIAL_HANDLES.instagram}
              </span>
              <span className="bg-[#1877F2] text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Facebook className="w-3 h-3" /> Facebook Page
              </span>
              <span className="bg-[#25D366] text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                💬 WhatsApp
              </span>
              <span className="bg-[#EA580C] text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Globe className="w-3 h-3" /> dainikmanyavar.com
              </span>
            </div>
          </div>

          {/* Editable Social Post Caption Textarea */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-800">
                सोशल मीडिया पोस्ट टेक्स्ट (एडिट या कॉपी करें):
              </label>
              <span className="text-[11px] text-stone-400 font-mono">
                {caption.length} अक्षर
              </span>
            </div>
            <textarea
              rows={11}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3.5 border border-stone-300 rounded-xl text-xs sm:text-sm font-sans bg-white leading-relaxed focus:outline-none focus:border-[#EA580C] shadow-2xs font-medium text-stone-900"
            />
          </div>

          {/* Quick Direct Sharing Links */}
          <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-200/80 space-y-2">
            <span className="block text-[11px] font-black text-stone-700">
              आधिकारिक प्लेटफॉर्म्स पर सीधा खोलें / शेयर करें:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openWhatsApp}
                className="px-3 py-1.5 bg-[#25D366] hover:bg-green-600 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-transform active:scale-95"
              >
                <span>💬 WhatsApp ब्रॉडकास्ट</span>
              </button>
              <button
                type="button"
                onClick={openFacebook}
                className="px-3 py-1.5 bg-[#1877F2] hover:bg-blue-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-transform active:scale-95"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook शेयर</span>
              </button>
              <a
                href={OFFICIAL_SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-amber-600 hover:opacity-90 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-transform active:scale-95"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram पेज</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
              <a
                href={OFFICIAL_SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#FF0000] hover:bg-red-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-transform active:scale-95"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>YouTube चैनल</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold text-xs cursor-pointer"
          >
            बंद करें
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-orange-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>पूरी पोस्ट कॉपी हो गई!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>पूरी पोस्ट कॉपी करें (Copy Post)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
