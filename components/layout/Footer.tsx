'use client';

import Link from 'next/link';
import { Twitter, Youtube, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F0EDE8] pt-16 border-t border-black/5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 pb-16">
          
          {/* COLUMN 1: BRAND */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 group mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#E8522A] flex items-center justify-center text-white font-extrabold text-[16px] shadow-lg shadow-[#E8522A]/20 transition-transform group-hover:scale-105">
                F
              </div>
              <span className="font-['Syne'] font-[800] text-[20px] text-slate-900 tracking-tight">
                FlashTTS
              </span>
            </Link>
            <p className="text-[14px] text-slate-500 leading-relaxed max-w-[320px] mb-8">
              Stop paying for voice actors. Generate studio-quality audio in seconds. Built for creators who publish daily.
            </p>
            
            {/* SOCIAL ICONS */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter, href: 'https://x.com/flashtts' },
                { Icon: Youtube, href: 'https://youtube.com/@flashtts' },
                { Icon: Linkedin, href: 'https://linkedin.com/company/flashtts' },
                { Icon: Facebook, href: 'https://facebook.com/flashtts' },
              ].map(({ Icon, href }, i) => (
                <Link 
                  key={i} 
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-all duration-200 hover:bg-[#E8522A] hover:text-white"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* COLUMN 2: PRODUCT */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-6">Product</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/text-to-speech" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Text to Speech</Link></li>
              <li><Link href="/voice-cloning" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Voice Cloning</Link></li>
              <li><Link href="/audiobook" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Audiobooks</Link></li>
              <li><Link href="/pricing" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Blog</Link></li>
              <li><Link href="/tools" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Tools</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: LEGAL */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-6">Legal</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/privacy" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Refund Policy</Link></li>
              <li><Link href="/voice-cloning-policy" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Voice Cloning Policy</Link></li>
              <li><Link href="/contact" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">Contact</Link></li>
              <li><Link href="/about" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">About</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: COMPARE */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-6">Compare</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/vs/elevenlabs" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">FlashTTS vs ElevenLabs</Link></li>
              <li><Link href="/vs/murf" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">FlashTTS vs Murf AI</Link></li>
              <li><Link href="/vs/speechify" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">FlashTTS vs Speechify</Link></li>
              <li><Link href="/vs/lovo" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">FlashTTS vs LOVO AI</Link></li>
              <li><Link href="/vs/wellsaid" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">FlashTTS vs WellSaid Labs</Link></li>
              <li><Link href="/vs/naturalreader" className="text-[14px] text-slate-600 hover:text-[#E8522A] transition-colors">FlashTTS vs NaturalReader</Link></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="py-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[13px] text-slate-400 font-medium">
            © 2025 FlashTTS. All rights reserved.
          </p>
          <p className="text-[13px] text-slate-400 font-medium italic">
            Made for creators who never stop publishing.
          </p>
        </div>
      </div>
    </footer>
  );
}
