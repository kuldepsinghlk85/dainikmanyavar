'use client';

import React, { useState, useEffect } from 'react';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import MobileDrawer from '@/components/mobile/MobileDrawer';
import { MobileThemeProvider } from '@/components/mobile/MobileThemeProvider';
import { MobileMenuConfig, DEFAULT_MOBILE_MENU_CONFIG } from '@/lib/mobileMenuDefaults';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuConfig, setMenuConfig] = useState<MobileMenuConfig>(DEFAULT_MOBILE_MENU_CONFIG);
  const [activeCategories, setActiveCategories] = useState<{ name: string; slug: string }[]>([]);
  const [activeDistricts, setActiveDistricts] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch('/api/mobile/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.data) setMenuConfig(data.data);
          if (data.activeCategories) setActiveCategories(data.activeCategories);
          if (data.activeDistricts) setActiveDistricts(data.activeDistricts);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <MobileThemeProvider>
      <div className="min-h-screen bg-stone-100 dark:bg-[#0D0D0D] text-stone-900 dark:text-stone-100 flex flex-col font-sans max-w-lg mx-auto shadow-2xl border-x border-stone-200 dark:border-stone-800 transition-colors">
        <MobileHeader
          onOpenDrawer={() => setDrawerOpen(true)}
          config={menuConfig.header}
        />

        <main className="flex-1 pb-16">
          {children}
        </main>

        <MobileBottomNav
          onOpenDrawer={() => setDrawerOpen(true)}
          items={menuConfig.bottomNav}
        />

        <MobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          config={menuConfig.drawer}
          activeCategories={activeCategories}
          activeDistricts={activeDistricts}
        />
      </div>
    </MobileThemeProvider>
  );
}
