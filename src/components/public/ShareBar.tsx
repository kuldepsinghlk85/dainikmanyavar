'use client';

import React, { useState } from 'react';
import { Share2, Heart, Copy, Check } from 'lucide-react';
import { formatCount, getPublicSiteUrl } from '@/lib/utils';

interface ShareBarProps {
  articleId: string;
  title: string;
  slug: string;
  initialLikeCount?: number;
  categoryName?: string;
  reviewData?: {
    movieName?: string;
    rating?: number;
    verdict?: string;
    director?: string;
    cast?: string;
  } | null;
  isMobile?: boolean;
}

export default function ShareBar({
  articleId,
  title,
  slug,
  initialLikeCount = 0,
  categoryName,
  reviewData,
  isMobile = false,
}: ShareBarProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const siteUrl = getPublicSiteUrl();
  const articleUrl = `${siteUrl}${isMobile ? '/mobile' : ''}/news/${encodeURIComponent(slug)}`;

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikeCount((prev) => prev + 1);

    try {
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
    } catch (err) {}
  };

  const getWhatsAppShareText = () => {
    if (reviewData && (reviewData.rating || reviewData.verdict)) {
      const stars = reviewData.rating ? `⭐ ${reviewData.rating}/5 स्टार` : '';
      const verdictText = reviewData.verdict ? `वर्डिक्ट: ${reviewData.verdict}` : '';
      const metaLine = [stars, verdictText].filter(Boolean).join(' | ');
      return `🎬 *${reviewData.movieName || title}*\n${metaLine ? `${metaLine}\n\n` : ''}*${title}*\n\nदैनिक मान्यवर पर पूरा रिव्यू पढ़ें:\n${articleUrl}`;
    }
    if (categoryName === 'मनोरंजन') {
      return `🎬 *${title}*\n\nदैनिक मान्यवर पर सिनेमा व मनोरंजन की खास खबर पढ़ें:\n${articleUrl}`;
    }
    return `*${title}*\n\nदैनिक मान्यवर पर पूरी खबर पढ़ें:\n${articleUrl}`;
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getWhatsAppShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${title} | @dainikmanyawar`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(title);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: getWhatsAppShareText(),
          url: articleUrl,
        });
      } catch (err) {}
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-orange-50/80 via-amber-50/60 to-orange-50/80 border border-orange-200/90 rounded-2xl my-4 shadow-xs">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
          liked
            ? 'bg-red-600 text-white shadow-xs'
            : 'bg-white text-stone-800 border border-stone-300 hover:border-red-500 hover:text-red-600'
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-white text-white' : 'text-red-500'}`} />
        <span>{liked ? 'पसंद किया' : '❤️ Like'} ({formatCount(likeCount)})</span>
      </button>

      {/* Share Buttons Module */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleWhatsAppShare}
          className="bg-[#25D366] hover:bg-green-600 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
          title="व्हाट्सएप पर शेयर करें"
        >
          <span>🟢 WhatsApp</span>
        </button>

        <button
          onClick={handleFacebookShare}
          className="bg-[#1877F2] hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          title="Facebook"
        >
          Facebook
        </button>

        <button
          onClick={handleTwitterShare}
          className="bg-black hover:bg-stone-800 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          title="X / Twitter"
        >
          X
        </button>

        <button
          onClick={handleTelegramShare}
          className="bg-[#229ED9] hover:bg-sky-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          title="Telegram"
        >
          Telegram
        </button>

        <button
          onClick={handleCopyLink}
          className="bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
          title="लिंक कॉपी करें"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'कॉपी हो गया' : 'Copy'}</span>
        </button>

        <button
          onClick={handleNativeShare}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white p-2 rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer"
          title="अन्य माध्यमों पर शेयर करें"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
