'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Eye,
  X,
  Share2,
  Download,
  Check,
  Flame,
} from 'lucide-react';

interface VideoCardProps {
  src: string;
  badge: string;
  badgeIcon?: string;
  title: string;
  subtitle: string;
  tag: string;
}

function VideoReelCard({ src, badge, badgeIcon, title, subtitle, tag }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    // Attempt autoplay muted
    video.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-amber-500/30 shadow-xl hover:shadow-2xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between h-[520px]"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlay}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
      />

      {/* Ambient Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none" />

      {/* Top Badges */}
      <div className="relative z-10 p-3.5 flex items-center justify-between w-full pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md border border-amber-300/40">
          <span>{badgeIcon || '🕉️'}</span>
          <span>{badge}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          {tag}
        </span>
      </div>

      {/* Center Play/Pause Floating Icon (Smooth Fade) */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
          !isPlaying || showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/40 flex items-center justify-center text-white shadow-2xl transition-transform transform group-hover:scale-110">
          {isPlaying ? (
            <Pause className="w-6 h-6 text-amber-400 fill-amber-400" />
          ) : (
            <Play className="w-6 h-6 text-amber-400 fill-amber-400 ml-0.5" />
          )}
        </div>
      </div>

      {/* Bottom Info & Custom Controls Bar */}
      <div className="relative z-10 p-4 space-y-2.5">
        <div>
          <h4 className="text-white font-bold text-base leading-snug drop-shadow-md">
            {title}
          </h4>
          <p className="text-amber-200/90 text-xs mt-0.5 line-clamp-2 drop-shadow">
            {subtitle}
          </p>
        </div>

        {/* Video Progress Bar */}
        <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-amber-300 text-xs font-semibold backdrop-blur-md border border-amber-500/40 transition-colors pointer-events-auto"
            title={isMuted ? 'आवाज़ चालू करें (Unmute)' : 'आवाज़ बंद करें (Mute)'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                <span>आवाज़ खोलें</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-300">आवाज़ चालू</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-amber-300 backdrop-blur-md border border-amber-500/30 transition-colors pointer-events-auto"
            title="फ़ुल स्क्रीन देखें"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SanatanSpecialSection() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'दैनिक मान्यवर - भव्य पुनः लॉन्च एवं सनातन विशेष',
          text: 'श्रीकृष्ण जन्माष्टमी के पावन अवसर पर दैनिक मान्यवर का भव्य पुनः लॉन्च!',
          url: window.location.origin,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-[#1c120a] to-[#0f0904] border-2 border-amber-500/30 shadow-2xl p-4 sm:p-6 lg:p-7 my-6">
      {/* Decorative Aura Background Glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-6 border-b border-amber-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>श्रीकृष्ण जन्माष्टमी एवं भव्य पुनः लॉन्च विशेष</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400">
              दैनिक मान्यवर
            </span>
            <span className="text-stone-300 font-medium text-xl sm:text-2xl">|</span>
            <span className="text-stone-100">भव्य पुनः लॉन्च एवं सनातन विशेष</span>
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1.5 max-w-2xl font-normal">
            इस पावन अवसर पर आपके अपने समाचार पत्र का नया डिजिटल अवतार —{' '}
            <span className="text-amber-300 font-semibold">सच की धारा, जन-जन की पुकार</span>
          </p>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>बड़ा पोस्टर देखें</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all"
            title="शेयर करें"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'लिंक कॉपी हो गया' : 'शेयर करें'}</span>
          </button>
        </div>
      </div>

      {/* 3-Column Arrangement: Poster + Reel 1 + Reel 2 */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {/* CARD 1: Official Janmashtami Grand Relaunch Poster */}
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="group relative rounded-2xl overflow-hidden bg-stone-950 border border-amber-500/40 shadow-xl hover:shadow-2xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between cursor-pointer h-[520px]"
        >
          {/* Poster Image */}
          <div className="relative w-full h-full">
            <Image
              src="/imgg.jpg"
              alt="दैनिक मान्यवर - श्रीकृष्ण जन्माष्टमी भव्य पुनः लॉन्च पोस्टर"
              fill
              priority
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />
          </div>

          {/* Top Badges */}
          <div className="absolute top-0 left-0 right-0 z-10 p-3.5 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md border border-amber-300/40">
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              <span>भव्य पुनः लॉन्च</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              आधिकारिक घोषणा
            </span>
          </div>

          {/* Hover Zoom Hint in Center */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="px-4 py-2 rounded-full bg-black/75 backdrop-blur-md border border-amber-400 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2 transform group-hover:scale-105 transition-transform">
              <Eye className="w-4 h-4 text-amber-400" />
              ज़ूम करके पूरा पोस्टर देखें
            </span>
          </div>

          {/* Bottom Caption & Action */}
          <div className="relative z-10 p-4 space-y-2 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div>
              <h4 className="text-white font-bold text-base leading-snug drop-shadow">
                दैनिक मान्यवर का भव्य पुनः लॉन्च
              </h4>
              <p className="text-amber-200/90 text-xs mt-0.5 drop-shadow line-clamp-2">
                नई सोच, नई ऊर्जा और नए संकल्प के साथ... सच की धारा, जन-जन की पुकार
              </p>
            </div>
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-stone-300 flex items-center gap-1 font-medium">
                📱 QR कोड स्कैन कर वेबसाइट देखें
              </span>
              <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
                विस्तार से <Eye className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Sanatan Reel 1 (sanatan1.mp4 - Krishna Janmashtami / Dahi Handi) */}
        <VideoReelCard
          src="/sanatan1.mp4"
          badge="श्रीकृष्ण जन्मोत्सव"
          badgeIcon="🦚"
          title="माखन चोर, नंद किशोर | पावन दही हांडी उत्सव"
          subtitle="दैनिक मान्यवर का विशेष डिजिटल अनावरण व दिव्य प्रस्तुति"
          tag="सनातन रील #1"
        />

        {/* CARD 3: Sanatan Reel 2 (sanatan2.mp4 - Kashi Varanasi Ganga Aarti) */}
        <VideoReelCard
          src="/sanatan2.mp4"
          badge="काशी दिव्य गंगा आरती"
          badgeIcon="🔱"
          title="हर हर गंगे | काशी के पावन घाट व प्रभात आरती"
          subtitle="सनातन संस्कृति, भारतीय धरोहर एवं दैनिक मान्यवर संदेश"
          tag="सनातन रील #2"
        />
      </div>

      {/* Bottom Ticker / Brand Pledge */}
      <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-semibold text-stone-200">
            दैनिक मान्यवर - निष्पक्ष, निर्भीक, जन-सरोकारों को समर्पित पत्रकारिता
          </span>
        </div>
        <div className="flex items-center gap-4 text-stone-400">
          <span>वेबसाइट: <strong className="text-amber-300">www.dainikmanyavar.com</strong></span>
          <span>•</span>
          <span>संपादकीय कार्यालय: <strong>जौनपुर / लखनऊ</strong></span>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL FOR IMGG.JPG */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[92vh] flex flex-col items-center rounded-2xl overflow-hidden bg-stone-900 border-2 border-amber-500/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="w-full bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-3.5 px-4 border-b border-amber-500/30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                  विशेष पोस्टर
                </span>
                <h3 className="font-bold text-sm sm:text-base text-amber-300 truncate">
                  दैनिक मान्यवर - भव्य पुनः लॉन्च (श्रीकृष्ण जन्माष्टमी)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/imgg.jpg"
                  download="dainik-manyavar-relaunch-poster.jpg"
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 transition-colors"
                  title="पोस्टर डाउनलोड करें"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                  title="बंद करें (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Poster Image Container */}
            <div className="relative w-full flex-1 overflow-y-auto max-h-[calc(92vh-60px)] p-2 sm:p-4 flex justify-center bg-stone-950">
              <img
                src="/imgg.jpg"
                alt="दैनिक मान्यवर भव्य पुनः लॉन्च पोस्टर"
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl border border-amber-500/20"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
