import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dainikmanyavar.com'),
  title: 'दैनिक मान्यवर - सच के साथ... समाज के लिए...',
  description: 'दैनिक मान्यवर - निष्पक्ष, तेज़ और भरोसेमंद हिंदी डिजिटल समाचार पोर्टल',
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://dainikmanyavar.com',
  },
  openGraph: {
    title: 'दैनिक मान्यवर - समाचार पोर्टल',
    description: 'सरल, तेज़ और आधुनिक हिंदी समाचार पोर्टल',
    url: 'https://dainikmanyavar.com',
    siteName: 'दैनिक मान्यवर',
    images: [{ url: '/logo.png', width: 600, height: 60, alt: 'दैनिक मान्यवर' }],
    locale: 'hi_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'दैनिक मान्यवर - समाचार पोर्टल',
    description: 'सरल, तेज़ और आधुनिक हिंदी समाचार पोर्टल',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

import NotificationPermissionModal from '@/components/public/NotificationPermissionModal';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-startup-image" href="/splash.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var observer = new MutationObserver(function(mutations) {
                  for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                      m.target.removeAttribute('bis_skin_checked');
                    }
                  }
                });
                observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
              } catch(e) {}

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {});
                });
              }
            `,
          }}
        />
        <GoogleAnalytics />
      </head>
      <body className="bg-white text-[#171717] antialiased" suppressHydrationWarning>
        {children}
        <NotificationPermissionModal />
      </body>
    </html>
  );
}
