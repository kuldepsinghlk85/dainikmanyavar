'use client';

import React, { useState } from 'react';
import { Share2, Heart, Copy, Check } from 'lucide-react';
import { formatCount } from '@/lib/utils';

interface ShareBarProps {
  articleId: string;
  title: string;
  slug: string;
  initialLikeCount?: number;
}

export default function ShareBar({ articleId, title, slug, initialLikeCount = 0 }: ShareBarProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dainikmanyawar.in';
  const articleUrl = `${siteUrl}/news/${slug}`;

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

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`*${title}*\n\nपूरी खबर पढ़ें दैनिक मान्यवर पर:\n${articleUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${title} via @dainikmanyawar`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
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
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl my-4">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
          liked
            ? 'bg-red-600 text-white shadow-sm'
            : 'bg-white text-stone-800 border border-stone-300 hover:border-red-500 hover:text-red-600'
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-white' : 'fill-none'}`} />
        <span>{liked ? 'पसंद किया' : '❤️ Like'} ({formatCount(likeCount)})</span>
      </button>

      {/* Share Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleWhatsAppShare}
          className="bg-[#16A34A] hover:bg-green-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          🟢 WhatsApp पर शेयर करें
        </button>

        <button
          onClick={handleFacebookShare}
          className="bg-[#1877F2] hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
        >
          Facebook
        </button>

        <button
          onClick={handleTwitterShare}
          className="bg-black hover:bg-stone-800 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
        >
          X / Twitter
        </button>

        <button
          onClick={handleCopyLink}
          className="bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'कॉपी हो गया' : 'Copy Link'}</span>
        </button>

        <button
          onClick={handleNativeShare}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white p-2 rounded-lg text-xs flex items-center justify-center transition-colors cursor-pointer sm:hidden"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
