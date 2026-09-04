import React from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';

export default async function SEOAdminPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">SEO एवं 301 रिडायरेक्ट (SEO Settings)</h1>
        <p className="text-xs text-stone-500">Google News इंडेक्सिंग, मेटाडेटा और पुराने यूआरएल रिडायरेक्ट</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">सक्रिय SEO फीचर्स</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-bold text-stone-900">Dynamic NewsArticle JSON-LD</p>
              <p className="text-[10px] text-stone-500">Google News Schema.org तैयार है</p>
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-bold text-stone-900">Dynamic XML Sitemap</p>
              <p className="text-[10px] text-stone-500">http://localhost:3015/sitemap.xml</p>
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-bold text-stone-900">Dynamic RSS Feed</p>
              <p className="text-[10px] text-stone-500">http://localhost:3015/rss.xml</p>
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-bold text-stone-900">301 Redirect Engine</p>
              <p className="text-[10px] text-stone-500">पुराने /epaper और URL मैपिंग के लिए 301 रिडायरेक्ट</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
