'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
    Search, 
    Trash2, 
    Play, 
    Calendar, 
    Mic,
    Zap,
    Check,
    X
} from 'lucide-react';

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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

const getLanguageLabel = (lang: string) => {
    const flags: Record<string, string> = {
        en: '🇺🇸',
        ar: '🇸🇦',
        hi: '🇮🇳',
        es: '🇪🇸',
        fr: '🇫🇷',
        de: '🇩🇪',
        it: '🇮🇹',
        ja: '🇯🇵',
        ko: '🇰🇷',
        pt: '🇧🇷',
        ru: '🇷🇺',
        zh: '🇨🇳',
        tr: '🇹🇷',
    };
    const code = (lang || 'en').toLowerCase().split('-')[0];
    const flag = flags[code] || '🌐';
    return `${flag} ${code.toUpperCase()}`;
};

export default function HistoryPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    // Data State
    const [history, setHistory] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // UI State
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
              const mappedData = (data || []).map((item: any) => ({
                ...item,
                text: item.text_input || item.text
              }));
              setHistory(mappedData);
            }
            setLoading(false);
        }
        load();
    }, [router, supabase]);

    // Stats
    const stats = useMemo(() => {
        const total = history.length;
        const now = new Date();
        const thisMonth = history.filter(h => {
            const d = new Date(h.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const uniqueVoices = new Set(history.map(h => h.voice_id)).size;
        return { total, thisMonth, uniqueVoices };
    }, [history]);

    // Filtering & Pagination
    const filtered = useMemo(() => {
        return history.filter(g =>
            (g.text || '').toLowerCase().includes(search.toLowerCase()) ||
            (g.voice_name || '').toLowerCase().includes(search.toLowerCase())
        );
    }, [history, search]);

    const visibleHistory = filtered.slice(0, showing);
    const hasMore = showing < filtered.length;

    const handleDelete = async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('tts_jobs')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (!error) {
            setHistory(prev => prev.filter(g => g.id !== id));
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(245,197,24,0.1)', borderTop: '3px solid #f5c518', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'DM Sans, sans-serif', width: '100%' }}>
            <title>History</title>

            {/* ── Header Section ── */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                    History
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
                    Track and manage your generated audio content
                </p>

                {/* Stats Bar */}
                {history.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
                        {[
                            { label: 'Total Generations', val: stats.total, icon: Zap },
                            { label: 'This Month', val: stats.thisMonth, icon: Calendar },
                            { label: 'Voices Used', val: stats.uniqueVoices, icon: Mic },
                        ].map((s, i) => (
                            <div key={i} style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                background: 'var(--card-bg)', border: '1px solid var(--border)', 
                                padding: '10px 16px', borderRadius: '12px' 
                            }}>
                                <s.icon size={16} color="#f5c518" />
                                <div>
                                    <span style={{ fontSize: '18px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{s.val}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '6px' }}>{s.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Search Bar ── */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '24px',
                background: 'var(--card-bg)',
                padding: '12px 16px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                width: '100%'
            }}>
                <Search size={18} color="var(--muted)" />
                <input 
                    type="text" 
                    placeholder="Search by text or voice name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text)',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                    }}
                />
                <span style={{ fontSize: '12px', color: 'var(--muted)', opacity: 0.7 }}>
                    {filtered.length} results
                </span>
            </div>

            {/* ── History Content ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '80px 24px', 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '60px', marginBottom: '20px' }}>🎙️</span>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--text)', margin: '0 0 8px' }}>
                            {search ? "No matches found" : "No audio generated yet"}
                        </h3>
                        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px', maxWidth: '300px', lineHeight: 1.5 }}>
                            {search ? "Try searching for something else" : "Your TTS generations will appear here after you create them."}
                        </p>
                        {!search && (
                            <Link href="/dashboard/tts" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                background: '#f5c518',
                                color: '#000',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                fontFamily: 'Syne, sans-serif'
                            }}>
                                Generate Audio →
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {visibleHistory.map(gen => (
                            <div 
                                key={gen.id}
                                className="history-row"
                                style={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '14px',
                                    padding: '14px 18px',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '20px',
                                    transition: 'border-color 0.2s ease',
                                }}
                            >
                                {/* LEFT: Content */}
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            background: 'rgba(245,197,24,0.08)',
                                            color: '#f5c518',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            letterSpacing: '0.02em'
                                        }}>
                                            {gen.char_count || gen.text?.length || 0} chars
                                        </span>
                                    </div>
                                    <p style={{ 
                                        fontSize: '14px', 
                                        color: 'var(--text)', 
                                        margin: 0,
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {gen.text}
                                    </p>
                                </div>

                                {/* MIDDLE: Chips (Hidden on very small screens if we had responsive classes, here we rely on flex-wrap if needed) */}
                                <div className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="meta-chip">
                                        <Mic size={10} /> {gen.voice_name}
                                    </div>
                                    <div className="meta-chip">
                                        {getLanguageLabel(gen.language)}
                                    </div>
                                    <div className="meta-chip">
                                        <Calendar size={10} /> {getRelativeDate(gen.created_at)}
                                    </div>
                                </div>

                                {/* RIGHT: Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    {deletingId === gen.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,80,80,0.05)', padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(255,80,80,0.15)' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff5050', marginRight: '4px' }}>Delete?</span>
                                            <button 
                                                onClick={() => handleDelete(gen.id)}
                                                className="confirm-btn delete"
                                                title="Confirm Delete"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button 
                                                onClick={() => setDeletingId(null)}
                                                className="confirm-btn cancel"
                                                title="Cancel"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => router.push(`/dashboard/tts?text=${encodeURIComponent(gen.text)}&voice=${gen.voice_id}`)}
                                                style={{
                                                    padding: '7px 14px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(245,197,24,0.08)',
                                                    border: '1px solid rgba(245,197,24,0.2)',
                                                    color: '#f5c518',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.15s ease'
                                                }}
                                                className="reuse-btn"
                                            >
                                                ↺ Re-use
                                            </button>
                                            <button 
                                                onClick={() => setDeletingId(gen.id)}
                                                style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,80,80,0.08)',
                                                    color: '#ff5050',
                                                    border: '1px solid rgba(255,80,80,0.15)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                                className="trash-btn"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {hasMore && (
                            <button
                                onClick={() => setShowing(prev => prev + 20)}
                                style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                    color: 'var(--muted)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    width: '100%'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                Show {filtered.length - showing} more results
                            </button>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .history-row:hover {
                    border-color: rgba(245, 197, 24, 0.25) !important;
                }
                .meta-chip {
                    display: flex;
                    alignItems: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid var(--border);
                    padding: 4px 10px;
                    borderRadius: '8px';
                    fontSize: 11px;
                    color: var(--muted);
                    white-space: nowrap;
                }
                .reuse-btn:hover {
                    background: rgba(245, 197, 24, 0.12) !important;
                    border-color: rgba(245, 197, 24, 0.4) !important;
                }
                .trash-btn:hover {
                    background: rgba(255, 80, 80, 0.14) !important;
                    border-color: rgba(255, 80, 80, 0.3) !important;
                }
                .confirm-btn {
                    width: 26px;
                    height: 26px;
                    borderRadius: 6px;
                    border: none;
                    display: flex;
                    alignItems: center;
                    justifyContent: center;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .confirm-btn.delete { background: #ff5050; color: white; }
                .confirm-btn.cancel { background: rgba(255,255,255,0.1); color: var(--text); }
                .confirm-btn:hover { opacity: 0.8; }

                @media (max-width: 768px) {
                    .history-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    .hidden.md\\:flex {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
