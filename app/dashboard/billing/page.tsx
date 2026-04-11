'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import {
    CreditCard,
    Zap,
    Download,
    CheckCircle2,
    Loader2
} from 'lucide-react';

interface Profile {
    id: string;
    plan?: string;
    credits_used?: number;
    credits_limit?: number;
}

const PLANS_DATA = [
    {
        id: 'starter',
        name: 'Starter',
        priceMonthly: 9,
        priceYearly: 7,
        chars: '200,000 chars / 200 mins',
        features: [
            "Max 3,000 chars per generation",
            "~65 generations",
            "2 voice clones",
            "20–30 standard voices",
            "Normal generation speed",
            "No watermark"
        ],
        priceIdMonthly: 'pri_01kmt741wy5sezfcjz4xv9493v',
        priceIdYearly: 'pri_01kmt7fx50ephpdvhtyxz4y3zm',
    },
    {
        id: 'creator',
        name: 'Creator',
        priceMonthly: 19,
        priceYearly: 15,
        chars: '500,000 chars / 500 mins',
        features: [
            "Max 5,000 chars per generation",
            "~100 generations",
            "5 voice clones",
            "50+ voices with emotions",
            "Fast generation speed",
            "High-quality audio export"
        ],
        isPopular: true,
        priceIdMonthly: 'pri_01kmt7bptvbg9v4kkbwrstv9c9',
        priceIdYearly: 'pri_01kmt7gyq5gcbcrrhkb7mddxek',
    },
    {
        id: 'pro',
        name: 'Pro',
        priceMonthly: 39,
        priceYearly: 31,
        chars: '1,000,000 chars / 1000 mins',
        features: [
            "Max 10,000 chars per generation",
            "~100 generations",
            "9 voice clones",
            "100+ premium voices",
            "Priority processing",
            "All export formats"
        ],
        priceIdMonthly: 'pri_01kmt7cqkrxcmwfp4h69gsh0s6',
        priceIdYearly: 'pri_01kmt7jaktramdxxxwq4gv4sm6',
    },
    {
        id: 'studio',
        name: 'Studio',
        priceMonthly: 79,
        priceYearly: 63,
        chars: '3,000,000 chars / 3000 mins',
        features: [
            "Max 20,000 chars per generation",
            "~150 generations",
            "15 voice clones",
            "Full library + exclusive voices",
            "API access & Team collab",
            "Commercial usage rights"
        ],
        priceIdMonthly: 'pri_01kmt7dkg934xhvpjjb09zfrbj',
        priceIdYearly: 'pri_01kmt7kmraz2x817ak64jq2q6t',
    }
];

