'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Mic,
  Music,
  Headphones,
  Bookmark,
  FileText,
  ChevronRight,
  Layers,
  Zap,
  Star,
  Activity,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Profile {
  full_name?: string | null;
  plan?: string | null;
  credits_limit?: number | null;
  credits_used?: number | null;
}

interface Voice {
  id: string;
  name: string;
  description?: string | null;
  gender?: string | null;
  language?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitialColor(name: string): string {
  const colors = [
    'linear-gradient(135deg, #f5c518 0%, #ff6b35 100%)',
    'linear-gradient(135deg, #5b8ef0 0%, #a855f7 100%)',
    'linear-gradient(135deg, #22d3a5 0%, #5b8ef0 100%)',
    'linear-gradient(135deg, #f472b6 0%, #f5c518 100%)',
    'linear-gradient(135deg, #a855f7 0%, #22d3a5 100%)',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

// ─── Feature Cards ────────────────────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    icon: FileText,
    emoji: '🔊',
    title: 'Text to Speech',
    desc: 'Convert any text into natural-sounding audio',
    href: '/dashboard/tts',
    iconColor: '#f5c518',
  },
  {
    icon: Mic,
    emoji: '🧬',
    title: 'Voice Cloning',
    desc: 'Clone any voice with just a short sample',
    href: '/dashboard/cloning',
    iconColor: '#a855f7',
  },
  {
    icon: Music,
    emoji: '🎙️',
    title: 'Voice Library',
    desc: 'Browse hundreds of ready-to-use voices',
    href: '/dashboard/library',
    iconColor: '#5b8ef0',
  },
  {
    icon: Bookmark,
    emoji: '📁',
    title: 'Saved Voices',
    desc: 'Access your favourite saved voices',
    href: '/dashboard/saved',
    iconColor: '#f472b6',
  },
];

// ─── Clone Options ────────────────────────────────────────────────────────────
const CLONE_OPTIONS = [
  {
    icon: Mic,
    title: 'Clone your Voice',
    desc: 'Record a short sample and instantly clone your voice with AI.',
    href: '/dashboard/cloning',
    color: '#f5c518',
  },
  {
    icon: Layers,
    title: 'Voice Collections',
    desc: 'Browse curated voice packs for any use case.',
    href: '/dashboard/library',
    color: '#5b8ef0',
  },
  {
    icon: Bookmark,
    title: 'Saved Voices',
    desc: 'Pick up where you left off with your saved favourites.',
    href: '/dashboard/saved',
    color: '#22d3a5',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [gensToday, setGensToday] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
        return;
      }

      // Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, plan, credits_limit, credits_used')
        .eq('id', user.id)
        .single();

      setProfile(profileData ?? null);
      setUserName(
        profileData?.full_name?.split(' ')[0] ||
          user.email?.split('@')[0] ||
          'there'
      );

      // Latest voices
      const { data: voiceData } = await supabase
        .from('voices')
        .select('id, name, description, gender, language')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      setVoices(voiceData ?? []);

      // Saved voices count
      const { count: sCount } = await supabase
        .from('saved_voices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setSavedCount(sCount ?? 0);

      // Generations today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: gCount } = await supabase
        .from('tts_jobs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setGensToday(gCount ?? 0);
      setLoading(false);
    }

    load();
  }, [router]);

  const creditsRemaining =
    profile?.credits_limit != null && profile?.credits_used != null
      ? profile.credits_limit - profile.credits_used
      : '—';

  const STATS = [
    {
      label: 'Credits Remaining',
      value: creditsRemaining.toLocaleString(),
      icon: Zap,
      color: '#f5c518',
    },
    {
      label: 'Saved Voices',
      value: savedCount,
      icon: Bookmark,
      color: '#5b8ef0',
    },
    {
      label: 'Generations Today',
      value: gensToday,
      icon: Activity,
      color: '#22d3a5',
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(245,197,24,0.2)',
            borderTop: '3px solid #f5c518',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Topbar ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8"
      >
        <div>
          <h1
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--text)',
              margin: '0',
              letterSpacing: '-0.02em',
            }}
          >
            Dashboard
          </h1>
        </div>

        <ThemeToggle />
      </div>

      {/* ── Stats Row ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7"
      >
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: `${s.color}14`,
                  border: `1px solid ${s.color}24`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <s.icon size={18} color={s.color} strokeWidth={1.8} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    margin: 0,
                    fontFamily: 'Instrument Serif, serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    margin: 0,
                    marginTop: '2px',
                  }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Feature Cards ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8"
      >
        {FEATURE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="feature-card"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '22px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: `${card.iconColor}14`,
                    border: `1px solid ${card.iconColor}24`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <Icon size={20} color={card.iconColor} strokeWidth={1.8} />
                </div>
                <p
                  style={{
                    fontFamily: 'Instrument Serif, serif',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    margin: '0 0 6px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {card.title}
                </p>
                <p
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--muted)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Bottom 2-col grid ── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* LEFT – Latest from the library */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontFamily: 'Instrument Serif, serif',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text)',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Latest from the library
            </h2>
            <Music size={15} color="var(--muted)" />
          </div>

          {/* Voice rows */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {voices.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                No voices found.
              </p>
            ) : (
              voices.map((voice) => {
                const initial = (voice.name || '?')[0].toUpperCase();
                return (
                  <div
                    key={voice.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => router.push(`/dashboard/tts?voice=${voice.id}`)}
                    className="voice-row-hover"
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: getInitialColor(voice.name),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Instrument Serif, serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: '#080810',
                        flexShrink: 0,
                      }}
                    >
                      {initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: '13px',
                          color: 'var(--text)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {voice.name}
                      </p>
                      <p
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--muted)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {voice.description || `${voice.gender || ''} · ${voice.language || ''}`.trim() || 'No description'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Explore button */}
          <Link
            href="/dashboard/library"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '16px',
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(245,197,24,0.08)',
              border: '1px solid rgba(245,197,24,0.18)',
              color: '#f5c518',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            className="explore-btn"
          >
            Explore Library
            <ChevronRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        {/* RIGHT – Create or clone a voice */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text)',
              margin: '0 0 20px',
              letterSpacing: '-0.01em',
            }}
          >
            Create or clone a voice
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CLONE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <Link
                  key={opt.href}
                  href={opt.href}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="clone-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px',
                      borderRadius: '14px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '11px',
                        background: `${opt.color}12`,
                        border: `1px solid ${opt.color}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={opt.color} strokeWidth={1.8} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: 'Instrument Serif, serif',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: 'var(--text)',
                          margin: '0 0 3px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {opt.title}
                      </p>
                      <p
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--muted)',
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {opt.desc}
                      </p>
                    </div>
                      <ChevronRight
                      size={15}
                      color="var(--muted)"
                      strokeWidth={2}
                      style={{ flexShrink: 0 }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Inline hover styles ── */}
      <style>{`
        .feature-card:hover {
          background: var(--glass) !important;
          border-color: var(--accent) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .voice-row-hover:hover {
          background: var(--glass);
        }
        .explore-btn:hover {
          background: rgba(245,197,24,0.14) !important;
          box-shadow: 0 0 20px rgba(245,197,24,0.12);
        }
        .clone-card:hover {
          background: var(--glass) !important;
          border-color: var(--accent) !important;
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
}
