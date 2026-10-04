import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert English numbers to Hindi digits if needed
export function toHindiNumerals(str: string | number): string {
  const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(str).replace(/\d/g, (d) => hindiDigits[parseInt(d, 10)]);
}

// Hindi formatted date: 26 अगस्त 2026, सुबह 10:45 बजे
export function formatHindiDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const months = [
    'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];

  const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

  const dayName = days[d.getDay()];
  const dateNum = d.getDate();
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'शाम' : 'सुबह';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${dateNum} ${monthName} ${year} | ${period} ${hours}:${minutes} बजे`;
}

// Hindi relative time: "5 मिनट पहले", "2 घंटे पहले"
export function formatHindiTimeAgo(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'अभी-अभी';
  if (diffMin < 60) return `${diffMin} मिनट पहले`;
  if (diffHour < 24) return `${diffHour} घंटे पहले`;
  if (diffDay < 30) return `${diffDay} दिन पहले`;

  return formatHindiDate(dateInput);
}

// Format views/likes count into K/M format: 12.4K, 1.2M
export function formatCount(count: number): string {
  if (!count) return '0';
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

// Calculate reading time in minutes
export function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const cleanText = text.replace(/<[^>]*>?/gm, '');
  const wordCount = cleanText.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 150));
}

// Slug generator for Hindi / English titles
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}\s-]+/gu, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate random short code for WhatsApp sharing
export function generateShortCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Canonical public site URL for clean social sharing.
// Guarantees localhost / 127.0.0.1 / internal IPs are never leaked in production shared links,
// while allowing local testing when explicitly developing locally on localhost.
export function getPublicSiteUrl(request?: { headers?: Headers | { get: (name: string) => string | null } }): string {
  // 1. If a server request object is passed, inspect headers
  if (request && typeof request.headers?.get === 'function') {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';

    if (host) {
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      // In development mode, if request came from localhost, allow localhost URL for testing
      if (isLocal && process.env.NODE_ENV !== 'production') {
        return `http://${host}`;
      }
      // If host is a real domain (e.g. dainikmanyavar.com)
      if (!isLocal) {
        return `${proto}://${host}`;
      }
    }
  }

  // 2. Client-side execution in browser
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, origin } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal && process.env.NODE_ENV !== 'production') {
      return origin;
    }
    if (!isLocal) {
      return origin;
    }
  }

  // 3. Environment variable fallback
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (
    envUrl &&
    !envUrl.includes('localhost') &&
    !envUrl.includes('127.0.0.1') &&
    !envUrl.includes('192.168.') &&
    !envUrl.includes('10.0.')
  ) {
    return envUrl.replace(/\/+$/, '');
  }

  // 4. Default production fallback
  return 'https://dainikmanyavar.com';
}

// Clean, short share URL format (e.g. https://dainikmanyavar.com/n/48 or /news/48)
// Eliminates ugly percent-encoding characters in WhatsApp and social messaging.
export function getShortShareUrl(
  article: { id?: string; newsId?: number | null; slug?: string },
  baseUrl?: string
): string {
  const siteUrl = (baseUrl || getPublicSiteUrl()).replace(/\/+$/, '');
  if (article.newsId && article.newsId > 0) {
    return `${siteUrl}/n/${article.newsId}`;
  }
  if (article.id) {
    return `${siteUrl}/n/${article.id}`;
  }
  return `${siteUrl}/n/${article.slug ? encodeURIComponent(article.slug) : ''}`;
}

// Canonical short news path for website navigation and clean browser address bar
export function getArticleUrl(
  article: { newsId?: number | null; slug?: string; id?: string },
  isMobile: boolean = false
): string {
  const prefix = isMobile ? '/mobile/news' : '/news';
  if (article.newsId && article.newsId > 0) {
    return `${prefix}/${article.newsId}`;
  }
  if (article.slug) {
    return `${prefix}/${encodeURIComponent(article.slug)}`;
  }
  return `${prefix}/${article.id || ''}`;
}

