'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (fullText: string, newChunk?: string) => void;
  lang?: string;
  className?: string;
  mode?: 'replace' | 'append';
  currentValue?: string;
  size?: 'sm' | 'md' | 'lg';
  placeholderHint?: string;
}

export default function VoiceInputButton({
  onTranscript,
  lang = 'hi-IN',
  className = '',
  mode = 'replace',
  currentValue = '',
  size = 'md',
  placeholderHint = 'बोलिए...',
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(true);
  const currentValueRef = useRef(currentValue);

  // Keep latest currentValue synced to avoid stale closures
  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('आपके ब्राउज़र में वॉइस टाइपिंग (Speech-to-Text) की सुविधा उपलब्ध नहीं है। कृपया Chrome ब्राउज़र का उपयोग करें।');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      // Keep continuous listening so microphone does not close on pauses
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('माइक चालू है... बोलिए');
      };

      recognition.onresult = (event: any) => {
        // Collect only new final chunks starting from event.resultIndex to prevent duplicate repeating words
        let newFinalText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newFinalText += event.results[i][0].transcript + ' ';
          }
        }
        newFinalText = newFinalText.trim();
        if (!newFinalText) return;

        if (mode === 'append') {
          const current = currentValueRef.current || '';
          const separator = current && !current.endsWith(' ') && !current.endsWith('\n') ? ' ' : '';
          const updated = current ? current + separator + newFinalText : newFinalText;
          currentValueRef.current = updated;
          onTranscript(updated, newFinalText);
        } else {
          currentValueRef.current = newFinalText;
          onTranscript(newFinalText, newFinalText);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isManuallyStoppedRef.current = true;
          setIsListening(false);
          setStatusMessage(null);
          alert('माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।');
        }
        // 'no-speech' is expected when user pauses to think; onend will seamlessly keep it alive
      };

      recognition.onend = () => {
        // If the user hasn't pressed stop button, seamlessly resume listening
        if (!isManuallyStoppedRef.current) {
          setTimeout(() => {
            if (!isManuallyStoppedRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (_) {}
            }
          }, 150);
        } else {
          setIsListening(false);
          setStatusMessage(null);
        }
      };

      isManuallyStoppedRef.current = false;
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setStatusMessage('माइक चालू है... बोलिए');
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
      setStatusMessage(null);
    }
  };

  const stopListening = () => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
    setStatusMessage(null);
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        aria-label={isListening ? 'बोलना बंद करें' : 'बोलकर लिखें (वॉइस टाइपिंग)'}
        title={isListening ? 'बोलना बंद करें' : 'बोलकर लिखें (हिंदी वॉइस टाइपिंग)'}
        className={`relative flex items-center justify-center rounded-lg transition-all cursor-pointer ${
          isListening
            ? 'bg-red-600 text-white shadow-md animate-pulse ring-2 ring-red-400 p-1.5'
            : 'text-stone-500 dark:text-stone-400 hover:text-[#EA580C] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 p-1.5'
        } ${className}`}
      >
        {isListening ? (
          <Mic className={`${iconSizes[size]} fill-white animate-bounce`} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </button>

      {/* Floating Tooltip Indicator when Listening */}
      {isListening && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-full shadow-lg whitespace-nowrap z-50 flex items-center gap-1 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>{statusMessage || 'बोलिए...'}</span>
        </span>
      )}
    </div>
  );
}
