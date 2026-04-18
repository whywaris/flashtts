'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  DollarSign, 
  Globe, 
  Target, 
  Coins, 
  Shield, 
  ArrowRight,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Framer Motion Variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function AboutClient() {
  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans selection:bg-[#E8522A]/20 text-slate-800">
      <Navbar />

      {/* ── SECTION 1: HERO ── */}
      <section className="pt-32 pb-20 px-4 md:pt-48 md:pb-32">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div 
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[12px] uppercase tracking-widest mb-8"
            >
              <Zap size={14} fill="currentColor" /> OUR STORY
            </motion.div>

            <motion.h1 
              variants={fadeUp}
              className="font-['Syne'] font-extrabold text-[36px] md:text-[56px] leading-[1.1] tracking-tight max-w-[800px] mb-8 text-slate-900"
            >
              We Built FlashTTS Because<br />
              We Kept Running Out of <span className="text-[#E8522A]">Credits.</span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className="text-[17px] md:text-[19px] text-slate-600 max-w-[600px] mx-auto leading-relaxed"
            >
              Every month, the same problem. Great content 
              idea. Perfect script. Then — credits gone. 
              Upgrade or wait. We got tired of it. So we 
              built the platform we actually wanted to use.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: THE PROBLEM WE SOLVED ── */}
      <section className="py-20 md:py-32 bg-white px-4 border-y border-[#e2dfdb]/50">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT - Stats */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-col gap-6"
          >
            {[
              { 
                num: "6.5x", 
                label: "More credits than ElevenLabs at the same price", 
                icon: <Zap size={24} className="text-[#E8522A]" />,
                iconBg: "bg-[#E8522A]/10"
              },
              { 
                num: "$960", 
                label: "Saved per year by an average daily YouTube creator", 
                icon: <DollarSign size={24} className="text-emerald-500" />,
                iconBg: "bg-emerald-50"
              },
              { 
                num: "19", 
                label: "Languages supported from day one", 
                icon: <Globe size={24} className="text-blue-500" />,
                iconBg: "bg-blue-50"
              }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                variants={fadeUp}
                className="bg-[#f8f7f4] p-6 md:p-8 rounded-[24px] border border-[#e2dfdb]/50 flex items-center gap-6 group hover:translate-x-2 transition-transform cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="font-['Syne'] font-bold text-[32px] md:text-[40px] text-[#E8522A] leading-none mb-1">
                    {stat.num}
                  </div>
                  <div className="text-[14px] text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* RIGHT - Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-['Syne'] font-extrabold text-[32px] md:text-[48px] text-slate-900 mb-8 tracking-tight leading-[1.1]">
              The math was simple.<br />
              The solution took longer.
            </h2>
            <div className="space-y-6 text-[16px] md:text-[17px] text-slate-600 leading-[1.8]">
              <p>
                Voice actors charge $50+ per minute. 
                AI voice platforms charge premium prices 
                for limited credits that run out mid-month. 
                Creators were stuck — either spend a fortune 
                or compromise on quality.
              </p>
              <p>
                We built FlashTTS to break that cycle. 
                Studio-quality AI voices. Character-based 
                pricing that makes sense. No expiring minutes. 
                No surprise top-ups. Just generate and publish.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 3: OUR MISSION ── */}
      <section className="py-20 md:py-32 bg-slate-900 text-white rounded-[40px] md:rounded-[60px] mx-4 sm:mx-8 px-4 overflow-hidden relative mb-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8522A]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-[800px] mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div 
              variants={fadeUp}
              className="text-[11px] font-bold text-[#E8522A] uppercase tracking-[0.2em] mb-6"
            >
              OUR MISSION
            </motion.div>
            <motion.h2 
              variants={fadeUp}
              className="font-['Syne'] font-extrabold text-[32px] md:text-[48px] mb-8 tracking-tight leading-[1.1]"
            >
              Every creator deserves a voice.<br />
              Not just the ones who can afford it.
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              className="text-[17px] md:text-[19px] text-white/80 mb-12 leading-relaxed"
            >
              We&apos;re building the platform where a solo 
              creator in Pakistan has the same quality tools 
              as a production studio in New York. Where 
              a first-time podcaster sounds as good as 
              a 10-year veteran. Where publishing daily 
              is limited by your ideas — not your budget.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link 
                href="/signup" 
                className="inline-flex py-4 px-10 bg-white text-slate-900 rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-xl"
              >
                Start Creating Free <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 4: WHAT WE BELIEVE ── */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeUp} 
            className="text-center mb-16"
          >
            <h2 className="font-['Syne'] font-extrabold text-[36px] md:text-[48px] text-slate-900 mb-4 tracking-tight">What We Stand For</h2>
            <p className="text-[18px] text-slate-600 max-w-[600px] mx-auto">The principles that guide every decision we make.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Target size={32} />, 
                title: "Creators First", 
                text: "Every feature we build starts with one question — does this help a creator publish more, faster? If the answer is no, we don't build it.",
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                border: "border-emerald-200"
              },
              { 
                icon: <Coins size={32} />, 
                title: "Fair Pricing Always", 
                text: "We will never charge you for credits that expire. We will never hide features behind paywalls that make no sense. Pricing should be simple and honest.",
                color: "text-[#E8522A]",
                bg: "bg-[#E8522A]/10",
                border: "border-[#E8522A]/20"
              },
              { 
                icon: <Shield size={32} />, 
                title: "Your Voice. Your Rights.", 
                text: "Every audio you generate on FlashTTS is yours. Full commercial rights on all paid plans. No royalties. No restrictions. No fine print.",
                color: "text-blue-500",
                bg: "bg-blue-50",
                border: "border-blue-200"
              }
            ].map((card, i) => (
              <motion.div 
                key={i} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={{ 
                  hidden: { opacity: 0, y: 30 }, 
                  visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } } 
                }} 
                className="bg-white rounded-[24px] p-8 md:p-10 border border-[#e2dfdb] hover:border-[#E8522A] hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-16 h-16 rounded-2xl ${card.bg} ${card.border} border flex items-center justify-center ${card.color} mb-8 shrink-0 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="font-['Syne'] font-bold text-[22px] text-slate-900 mb-4">{card.title}</h3>
                <p className="text-[16px] text-slate-600 leading-relaxed">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: THE PRODUCT STORY ── */}
      <section className="py-20 md:py-32 bg-white px-4">
        <div className="max-w-[800px] mx-auto relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-16"
          >
            <h2 className="font-['Syne'] font-extrabold text-[32px] md:text-[44px] text-slate-900 tracking-tight">How FlashTTS Came to Be</h2>
          </motion.div>

          <div className="relative pl-8 md:pl-12 border-l-[3px] border-[#E8522A] space-y-16">
            {[
              {
                label: "The Problem",
                title: "Running out mid-month",
                text: "Like thousands of creators, we kept hitting credit limits on every AI voice platform. The quality was there. The pricing made no sense."
              },
              {
                label: "The Idea",
                title: "What if credits never ran out?",
                text: "We started building a platform around one simple idea — give creators so many credits that running out is never a concern again."
              },
              {
                label: "The Build",
                title: "19 languages. 1,000+ voices.",
                text: "We built voice generation across 19 languages, added voice cloning, audiobook studio, and a voice library with over 1,000 professionally recorded voices."
              },
              {
                label: "Today",
                title: "Built for daily publishers.",
                text: "FlashTTS is now used by YouTubers, Podcasters, Faceless Channel Owners, Agencies and Audiobook Creators who publish daily and can't afford to stop."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative"
              >
                <div className="absolute -left-[39.5px] md:-left-[55.5px] top-2 w-5 h-5 rounded-full bg-[#E8522A] border-4 border-white shadow-sm"></div>
                <div className="inline-flex px-3 py-1 rounded-full bg-[#E8522A]/10 text-[#E8522A] font-bold text-[11px] uppercase tracking-wider mb-3">
                  {item.label}
                </div>
                <h3 className="font-['Syne'] font-bold text-[20px] text-slate-900 mb-3">{item.title}</h3>
                <p className="text-[15px] text-slate-600 leading-relaxed font-medium">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: NUMBERS ── */}
      <section className="py-12 bg-white border-y border-[#e2dfdb]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { n: "12,000+", l: "Creators Worldwide" },
              { n: "50M+", l: "Characters Generated" },
              { n: "19", l: "Languages Supported" },
              { n: "4.9★", l: "Average Rating" }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-['Syne'] font-extrabold text-[32px] md:text-[40px] text-slate-900 mb-1 leading-none">
                  {s.n}
                </div>
                <div className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FINAL CTA ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto bg-[#E8522A] rounded-[40px] px-6 py-20 sm:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-white/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="font-['Syne'] font-extrabold text-[40px] sm:text-[56px] text-white tracking-tight leading-[1.1] mb-6">Ready to Never Run Out Again?</h2>
            <p className="text-[18px] text-white/80 max-w-[600px] mx-auto mb-10">
              Join 12,000+ creators who switched to FlashTTS for more credits, 
              better quality, and a price that actually makes sense.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex py-5 px-10 bg-slate-900 hover:bg-black text-white rounded-xl font-['Syne'] font-bold text-[18px] items-center justify-center gap-3 transition-transform hover:-translate-y-1 shadow-xl"
            >
              Start Free — No Credit Card <ArrowRight size={20} />
            </Link>
            <p className="mt-8 text-[13px] font-bold text-white/60">
              Free forever plan · No credit card · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
