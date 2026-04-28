'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  Mic,
  Music,
  Bookmark,
  Library,
  Volume2,
  Layers,
  ChevronRight,
  BarChart2,
  Zap,
  Clock,
  Users,
} from 'lucide-react';
import { getAvatarPath, getAvatarBackdrop } from '@/utils/avatar';

interface Profile {
  full_name?: string | null;
  plan?: string | null;
  credits_limit?: number | null;
  credits_used?: number | null;
}

interface Voice {
  id: string;
  name: string;
  language?: string | null;
  gender?: string | null;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function avatarColor(name: string): string {
  const colors = ['#2DD4BF', '#14B8A6', '#0D9488', '#059669', '#10B981', '#22C55E', '#06B6D4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function VoiceAvatar({ name, size = 38 }: { name: string; size?: number }) {
  const avatarPath = getAvatarPath(name);
  const backdrop = getAvatarBackdrop(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: backdrop,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, border: `1px solid var(--border)`, overflow: 'hidden',
    }}>
      <img 
        src={avatarPath} 
        alt={name} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    </div>
  );
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
    icon: Music,
    title: 'Voice Library',
    desc: '1,234+ voices across 19 languages — preview & save',
    href: '/dashboard/library',
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
    icon: Layers,
    title: 'Voice Collections',
    desc: 'Curated voices for every use case — 19 languages',
    href: '/dashboard/library',
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [clonesUsed, setClonesUsed] = useState(0);
  const [generationsToday, setGenerationsToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [profileRes, voicesRes, clonesRes, jobsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, plan, credits_limit, credits_used').eq('id', user.id).single(),
        supabase.from('voices').select('id, name, language, gender').eq('is_active', true).order('created_at', { ascending: false }).limit(5),
        supabase.from('cloned_voices').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tts_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', todayStart.toISOString()),
      ]);

      setProfile(profileRes.data ?? null);
      setUserName(
        profileRes.data?.full_name?.split(' ')[0] ||
        user.email?.split('@')[0] ||
        'there'
      );
      setVoices(voicesRes.data ?? []);
      setClonesUsed(clonesRes.count ?? 0);
      setGenerationsToday(jobsRes.count ?? 0);
      setLoading(false);
    }
    load();
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

      {/* Bottom 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Voices */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Recent Voices
          </p>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {voices.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                No voices found.
              </p>
            ) : voices.map((voice) => {
              const initial = (voice.name || 'V').charAt(0).toUpperCase();
              const color = avatarColor(voice.name || 'V');
              return (
                <div
                  key={voice.id}
                  className="voice-row"
                  onClick={() => router.push(`/dashboard/tts?voice=${voice.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '10px 12px', borderRadius: '10px',
                    cursor: 'pointer', transition: 'background 0.15s ease',
                  }}
                >
                  <VoiceAvatar name={voice.name || 'V'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px', fontWeight: 700, color: 'var(--text)',
                      margin: '0 0 4px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {voice.name}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {voice.language && (
                        <span style={{
                          fontSize: '11px', color: 'var(--muted)',
                          fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {voice.language}
                        </span>
                      )}
                      {voice.gender && (
                        <span style={{
                          fontSize: '10px', fontWeight: 600,
                          padding: '2px 8px', borderRadius: '99px',
                          background: 'rgba(45,212,191,0.08)',
                          color: '#2DD4BF',
                          border: '1px solid rgba(45,212,191,0.18)',
                          textTransform: 'capitalize',
                        }}>
                          {voice.gender}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--muted)" style={{ opacity: 0.35, flexShrink: 0 }} />
                </div>
              );
            })}
          </div>

          <Link href="/dashboard/library" className="explore-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '18px', padding: '10px 16px',
            borderRadius: '8px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            fontSize: '13px', fontWeight: 600, textDecoration: 'none',
            transition: 'all 0.15s ease', alignSelf: 'flex-start',
          }}>
            Explore Library →
          </Link>
        </div>

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
