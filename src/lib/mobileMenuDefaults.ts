export interface BottomNavItem {
  id: string;
  label: string;
  icon: 'Home' | 'Newspaper' | 'Video' | 'Grid' | 'Search' | 'Watch' | 'Stories' | 'User';
  href: string;
  enabled: boolean;
  order: number;
}

export interface HeaderButtonsConfig {
  menuButton: boolean;
  epaperBadge: boolean;
  searchButton: boolean;
  shareButton: boolean;
}

export interface DrawerConfig {
  homeLink: boolean;
  epaperLink: boolean;
  videoLink: boolean;
  showDistricts: boolean;
  showCategories: boolean;
  showDesktopSwitch: boolean;
  showContact: boolean;
}

export interface MobileMenuConfig {
  bottomNav: BottomNavItem[];
  header: HeaderButtonsConfig;
  drawer: DrawerConfig;
}

export const DEFAULT_MOBILE_MENU_CONFIG: MobileMenuConfig = {
  bottomNav: [
    { id: 'home', label: 'होम', icon: 'Home', href: '/mobile', enabled: true, order: 1 },
    { id: 'video', label: 'वीडियो', icon: 'Video', href: '/video', enabled: true, order: 2 },
    { id: 'search', label: 'सर्च', icon: 'Search', href: '/search', enabled: true, order: 3 },
    { id: 'watch', label: 'वॉच', icon: 'Watch', href: '/video', enabled: true, order: 4 },
    { id: 'webstories', label: 'वेब स्टोरीज', icon: 'Stories', href: '/mobile', enabled: true, order: 5 },
    { id: 'epaper', label: 'ई-पेपर', icon: 'Newspaper', href: '/epaper', enabled: true, order: 6 },
    { id: 'profile', label: 'प्रोफाइल', icon: 'User', href: '/user/dashboard', enabled: true, order: 7 },
  ],
  header: {
    menuButton: true,
    epaperBadge: true,
    searchButton: true,
    shareButton: true,
  },
  drawer: {
    homeLink: true,
    epaperLink: true,
    videoLink: true,
    showDistricts: true,
    showCategories: true,
    showDesktopSwitch: true,
    showContact: true,
  },
};
