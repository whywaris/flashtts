'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
    Clock, 
    Search, 
    Trash2, 
    Play, 
    Download, 
    ChevronRight,
    Headphones,
    Calendar,
    Mic
} from 'lucide-react';

interface Generation {
    id: string;
    text: string;
    voice_id: string;
    voice_name: string;
    language: string;
    created_at: string;
    format: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const supabase = createClient();
    const [history, setHistory] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data, error } = await supabase
              .from('tts_jobs')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(100)

            if (error) {
              console.error('History fetch error:', error)
              // If table doesn't exist, show empty state gracefully
              setHistory([])
            } else {
              // Map text_input to text if necessary
              const mappedData = (data || []).map((item: any) => ({
                ...item,
                text: item.text_input || item.text // Supports both schemas just in case
              }));
              setHistory(mappedData)
            }
            setLoading(false);
        }
        load();
    }, [router, supabase]);

    const filtered = history.filter(g => 
        g.text.toLowerCase().includes(search.toLowerCase()) ||
        g.voice_name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this generation from history?')) return;
        
        const { error } = await supabase
            .from('tts_jobs')
            .delete()
            .eq('id', id);

        if (!error) {
            setHistory(prev => prev.filter(g => g.id !== id));
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
        <div style={{ fontFamily: 'Geist, sans-serif' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
                    History
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
                    Track and manage your generated audio content
                </p>
            </div>

            {/* Header / Search */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '24px',
                background: 'var(--card-bg)',
                padding: '12px 16px',
                borderRadius: '14px',
                border: '1px solid var(--border)'
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
                        fontSize: '14px'
                    }}
                />
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '60px 20px', 
                        background: 'var(--card-bg)', 
                        borderRadius: '20px', 
                        border: '1px solid var(--border)' 
                    }}>
                        <Clock size={40} color="var(--muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ color: 'var(--text)', margin: '0 0 8px' }}>No generations found</h3>
                        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
                            {search ? "Try a different search term" : "Start generating audio to see your history here"}
                        </p>
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
                            textDecoration: 'none'
                        }}>
                            Generate your first audio →
                        </Link>
                    </div>
                ) : (
                    filtered.map(gen => (
                        <div 
                            key={gen.id}
                            style={{
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                transition: 'all 0.2s ease',
                            }}
                            className="history-card"
                        >
                            <div style={{ 
                                width: '44px', 
                                height: '44px', 
                                borderRadius: '12px', 
                                background: 'rgba(245, 197, 24, 0.08)',
                                border: '1px solid rgba(245, 197, 24, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Headphones size={20} color="#f5c518" />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 500, 
                                    color: 'var(--text)', 
                                    margin: '0 0 4px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {gen.text}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Mic size={12} /> {gen.voice_name}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} /> {new Date(gen.created_at).toLocaleDateString()}
                                    </span>
                                    <span style={{ 
                                        fontSize: '10px', 
                                        fontWeight: 700, 
                                        color: '#f5c518',
                                        textTransform: 'uppercase',
                                        background: 'rgba(245,197,24,0.1)',
                                        padding: '1px 6px',
                                        borderRadius: '4px'
                                    }}>
                                        {gen.format}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => router.push(`/dashboard/tts?text=${encodeURIComponent(gen.text)}&voice=${gen.voice_id}`)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '10px',
                                        background: 'var(--accent)',
                                        color: '#000',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Play size={12} fill="currentColor" /> Re-use
                                </button>
                                <button 
                                    onClick={() => handleDelete(gen.id)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        background: 'rgba(255,80,80,0.08)',
                                        color: '#ff5050',
                                        border: '1px solid rgba(255,80,80,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .history-card:hover {
                    border-color: var(--accent) !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    );
}
