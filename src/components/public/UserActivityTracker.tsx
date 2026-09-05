'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, Share2, Heart, MessageCircle } from 'lucide-react';

interface UserActivityTrackerProps {
  newsId: string;
  newsTitle: string;
  newsSlug: string;
  isMobile?: boolean;
}

export default function UserActivityTracker({
  newsId,
  newsTitle,
  newsSlug,
  isMobile = false,
}: UserActivityTrackerProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // 1. Initial View Log & Save status check
  useEffect(() => {
    if (!newsId) return;

    // Log VIEW
    fetch('/api/portal/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log',
        newsId,
        activityType: 'VIEW',
        device: isMobile ? 'mobile' : 'web',
      }),
    }).catch(() => {});

    // Check if saved
    fetch('/api/portal/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check-saved', articleId: newsId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.saved) {
          setIsSaved(true);
        }
      })
      .catch(() => {});

    // Track Read Duration on unmount
    const startTime = Date.now();
    return () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      if (durationSeconds > 5) {
        fetch('/api/portal/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'log',
            newsId,
            activityType: 'READ_TIME',
            readTime: durationSeconds,
            device: isMobile ? 'mobile' : 'web',
          }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [newsId, isMobile]);

  // Handle Save / Bookmark
  const handleToggleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-save', articleId: newsId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.saved);
      } else if (res.status === 401) {
        alert('कृपया समाचार सेव करने के लिए पहले लॉगिन करें।');
      }
    } catch (_) {
    } finally {
      setSaving(false);
    }
  };

  // Handle Tracked WhatsApp Share
  const handleWhatsAppShare = async () => {
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId, platform: 'whatsapp' }),
      });
      const data = await res.json();
      const generatedShareUrl = data.success ? data.shareUrl : window.location.href;
      setShareUrl(generatedShareUrl);

      const shareText = `*दैनिक मान्यवर*\n${newsTitle}\n\nपूरी खबर पढ़ें:\n${generatedShareUrl}`;
      const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waLink, '_blank');
    } catch (_) {
      const fallbackLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(newsTitle + ' ' + window.location.href)}`;
      window.open(fallbackLink, '_blank');
    }
  };

  // Handle Like
  const handleLike = async () => {
    if (isLiked) return;
    setIsLiked(true);
    try {
      await fetch('/api/portal/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log',
          newsId,
          activityType: 'LIKE',
          device: isMobile ? 'mobile' : 'web',
        }),
      });
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: newsId }),
      });
    } catch (_) {}
  };

  return (
    <div className="flex items-center gap-2 my-3 p-2 bg-stone-50 rounded-xl border border-stone-200">
      {/* Save Button */}
      <button
        onClick={handleToggleSave}
        disabled={saving}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
          isSaved
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
        }`}
        title={isSaved ? 'सेव किया गया' : 'बाद में पढ़ने के लिए सेव करें'}
      >
        {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4 text-stone-500" />}
        <span>{isSaved ? 'सहेजा गया' : 'सेव करें'}</span>
      </button>

      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
          isLiked
            ? 'bg-red-50 text-red-600 border border-red-200'
            : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-stone-500'}`} />
        <span>{isLiked ? 'पसंद आया' : 'पसंद'}</span>
      </button>

      {/* Tracked WhatsApp Share Button */}
      <button
        onClick={handleWhatsAppShare}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-colors cursor-pointer ml-auto"
      >
        <MessageCircle className="w-4 h-4" />
        <span>व्हाट्सएप शेयर</span>
      </button>
    </div>
  );
}
