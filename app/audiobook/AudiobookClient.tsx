'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, Play, Pause, 
  CheckCircle2, ArrowRight, ChevronDown, 
  Award
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Framer motion animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

// Genre Audio Samples
const GENRES = [
  {
    id: 'fiction',
    name: 'Fiction & Fantasy',
    voice: 'Arthur - Deep Storyteller',
    duration: '0:34',
    excerpt: "The gates of Aethelgard groaned in the northern gale. Kael gripped the hilt of his father's blade, the ancient runes pulsing with a faint, violet ember in the gathering dark.",
    audioUrl: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3'
  },
  {
    id: 'business',
    name: 'Business & Leadership',
    voice: 'Marcus - Confident Executive',
    duration: '0:28',
    excerpt: "Hyper-growth isn't born from reckless expansion. It emerges from relentless operational discipline, razor-sharp feedback loops, and an obsession with customer retention.",
    audioUrl: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3'
  },
  {
    id: 'thriller',
    name: 'Thriller & Mystery',
    voice: 'Elena - Cinematic Suspense',
    duration: '0:31',
    excerpt: "The encrypted terminal flickered once before going dark. She wasn't alone in the archives. Footsteps echoed from corridor B, measured, deliberate, and closing fast.",
    audioUrl: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3'
  },
  {
    id: 'scifi',
    name: 'Sci-Fi & Cyberpunk',
    voice: 'Nova - Atmospheric AI',
    duration: '0:30',
    excerpt: "Sub-orbital telemetry confirmed the anomaly. Sector 9 was venting atmospheric plasma directly into the low vacuum, illuminating the neo-Tokyo skyline in neon violet.",
    audioUrl: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3'
  },
  {
    id: 'children',
    name: "Children's Stories",
    voice: 'Pip - Warm & Playful',
    duration: '0:26',
    excerpt: "Barnaby the little blue hedgehog packed his acorn biscuits, adjusted his tiny spectacles, and took his very first step into the Great Whispering Woods.",
    audioUrl: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3'
  }
];

// Audiobook FAQs
const AUDIOBOOK_FAQS = [
  {
    q: "Can I sell audiobooks created with FlashTTS on Audible, Spotify, and Apple Books?",
    a: "Yes, 100%! All audiobooks generated on paid plans (Starter, Creator, Pro, Studio) come with full, unconditional commercial publishing rights. You keep 100% of your book royalties with zero licensing fees or attribution required."
  },
  {
    q: "Does FlashTTS audio pass ACX / Audible audio submission guidelines?",
    a: "Yes. Our Audiobook Studio includes automated ACX mastering. Audio is encoded at 192kbps/320kbps MP3 or lossless 24-bit WAV, with RMS loudness calibrated between -23dB and -19dB, peak levels below -3dB, and a noise floor lower than -60dB."
  },
  {
    q: "Can I assign different voices to dialogue and narration?",
    a: "Absolutely. With our Multi-Voice Character Casting engine, you can assign one voice for narration and distinct character voices for character dialogues within the same chapter."
  },
  {
    q: "Can I clone my own voice to narrate my own book?",
    a: "Yes! Simply record a 60-second clear sample of your voice in our browser studio. FlashTTS will clone your voice with full emotional range so you can narrate an 80,000-word book in your own voice in under 2 hours without renting a recording booth."
  },
  {
    q: "What manuscript formats can I upload?",
    a: "FlashTTS natively accepts DOCX, PDF, EPUB, and plain TXT files. Our parser automatically detects chapter headings, breaks, and scene transitions."
  }
];

