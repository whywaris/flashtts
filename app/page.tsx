'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RefreshCw, Shield, Clock, Coins, Star,
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

// ── Languages ──
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', text: "In a world where every second counts, your voice is your greatest asset. Generate studio-quality audio in seconds. No waiting, no retakes, no expensive voice actors." },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦', text: "في عالم يتسارع فيه الزمن، صوتك هو أقوى أداة لديك. أنشئ تسجيلات صوتية احترافية في ثوانٍ. بلا انتظار، بلا إعادة تسجيل، بلا تكاليف باهظة." },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', text: "एक ऐसी दुनिया में जहाँ हर पल मायने रखता है, आपकी आवाज़ आपकी सबसे बड़ी ताकत है। सेकंडों में स्टूडियो-क्वालिटी ऑडियो बनाएं. बिना इंतजार, बिना रीटेक." },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', text: "En un mundo donde cada segundo importa, tu voz es tu mayor activo. Genera audio de calidad profesional en segundos. Sin esperas, sin repeticiones, sin actores costosos." },
  { code: 'fr', label: 'French', flag: '🇫🇷', text: "Dans un monde où chaque seconde compte, votre voix est votre meilleur atout. Créez des voix professionnelles en quelques secondes. Sans attente, sans prise multiple." },
  { code: 'de', label: 'German', flag: '🇩🇪', text: "In einer Welt, in der jede Sekunde zählt, ist deine Stimme dein stärkstes Werkzeug. Erstelle professionelle Audioaufnahmen in Sekunden. Ohne Wartezeit, ohne Wiederholungen." },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵', text: "すべての瞬間が大切な世界で、あなたの声は最大の武器です。待ち時間なし、撮り直しなし。数秒でスタジオ品質の音声を生成しましょう。" },
  { code: 'ko', label: 'Korean', flag: '🇰🇷', text: "매 순간이 중요한 세상에서, 당신의 목소리는 가장 강력한 도구입니다. 기다림 없이, 재녹음 없이. 몇 초 만에 스튜디오 품질의 오디오를 만들어보세요." },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷', text: "Num mundo onde cada segundo importa, sua voz é o seu maior ativo. Gere áudio de qualidade profissional em segundos. Sem esperas, sem regravações, sem custos elevados." },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷', text: "Her saniyenin önemli olduğu bir dünyada sesiniz en büyük varlığınızdır. Saniyeler içinde profesyonel kalitede ses oluşturun. Bekleme yok, tekrar kayıt yok." },
  { code: 'it', label: 'Italian', flag: '🇮🇹', text: "In un mondo dove ogni secondo conta, la tua voce è il tuo patrimonio più grande. Genera audio di qualità professionale in pochi secondi. Senza attese, senza ripetizioni." },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱', text: "In een wereld waar elke seconde telt, is jouw stem je grootste troef. Genereer professionele audiokwaliteit in seconden. Geen wachttijd, geen herhalingen, geen dure stemacteurs." },
  { code: 'pl', label: 'Polish', flag: '🇵🇱', text: "W świecie, gdzie każda sekunda ma znaczenie, Twój głos jest Twoim największym atutem. Twórz profesjonalne nagrania w kilka sekund. Bez czekania, bez powtórek." },
  { code: 'ru', label: 'Russian', flag: '🇷🇺', text: "В мире, где каждая секунда на счету, ваш голос — ваш главный инструмент. Создавайте профессиональные аудиозаписи за секунды. Без ожидания и повторных записей." },
  { code: 'sv', label: 'Swedish', flag: '🇸🇪', text: "I en värld där varje sekund räknas är din röst ditt starkaste verktyg. Skapa professionellt ljud på sekunder. Ingen väntetid, inga omtagningar, inga dyra röstskådespelare." },
  { code: 'no', label: 'Norwegian', flag: '🇳🇴', text: "I en verden der hvert sekund teller, er stemmen din ditt sterkeste verktøy. Lag profesjonell lydkvalitet på sekunder. Ingen ventetid, ingen omtakinger." },
  { code: 'fi', label: 'Finnish', flag: '🇫🇮', text: "Maailmassa, jossa jokainen sekunti on tärkeä, äänesi on tärkein työkalusi. Luo ammattilaistason ääntä sekunneissa. Ei odottelua, ei uusintoja, ei kalliita näyttelijöitä." },
  { code: 'da', label: 'Danish', flag: '🇩🇰', text: "I en verden, hvor hvert sekund tæller, er din stemme dit stærkeste redskab. Skab professionel lydkvalitet på få sekunder. Ingen ventetid, ingen omtagninger." },
  { code: 'el', label: 'Greek', flag: '🇬🇷', text: "Σε έναν κόσμο όπου κάθε δευτερόλεπτο μετράει, η φωνή σας είναι το πιο ισχυρό εργαλείο σας. Δημιουργήστε επαγγελματικό ήχο σε δευτερόλεπτα. Χωρίς αναμονή." },
  { code: 'ms', label: 'Malay', flag: '🇲🇾', text: "Dalam dunia di mana setiap saat penting, suara anda adalah aset terbesar anda. Jana audio berkualiti studio dalam beberapa saat. Tanpa penantian, tanpa rakaman semula." },
];

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

