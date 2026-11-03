'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Clock, 
  FileAudio, 
  Zap, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles,
  BarChart3,
  HardDrive
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdUnit from '@/components/ads/AdUnit';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ToolsClient() {
  const [activeTab, setActiveTab] = useState<'duration' | 'planner' | 'filesize'>('duration');

  // Tool 1: Word to Audio Duration State
  const [scriptText, setScriptText] = useState(
    "Stop paying thousands of dollars for voice actors. Generate studio-quality, human-like voiceovers in seconds with FlashTTS. Built specifically for YouTube creators, podcasters, and publishers who release new content every single day."
  );
  const [wpm, setWpm] = useState<number>(150); // 130 slow, 150 normal, 175 fast
  const [copied, setCopied] = useState(false);

  // Stats calculation
  const wordCount = useMemo(() => {
    const trimmed = scriptText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [scriptText]);

  const charCount = useMemo(() => scriptText.length, [scriptText]);

  const durationSeconds = useMemo(() => {
    if (wordCount === 0) return 0;
    return Math.round((wordCount / wpm) * 60);
  }, [wordCount, wpm]);

  const formattedDuration = useMemo(() => {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }, [durationSeconds]);

  // Tool 3: Audio File Size Calculator State
  const [calcDurationMinutes, setCalcDurationMinutes] = useState<number>(5);
  const [bitrate, setBitrate] = useState<'128' | '192' | '320' | 'wav'>('192');

  const estimatedFileSizeMB = useMemo(() => {
    const totalSeconds = calcDurationMinutes * 60;
    if (bitrate === 'wav') {
      // 16-bit, 44.1 kHz, mono = 44100 * 2 bytes/sec = ~88.2 KB/sec
      return ((totalSeconds * 88200) / (1024 * 1024)).toFixed(2);
    }
    const kbps = parseInt(bitrate, 10);
    // (kbps * 1000 / 8) bytes per second
    return ((totalSeconds * (kbps * 125)) / (1024 * 1024)).toFixed(2);
  }, [calcDurationMinutes, bitrate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Word Count: ${wordCount} words\nCharacters: ${charCount}\nEstimated Audio Duration: ${formattedDuration} at ${wpm} WPM`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans selection:bg-[#E8522A]/20 text-slate-800">
      <Navbar />

      {/* ── HERO HEADER ── */}
      <section className="pt-28 pb-12 md:pt-40 md:pb-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[12px] uppercase tracking-widest mb-6">
            <Calculator size={14} fill="currentColor" /> FREE CREATOR UTILITIES
          </div>

          <h1 className="font-['Syne'] font-extrabold text-[36px] sm:text-[50px] lg:text-[60px] leading-[1.1] tracking-tight max-w-[900px] mx-auto mb-6 text-slate-900">
            Free Audio & Voiceover <span className="text-[#E8522A]">Calculators</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-[680px] mx-auto leading-relaxed mb-8">
            Plan your script length, estimate spoken voiceover durations, and calculate audio export file sizes in real time.
          </p>

          {/* Tab Navigation */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white/70 backdrop-blur-md border border-black/5 shadow-sm max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('duration')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'duration'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock size={16} /> Word to Audio Time
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'planner'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 size={16} /> Platform Planner
            </button>
            <button
              onClick={() => setActiveTab('filesize')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'filesize'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive size={16} /> File Size Estimator
            </button>
          </div>
        </div>
      </section>

      {/* ── TOOL CONTENT SECTION ── */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          {activeTab === 'duration' && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Input Textarea */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xl shadow-black/5">
                  <div className="flex items-center justify-between mb-4">
                    <label htmlFor="script-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Paste or Type Your Script
                    </label>
                    <button
                      onClick={() => setScriptText('')}
                      className="text-xs font-semibold text-slate-400 hover:text-[#E8522A] transition-colors"
                    >
                      Clear Text
                    </button>
                  </div>

                  <textarea
                    id="script-input"
                    rows={8}
                    value={scriptText}
                    onChange={(e) => setScriptText(e.target.value)}
                    placeholder="Enter your script here to calculate its spoken duration..."
                    className="w-full p-4 rounded-2xl bg-[#faf8f5] border border-black/5 text-slate-800 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#E8522A]/30 focus:border-[#E8522A] transition-all resize-y"
                  />

                  {/* Speech Rate Controls */}
                  <div className="mt-6 pt-6 border-t border-black/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Speech Pace: <strong className="text-slate-900 font-bold">{wpm} WPM</strong>
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {wpm === 130 ? 'Slow / Audiobook' : wpm === 150 ? 'Conversational / Normal' : 'Fast / Shorts & Ads'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Slow (130 WPM)', val: 130 },
                        { label: 'Normal (150 WPM)', val: 150 },
                        { label: 'Fast (175 WPM)', val: 175 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setWpm(item.val)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            wpm === item.val
                              ? 'bg-[#E8522A] text-white border-[#E8522A] shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-black/5 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Results Card */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-[#E8522A]/20 blur-2xl pointer-events-none" />

                  <div className="relative z-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E8522A] bg-[#E8522A]/10 px-3 py-1 rounded-full inline-block mb-6">
                      Estimated Voiceover Time
                    </span>

                    <div className="mb-8">
                      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        Spoken Duration
                      </div>
                      <div className="font-['Syne'] font-extrabold text-5xl sm:text-6xl text-white tracking-tight">
                        {formattedDuration}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 mb-8">
                      <div>
                        <div className="text-slate-400 text-xs font-semibold mb-1">Word Count</div>
                        <div className="text-2xl font-bold text-white font-['Syne']">{wordCount}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs font-semibold mb-1">Characters</div>
                        <div className="text-2xl font-bold text-white font-['Syne']">{charCount}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-xs text-slate-300 leading-relaxed">
                      💡 <strong>FlashTTS Advantage:</strong> In FlashTTS, this script requires ~{charCount} credits. On our $9 Starter plan (200,000 characters), you can generate this script over <strong className="text-white">{charCount > 0 ? Math.floor(200000 / charCount) : 0} times</strong>!
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied' : 'Copy Stats'}</span>
                    </button>
                    <Link
                      href="/signup"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E8522A] hover:bg-[#d04520] text-white text-xs font-bold transition-colors shadow-lg shadow-[#E8522A]/25"
                    >
                      <span>Generate Audio</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'planner' && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-xl shadow-black/5">
              <div className="text-center max-w-[650px] mx-auto mb-10">
                <h2 className="font-['Syne'] font-bold text-2xl sm:text-3xl text-slate-900 mb-3">
                  Script Length by Platform Target
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Recommended word counts, speech tempos, and pacing strategies for maximum retention across video and audio formats.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    format: 'TikTok / YouTube Shorts / Reels',
                    duration: '30 - 60 seconds',
                    words: '75 - 150 words',
                    speed: '160 - 175 WPM (Punchy & Energetic)',
                    tip: 'Hook the listener in the first 3 seconds. Use conversational or upbeat voices.',
                  },
                  {
                    format: 'Standard YouTube Video (Mid-Form)',
                    duration: '8 - 12 minutes',
                    words: '1,200 - 1,800 words',
                    speed: '145 - 155 WPM (Clear & Narrative)',
                    tip: 'Insert micro-pauses between concept transitions to give the audience time to absorb information.',
                  },
                  {
                    format: 'Podcast Episode / Interview Narration',
                    duration: '20 - 45 minutes',
                    words: '3,000 - 6,500 words',
                    speed: '140 - 150 WPM (Relaxed & Conversational)',
                    tip: 'Choose deep, warm baritone or friendly natural voices for sustained listening without fatigue.',
                  },
                  {
                    format: 'Audiobook Chapter',
                    duration: '15 - 30 minutes',
                    words: '2,000 - 4,000 words',
                    speed: '130 - 140 WPM (Measured & Dramatic)',
                    tip: 'Audiobooks require slower pacing so the listener can imagine the scene. Leave generous sentence pauses.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-[#faf8f5] border border-black/5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#E8522A] mb-2">
                        {item.format}
                      </div>
                      <div className="font-['Syne'] font-extrabold text-xl text-slate-900 mb-3">
                        {item.duration}
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                        <div><strong>Target Words:</strong> {item.words}</div>
                        <div><strong>Recommended Tempo:</strong> {item.speed}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-black/5">
                      💡 {item.tip}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'filesize' && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-xl shadow-black/5">
              <div className="text-center max-w-[650px] mx-auto mb-10">
                <h2 className="font-['Syne'] font-bold text-2xl sm:text-3xl text-slate-900 mb-3">
                  Audio File Size & Bitrate Calculator
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Estimate how large your rendered MP3 or WAV audio files will be before downloading or uploading to your hosting platform.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Audio Duration: <strong className="text-slate-900">{calcDurationMinutes} Minutes</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="120"
                      value={calcDurationMinutes}
                      onChange={(e) => setCalcDurationMinutes(parseInt(e.target.value, 10))}
                      className="w-full accent-[#E8522A]"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                      <span>1 min</span>
                      <span>30 min</span>
                      <span>60 min</span>
                      <span>120 min</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                      Output Format & Quality
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: '128', label: 'MP3 128 kbps', desc: 'Podcast / Standard' },
                        { id: '192', label: 'MP3 192 kbps', desc: 'Studio (Recommended)' },
                        { id: '320', label: 'MP3 320 kbps', desc: 'Maximum MP3 Quality' },
                        { id: 'wav', label: 'WAV 16-bit / 44.1kHz', desc: 'Uncompressed Master' },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setBitrate(fmt.id as any)}
                          className={`p-3.5 rounded-xl text-left border transition-all ${
                            bitrate === fmt.id
                              ? 'bg-[#E8522A]/10 border-[#E8522A] text-slate-900'
                              : 'bg-slate-50 border-black/5 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900">{fmt.label}</div>
                          <div className="text-[11px] text-slate-500">{fmt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-8 text-center flex flex-col justify-center items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E8522A] bg-[#E8522A]/10 px-3 py-1 rounded-full mb-4">
                    Estimated File Size
                  </span>
                  <div className="font-['Syne'] font-extrabold text-5xl sm:text-6xl text-white mb-2 tracking-tight">
                    ~{estimatedFileSizeMB} <span className="text-2xl text-slate-400 font-normal">MB</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed mb-6">
                    Calculated for {calcDurationMinutes} minutes of audio rendered at {bitrate === 'wav' ? 'WAV uncompressed' : `${bitrate} kbps MP3`}.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[#E8522A] text-white font-bold text-xs hover:bg-[#d04520] transition-colors shadow-lg shadow-[#E8522A]/25"
                  >
                    <span>Create Audio on FlashTTS</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Ad Placement Container */}
        <div className="max-w-[900px] mx-auto px-4 mt-8">
          <AdUnit label="Advertisement" />
        </div>
      </section>

      {/* ── FOOTER CALLOUT ── */}
      <section className="py-20 px-4 sm:px-6 bg-white border-t border-black/5">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#E8522A] text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#E8522A]/20">
            <Zap size={22} fill="currentColor" />
          </div>
          <h2 className="font-['Syne'] font-extrabold text-3xl sm:text-4xl text-slate-900 mb-4">
            Turn Your Words Into Studio Voiceovers Today
          </h2>
          <p className="text-slate-600 text-base max-w-[620px] mx-auto mb-8 leading-relaxed">
            Stop estimating and start publishing. FlashTTS gives you 10x more characters than ElevenLabs at half the price, with instant voice cloning included.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="py-3.5 px-8 rounded-xl bg-[#E8522A] text-white font-bold text-sm hover:bg-[#d04520] transition-colors shadow-lg shadow-[#E8522A]/25"
            >
              Start Free - No Credit Card Needed
            </Link>
            <Link
              href="/text-to-speech"
              className="py-3.5 px-8 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              Explore TTS Features
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
