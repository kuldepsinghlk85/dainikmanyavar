'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, Globe } from 'lucide-react';
import { getShortShareUrl } from '@/lib/utils';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    id?: string;
    newsId?: number | null;
    slug?: string;
  };
  categoryName?: string;
  reviewData?: {
    movieName?: string;
    rating?: number;
    verdict?: string;
  } | null;
}

export default function SocialShareModal({
  isOpen,
  onClose,
  article,
  categoryName,
  reviewData,
}: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setHasNativeShare(true);
    }
  }, []);

  if (!isOpen || !article) return null;

  const shortUrl = getShortShareUrl(article);

  const getShareText = () => {
    if (reviewData && (reviewData.rating || reviewData.verdict)) {
      const stars = reviewData.rating ? `⭐ ${reviewData.rating}/5 स्टार` : '';
      const verdictText = reviewData.verdict ? `वर्डिक्ट: ${reviewData.verdict}` : '';
      const metaLine = [stars, verdictText].filter(Boolean).join(' | ');
      return `🎬 *${reviewData.movieName || article.title}*\n${metaLine ? `${metaLine}\n\n` : ''}*${article.title}*\n\nदैनिक मान्यवर पर पूरा रिव्यू पढ़ें:\n${shortUrl}`;
    }
    if (categoryName === 'मनोरंजन') {
      return `🎬 *${article.title}*\n\nदैनिक मान्यवर पर सिनेमा व मनोरंजन की खास खबर पढ़ें:\n${shortUrl}`;
    }
    return `*${article.title}*\n\nदैनिक मान्यवर पर पूरी खबर पढ़ें:\n${shortUrl}`;
  };

  const shareText = getShareText();

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: shareText,
          url: shortUrl,
        });
        onClose();
      } catch (_) {}
    }
  };

  const shareApps = [
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
      icon: '🟢',
      onClick: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
      },
    },
    {
      name: 'Facebook',
      color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      icon: '🔵',
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`, '_blank');
      },
    },
    {
      name: 'X (Twitter)',
      color: 'bg-black hover:bg-stone-800 text-white',
      icon: '𝕏',
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shortUrl)}`,
          '_blank'
        );
      },
    },
    {
      name: 'Telegram',
      color: 'bg-[#229ED9] hover:bg-[#1e8cc1] text-white',
      icon: '✈️',
      onClick: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(article.title)}`,
          '_blank'
        );
      },
    },
    {
      name: 'मैसेज (SMS)',
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: '💬',
      onClick: () => {
        window.open(`sms:?body=${encodeURIComponent(shareText)}`, '_blank');
      },
    },
    {
      name: 'LinkedIn',
      color: 'bg-[#0A66C2] hover:bg-[#095196] text-white',
      icon: '💼',
      onClick: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`,
          '_blank'
        );
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#181818] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 z-10 transition-colors animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-[#E53935]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 dark:text-white">
                खबर शेयर करें
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                ऐप चुनें या लिंक कॉपी करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Headline preview */}
        <div className="my-3 p-2.5 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800">
          <p className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-2 leading-relaxed">
            {article.title}
          </p>
        </div>

        {/* Short Link Display & Copy Button */}
        <div className="mb-4 flex items-center gap-2 p-2 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl">
          <div className="flex-1 truncate font-mono text-xs font-semibold text-amber-900 dark:text-amber-200 px-1">
            {shortUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="shrink-0 flex items-center gap-1 bg-white dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 px-3 py-1.5 rounded-lg text-xs font-black border border-stone-200 dark:border-stone-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">कॉपी हुआ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                <span>कॉपी करें</span>
              </>
            )}
          </button>
        </div>

        {/* App Chooser Grid */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
            ऐप चुनें:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {shareApps.map((app) => (
              <button
                key={app.name}
                onClick={() => {
                  app.onClick();
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer shadow-xs ${app.color}`}
              >
                <span className="text-lg leading-none mb-1">{app.icon}</span>
                <span className="text-[11px]">{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Device Native Share (if supported) */}
        {hasNativeShare && (
          <button
            onClick={handleNativeShare}
            className="w-full mt-3 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>अन्य ऐप्स (फोन शेयर मेन्यू खोलें)</span>
          </button>
        )}
      </div>
    </div>
  );
}
