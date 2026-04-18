'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { getAvatarPath, getAvatarBackdrop } from '@/utils/avatar';
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
  Activity,
  Library,
  Volume2
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



// ─── Feature Cards ────────────────────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    icon: Volume2,
    emoji: '🔊',
    title: 'Text to Speech',
    desc: 'Convert any text into natural human-like audio instantly',
    href: '/dashboard/tts',
    iconColor: '#f5c518',
  },
  {
    icon: Mic,
    emoji: '🧬',
    title: 'Voice Cloning',
    desc: 'Clone your voice with just 30 seconds of audio',
    href: '/dashboard/cloning',
    iconColor: '#22d3a5',
  },
  {
    icon: Music,
    emoji: '🎙️',
    title: 'Voice Library',
    desc: '551 voices across 19 languages — preview & save',
    href: '/dashboard/library',
    iconColor: '#5b8ef0',
  },
  {
    icon: Library,
    emoji: '📚',
    title: 'Ebook to AudioBook',
    desc: 'Generate complete long-form audiobooks automatically',
    href: '/dashboard/audiobooks',
    iconColor: '#a855f7',
  },
  {
    icon: Bookmark,
    emoji: '📁',
    title: 'Saved Voices',
    desc: 'Your personal voice collection — no limit',
    href: '/dashboard/saved',
    iconColor: '#f59e0b',
  },
];

// ─── Clone Options ────────────────────────────────────────────────────────────
const CLONE_OPTIONS = [
  {
    icon: Mic,
    title: 'Clone your Voice',
    desc: 'Create a realistic digital clone of your voice',
    href: '/dashboard/cloning',
    color: '#22d3a5', // matched to cloning icon
  },
  {
    icon: Layers, // Changed to layers generically instead of mic again across mock
    title: 'Voice Collections',
    desc: 'Curated voices for every use case — 19 languages',
    href: '/dashboard/library',
    color: '#5b8ef0', // matched to library
  },
  {
    icon: Bookmark,
    title: 'Saved Voices',
    desc: 'Access your personal saved voice collection',
    href: '/dashboard/saved',
    color: '#f5c518', // matched to saved
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [voices, setVoices] = useState<Voice[]>([]);
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
      setLoading(false);
    }

    load();
  }, [router]);

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
    <div style={{ fontFamily: 'Geist, sans-serif' }}>
      <title>Dashboard | FlashTTS</title>

      {/* ── Topbar / Header ── */}
      <div
        className="flex justify-between items-end mb-8"
        style={{ width: '100%' }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: '36px',
              fontWeight: 800,
              color: 'var(--text)',
              margin: '0',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            Dashboard
          </h1>
          <p 
            style={{ 
              fontSize: '14px', 
              fontWeight: 500, 
              color: 'var(--muted)', 
              margin: '6px 0 0 0',
              fontFamily: 'Geist, sans-serif' 
            }}
          >
            {getGreeting()}, {userName} 👋
          </p>
        </div>

        <div style={{ flexShrink: 0 }}>
          <ThemeToggle />
        </div>
      </div>

      {/* ── Feature Cards ── */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12"
      >
        {FEATURE_CARDS.map((card) => {
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
                  borderRadius: '24px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: `${card.iconColor}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    border: `1px solid ${card.iconColor}20`
                  }}
                >
                  {card.emoji}
                </div>
                <div>
                    <h3
                    style={{
                        fontFamily: 'Geist, sans-serif',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text)',
                        margin: '0 0 8px',
                        letterSpacing: '-0.01em',
                    }}
                    >
                    {card.title}
                    </h3>
                    <p
                    style={{
                        fontSize: '13px',
                        color: 'var(--muted)',
                        margin: 0,
                        lineHeight: 1.5,
                        fontWeight: 500
                    }}
                    >
                    {card.desc}
                    </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Bottom 2-col grid ── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-10" // Increased gap to match screenshot flow
      >
        {/* LEFT – Latest from the library */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text)',
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
            }}
          >
            Latest from the library
          </h2>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {voices.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                No voices found.
              </p>
            ) : (
              voices.map((voice) => {
                const vColor = getAvatarBackdrop(voice.name || 'V');
                const vPath = getAvatarPath(voice.name || 'V', voice.gender);
                return (
                  <div
                    key={voice.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px',
                      borderRadius: '16px',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => router.push(`/dashboard/tts?voice=${voice.id}`)}
                    className="voice-row-hover"
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: vColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}
                    >
                      <Image src={vPath} alt={voice.name || 'Avatar'} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: '14px',
                          color: 'var(--text)',
                          margin: '0 0 4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontFamily: 'Geist, sans-serif'
                        }}
                      >
                        {voice.name} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>— {(voice.gender || '').charAt(0).toUpperCase() + (voice.gender || '').slice(1)}</span>
                      </p>
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--muted)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: 500
                        }}
                      >
                        {voice.description || `${voice.language || ''}`.trim() || 'Premium voice selection...'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Link
            href="/dashboard/library"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              padding: '12px 18px',
              borderRadius: '99px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              alignSelf: 'flex-start'
            }}
            className="explore-btn"
          >
            Explore Library
            <ChevronRight size={14} strokeWidth={2.5} color="var(--muted)" />
          </Link>
        </div>

        {/* RIGHT – Create or clone a voice */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text)',
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
            }}
          >
            Create or clone a voice
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      gap: '18px',
                      padding: '20px 24px',
                      borderRadius: '24px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: `${opt.color}15`,
                        border: `1px solid ${opt.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} color={opt.color} strokeWidth={2} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: 'Geist, sans-serif',
                          fontSize: '15px',
                          fontWeight: 700,
                          color: 'var(--text)',
                          margin: '0 0 6px',
                        }}
                      >
                        {opt.title}
                      </p>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--muted)',
                          margin: 0,
                          fontWeight: 500
                        }}
                      >
                        {opt.desc}
                      </p>
                    </div>

                    <ChevronRight size={18} color="var(--muted)" style={{ opacity: 0.6 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      <style>{`
        .clone-card:hover {
            border-color: rgba(245, 197, 24, 0.4) !important;
            box-shadow: 0 8px 30px rgba(0,0,0,0.04);
            transform: translateY(-1px);
        }
        .feature-card:hover {
            border-color: rgba(245, 197, 24, 0.4) !important;
            box-shadow: 0 12px 40px rgba(0,0,0,0.04);
            transform: translateY(-2px);
        }
        .explore-btn:hover {
            background: rgba(245, 197, 24, 0.1) !important;
            border-color: rgba(245, 197, 24, 0.25) !important;
            color: #f5c518 !important;
        }
        .voice-row-hover:hover {
            background: var(--card-bg) !important;
        }
      `}</style>
    </div>
  );
}
