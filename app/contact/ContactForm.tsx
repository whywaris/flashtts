'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Question',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: 'General Question', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white border-2 border-emerald-100 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-bold font-['Instrument_Serif'] text-[#0a0a0f] mb-2">Message Sent!</h3>
        <p className="text-[#6b7280] text-sm leading-relaxed">
          Thank you for reaching out. We've received your inquiry and will respond within 24 hours.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-8 px-6 py-2.5 bg-[#ff4d1c] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e9ecef] rounded-2xl p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-[#6b7280] uppercase tracking-widest px-1">Full Name</label>
          <input 
            required
            type="text" 
            placeholder="John Doe"
            className="w-full bg-[#fafafa] border border-[rgba(10,10,15,0.08)] rounded-xl px-5 py-3.5 text-sm font-medium text-[#0a0a0f] outline-none focus:ring-4 focus:ring-[#ff4d1c]/5 focus:bg-white transition-all"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-[#6b7280] uppercase tracking-widest px-1">Email Address</label>
          <input 
            required
            type="email" 
            placeholder="john@example.com"
            className="w-full bg-[#fafafa] border border-[rgba(10,10,15,0.08)] rounded-xl px-5 py-3.5 text-sm font-medium text-[#0a0a0f] outline-none focus:ring-4 focus:ring-[#ff4d1c]/5 focus:bg-white transition-all"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-[#6b7280] uppercase tracking-widest px-1">Inquiry Subject</label>
          <select 
            className="w-full bg-[#fafafa] border border-[rgba(10,10,15,0.08)] rounded-xl px-5 py-3.5 text-sm font-bold text-[#0a0a0f] outline-none focus:ring-4 focus:ring-[#ff4d1c]/5 transition-all appearance-none cursor-pointer"
            value={formData.subject}
            onChange={e => setFormData({ ...formData, subject: e.target.value })}
          >
            <option>General Question</option>
            <option>Billing Issue</option>
            <option>Technical Support</option>
            <option>Abuse Report</option>
            <option>Partnership</option>
            <option>Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-[#6b7280] uppercase tracking-widest px-1">Your Message</label>
          <textarea 
            required
            placeholder="How can we help you today?"
            className="w-full bg-[#fafafa] border border-[rgba(10,10,15,0.08)] rounded-2xl px-5 py-4 text-sm font-medium text-[#0a0a0f] h-32 resize-none outline-none focus:ring-4 focus:ring-[#ff4d1c]/5 focus:bg-white transition-all leading-relaxed"
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 animate-shake">
            <AlertCircle size={16} />
            <span className="text-xs font-bold">Failed to send message. Please try again.</span>
          </div>
        )}

        <button 
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-4 bg-[#ff4d1c] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-orange-500/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status === 'loading' ? (
            'SENDING...'
          ) : (
            <>
              <Send size={16} strokeWidth={2.5} /> SEND MESSAGE
            </>
          )}
        </button>
      </form>
    </div>
  );
}
