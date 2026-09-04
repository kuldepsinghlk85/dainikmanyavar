'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  PlusCircle,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  FolderArchive,
  Search,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface LocationItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  image?: string | null;
  articleCount?: number;
  createdAt: string;
}

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'DISTRICT',
    image: '',
  });

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`/api/locations?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setLocations(data.data || []);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      type: 'DISTRICT',
      image: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (loc: LocationItem) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name,
      type: loc.type || 'DISTRICT',
      image: loc.image || '',
    });
    setIsModalOpen(true);
  };

  // Image File Upload with Automatic Archival
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('category', 'स्थान आर्काइव');
      uploadForm.append('caption', `स्थान चित्र: ${formData.name || file.name}`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        setMsg('स्थान का चित्र सफलतापूर्वक अपलोड हुआ और फोटो आर्काइव में सुरक्षित हो गया!');
      } else {
        alert(data.error || 'चित्र अपलोड करने में समस्या आई');
      }
    } catch (err) {
      alert('अपलोड विफल रहा।');
    }
    setUploading(false);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('कृपया स्थान का नाम दर्ज करें!');
      return;
    }

    setSubmitting(true);
    setMsg('');
    setErrorMsg('');

    try {
      if (editingLocation) {
        // PUT update
        const res = await fetch('/api/locations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingLocation.id,
            name: formData.name.trim(),
            type: formData.type,
            image: formData.image || null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMsg(data.message || 'स्थान सफलतापूर्वक अपडेट हो गया!');
          setIsModalOpen(false);
          fetchLocations();
        } else {
          setErrorMsg(data.error || 'अपडेट विफल रहा');
        }
      } else {
        // POST create
        const res = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            type: formData.type,
            image: formData.image || null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMsg(data.message || 'नया स्थान सफलतापूर्वक जोड़ा गया!');
          setIsModalOpen(false);
          fetchLocations();
        } else {
          setErrorMsg(data.error || 'स्थान जोड़ने में समस्या आई');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`क्या आप स्थान '${name}' को हटाना चाहते हैं?`)) return;

    try {
      const res = await fetch(`/api/locations?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message || 'स्थान हटा दिया गया');
        fetchLocations();
      } else {
        alert(data.error || 'हटाने में समस्या आई');
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#EA580C]" />
            <span>स्थान एवं जिले (Locations Manager)</span>
            <span className="bg-orange-100 text-[#EA580C] text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {locations.length} स्थान
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            उत्तर प्रदेश व पूर्वांचल के जिलों और शहरों की सूची — चित्र अपलोड व स्वतः आर्काइवल सपोर्ट
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Add New Location Button */}
          <button
            onClick={handleOpenAddModal}
            className="bg-[#EA580C] hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>➕ नया स्थान जोड़ें</span>
          </button>

          {/* Link to Photo Archiver */}
          <Link
            href="/admin/archive/media"
            className="bg-stone-800 hover:bg-stone-900 text-amber-400 px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all border border-stone-700"
          >
            <FolderArchive className="w-4 h-4 text-amber-400" />
            <span>🖼️ फोटो आर्काइवर लाइब्रेरी</span>
          </Link>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center animate-fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{msg}</span>
          </span>
          <button onClick={() => setMsg('')} className="text-green-700 font-bold hover:opacity-75">
            ×
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center animate-fade-in">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </span>
          <button onClick={() => setErrorMsg('')} className="text-red-700 font-bold hover:opacity-75">
            ×
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="स्थान या जिला खोजें..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-[#EA580C]"
          />
        </div>
        <span className="text-xs font-bold text-stone-500">
          कुल {locations.length} स्थान सूचीबद्ध
        </span>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-4 space-y-3">
        {locations.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <MapPin className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="font-extrabold text-stone-700 text-sm">कोई स्थान नहीं मिला।</p>
            <button
              onClick={handleOpenAddModal}
              className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
            >
              + नया स्थान जोड़ें
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 font-black text-stone-800 border-b border-stone-200">
                <tr>
                  <th className="p-3 w-16">चित्र</th>
                  <th className="p-3">स्थान नाम (Location)</th>
                  <th className="p-3">प्रकार (Type)</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">संबद्ध समाचार</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3">
                      <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center">
                        {loc.image ? (
                          <Image
                            src={loc.image}
                            alt={loc.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-extrabold text-stone-900 flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-[#EA580C] shrink-0" />
                      <span>{loc.name}</span>
                    </td>

                    <td className="p-3">
                      <span className="bg-orange-100 text-[#C2410C] px-2.5 py-0.5 rounded-full text-[10px] font-black">
                        {loc.type}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-stone-400 font-bold">{loc.slug}</td>

                    <td className="p-3 font-mono font-black text-stone-800">
                      {loc.articleCount || 0} खबरें
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(loc)}
                          className="p-2 bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-[#EA580C] rounded-xl transition-colors cursor-pointer"
                          title="संपादित करें"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(loc.id, loc.name)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors cursor-pointer"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl p-6 space-y-5 animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#EA580C]" />
                <span>{editingLocation ? 'स्थान संपादित करें' : 'नया स्थान / जिला जोड़ें'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              {/* Location Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-800">
                  स्थान / जिले का नाम (Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="उदा. अयोध्या, गाजीपुर, मऊ, भदोही..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              {/* Location Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-800">
                  प्रकार (Location Type)
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-[#EA580C]"
                >
                  <option value="DISTRICT">DISTRICT (जिला)</option>
                  <option value="CITY">CITY (शहर)</option>
                  <option value="STATE">STATE (राज्य)</option>
                  <option value="COUNTRY">COUNTRY (देश)</option>
                  <option value="LOCAL_AREA">LOCAL_AREA (स्थानीय क्षेत्र / तहसील)</option>
                </select>
              </div>

              {/* Image Upload with Automatic Archival */}
              <div className="space-y-2 p-3.5 bg-orange-50/50 rounded-2xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#C2410C] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#EA580C]" />
                    <span>स्थान का चित्र / फोटो (Automatic Archival)</span>
                  </label>
                  <span className="text-[10px] bg-orange-200/70 text-orange-900 font-bold px-2 py-0.5 rounded-md">
                    ऑटो-आर्काइव
                  </span>
                </div>

                <p className="text-[11px] text-stone-600 font-medium">
                  अपलोड किया गया चित्र स्वतः <strong>'स्थान आर्काइव'</strong> श्रेणी में भविष्य के उपयोग हेतु सुरक्षित हो जाएगा।
                </p>

                {/* Image Preview & Upload Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-white border border-stone-300 shrink-0 flex items-center justify-center shadow-xs">
                    {formData.image ? (
                      <Image
                        src={formData.image}
                        alt="Location Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>{uploading ? 'अपलोड हो रहा है...' : 'कंप्यूटर से चित्र चुनें'}</span>
                      </button>

                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="text-xs text-red-600 hover:underline font-bold px-2"
                        >
                          हटाएं
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="अथवा इमेज URL पेस्ट करें..."
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-mono text-stone-800 focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{editingLocation ? 'अपडेट करें' : 'स्थान सहेजें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
