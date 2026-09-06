'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Layers,
  Building2,
  RefreshCw,
} from 'lucide-react';

interface LocationItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  parentId?: string | null;
  parentName?: string | null;
  image?: string | null;
  articleCount?: number;
  active?: boolean;
  createdAt: string;
}

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'DISTRICT',
    parentId: '',
    image: '',
    active: true,
  });

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const nextActive = !currentActive;
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, active: nextActive } : loc))
    );

    try {
      const res = await fetch('/api/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: nextActive }),
      });
      const data = await res.json();
      if (!data.success) {
        setLocations((prev) =>
          prev.map((loc) => (loc.id === id ? { ...loc, active: currentActive } : loc))
        );
        setErrorMsg(data.error || 'स्थिति बदलने में विफल');
      } else {
        setMsg(data.message || 'स्थिति सफलतापूर्वक अपडेट हो गई!');
      }
    } catch (e: any) {
      setLocations((prev) =>
        prev.map((loc) => (loc.id === id ? { ...loc, active: currentActive } : loc))
      );
      setErrorMsg('स्थिति बदलने में विफल');
    }
  };

  const handleBulkToggle = async (type: string, active: boolean) => {
    const typeLabel = type === 'DISTRICT' ? 'सभी जिलों' : 'सभी स्थानों';
    const actionLabel = active ? 'सक्रिय (Enable)' : 'निष्क्रिय (Disable)';
    if (!confirm(`क्या आप ${typeLabel} को ${actionLabel} करना चाहते हैं?`)) return;

    setSyncing(true);
    try {
      const res = await fetch('/api/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulk: true, type, active }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchLocations();
      } else {
        setErrorMsg(data.error || 'कार्रवाई विफल रही');
      }
    } catch (e: any) {
      setErrorMsg('कार्रवाई विफल रही');
    }
    setSyncing(false);
  };

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

  // Extract available Mandals (Divisions) for parent selection
  const divisions = useMemo(() => {
    return locations.filter((loc) => loc.type === 'DIVISION');
  }, [locations]);

  // Counts
  const counts = useMemo(() => {
    const total = locations.length;
    const divisionCount = locations.filter((l) => l.type === 'DIVISION').length;
    const districtCount = locations.filter((l) => l.type === 'DISTRICT').length;
    const cityCount = locations.filter((l) => l.type === 'CITY').length;
    return { total, divisionCount, districtCount, cityCount };
  }, [locations]);

  // Filtered list by type tab
  const filteredLocations = useMemo(() => {
    if (selectedType === 'ALL') return locations;
    return locations.filter((l) => l.type === selectedType);
  }, [locations, selectedType]);

  const handleOpenAddModal = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      type: 'DISTRICT',
      parentId: '',
      image: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (loc: LocationItem) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name,
      type: loc.type || 'DISTRICT',
      parentId: loc.parentId || '',
      image: loc.image || '',
      active: loc.active !== false,
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
            parentId: formData.parentId || null,
            image: formData.image || null,
            active: formData.active !== false,
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
            parentId: formData.parentId || null,
            image: formData.image || null,
            active: formData.active !== false,
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
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#EA580C]" />
            <span>उत्तर प्रदेश: स्थान, मंडल एवं जिले (Locations Manager)</span>
            <span className="bg-orange-100 text-[#EA580C] text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {counts.total} कुल स्थान
            </span>
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1 flex flex-wrap items-center gap-2">
            <span>उत्तर प्रदेश के 18 मंडल एवं 75 जिले व्यवस्थित रूप से सूचीबद्ध</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-300" />
            <span className="text-purple-700 font-bold">18 मंडल (Divisions)</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-300" />
            <span className="text-orange-700 font-bold">75 जिले (Districts)</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bulk Toggle Buttons */}
          <button
            type="button"
            onClick={() => handleBulkToggle('DISTRICT', true)}
            disabled={syncing}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="सभी 75 जिलों को सक्षम करें"
          >
            <span>✅ सभी जिले सक्षम करें</span>
          </button>
          <button
            type="button"
            onClick={() => handleBulkToggle('DISTRICT', false)}
            disabled={syncing}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="सभी जिलों को अक्षम करें"
          >
            <span>⏸️ सभी जिले अक्षम करें</span>
          </button>

          {/* Add New Location Button */}
          <button
            onClick={handleOpenAddModal}
            className="bg-[#EA580C] hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>➕ नया स्थान जोड़ें</span>
          </button>

          {/* Link to Photo Archiver */}
          <Link
            href="/admin/archive/media"
            className="bg-stone-800 hover:bg-stone-900 text-amber-400 px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all border border-stone-700 active:scale-95"
          >
            <FolderArchive className="w-4 h-4 text-amber-400" />
            <span>🖼️ फोटो आर्काइवर</span>
          </Link>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center animate-fade-in shadow-xs">
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
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-bold flex justify-between items-center animate-fade-in shadow-xs">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </span>
          <button onClick={() => setErrorMsg('')} className="text-red-700 font-bold hover:opacity-75">
            ×
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-xl border border-stone-200 text-xs font-black">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedType === 'ALL'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            सभी ({counts.total})
          </button>
          <button
            onClick={() => setSelectedType('DIVISION')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              selectedType === 'DIVISION'
                ? 'bg-purple-700 text-white shadow-xs font-black'
                : 'text-purple-800 hover:bg-purple-100/60'
            }`}
          >
            <span>🏛️ मंडल ({counts.divisionCount})</span>
          </button>
          <button
            onClick={() => setSelectedType('DISTRICT')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              selectedType === 'DISTRICT'
                ? 'bg-[#EA580C] text-white shadow-xs font-black'
                : 'text-orange-800 hover:bg-orange-100/60'
            }`}
          >
            <span>📍 जिले ({counts.districtCount})</span>
          </button>
          {counts.cityCount > 0 && (
            <button
              onClick={() => setSelectedType('CITY')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedType === 'CITY'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-blue-800 hover:bg-blue-100/60'
              }`}
            >
              शहर ({counts.cityCount})
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="मंडल, जिला या शहर खोजें..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-[#EA580C]"
          />
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-4 space-y-3">
        {filteredLocations.length === 0 ? (
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
                  <th className="p-3 w-20">चित्र</th>
                  <th className="p-3">स्थान नाम (Location)</th>
                  <th className="p-3">प्रकार (Type)</th>
                  <th className="p-3">संबद्ध मंडल (Parent Division)</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">संबद्ध समाचार</th>
                  <th className="p-3 text-center">स्थिति (Status)</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Image Column */}
                    <td className="p-3">
                      <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center shadow-2xs">
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

                    {/* Name Column */}
                    <td className="p-3 font-extrabold text-stone-900">
                      <div className="flex items-center gap-2">
                        {loc.type === 'DIVISION' ? (
                          <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : (
                          <MapPin className="w-4 h-4 text-[#EA580C] shrink-0" />
                        )}
                        <span className="text-[13px]">{loc.name}</span>
                      </div>
                    </td>

                    {/* Type Badge Column */}
                    <td className="p-3">
                      {loc.type === 'DIVISION' ? (
                        <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1">
                          <span>🏛️ मंडल (DIVISION)</span>
                        </span>
                      ) : loc.type === 'DISTRICT' ? (
                        <span className="bg-orange-100 text-[#C2410C] border border-orange-200 px-2.5 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1">
                          <span>📍 जिला (DISTRICT)</span>
                        </span>
                      ) : loc.type === 'CITY' ? (
                        <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                          🏙️ शहर (CITY)
                        </span>
                      ) : (
                        <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                          {loc.type}
                        </span>
                      )}
                    </td>

                    {/* Parent Mandal Column */}
                    <td className="p-3">
                      {loc.parentName ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md font-bold">
                          🏛️ {loc.parentName}
                        </span>
                      ) : loc.type === 'DIVISION' ? (
                        <span className="text-[11px] text-stone-400 font-semibold italic">
                          (प्रशासनिक मंडल मुख्यालय)
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-300 font-mono">—</span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="p-3 font-mono text-stone-500 font-bold text-[11px]">{loc.slug}</td>

                    {/* Article Count */}
                    <td className="p-3 font-mono font-black text-stone-800">
                      <span className={`px-2 py-0.5 rounded-md ${
                        (loc.articleCount || 0) > 0 ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-stone-400'
                      }`}>
                        {loc.articleCount || 0} खबरें
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(loc.id, loc.active !== false)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black cursor-pointer transition-all border shadow-2xs ${
                          loc.active !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                        }`}
                        title={
                          loc.active !== false
                            ? 'अक्षम (Disable) करने के लिए क्लिक करें'
                            : 'सक्षम (Enable) करने के लिए क्लिक करें'
                        }
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            loc.active !== false ? 'bg-emerald-500' : 'bg-stone-400'
                          }`}
                        />
                        <span>{loc.active !== false ? 'सक्रिय' : 'अक्षम'}</span>
                      </button>
                    </td>

                    {/* Actions */}
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
                <span>{editingLocation ? 'स्थान संपादित करें' : 'नया स्थान / मंडल / जिला जोड़ें'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              {/* Location Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-800">
                  स्थान / जिले / मंडल का नाम (Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="उदा. अयोध्या, गाजीपुर, वाराणसी मंडल..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              {/* Location Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <option value="DIVISION">DIVISION (मंडल)</option>
                    <option value="CITY">CITY (शहर)</option>
                    <option value="STATE">STATE (राज्य)</option>
                    <option value="LOCAL_AREA">LOCAL_AREA (स्थानीय क्षेत्र / तहसील)</option>
                  </select>
                </div>

                {/* Parent Mandal selection (only for DISTRICT or CITY) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-stone-800">
                    संबद्ध मंडल (Parent Mandal)
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    disabled={formData.type === 'DIVISION'}
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-[#EA580C] disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    <option value="">-- कोई नहीं / स्वतंत्र --</option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>
                        {div.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                          className="text-xs text-red-600 hover:underline font-bold px-2 cursor-pointer"
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

              {/* Active / Inactive Status Checkbox */}
              <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <input
                  type="checkbox"
                  id="modal-loc-active"
                  checked={formData.active !== false}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-[#EA580C] rounded border-stone-300 focus:ring-[#EA580C] cursor-pointer"
                />
                <label htmlFor="modal-loc-active" className="text-xs font-bold text-stone-800 cursor-pointer select-none">
                  यह स्थान वेबसाइट पर सक्रिय (Enabled) रखें
                  <span className="block text-[11px] font-normal text-stone-500 mt-0.5">
                    अक्षम करने पर यह स्थान होमपेज और सार्वजनिक सूचियों में दिखाई नहीं देगा।
                  </span>
                </label>
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
