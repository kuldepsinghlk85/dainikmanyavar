'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, RotateCcw, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  articleId: string;
  title: string;
  content: string;
}

export default function AudioPlayer({ articleId, title, content }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [totalChunks, setTotalChunks] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Audio & Speech references
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const engineRef = useRef<'html5' | 'webspeech'>('html5');
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const speedRef = useRef(1.0);

  // Clean raw HTML and split text into speakable sentence chunks (~150 chars each)
  const prepareChunks = (): string[] => {
    const raw = `${title}। ${content}`;
    const cleanText = raw
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\|/g, '।')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return [];

    // Split by sentence terminators (Hindi Purna Viram ।, newline, ?, !)
    const rawSentences = cleanText.split(/([।\n?!]+)/);
    const chunks: string[] = [];
    let current = '';

    for (let i = 0; i < rawSentences.length; i++) {
      const part = rawSentences[i].trim();
      if (!part) continue;

      if ((current + ' ' + part).length <= 160) {
        current = current ? current + ' ' + part : part;
      } else {
        if (current) chunks.push(current);
        if (part.length > 160) {
          // Break overly long sentence into word pieces
          const words = part.split(' ');
          let sub = '';
          for (const w of words) {
            if ((sub + ' ' + w).length <= 160) {
              sub = sub ? sub + ' ' + w : w;
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          current = sub;
        } else {
          current = part;
        }
      }
    }
    if (current) chunks.push(current);

    return chunks.length > 0 ? chunks : [cleanText.slice(0, 160)];
  };

  useEffect(() => {
    chunksRef.current = prepareChunks();
    setTotalChunks(chunksRef.current.length || 1);

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [title, content]);

  // Play next chunk using HTML5 Audio element
  const playNextHtml5Chunk = (index: number) => {
    const chunks = chunksRef.current;
    if (index >= chunks.length) {
      // Completed reading
      setIsPlaying(false);
      setCurrentChunkIndex(0);
      chunkIndexRef.current = 0;
      fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, action: 'track_listen', eventName: 'audio_complete' }),
      }).catch(() => {});
      return;
    }

    chunkIndexRef.current = index;
    setCurrentChunkIndex(index);

    const chunkText = chunks[index];
    const streamUrl = `/api/audio/stream?text=${encodeURIComponent(chunkText)}&lang=hi`;

    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audioRef.current = audio;
    }

    audio.src = streamUrl;
    audio.playbackRate = speedRef.current;

    audio.onended = () => {
      playNextHtml5Chunk(index + 1);
    };

    audio.onerror = (e) => {
      console.warn('Audio chunk error, attempting next chunk:', e);
      // Skip to next chunk rather than getting stuck
      playNextHtml5Chunk(index + 1);
    };

    setIsLoading(true);

    // Setup native MediaSession for Android/iOS lockscreen and notification controls
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && (window as any).MediaMetadata) {
      try {
        navigator.mediaSession.metadata = new (window as any).MediaMetadata({
          title: title,
          artist: 'दैनिक मान्यवर',
          album: 'ऑडियो समाचार बुलेटिन',
          artwork: [{ src: '/mobile-logo-dark.png', sizes: '192x192', type: 'image/png' }],
        });
      } catch (_) {}
    }

    audio
      .play()
      .then(() => {
        setIsLoading(false);
        setIsPlaying(true);
      })
      .catch((err) => {
        setIsLoading(false);
        console.warn('Audio play error:', err);
      });
  };

  const handlePlayPause = () => {
    // Immediately unlock audio element inside the synchronous user tap/click gesture
    if (audioRef.current) {
      try {
        if (!audioRef.current.src) {
          audioRef.current.load();
        }
      } catch (_) {}
    }

    if (isPlaying) {
      // Pause
      if (engineRef.current === 'html5' && audioRef.current) {
        audioRef.current.pause();
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
    } else {
      // Resume / Start
      if (engineRef.current === 'html5' && audioRef.current && audioRef.current.src && !audioRef.current.ended) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => playNextHtml5Chunk(chunkIndexRef.current));
      } else {
        // Start fresh from current chunk
        if (!chunksRef.current || chunksRef.current.length === 0) {
          chunksRef.current = prepareChunks();
        }

        // Use reliable HTML5 audio engine universally (works on 100% of mobile devices, native wrappers & WebViews)
        engineRef.current = 'html5';
        playNextHtml5Chunk(chunkIndexRef.current || 0);

        fetch('/api/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId, action: 'track_listen', eventName: 'audio_start' }),
        }).catch(() => {});
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    speedRef.current = speed;
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    chunkIndexRef.current = 0;
    setCurrentChunkIndex(0);
    playNextHtml5Chunk(0);
  };

  const progressPercent = totalChunks > 0 ? Math.min(100, Math.round(((currentChunkIndex + 1) / totalChunks) * 100)) : 0;

  return (
    <div className="my-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-stone-900 dark:to-[#1a1410] border border-orange-200 dark:border-amber-900/40 rounded-xl shadow-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-orange-700 active:scale-95 text-white px-4 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>विराम दें</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>{isLoading ? 'ऑडियो लोड हो रहा है...' : '🔊 समाचार सुनें'}</span>
            </>
          )}
        </button>

        {/* Speed Controls & Replay */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Replay */}
          {isPlaying && (
            <button
              type="button"
              onClick={handleReplay}
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-orange-600 active:scale-95 rounded-md hover:bg-white/60 dark:hover:bg-stone-800 transition-colors"
              title="पुनः सुनें"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-stone-800 border border-orange-200 dark:border-stone-700 rounded-lg p-0.5 text-xs font-bold">
            {[1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  playbackSpeed === s
                    ? 'bg-[#EA580C] text-white'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar (Visible while playing) */}
      {isPlaying && (
        <div className="mt-2.5 space-y-1">
          <div className="w-full bg-orange-200/60 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400 font-medium">
            <span>आवाज़ में समाचार प्रसारित हो रहा है...</span>
            <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
              {currentChunkIndex + 1} / {totalChunks}
            </span>
          </div>
        </div>
      )}

      {/* Hidden in-DOM HTML5 audio element for native Android/iOS WebView audio track binding */}
      <audio ref={audioRef} playsInline preload="auto" className="hidden" aria-hidden="true" />
    </div>
  );
}
