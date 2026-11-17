'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Play, Shield, Clock, Coins,
  ArrowRight, Zap, ChevronDown, CheckCircle2
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { FOUNDER, LANGUAGE_COUNT, LANGUAGE_COUNT_LABEL, DEMO_SAMPLES, PAID_PLAN_COSTS, formatPer1k } from '@/lib/siteStats';
import { LANGUAGES } from '@/utils/demo-data';
import { PLANS as SCHEMA_PLANS } from '@/lib/plans';

// ── Framer Motion Variants ──
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};


// ── FAQs ──
const FAQS = [
  {
    q: 'Do I get full commercial rights to the audio?',
    a: 'Yes - every generation on paid plans includes royalty-free commercial rights. Use it on YouTube, TikTok, podcasts, client work or paid ads. The Free plan is for personal use and its audio may include a watermark.'
  },
  {
    q: 'How does FlashTTS compare to ElevenLabs?',
    a: `Lower cost per character on every plan. FlashTTS costs ${PAID_PLAN_COSTS.map((p) => `${formatPer1k(p.per1k)} (${p.name})`).join(', ')} per 1,000 characters. ElevenLabs has the cheaper entry plan ($6 vs $9) but with 30,000 vs 200,000 characters. See the full tier-by-tier breakdown on our FlashTTS vs ElevenLabs page.`
  },
  {
    q: 'Can I clone my own voice exactly?',
    a: 'Yes. Upload a clean 10-30 second audio sample of your voice to create a clone, then generate speech with it from your text. Voice cloning is included on every plan (1 clone on Free).'
  },
  {
    q: 'Can I monetize YouTube and TikTok videos with FlashTTS audio?',
    a: 'Yes. All generations on paid plans include royalty-free commercial rights. Both YouTube and TikTok allow monetization of videos using AI-generated voiceovers as long as your content is original and complies with platform community guidelines. Following YouTube’s synthetic media disclosure policy, creators can simply check the realistic altered/synthetic audio box in Creator Studio during upload.'
  },
  {
    q: 'What happens when I run out of credits?',
    a: 'Generation pauses until your allowance resets at the next billing cycle. You can upgrade your plan at any time to get a larger monthly allowance.'
  },
  {
    q: 'Which languages are supported?',
    a: `FlashTTS supports ${LANGUAGE_COUNT_LABEL}: ${LANGUAGES.map((l) => l.label).join(', ')}.`
  },
  {
    q: 'Can I use FlashTTS for audiobooks?',
    a: 'Yes - FlashTTS has a dedicated Audiobook Studio. Paste your manuscript, auto-detect chapters, select a voice, and generate each chapter as MP3 or WAV. Check your audiobook platform\'s technical requirements before uploading.'
  },
  {
    q: 'Why is this better than hiring a voice actor?',
    a: 'Speed, cost and flexibility. There is no booking or turnaround wait, and you can regenerate a line as often as your character allowance allows. A human actor is still the better choice when you need a specific performance.'
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes - FlashTTS offers a free plan with 10,000 characters per month. No credit card required. You can test voices, generate real audio, and explore the platform before committing to any paid plan.'
  },
  {
    q: 'What happens if I need to change my script later?',
    a: 'Just paste your updated script and regenerate - no waiting for actors, no scheduling delays, and no extra fees. Your changes are live in seconds.'
  },
];

// ── Pricing Plans (imported from shared config) ──
import { PLANS as IMPORTED_PLANS } from '@/lib/plans';
const EXTRACTED_PLANS = IMPORTED_PLANS.map(p => ({
  id: p.id,
  name: p.name,
  priceMonthly: p.priceMonthly,
  priceYearly: p.priceYearly,
  chars: p.chars,
  features: [
    `${p.charsPerGen} chars/generation`,
    `${p.voiceClones} voice clone${p.voiceClones === '1' ? '' : 's'}`,
    p.voiceLibrary,
    p.speed,
    p.history,
  ],
  isFree: p.isFree,
  isPopular: p.isPopular,
}));

