'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Search, Trash2, Calendar, Mic, Zap, Check, X } from 'lucide-react';

const T = {
  bg:      'var(--bg)',
  card:    'var(--card-bg)',
  surface: 'var(--surface)',
  accent:  '#2DD4BF',
  border:  'var(--border)',
  muted:   'var(--muted)',
  text:    'var(--text)',
};

interface Generation {
  id: string;
  text: string;
  voice_id: string;
  voice_name: string;
  language: string;
  created_at: string;
  format: string;
  char_count?: number;
}

type FilterType = 'all' | 'tts' | 'cloned' | 'audiobook';

const getRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

function WaveformIcon() {
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="14" width="5" height="12" rx="2.5" fill="rgba(45,212,191,0.3)" />
      <rect x="10" y="8"  width="5" height="24" rx="2.5" fill="rgba(45,212,191,0.4)" />
      <rect x="18" y="4"  width="5" height="32" rx="2.5" fill="rgba(45,212,191,0.5)" />
      <rect x="26" y="10" width="5" height="20" rx="2.5" fill="rgba(45,212,191,0.6)" />
      <rect x="34" y="2"  width="5" height="36" rx="2.5" fill="rgba(45,212,191,0.5)" />
      <rect x="42" y="8"  width="5" height="24" rx="2.5" fill="rgba(45,212,191,0.4)" />
      <rect x="50" y="14" width="5" height="12" rx="2.5" fill="rgba(45,212,191,0.3)" />
      <rect x="58" y="18" width="5" height="4"  rx="2"   fill="rgba(45,212,191,0.2)" />
    </svg>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [history, setHistory] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showing, setShowing] = useState(20);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('tts_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('History fetch error:', error);
        setHistory([]);
      } else {
        setHistory((data || []).map((item: any) => ({ ...item, text: item.text_input || item.text })));
      }
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = history.filter(h => {
      const d = new Date(h.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total: history.length, thisMonth, uniqueVoices: new Set(history.map(h => h.voice_id)).size };
  }, [history]);

  const filtered = useMemo(() => {
    return history.filter(g => {
      const matchSearch = (g.text || '').toLowerCase().includes(search.toLowerCase()) ||
        (g.voice_name || '').toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [history, search, filter]);

  const visibleHistory = filtered.slice(0, showing);
  const hasMore = showing < filtered.length;

  const handleDelete = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('tts_jobs').delete().eq('id', id).eq('user_id', user.id);
    if (!error) { setHistory(prev => prev.filter(g => g.id !== id)); setDeletingId(null); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: `3px solid rgba(45,212,191,0.15)`, borderTop: `3px solid ${T.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%' }}>


      {/* Stats */}
      <div style={{ marginBottom: 24 }}>
        {history.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
            {[
              { label: 'Total', val: stats.total, icon: Zap },
              { label: 'This Month', val: stats.thisMonth, icon: Calendar },
              { label: 'Voices Used', val: stats.uniqueVoices, icon: Mic },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.card, border: `1px solid ${T.border}`, padding: '8px 14px', borderRadius: 10 }}>
                <s.icon size={14} color={T.accent} />
                <span style={{ fontSize: 18, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: T.text, lineHeight: 1 }}>{s.val}</span>
                <span style={{ fontSize: 12, color: T.muted }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search + Filter row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: T.card, padding: '10px 14px', borderRadius: 10, border: `1px solid ${T.border}` }}>
          <Search size={16} color={T.muted} />
          <input
            type="text"
            placeholder="Search by text or voice name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 13, fontFamily: 'inherit' }}
          />
          <span style={{ fontSize: 11, color: T.muted }}>{filtered.length}</span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'tts', 'cloned', 'audiobook'] as FilterType[]).map(f => {
            const label = f === 'audiobook' ? 'ebook to Audiobook' : f.charAt(0).toUpperCase() + f.slice(1);
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: filter === f ? T.accent : T.card,
                  color: filter === f ? '#0A0A0F' : T.muted,
                  border: `1px solid ${filter === f ? T.accent : T.border}`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', gap: 16, textAlign: 'center' }}>
            <WaveformIcon />
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: T.text, margin: 0 }}>
              {search ? 'No matches found' : 'No audio generated yet'}
            </h3>
            <p style={{ color: T.muted, fontSize: 13, margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
              {search ? 'Try searching for something else' : 'Your TTS generations will appear here after you create them.'}
            </p>
            {!search && (
              <Link href="/dashboard/tts" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: T.accent, color: '#0A0A0F', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'Syne, sans-serif', marginTop: 4 }}>
                Generate Audio →
              </Link>
            )}
          </div>
        ) : (
          <>
            {visibleHistory.map(gen => (
              <div
                key={gen.id}
                className="hist-row"
                style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: '14px 18px', display: 'flex', flexDirection: 'row',
                  alignItems: 'center', gap: 16, transition: 'border-color 0.2s',
                }}
              >
                {/* Left: content */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ background: 'rgba(45,212,191,0.08)', color: T.accent, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, alignSelf: 'flex-start', letterSpacing: '0.02em' }}>
                    {gen.char_count || gen.text?.length || 0} chars
                  </span>
                  <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {gen.text}
                  </p>
                </div>

                {/* Middle: chips */}
                <div className="hist-chips" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {gen.voice_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: T.surface, border: `1px solid ${T.border}`, padding: '4px 10px', borderRadius: 8, fontSize: 11, color: T.muted, whiteSpace: 'nowrap' }}>
                      <Mic size={10} /> {gen.voice_name}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: T.surface, border: `1px solid ${T.border}`, padding: '4px 10px', borderRadius: 8, fontSize: 11, color: T.muted, whiteSpace: 'nowrap' }}>
                    <Calendar size={10} /> {getRelativeDate(gen.created_at)}
                  </div>
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {deletingId === gen.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.05)', padding: '4px 8px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>Delete?</span>
                      <button onClick={() => handleDelete(gen.id)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Check size={13} />
                      </button>
                      <button onClick={() => setDeletingId(null)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: T.surface, color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push(`/dashboard/tts?text=${encodeURIComponent(gen.text)}&voice=${gen.voice_id}`)}
                        className="hist-reuse"
                        style={{ padding: '7px 14px', borderRadius: 9, background: 'transparent', border: `1px solid rgba(45,212,191,0.3)`, color: T.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                      >
                        ↺ Re-use
                      </button>
                      <button
                        onClick={() => setDeletingId(gen.id)}
                        className="hist-trash"
                        style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.06)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={() => setShowing(prev => prev + 20)}
                style={{ marginTop: 8, padding: 12, borderRadius: 10, background: 'transparent', border: `1px solid ${T.border}`, color: T.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}
                className="hist-more"
              >
                Show {filtered.length - showing} more
              </button>
            )}
          </>
        )}
      </div>

      <style>{`
        .hist-row:hover { border-color: rgba(45,212,191,0.2) !important; }
        .hist-reuse:hover { background: rgba(45,212,191,0.08) !important; border-color: rgba(45,212,191,0.5) !important; }
        .hist-trash:hover { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.25) !important; }
        .hist-more:hover { border-color: rgba(45,212,191,0.3) !important; color: ${T.text} !important; }
        @media (max-width: 640px) {
          .hist-chips { display: none !important; }
          .hist-row { flex-wrap: wrap; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
