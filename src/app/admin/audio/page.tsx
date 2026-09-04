import React from 'react';
import { db } from '@/lib/db';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { formatCount } from '@/lib/utils';

export default async function AudioAdminPage() {
  const audios = await db.articleAudio.findMany({
    orderBy: { generatedAt: 'desc' },
    take: 30,
    include: { article: true },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">ऑडियो TTS सेटिंग्स एवं विश्लेषण (Audio TTS)</h1>
        <p className="text-xs text-stone-500">हिन्दी टेक्स्ट-टू-स्पीच जनरेशन और ऑडियो श्रोता आंकड़े</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-stone-900">हाल ही में जनरेट किए गए ऑडियो ट्रैक्स ({audios.length})</h3>

        <div className="space-y-2">
          {audios.map((a) => (
            <div key={a.id} className="p-3 bg-orange-50/50 border border-orange-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#F97316]" />
                <div>
                  <p className="text-xs font-bold text-stone-900 line-clamp-1">{a.article.title}</p>
                  <p className="text-[10px] text-stone-500">Provider: {a.provider} | Voice: {a.voice} | Language: hi-IN</p>
                </div>
              </div>
              <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded text-[10px] font-bold">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
