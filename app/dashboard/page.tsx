'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  Mic,
  Bookmark,
  Library,
  Volume2,
  ChevronRight,
  BarChart2,
  Zap,
  Clock,
  Users,
} from 'lucide-react';
interface Profile {
  full_name?: string | null;
  plan?: string | null;
  credits_limit?: number | null;
  credits_used?: number | null;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

const QUICK_ACTIONS = [
  {
    icon: Volume2,
    title: 'Text to Speech',
    desc: 'Convert any text into natural human-like audio instantly',
    href: '/dashboard/tts',
  },
  {
    icon: Mic,
    title: 'Voice Cloning',
    desc: 'Clone your voice with just 30 seconds of audio',
    href: '/dashboard/cloning',
  },
  {
    icon: Library,
    title: 'ebook to Audiobook',
    desc: 'Generate complete long-form audiobooks automatically',
    href: '/dashboard/audiobooks',
  },
];

const CLONE_OPTIONS = [
  {
    icon: Mic,
    title: 'Clone your Voice',
    desc: 'Create a realistic digital clone of your voice',
    href: '/dashboard/cloning',
  },
  {
    icon: Bookmark,
    title: 'Saved Voices',
    desc: 'Access your personal saved voice collection',
    href: '/dashboard/saved',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const userIdRef = useRef<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [clonesUsed, setClonesUsed] = useState(0);
  const [generationsToday, setGenerationsToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Dashboard'; }, []);

  useEffect(() => {
    async function load() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }

      userIdRef.current = user.id;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [profileRes, clonesRes, jobsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, plan, credits_limit, credits_used').eq('id', user.id).single(),
        supabase.from('cloned_voices').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tts_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', todayStart.toISOString()),
      ]);

      setProfile(profileRes.data ?? null);
      setUserName(
        profileRes.data?.full_name?.split(' ')[0] ||
        user.email?.split('@')[0] ||
        'there'
      );
      setClonesUsed(clonesRes.count ?? 0);
      setGenerationsToday(jobsRes.count ?? 0);
      setLoading(false);
    }
    load();

    async function refreshProfile() {
      if (document.visibilityState !== 'visible' || !userIdRef.current) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, plan, credits_limit, credits_used')
        .eq('id', userIdRef.current)
        .single();
      if (data) setProfile(data);
    }

    document.addEventListener('visibilitychange', refreshProfile);
    return () => document.removeEventListener('visibilitychange', refreshProfile);
  }, [router, supabase]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          width: '36px', height: '36px',
          border: '3px solid rgba(45,212,191,0.2)',
          borderTop: '3px solid #2DD4BF',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    );
  }

  const creditsUsed = profile?.credits_used ?? 0;
  const creditsLimit = profile?.credits_limit ?? 10000;
  const creditsRemaining = Math.max(0, creditsLimit - creditsUsed);
  const usagePct = creditsLimit > 0 ? Math.min(100, Math.round((creditsUsed / creditsLimit) * 100)) : 0;

  const STATS = [
    { icon: BarChart2, label: 'Characters Used', value: fmtNum(creditsUsed), sub: 'this month' },
    { icon: Zap, label: 'Characters Remaining', value: fmtNum(creditsRemaining), sub: `${usagePct}% used` },
    { icon: Users, label: 'Voice Clones', value: `${clonesUsed}`, sub: 'created' },
    { icon: Clock, label: 'Generations Today', value: `${generationsToday}`, sub: 'audio files' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>


      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid #2DD4BF',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <Icon size={18} color="#2DD4BF" strokeWidth={2} />
              <div>
                <p style={{
                  fontSize: '26px', fontWeight: 800,
                  color: 'var(--text)', margin: 0,
                  letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '6px 0 0', fontWeight: 500 }}>
                  {stat.label}{' '}
                  <span style={{ opacity: 0.6 }}>— {stat.sub}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Quick Actions
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {QUICK_ACTIONS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
              <div className="qa-card" style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: 'rgba(45,212,191,0.1)',
                  border: '1px solid rgba(45,212,191,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} color="#2DD4BF" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 gap-6">

        {/* Create or Clone */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Create or Clone
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {CLONE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <Link key={opt.href} href={opt.href} style={{ textDecoration: 'none' }}>
                  <div className="clone-card" style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    cursor: 'pointer', transition: 'all 0.18s ease',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(45,212,191,0.1)',
                      border: '1px solid rgba(45,212,191,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={18} color="#2DD4BF" strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
                        {opt.title}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, fontWeight: 500 }}>
                        {opt.desc}
                      </p>
                    </div>
                    <ChevronRight size={16} color="var(--muted)" style={{ opacity: 0.45, flexShrink: 0 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .qa-card:hover {
          border-color: rgba(45,212,191,0.25) !important;
          box-shadow: 0 0 24px rgba(45,212,191,0.08);
          background: rgba(45,212,191,0.04) !important;
          backdrop-filter: blur(12px);
          transform: translateY(-2px);
        }
        .clone-card:hover {
          border-color: rgba(45,212,191,0.25) !important;
          box-shadow: 0 0 18px rgba(45,212,191,0.08);
          background: rgba(45,212,191,0.04) !important;
          backdrop-filter: blur(12px);
        }
        .explore-btn:hover {
          border-color: rgba(45,212,191,0.3) !important;
          color: #2DD4BF !important;
          background: rgba(45,212,191,0.06) !important;
        }
        .voice-row:hover {
          background: var(--hover) !important;
        }
      `}</style>
    </div>
  );
}
