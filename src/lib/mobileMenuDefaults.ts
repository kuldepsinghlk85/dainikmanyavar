export interface BottomNavItem {
  id: string;
  label: string;
  icon: 'Home' | 'Newspaper' | 'Video' | 'Grid' | 'Search';
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
    { id: 'epaper', label: 'ई-पेपर', icon: 'Newspaper', href: '/epaper', enabled: true, order: 2 },
    { id: 'video', label: 'वीडियो', icon: 'Video', href: '/video', enabled: true, order: 3 },
    { id: 'menu', label: 'मेन्यू', icon: 'Grid', href: 'drawer', enabled: true, order: 4 },
    { id: 'search', label: 'खोजें', icon: 'Search', href: '/search', enabled: true, order: 5 },
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
