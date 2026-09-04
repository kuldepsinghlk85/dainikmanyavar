import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'दैनिक मान्यवर - सच के साथ... समाज के लिए...',
  description: 'दैनिक मान्यवर - निष्पक्ष, तेज़ और भरोसेमंद हिंदी डिजिटल समाचार पोर्टल',
  manifest: '/manifest.json',
  openGraph: {
    title: 'दैनिक मान्यवर - समाचार पोर्टल',
    description: 'सरल, तेज़ और आधुनिक हिंदी समाचार पोर्टल',
    url: 'https://dainikmanyawar.in',
    siteName: 'दैनिक मान्यवर',
    images: [{ url: '/logo.png' }],
    locale: 'hi_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-white text-[#171717] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