// ── Pricing Plans ──
const EXTRACTED_PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    chars: '10,000 chars',
    features: [
      "Max 500 chars / generation",
      "1 voice clone",
      "10–15 basic voices",
      "Standard generation speed",
      "Watermarked audio"
    ],
    isFree: true
  },
  { id: 'starter', name: 'Starter', priceMonthly: 9, priceYearly: 7, chars: '200,000 chars', features: ["Max 3K chars / generation", "2 voice clones", "20–30 standard voices", "Normal generation speed", "No watermark"] },
  { id: 'creator', name: 'Creator', priceMonthly: 19, priceYearly: 15, chars: '500,000 chars', features: ["Max 5K chars / generation", "5 voice clones", "50+ emotion voices", "Fast generation speed", "High-quality audio export"], isPopular: true },
  { id: 'pro', name: 'Pro', priceMonthly: 39, priceYearly: 31, chars: '1M chars', features: ["Max 10K chars / generation", "9 voice clones", "100+ premium voices", "Priority processing", "All export formats"] },
  { id: 'studio', name: 'Studio', priceMonthly: 79, priceYearly: 63, chars: '3M chars', features: ["Max 20K chars / generation", "15 voice clones", "Exclusive voices & API", "Team collaboration", "Commercial usage rights"] }
];

