'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/admin/ImageUploader';
import { Megaphone, Save, CheckCircle2, Eye, MousePointer, Link as LinkIcon } from 'lucide-react';

interface AdSlotItem {
  id: string;
  name: string;
  position: string;
  desktopCreative?: string;
  targetUrl?: string;
  active: boolean;
  impressions: number;
  clicks: number;
}

export default function AdsAdminPage() {
  const [slots, setSlots] = useState<AdSlotItem[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/admin/ads');
      const data = await res.json();
      if (data.success) setSlots(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleUpdateSlot = async (slot: AdSlotItem) => {
    setLoadingId(slot.id);
    setMessage('');

    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: slot.position,
          name: slot.name,
          desktopCreative: slot.desktopCreative,
          targetUrl: slot.targetUrl,
          active: slot.active,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`'${slot.name}' विज्ञापन स्लॉट सफलतापूर्वक अपडेट हो गया!`);
        fetchSlots();
      } else {
        alert(data.error || 'अपडेट में त्रुटि');
      }
    } catch (err) {
      alert('सर्वर त्रुटि');
    } finally {
      setLoadingId(null);
    }
  };

  const handleChangeField = (id: string, field: keyof AdSlotItem, value: any) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#F97316]" />
            <span>विज्ञापन प्रबंधन (Ad Manager)</span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            हेडर बैनर तथा साइडबार के 3 विज्ञापन स्थानों पर रियल इमेज बैनर या संपर्क यूआरएल सेट करें
          </p>
        </div>

        {message && <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">{message}</span>}
      </div>

      {/* Ad Slots Editor Grid */}
      <div className="grid grid-cols-1 gap-6">
        {slots.map((slot) => (
          <div key={slot.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center border-b border-stone-100 pb-3 gap-2">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <span>{slot.name}</span>
                </h3>
                <span className="text-[11px] font-mono text-stone-400">Position ID: {slot.position}</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-extrabold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slot.active}
                    onChange={(e) => handleChangeField(slot.id, 'active', e.target.checked)}
                    className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316]"
                  />
                  <span>{slot.active ? '🟢 विज्ञापन सक्रिय (Active)' : '🔴 निष्क्रिय (Inactive)'}</span>
                </label>

                <button
                  onClick={() => handleUpdateSlot(slot)}
                  disabled={loadingId === slot.id}
                  className="bg-[#EA580C] hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{loadingId === slot.id ? 'सेव हो रहा है...' : 'सुरक्षित करें'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Creative Image Upload */}
              <div>
                <ImageUploader
                  label="विज्ञापन बैनर फोटो (Ad Image Creative)"
                  value={slot.desktopCreative || ''}
                  onChange={(url) => handleChangeField(slot.id, 'desktopCreative', url)}
                />

                {slot.desktopCreative && (
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <Image src={slot.desktopCreative} alt={slot.name} fill unoptimized className="object-contain" />
                  </div>
                )}
              </div>

              {/* Target Link & Stats */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>लक्ष्य यूआरएल / लिंक (Target URL on Click)</span>
                  </label>
                  <input
                    type="text"
                    value={slot.targetUrl || ''}
                    onChange={(e) => handleChangeField(slot.id, 'targetUrl', e.target.value)}
                    placeholder="https://example.com या /advertise"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-around text-xs font-bold text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>इम्प्रेसन्स: {slot.impressions || 0}</span>
                  </div>
                  <span className="text-stone-300">|</span>
                  <div className="flex items-center gap-1.5">
                    <MousePointer className="w-4 h-4 text-green-600" />
                    <span>क्लिक्स: {slot.clicks || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
