'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Plus, X, Search, Check, ExternalLink, Building2, CheckCircle2 } from 'lucide-react';

export interface LocationItem {
  id: string;
  name: string;
  slug?: string;
  type?: string;
  image?: string | null;
}

interface DistrictMultiSelectorProps {
  locations: LocationItem[];
  selectedIds: string[];
  onChange: (newSelectedIds: string[]) => void;
  onOpenAddModal: () => void;
  onQuickInlineAdd?: (name: string) => Promise<void>;
}

// Prominent UP districts shown initially for 1-click selection
const POPULAR_UP_DISTRICTS = [
  'जौनपुर',
  'वाराणसी',
  'प्रयागराज',
  'लखनऊ',
  'गोरखपुर',
  'गाजीपुर',
  'भदोही',
  'मिर्ज़ापुर',
  'आज़मगढ़',
  'अयोध्या',
  'कानपुर नगर',
  'आगरा',
  'मेरठ',
  'बरेली',
  'मऊ',
  'बलिया',
  'सुल्तानपुर',
  'प्रतापगढ़',
  'सोनभद्र',
  'झाँसी',
  'मथुरा',
  'नोएडा',
  'गाजियाबाद',
  'सहारनपुर',
  'अलीगढ़',
];

export default function DistrictMultiSelector({
  locations,
  selectedIds,
  onChange,
  onOpenAddModal,
  onQuickInlineAdd,
}: DistrictMultiSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);
  const [inlineAdding, setInlineAdding] = useState(false);

  // Map of location ID to location object
  const locMap = useMemo(() => {
    const map = new Map<string, LocationItem>();
    locations.forEach((loc) => map.set(loc.id, loc));
    return map;
  }, [locations]);

  // Selected locations in selection order
  const selectedLocations = useMemo(() => {
    return selectedIds
      .map((id) => locMap.get(id))
      .filter((loc): loc is LocationItem => Boolean(loc));
  }, [selectedIds, locMap]);

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      if (showAllTags) return locations;
      // Show popular + any already selected
      const popularSet = new Set(POPULAR_UP_DISTRICTS.map((d) => d.toLowerCase()));
      const selectedSet = new Set(selectedIds);
      return locations.filter(
        (loc) => popularSet.has(loc.name.trim().toLowerCase()) || selectedSet.has(loc.id)
      );
    }

    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        Boolean(loc.slug && loc.slug.toLowerCase().includes(q))
    );
  }, [locations, searchQuery, showAllTags, selectedIds]);

  const isExactMatch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return locations.some((l) => l.name.trim().toLowerCase() === q);
  }, [locations, searchQuery]);

  // Toggle selection of a location
  const toggleLocation = (locId: string) => {
    if (selectedIds.includes(locId)) {
      onChange(selectedIds.filter((id) => id !== locId));
    } else {
      onChange([...selectedIds, locId]);
    }
  };

  const removeLocation = (locId: string) => {
    onChange(selectedIds.filter((id) => id !== locId));
  };

  const clearAll = () => {
    onChange([]);
  };

  const handleInlineAdd = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed || !onQuickInlineAdd) return;
    setInlineAdding(true);
    try {
      await onQuickInlineAdd(trimmed);
      setSearchQuery('');
    } catch (_) {}
    setInlineAdding(false);
  };

  return (
    <div className="space-y-3 bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#EA580C]" />
          <span>संबंधित जनपद / स्थान (Districts & Locations)</span>
          {selectedIds.length > 0 && (
            <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
              {selectedIds.length} चयनित
            </span>
          )}
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="text-[11px] font-black text-[#EA580C] hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ नया स्थान जोड़ें</span>
          </button>
          <Link
            href="/admin/locations"
            target="_blank"
            className="text-[11px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-0.5 hover:underline"
            title="सभी जनपदों की सूची प्रबंधित करें"
          >
            <span>स्थान सूची</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>

      {/* Selected Districts Chip Cloud */}
      <div className="bg-white p-2.5 rounded-xl border border-stone-200 min-h-[46px] flex flex-wrap items-center gap-1.5">
        {selectedLocations.length > 0 ? (
          <>
            {selectedLocations.map((loc, index) => (
              <span
                key={loc.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  index === 0
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-orange-100 text-orange-900 border border-orange-300'
                }`}
              >
                <span>📍 {loc.name}</span>
                {index === 0 && (
                  <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono">
                    मुख्य
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeLocation(loc.id)}
                  aria-label={`Remove ${loc.name}`}
                  className="hover:bg-black/10 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedLocations.length > 1 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[10px] font-bold text-stone-500 hover:text-red-600 underline ml-1 cursor-pointer"
              >
                सभी हटाएं
              </button>
            )}
          </>
        ) : (
          <p className="text-xs text-stone-500 font-medium italic">
            कोई जनपद चयनित नहीं (यह खबर राज्य/देश स्तर पर रहेगी, अथवा नीचे दिए जनपदों के टैग्स पर क्लिक करके चुनें)।
          </p>
        )}
      </div>

      {/* Search Input & Quick Inline Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 जनपद खोजें... (उदा. जौनपुर, वाराणसी, लखनऊ)"
            className="w-full pl-8 pr-3 py-1.5 border border-stone-300 rounded-xl text-xs font-medium bg-white focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-orange-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Add Button if search query doesn't match an existing district */}
        {searchQuery.trim() && !isExactMatch && onQuickInlineAdd && (
          <button
            type="button"
            disabled={inlineAdding}
            onClick={handleInlineAdd}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{inlineAdding ? 'जोड़ रहे हैं...' : `+ '${searchQuery.trim()}' जोड़ें`}</span>
          </button>
        )}
      </div>

      {/* Option Tags Cloud */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-600">
            {searchQuery
              ? `खोज परिणाम (${filteredLocations.length}):`
              : showAllTags
              ? `उत्तर प्रदेश के सभी जनपद (${filteredLocations.length}):`
              : 'लोकप्रिय जनपद (क्लिक करके चुनें):'}
          </span>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setShowAllTags(!showAllTags)}
              className="text-[11px] font-bold text-[#EA580C] hover:underline cursor-pointer"
            >
              {showAllTags ? '← केवल मुख्य जनपद दिखाएं' : 'सभी 75 जनपद देखें →'}
            </button>
          )}
        </div>

        {/* Tags Pills Container */}
        <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1.5 bg-white/60 rounded-xl border border-stone-200/80">
          {filteredLocations.map((loc) => {
            const isSelected = selectedIds.includes(loc.id);
            return (
              <button
                type="button"
                key={loc.id}
                onClick={() => toggleLocation(loc.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-2xs hover:bg-orange-600 scale-[1.02]'
                    : 'bg-white hover:bg-orange-50 text-stone-700 hover:text-orange-700 border border-stone-200 hover:border-orange-300'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <Plus className="w-3 h-3 text-stone-400" />
                )}
                <span>{loc.name}</span>
              </button>
            );
          })}

          {filteredLocations.length === 0 && (
            <div className="p-3 text-center text-xs text-stone-500 w-full">
              कोई जनपद नहीं मिला।
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="ml-2 font-bold text-[#EA580C] hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>नया स्थान '{searchQuery}' अभी जोड़ें</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explanatory Note */}
      <p className="text-[11px] text-stone-500 leading-relaxed">
        💡 <strong>टैग व डिस्ट्रीब्यूशन नियम:</strong> चयनित सभी जनपदों के होमपेज, डिस्ट्रिक्ट टैब्स और न्यूज़ फ़ीड में यह खबर स्वचालित रूप से प्रदर्शित होगी। पहला चयनित जनपद प्राथमिक (Primary) रहेगा।
      </p>
    </div>
  );
}