export default function HomePage() {
  // ── Demo Widget State ──
  const [selectedLang, setSelectedLang] = useState('en');
  const [curVoices, setCurVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<any | null>(null);
  const [demoText, setDemoText] = useState(LANGUAGES[0].text);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = useMemo(() => createClient(), []);

  // ── Revoke blob URL on unmount ──
  useEffect(() => {
    return () => {
      setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    };
  }, []);

  // ── Fetch Voices from DB ──
  useEffect(() => {
    async function fetchVoices() {
      setIsLoadingVoices(true);
      const { data } = await supabase
        .from('voices')
        .select('id, name, style, tags, description, sample_url')
        .eq('language', selectedLang)
        .eq('is_active', true)
        .limit(5);

      if (data && data.length > 0) {
        setCurVoices(data);
        setSelectedVoice(data[0]);
      } else {
        setCurVoices([]);
        setSelectedVoice(null);
      }
      setIsLoadingVoices(false);
    }
    fetchVoices();
  }, [selectedLang]);

  // ── Voice Change ──
  const handleVoiceChange = (voice: any) => {
    setSelectedVoice(voice);
    setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setAudioProgress(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  // ── Language Change ──
  const handleLanguageChange = (langCode: string) => {
    const lang = LANGUAGES.find(l => l.code === langCode);
    if (!lang) return;
    setIsLangDropdownOpen(false);
    setSelectedLang(langCode);
    setDemoText(lang.text);
    setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setAudioProgress(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  // ── Generate Audio ──
  const generateAudio = async (text: string) => {
    if (!text.trim()) return null;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          guest: true,
          language: selectedLang,
          voice_id: selectedVoice?.id,
          voice_url: selectedVoice?.sample_url
        }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        return url;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
    return null;
  };

  // ── Text Change ──
  const handleTextChange = (text: string) => {
    setDemoText(text.slice(0, 250));
    setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setAudioProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // ── Play / Pause ──
  const handlePlayPause = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    let currentUrl = audioUrl;
    if (!currentUrl) currentUrl = await generateAudio(demoText);
    if (!currentUrl) return;

    if (!audioRef.current || audioRef.current.src !== currentUrl) {
      audioRef.current = new Audio(currentUrl);
      audioRef.current.onended = () => { setIsPlaying(false); setAudioProgress(0); };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };
    }
    audioRef.current.play();
    setIsPlaying(true);
  };

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
                    "description": "10,000 characters per month, 1 voice clone"
                  },
                  {
                    "@type": "Offer",
                    "name": "Starter Plan",
                    "price": "9",
                    "priceCurrency": "USD",
                    "description": "200,000 characters per month, 2 voice clones"
                  },
                  {
                    "@type": "Offer",
                    "name": "Creator Plan",
                    "price": "19",
                    "priceCurrency": "USD",
                    "description": "500,000 characters per month, 5 voice clones"
                  },
                  {
                    "@type": "Offer",
                    "name": "Pro Plan",
                    "price": "39",
                    "priceCurrency": "USD",
                    "description": "1,000,000 characters per month, 9 voice clones"
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

        {/* ── DEMO WIDGET ── */}
        <motion.div id="demo" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="max-w-[1000px] mx-auto mt-20 relative z-20">
          <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white/50 backdrop-blur-xl ring-1 ring-black/5">
            <div className="flex flex-col md:flex-row min-h-[500px]">

              {/* LEFT: Voice Selector */}
              <div className="w-full md:w-[320px] bg-slate-50/50 border-r border-slate-100 p-6 flex flex-col">
                <h3 className="font-[Syne] font-bold text-[16px] text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E8522A]"></span> Choose a Voice
                </h3>

                <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[400px] pr-2">
                  {isLoadingVoices ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="w-full h-[68px] bg-slate-100 animate-pulse rounded-2xl" />
                    ))
                  ) : (
                    (curVoices ?? []).map((voice) => {
                      const isSelected = selectedVoice?.id === voice.id;
                      return (
                        <button
                          key={voice.id}
                          onClick={() => handleVoiceChange(voice)}
                          className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center gap-3 relative overflow-hidden ${isSelected ? 'border-[#E8522A] bg-white shadow-md' : 'border-transparent hover:bg-white hover:border-slate-200'
                            }`}
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-slate-200">
                            <img
                              src={voice.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${voice.name}`}
                              alt={voice.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(voice.name)}&background=random&color=fff`;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[14px] text-slate-900 truncate">{voice.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium truncate">{voice.style || voice.tags?.[0] || 'Professional'}</div>
                          </div>

                          {isPlaying && isSelected && (
                            <div className="flex items-end gap-0.5 h-4 shrink-0">
                              {[...Array(4)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ height: [4, 12, 6, 14, 4] }}
                                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                  className="w-1 bg-[#E8522A] rounded-full"
                                />
                              ))}
                            </div>
                          )}

                        </button>
                      );
                    })
                  )}
                </div>

                <Link href="/signup" className="mt-8 text-[13px] font-bold text-[#E8522A] flex items-center gap-2 hover:translate-x-1 transition-transform">
                  Explore 1,000+ Voices <ArrowRight size={14} />
                </Link>
              </div>

              {/* RIGHT: Controls */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-[Syne] font-bold text-[14px] text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E8522A] animate-pulse"></span> Try it without logging in
                  </div>
                  <span className={`font-bold text-[12px] ${demoText.length === 250 ? 'text-red-500' : demoText.length > 200 ? 'text-orange-500' : 'text-slate-400'}`}>
                    {demoText.length} / 250 characters
                  </span>
                </div>

                <div className="relative flex-1">
                  <textarea
                    value={demoText}
                    onChange={e => handleTextChange(e.target.value)}
                    className="w-full h-full min-h-[160px] bg-slate-50 border-2 border-slate-100 focus:border-[#E8522A] focus:bg-white rounded-2xl p-4 text-[16px] text-slate-700 resize-none outline-none transition-all text-left align-top"
                    placeholder="Type your script here..."
                  />
                </div>

                {/* Language + Play */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
                  {/* Language Dropdown */}
                  <div className="relative w-full sm:w-auto">
                    <button
                      onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                      className="w-full sm:w-auto px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-[14px] font-bold text-slate-700 hover:border-slate-300 transition-all"
                    >
                      <span>{LANGUAGES.find(l => l.code === selectedLang)?.flag}</span>
                      <span className="flex-1">{LANGUAGES.find(l => l.code === selectedLang)?.label}</span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isLangDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full mb-2 left-0 w-max min-w-full max-h-[240px] overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-[100]"
                        >
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code)}
                              className="w-full px-4 py-2.5 rounded-lg flex items-center gap-3 hover:bg-slate-50 transition-colors text-[14px] text-slate-700 font-medium whitespace-nowrap"
                            >
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                              {selectedLang === lang.code && <CheckCircle2 size={14} className="ml-auto text-blue-500" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Play Button */}
                  <div className="flex-1 w-full relative">
                    <button
                      onClick={handlePlayPause}
                      disabled={isGenerating || demoText.length < 5}
                      className="w-full py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[16px] shadow-lg shadow-[#E8522A]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <><RefreshCw className="animate-spin" size={18} /> Generating...</>
                      ) : isPlaying ? (
                        <><Pause size={18} fill="currentColor" /> Pause</>
                      ) : audioUrl ? (
                        <><Play size={18} fill="currentColor" /> Play Again</>
                      ) : (
                        <><Play size={18} fill="currentColor" /> Play Sample</>
                      )}
                    </button>

                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-[#E8522A]" animate={{ width: `${audioProgress}%` }} initial={{ width: 0 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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

          <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-5 gap-[12px] md:gap-6 pb-4 md:pb-0">
            {EXTRACTED_PLANS.map((plan, i) => {
              const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
              const isFree = (plan as any).isFree;

              return (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } } }} className={`bg-white rounded-[24px] border ${plan.isPopular ? 'border-[#E8522A] shadow-xl relative' : 'border-[#e2dfdb] hover:border-slate-400 shadow-sm'} transition-colors flex flex-col shrink-0 md:shrink`} style={{ padding: '20px', minWidth: '200px' }}>
                  {plan.isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8522A] text-white px-4 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase">Most Popular</div>}
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
                      <CheckCircle2 size={18} className="text-[#E8522A] shrink-0" />{plan.chars} per month
                    </li>
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 text-[14px] text-slate-600">
                        <CheckCircle2 size={18} className="text-blue-500 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className={`w-full py-3 rounded-xl flex items-center justify-center font-['Syne'] font-bold text-[16px] transition-transform hover:-translate-y-0.5 ${plan.isPopular ? 'bg-[#E8522A] text-white shadow-lg' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                    {isFree ? 'Get Started Free' : 'Start for Free'}
                  </Link>
                </motion.div>
              );
            })}
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