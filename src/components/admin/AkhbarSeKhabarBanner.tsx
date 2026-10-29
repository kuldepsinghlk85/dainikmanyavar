'use client';

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  ClipboardPaste,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import AkhbarSeKhabarModal, { EnrichedEditorialStory } from './AkhbarSeKhabarModal';

interface AkhbarSeKhabarBannerProps {
  onApplyDraft: (draft: EnrichedEditorialStory) => void;
  existingFormFilled?: boolean;
}

export default function AkhbarSeKhabarBanner({
  onApplyDraft,
  existingFormFilled = false,
}: AkhbarSeKhabarBannerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/60 border-2 border-dashed border-[#EA580C]/40 hover:border-[#EA580C] rounded-2xl p-4 sm:p-5 transition-all shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#EA580C] text-white rounded-2xl shadow-sm shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-stone-900 text-sm sm:text-base">
                  अखबार से खबर (PDF / इमेज / क्लिपबोर्ड से समाचार तैयार करें)
                </h3>
                <span className="bg-[#EA580C] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase shadow-xs">
                  New Module
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                PDF, प्रेस विज्ञप्ति, ईमेल का स्क्रीनशॉट या अखबार की कतरन अपलोड करें या क्लिपबोर्ड से सीधे पेस्ट करके 1-क्लिक में हिंदी ड्राफ्ट तैयार करें।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="bg-[#EA580C] hover:bg-orange-700 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>कतरन से समाचार बनाएं</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-orange-200/60 text-[11px] text-stone-700 font-bold">
          <span className="text-stone-500 font-medium">सुविधाएं:</span>
          <span className="bg-white/80 border border-orange-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
            📄 PDF & स्कैन OCR
          </span>
          <span className="bg-white/80 border border-orange-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
            📋 Ctrl+V स्क्रीनशॉट पेस्ट
          </span>
          <span className="bg-white/80 border border-orange-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
            📑 मल्टी-स्टोरी पहचान (Multi-Story)
          </span>
          <span className="bg-white/80 border border-orange-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
            ✍️ पैराग्राफ ब्लॉक स्वतः निर्माण
          </span>
          <span className="bg-white/80 border border-orange-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
            🛡️ 100% ड्राफ्ट सुरक्षा
          </span>
        </div>
      </div>

      <AkhbarSeKhabarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApplyDraft={onApplyDraft}
        existingFormFilled={existingFormFilled}
      />
    </>
  );
}
