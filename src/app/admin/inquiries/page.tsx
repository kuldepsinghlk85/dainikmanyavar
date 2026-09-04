'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  Eye,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  NEWS_TIP: { label: '📰 समाचार / खबर', color: 'bg-red-50 text-red-700 border-red-200' },
  ADVERTISEMENT: { label: '📢 विज्ञापन पूछताछ', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  GRIEVANCE: { label: '⚖️ शिकायत / सुधार', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  EDITORIAL: { label: '✍️ संपादकीय / लेख', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  CAREER: { label: '💼 रिपोर्टर आवेदन', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  GENERAL: { label: '❓ सामान्य पूछताछ', color: 'bg-stone-50 text-stone-700 border-stone-200' },
};

const STATUS_MAP: Record<string, { label: string; bg: string }> = {
  PENDING: { label: 'लंबित (New)', bg: 'bg-amber-100 text-amber-800' },
  REVIEWED: { label: 'देखा गया (Reviewed)', bg: 'bg-blue-100 text-blue-800' },
  REPLIED: { label: 'उत्तर दिया गया (Replied)', bg: 'bg-emerald-100 text-emerald-800' },
  ARCHIVED: { label: 'आर्काइव्ड (Archived)', bg: 'bg-stone-100 text-stone-600' },
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await fetch(`/api/contact?${params.toString()}`);
      const data = await res.json();
      if (data.inquiries) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInquiries();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('क्या आप इस संपर्क संदेश को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry(null);
        }
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
    }
  };

  const getCleanPhone = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    return clean.length === 10 ? '91' + clean : clean;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>📩 संपर्क संदेश इनबॉक्स</span>
            <span className="text-xs bg-[#EA580C] text-white px-2.5 py-0.5 rounded-full font-sans">
              {inquiries.length} संदेश
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            पाठकों और आगंतुकों द्वारा 'संपर्क करें' फॉर्म के माध्यम से भेजे गए सभी श्रेणी-वार संदेश
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>ताज़ा करें</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="नाम, मोबाइल, ईमेल या विषय से खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#EA580C] text-white text-xs font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            खोजें
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
          >
            <option value="ALL">सभी श्रेणियां (All Categories)</option>
            <option value="NEWS_TIP">📰 समाचार / खबर</option>
            <option value="ADVERTISEMENT">📢 विज्ञापन पूछताछ</option>
            <option value="GRIEVANCE">⚖️ शिकायत / सुधार</option>
            <option value="EDITORIAL">✍️ संपादकीय / लेख</option>
            <option value="CAREER">💼 रिपोर्टर आवेदन</option>
            <option value="GENERAL">❓ सामान्य पूछताछ</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
          >
            <option value="ALL">सभी स्थितियां (All Status)</option>
            <option value="PENDING">लंबित (Pending)</option>
            <option value="REVIEWED">समीक्षित (Reviewed)</option>
            <option value="REPLIED">उत्तर दिया गया (Replied)</option>
          </select>
        </div>
      </div>

      {/* Messages List / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#EA580C]" />
            <span>संदेश लोड हो रहे हैं...</span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Mail className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700 text-sm">कोई संपर्क संदेश नहीं मिला।</p>
            <p className="text-xs text-slate-400 mt-1">
              जब कोई पाठक संपर्क फॉर्म भरेगा तो वह यहाँ दिखाई देगा।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">दिनांक</th>
                  <th className="py-3.5 px-4">श्रेणी</th>
                  <th className="py-3.5 px-4">प्रेषक (विवरण)</th>
                  <th className="py-3.5 px-4">विषय व संदेश</th>
                  <th className="py-3.5 px-4">स्थिति</th>
                  <th className="py-3.5 px-4 text-right">कार्यवाही</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((item) => {
                  const cat = CATEGORY_MAP[item.category] || {
                    label: item.category,
                    color: 'bg-slate-50 text-slate-700 border-slate-200',
                  };
                  const stat = STATUS_MAP[item.status] || {
                    label: item.status,
                    bg: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedInquiry(item)}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(item.createdAt).toLocaleDateString('hi-IN')}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleTimeString('hi-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cat.color}`}
                        >
                          {cat.label}
                        </span>
                      </td>

                      {/* Sender */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-600">
                          <Phone className="w-3 h-3 text-[#EA580C]" />
                          <span>{item.phone}</span>
                        </div>
                        {item.email && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-slate-500 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-blue-500" />
                            <span>{item.email}</span>
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 text-[10px]">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </td>

                      {/* Subject & Message */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{item.subject}</p>
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${stat.bg}`}
                        >
                          {stat.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Reply */}
                          <a
                            href={`https://wa.me/${getCleanPhone(item.phone)}?text=${encodeURIComponent(
                              `नमस्ते ${item.name} जी, दैनिक मान्यवर से संपर्क करने के लिए धन्यवाद। आपके संदेश (${item.subject}) के संदर्भ में: `
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp पर उत्तर दें"
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {/* Email Reply */}
                          {item.email && (
                            <a
                              href={`mailto:${item.email}?subject=${encodeURIComponent(
                                `Re: [दैनिक मान्यवर] ${item.subject}`
                              )}`}
                              title="ईमेल भेजें"
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}

                          {/* View Detail */}
                          <button
                            onClick={() => setSelectedInquiry(item)}
                            title="विवरण देखें"
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-[#EA580C] hover:text-white rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteInquiry(item.id)}
                            title="हटाएं"
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail View */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${
                    CATEGORY_MAP[selectedInquiry.category]?.color || 'bg-slate-100'
                  }`}
                >
                  {CATEGORY_MAP[selectedInquiry.category]?.label || selectedInquiry.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedInquiry.subject}</h3>
                <span className="text-xs text-slate-400">
                  प्राप्त समय: {new Date(selectedInquiry.createdAt).toLocaleString('hi-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Details */}
            <div className="bg-slate-50 p-4 rounded-xl text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold">नाम:</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedInquiry.name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">मोबाइल:</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                  <a href={`tel:${selectedInquiry.phone}`} className="text-[#EA580C] hover:underline">
                    {selectedInquiry.phone}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">ईमेल:</span>
                <p className="text-slate-700 mt-0.5">
                  {selectedInquiry.email ? (
                    <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 hover:underline">
                      {selectedInquiry.email}
                    </a>
                  ) : (
                    'प्रदान नहीं किया गया'
                  )}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">स्थान / ज़िला:</span>
                <p className="text-slate-700 mt-0.5">{selectedInquiry.location || 'उल्लेख नहीं'}</p>
              </div>
            </div>

            {/* Full Message Body */}
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                विस्तृत संदेश विवरण:
              </h4>
              <div className="bg-orange-50/50 border-l-4 border-[#EA580C] p-4 rounded-r-xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Status Change Control */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">स्थिति बदलें:</span>
                <select
                  disabled={updating}
                  value={selectedInquiry.status}
                  onChange={(e) => updateStatus(selectedInquiry.id, e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                >
                  <option value="PENDING">लंबित (Pending)</option>
                  <option value="REVIEWED">समीक्षित (Reviewed)</option>
                  <option value="REPLIED">उत्तर दिया गया (Replied)</option>
                  <option value="ARCHIVED">आर्काइव्ड (Archived)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${getCleanPhone(selectedInquiry.phone)}?text=${encodeURIComponent(
                    `नमस्ते ${selectedInquiry.name} जी, दैनिक मान्यवर से संपर्क करने के लिए धन्यवाद। आपके संदेश (${selectedInquiry.subject}) के संबंध में: `
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#16A34A] hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp चैट</span>
                </a>

                {selectedInquiry.email && (
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                      `Re: [दैनिक मान्यवर] ${selectedInquiry.subject}`
                    )}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>ईमेल भेजें</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
