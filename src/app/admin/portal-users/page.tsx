'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  Send,
  Download,
  Upload,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  MessageCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AllPortalUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [newsletter, setNewsletter] = useState('');

  // Modals
  const [viewUser, setViewUser] = useState<any>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [notifyUser, setNotifyUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add User Form
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newNewsletter, setNewNewsletter] = useState(true);
  const [newWhatsapp, setNewWhatsapp] = useState(true);

  // Edit User Form
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editNewsletter, setEditNewsletter] = useState(true);
  const [editWhatsapp, setEditWhatsapp] = useState(true);

  // Notify Form
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifySending, setNotifySending] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      if (status) params.set('status', status);
      if (newsletter) params.set('newsletter', newsletter);
      params.set('page', String(page));
      params.set('limit', '25');

      const res = await fetch(`/api/admin/portal-users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        setPagination(data.pagination);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [city, status, newsletter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  // Toggle Block / Unblock
  const handleToggleBlock = async (user: any) => {
    const nextStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    const confirmMsg =
      nextStatus === 'BLOCKED'
        ? `क्या आप ${user.fullName} (${user.mobileNumber}) को ब्लॉक करना चाहते हैं?`
        : `क्या आप ${user.fullName} को अनब्लॉक करना चाहते हैं?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/portal-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          text: `यूज़र ${nextStatus === 'BLOCKED' ? 'ब्लॉक' : 'सक्रिय'} किया गया।`,
        });
        fetchUsers(pagination.page);
      }
    } catch (_) {
      setNotification({ type: 'error', text: 'स्थिति बदलने में विफल।' });
    }
  };

  // Delete User
  const handleDeleteUser = async (user: any) => {
    if (!confirm(`क्या आप निश्चित रूप से यूज़र ${user.fullName} (${user.mobileNumber}) को स्थायी रूप से हटाना चाहते हैं?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/portal-users?id=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: 'यूज़र सफलतापूर्वक हटा दिया गया।' });
        fetchUsers(pagination.page);
      }
    } catch (_) {
      setNotification({ type: 'error', text: 'यूज़र हटाने में विफल।' });
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/portal-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editUser.id,
          fullName: editName,
          email: editEmail,
          city: editCity,
          status: editStatus,
          newsletterSubscribed: editNewsletter,
          whatsappPermission: editWhatsapp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: 'यूज़र डेटा अपडेट हो गया!' });
        setEditUser(null);
        fetchUsers(pagination.page);
      } else {
        setNotification({ type: 'error', text: data.error });
      }
    } catch (_) {
      setNotification({ type: 'error', text: 'अपडेट करने में विफल।' });
    } finally {
      setActionLoading(false);
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/portal-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newName,
          mobileNumber: newMobile,
          email: newEmail,
          city: newCity,
          newsletterSubscribed: newNewsletter,
          whatsappPermission: newWhatsapp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: 'नया यूज़र जोड़ा गया!' });
        setShowAddModal(false);
        setNewName('');
        setNewMobile('');
        setNewEmail('');
        setNewCity('');
        fetchUsers(1);
      } else {
        setNotification({ type: 'error', text: data.error });
      }
    } catch (_) {
      setNotification({ type: 'error', text: 'यूज़र बनाने में विफल।' });
    } finally {
      setActionLoading(false);
    }
  };

  // Send Single User Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyUser || !notifyMessage.trim()) return;
    setNotifySending(true);
    try {
      const res = await fetch('/api/admin/portal-users/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'selected',
          userIds: [notifyUser.id],
          customMessage: notifyMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: 'व्हाट्सएप अलर्ट सफलतापूर्वक भेजा गया!' });
        setNotifyUser(null);
        setNotifyMessage('');
      } else {
        setNotification({ type: 'error', text: data.error });
      }
    } catch (_) {
      setNotification({ type: 'error', text: 'अलर्ट भेजने में विफल।' });
    } finally {
      setNotifySending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#EA580C]" />
            <span>सभी पंजीकृत यूज़र्स (All Portal Users)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            वेबसाइट एवं मोबाइल ऐप के पंजीकृत पाठकों, सब्सक्राइबर्स एवं एक्टिविटी का पूर्ण प्रबंधन
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/portal-users/imported"
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4 text-stone-600" />
            <span>Excel इम्पोर्ट</span>
          </Link>

          <Link
            href="/admin/portal-users/export"
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Export यूज़र्स</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नया यूज़र जोड़ें</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="नाम, मोबाइल नंबर या ईमेल से खोजें..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* City filter */}
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-medium text-stone-700"
            >
              <option value="">सभी शहर (All Cities)</option>
              <option value="वाराणसी">वाराणसी</option>
              <option value="जौनपुर">जौनपुर</option>
              <option value="लखनऊ">लखनऊ</option>
              <option value="प्रयागराज">प्रयागराज</option>
              <option value="आजमगढ़">आजमगढ़</option>
              <option value="गाजीपुर">गाजीपुर</option>
              <option value="मिर्जापुर">मिर्जापुर</option>
              <option value="दिल्ली">दिल्ली</option>
            </select>

            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-medium text-stone-700"
            >
              <option value="">सभी स्थितियां (Status)</option>
              <option value="ACTIVE">सक्रिय (Active)</option>
              <option value="BLOCKED">अवरुद्ध (Blocked)</option>
            </select>

            {/* Newsletter filter */}
            <select
              value={newsletter}
              onChange={(e) => setNewsletter(e.target.value)}
              className="px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-medium text-stone-700"
            >
              <option value="">न्यूज़लेटर स्थिति (All)</option>
              <option value="true">सब्सक्राइब किया हुआ</option>
              <option value="false">अनसब्सक्राइब</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              फिल्टर करें
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCity('');
                setStatus('');
                setNewsletter('');
                fetchUsers(1);
              }}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors"
              title="रीसेट करें"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs font-bold text-stone-600">
          <span>कुल यूज़र्स: <strong className="text-stone-900">{pagination.total}</strong></span>
          <span>पृष्ठ {pagination.page} / {pagination.totalPages || 1}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500">
            <div className="w-8 h-8 border-3 border-[#EA580C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold">लोड हो रहा है...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-bold">कोई यूज़र नहीं मिला।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100/70 text-stone-700 uppercase font-black tracking-wider text-[10px]">
                  <th className="p-3.5">यूज़र नाम (Name)</th>
                  <th className="p-3.5">मोबाइल नंबर</th>
                  <th className="p-3.5">ईमेल (Email)</th>
                  <th className="p-3.5">शहर / राज्य</th>
                  <th className="p-3.5">पंजीकरण तिथि</th>
                  <th className="p-3.5">न्यूज़लेटर / WA</th>
                  <th className="p-3.5">स्थिति</th>
                  <th className="p-3.5 text-right">कार्रवाई (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-orange-50/40 transition-colors">
                    {/* Name */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#EA580C] to-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {u.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 leading-tight">{u.fullName}</p>
                          {u.isImported && (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              Excel Imported
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Mobile */}
                    <td className="p-3.5 font-mono font-bold text-stone-700">
                      +91 {u.mobileNumber}
                    </td>

                    {/* Email */}
                    <td className="p-3.5 text-stone-600">
                      {u.email || <span className="text-stone-300 italic">—</span>}
                    </td>

                    {/* City */}
                    <td className="p-3.5 text-stone-600">
                      {u.city ? `${u.city}, ${u.state || 'UP'}` : <span className="text-stone-300 italic">—</span>}
                    </td>

                    {/* Reg Date */}
                    <td className="p-3.5 text-[11px] text-stone-500">
                      {new Date(u.registrationDate).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Newsletter & WhatsApp */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.newsletterSubscribed
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {u.newsletterSubscribed ? 'मेल ऑन' : 'ऑफ'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.whatsappPermission
                              ? 'bg-green-100 text-green-800'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {u.whatsappPermission ? 'WA ऑन' : 'ऑफ'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'सक्रिय' : 'ब्लॉक्ड'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Profile */}
                        <button
                          onClick={() => setViewUser(u)}
                          className="p-1.5 text-stone-600 hover:text-[#EA580C] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="प्रोफाइल देखें"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit User */}
                        <button
                          onClick={() => {
                            setEditUser(u);
                            setEditName(u.fullName || '');
                            setEditEmail(u.email || '');
                            setEditCity(u.city || '');
                            setEditStatus(u.status || 'ACTIVE');
                            setEditNewsletter(u.newsletterSubscribed);
                            setEditWhatsapp(u.whatsappPermission);
                          }}
                          className="p-1.5 text-stone-600 hover:text-blue-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="संपादित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Send Notification */}
                        <button
                          onClick={() => {
                            setNotifyUser(u);
                            setNotifyMessage(`नमस्ते ${u.fullName},\nदैनिक मान्यवर की मुख्य ताज़ा ख़बरें पढ़ने के लिए विजिट करें: https://dainikmanyavar.com`);
                          }}
                          className="p-1.5 text-stone-600 hover:text-green-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="व्हाट्सएप सूचना भेजें"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Block / Unblock */}
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.status === 'BLOCKED'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={u.status === 'BLOCKED' ? 'अनब्लॉक करें' : 'ब्लॉक करें'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
            >
              ← पिछला पृष्ठ
            </button>
            <span className="font-bold text-stone-600">
              पृष्ठ {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
            >
              अगला पृष्ठ →
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL: VIEW PROFILE ================= */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setViewUser(null)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#EA580C]" />
                <span>यूज़र प्रोफाइल विवरण</span>
              </h3>
              <button onClick={() => setViewUser(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#EA580C] to-amber-500 text-white text-xl font-bold flex items-center justify-center">
                  {viewUser.fullName?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-sm text-stone-900">{viewUser.fullName}</h4>
                  <p className="text-stone-500 font-mono font-bold">+91 {viewUser.mobileNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-600">
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-bold">ईमेल</span>
                  <span className="font-bold text-stone-800">{viewUser.email || 'उपलब्ध नहीं'}</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-bold">शहर / राज्य</span>
                  <span className="font-bold text-stone-800">{viewUser.city || 'वाराणसी'}, {viewUser.state || 'UP'}</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-bold">पंजीकरण तिथि</span>
                  <span className="font-bold text-stone-800">{new Date(viewUser.registrationDate).toLocaleDateString('hi-IN')}</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-bold">अंतिम लॉगिन</span>
                  <span className="font-bold text-stone-800">{viewUser.lastLogin ? new Date(viewUser.lastLogin).toLocaleDateString('hi-IN') : 'N/A'}</span>
                </div>
              </div>

              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block">गतिविधियां (Activities)</span>
                  <span className="font-bold text-stone-800">{viewUser._count?.activityLogs || 0} पढ़ी गई खबरें</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block">सहेजे गए समाचार</span>
                  <span className="font-bold text-stone-800">{viewUser._count?.savedArticles || 0} आर्टिकल्स</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER ================= */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditUser(null)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#EA580C]" />
                <span>यूज़र संपादित करें</span>
              </h3>
              <button onClick={() => setEditUser(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">पूरा नाम</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ईमेल</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">शहर (City)</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">अकाउंट स्थिति (Status)</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C] bg-white font-bold"
                >
                  <option value="ACTIVE">सक्रिय (ACTIVE)</option>
                  <option value="BLOCKED">अवरुद्ध (BLOCKED)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editNewsletter}
                    onChange={(e) => setEditNewsletter(e.target.checked)}
                    className="rounded text-[#EA580C] w-4 h-4"
                  />
                  <span className="font-bold text-stone-700">न्यूज़लेटर सब्सक्रिप्शन चालू रखें</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.checked)}
                    className="rounded text-green-600 w-4 h-4"
                  />
                  <span className="font-bold text-green-800">व्हाट्सएप न्यूज़ अलर्ट की अनुमति</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#EA580C] hover:bg-orange-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'सहेजा जा रहा है...' : 'परिवर्तन सहेजें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD USER ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#EA580C]" />
                <span>नया पाठक यूज़र जोड़ें</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">पूरा नाम *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="उदा. अमित त्रिपाठी"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">10-अंकीय मोबाइल नंबर *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ईमेल (वैकल्पिक)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="amit@example.com"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">शहर (City)</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="उदा. वाराणसी"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNewsletter}
                    onChange={(e) => setNewNewsletter(e.target.checked)}
                    className="rounded text-[#EA580C] w-4 h-4"
                  />
                  <span className="font-bold text-stone-700">न्यूज़लेटर डेटाबेस में जोड़ें</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.checked)}
                    className="rounded text-green-600 w-4 h-4"
                  />
                  <span className="font-bold text-green-800">व्हाट्सएप न्यूज़ अलर्ट चालू रखें</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#EA580C] hover:bg-orange-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'जोड़ा जा रहा है...' : 'यूज़र जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SEND NOTIFICATION ================= */}
      {notifyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setNotifyUser(null)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span>व्हाट्सएप सूचना भेजें</span>
              </h3>
              <button onClick={() => setNotifyUser(null)} className="cursor-pointer text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="py-4 space-y-3.5 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl text-stone-700 space-y-1">
                <p>प्राप्तकर्ता: <strong className="text-stone-900">{notifyUser.fullName}</strong></p>
                <p>मोबाइल नंबर: <strong className="text-stone-900 font-mono">+91 {notifyUser.mobileNumber}</strong></p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">संदेश (Message)</label>
                <textarea
                  rows={4}
                  required
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNotifyUser(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={notifySending}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{notifySending ? 'भेजा जा रहा है...' : 'अभी भेजें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
