import React, { Suspense } from 'react';
import Link from 'next/link';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import Footer from '@/components/public/Footer';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'संपर्क करें | विज्ञापन | समाचार की सूचना | पत्रकारिता - दैनिक मान्यवर',
  description: 'दैनिक मान्यवर के संपादक से संपर्क करें। विज्ञापन पूछताछ, समाचार की सूचना देने या पत्रकारिता से जुड़ने हेतु एकीकृत संपर्क पोर्टल।',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-stone-900 font-sans flex flex-col justify-between">
      <div>
        <TopBar />
        <Header />
        <Navigation />

        <main className="wrap py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
            <Link href="/" className="hover:text-[#EA580C]">होम</Link>
            <span>›</span>
            <span className="text-stone-800 font-bold">संपर्क करें (Contact Us)</span>
          </div>

          <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">फॉर्म लोड हो रहा है...</div>}>
            <ContactForm />
          </Suspense>
        </main>
      </div>

      <Footer />
    </div>
  );
}
