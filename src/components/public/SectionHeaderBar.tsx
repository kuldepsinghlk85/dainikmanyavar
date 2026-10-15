'use client';

import React from 'react';

export interface HeaderThemeConfig {
  theme?: string; // 'default' | 'diwali' | 'holi' | 'navratri' | 'tricolor' | 'royal' | 'custom'
  animation?: string; // 'shimmer' | 'pulse' | 'wave' | 'none'
  customImage?: string; // URL of custom festive image strip
}

export interface SectionHeaderBarProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  themeConfig?: HeaderThemeConfig;
}

export default function SectionHeaderBar({
  title,
  icon,
  badge,
  action,
  className = '',
  themeConfig = {},
}: SectionHeaderBarProps) {
  const theme = themeConfig?.theme || 'default';
  const animation = themeConfig?.animation || 'shimmer';
  const customImage = themeConfig?.customImage || '';

  // Theme styling definitions
  const themeStyles = {
    default: {
      container: 'border-b-2 border-[#F97316] bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-transparent',
      shimmerColor: 'via-white/70',
      textColor: 'text-[#171717]',
      accentPill: 'bg-orange-500',
    },
    diwali: {
      container: 'border-b-2 border-amber-500 bg-gradient-to-r from-amber-100/80 via-orange-100/60 to-yellow-50/50 shadow-xs',
      shimmerColor: 'via-amber-200/80',
      textColor: 'text-stone-900',
      accentPill: 'bg-amber-500',
    },
    holi: {
      container: 'border-b-2 border-rose-500 bg-gradient-to-r from-rose-100/70 via-amber-100/60 via-emerald-100/50 to-sky-100/60 shadow-xs',
      shimmerColor: 'via-white/80',
      textColor: 'text-stone-900',
      accentPill: 'bg-rose-500',
    },
    navratri: {
      container: 'border-b-2 border-orange-600 bg-gradient-to-r from-orange-100/85 via-amber-100/70 to-red-50/60 shadow-xs',
      shimmerColor: 'via-amber-300/60',
      textColor: 'text-stone-900',
      accentPill: 'bg-orange-600',
    },
    tricolor: {
      container: 'border-b-2 border-orange-500 bg-gradient-to-r from-orange-100/80 via-white/90 to-emerald-100/70 shadow-xs',
      shimmerColor: 'via-white/90',
      textColor: 'text-stone-900',
      accentPill: 'bg-orange-500',
    },
    royal: {
      container: 'border-b-2 border-amber-600 bg-gradient-to-r from-rose-950/10 via-amber-900/10 to-amber-700/5 shadow-xs',
      shimmerColor: 'via-amber-100/70',
      textColor: 'text-stone-900',
      accentPill: 'bg-amber-600',
    },
    custom: {
      container: 'border-b-2 border-[#EA580C] bg-white/90 backdrop-blur-xs shadow-xs',
      shimmerColor: 'via-white/70',
      textColor: 'text-[#171717]',
      accentPill: 'bg-[#EA580C]',
    },
  }[theme] || {
    container: 'border-b-2 border-[#F97316] bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-transparent',
    shimmerColor: 'via-white/70',
    textColor: 'text-[#171717]',
    accentPill: 'bg-orange-500',
  };

  const isCustomImageActive = (theme === 'custom' || customImage.length > 0) && customImage;

  return (
    <div
      className={`relative overflow-hidden rounded-xl px-3 sm:px-4 py-2.5 mb-4 flex justify-between items-center transition-all duration-300 ${themeStyles.container} ${className}`}
    >
      {/* Optional Custom Background Image Strip (with high readability backdrop) */}
      {isCustomImageActive && (
        <>
          <div
            className="absolute inset-0 z-0 opacity-40 bg-repeat-x bg-contain bg-center pointer-events-none transition-opacity duration-300"
            style={{ backgroundImage: `url(${customImage})` }}
          />
          {/* Readability gradient overlay */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/90 via-white/75 to-white/90 pointer-events-none" />
        </>
      )}

      {/* Subtle Background Animation Layers */}
      {animation === 'shimmer' && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className={`w-1/2 h-full bg-gradient-to-r from-transparent ${themeStyles.shimmerColor} to-transparent opacity-60 transform -skew-x-20`}
            style={{
              animation: 'dmShimmerSweep 5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
        </div>
      )}

      {animation === 'pulse' && (
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-gradient-to-r from-orange-400/20 via-amber-300/25 to-orange-400/20"
          style={{
            animation: 'dmPulseGlow 3s ease-in-out infinite',
          }}
        />
      )}

      {animation === 'wave' && (
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-orange-300/25 to-transparent"
          style={{
            animation: 'dmWaveFlow 6s linear infinite',
          }}
        />
      )}

      {/* Foreground Left Content: Icon, Title & Badge */}
      <div className="relative z-10 flex items-center gap-2.5 min-w-0">
        {/* Subtle decorative accent pill bar */}
        <span className={`w-1.5 h-5 rounded-full ${themeStyles.accentPill} shrink-0`} />

        {icon && <span className="shrink-0 flex items-center">{icon}</span>}

        <div className={`text-lg sm:text-xl font-bold tracking-tight truncate ${themeStyles.textColor}`}>
          {title}
        </div>

        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Foreground Right Content: Action Link or Extra Controls */}
      {action && (
        <div className="relative z-10 shrink-0 ml-3">
          {action}
        </div>
      )}

      {/* Embedded Hardware-Accelerated Animations */}
      <style jsx>{`
        @keyframes dmShimmerSweep {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          40%, 100% {
            transform: translateX(350%) skewX(-20deg);
          }
        }
        @keyframes dmPulseGlow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.65;
          }
        }
        @keyframes dmWaveFlow {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
