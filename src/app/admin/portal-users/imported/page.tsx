'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export default function ImportedUsersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultStats, setResultStats] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentImported, setRecentImported] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecentImported = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/portal-users?imported=true&limit=30');
      const data = await res.json();
      if (data.success) {
        setRecentImported(data.data || []);
      }
    } catch (_) {
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchRecentImported();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage('');
      setResultStats(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('कृपया पहले एक एक्सेल (.xlsx / .csv) फ़ाइल चुनें।');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setResultStats(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/portal-users/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || 'इम्पोर्ट करने में समस्या आई।');
      } else {
        setResultStats(data.stats);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchRecentImported();
      }
    } catch (err) {
      setErrorMessage('सर्वर से संपर्क करने में विफल। कृपया पुनः प्रयास करें।');
    } finally {
      setUploading(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadSample = () => {
    const sampleData = [
      { 'Name': 'राहुल शर्मा', 'Mobile': '9876543210', 'Email': 'rahul@example.com', 'City': 'वाराणसी' },
      { 'Name': 'अमित सिंह', 'Mobile': '9876543211', 'Email': 'amit@example.com', 'City': 'जौनपुर' },
      { 'Name': 'प्रिया यादव', 'Mobile': '9876543212', 'Email': 'priya@example.com', 'City': 'लखनऊ' },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SampleUsers');
    XLSX.writeFile(wb, 'dainik-manyavar-user-import-template.xlsx');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-[#EA580C]" />
            <span>एक्सेल यूज़र इम्पोर्ट (Excel User Import System)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            हजारों पाठकों को एक क्लिक में .xlsx फ़ाइल द्वारा डेटाबेस व न्यूज़लेटर में जोड़ें
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-stone-600" />
          <span>सैंपल एक्सेल टेम्पलेट डाउनलोड (.xlsx)</span>
        </button>
      </div>

      {/* Process Flow Steps */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-4 rounded-2xl border border-orange-200">
        <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider mb-2">
          इम्पोर्ट ऑटोमेशन प्रक्रिया (Step-by-step Process):
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-xs">
            <span className="w-5 h-5 bg-orange-100 text-[#EA580C] font-bold rounded-full inline-flex items-center justify-center text-[10px] mb-1">1</span>
            <p className="font-bold text-stone-800 text-[11px]">Excel Upload</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-xs">
            <span className="w-5 h-5 bg-orange-100 text-[#EA580C] font-bold rounded-full inline-flex items-center justify-center text-[10px] mb-1">2</span>
            <p className="font-bold text-stone-800 text-[11px]">Validate Data</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-xs">
            <span className="w-5 h-5 bg-orange-100 text-[#EA580C] font-bold rounded-full inline-flex items-center justify-center text-[10px] mb-1">3</span>
            <p className="font-bold text-stone-800 text-[11px]">Remove Duplicates</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-xs">
            <span className="w-5 h-5 bg-orange-100 text-[#EA580C] font-bold rounded-full inline-flex items-center justify-center text-[10px] mb-1">4</span>
            <p className="font-bold text-stone-800 text-[11px]">Import Users</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-xs col-span-2 md:col-span-1">
            <span className="w-5 h-5 bg-green-100 text-green-700 font-bold rounded-full inline-flex items-center justify-center text-[10px] mb-1">5</span>
            <p className="font-bold text-green-800 text-[11px]">Add To Newsletter</p>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200">
        <form onSubmit={handleUploadSubmit} className="space-y-4 max-w-xl mx-auto text-center">
          <div className="border-2 border-dashed border-stone-300 hover:border-[#EA580C] rounded-2xl p-8 transition-colors bg-stone-50/50">
            <FileSpreadsheet className="w-12 h-12 text-[#EA580C] mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-800 mb-1">
              {file ? file.name : 'एक्सेल फ़ाइल चुनें या ड्रैग एंड ड्रॉप करें'}
            </p>
            <p className="text-xs text-stone-400 mb-4">समर्थित फॉर्मेट: .xlsx, .xls, .csv</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file-input"
            />
            <label
              htmlFor="excel-file-input"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl cursor-pointer inline-block"
            >
              कंप्यूटर से फ़ाइल चुनें
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3 bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-700 hover:to-orange-800 text-white font-black text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? 'डेटा सत्यापित एवं इम्पोर्ट किया जा रहा है...' : 'डेटाबेस में इम्पोर्ट करें (Import Now)'}
          </button>
        </form>

        {/* Success Report */}
        {resultStats && (
          <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-green-900 font-black text-sm mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>इम्पोर्ट प्रक्रिया सफलतापूर्ण संपन्न हुई!</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-green-100 shadow-xs">
                <span className="text-xs text-stone-500 block font-medium">कुल पंक्तियां</span>
                <strong className="text-lg text-stone-900 font-mono">{resultStats.totalRows}</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-green-100 shadow-xs">
                <span className="text-xs text-green-600 block font-medium">सफलतापूर्वक इम्पोर्ट</span>
                <strong className="text-lg text-green-700 font-mono">{resultStats.importedCount}</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-green-100 shadow-xs">
                <span className="text-xs text-amber-600 block font-medium">छोड़े गए डुप्लिकेट</span>
                <strong className="text-lg text-amber-700 font-mono">{resultStats.duplicatesCount}</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-green-100 shadow-xs">
                <span className="text-xs text-red-600 block font-medium">अमान्य रिकॉर्ड</span>
                <strong className="text-lg text-red-700 font-mono">{resultStats.invalidCount}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recently Imported Users Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-stone-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#EA580C]" />
            <span>हाल ही में एक्सेल से इम्पोर्ट किए गए यूज़र्स</span>
          </h3>
          <button
            onClick={fetchRecentImported}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loadingList ? (
          <p className="text-xs text-stone-500 py-8 text-center">लोड हो रहा है...</p>
        ) : recentImported.length === 0 ? (
          <p className="text-xs text-stone-400 py-8 text-center">अभी तक कोई इम्पोर्टेड यूज़र नहीं है।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100/70 text-stone-700 uppercase font-black text-[10px]">
                  <th className="p-3">यूज़र नाम</th>
                  <th className="p-3">मोबाइल</th>
                  <th className="p-3">ईमेल</th>
                  <th className="p-3">शहर</th>
                  <th className="p-3">पंजीकरण तिथि</th>
                  <th className="p-3">न्यूज़लेटर स्टेटस</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {recentImported.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900">{u.fullName}</td>
                    <td className="p-3 font-mono font-bold text-stone-700">+91 {u.mobileNumber}</td>
                    <td className="p-3 text-stone-600">{u.email || '—'}</td>
                    <td className="p-3 text-stone-600">{u.city || 'वाराणसी'}</td>
                    <td className="p-3 text-stone-500 text-[11px]">
                      {new Date(u.registrationDate).toLocaleDateString('hi-IN')}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        सक्रिय
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
