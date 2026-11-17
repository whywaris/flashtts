'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Headphones, Play, Pause, 
  CheckCircle2, ArrowRight, ChevronDown, 
  Award
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FaqList from '@/components/marketing/FaqList';

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
// Audiobook FAQs
const AUDIOBOOK_FAQS = [
  {
    q: "Can I sell audiobooks created with FlashTTS?",
    a: "Audiobooks generated on paid plans (Starter, Creator, Pro, Studio) include commercial rights, with no royalties or attribution owed to FlashTTS. Each store sets its own rules for AI-narrated audiobooks, so check the platform's policy before you publish."
  },
  {
    q: "Does FlashTTS audio meet ACX / Audible submission requirements?",
    a: "FlashTTS does not apply automatic loudness mastering. Check your chapters against your platform's technical requirements and master them in an audio editor if needed."
  },
  {
    q: "Can I assign different voices to different chapters?",
    a: "Yes. In the Audiobook Studio each chapter has its own voice setting, so you can use one voice for the narrator and another for, say, an interview chapter."
  },
  {
    q: "Can I clone my own voice to narrate my own book?",
    a: "Yes. Record or upload a clean sample of your voice to create a clone, then select it as the voice for your chapters. Voice cloning is included on every plan."
  },
  {
    q: "How do I add my manuscript?",
    a: "Paste your manuscript text into the Audiobook Studio. It detects chapter headings and splits the text into chapters you can edit before generating."
  }
];

export default function AudiobookClient() {
  // Interactive Calculator State
  const [wordCount, setWordCount] = useState<number>(65000);
  const wordsPerHour = 9300; // standard narration pace ~155 words/min
  const estimatedHours = (wordCount / wordsPerHour).toFixed(1);
  // TODO: confirm the per-finished-hour narrator rate you want to cite (assumed $350/PFH), or remove this calculator.
  const traditionalCost = Math.round(Number(estimatedHours) * 350);
  const flashttsCost = 39; // Pro plan cost
  const savings = traditionalCost - flashttsCost;

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
            "description": "Convert manuscripts into multi-chapter AI-narrated audiobooks with a voice per chapter.",
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
              Auto-split chapters, pick a voice per chapter, and export MP3 or WAV.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-10 py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[17px] items-center justify-center flex gap-2 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#E8522A]/25"
              >
                Create Your Audiobook Free <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Badges */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center items-center gap-6 text-[13px] font-bold text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#E8522A]" /> Auto Chapter Detection
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#E8522A]" /> Commercial Rights on Paid Plans
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#E8522A]" /> Voice per Chapter
              </span>
            </motion.div>

          </motion.div>
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
              No recording booth and no studio booking.
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
                Chapter Export
              </h3>
              <p className="text-slate-600 text-[14px] leading-relaxed">
                Export chapter by chapter as MP3 or WAV. Check your store&apos;s technical requirements before uploading.
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
          <FaqList faqs={AUDIOBOOK_FAQS} />
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
              Turn your manuscript into chapter audio with the voice you choose.  
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

