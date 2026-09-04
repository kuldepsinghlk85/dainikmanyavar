'use client';

import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle2, Sliders } from 'lucide-react';
import ImporterSubNav from '@/components/admin/ImporterSubNav';

export default function ImporterSettingsAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/importer/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message || 'मैनुअल फ़ाइल सफलता से इम्पोर्ट की गई!');
        setFile(null);
      } else {
        setMessage(data.error || 'इम्पोर्ट में त्रुटि हुई।');
      }
    } catch (err) {
      setMessage('सर्वर त्रुटि।');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <ImporterSubNav />
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">इम्पोर्ट सेटिंग्स एवं मैनुअल फ़ाइल अपलोड</h1>
        <p className="text-xs text-stone-500">JSON / CSV फ़ाइल से समाचार इम्पोर्ट करें व वैश्विक इम्पोर्ट नियम सेट करें</p>
      </div>

      {/* Manual File Upload Card */}
      <form onSubmit={handleFileUpload} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#F97316]" />
          <span>📁 मैनुअल JSON / CSV फ़ाइल इम्पोर्ट (Upload News File to Inbox)</span>
        </h3>

        <p className="text-xs text-stone-600">
          किसी भी अधिकृत प्रकाशक या कस्टम रिपोर्ट की JSON या CSV फ़ाइल अपलोड करें। सभी समाचार सीधे <strong>Import Inbox</strong> में प्राप्त होंगे:
        </p>

        <div className="space-y-2">
          <input
            type="file"
            accept=".json,.csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-[#C2410C] hover:file:bg-orange-200 cursor-pointer"
          />
          <p className="text-[11px] text-stone-400 font-mono">
            Supported Formats: .json (array of items) or .csv (columns: title, source_url, publisher, summary)
          </p>
        </div>

        {message && <p className="text-xs font-bold text-green-700">{message}</p>}

        <button
          type="submit"
          disabled={!file || uploading}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'इम्पोर्ट हो रहा है...' : 'फ़ाइल इनबॉक्स में अपलोड करें'}</span>
        </button>
      </form>

      {/* Global Security & Rate Limit Settings */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#F97316]" />
          <span>सुरक्षा एवं ऑटो-पब्लिश नियंत्रण</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <h4 className="font-bold text-amber-900">🔒 ऑटो-पब्लिश पूर्णतः प्रतिबंधित (Mandatory Rules)</h4>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              एक्सटर्नल सोर्सेज से प्राप्त खबरें सीधे सार्वजनिक वेबसाइट पर नहीं दिखेंगी। केवल ह्यूम सम्पादकीय समीक्षा एवं 'Create Draft' के बाद ही पब्लिश संभव होगा।
            </p>
          </div>

          <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl space-y-1">
            <h4 className="font-bold text-green-900">🛡️ SSRF सुरक्षा एवं IP ब्लॉकिंग</h4>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              localhost, 127.0.0.1, internal private IP ranges, तथा file:// एवं javascript:// प्रोटोकॉल स्वतः ब्लॉक किए जाते हैं।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