export default function HomePage() {
  // ── Demo Widget State ──
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // ── Check auth state ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, [supabase]);

  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans overflow-hidden text-slate-800 selection:bg-[#E8522A]/20">
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://www.flashtts.com/#website",
                "url": "https://www.flashtts.com",
                "name": "FlashTTS",
                "description": "AI voice generator with monthly character allowances, voice cloning, and an audiobook studio.",
                "publisher": {
                  "@id": "https://www.flashtts.com/#organization"
                }
              },
              {
                "@type": "Organization",
                "@id": "https://www.flashtts.com/#organization",
                "name": "FlashTTS",
                "founder": { "@type": "Person", "name": FOUNDER.name, "jobTitle": FOUNDER.role },
                "url": "https://www.flashtts.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.flashtts.com/logo.png",
                  "width": 512,
                  "height": 512
                },
                "sameAs": [
                  "https://twitter.com/flashtts",
                  "https://www.youtube.com/@flashtts"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer support",
                  "url": "https://www.flashtts.com/contact",
                  "availableLanguage": ["English"]
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "FlashTTS",
                "applicationCategory": "MultimediaApplication",
                "operatingSystem": "Web",
                "url": "https://www.flashtts.com",
                "description": `AI voice generator with voices in ${LANGUAGE_COUNT_LABEL}. Monthly character allowances, voice cloning, and an audiobook studio.`,
                "offers": SCHEMA_PLANS.map((p) => ({
                  "@type": "Offer",
                  "name": `${p.name} Plan`,
                  "price": String(p.priceMonthly),
                  "priceCurrency": "USD",
                  "description": `${p.chars} characters per month, ${p.voiceClones.toLowerCase()} voice clone${p.voiceClones === '1' ? '' : 's'}${p.commercialUse ? ', commercial use' : ', personal use'}`
                })),
                "featureList": [
                  "AI Voice Generation",
                  "Voice Cloning",
                  `${LANGUAGE_COUNT} Languages Supported`,
                  "Dedicated Audiobook Studio",
                  "Commercial Rights on Paid Plans",
                  "No Watermarks on Paid Plans"
                ]
              },
              {
                "@type": "FAQPage",
                "mainEntity": FAQS.filter((f) => f.a.trim()).map((f) => ({
                  "@type": "Question",
                  "name": f.q,
                  "acceptedAnswer": { "@type": "Answer", "text": f.a }
                }))
              }
            ]
          })
        }}
      />
      
      <Navbar />

      {/* ── 1. HERO ── */}
      <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">

            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[11px] sm:text-[12px] uppercase tracking-widest mb-8" style={{ maxWidth: 'fit-content', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              Studio-Grade AI Voice Generator 🎙️
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-['Syne'] font-extrabold text-[44px] sm:text-[60px] lg:text-[76px] leading-[1.05] tracking-tight max-w-[900px] mb-6 text-slate-900">
              Stop Running Out of <span className="text-[#E8522A]">Voice Credits.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[17px] sm:text-[20px] text-slate-600 max-w-[650px] mb-10 leading-relaxed">
              Generous character credits and ultra-realistic voice synthesis. Built for creators who publish daily.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto px-10 py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center flex transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E8522A]/30">
                Start Free (No Credit Card)
              </Link>
              {DEMO_SAMPLES.length > 0 && (
                <a href="#demo" className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-[#e2dfdb] hover:border-[#E8522A] text-slate-800 rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center flex transition-colors">
                  Hear the Difference →
                </a>
              )}
            </motion.div>

            {/* Feature Highlights */}
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#e2dfdb] text-[13px] font-semibold text-slate-700 shadow-sm">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                Commercial Rights on Paid Plans
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#e2dfdb] text-[13px] font-semibold text-slate-700 shadow-sm">
                <Zap size={15} className="text-[#E8522A] shrink-0" fill="currentColor" />
                Lower Cost per Character on Every Plan
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#e2dfdb] text-[13px] font-semibold text-slate-700 shadow-sm">
                <Shield size={15} className="text-blue-500 shrink-0" />
                {LANGUAGE_COUNT_LABEL} Supported
              </span>
            </motion.div>

          </motion.div>
        </div>

      </section>

      {/* ── 2. MARQUEE ── */}
      <div className="py-10 border-y border-[#e2dfdb]/50 bg-white/40 backdrop-blur-md overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F0EDE8] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F0EDE8] to-transparent z-10"></div>
        <div className="flex w-max animate-marquee">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-16 px-8 opacity-40 grayscale">
              <div className="font-['Syne'] font-extrabold text-[24px]">YOUTUBERS</div>
              <div className="font-['Syne'] font-extrabold text-[24px]">PODCASTERS</div>
              <div className="font-['Syne'] font-extrabold text-[24px]">AGENCIES</div>
              <div className="font-['Syne'] font-extrabold text-[24px]">TIKTOKERS</div>
              <div className="font-['Syne'] font-extrabold text-[24px]">FACELESS CHANNELS</div>
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { animation: marquee 30s linear infinite; }`}</style>
      </div>

      {/* ── 3. BENEFITS ── */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-20">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[48px] text-slate-900 mb-6 tracking-tight">Stop renting voices.<br />Start owning your production.</h2>
            <p className="text-[18px] text-slate-600 max-w-[600px] mx-auto leading-relaxed">FlashTTS completely eliminates the friction of traditional audio creation, converting your workflows from days to literally seconds.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { i: <Coins size={32} />, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'Lower Cost per Character', desc: `From ${formatPer1k(Math.min(...PAID_PLAN_COSTS.map((p) => p.per1k)))} per 1,000 characters on paid plans. No contracts, and regenerate a line whenever you need a retake.` },
              { i: <Clock size={32} />, color: 'text-[#E8522A]', bg: 'bg-[#E8522A]/10', border: 'border-[#E8522A]/20', title: 'Less Editing', desc: "Paste your script, pick a voice, and download MP3 or WAV. Adjust pacing with punctuation and regenerate as needed." },
              { i: <Shield size={32} />, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', title: 'Commercial Rights', desc: "Every generation on a paid plan includes royalty-free commercial rights for YouTube, podcasts, client work and ads." },
            ].map((b, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5 } } }} className="bg-white rounded-[24px] p-8 lg:p-10 border border-[#e2dfdb] hover:border-[#E8522A] hover:shadow-xl transition-all duration-300 group">
                <div className={`w-16 h-16 rounded-2xl ${b.bg} ${b.border} border flex items-center justify-center ${b.color} mb-8 shrink-0 group-hover:scale-110 transition-transform`}>
                  {b.i}
                </div>
                <h3 className="font-['Syne'] font-bold text-[22px] text-slate-900 mb-4">{b.title}</h3>
                <p className="font-sans text-[16px] text-slate-600 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section className="py-24 bg-slate-900 text-white rounded-[40px] lg:rounded-[60px] mx-4 sm:mx-8 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8522A]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto relative z-10 lg:px-12 flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 w-full">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[48px] mb-6 tracking-tight">Generate audio in 3 simple clicks.</h2>
            <p className="text-[18px] text-slate-300 mb-12">We stripped away the complex dashboards and settings rendering an interface built purely for blazing speed.</p>
            <div className="flex flex-col gap-10">
              {[
                { n: '1', t: 'Paste your core script', d: 'Drop in your text. We automatically handle the pacing formatting.' },
                { n: '2', t: 'Select your voice avatar', d: 'Choose a voice from the library or clone your own voice in the browser.' },
                { n: '3', t: 'Export and Publish', d: 'Hit generate and download your audio as MP3 or WAV.' }
              ].map((s, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full border-2 border-[#E8522A] text-[#E8522A] flex items-center justify-center font-[Syne] font-bold text-[20px] shrink-0 bg-[#E8522A]/10">{s.n}</div>
                  <div>
                    <h4 className="font-['Syne'] font-bold text-[20px] text-white mb-2">{s.t}</h4>
                    <p className="text-slate-400 text-[15px]">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-[600px] flex justify-center lg:justify-end">
            <div className="w-full bg-slate-800/50 p-6 rounded-[24px] border border-slate-700/50 backdrop-blur-xl shadow-2xl relative">
              <div className="absolute -top-4 -right-4 bg-[#E8522A] text-white px-4 py-1.5 rounded-full font-bold text-[12px] shadow-lg rotate-6">Illustration</div>
              <div className="h-6 w-full flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="w-full h-[180px] bg-slate-900 rounded-xl mb-4 flex items-center justify-center border border-slate-800">
                <div className="flex items-center gap-1 h-12 opacity-80">
                  {[1, 2, 3, 2, 1, 4, 2, 3, 5, 2, 1].map((v, i) => (
                    <div key={i} className="w-2 rounded-full bg-[#E8522A]" style={{ height: `${v * 20}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="w-full py-4 bg-slate-700 rounded-xl mb-4"></div>
              <div className="w-full py-6 bg-[#E8522A] rounded-xl flex items-center justify-center text-white font-[Syne] font-bold">Download MP3</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. PRODUCTION WORKFLOWS ── */}
      <section className="py-24 sm:py-32 px-4 bg-white border-y border-[#e2dfdb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8522A]/10 text-[#E8522A] text-xs font-bold uppercase tracking-wider mb-3">
              Use Cases & Production
            </div>
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[44px] text-slate-900 tracking-tight">
              Engineered for daily publishing workflows.
            </h2>
            <p className="text-slate-600 text-base max-w-[620px] mx-auto mt-4 leading-relaxed">
              Whether you publish daily shorts, produce multi-chapter audiobooks, or localize content for international audiences, FlashTTS delivers high throughput with zero quality compromise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FAF8F5] border border-[#e2dfdb] rounded-[24px] p-7 flex flex-col justify-between hover:border-[#E8522A]/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E8522A]/10 text-[#E8522A] flex items-center justify-center font-bold text-xl mb-5">
                  🎬
                </div>
                <h3 className="font-['Syne'] font-bold text-[19px] text-slate-900 mb-2">
                  Faceless & Short-Form Video
                </h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Generate broadcast-quality voiceovers for YouTube Shorts, Reels, and explainer channels with custom cadence, emotional pacing, and full commercial monetization rights.
                </p>
              </div>
              <Link href="/pricing" className="mt-6 pt-4 border-t border-[#e2dfdb]/70 text-xs font-semibold text-[#E8522A] hover:underline">
                Full Commercial Rights Included →
              </Link>
            </div>

            <div className="bg-[#FAF8F5] border border-[#e2dfdb] rounded-[24px] p-7 flex flex-col justify-between hover:border-[#E8522A]/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xl mb-5">
                  📖
                </div>
                <h3 className="font-['Syne'] font-bold text-[19px] text-slate-900 mb-2">
                  Audiobook Studio & Publishing
                </h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Convert entire manuscripts into multi-chapter audiobooks. Auto-detect chapters, keep one voice throughout, and export MP3/WAV.
                </p>
              </div>
              <Link href="/audiobook" className="mt-6 pt-4 border-t border-[#e2dfdb]/70 text-xs font-semibold text-blue-600 hover:underline">
                Multi-Chapter Batch Export →
              </Link>
            </div>

            <div className="bg-[#FAF8F5] border border-[#e2dfdb] rounded-[24px] p-7 flex flex-col justify-between hover:border-[#E8522A]/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl mb-5">
                  🎙️
                </div>
                <h3 className="font-['Syne'] font-bold text-[19px] text-slate-900 mb-2">
                  Instant Voice Cloning
                </h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Record a 10-second reference sample to clone your personal timbre and cadence. Keep your distinct creator identity across hundreds of episodes without microphone fatigue.
                </p>
              </div>
              <Link href="/voice-cloning" className="mt-6 pt-4 border-t border-[#e2dfdb]/70 text-xs font-semibold text-emerald-600 hover:underline">
                Voice Cloning →
              </Link>
            </div>

            <div className="bg-[#FAF8F5] border border-[#e2dfdb] rounded-[24px] p-7 flex flex-col justify-between hover:border-[#E8522A]/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xl mb-5">
                  🌍
                </div>
                <h3 className="font-['Syne'] font-bold text-[19px] text-slate-900 mb-2">
                  Multi-Language Localization
                </h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Expand global reach with voices in {LANGUAGE_COUNT_LABEL}, including Hindi, Arabic, Spanish, French, and Japanese.
                </p>
              </div>
              <Link href="/text-to-speech" className="mt-6 pt-4 border-t border-[#e2dfdb]/70 text-xs font-semibold text-amber-600 hover:underline">
                {LANGUAGE_COUNT_LABEL} →
              </Link>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '40px',
            paddingTop: '32px',
            borderTop: '1px solid #e2dfdb'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
              fontWeight: 600
            }}>
              Optimized for creators publishing on
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              flexWrap: 'wrap',
              opacity: 0.5
            }}>
              {['YouTube', 'TikTok', 'Spotify', 'Apple Podcasts'].map(platform => (
                <span key={platform} style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#374151',
                  fontFamily: 'Syne, sans-serif',
                  letterSpacing: '-0.02em'
                }}>
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO (renders only when lib/siteStats DEMO_SAMPLES lists files in /public/samples) ── */}
      {DEMO_SAMPLES.length > 0 && (
        <section id="demo" className="py-24 px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[48px] text-slate-900 tracking-tight text-center mb-12">Hear a Sample</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_SAMPLES.map((s) => (
                <div key={s.src} className="bg-white rounded-[20px] border border-[#e2dfdb] p-6">
                  <div className="font-['Syne'] font-bold text-slate-900">{s.voice}</div>
                  <div className="text-[13px] text-slate-500 mb-4">{s.language}</div>
                  <audio controls preload="none" src={s.src} className="w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. PRICING ── */}
      <section id="pricing" className="py-24 sm:py-32 px-4 bg-[#F0EDE8] border-y border-[#e2dfdb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[44px] text-slate-900 tracking-tight mb-6">Simple, scale-ready pricing.</h2>
            <div className="inline-flex bg-slate-200 border border-slate-300 rounded-[12px] p-1.5 mx-auto">
              <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-[8px] text-[15px] font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Monthly</button>
              <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 rounded-[8px] text-[15px] font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-[#E8522A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                Yearly <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] tracking-widest uppercase">-20%</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto md:overflow-visible pb-4 md:pb-0">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-5 gap-[12px] md:gap-6 pt-5">
            {EXTRACTED_PLANS.map((plan, i) => {
              const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
              const isFree = (plan as any).isFree;

              return (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } } }} className={`bg-white rounded-[24px] border relative overflow-visible ${plan.isPopular ? 'border-[#E8522A] shadow-xl' : 'border-[#e2dfdb] hover:border-slate-400 shadow-sm'} transition-colors flex flex-col shrink-0 md:shrink`} style={{ padding: '20px', minWidth: '200px' }}>
                  {plan.isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8522A] text-white px-4 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase z-10">Most Popular</div>}
                  <h4 className="font-['Syne'] font-bold text-[20px] text-slate-900 mb-2">{plan.name}</h4>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-['Syne'] font-extrabold text-[36px] text-slate-900">${price}</span>
                    {billingCycle === 'yearly' && !isFree && <span className="text-[15px] text-slate-400 line-through font-bold">${plan.priceMonthly}</span>}
                  </div>
                  <p className="text-[14px] text-slate-500 font-medium mb-6 pb-6 border-b border-[#e2dfdb]">
                    {isFree ? 'forever' : `per month${billingCycle === 'yearly' ? ', billed annually' : ''}`}
                  </p>
                  <ul className="flex-1 flex flex-col gap-4 mb-8">
                    <li className="flex items-start gap-3 text-[14px] text-slate-800 font-bold">
                      <CheckCircle2 size={18} className="text-[#E8522A] shrink-0" />{plan.chars} chars/month
                    </li>
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 text-[14px] text-slate-600">
                        <CheckCircle2 size={18} className="text-blue-500 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => router.push(isLoggedIn ? '/dashboard/billing' : '/signup')} className={`w-full py-3 rounded-xl flex items-center justify-center font-['Syne'] font-bold text-[16px] transition-transform hover:-translate-y-0.5 cursor-pointer ${plan.isPopular ? 'bg-[#E8522A] text-white shadow-lg' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                    {isFree ? 'Get Started Free' : 'Start for Free'}
                  </button>
                </motion.div>
              );
            })}
          </div>
          </div>

          <div className="text-center mt-10">
            <Link href={isLoggedIn ? '/dashboard/billing' : '/pricing'} className="inline-flex items-center gap-2 text-[#E8522A] font-['Syne'] font-bold text-[16px] hover:underline">
              See All Plans & Compare Features <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ── */}
      <section className="py-24 sm:py-32 px-4 max-w-[800px] mx-auto">
        <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[44px] text-slate-900 tracking-tight text-center mb-4">Frequently Asked Questions</h2>
        <div className="text-center mb-12">
          <div className="text-[13px] text-slate-500">
            Still have questions? <Link href="/contact" style={{ color: '#E8522A', fontWeight: 'bold' }}>Contact us →</Link>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {FAQS.filter((f) => f.a.trim()).map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className={`border ${isOpen ? 'border-[#E8522A] bg-white' : 'border-[#e2dfdb] bg-white'} rounded-[20px] overflow-hidden transition-colors shadow-sm`}>
                <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                  <span className="font-['Syne'] font-bold text-[18px] text-slate-900 pr-8">{faq.q}</span>
                  <ChevronDown size={20} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#E8522A]' : ''}`} />
                </button>
                <div className={`px-6 pb-6 text-slate-600 text-[15.5px] leading-relaxed ${isOpen ? '' : 'hidden'}`}>
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 8. FINAL CTA ── */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
            }}
          >
            {/* Background glow effects */}
            <div style={{
              position: 'absolute', top: '-80px', right: '-80px',
              width: '300px', height: '300px',
              background: 'rgba(232,82,42,0.15)',
              borderRadius: '50%', filter: 'blur(80px)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute', bottom: '-60px', left: '-60px',
              width: '250px', height: '250px',
              background: 'rgba(245,197,24,0.08)',
              borderRadius: '50%', filter: 'blur(60px)',
              pointerEvents: 'none'
            }} />

            {/* Content */}
            <div style={{
              position: 'relative', zIndex: 10,
              padding: '60px 24px',
              textAlign: 'center',
            }}
              className="sm:px-16 sm:py-20"
            >
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                gap: '8px', marginBottom: '24px',
                padding: '6px 16px',
                background: 'rgba(232,82,42,0.15)',
                border: '1px solid rgba(232,82,42,0.3)',
                borderRadius: '99px',
              }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
                <span style={{
                  fontSize: '12px', fontWeight: 700,
                  color: '#f5c518', letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'Syne, sans-serif'
                }}>
                  Generous Voice Credits For Every Creator
                </span>
              </div>

              {/* Heading */}
              <h2 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(32px, 5vw, 52px)',
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                margin: '0 0 16px',
                maxWidth: '700px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                Never Run Out of{' '}
                <span style={{ color: '#E8522A' }}>
                  Voice Credits
                </span>{' '}
                Again.
              </h2>

              {/* Subtext */}
              <p style={{
                fontSize: 'clamp(15px, 2vw, 18px)',
                color: 'rgba(255,255,255,0.55)',
                maxWidth: '500px',
                margin: '0 auto 36px',
                lineHeight: 1.7,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                Start free - no credit card needed.
                Upgrade when you're ready to scale.
              </p>

              {/* CTA Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
                className="sm:flex-row sm:justify-center"
              >
                <Link
                  href="/signup"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 32px',
                    background: '#E8522A',
                    color: '#ffffff',
                    borderRadius: '14px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 800,
                    fontSize: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 8px 32px rgba(232,82,42,0.4)',
                    transition: 'all 0.2s',
                    width: '100%',
                    maxWidth: '280px',
                  }}
                  className="hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,82,42,0.5)] sm:w-auto"
                >
                  Start Free - No Credit Card
                  <ArrowRight size={18} />
                </Link>

                {DEMO_SAMPLES.length > 0 && <Link
                  href="#demo"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 32px',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.8)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    width: '100%',
                    maxWidth: '280px',
                  }}
                  className="hover:bg-white/15 hover:border-white/20 sm:w-auto"
                >
                  <Play size={16} fill="currentColor" />
                  Hear a Sample
                </Link>}
              </div>

              {/* Trust row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '28px',
                flexWrap: 'wrap',
              }}>
                {[
                  '✓ Free forever plan',
                  '✓ No credit card',
                  '✓ Cancel anytime',
                ].map(item => (
                  <span key={item} style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}