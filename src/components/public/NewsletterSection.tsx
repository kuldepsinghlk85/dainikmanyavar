'use client';

import React, { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('धन्यवाद! न्यूज़लेटर सब्सक्रिप्शन सफल रहा।');
        setEmail('');
      } else {
        setMessage(data.error || 'त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }
    } catch (err) {
      setMessage('नेटवर्क त्रुटि। पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#FFF2F2] border border-[#FFD1D1] p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center my-6">
      <div>
        <h3 className="text-xl font-bold text-[#F97316] mb-1">✉ दैनिक मान्यवर न्यूज़लेटर</h3>
        <p className="text-stone-700 text-sm">महत्वपूर्ण खबरें सीधे अपने ईमेल पर पाएं।</p>
        {message && <p className="text-xs font-semibold text-green-700 mt-2">{message}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="अपना ईमेल दर्ज करें..."
          className="flex-1 p-3 text-sm border border-stone-300 rounded-l-lg focus:outline-none focus:border-[#F97316]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 rounded-r-lg font-bold text-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          {loading ? 'सब्सक्राइब...' : 'Subscribe'}
        </button>
      </form>
    </section>
  );
}
