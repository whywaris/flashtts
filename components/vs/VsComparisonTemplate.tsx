'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, DollarSign, Mic, CheckCircle2, 
  ArrowRight, ChevronDown, Check, X,
  Clock, AlertTriangle, Calculator,
  BookOpen, Headphones, Info,
  MinusCircle, PlusCircle,
  StopCircle, BellOff, ShieldCheck,
  Infinity
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ComparisonData } from '@/data/comparisons/elevenlabs';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

interface Props {
  data: ComparisonData;
}

export default function VsComparisonTemplate({ data }: Props) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // SEO Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://flashtts.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Comparisons",
        "item": "https://flashtts.com/vs"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `FlashTTS vs ${data.competitorName}`,
        "item": `https://flashtts.com/vs/${data.slug}`
      }
    ]
  };

  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans selection:bg-[#E8522A]/20 text-slate-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      {/* ── 1. HERO ── */}
      <section className="pt-20 pb-20 lg:pt-32 lg:pb-32 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[12px] uppercase tracking-widest mb-8">
              <Zap size={14} fill="currentColor" /> {data.hero.badge}
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-['Syne'] font-extrabold text-[40px] sm:text-[60px] lg:text-[72px] leading-[1.05] tracking-tight max-w-[900px] mb-6 text-slate-900">
              {data.hero.title.split(data.competitorName).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="text-[#E8522A]">{data.competitorName}</span>}
                </React.Fragment>
              ))}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[17px] sm:text-[20px] text-slate-600 max-w-[650px] mb-10 leading-relaxed">
              {data.hero.subheadline}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto px-10 py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center flex transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E8522A]/30">
                Start Free on FlashTTS →
              </Link>
              <a href="#comparison" className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-[#e2dfdb] hover:border-[#E8522A] text-slate-800 rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center flex transition-colors shadow-sm">
                See Full Comparison ↓
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 text-[13px] font-bold text-slate-400 uppercase tracking-widest flex flex-wrap justify-center gap-x-6 gap-y-2">
              <span>No credit card required</span>
              <span>Free tier available</span>
              <span>Cancel anytime</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 1.5 DIFFERENCE BANNER (Optional) ── */}
      {data.differenceBanner && (
        <section className="pb-24 px-4 sm:px-6">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Card - Competitor */}
            <div className="bg-white p-10 rounded-[40px] border-2 border-slate-100 shadow-sm relative group overflow-hidden">
               <div className="absolute top-6 right-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{data.differenceBanner.left.label}</div>
               <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 mb-8 items-center justify-center">
                 {data.differenceBanner.left.icon === 'book' && <BookOpen size={32} />}
                 {data.differenceBanner.left.icon === 'headphones' && <Headphones size={32} />}
               </div>
               <h3 className="font-['Syne'] font-extrabold text-[28px] text-slate-900 mb-4">{data.differenceBanner.left.title}</h3>
               <p className="text-slate-600 text-[17px] leading-relaxed mb-8 max-w-[400px] italic">{data.differenceBanner.left.text}</p>
               <div className="inline-flex px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-[12px] font-bold uppercase tracking-widest italic font-['Syne']">
                 {data.differenceBanner.left.tag}
               </div>
            </div>

            {/* Right Card - FlashTTS */}
            <div className="bg-[#FFF5F0] p-10 rounded-[40px] border-2 border-[#E8522A] shadow-xl relative group overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E8522A]/10 blur-[50px] rounded-full"></div>
               <div className="absolute top-6 right-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#E8522A] italic">{data.differenceBanner.right.label}</div>
               <div className="w-16 h-16 rounded-3xl bg-[#E8522A]/10 flex items-center justify-center text-[#E8522A] mb-8 items-center justify-center">
                 {data.differenceBanner.right.icon === 'mic' && <Mic size={32} />}
                 {data.differenceBanner.right.icon === 'waveform' && <Zap size={32} fill="currentColor" />}
               </div>
               <h3 className="font-['Syne'] font-extrabold text-[28px] text-slate-900 mb-4">{data.differenceBanner.right.title}</h3>
               <p className="text-slate-700 text-[17px] leading-relaxed mb-8 max-w-[400px] italic">{data.differenceBanner.right.text}</p>
               <div className="inline-flex px-4 py-2 bg-[#E8522A] text-white rounded-full text-[12px] font-bold uppercase tracking-widest italic font-['Syne']">
                 {data.differenceBanner.right.tag}
               </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 2. QUICK VERDICT ── */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.verdictCards.map((card, i) => (
            <motion.div 
              key={i} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } } }}
              className="bg-white p-8 rounded-[24px] border border-[#e2dfdb] shadow-sm flex flex-col items-center text-center relative group hover:border-[#E8522A] transition-colors"
            >
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${card.badgeColor === 'green' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {card.badge}
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#E8522A] mb-6 group-hover:scale-110 transition-transform`}>
                {card.icon === 'lightning' && <Zap size={28} fill="currentColor" />}
                {card.icon === 'dollar' && <DollarSign size={28} />}
                {card.icon === 'microphone' && <Mic size={28} />}
                {card.icon === 'shield' && <ShieldCheck size={28} />}
                {card.icon === 'infinity' && <Infinity size={28} />}
              </div>
              <h3 className="font-['Syne'] font-bold text-[20px] mb-3">{card.title}</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">{card.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3. COMPARISON TABLE ── */}
      <section id="comparison" className="py-24 bg-white border-y border-[#e2dfdb] px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[48px] text-slate-900 tracking-tight">Side-by-Side Comparison</h2>
          </div>

          <div className="overflow-x-auto rounded-[24px] border border-[#e2dfdb] shadow-xl">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 z-20">
                <tr className="border-b border-[#e2dfdb]">
                  <th className="bg-slate-50 p-6 text-[12px] font-black uppercase tracking-widest text-slate-400 w-1/3">Feature</th>
                  <th className="bg-[#E8522A] p-6 text-[16px] font-['Syne'] font-bold text-white w-1/3 text-center italic">FlashTTS</th>
                  <th className="bg-slate-100 p-6 text-[16px] font-['Syne'] font-bold text-slate-600 w-1/3 text-center">{data.competitorName}</th>
                </tr>
              </thead>
              <tbody>
                {data.table.rows.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${row.win === 'flash' ? 'bg-emerald-50/30' : ''}`}>
                    <td className="p-5 font-bold text-slate-900 text-[14px]">{row.feature}</td>
                    <td className="p-5 text-center font-bold text-slate-800 text-[14px]">
                      <div className="flex items-center justify-center gap-2">
                        {row.win === 'flash' && <CheckCircle2 size={16} className="text-emerald-500" />}
                        {row.flashTts}
                      </div>
                    </td>
                    <td className="p-5 text-center text-slate-500 text-[14px]">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 3.5 PROBLEM SECTION (Optional) ── */}
      {data.problemSection && (
        <section className="py-24 bg-slate-900 px-4 sm:px-6 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E8522A]/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E8522A]/5 blur-[100px] rounded-full" />
          
          <div className="max-w-[1200px] mx-auto relative z-10 text-center">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[48px] text-white tracking-tight mb-4 italic">
              {data.problemSection.title}
            </h2>
            <p className="text-[18px] text-white/70 max-w-[600px] mx-auto mb-16 italic">
              {data.problemSection.subtext}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.problemSection.cards.map((card, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[32px] text-left hover:border-[#E8522A]/30 transition-colors group">
                  <div className="w-14 h-14 rounded-2xl bg-[#E8522A]/10 flex items-center justify-center text-[#E8522A] mb-6 group-hover:scale-110 transition-transform">
                    {card.icon === 'clock-x' && <Clock size={28} />}
                    {card.icon === 'warning' && <AlertTriangle size={28} />}
                    {card.icon === 'calculator' && <Calculator size={28} />}
                    {card.icon === 'stop' && <StopCircle size={28} />}
                    {card.icon === 'bell-off' && <BellOff size={28} />}
                    {card.icon === 'check-circle' && <CheckCircle2 size={28} />}
                  </div>
                  <h3 className="font-['Syne'] font-bold text-[20px] text-white mb-3 italic">{card.title}</h3>
                  <p className="text-white/70 text-[15px] leading-relaxed italic">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. PRICING BREAKDOWN ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[48px] text-slate-900 tracking-tight mb-4">{data.pricingBreakdown.heading}</h2>
            <p className="text-[18px] text-slate-600 max-w-[600px] mx-auto">{data.pricingBreakdown.subtext}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {data.pricingBreakdown.creators.map((c, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-[#e2dfdb] hover:border-[#E8522A] transition-colors shadow-sm group">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[#E8522A] mb-4">{c.type}</div>
                <div className="flex items-center gap-2 text-slate-400 text-[14px] font-medium mb-8">
                  <Zap size={14} className="text-[#E8522A]" /> Needs: {c.needs}
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[13px] font-bold text-slate-500">{data.competitorName} Cost</span>
                    <span className="text-[15px] font-bold text-red-500">{c.competitorCost}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-[13px] font-bold text-emerald-700">FlashTTS Cost</span>
                    <span className="text-[15px] font-bold text-emerald-600">{c.flashTtsCost}</span>
                  </div>
                </div>

                <div className="text-center p-6 bg-[#E8522A] rounded-[20px] text-white shadow-lg shadow-[#E8522A]/20">
                  <div className="text-[11px] font-black uppercase tracking-widest text-white/70 mb-1">Total Savings</div>
                  <div className="text-[28px] font-['Syne'] font-extrabold text-white">{c.savings}</div>
                  <div className="text-[13px] font-bold text-white/90">({c.savingsYearly})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CHOOSE WHAT ── */}
      <section className="py-24 bg-white border-y border-[#e2dfdb] px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[48px] text-slate-900 tracking-tight">Which One is Right For You?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* FlashTTS */}
            <div className="bg-[#FFF5F0] border-2 border-[#E8522A] p-10 rounded-[40px] shadow-xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E8522A]/10 blur-[50px] rounded-full"></div>
               <h3 className="font-['Syne'] font-extrabold text-[28px] text-slate-900 mb-8">Choose FlashTTS if...</h3>
               <ul className="space-y-5">
                 {data.whyChoose.flashTts.map((item, i) => (
                   <li key={i} className="flex gap-4 items-start text-[16px] font-medium text-slate-700">
                     <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                       <Check size={14} strokeWidth={4} />
                     </div>
                     {item}
                   </li>
                 ))}
               </ul>
            </div>

            {/* Competitor */}
            <div className="bg-slate-50 border-2 border-slate-200 p-10 rounded-[40px] shadow-sm">
               <h3 className="font-['Syne'] font-extrabold text-[28px] text-slate-900 mb-8">Choose {data.competitorName} if...</h3>
               <ul className="space-y-5">
                 {data.whyChoose.competitor.map((item, i) => (
                   <li key={i} className="flex gap-4 items-start text-[16px] font-medium text-slate-500">
                     <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                       <ArrowRight size={14} strokeWidth={4} />
                     </div>
                     {item}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5.5 WARNING SECTION (Optional) ── */}
      {data.warningSection && (
        <section className="py-24 px-4 sm:px-6">
          <div className="max-w-[1000px] mx-auto bg-amber-50 border-2 border-amber-200 p-10 sm:p-14 rounded-[40px] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200/20 blur-[50px] rounded-full"></div>
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-['Syne'] font-extrabold text-[28px] text-slate-900 mb-4 italic">{data.warningSection.title}</h3>
                <p className="text-slate-700 text-[17px] leading-relaxed mb-6 italic">{data.warningSection.text}</p>
                
                {data.warningSection.quote && (
                  <div className="bg-white/60 border border-amber-100 p-8 rounded-[24px] mb-8 relative italic font-medium text-slate-600 after:content-[''] after:absolute after:left-10 after:top-[-10px] after:w-5 after:h-5 after:bg-white/60 after:border-t after:border-l after:border-amber-100 after:rotate-45">
                    "{data.warningSection.quote}"
                    <div className="mt-4 text-[13px] font-bold text-slate-400 uppercase tracking-widest not-italic">— {data.warningSection.quoteSource}</div>
                  </div>
                )}

                {data.warningSection.note && (
                  <p className="p-5 bg-amber-100/50 rounded-2xl text-[14px] text-amber-900 border border-amber-200/50 mb-8 italic">
                    {data.warningSection.note}
                  </p>
                )}

                {data.warningSection.mathCard && (
                  <div className="bg-slate-900 p-8 rounded-[32px] mb-8 shadow-xl">
                    <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[#E8522A] mb-6">{data.warningSection.mathCard.title}</div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-[14px] font-bold text-slate-400 flex items-center gap-3 italic">
                          <MinusCircle size={16} className="text-red-500" /> {data.warningSection.mathCard.competitorLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <span className="text-[14px] font-bold text-emerald-400 flex items-center gap-3 italic">
                          <CheckCircle2 size={16} /> {data.warningSection.mathCard.flashTtsLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {data.warningSection.comparisonCallout && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-900/5 border border-slate-900/10 p-6 rounded-[24px]">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">
                        {data.warningSection.comparisonCallout.leftLabel}
                      </div>
                      <div className="text-[15px] font-bold text-slate-600 italic">
                        "{data.warningSection.comparisonCallout.leftText}"
                      </div>
                    </div>
                    <div className="bg-[#E8522A] p-6 rounded-[24px] shadow-lg shadow-[#E8522A]/20">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 italic">
                        FlashTTS Starter $9/mo
                      </div>
                      <div className="text-[15px] font-bold text-white italic">
                        "{data.warningSection.comparisonCallout.rightText}"
                      </div>
                    </div>
                  </div>
                )}

                <div className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest italic">
                  <Info size={14} /> Source: {data.warningSection.source}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. FAQ ── */}
      <section className="py-24 sm:py-32 px-4 max-w-[800px] mx-auto">
        <h2 className="font-['Syne'] font-extrabold text-[36px] sm:text-[44px] text-slate-900 tracking-tight text-center mb-12">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {data.faqs.map((faq, idx) => {
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

      {/* ── 7. FINAL CTA ── */}
      <section className="pb-32 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto bg-[#E8522A] rounded-[40px] px-6 py-20 sm:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-white/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="font-['Syne'] font-extrabold text-[40px] sm:text-[56px] text-white tracking-tight leading-[1.1] mb-6">Ready to Stop Running Out of Credits?</h2>
            <p className="text-[18px] text-white/80 max-w-[500px] mx-auto mb-10">Join thousands of creators who switched to FlashTTS for more audio, less cost.</p>
            <Link href="/signup" className="inline-flex py-5 px-10 bg-slate-900 hover:bg-black text-white rounded-xl font-['Syne'] font-bold text-[18px] items-center justify-center gap-3 transition-transform hover:-translate-y-1 shadow-xl">
              Start Free — No Credit Card →
            </Link>
            <p className="mt-6 text-[13px] font-bold text-white/60">Free forever plan · No credit card · Cancel anytime</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
