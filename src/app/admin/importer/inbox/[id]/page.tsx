'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImageUploader from '@/components/admin/ImageUploader';
import HtmlContentEditor from '@/components/admin/HtmlContentEditor';
import { ArrowLeft, Sparkles, ExternalLink, Save, Check } from 'lucide-react';

interface Category { id: string; name: string; }
interface Tag { id: string; name: string; }
interface LocationItem { id: string; name: string; }

export default function ImportPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [primaryCategoryId, setPrimaryCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/importer/inbox?status=NEW')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const found = data.data.find((i: any) => i.id === id);
          if (found) {
            setItem(found);
            setTitle(found.originalTitle || '');
            setSubtitle(`मूल स्रोत: ${found.publisherName}`);
            setExcerpt(found.originalExcerpt || '');
            setContent(found.normalizedText || `<p>${found.originalTitle}</p>`);
            setFeaturedImage(found.imageUrl || '');
            setPrimaryCategoryId(found.suggestedCategoryId || '');
            setLocationId(found.suggestedLocationId || '');
          }
        }
      })
      .catch(() => {});

    fetch('/api/admin/categories').then((res) => res.json()).then((d) => d.success && setCategories(d.data));
    fetch('/api/admin/tags').then((res) => res.json()).then((d) => d.success && setTags(d.data));
    fetch('/api/admin/locations').then((res) => res.json()).then((d) => d.success && setLocations(d.data));
  }, [id]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleAiDraftGenerate = () => {
    if (!item) return;
    setAiLoading(true);
    setTimeout(() => {
      setContent(
        `<p><strong>जौनपुर / पूर्वांचल हलचल:</strong> ${item.originalTitle}। समाचार स्रोतों के अनुसार, ${item.originalExcerpt || item.originalTitle}।</p>
<p>स्थानीय रिपोर्ट के अनुसार इस मामले में संबंधित अधिकारियों व विभाग द्वारा आवश्यक कदम उठाए जा रहे हैं।</p>
<p><em>(मूल जानकारी: ${item.publisherName})</em></p>`
      );
      setAiLoading(false);
    }, 600);
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/importer/inbox/${id}/create-draft`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.article) {
        router.push(`/admin/news/${data.article.id}`);
      } else {
        alert(data.error || 'ड्राफ्ट बनाने में त्रुटि');
      }
    } catch (err) {
      alert('सर्वर त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return <div className="p-6 text-stone-500 text-xs">इनबॉक्स समाचार लोड हो रहा है...</div>;
  }

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-stone-600" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-stone-900">इम्पोर्ट समीक्षा एवं ड्राफ्ट रूपांतरण (Import Preview)</h1>
          <p className="text-xs text-stone-500">एक्सटर्नल सामग्री देखें और दैनिक मान्यवर का मौलिक ड्राफ्ट तैयार करें</p>
        </div>
      </div>

      {/* Split Screen 2-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: External Source Info */}
        <div className="bg-stone-900 text-stone-200 p-5 rounded-xl border border-stone-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-[#F97316]">📡 EXTERNAL SOURCE DATA</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {item.copyrightMode}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-stone-400 block uppercase">प्रकाशक (Publisher)</span>
            <p className="text-sm font-bold text-white">{item.publisherName}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-stone-400 block uppercase">मूल शीर्षक (Original Headline)</span>
            <h3 className="text-base font-extrabold text-white leading-snug mt-0.5">{item.originalTitle}</h3>
          </div>

          {item.imageUrl && (
            <div className="relative w-full h-44 rounded-lg overflow-hidden bg-stone-800">
              <Image src={item.imageUrl} alt={item.originalTitle} fill unoptimized className="object-cover" />
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold text-stone-400 block uppercase">अनुमत सारांश (Allowed Summary)</span>
            <p className="text-xs text-stone-300 leading-relaxed mt-1 bg-stone-800 p-3 rounded-lg border border-stone-700">
              {item.originalExcerpt || item.originalTitle}
            </p>
          </div>

          <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-xs">
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F97316] font-bold hover:underline flex items-center gap-1"
            >
              <span>मूल समाचार लिंक खोलें</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-[10px] text-stone-400">
              {item.sourcePublishedAt ? new Date(item.sourcePublishedAt).toLocaleString('hi-IN') : ''}
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: Dainik Manyawar Editor Workspace */}
        <form onSubmit={handleSaveDraft} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-2">
            <span className="text-xs font-bold text-[#EA580C]">📝 DAINIK MANYAVAR EDITORIAL DRAFT</span>
            <button
              type="button"
              onClick={handleAiDraftGenerate}
              disabled={aiLoading}
              className="bg-orange-100 hover:bg-orange-200 text-[#C2410C] text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'AI ड्राफ्ट बन रहा है...' : '✨ AI मौलिक ड्राफ्ट बनाएं'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">संशोधित मुख्य शीर्षक *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-bold focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">श्रेणी (Category)</label>
              <select
                value={primaryCategoryId}
                onChange={(e) => setPrimaryCategoryId(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">स्थान/ज़िला (Location)</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg text-xs"
              >
                <option value="">स्थान चुनें...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Multi Tag Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">मल्टी टैग्स चयन</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-stone-50 border border-stone-200 rounded-lg">
              {tags.map((t) => {
                const isSel = selectedTagIds.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => handleToggleTag(t.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                      isSel ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    {isSel ? `✓ ${t.name}` : t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Uploader */}
          <ImageUploader
            label="थंबनेल चित्र (Featured Image)"
            value={featuredImage}
            onChange={(url) => setFeaturedImage(url)}
          />

          <HtmlContentEditor
            value={content}
            onChange={(html) => setContent(html)}
            required
            label="समाचार विवरण (Article Body HTML/Visual Editor)"
            placeholder="समाचार विवरण यहाँ लिखें या HTML फ़ीड कोड पेस्ट करें..."
            minHeight="220px"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-[#ffffff] py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'ड्राफ्ट बन रहा है...' : 'दैनिक मान्यवर ड्राफ्ट बनाएं (Create Draft)'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
