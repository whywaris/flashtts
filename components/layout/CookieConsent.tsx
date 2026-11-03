'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if an external CMP script is loaded
    const hasExternalCmp = 
      document.getElementById('cookieyes') || 
      document.getElementById('Cookiebot') || 
      (window as unknown as { google_privacy_settings?: unknown }).google_privacy_settings;

    const consent = localStorage.getItem('flashtts_cookie_consent');
    if (!consent && !hasExternalCmp) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level: 'all' | 'essential') => {
    try {
      localStorage.setItem(
        'flashtts_cookie_consent',
        JSON.stringify({
          level,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore localStorage exceptions in private browsing
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-[430px] z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#0b0f19] text-white p-5 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8522A]/15 border border-[#E8522A]/30 flex items-center justify-center shrink-0 text-[#E8522A]">
            <Cookie size={18} />
          </div>
          <div className="flex-1 pr-1">
            <h3 className="font-['Syne'] font-bold text-sm text-white mb-1">
              Cookie & Privacy Choices
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We use cookies to analyze site traffic, personalize content, and support our services in compliance with GDPR and privacy regulations.{' '}
              <Link href="/privacy" className="text-[#E8522A] underline hover:text-[#ff6a42]">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => handleConsent('all')}
            className="flex-1 py-2 px-3.5 rounded-lg bg-[#E8522A] text-white font-semibold text-xs hover:bg-[#d04520] transition-colors shadow-sm"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => handleConsent('essential')}
            className="flex-1 py-2 px-3.5 rounded-lg bg-white/10 text-slate-200 font-semibold text-xs hover:bg-white/20 transition-colors border border-white/10"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
