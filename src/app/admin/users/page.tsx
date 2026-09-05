'use client';

import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, UserCheck, Plus, Check, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password reset modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Add new user modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newRole, setNewRole] = useState('EDITOR');

  const [currentUser, setCurrentUser] = useState<{ role?: string; isSuperAdmin?: boolean } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.isSuperAdmin) {
            fetchUsers();
          }
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword.trim()) return;

    if (newPassword.trim().length < 6) {
      setMessage({ type: 'error', text: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' });
      return;
    }

    setResetting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `उपयोगकर्ता "${selectedUser.name}" का पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है!`,
        });
        setSelectedUser(null);
        setNewPassword('');
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'पासवर्ड रीसेट करने में त्रुटि।' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'सर्वर त्रुटि हुई।' });
    } finally {
      setResetting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newUserPass.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newUserPass.trim(),
          role: newRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `नया उपयोगकर्ता "${newName}" सफलतापूर्वक बनाया गया!`,
        });
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewUserPass('');
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'उपयोगकर्ता बनाने में त्रुटि।' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'सर्वर त्रुटि हुई।' });
    } finally {
      setLoading(false);
    }
  };

  if (!checkingAuth && currentUser && !currentUser.isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-stone-900 mb-2">केवल सुपर एडमिन के लिए आरक्षित (Restricted)</h2>
          <p className="text-stone-700 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            पोर्टल के एडमिन और एडिटर स्टाफ एकाउंट्स, रोल्स और पासवर्ड का प्रबंधन केवल <strong>सुपर एडमिन (Super Admin)</strong> के अधिकार क्षेत्र में है।
          </p>
          <a
            href="/admin/editor"
            className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-3 rounded-xl font-bold text-sm shadow transition-all"
          >
            🎯 संपादक मुख्य डेस्क (Editor Desk) पर जाएँ →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">एडमिन यूजर्स एवं रोल (RBAC)</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            कंट्रोल पैनल के उपयोगकर्ताओं का प्रबंधन और पासवर्ड रीसेट सुविधा
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          नया यूजर जोड़ें
        </button>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold shadow-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-stone-400 hover:text-stone-700 ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Password Reset Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-stone-900">
                <KeyRound className="w-5 h-5 text-[#EA580C]" />
                <h3 className="text-base font-extrabold">पासवर्ड रीसेट करें</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-xs">
              <span className="text-stone-500 block">उपयोगकर्ता:</span>
              <span className="font-bold text-stone-900">{selectedUser.name}</span>
              <span className="text-stone-500 block mt-1">ईमेल: {selectedUser.email}</span>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>नया पासवर्ड (New Password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="नया पासवर्ड दर्ज करें (उदा. Manyavar@2026)"
                    className="w-full p-2.5 pr-10 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#F97316]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {resetting ? 'रीसेट हो रहा है...' : 'पासवर्ड सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-extrabold text-stone-900">नया यूजर बनाएं</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="उदा. रमेश कुमार"
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ईमेल (Email) *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="उदा. editor@dainikmanyavar.in"
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">पासवर्ड (Password) *</label>
                <input
                  type="password"
                  required
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  placeholder="सुरक्षित पासवर्ड"
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">भूमिका (Role)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#F97316]"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (पूर्ण नियंत्रण)</option>
                  <option value="EDITOR">EDITOR (संपादक)</option>
                  <option value="REPORTER">REPORTER (संवाददाता)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'बनाया जा रहा है...' : 'यूजर बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
            <tr>
              <th className="p-3.5">नाम (Name)</th>
              <th className="p-3.5">ईमेल (Email)</th>
              <th className="p-3.5">रोल (Role)</th>
              <th className="p-3.5">स्थिति</th>
              <th className="p-3.5 text-right">पासवर्ड प्रबंधन</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-stone-50">
                <td className="p-3.5 font-bold text-stone-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#F97316]" />
                  <span>{u.name}</span>
                </td>
                <td className="p-3.5 font-mono text-stone-700">{u.email}</td>
                <td className="p-3.5">
                  <span className="bg-orange-100 text-[#C2410C] px-2.5 py-1 rounded-full text-[10px] font-bold">
                    {u.role}
                  </span>
                </td>
                <td className="p-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                    {u.active ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setNewPassword('');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-[#C2410C] border border-stone-300 hover:border-orange-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>पासवर्ड रीसेट करें</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