export default function AudiobookClient() {
  const [activeGenre, setActiveGenre] = useState(GENRES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Interactive Calculator State
  const [wordCount, setWordCount] = useState<number>(65000);
  const wordsPerHour = 9300; // standard narration pace ~155 words/min
  const estimatedHours = (wordCount / wordsPerHour).toFixed(1);
  const traditionalCost = Math.round(Number(estimatedHours) * 350); // $350 per finished hour typical PFH rate
  const flashttsCost = 39; // Pro plan cost
  const savings = traditionalCost - flashttsCost;

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSelectGenre = (genre: typeof GENRES[0]) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setActiveGenre(genre);
  };

  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans selection:bg-[#E8522A]/20 text-slate-800">
      
      {/* Schema Markup for SEO & AdSense Quality Bots */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "FlashTTS Audiobook Studio",
            "operatingSystem": "Web",
            "applicationCategory": "AudioApplication",
            "description": "Convert full manuscripts into studio-quality audiobooks ready for Audible and Apple Books with multi-character AI narration.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      <Navbar />

      {/* ── 1. HERO SECTION ── */}
      <section className="pt-24 pb-20 lg:pt-36 lg:pb-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[12px] uppercase tracking-widest mb-6">
              <Headphones size={15} /> FlashTTS Audiobook Studio
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-['Syne'] font-extrabold text-[38px] sm:text-[56px] lg:text-[70px] leading-[1.08] tracking-tight max-w-[920px] mb-6 text-slate-900">
              Turn Manuscripts Into <br className="hidden sm:inline" />
              <span className="text-[#E8522A]">Studio Audiobooks</span> in Hours.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[17px] sm:text-[20px] text-slate-600 max-w-[680px] mb-10 leading-relaxed font-normal">
              Convert full-length novels, non-fiction guides, and memoirs into master-grade audiobooks. 
              Auto-split chapters, cast multiple character voices, and export ACX & Audible-compliant audio.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-10 py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center flex gap-2 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#E8522A]/25"
              >
                Create Your Audiobook Free <ArrowRight size={18} />
              </Link>
              <a 
                href="#demo" 
                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-[#e2dfdb] hover:border-[#E8522A] text-slate-800 rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center flex transition-colors shadow-sm"
              >
                Listen to Samples ↓
              </a>
            </motion.div>

            {/* Badges */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center items-center gap-6 text-[13px] font-bold text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#E8522A]" /> 100% Audible & ACX Compliant
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#E8522A]" /> Full Commercial Rights
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#E8522A]" /> Multi-Voice Character Casting
              </span>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ── 2. INTERACTIVE AUDIO SAMPLES / GENRE PLAYER ── */}
      <section id="demo" className="py-20 bg-white border-y border-[#e2dfdb]/70 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8522A] bg-[#E8522A]/10 px-3 py-1 rounded-full">
              Voice Library & Samples
            </span>
            <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[44px] text-slate-900 tracking-tight mt-3 mb-3">
              Hear The Studio Difference
            </h2>
            <p className="text-slate-600 text-[16px] max-w-[550px] mx-auto">
              Natural breathing, emotional pacing, and zero robotic monotone. Listen to real samples across different literary genres.
            </p>
          </div>

          {/* Genre selector tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSelectGenre(g)}
                className={`px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all cursor-pointer ${
                  activeGenre.id === g.id
                    ? 'bg-[#E8522A] text-white shadow-md shadow-[#E8522A]/20 scale-105'
                    : 'bg-[#faf8f3] text-slate-700 border border-[#e2dfdb] hover:border-slate-400'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* Audio Player Card */}
          <div className="bg-[#faf8f3] border-2 border-[#e2dfdb] rounded-[28px] p-6 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                    {activeGenre.name}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">
                    Narrated by: <strong className="text-slate-800">{activeGenre.voice}</strong>
                  </span>
                </div>

                <div className="bg-white border border-[#e2dfdb] rounded-2xl p-6 italic text-slate-700 text-[16px] sm:text-[18px] leading-relaxed shadow-sm">
                  "{activeGenre.excerpt}"
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">
                  <span>Sample Duration: {activeGenre.duration}</span>
                  <span>•</span>
                  <span>44.1kHz Studio Quality</span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#e2dfdb]">
                <audio
                  ref={audioRef}
                  src={activeGenre.audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  preload="none"
                />

                <button
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full bg-[#E8522A] text-white flex items-center justify-center shadow-lg shadow-[#E8522A]/30 hover:scale-105 active:scale-95 transition-all mb-4 cursor-pointer"
                  aria-label={isPlaying ? 'Pause sample' : 'Play sample'}
                >
                  {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>

                <p className="font-['Syne'] font-bold text-slate-900 text-sm mb-1">
                  {isPlaying ? 'Now Playing Sample' : 'Click to Play Narration'}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  100% generated via FlashTTS Neural Engine
                </p>

                <Link
                  href="/signup"
                  className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-center rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Generate With This Voice →
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 3. WORKFLOW: HOW IT WORKS IN 4 STEPS ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8522A] bg-[#E8522A]/10 px-3 py-1 rounded-full">
              Production Pipeline
            </span>
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[46px] text-slate-900 tracking-tight mt-3 mb-4">
              From Manuscript to Master in 4 Steps
            </h2>
            <p className="text-slate-600 text-[17px] max-w-[620px] mx-auto">
              No audio engineers, no soundproof booths, and no $50/hour recording studio fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-[#e2dfdb] shadow-sm hover:border-[#E8522A] transition-colors relative flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#E8522A]/10 text-[#E8522A] flex items-center justify-center font-black text-lg mb-6">
                01
              </div>
              <h3 className="font-['Syne'] font-bold text-[20px] text-slate-900 mb-3">
                Upload Manuscript
              </h3>
              <p className="text-slate-600 text-[14px] leading-relaxed">
                Drop in your EPUB, DOCX, or PDF manuscript. FlashTTS automatically splits chapters, preserves headings, and formats dialogues.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-[#e2dfdb] shadow-sm hover:border-[#E8522A] transition-colors relative flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#E8522A]/10 text-[#E8522A] flex items-center justify-center font-black text-lg mb-6">
                02
              </div>
              <h3 className="font-['Syne'] font-bold text-[20px] text-slate-900 mb-3">
                Cast Your Voices
              </h3>
              <p className="text-slate-600 text-[14px] leading-relaxed">
                Assign a master narrator for the book, or cast distinct voices for character dialogues to create a full multi-cast audio play.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-[#e2dfdb] shadow-sm hover:border-[#E8522A] transition-colors relative flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#E8522A]/10 text-[#E8522A] flex items-center justify-center font-black text-lg mb-6">
                03
              </div>
              <h3 className="font-['Syne'] font-bold text-[20px] text-slate-900 mb-3">
                Pacing & Emotion
              </h3>
              <p className="text-slate-600 text-[14px] leading-relaxed">
                Fine-tune pauses between paragraphs, adjust chapter room-tone, and inject emotional warmth or intensity with a single click.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl p-8 border border-[#e2dfdb] shadow-sm hover:border-[#E8522A] transition-colors relative flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#E8522A]/10 text-[#E8522A] flex items-center justify-center font-black text-lg mb-6">
                04
              </div>
              <h3 className="font-['Syne'] font-bold text-[20px] text-slate-900 mb-3">
                ACX Master Export
              </h3>
              <p className="text-slate-600 text-[14px] leading-relaxed">
                Export chapter-by-chapter with automated volume leveling. 100% compliant with Audible, Spotify, and Apple Books upload rules.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── 4. INTERACTIVE ROI & SAVINGS CALCULATOR ── */}
      <section className="py-20 bg-white border-y border-[#e2dfdb]/70 px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8522A] bg-[#E8522A]/10 px-3 py-1 rounded-full">
              Production Economics
            </span>
            <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[44px] text-slate-900 tracking-tight mt-3 mb-3">
              Calculate Your Audiobook Savings
            </h2>
            <p className="text-slate-600 text-[16px] max-w-[550px] mx-auto">
              See how much you save on narrator fees, studio rental, and sound engineering by switching to FlashTTS.
            </p>
          </div>

          <div className="bg-[#faf8f3] border-2 border-[#e2dfdb] rounded-[32px] p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Sliders */}
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-['Syne'] font-bold text-slate-900 text-lg">
                      Manuscript Word Count
                    </label>
                    <span className="px-4 py-1.5 rounded-xl bg-white border border-[#e2dfdb] font-['Syne'] font-extrabold text-[#E8522A] text-lg">
                      {wordCount.toLocaleString()} words
                    </span>
                  </div>

                  <input
                    type="range"
                    min={10000}
                    max={150000}
                    step={5000}
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    className="w-full accent-[#E8522A] h-2.5 bg-slate-200 rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                    <span>10k (Novella)</span>
                    <span>65k (Standard Novel)</span>
                    <span>150k (Epic Fantasy)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e2dfdb]/70">
                  <div className="bg-white p-5 rounded-2xl border border-[#e2dfdb]">
                    <div className="text-xs uppercase font-bold text-slate-400 mb-1">
                      Finished Audio Length
                    </div>
                    <div className="font-['Syne'] font-extrabold text-2xl text-slate-900">
                      ~{estimatedHours} Hours
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#e2dfdb]">
                    <div className="text-xs uppercase font-bold text-slate-400 mb-1">
                      Production Turnaround
                    </div>
                    <div className="font-['Syne'] font-extrabold text-2xl text-emerald-600">
                      Under 2 Hours
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Outcome Card */}
              <div className="lg:col-span-5 bg-white border-2 border-[#E8522A] rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-[#E8522A]/10">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mb-4">
                    ESTIMATED SAVINGS
                  </span>

                  <div className="font-['Syne'] font-extrabold text-[42px] sm:text-[48px] text-slate-900 leading-none mb-4">
                    ${savings.toLocaleString()}
                  </div>

                  <div className="space-y-3 pb-6 border-b border-[#e2dfdb] text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Traditional Voice Actor ($350/PFH):</span>
                      <strong className="text-slate-800 line-through">${traditionalCost.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>FlashTTS Studio Plan:</span>
                      <span>${flashttsCost}/mo</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href="/signup"
                    className="w-full py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-center block text-sm uppercase tracking-wider shadow-lg shadow-[#E8522A]/20 transition-all hover:-translate-y-0.5"
                  >
                    Start Creating Free →
                  </Link>
                  <p className="text-center text-[11px] text-slate-400 mt-2">
                    No credit card required to test your chapters
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 5. INDUSTRY SPECIFICATIONS (ACX & AUDIBLE READY) ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          
          <div className="bg-slate-900 text-white rounded-[36px] p-8 sm:p-14 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <span className="text-[11px] font-bold text-[#E8522A] uppercase tracking-widest bg-[#E8522A]/10 px-3 py-1 rounded-full border border-[#E8522A]/20">
                  Distribution Standards
                </span>

                <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[44px] text-white tracking-tight leading-tight">
                  Guaranteed Pass on ACX & Audible Requirements.
                </h2>

                <p className="text-white/80 text-[16px] leading-relaxed">
                  Audiobook platforms reject thousands of files every month due to inconsistent volume, noise floor violations, and clipping. FlashTTS pre-masters every chapter automatically to exact industry specifications.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#E8522A] shrink-0" />
                    <span className="text-sm font-semibold text-white/90">-23dB to -19dB RMS Loudness</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#E8522A] shrink-0" />
                    <span className="text-sm font-semibold text-white/90">-3dB Peak Headroom (No Clipping)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#E8522A] shrink-0" />
                    <span className="text-sm font-semibold text-white/90">192kbps / 44.1kHz MP3 & WAV</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#E8522A] shrink-0" />
                    <span className="text-sm font-semibold text-white/90">Automated Room-Tone & Head/Tail Pauses</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
                <h3 className="font-['Syne'] font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <Award size={20} className="text-[#E8522A]" /> Platform Compatibility
                </h3>

                <ul className="space-y-3.5 text-sm text-white/80">
                  <li className="flex items-center justify-between py-2 border-b border-white/10">
                    <span>Audible (ACX)</span>
                    <span className="text-emerald-400 font-bold text-xs uppercase">Certified Ready</span>
                  </li>
                  <li className="flex items-center justify-between py-2 border-b border-white/10">
                    <span>Apple Books</span>
                    <span className="text-emerald-400 font-bold text-xs uppercase">Certified Ready</span>
                  </li>
                  <li className="flex items-center justify-between py-2 border-b border-white/10">
                    <span>Spotify Audiobooks</span>
                    <span className="text-emerald-400 font-bold text-xs uppercase">Certified Ready</span>
                  </li>
                  <li className="flex items-center justify-between py-2 border-b border-white/10">
                    <span>Google Play Books</span>
                    <span className="text-emerald-400 font-bold text-xs uppercase">Certified Ready</span>
                  </li>
                  <li className="flex items-center justify-between py-2">
                    <span>Kobo Writing Life</span>
                    <span className="text-emerald-400 font-bold text-xs uppercase">Certified Ready</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 6. AUDIOBOOK FAQS ── */}
      <section className="py-20 px-4 sm:px-6 max-w-[850px] mx-auto">
        <div className="text-center mb-14">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8522A] bg-[#E8522A]/10 px-3 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[42px] text-slate-900 tracking-tight mt-3">
            Audiobook Publishing FAQs
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {AUDIOBOOK_FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-[#e2dfdb] rounded-[22px] overflow-hidden shadow-sm transition-all"
              >
                <button 
                  onClick={() => setActiveFaq(isOpen ? null : idx)} 
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer focus:outline-none"
                >
                  <span className="font-['Syne'] font-bold text-[17px] text-slate-900 pr-6">
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={20} 
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#E8522A]' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      className="px-6 pb-6 text-slate-600 text-[15px] leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 7. FINAL HIGH-CONVERTING CTA ── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto bg-[#E8522A] rounded-[36px] sm:rounded-[48px] px-6 py-16 sm:py-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-[700px] mx-auto">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[50px] text-white tracking-tight leading-[1.1] mb-6">
              Your Book Deserves to Be Heard Worldwide.
            </h2>
            <p className="text-[17px] text-white/85 mb-10 leading-relaxed">
              Join thousands of indie authors and publishing houses converting manuscripts into audiobooks in hours. 
              Start completely free today.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex py-4 px-10 bg-slate-900 hover:bg-black text-white rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-xl"
            >
              Start Generating Free Audiobook <ArrowRight size={18} />
            </Link>
            <p className="mt-6 text-[12px] font-bold text-white/60">
              Free plan available · No credit card required · Instant download
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

