'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Mic, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LANGUAGE_COUNT_LABEL, COMPETITOR_PRICES_CHECKED } from '@/lib/siteStats';

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

interface CompetitorCard {
  name: string;
  slug: string;
  badge: string;
  headline: string;
  description: string;
  savings: string;
  keyPoints: string[];
}

const COMPARISONS: CompetitorCard[] = [
  {
    name: 'ElevenLabs',
    slug: 'elevenlabs',
    badge: 'Most Popular',
    headline: 'Price per Character Compared',
    description: 'FlashTTS Starter: 200,000 characters for $9. ElevenLabs Starter: 30,000 for $6. Tier-by-tier table with the math.',
    savings: 'Lower cost per character on every plan',
    keyPoints: [
      '200,000 chars vs 30,000 chars on entry tiers',
      'ElevenLabs has the cheaper entry price ($6 vs $9)',
      'Voice cloning included on every FlashTTS plan',
    ],
  },
  {
    name: 'Murf AI',
    slug: 'murf',
    badge: 'Characters vs Minutes',
    headline: 'Character vs Minute Pricing',
    description: 'Murf bills by audio minutes ($19/mo for 2 hours). FlashTTS bills by characters ($9/mo for 200,000).',
    savings: 'Lower cost per character (est.)',
    keyPoints: [
      '200,000 characters for $9 vs 2 hours for $19',
      'Voice cloning on every FlashTTS plan; Murf lists it on Enterprise',
      'Murf offers team and Slides integrations',
    ],
  },
  {
    name: 'Speechify',
    slug: 'speechify',
    badge: 'Creator Studio',
    headline: 'Built for Creators, Not Just Readers',
    description: 'Speechify is designed to listen to PDFs and articles. FlashTTS is a production studio for YouTubers, podcasters and agencies.',
    savings: '$9/mo vs $29/mo (monthly billing)',
    keyPoints: [
      'MP3 and WAV export for publishing',
      'Commercial rights on all paid plans',
      'Voice cloning on every plan',
    ],
  },
  {
    name: 'LOVO AI',
    slug: 'lovo',
    badge: 'Characters vs Hours',
    headline: 'Price per Character Compared',
    description: 'LOVO Basic is $25/mo for 2 hours of audio. FlashTTS Starter is $9/mo for 200,000 characters.',
    savings: 'Lower cost per character (est.)',
    keyPoints: [
      '$9/mo Starter vs LOVO $25/mo Basic tier',
      'Voice cloning on every FlashTTS plan; LOVO lists it from Pro',
      'LOVO lists 100+ languages',
    ],
  },
  {
    name: 'WellSaid Labs',
    slug: 'wellsaid',
    badge: 'Multilingual Value',
    headline: `${LANGUAGE_COUNT_LABEL} and Voice Cloning`,
    description: `WellSaid Labs starts at $49/mo for English voices. FlashTTS starts at $9/mo with ${LANGUAGE_COUNT_LABEL} and voice cloning.`,
    savings: '$9/mo vs $49/mo entry price',
    keyPoints: [
      '$9/mo starting price vs $49/mo on WellSaid',
      `${LANGUAGE_COUNT_LABEL} vs English-only`,
      'WellSaid offers SOC2 enterprise compliance',
    ],
  },
  {
    name: 'NaturalReader',
    slug: 'naturalreader',
    badge: 'Commercial Rights',
    headline: 'Commercial Rights on Paid Plans',
    description: 'NaturalReader personal plans are for personal use. FlashTTS includes commercial rights on every paid plan.',
    savings: 'Commercial rights from $9/mo',
    keyPoints: [
      'Monetize on YouTube and podcasts with any paid plan',
      'Monthly allowance only, no daily cap',
      'Voice cloning on every plan',
    ],
  },
  {
    name: 'Cartesia',
    slug: 'cartesia',
    badge: 'Creator Studio Alternative',
    headline: 'No-Code Creator Studio vs Developer API Metering',
    description: 'Cartesia Sonic is built for low-latency API voice agents. FlashTTS is a web studio with an audiobook editor and fixed monthly allowances.',
    savings: 'Fixed monthly allowances',
    keyPoints: [
      '200,000 chars for $9 vs usage-based developer billing',
      'Multi-chapter audiobook studio and in-browser cloning',
      'Cartesia wins on published latency',
    ],
  },
  {
    name: 'Fish Audio',
    slug: 'fish-audio',
    badge: 'Cloud Alternative',
    headline: 'Cloud Studio vs Self-Hosting',
    description: 'Fish Audio offers open weights you can self-host. FlashTTS is a hosted browser studio with no GPU setup.',
    savings: 'No GPU setup',
    keyPoints: [
      'No GPU drivers, Python environments, or HuggingFace tokens',
      'Commercial rights on all paid plans',
      'Fish Audio wins if you want open model weights',
    ],
  },
];

// Ranges from the comparison data files (competitor values pending verification, see data/comparisons/*).
const COMPARISON_METRICS = [
  { feature: 'Entry Plan Price', flash: '$9 / month', others: '$6 - $49 / month' },
  { feature: 'Included Volume', flash: '200,000 characters', others: '30,000 characters to 2 hours of audio' },
  { feature: 'Voice Cloning', flash: 'Included on every plan', others: 'Varies; often higher tiers' },
  { feature: 'Commercial Rights', flash: 'Included on all paid plans', others: 'Some personal plans restrict monetization' },
  { feature: 'Languages Supported', flash: LANGUAGE_COUNT_LABEL, others: 'English-only to 100+' },
  { feature: 'Unused Allowance', flash: 'Resets each billing cycle', others: 'Usually resets monthly' },
];

