'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Text to Speech', href: '/text-to-speech' },
  { label: 'Voice Cloning', href: '/voice-cloning' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false; // Anchor links don't show active color by default unless matched exactly
    return pathname === href;
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'h-[64px] bg-[#F0EDE8]/85 backdrop-blur-xl border-b border-black/5 shadow-sm'
          : 'h-[64px] bg-transparent'
      } flex items-center`}
    >
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#E8522A] flex items-center justify-center text-white font-extrabold text-[16px] shadow-lg shadow-[#E8522A]/20 transition-transform group-hover:scale-105">
            F
          </div>
          <span className="font-['Syne'] font-[800] text-[20px] text-slate-900 tracking-tight">
            FlashTTS
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-[14px] font-bold transition-colors hover:text-[#E8522A] ${
                isActive(link.href) ? 'text-[#E8522A]' : 'text-slate-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-5 py-2 text-[14px] font-bold text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 rounded-xl hover:border-slate-300"
          >
            Log in
          </Link>
          <Link 
            href="/signup" 
            className="px-5 py-2 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-bold text-[14px] flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-[#E8522A]/20"
          >
            Start Free <ArrowRight size={14} />
          </Link>
        </div>

        {/* MOBILE HAMBURGER */}
        <button 
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 z-[60]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <motion.span 
            animate={isMenuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
            className="w-6 h-0.5 bg-slate-900 block rounded-full"
          />
          <motion.span 
            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-6 h-0.5 bg-slate-900 block rounded-full"
          />
          <motion.span 
            animate={isMenuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
            className="w-6 h-0.5 bg-slate-900 block rounded-full"
          />
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 top-0 bg-[#F0EDE8] z-[55] pt-[80px] px-6 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="py-4 text-[20px] font-bold text-slate-900 border-b border-black/5 flex items-center justify-between group"
                >
                  <span className={isActive(link.href) ? 'text-[#E8522A]' : ''}>{link.label}</span>
                  <ArrowRight size={20} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-[#E8522A]" />
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <Link 
                href="/login" 
                className="w-full py-4 rounded-2xl border-2 border-slate-200 text-center font-bold text-slate-900 text-[16px] hover:bg-white transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="w-full py-4 rounded-2xl bg-[#E8522A] text-white text-center font-bold text-[16px] flex items-center justify-center gap-2 shadow-xl shadow-[#E8522A]/20"
              >
                Start Free <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
