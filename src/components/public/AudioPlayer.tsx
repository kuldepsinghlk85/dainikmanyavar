'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, RotateCcw, FastForward, Rewind } from 'lucide-react';
import { formatHindiTimeAgo } from '@/lib/utils';

interface AudioPlayerProps {
  articleId: string;
  title: string;
  content: string;
}

export default function AudioPlayer({ articleId, title, content }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [supported, setSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  const cleanSpeechText = (raw: string) => {
    return raw.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  };

  const handlePlayPause = () => {
    if (!supported) {
      alert('इस ब्राउज़र में Text-to-Speech उपलब्ध नहीं है।');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        window.speechSynthesis.cancel();
        const speechText = cleanSpeechText(`${title}। ${content}`);
        const u = new SpeechSynthesisUtterance(speechText);
        u.lang = 'hi-IN';
        u.rate = playbackSpeed;

        u.onend = () => {
          setIsPlaying(false);
          setProgress(100);
          fetch('/api/audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId, action: 'track_listen', eventName: 'audio_complete' }),
          }).catch(() => {});
        };

        utteranceRef.current = u;
        window.speechSynthesis.speak(u);
        setIsPlaying(true);

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
    if (utteranceRef.current && isPlaying) {
      window.speechSynthesis.cancel();
      const speechText = cleanSpeechText(`${title}। ${content}`);
      const u = new SpeechSynthesisUtterance(speechText);
      u.lang = 'hi-IN';
      u.rate = speed;
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="mt-4 p-3.5 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handlePlayPause}
          className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>{isPlaying ? '⏸ विराम दें' : '🔊 समाचार सुनें'}</span>
        </button>

        {isPlaying && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-medium">गति:</span>
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`text-xs px-2 py-1 rounded font-semibold ${
                  playbackSpeed === s
                    ? 'bg-[#EA580C] text-white'
                    : 'bg-white text-stone-700 border border-stone-300 hover:bg-orange-100'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