export default function VsHubClient() {
  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans selection:bg-[#E8522A]/20 text-slate-800">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[12px] uppercase tracking-widest mb-6"
            >
              <Zap size={14} fill="currentColor" /> COMPARISON HUB
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-['Syne'] font-extrabold text-[36px] sm:text-[54px] lg:text-[64px] leading-[1.08] tracking-tight max-w-[950px] mb-6 text-slate-900"
            >
              How Does <span className="text-[#E8522A]">FlashTTS</span> Compare?
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg md:text-xl text-slate-600 max-w-[760px] leading-relaxed mb-10"
            >
              Tired of running out of credits or paying exorbitant fees for voice generation?
              Side-by-side breakdowns of how FlashTTS compares to other tools, with the math shown. Competitor prices checked {COMPETITOR_PRICES_CHECKED}.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 bg-white/60 px-3.5 py-1.5 rounded-full border border-black/5">
                <CheckCircle2 size={16} className="text-[#E8522A]" /> Lower Cost per Character
              </span>
              <span className="flex items-center gap-1.5 bg-white/60 px-3.5 py-1.5 rounded-full border border-black/5">
                <CheckCircle2 size={16} className="text-[#E8522A]" /> Math Shown
              </span>
              <span className="flex items-center gap-1.5 bg-white/60 px-3.5 py-1.5 rounded-full border border-black/5">
                <CheckCircle2 size={16} className="text-[#E8522A]" /> Sources Linked
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 6 COMPARISON CARDS ── */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {COMPARISONS.map((comp) => (
              <motion.div
                key={comp.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="group flex flex-col justify-between bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:border-[#E8522A]/30 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E8522A] bg-[#E8522A]/10 px-3 py-1 rounded-full">
                      {comp.badge}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <TrendingDown size={14} /> {comp.savings}
                    </span>
                  </div>

                  <h2 className="font-['Syne'] font-bold text-2xl text-slate-900 mb-2 group-hover:text-[#E8522A] transition-colors">
                    FlashTTS vs {comp.name}
                  </h2>

                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    {comp.headline}
                  </p>

                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    {comp.description}
                  </p>

                  <div className="space-y-2.5 mb-8 border-t border-black/5 pt-5">
                    {comp.keyPoints.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-[#E8522A] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/vs/${comp.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm group-hover:bg-[#E8522A] transition-all shadow-sm hover:shadow"
                >
                  <span>Compare vs {comp.name}</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AT A GLANCE TABLE ── */}
      <section className="py-20 px-4 sm:px-6 bg-white/40 border-y border-black/5">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8522A] mb-2 block">
              Quick Overview
            </span>
            <h2 className="font-['Syne'] font-extrabold text-3xl sm:text-4xl text-slate-900">
              FlashTTS vs Industry Average
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Why creators choose FlashTTS as their primary voice generation platform.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-900 text-white p-4 sm:p-5 font-semibold text-xs sm:text-sm uppercase tracking-wider">
              <div className="col-span-5 sm:col-span-6">Metric</div>
              <div className="col-span-4 sm:col-span-3 text-[#E8522A]">FlashTTS</div>
              <div className="col-span-3 text-slate-400">Other Tools</div>
            </div>

            <div className="divide-y divide-black/5">
              {COMPARISON_METRICS.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center hover:bg-[#F0EDE8]/40 transition-colors">
                  <div className="col-span-5 sm:col-span-6 font-semibold text-slate-800">
                    {row.feature}
                  </div>
                  <div className="col-span-4 sm:col-span-3 font-bold text-[#E8522A] flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{row.flash}</span>
                  </div>
                  <div className="col-span-3 text-slate-500">
                    {row.others}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto bg-slate-900 text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#E8522A]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#E8522A]/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E8522A] flex items-center justify-center mb-6 shadow-lg shadow-[#E8522A]/30">
              <Zap size={24} className="text-white" />
            </div>
            <h2 className="font-['Syne'] font-extrabold text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
              Ready to Upgrade Your Voiceovers?
            </h2>
            <p className="text-slate-300 max-w-[620px] text-base sm:text-lg mb-8 leading-relaxed">
              Start with 10,000 free characters a month. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#E8522A] text-white font-bold text-base hover:bg-[#d04520] transition-colors shadow-lg shadow-[#E8522A]/25"
              >
                <span>Start Free - No Credit Card Needed</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold text-base hover:bg-white/20 transition-colors border border-white/10"
              >
                <span>View All Plans</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRADEMARK DISCLAIMER ── */}
      <div className="max-w-[1200px] mx-auto px-6 py-6 text-center text-[12px] text-slate-400">
        <p>
          Disclaimer: ElevenLabs, Murf AI, Speechify, LOVO, WellSaid Labs, NaturalReader, Cartesia, and Fish Audio are trademarks
          of their respective owners. FlashTTS is an independent platform and is not affiliated with,
          sponsored by, or endorsed by any of these companies. Comparison data is gathered from
          publicly available information as of 2026.
        </p>
      </div>

      <Footer />
    </div>
  );
}

