'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { PLANS, type PlanConfig, type PlanId } from '@/lib/plans';
import { Zap, CheckCircle2, Loader2, Crown, Star, Sparkles, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const T = {
  bg:      'var(--bg)',
  card:    'var(--card-bg)',
  surface: 'var(--surface)',
  accent:  '#2DD4BF',
  border:  'var(--border)',
  muted:   'var(--muted)',
  text:    'var(--text)',
};

interface Profile {
  id: string;
  plan?: string;
  credits_used?: number;
  credits_limit?: number;
}

const PLAN_ICONS: Record<PlanId, React.ReactNode> = {
  free:    <Star size={18} />,
  starter: <Zap size={18} />,
  creator: <Crown size={18} />,
  pro:     <Sparkles size={18} />,
  studio:  <span style={{ fontSize: 16 }}>🎙️</span>,
};

function getPlanFeatures(plan: PlanConfig): string[] {
  return [
    `${plan.charsPerGen} chars/generation`,
    `${plan.voiceClones} voice clone${plan.voiceClones === '1' ? '' : 's'}`,
    plan.voiceLibrary,
    plan.speed,
    plan.history,
    plan.emotionControl,
    plan.languages,
    plan.support,
  ];
}

function getSavingsPercent(plan: PlanConfig): number {
  if (plan.isFree || plan.priceMonthly === 0) return 0;
  return Math.round(((plan.priceMonthly * 12 - plan.yearlyTotal) / (plan.priceMonthly * 12)) * 100);
}

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  // Show portal error toasts when redirected back from /api/lemonsqueezy/portal
  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'no_subscription') {
      toast.error('No active LemonSqueezy subscription found. Please subscribe first.');
    } else if (err === 'portal') {
      toast.error('Could not open the billing portal. Please try again or contact support.');
    } else if (err === 'config') {
      toast.error('Payment configuration error. Please contact support.');
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setUserId(user.id);
        const { data } = await supabase.from('profiles').select('id, plan, credits_used, credits_limit').eq('id', user.id).single();
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [supabase]);

  const handleCheckout = async (plan: PlanConfig) => {
    if (plan.isFree) return;
    const currentPlanId = (profile?.plan || 'free').toLowerCase();
    if (currentPlanId !== 'free') {
      router.push('/api/lemonsqueezy/portal');
      return;
    }
    const variantId = billingCycle === 'yearly' ? plan.variantYearly : plan.variantMonthly;
    if (!variantId) return;
    setLoadingPlan(plan.id);
    try {
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, userId, userEmail: email }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
    } catch {
      // silent — user sees no redirect
    } finally {
      setLoadingPlan(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', padding: '80px 0', minHeight: '50vh' }}>
      <Loader2 size={32} color={T.muted} style={{ animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const currentPlanId = (profile?.plan || 'free').toLowerCase() as PlanId;
  const currentPlanName = (profile?.plan || 'Free').toUpperCase();
  const used      = profile?.credits_used  || 0;
  const limit     = profile?.credits_limit || 10_000;
  const remaining = Math.max(0, limit - used);
  const usagePct  = Math.min(100, Math.max(0, (used / limit) * 100));
  const isFree    = currentPlanId === 'free';
  const fmt = (n: number) => n.toLocaleString();

  return (
    <div style={{ width: '100%', fontFamily: 'Inter, sans-serif', paddingBottom: 40 }}>
      <Toaster position="top-right" toastOptions={{ style: { background: T.card, color: T.text, border: `1px solid ${T.border}` } }} />


      {/* Current plan card */}
      <div style={{
        background: T.card, borderRadius: 16, padding: 28, marginBottom: 32,
        border: `1px solid ${T.border}`,
        boxShadow: `0 0 0 1px rgba(45,212,191,0.15), 0 8px 32px rgba(45,212,191,0.06)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Teal glow accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`, opacity: 0.6 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ flex: '1 1 280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ background: `rgba(45,212,191,0.12)`, color: T.accent, padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
                CURRENT PLAN
              </span>
              <span style={{ color: T.muted, fontSize: 13 }}>
                {isFree ? 'No renewal' : 'Renews automatically'}
              </span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 20px', color: T.text }}>{currentPlanName}</h2>

            <div style={{ maxWidth: 380 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: T.text, fontWeight: 500 }}>Monthly Allowance</span>
                <span style={{ color: T.muted }}>{fmt(used)} / {fmt(limit)} chars</span>
              </div>
              <div style={{ height: 6, background: T.border, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${usagePct}%`, background: usagePct >= 80 ? '#ef4444' : T.accent, borderRadius: 4, transition: 'width 0.4s' }} />
              </div>
              {usagePct >= 80 && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8, fontWeight: 500 }}>
                  80%+ used — upgrade to avoid interruption
                </p>
              )}
            </div>
          </div>

          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
            {/* Billing cycle toggle */}
            <div style={{ display: 'inline-flex', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 4 }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{ padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: billingCycle === 'monthly' ? T.card : 'transparent', color: billingCycle === 'monthly' ? T.text : T.muted }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: billingCycle === 'yearly' ? `rgba(45,212,191,0.12)` : 'transparent', color: billingCycle === 'yearly' ? T.accent : T.muted }}
              >
                Yearly <span style={{ background: T.accent, color: '#0A0A0F', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 800 }}>-20%</span>
              </button>
            </div>

            {!isFree && (
              <button
                onClick={() => router.push('/api/lemonsqueezy/portal')}
                style={{ padding: '10px 20px', background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                className="manage-btn"
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage insights */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: T.text }}>Usage Insights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(45,212,191,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={20} color={T.accent} />
            </div>
            <div>
              <p style={{ color: T.muted, fontSize: 12, fontWeight: 500, margin: '0 0 4px' }}>Characters Used</p>
              <h4 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.text }}>{fmt(used)}</h4>
            </div>
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={20} color="#22c55e" />
            </div>
            <div>
              <p style={{ color: T.muted, fontSize: 12, fontWeight: 500, margin: '0 0 4px' }}>Remaining</p>
              <h4 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.text }}>{fmt(remaining)}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text, margin: 0 }}>Available Plans</h3>
          <p style={{ fontSize: 13, color: T.muted, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={13} color={T.accent} /> Upgrade to unlock higher limits
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlanId === plan.id;
            const price    = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const features = getPlanFeatures(plan);
            const savings  = getSavingsPercent(plan);

            return (
              <div
                key={plan.id}
                style={{
                  background: T.card,
                  border: isCurrent
                    ? `2px solid ${T.accent}`
                    : plan.isPopular
                    ? `2px solid rgba(45,212,191,0.5)`
                    : `1px solid ${T.border}`,
                  borderRadius: 16, padding: '24px 18px',
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  boxShadow: isCurrent
                    ? `0 0 24px rgba(45,212,191,0.12)`
                    : plan.isPopular
                    ? `0 8px 28px rgba(45,212,191,0.07)`
                    : 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                className="plan-card"
              >
                {/* Badge */}
                {(plan.isPopular && !isCurrent) && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: T.accent, color: '#0A0A0F', padding: '3px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: T.accent, color: '#0A0A0F', padding: '3px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    CURRENT PLAN
                  </div>
                )}

                {/* Plan icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0F', background: T.accent }}>
                    {PLAN_ICONS[plan.id]}
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>{plan.name}</h4>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>${price}</span>
                  {billingCycle === 'yearly' && !plan.isFree && (
                    <span style={{ fontSize: 13, textDecoration: 'line-through', color: T.muted }}>${plan.priceMonthly}</span>
                  )}
                </div>
                <p style={{ color: T.muted, fontSize: 12, margin: '0 0 4px' }}>
                  {plan.isFree ? 'forever' : `per month${billingCycle === 'yearly' ? ', billed annually' : ''}`}
                </p>
                {billingCycle === 'yearly' && !plan.isFree && savings > 0 ? (
                  <span style={{ display: 'inline-flex', alignSelf: 'flex-start', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.2)', marginBottom: 12 }}>
                    Save {savings}% · ${plan.yearlyTotal}/yr
                  </span>
                ) : <div style={{ marginBottom: 12 }} />}

                {/* Chars highlight */}
                <div style={{ padding: '8px 12px', borderRadius: 10, marginBottom: 14, background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>{plan.chars} chars/month</span>
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {features.map((feat, i) => (
                    <li key={i} style={{ fontSize: 12, color: T.muted, display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.4 }}>
                      <CheckCircle2 size={13} color={T.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                      {feat}
                    </li>
                  ))}
                  <li style={{ fontSize: 12, color: T.muted, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} /> Commercial use
                  </li>
                  <li style={{ fontSize: 12, color: T.muted, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} /> No watermark
                  </li>
                </ul>

                <button
                  disabled={isCurrent || loadingPlan === plan.id}
                  onClick={() => handleCheckout(plan)}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 11,
                    border: isCurrent ? `1px solid ${T.border}` : 'none',
                    background: isCurrent ? T.surface : T.accent,
                    color: isCurrent ? T.muted : '#0A0A0F',
                    fontWeight: 700, fontSize: 13,
                    cursor: isCurrent ? 'default' : 'pointer',
                    opacity: isCurrent ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'opacity 0.2s, transform 0.15s',
                  }}
                  className={isCurrent ? '' : 'upgrade-btn'}
                >
                  {isCurrent ? 'Current Plan' :
                   plan.isFree ? 'Free Plan' :
                   loadingPlan === plan.id ? 'Redirecting…' :
                   currentPlanId !== 'free' ? 'Manage Subscription' : 'Upgrade'}
                  {!isCurrent && !plan.isFree && loadingPlan !== plan.id && <ArrowRight size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .plan-card:hover { transform: translateY(-2px); }
        .upgrade-btn:hover { opacity: 0.88 !important; transform: translateY(-1px); }
        .manage-btn:hover { border-color: rgba(45,212,191,0.3) !important; color: ${T.accent} !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
