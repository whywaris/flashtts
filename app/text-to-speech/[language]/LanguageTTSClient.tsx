'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Volume2,
  ChevronDown,
  Globe,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { LanguageData } from '@/data/languages/indic';

interface Props {
  langData: LanguageData;
}

export default function LanguageTTSClient({ langData }: Props) {
  // Demo Generator State
  const [text, setText] = useState(langData.defaultSampleText);
  const [selectedVoice, setSelectedVoice] = useState(langData.voices[0]?.name || 'Default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [, setIsPlaying] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: langData.langCode,
          voice: selectedVoice,
          guest: true
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans selection:bg-[#E8522A]/20 text-slate-800">
      {/* Schema Markup for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": `${langData.name} Text to Speech - FlashTTS`,
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web",
            "inLanguage": langData.langCode,
            "description": langData.metaDescription,
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />
      <Navbar />

      {/* ── 1. HERO & INTERACTIVE DEMO ── */}
      <section className="pt-24 pb-16 lg:pt-36 lg:pb-24 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[12px] uppercase tracking-widest mb-6">
            <Globe size={14} /> {langData.name} ({langData.nativeName}) Voice AI
          </div>
          <h1 className="font-['Syne'] font-extrabold text-[36px] sm:text-[54px] lg:text-[64px] leading-[1.08] tracking-tight max-w-[900px] mx-auto mb-6 text-slate-900">
            {langData.heroHeadline}
          </h1>
          <p className="text-[17px] sm:text-[19px] text-slate-600 max-w-[650px] mx-auto mb-10 leading-relaxed">
            {langData.heroSubheadline}
          </p>

          {/* ── DEMO STUDIO CONTAINER ── */}
          <div className="max-w-[850px] mx-auto bg-white rounded-3xl border-2 border-[#e2dfdb] p-6 sm:p-8 shadow-xl shadow-black/5 text-left">
            {/* Top Bar: Voice Select & Character Count */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#e2dfdb] mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Voice Avatar:</span>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-[#faf8f3] border border-[#e2dfdb] rounded-xl px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#E8522A] cursor-pointer"
                >
                  {langData.voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.gender} - {v.tone})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                <span>{text.length} characters</span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:text-slate-700 rounded-md transition-colors"
                  title="Copy text"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Script Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={langData.samplePlaceholder}
              rows={4}
              className="w-full text-[16px] sm:text-[18px] text-slate-800 placeholder-slate-400 border-none outline-none resize-none leading-relaxed bg-transparent mb-4"
            />

            {/* Bottom Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e2dfdb]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Neural {langData.name} Engine Active</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !text.trim()}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#E8522A] hover:bg-[#d64119] disabled:opacity-50 text-white rounded-xl font-['Syne'] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#E8522A]/20"
                >
                  {isGenerating ? (
                    'Generating Audio...'
                  ) : (
                    <>
                      <Volume2 size={16} /> Listen to {langData.name} Audio
                    </>
                  )}
                </button>
              </div>
            </div>
            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>

          {/* Social Proof */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-[13px] font-bold text-slate-500">
            <span>✓ 100% Commercial Monetization</span>
            <span>✓ No Robotic Accents</span>
            <span>✓ 10,000 Chars Free Forever</span>
          </div>
        </div>
      </section>

      {/* ── 2. NATIVE VOICES SHOWCASE ── */}
      <section className="py-20 bg-white border-y border-[#e2dfdb]/70 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8522A] bg-[#E8522A]/10 px-3 py-1 rounded-full">
              Voice Cast
            </span>
            <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[42px] text-slate-900 tracking-tight mt-3">
              Studio {langData.name} Voice Avatars
            </h2>
            <p className="text-slate-600 text-[16px] max-w-[500px] mx-auto mt-2">
              Carefully calibrated for local regional accents and emotional pacing.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {langData.voices.map((v, i) => (
              <div
                key={i}
                className="bg-[#faf8f3] border border-[#e2dfdb] rounded-2xl p-6 shadow-sm hover:border-[#E8522A] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E8522A]/10 text-[#E8522A] flex items-center justify-center font-bold text-lg mb-4">
                  {v.name[0]}
                </div>
                <h3 className="font-['Syne'] font-bold text-lg text-slate-900 mb-1">
                  {v.name}
                </h3>
                <span className="text-xs font-bold text-[#E8522A] uppercase tracking-wider block mb-3">
                  {v.gender} • {v.tone}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Best For: <strong>{v.bestFor}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. POPULAR CREATOR USE CASES ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8522A] bg-[#E8522A]/10 px-3 py-1 rounded-full">
              Made For Creators
            </span>
            <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[42px] text-slate-900 tracking-tight mt-3">
              Popular {langData.name} Content Formats
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {langData.useCases.map((uc, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-[#e2dfdb] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-['Syne'] font-bold text-xl text-slate-900 mb-2">
                    {uc.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {uc.description}
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="text-xs font-bold text-[#E8522A] uppercase tracking-wider flex items-center gap-1.5 hover:underline"
                >
                  Generate Voiceover →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FAQS ── */}
      <section className="py-20 bg-white border-t border-[#e2dfdb] px-4 sm:px-6 max-w-[850px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-['Syne'] font-extrabold text-[30px] sm:text-[40px] text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {langData.faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-[#faf8f3] border border-[#e2dfdb] rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                >
                  <span className="font-['Syne'] font-bold text-[16px] text-slate-900 pr-6">
                    {faq.q}
                  </span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#E8522A]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-600 text-[14.5px] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. FINAL CTA ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto bg-[#E8522A] rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden shadow-xl">
          <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[44px] tracking-tight leading-tight mb-4">
            Start Generating {langData.name} Audio Free
          </h2>
          <p className="text-white/85 text-[16px] max-w-[550px] mx-auto mb-8">
            Join thousands of creators publishing daily in regional languages. 10,000 characters free, no credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex py-4 px-10 bg-slate-900 hover:bg-black text-white rounded-xl font-['Syne'] font-bold text-[16px] items-center gap-2 shadow-lg"
          >
            Start Creating Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

