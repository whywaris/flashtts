'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Question');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill all required fields');
      return;
    }
    
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setSent(true);
      setName('');
      setEmail('');
      setSubject('General Question');
      setMessage('');

    } catch {
      setError('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', border: '1px solid #e9ecef' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
        ✅
      </div>
      <h2 style={{ 
        fontFamily: 'Syne, sans-serif',
        fontSize: '24px', fontWeight: 800,
        color: '#0a0a0f', margin: '0 0 8px'
      }}>
        Message Sent!
      </h2>
      <p style={{ 
        color: '#6b7280', fontSize: '15px',
        margin: '0 0 24px'
      }}>
        We'll get back to you within 24 hours.
        Check your email for confirmation.
      </p>
      <button
        onClick={() => setSent(false)}
        style={{
          padding: '12px 24px',
          background: '#ff4d1c',
          color: '#fff', border: 'none',
          borderRadius: '12px',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700, cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        className="hover:scale-105"
      >
        Send Another Message
      </button>
    </div>
  );

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
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-[#6b7280] uppercase tracking-widest px-1">Email Address</label>
          <input 
            required
            type="email" 
            placeholder="john@example.com"
            className="w-full bg-[#fafafa] border border-[rgba(10,10,15,0.08)] rounded-xl px-5 py-3.5 text-sm font-medium text-[#0a0a0f] outline-none focus:ring-4 focus:ring-[#ff4d1c]/5 focus:bg-white transition-all"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-[#6b7280] uppercase tracking-widest px-1">Inquiry Subject</label>
          <select 
            className="w-full bg-[#fafafa] border border-[rgba(10,10,15,0.08)] rounded-xl px-5 py-3.5 text-sm font-bold text-[#0a0a0f] outline-none focus:ring-4 focus:ring-[#ff4d1c]/5 transition-all appearance-none cursor-pointer"
            value={subject}
            onChange={e => setSubject(e.target.value)}
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
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ color: '#f05b5b', fontSize: '13px', marginTop: '8px', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            ⚠️ {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={sending}
          className="w-full py-4 bg-[#ff4d1c] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-orange-500/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {sending ? (
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
