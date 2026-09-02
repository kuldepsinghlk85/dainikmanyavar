import React from 'react';
import { db } from '@/lib/db';
import { LayoutTemplate, CheckCircle } from 'lucide-react';

export default async function HomepageAdminPage() {
  const sections = [
    { key: 'hero_story', title: 'मुख्य लीड स्टोरी (Hero Story)', layout: '2:1 Grid', enabled: true },
    { key: 'trending_news', title: '🔥 ट्रेंडिंग न्यूज़ (Trending Widget)', layout: 'Numbered List', enabled: true },
    { key: 'latest_news', title: '🕒 ताजा खबरें (Latest News Cards)', layout: '4 Column Cards', enabled: true },
    { key: 'district_news', title: '📍 जिले की खबरें (District Tabs)', layout: 'Tabbed Grid', enabled: true },
    { key: 'multi_tag_news', title: '# मल्टी टैग न्यूज़ (Multi-Tag Cards)', layout: '3 Column Grid', enabled: true },
    { key: 'video_news', title: '▶ वीडियो न्यूज़ (2 Video Bulletin)', layout: '2 Column Video', enabled: true },
    { key: 'popular_tags', title: '🏷️ लोकप्रिय टैग (Tag Cloud)', layout: 'Tag Cloud', enabled: true },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">होमपेज सेक्शन बिल्डर (Homepage Layout)</h1>
        <p className="text-xs text-stone-500">मुख्य पृष्ठ के सभी सेक्शन का क्रम और विजिबिलिटी प्रबंधित करें</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-3">
        {sections.map((sec, idx) => (
          <div key={sec.key} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-[#EA580C] text-white text-xs font-bold rounded flex items-center justify-center">
                {idx + 1}
              </span>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">{sec.title}</h3>
                <p className="text-xs text-stone-500">Layout: {sec.layout}</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Active</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
