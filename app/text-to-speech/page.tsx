'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RefreshCw, Zap, CheckCircle2, ChevronDown, Wand2, Globe2, Mic2
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// ── Framer Motion Variants ──
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const FAQS = [
  { q: 'Is this Text to Speech generator really free to use?', a: 'Yes! You can generate audio using our unauthenticated demo above absolutely free. For unlimited generations and full commercial rights, you can sign up for our platform seamlessly.' },
  { q: 'How many languages does the TTS support?', a: 'FlashTTS natively embeds over 29+ languages and 100+ unique accents globally. From US English to native Japanese, the pacing and dialect are absolutely perfect.' },
  { q: 'Can I export the generated speech into an MP3?', a: 'Absolutely. All generations output dynamically into highest-fidelity 320kbps MP3 format natively supported and instantly downloadable down to your mobile or desktop device.' },
  { q: 'Is there a character limit on generated voiceovers?', a: 'Guest users are limited to 250 characters per demo generation. Logged-in premium users can generate scripts running all the way out to 3,000,000 characters without crashing.' }
];

export default function TextToSpeechPage() {
  // ── Hero Demo State ──
  const [demoText, setDemoText] = useState("FlashTTS is the fastest text to speech engine on the internet. Instantly generate ultra-realistic audio bytes natively in your browser.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [demoAudio, setDemoAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleGenerateGuest = async () => {
    if (!demoText.trim()) return;
    setIsGenerating(true);
    setDemoAudio(null);
    if(audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: demoText, guest: true, language: 'en' }),
      });
      if (response.ok) {
        const blob = await response.blob();
        setDemoAudio(URL.createObjectURL(blob));
      } else {
        alert("Demo generation failed. Rate limits may apply to guests.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if(!demoAudio) return;
    if(!audioRef.current) {
       audioRef.current = new Audio(demoAudio);
       audioRef.current.onended = () => setIsPlaying(false);
    }
    if(isPlaying) {
      audioRef.current.pause(); setIsPlaying(false);
    } else {
      audioRef.current.play(); setIsPlaying(true);
    }
  };

  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans overflow-hidden text-slate-800 selection:bg-[#E8522A]/20">
      <Navbar />

      {/* ── 1. HERO FOLD & DEMO INTERSECTION ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 border-b border-[#e2dfdb]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E8522A]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[12px] uppercase tracking-widest mb-8">
              <Zap size={14} fill="currentColor" /> Ultra-Realistic Voices
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-['Syne'] font-extrabold text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.05] tracking-tight max-w-[900px] mb-6 text-slate-900">
              Free AI <span className="text-[#E8522A] relative">
                Text to Speech
                <svg className="absolute w-full h-[12px] -bottom-1 left-0 text-[#E8522A]/30" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 10 Q50 20 100 10" stroke="currentColor" strokeWidth="8" fill="none"/></svg>
              </span> Generator Online.
            </motion.h1>

             <motion.p variants={fadeUp} className="text-[17px] sm:text-[20px] text-slate-600 max-w-[650px] mb-10 leading-relaxed">
              Instantly turn raw text into natural, emotional studio-grade audio natively directly inside your browser. No robotic voices allowed.
            </motion.p>
          </motion.div>
        </div>

        {/* DEMO ENGINE */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="max-w-[800px] mx-auto mt-16 relative z-20">
           <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-xl border border-[#e2dfdb] ring-1 ring-black/5">
              
              <div className="flex justify-between items-center mb-4">
                 <div className="font-[Syne] font-bold text-[14px] text-slate-900 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-[#E8522A] animate-pulse"></span> Free TTS Guest Demo
                 </div>
                 <span className="text-slate-400 font-bold text-[12px]">{demoText.length} / 250 characters</span>
              </div>

              <textarea 
                value={demoText}
                onChange={e => setDemoText(e.target.value.slice(0, 250))}
                className="w-full h-[140px] bg-slate-50 border-2 border-[#e2dfdb] focus:border-[#E8522A] rounded-xl p-4 text-[16px] text-slate-700 resize-none outline-none transition-colors"
                placeholder="Type your script here to synthesize voice..."
              />

              <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                 {demoAudio ? (
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-4 w-full">
                       <button onClick={togglePlay} className="w-12 h-12 bg-[#10B981] hover:bg-[#059669] rounded-full flex items-center justify-center text-white shrink-0 transition-transform shadow-sm">
                         {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                       </button>
                       <div className="flex-1 text-[14px] font-bold text-green-800">
                         Generation Complete. Play your audio natively.
                       </div>
                    </div>
                 ) : (
                    <div className="flex-1 text-[13px] text-slate-500 font-medium">
                      Press generate to compile your text over to ultra-high fidelity speech processing.
                    </div>
                 )}

                 <button 
                   onClick={handleGenerateGuest} 
                   disabled={isGenerating || demoText.length < 5}
                   className="w-full sm:w-auto px-8 py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[16px] shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                 >
                   {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                   {isGenerating ? 'Synthesizing...' : 'Generate Demo Audio'}
                 </button>
              </div>

           </div>
           
           <p className="text-center mt-6 text-[14px] text-slate-500 font-medium">
             Need absolute unlimited lengths + file export? <Link href="/signup" className="text-[#E8522A] font-bold hover:underline">Create a free account.</Link>
           </p>
        </motion.div>
      </section>

      {/* ── 2. SEO BENEFITS ── */}
      <section className="py-24 px-4 bg-white">
         <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
               <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[40px] text-slate-900 tracking-tight">Why leverage FlashTTS?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { icon: <Wand2 size={24}/>, title: "Uncanny Human Realism", desc: "Our neural network models accurately deploy localized breath pacing and micro-expressions seamlessly into dialogue." },
                  { icon: <Globe2 size={24}/>, title: "29+ Global Languages", desc: "Export perfect audio synthetics across English, Spanish, Japanese, German, and French completely instantly without translating constraints." },
                  { icon: <Mic2 size={24}/>, title: "100% Zero Royalties", desc: "Audio generated utilizing FlashTTS is entirely owned exactly by you. Post across YouTube, TikTok, or Enterprise deployments automatically." }
               ].map((b, i) => (
                  <div key={i} className="bg-[#F0EDE8] p-8 rounded-[24px] border border-[#e2dfdb]">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#E8522A] shadow-sm mb-6">
                        {b.icon}
                     </div>
                     <h3 className="font-['Syne'] font-bold text-[20px] text-slate-900 mb-3">{b.title}</h3>
                     <p className="text-slate-600 text-[15px] leading-relaxed">{b.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── 3. FAQ ── */}
      <section className="py-24 bg-[#F0EDE8] px-4 max-w-[800px] mx-auto border-y border-[#e2dfdb]">
         <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[40px] text-slate-900 tracking-tight text-center mb-12">TTS Frequently Asked Questions</h2>
         <div className="flex flex-col gap-4">
            {FAQS.map((faq, idx) => {
               const isOpen = activeFaq === idx;
               return (
                 <div key={idx} className={`border ${isOpen ? 'border-[#E8522A] bg-white' : 'border-[#e2dfdb] bg-white'} rounded-[20px] overflow-hidden transition-colors shadow-sm`}>
                    <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                       <span className="font-['Syne'] font-bold text-[16px] sm:text-[18px] text-slate-900 pr-8">{faq.q}</span>
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
               )
            })}
         </div>
      </section>

      {/* ── 4. CTA ── */}
      <section className="py-24 px-4 bg-white text-center">
         <div className="max-w-[800px] mx-auto">
            <h2 className="font-['Syne'] font-extrabold text-[40px] text-slate-900 mb-6 tracking-tight">Convert Text into Speech entirely free.</h2>
            <p className="text-[18px] text-slate-600 mb-10">Stop navigating complex dashboards. FlashTTS was built entirely for scale.</p>
            <Link href="/signup" className="inline-flex py-4 px-10 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[18px] items-center justify-center transition-transform hover:-translate-y-1 shadow-xl">
               Start Generating Free Now
            </Link>
         </div>
      </section>

      <Footer />
    </div>
  );
}
