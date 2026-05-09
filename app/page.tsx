'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Shield, Clock, Coins, Star,
  ArrowRight, Zap, ChevronDown, CheckCircle2
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

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
    a: 'Yes — every generation on paid plans includes 100% royalty-free commercial rights. Use it on YouTube, TikTok, Podcasts, client work, or paid ads without ever paying royalties or worrying about copyright strikes.'
  },
  {
    q: 'How does FlashTTS compare to ElevenLabs?',
    a: 'FlashTTS gives you 6.5x more credits than ElevenLabs at the same price point. Our Starter plan includes 200,000 characters for $9/month — ElevenLabs charges $6 for only 30,000. Same studio quality, dramatically more content.'
  },
  {
    q: 'Can I clone my own voice exactly?',
    a: 'Absolutely. Upload a clean 10-30 second audio sample of your voice and our engine creates an ultra-realistic clone. You can then generate thousands of words in your exact voice — instantly, without ever recording again.'
  },
  {
    q: 'Will YouTube or TikTok detect my audio as AI?',
    a: 'Our voices are designed to be indistinguishable from human recordings. Thousands of creators use FlashTTS daily for monetized YouTube and TikTok content without any platform issues. All generated audio passes standard content detection.'
  },
  {
    q: 'What happens when I run out of credits?',
    a: 'Unlike other platforms, we give you so many credits that running out mid-month is rarely a concern. If you do hit your limit, you can upgrade your plan instantly — no waiting, no delays. Your new credits are available immediately.'
  },
  {
    q: 'Which languages are supported?',
    a: 'FlashTTS supports 19 languages including English, Arabic, Hindi, Spanish, French, German, Japanese, Korean, Portuguese, Turkish, Italian, Dutch, Polish, Russian, Swedish, Norwegian, Finnish, Danish, and Greek — with native-sounding voices for each.'
  },
  {
    q: 'Can I use FlashTTS for audiobooks?',
    a: 'Yes — FlashTTS has a dedicated Audiobook Studio. Paste your entire manuscript, auto-detect chapters, select a voice, and generate a complete audiobook in MP3 format. No clip length limits on paid plans.'
  },
  {
    q: 'Why is this better than hiring a voice actor?',
    a: 'Speed, cost, and flexibility. A professional voice actor charges $50-150+ per finished minute and takes 3-7 days to deliver. FlashTTS generates the same studio-quality audio in under 15 seconds for a fraction of the cost — and you can make unlimited retakes instantly.'
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes — FlashTTS offers a free plan with 10,000 characters per month. No credit card required. You can test voices, generate real audio, and explore the platform before committing to any paid plan.'
  },
  {
    q: 'What happens if I need to change my script later?',
    a: 'Just paste your updated script and regenerate — no begging actors for retakes, no scheduling delays, no extra charges. Your script changes are live in seconds.'
  },
];

