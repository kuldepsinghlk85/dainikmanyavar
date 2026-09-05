'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Video, Grid, Search, User } from 'lucide-react';
import { BottomNavItem, DEFAULT_MOBILE_MENU_CONFIG } from '@/lib/mobileMenuDefaults';

interface MobileBottomNavProps {
  onOpenDrawer?: () => void;
  onOpenSearch?: () => void;
  items?: BottomNavItem[];
}

export default function MobileBottomNav({
  onOpenDrawer,
  onOpenSearch,
  items = DEFAULT_MOBILE_MENU_CONFIG.bottomNav,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  // Filter only enabled items and sort by order
  const activeItems = (items || DEFAULT_MOBILE_MENU_CONFIG.bottomNav)
    .filter((i) => i.enabled)
    .sort((a, b) => a.order - b.order);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'Newspaper':
        return <Newspaper className="w-5 h-5" />;
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Grid':
        return <Grid className="w-5 h-5" />;
      case 'Search':
        return <Search className="w-5 h-5" />;
      case 'User':
        return <User className="w-5 h-5" />;
      default:
        return <Grid className="w-5 h-5" />;
    }
  };

  const isCurrentActive = (item: BottomNavItem) => {
    if (item.id === 'home' || item.href === '/mobile') {
      return pathname === '/mobile' || pathname === '/';
    }
    if (item.href && item.href !== 'drawer' && item.href !== '#') {
      return pathname.startsWith(item.href);
    }
    return false;
  };

  if (activeItems.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200 px-2 py-1.5 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around">
        {activeItems.map((item) => {
          const isActive = isCurrentActive(item);

          // If item is drawer trigger
          if (item.id === 'menu' || item.href === 'drawer') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={onOpenDrawer}
                className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-extrabold text-stone-600 hover:text-stone-900 active:text-[#EA580C] cursor-pointer"
              >
                {getIcon(item.icon)}
                <span className="truncate max-w-[50px]">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-extrabold transition-colors ${
                isActive ? 'text-[#EA580C]' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {getIcon(item.icon)}
              <span className="truncate max-w-[50px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