export default function BillingPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [paddle, setPaddle] = useState<Paddle | null>(null);

    useEffect(() => {
        // Initialize Paddle explicitly
        initializePaddle({
            environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production',
            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
        }).then((paddleInstance) => {
            if (paddleInstance) {
                // Ensure environment is set explicitly as requested
                if (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox') {
                    paddleInstance.Environment.set('sandbox');
                }
                setPaddle(paddleInstance);
            }
        });

        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setEmail(user.email || '');
                const { data } = await supabase
                    .from('profiles')
                    .select('id, plan, credits_used, credits_limit')
                    .eq('id', user.id)
                    .single();

                setProfile(data);
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex w-full items-center justify-center p-20 min-h-[50vh]">
                <Loader2 className="animate-spin text-[var(--muted)]" size={32} />
            </div>
        );
    }

    const currentPlan = (profile?.plan || 'Free').toUpperCase();
    const used = profile?.credits_used || 0;
    const limit = profile?.credits_limit || 10000;
    const remaining = Math.max(0, limit - used);
    const rawUsagePercent = (used / limit) * 100;
    const usagePercent = Math.min(100, Math.max(0, rawUsagePercent));
    const isFree = currentPlan === 'FREE';

    const fmt = (num: number) => num.toLocaleString();

    return (
        <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ 
                    fontFamily: 'Instrument Serif, serif', 
                    fontSize: '36px', 
                    fontWeight: 800, 
                    color: 'var(--text)',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.02em'
                }}>Billing & Subscription</h1>
                <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>
                    Manage your plan, usage, and billing details.
                </p>
            </div>

            {/* ── SECTION 1: Current Plan Card ── */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <span style={{ 
                                background: 'rgba(245, 197, 24, 0.15)', 
                                color: '#f5c518', 
                                padding: '4px 10px', 
                                borderRadius: '8px', 
                                fontSize: '12px', 
                                fontWeight: 700, 
                                letterSpacing: '0.05em' 
                            }}>
                                CURRENT PLAN
                            </span>
                            <span style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 500 }}>
                                {isFree ? 'No renewal' : 'Renews automatically'}
                            </span>
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text)' }}>
                            {currentPlan}
                        </h2>
                        
                        <div style={{ marginTop: '28px', maxWidth: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                <span style={{ color: 'var(--text)' }}>Monthly Allowances</span>
                                <span style={{ color: 'var(--muted)' }}>{fmt(used)} / {fmt(limit)} chars</span>
                            </div>
                            <div style={{ 
                                height: '8px', 
                                background: 'var(--border)', 
                                borderRadius: '4px', 
                                overflow: 'hidden' 
                            }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: `${usagePercent}%`, 
                                    background: usagePercent >= 80 ? '#ef4444' : 'linear-gradient(90deg, #f5c518 0%, #ff8a00 100%)',
                                    borderRadius: '4px',
                                    transition: 'width 0.4s ease'
                                }} />
                            </div>
                            {usagePercent >= 80 && (
                                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '10px', fontWeight: 500 }}>
                                    ⚠️ 80% usage reached — upgrade to avoid interruption
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>
                        <div>
                            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '6px' }}>Billing Cycle</p>
                            <div style={{ 
                                display: 'inline-flex', 
                                background: 'var(--bg)', 
                                border: '1px solid var(--border)', 
                                borderRadius: '12px',
                                padding: '4px'
                            }}>
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: billingCycle === 'monthly' ? 'var(--card-bg)' : 'transparent',
                                        color: billingCycle === 'monthly' ? 'var(--text)' : 'var(--muted)',
                                        boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                                    }}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: billingCycle === 'yearly' ? 'rgba(245, 197, 24, 0.1)' : 'transparent',
                                        color: billingCycle === 'yearly' ? '#f5c518' : 'var(--muted)',
                                        boxShadow: billingCycle === 'yearly' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                                    }}
                                >
                                    Yearly <span style={{ background: '#f5c518', color: '#080810', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>-20%</span>
                                </button>
                            </div>
                        </div>
                        
                        <button style={{
                            padding: '12px 24px',
                            background: isFree ? '#f5c518' : 'var(--bg)',
                            color: isFree ? '#080810' : 'var(--text)',
                            border: isFree ? 'none' : '1px solid var(--border)',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            boxShadow: isFree ? '0 4px 14px rgba(245, 197, 24, 0.3)' : 'none',
                        }}>
                            {isFree ? 'Upgrade Plan' : 'Manage Subscription'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── SECTION 2: Usage Insights ── */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--text)' }}>Usage Insights</h3>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '20px' 
                }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Zap size={24} color="#ef4444" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 500, margin: '0 0 4px 0' }}>Characters Used</p>
                            <h4 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>{fmt(used)}</h4>
                        </div>
                    </div>
                    
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle2 size={24} color="#22c55e" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 500, margin: '0 0 4px 0' }}>Remaining Characters</p>
                            <h4 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>{fmt(remaining)}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SECTION 3: Upgrade Plans Grid ── */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Available Plans</h3>
                    <p style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={14} style={{ color: '#f5c518' }} />
                        Upgrade now to unlock faster generation & higher limits
                    </p>
                </div>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: '20px' 
                }}>
                    {PLANS_DATA.map(plan => {
                        const isCurrent = currentPlan === plan.name.toUpperCase() && !isFree; // If free, none of these 4 are current
                        const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
                        const priceId = billingCycle === 'yearly' ? plan.priceIdYearly : plan.priceIdMonthly;

                        const handleUpgrade = () => {
                            if (!paddle || !profile?.id) return;
                            
                            paddle.Checkout.open({
                                items: [{ priceId }],
                                customer: { email },
                                customData: { user_id: profile.id }
                            });
                        };

                        return (
                            <div key={plan.id} style={{
                                background: 'var(--card-bg)',
                                border: plan.isPopular ? '2px solid #f5c518' : '1px solid var(--border)',
                                borderRadius: '20px',
                                padding: '32px 24px',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: plan.isPopular ? '0 12px 30px rgba(245, 197, 24, 0.1)' : '0 4px 15px rgba(0,0,0,0.02)'
                            }}>
                                {plan.isPopular && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-12px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'linear-gradient(135deg, #f5c518 0%, #ff8a00 100%)',
                                        color: '#080810',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        letterSpacing: '0.05em',
                                        boxShadow: '0 4px 10px rgba(245, 197, 24, 0.4)'
                                    }}>
                                        ⭐ MOST POPULAR
                                    </div>
                                )}
                                
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px 0' }}>{plan.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>${price}</span>
                                    {billingCycle === 'yearly' && (
                                        <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--muted)', fontWeight: 500 }}>
                                            ${plan.priceMonthly}
                                        </span>
                                    )}
                                </div>
                                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 24px 0' }}>
                                    per month{billingCycle === 'yearly' && ', billed annually'}
                                </p>
                                
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <li style={{ fontSize: '13px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                                        <CheckCircle2 size={16} color="#f5c518" style={{ flexShrink: 0 }} /> 
                                        {plan.chars}
                                    </li>
                                    {plan.features.map((feat, i) => (
                                        <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} /> 
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    disabled={isCurrent}
                                    onClick={handleUpgrade}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: isCurrent ? '1px solid var(--border)' : 'none',
                                        background: isCurrent ? 'var(--bg)' : plan.isPopular ? '#f5c518' : 'var(--text)',
                                        color: isCurrent ? 'var(--muted)' : plan.isPopular ? '#080810' : 'var(--bg)',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        cursor: isCurrent ? 'default' : 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: isCurrent ? 0.7 : 1
                                    }}
                                >
                                    {isCurrent ? 'Current Plan' : 'Upgrade'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