// ── Testimonials ──
const TESTIMONIALS = [
  {
    text: "I run 4 faceless YouTube channels. Before FlashTTS, I was spending $1,200/month on voice actors and editors. Now I generate everything myself in under an hour. The voices are completely undetectable — my audience has no idea.",
    name: "David Chen",
    role: "Faceless Channel Owner",
    stat: "4 channels · 1.2M subscribers",
    avatar: "DC",
    avatarBg: "#1a3a5c",
    rating: 5,
    verified: true
  },
  {
    text: "We produce 300+ TikTok videos per week for our agency clients. FlashTTS is the only tool that keeps up with our volume. The emotional voices are insane — sad, excited, authoritative — all in one click. Our client retention went up 40% after switching.",
    name: "Sarah Jenkins",
    role: "Content Agency Owner",
    stat: "Agency · 300+ videos/week",
    avatar: "SJ",
    avatarBg: "#1a4a3a",
    rating: 5,
    verified: true
  },
  {
    text: "I publish 3 podcast episodes a week. I cloned my voice once and now my AI clone does all the narration while I focus on research and strategy. Honestly sounds better than my real voice on some days.",
    name: "Marcus Thorne",
    role: "Podcast Creator",
    stat: "Weekly show · 85K listeners",
    avatar: "MT",
    avatarBg: "#3a1a4a",
    rating: 5,
    verified: true
  },
  {
    text: "I was paying ElevenLabs $99/month and still running out of credits halfway through the month. FlashTTS gave me 10x more credits for $39. Literally the same quality — I compared them side by side. No brainer switch.",
    name: "Aisha Rahman",
    role: "YouTube Educator",
    stat: "Education channel · 220K subs",
    avatar: "AR",
    avatarBg: "#4a2a1a",
    rating: 5,
    verified: true
  },
  {
    text: "I converted my 80,000 word business book into a full audiobook in one afternoon. The Audiobook Studio is genuinely impressive — auto-detected all 12 chapters and generated everything without a single error.",
    name: "James Whitfield",
    role: "Author & Entrepreneur",
    stat: "Published author · 3 books",
    avatar: "JW",
    avatarBg: "#1a3a1a",
    rating: 5,
    verified: true
  },
  {
    text: "Our Urdu content channel went from 2 videos a week to 14. FlashTTS was the only platform with proper Urdu support. The voices sound completely native — our Pakistani audience can't tell the difference.",
    name: "Bilal Mahmood",
    role: "Urdu Content Creator",
    stat: "Urdu channel · 450K subscribers",
    avatar: "BM",
    avatarBg: "#2a1a3a",
    rating: 5,
    verified: true
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
                "@id": "https://flashtts.com/#website",
                "url": "https://flashtts.com",
                "name": "FlashTTS",
                "description": "AI Voice Generator with 10x more credits than ElevenLabs",
                "publisher": {
                  "@id": "https://flashtts.com/#organization"
                },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://flashtts.com/search?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "Organization",
                "@id": "https://flashtts.com/#organization",
                "name": "FlashTTS",
                "url": "https://flashtts.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://flashtts.com/logo.png",
                  "width": 200,
                  "height": 60
                },
                "sameAs": [
                  "https://twitter.com/flashtts",
                  "https://www.youtube.com/@flashtts"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer support",
                  "url": "https://flashtts.com/contact",
                  "availableLanguage": ["English"]
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "FlashTTS",
                "applicationCategory": "MultimediaApplication",
                "operatingSystem": "Web",
                "url": "https://flashtts.com",
                "description": "AI voice generator with 1000+ voices in 19 languages. 10x more credits than ElevenLabs. Voice cloning and audiobook studio included.",
                "offers": [
                  {
                    "@type": "Offer",
                    "name": "Free Plan",
                    "price": "0",
                    "priceCurrency": "USD",
                    "description": "10,000 characters per month, 1 voice clone, commercial use"
                  },
                  {
                    "@type": "Offer",
                    "name": "Starter Plan",
                    "price": "9",
                    "priceCurrency": "USD",
                    "description": "200,000 characters per month, 3 voice clones"
                  },
                  {
                    "@type": "Offer",
                    "name": "Creator Plan",
                    "price": "19",
                    "priceCurrency": "USD",
                    "description": "600,000 characters per month, 10 voice clones"
                  },
                  {
                    "@type": "Offer",
                    "name": "Pro Plan",
                    "price": "39",
                    "priceCurrency": "USD",
                    "description": "2,000,000 characters per month, 25 voice clones"
                  },
                  {
                    "@type": "Offer",
                    "name": "Studio Plan",
                    "price": "79",
                    "priceCurrency": "USD",
                    "description": "3,000,000 characters per month, unlimited voice clones"
                  }
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "reviewCount": "2400",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "featureList": [
                  "AI Voice Generation",
                  "Voice Cloning",
                  "19 Languages Supported",
                  "1000+ Premium Voices",
                  "Audiobook Studio",
                  "Commercial Rights Included",
                  "No Watermark on Paid Plans"
                ]
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Do I get full commercial rights to the audio?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes — every generation on paid plans includes 100% royalty-free commercial rights."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How does FlashTTS compare to ElevenLabs?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "FlashTTS gives you 6.5x more credits than ElevenLabs at the same price. Starter plan includes 200,000 chars for $9/mo vs ElevenLabs $6 for 30,000."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I clone my own voice?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. Upload a 10-30 second audio sample and generate unlimited content in your exact voice."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is there a free plan?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. FlashTTS offers a free plan with 10,000 characters per month. No credit card required."
                    }
                  }
                ]
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
              AI Voice Generator Trusted by Creators 🎙️
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-['Syne'] font-extrabold text-[44px] sm:text-[60px] lg:text-[76px] leading-[1.05] tracking-tight max-w-[900px] mb-6 text-slate-900">
              Stop Running Out of <span className="text-[#E8522A]">Voice Credits.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[17px] sm:text-[20px] text-slate-600 max-w-[650px] mb-10 leading-relaxed">
              10x more credits than ElevenLabs at half the price. Built for creators who publish daily.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto px-10 py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center flex transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E8522A]/30">
                Start Free (No Credit Card)
              </Link>
              <a href="#demo" className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-[#e2dfdb] hover:border-[#E8522A] text-slate-800 rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center flex transition-colors">
                Hear the Difference →
              </a>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["/avatars/male/1.svg", "/avatars/female/2.svg", "/avatars/male/3.svg", "/avatars/female/4.svg", "/avatars/male/5.svg"].map((src, i) => (
                    <div key={i} className="relative w-10 h-10 rounded-full border-2 border-[#F0EDE8] overflow-hidden bg-slate-100 shadow-sm">
                      <Image src={src} alt={`User avatar ${i + 1}`} width={40} height={40} className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <div className="flex text-yellow-400 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-600 text-[14px] font-medium">
                    Trusted by <span className="font-bold text-slate-900">12,000+</span> Creators
                  </p>
                </div>
              </div>
              <p className="text-slate-500 text-[13px] font-medium px-4 py-1.5 bg-slate-900/5 rounded-full border border-slate-900/5">
                Youtubers, Podcasters & Faceless Channels
              </p>
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
              { i: <Coins size={32} />, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'Save $1,000s on Actors', desc: "Stop paying $50+ per minute of audio. Generate unlimited scripts for pennies without negotiating contracts or begging for retakes." },
              { i: <Clock size={32} />, color: 'text-[#E8522A]', bg: 'bg-[#E8522A]/10', border: 'border-[#E8522A]/20', title: 'Zero Editing Required', desc: "Our models natively insert the correct emotional pacing, breaths, and pauses. Paste your script and download a flawless MP3 instantly." },
              { i: <Shield size={32} />, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', title: '100% Commercial Safe', desc: "Never worry about copyright strikes. Every generation comes cleanly packed with absolute corporate royalty-free commercial clearances." },
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
                { n: '2', t: 'Select your voice avatar', d: 'Choose from 29+ high-end studio voices or clone your exact voice natively within the browser.' },
                { n: '3', t: 'Export and Publish', d: 'Hit generate and pull a fully mixed, master-quality MP3 absolutely instantly.' }
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
              <div className="absolute -top-4 -right-4 bg-[#E8522A] text-white px-4 py-1.5 rounded-full font-bold text-[12px] shadow-lg rotate-6">Ready in 0.8s</div>
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

      {/* ── 5. TESTIMONIALS ── */}
      <section className="py-24 sm:py-32 px-4 bg-white border-y border-[#e2dfdb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[44px] text-slate-900 tracking-tight">Trusted by scale-focused creators.</h2>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '12px',
              padding: '8px 20px',
              background: 'rgba(232,82,42,0.06)',
              border: '1px solid rgba(232,82,42,0.15)',
              borderRadius: '99px'
            }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#E8522A" color="#E8522A" />
                ))}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#E8522A' }}>
                4.9 out of 5
              </span>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                from 2,400+ creators
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} style={{
                background: 'white',
                border: '1px solid #e2dfdb',
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '24px',
                  fontSize: '60px',
                  color: '#E8522A',
                  opacity: 0.08,
                  fontFamily: 'Georgia, serif',
                  lineHeight: 1,
                  userSelect: 'none'
                }}>
                  "
                </div>

                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} fill="#E8522A" color="#E8522A" />
                  ))}
                </div>

                <p style={{
                  fontSize: '15px',
                  color: '#374151',
                  lineHeight: 1.75,
                  margin: 0,
                  flex: 1,
                  fontStyle: 'italic'
                }}>
                  "{testimonial.text}"
                </p>

                <div style={{ height: '1px', background: '#e2dfdb' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: testimonial.avatarBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                    fontFamily: 'Syne, sans-serif'
                  }}>
                    {testimonial.avatar}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827', fontFamily: 'Syne, sans-serif' }}>
                        {testimonial.name}
                      </span>
                      {testimonial.verified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {testimonial.role}
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      marginTop: '4px',
                      padding: '2px 8px',
                      background: 'rgba(232,82,42,0.06)',
                      border: '1px solid rgba(232,82,42,0.15)',
                      borderRadius: '20px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#E8522A'
                    }}>
                      {testimonial.stat}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              Used by creators publishing on
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              flexWrap: 'wrap',
              opacity: 0.5
            }}>
              {['YouTube', 'TikTok', 'Spotify', 'Apple Podcasts', 'Audible'].map(platform => (
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
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className={`border ${isOpen ? 'border-[#E8522A] bg-white' : 'border-[#e2dfdb] bg-white'} rounded-[20px] overflow-hidden transition-colors shadow-sm`}>
                <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                  <span className="font-['Syne'] font-bold text-[18px] text-slate-900 pr-8">{faq.q}</span>
                  <ChevronDown size={20} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#E8522A]' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 text-slate-600 text-[15.5px] leading-relaxed">
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  Join 12,000+ Creators Today
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
                Start free — no credit card needed.
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
                  Start Free — No Credit Card
                  <ArrowRight size={18} />
                </Link>

                <Link
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
                </Link>
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