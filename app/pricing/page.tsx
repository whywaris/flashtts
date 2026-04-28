'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Crown, Star, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/utils/supabase/client';
import { PLANS, type PlanConfig, type PlanId } from '@/lib/plans';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function getPlanFeatures(plan: PlanConfig): string[] {
  return [
    `${plan.chars} chars/month`,
    `${plan.charsPerGen} chars/generation`,
    `${plan.voiceClones} voice clone${plan.voiceClones === '1' ? '' : 's'}`,
    plan.voiceLibrary,
    plan.formats,
    plan.speed,
    plan.history,
    plan.emotionControl,
    plan.languages,
    plan.support,
  ];
}

function getSavingsPercent(plan: PlanConfig): number {
  if (plan.isFree || plan.priceMonthly === 0) return 0;
  const monthlyAnnual = plan.priceMonthly * 12;
  return Math.round(((monthlyAnnual - plan.yearlyTotal) / monthlyAnnual) * 100);
}

const PLAN_ICONS: Record<PlanId, React.ReactNode> = {
  free: <Star size={20} />,
  starter: <Zap size={20} />,
  creator: <Crown size={20} />,
  pro: <Sparkles size={20} />,
  studio: <span style={{ fontSize: 20 }}>🎙️</span>,
};

const PLAN_COLORS: Record<PlanId, string> = {
  free: '#64748b',
  starter: '#3b82f6',
  creator: '#E8522A',
  pro: '#8b5cf6',
  studio: '#f59e0b',
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.id);
        setUserEmail(user.email || null);
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile?.plan) setUserPlan(profile.plan);
      }
    }
    fetchUser();
  }, [supabase]);

  const handleCheckout = async (plan: PlanConfig) => {
    if (plan.isFree) {
      router.push('/signup');
      return;
    }

    if (!isLoggedIn) {
      router.push('/signup');
      return;
    }

    // Logged in → send to billing page for checkout
    router.push('/dashboard/billing');
    return;

    const variantId = billingCycle === 'yearly' ? plan.variantYearly : plan.variantMonthly;
    if (!variantId) return;

    setLoadingPlan(plan.id);
    try {
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, userId, userEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonText = (plan: PlanConfig) => {
    if (plan.isFree) return isLoggedIn ? 'Current Plan' : 'Get Started Free';
    if (isLoggedIn && userPlan === plan.id) return 'Current Plan';
    if (isLoggedIn && userPlan && userPlan !== 'free') return 'Manage Subscription';
    if (loadingPlan === plan.id) return 'Redirecting...';
    return 'Get Started';
  };

  const isCurrentPlan = (plan: PlanConfig) => {
    if (plan.isFree && (!userPlan || userPlan === 'free') && isLoggedIn) return true;
    return isLoggedIn && userPlan === plan.id;
  };

  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans text-slate-800 selection:bg-[#E8522A]/20">
      <title>Pricing & Plans | FlashTTS</title>
      <Navbar />

      {/* HERO */}
      <section className="pt-28 pb-8 px-4 text-center">
        <div className="max-w-[800px] mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[11px] uppercase tracking-widest mb-6">
              ⚡ 10x More Credits Than ElevenLabs
            </div>
            <h1 className="font-['Syne'] font-extrabold text-[40px] sm:text-[56px] leading-[1.05] tracking-tight text-slate-900 mb-5">
              Simple, <span className="text-[#E8522A]">Scale-Ready</span> Pricing.
            </h1>
            <p className="text-[17px] sm:text-[19px] text-slate-500 max-w-[550px] mx-auto leading-relaxed mb-8">
              Start free — upgrade when you're ready. Every plan includes commercial rights and zero watermarks.
            </p>
          </motion.div>

          {/* Toggle */}
          <div className="inline-flex bg-slate-200 border border-slate-300 rounded-[14px] p-1.5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-7 py-2.5 rounded-[10px] text-[15px] font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-7 py-2.5 rounded-[10px] text-[15px] font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-[#E8522A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Yearly
              <span className={`px-2 py-0.5 rounded-full text-[10px] tracking-widest uppercase font-extrabold ${billingCycle === 'yearly' ? 'bg-white/20' : 'bg-[#E8522A]/10 text-[#E8522A]'}`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* PLANS GRID */}
      <section className="px-4 pb-24 pt-10">
        <div className="max-w-[1300px] mx-auto">
          <div className="overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
          <div className="flex lg:grid lg:grid-cols-5 gap-4 lg:gap-5 pt-5 items-stretch">
            {PLANS.map((plan, i) => {
              const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
              const features = getPlanFeatures(plan);
              const savings = getSavingsPercent(plan);
              const isCurrent = isCurrentPlan(plan);
              const color = PLAN_COLORS[plan.id];

              return (
                <motion.div
                  key={plan.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } } }}
                  className={`bg-white rounded-[24px] border-2 flex flex-col shrink-0 lg:shrink relative overflow-visible transition-all duration-300 hover:-translate-y-1 ${
                    plan.isPopular
                      ? 'border-[#E8522A] shadow-xl shadow-[#E8522A]/10'
                      : isCurrent
                      ? 'border-blue-400 shadow-lg'
                      : 'border-[#e2dfdb] hover:border-slate-300 shadow-sm hover:shadow-md'
                  }`}
                  style={{ padding: '24px 20px', minWidth: '240px' }}
                >
                  {/* Badges */}
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E8522A] text-white px-5 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase shadow-lg whitespace-nowrap z-10">
                      Most Popular
                    </div>
                  )}
                  {isCurrent && !plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-5 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase shadow-lg whitespace-nowrap z-10">
                      Current Plan
                    </div>
                  )}
                  {isCurrent && plan.isPopular && (
                    <div className="absolute -top-3.5 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-lg z-10">
                      Current
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                      style={{ background: color }}
                    >
                      {PLAN_ICONS[plan.id]}
                    </div>
                    <h3 className="font-['Syne'] font-bold text-[20px] text-slate-900">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-['Syne'] font-extrabold text-[40px] text-slate-900 leading-none">
                      ${price}
                    </span>
                    {billingCycle === 'yearly' && !plan.isFree && (
                      <span className="text-[15px] text-slate-400 line-through font-bold">${plan.priceMonthly}</span>
                    )}
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium mb-1">
                    {plan.isFree ? 'forever' : `per month${billingCycle === 'yearly' ? ', billed annually' : ''}`}
                  </p>
                  {billingCycle === 'yearly' && !plan.isFree && savings > 0 && (
                    <div className="inline-flex self-start items-center gap-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 mb-3">
                      Save {savings}% · ${plan.yearlyTotal}/year
                    </div>
                  )}
                  {(plan.isFree || billingCycle === 'monthly') && <div className="mb-3" />}

                  {/* Chars highlight */}
                  <div className="py-3 px-3 rounded-xl mb-4" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                    <span className="text-[14px] font-bold" style={{ color }}>{plan.chars} chars/month</span>
                  </div>

                  {/* Features */}
                  <ul className="flex-1 flex flex-col gap-2.5 mb-6">
                    {features.slice(1).map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-snug">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: j < 3 ? color : '#94a3b8' }} />
                        {f}
                      </li>
                    ))}
                    {plan.commercialUse && (
                      <li className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-snug">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-500" />
                        Commercial use ✅
                      </li>
                    )}
                    {plan.noWatermark && (
                      <li className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-snug">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-500" />
                        No watermark ✅
                      </li>
                    )}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={isCurrent || loadingPlan === plan.id}
                    className={`w-full py-3.5 rounded-xl font-['Syne'] font-bold text-[15px] transition-all duration-200 flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : plan.isPopular
                        ? 'bg-[#E8522A] text-white shadow-lg shadow-[#E8522A]/20 hover:bg-[#d64119] hover:-translate-y-0.5'
                        : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5'
                    }`}
                  >
                    {getButtonText(plan)}
                    {!isCurrent && loadingPlan !== plan.id && <ArrowRight size={15} />}
                  </button>
                </motion.div>
              );
            })}
          </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="pb-20 px-4">
        <div className="max-w-[900px] mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: '🔒', text: 'Secure payments via LemonSqueezy' },
              { icon: '💳', text: 'Cancel anytime, no lock-in' },
              { icon: '⚡', text: 'Instant access after payment' },
              { icon: '🎯', text: '7-day money-back guarantee' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2.5 px-5 py-3 bg-white border border-[#e2dfdb] rounded-2xl text-[13px] text-slate-600 font-medium shadow-sm">
                <span className="text-[18px]">{badge.icon}</span>
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="pb-24 px-4">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[40px] text-slate-900 text-center mb-4 tracking-tight">
            Compare All Plans
          </h2>
          <p className="text-slate-500 text-center mb-12 text-[16px]">
            Every plan includes commercial rights, emotion control, and all 23 languages.
          </p>

          <div className="overflow-x-auto rounded-[20px] border border-[#e2dfdb] bg-white shadow-sm">
            <table className="w-full min-w-[800px]" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="border-b border-[#e2dfdb]">
                  <th className="text-left py-5 px-6 text-[12px] font-bold uppercase tracking-widest text-slate-400">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} className={`py-5 px-4 text-center text-[12px] font-bold uppercase tracking-widest ${p.isPopular ? 'text-[#E8522A] bg-[#E8522A]/5' : 'text-slate-500'}`}>
                      {p.name}
                      {p.isPopular && <span className="block text-[9px] mt-1">⭐ POPULAR</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Monthly Characters', key: 'chars' },
                  { label: 'Chars Per Generation', key: 'charsPerGen' },
                  { label: 'Voice Clones', key: 'voiceClones' },
                  { label: 'Voice Library', key: 'voiceLibrary' },
                  { label: 'Generation Speed', key: 'speed' },
                  { label: 'History', key: 'history' },
                  { label: 'Support', key: 'support' },
                ].map((row, idx) => (
                  <tr key={row.key} className={idx % 2 === 0 ? 'bg-slate-50/50' : ''}>
                    <td className="py-4 px-6 text-[14px] font-semibold text-slate-700 border-b border-[#f0ede8]">{row.label}</td>
                    {PLANS.map(p => (
                      <td
                        key={p.id}
                        className={`py-4 px-4 text-center text-[13px] border-b border-[#f0ede8] ${
                          p.isPopular ? 'bg-[#E8522A]/5 font-semibold text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        {(p as any)[row.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="py-4 px-6 text-[14px] font-semibold text-slate-700">Commercial Use</td>
                  {PLANS.map(p => (
                    <td key={p.id} className={`py-4 px-4 text-center text-[16px] ${p.isPopular ? 'bg-[#E8522A]/5' : ''}`}>✅</td>
                  ))}
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-4 px-6 text-[14px] font-semibold text-slate-700">No Watermark</td>
                  {PLANS.map(p => (
                    <td key={p.id} className={`py-4 px-4 text-center text-[16px] ${p.isPopular ? 'bg-[#E8522A]/5' : ''}`}>✅</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="relative rounded-[32px] overflow-hidden text-center"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
              padding: '60px 24px',
            }}
          >
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 300, height: 300, background: 'rgba(232,82,42,0.15)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[44px] text-white mb-4 tracking-tight relative z-10">
              Start Creating <span style={{ color: '#E8522A' }}>Today.</span>
            </h2>
            <p className="text-white/50 text-[16px] mb-8 max-w-[400px] mx-auto relative z-10">
              No credit card required. 10,000 free characters every month.
            </p>
            <Link
              href="/signup"
              className="relative z-10 inline-flex items-center gap-2 px-10 py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[17px] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#E8522A]/30"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
