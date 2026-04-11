'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Check } from 'lucide-react';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-[#080810]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="container max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-['Syne'] font-extrabold tracking-tight">
          <span className="text-2xl">⚡</span> FlashTTS
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'How it Works', 'Blog'].map((item) => (
            <Link 
              key={item} 
              href={item === 'Blog' ? '/blog' : `#${item.toLowerCase().replace(/ /g, '-')}`} 
              className="text-sm font-medium text-[#7a7a9a] hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-[#7a7a9a] hover:text-white transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 bg-[#f5c518] text-[#080810] rounded-xl font-bold text-sm hover:scale-105 transition-transform">
            Get Started Free
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#080810] border-b border-white/5 p-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-6">
            {['Features', 'Pricing', 'How it Works', 'Blog'].map((item) => (
              <Link 
                key={item} 
                href={item === 'Blog' ? '/blog' : `#${item.toLowerCase().replace(/ /g, '-')}`} 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-[#7a7a9a]"
              >
                {item}
              </Link>
            ))}
            <hr className="border-white/5" />
            <Link href="/login" className="text-lg font-medium text-[#7a7a9a]">Sign In</Link>
            <Link href="/signup" className="w-full py-4 bg-[#f5c518] text-[#080810] rounded-xl font-bold text-center">
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

function PricingCard({ name, priceMonthly, priceYearly, features, buttonText, isYearly, popular = false }: any) {
  const price = isYearly ? priceYearly : priceMonthly;
  return (
    <div className={`relative p-8 rounded-3xl transition-all duration-300 flex flex-col h-full ${popular ? 'bg-[#f5c518]/5 border-2 border-[#f5c518] scale-105 z-10' : 'bg-white/5 border border-white/10'}`}>
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#f5c518] text-black text-[10px] uppercase font-black tracking-widest rounded-full">
          Most Popular
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-[#7a7a9a] mb-2">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black font-['Syne']">${price}</span>
          <span className="text-[#4a4a6a]">/mo</span>
        </div>
      </div>
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-xs text-[#a0a0c0] text-left">
            <Check className="w-4 h-4 text-[#f5c518] mt-px flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link href="/signup" className={`block w-full text-center py-4 rounded-xl font-bold text-sm transition-all ${popular ? 'bg-[#f5c518] text-black hover:opacity-90' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
        {buttonText}
      </Link>
    </div>
  );
}

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    { name: "Free", priceMonthly: "0", priceYearly: "0", features: ['10,000 chars/month', '1,000 chars/day cap', 'Unlimited voices', '1 Voice Clone', 'Standard quality'], buttonText: "Get Started Free" },
    { name: "Starter", priceMonthly: "15", priceYearly: "12", features: ['200,000 chars/month', 'Unlimited voices', '5 Voice Clones', 'No watermark', 'Email support'], buttonText: "Get Started" },
    { name: "Creator", priceMonthly: "29", priceYearly: "24", popular: true, features: ['600,000 chars/month', 'Unlimited voices', '10 Voice Clones', 'Priority queue', 'API access', 'Priority support'], buttonText: "Get Started" },
    { name: "Pro", priceMonthly: "49", priceYearly: "39", features: ['1,000,000 chars/month', 'Unlimited voices', '20 Voice Clones', 'Everything in Creator', 'Advanced API'], buttonText: "Get Started" },
    { name: "Agency", priceMonthly: "79", priceYearly: "64", features: ['3,000,000 chars/month', 'Unlimited voices', '30 Voice Clones', 'Commercial license', 'Team access', 'Dedicated support'], buttonText: "Contact Sales" }
  ];

  return (
    <>
      <div className="flex items-center justify-center gap-4 mt-8 mb-16">
        <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-[#7a7a9a]'}`}>Monthly</span>
        <button 
          onClick={() => setIsYearly(!isYearly)}
          className="w-14 h-7 bg-white/10 rounded-full p-1 relative transition-colors"
        >
          <div className={`w-5 h-5 bg-[#f5c518] rounded-full transition-transform duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`} />
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-[#7a7a9a]'}`}>Yearly</span>
          <span className="px-2 py-0.5 bg-[#f5c518]/10 text-[#f5c518] text-[10px] font-bold rounded-md uppercase">Save 20%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
        {plans.map((plan, i) => (
          <PricingCard key={i} {...plan} isYearly={isYearly} />
        ))}
      </div>
    </>
  );
};

export const FAQAccordion = () => {
  const faqs = [
    { q: "Is FlashTTS free to start?", a: "Yes! Our Free plan includes 10,000 characters per month. No credit card is needed to sign up." },
    { q: "How many languages are supported?", a: "We support 19 major languages including Arabic, English, Hindi, Spanish, French, German, and more." },
    { q: "Can I clone my own voice?", a: "Absolutely! Even on the Free plan, you can create 1 voice clone by providing just 30 seconds of audio." },
    { q: "What audio formats can I download?", a: "You can download your generated audio in high-quality MP3 and WAV formats on all plans." },
    { q: "Is there an API available?", a: "Yes, API access is available starting from our Creator ($29/mo) plan and upwards." },
    { q: "Do I get a commercial license?", a: "Commercial usage rights are included in our Agency plan ($79/mo) for professional teams." }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4 text-left">
      {faqs.map((faq, i) => (
        <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all">
          <button 
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
          >
            <span className="font-bold text-lg">{faq.q}</span>
            <ChevronDown className={`w-5 h-5 text-[#7a7a9a] transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
          </button>
          <div 
            className="transition-all duration-300 ease-in-out overflow-hidden"
            style={{ maxHeight: openIndex === i ? '200px' : '0', opacity: openIndex === i ? 1 : 0, paddingBottom: openIndex === i ? '24px' : '0' }}
          >
            <div className="px-6">
              <p className="text-[#7a7a9a] leading-relaxed">{faq.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
