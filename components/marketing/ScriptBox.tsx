'use client';

import { useState } from 'react';
import Link from 'next/link';

// Script box for marketing pages. Visitors can draft and measure a script; generating needs a free
// account (the TTS API requires sign-in), so the button goes to /signup instead of failing silently.
export default function ScriptBox({
  defaultText,
  placeholder = 'Paste or type your script here...',
  maxChars = 500,
  dir,
}: {
  defaultText: string;
  placeholder?: string;
  maxChars?: number;
  dir?: 'ltr' | 'rtl';
}) {
  const [text, setText] = useState(defaultText);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const seconds = Math.round((words / 150) * 60); // ~150 words per minute, estimate

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-xl border border-[#e2dfdb] text-left">
      <div className="flex justify-between items-center mb-4 text-[12px] font-bold text-slate-400">
        <span className="text-slate-900 text-[14px] font-['Syne']">Your script</span>
        <span>{text.length} / {maxChars} characters · ~{seconds}s of audio (est.)</span>
      </div>
      <textarea
        value={text}
        dir={dir}
        onChange={(e) => setText(e.target.value.slice(0, maxChars))}
        placeholder={placeholder}
        aria-label="Script"
        className="w-full h-[140px] bg-slate-50 border-2 border-[#e2dfdb] focus:border-[#E8522A] rounded-xl p-4 text-[16px] text-slate-700 resize-none outline-none transition-colors text-left align-top"
      />
      <div className="mt-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <p className="text-[13px] text-slate-500">
          Generating audio needs a free account: 10,000 characters a month, no credit card.
        </p>
        <Link
          href="/signup"
          className="w-full sm:w-auto shrink-0 px-8 py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[16px] text-center transition-colors"
        >
          Sign up free to generate →
        </Link>
      </div>
    </div>
  );
}
