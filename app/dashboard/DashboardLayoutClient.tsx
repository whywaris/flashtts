'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, FileText, Music, Mic, Bookmark,
    Settings, CreditCard, Zap, LogOut, Menu,
    Clock, Library, MessageSquare, Sun, Moon,
} from 'lucide-react';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { createClient } from '@/utils/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Profile {
    id: string;
    full_name?: string | null;
    plan?: string | null;
    credits_used?: number;
    credits_limit?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const SIDEBAR_W  = 240;
const ACCENT     = '#2DD4BF'; // same in both themes, used for SVG icon color props

// ─── Nav Config ──────────────────────────────────────────────────────────────
const MAIN_NAV = [
    { label: 'Dashboard',      icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Text to Speech', icon: FileText,         href: '/dashboard/tts' },
    { label: 'Voice Library',  icon: Music,            href: '/dashboard/library' },
    { label: 'Voice Cloning',  icon: Mic,              href: '/dashboard/cloning' },
    { label: 'ebook to Audiobook', icon: Library,      href: '/dashboard/audiobooks' },
    { label: 'Saved Voices',   icon: Bookmark,         href: '/dashboard/saved' },
    { label: 'History',        icon: Clock,            href: '/dashboard/history' },
];

const BOTTOM_NAV = [
    { label: 'Billing',   icon: CreditCard,    href: '/dashboard/billing' },
    { label: 'Settings',  icon: Settings,      href: '/dashboard/settings' },
    { label: 'Feedback',  icon: MessageSquare, href: '/dashboard/roast-me' },
];

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
    '/dashboard':           { title: 'Dashboard',      sub: 'Welcome back to your workspace' },
    '/dashboard/tts':       { title: 'Text to Speech', sub: 'Convert text into natural speech' },
    '/dashboard/library':   { title: 'Voice Library',  sub: 'Explore and preview all voices' },
    '/dashboard/cloning':   { title: 'Voice Cloning',  sub: 'Clone and manage your voices' },
    '/dashboard/audiobooks':{ title: 'ebook to Audiobook', sub: 'Convert ebooks to audio' },
    '/dashboard/saved':     { title: 'Saved Voices',   sub: 'Your favourite voice collection' },
    '/dashboard/history':   { title: 'History',        sub: 'Past generations' },
    '/dashboard/billing':   { title: 'Billing',        sub: 'Plan and usage' },
    '/dashboard/settings':  { title: 'Settings',       sub: 'Account preferences' },
    '/dashboard/roast-me':  { title: 'Feedback',       sub: 'Share your thoughts' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name?: string | null, email?: string | null): string {
    if (name) {
        const p = name.trim().split(' ');
        return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : 'U';
}

function fmtNum(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
}

// ─── NavItem ─────────────────────────────────────────────────────────────────
function NavItem({ href, icon: Icon, label, active }: {
    href: string; icon: React.ElementType; label: string; active: boolean;
}) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: active ? 600 : 450,
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.005em',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--muted)',
                    position: 'relative',
                }}
                className={active ? '' : 'dash-nav-item'}
            >
                {active && (
                    <div style={{
                        position: 'absolute',
                        left: 0, top: '50%',
                        transform: 'translateY(-50%)',
                        width: '2.5px',
                        height: '18px',
                        borderRadius: '0 2px 2px 0',
                        background: 'var(--accent)',
                    }} />
                )}
                <Icon size={18} strokeWidth={active ? 2 : 1.7} style={{ flexShrink: 0 }} />
                {label}
            </div>
        </Link>
    );
}

// ─── NavGroup Label ──────────────────────────────────────────────────────────
function GroupLabel({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            fontSize: '12.5px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--faint)',
            padding: '0 12px',
            marginBottom: '6px',
            fontFamily: 'Inter, sans-serif',
        }}>
            {children}
        </div>
    );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ profile, email, onSignOut, open, onClose }: {
    profile: Profile | null;
    email: string | null;
    onSignOut: () => void;
    open: boolean;
    onClose: () => void;
}) {
    const pathname = usePathname();
    const isActive = (href: string) =>
        href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

    const name   = profile?.full_name || email?.split('@')[0] || 'User';
    const plan   = (profile?.plan || 'free').charAt(0).toUpperCase() + (profile?.plan || 'free').slice(1);
    const avatar = initials(profile?.full_name, email);

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 40,
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(6px)',
                    }}
                    className="md:hidden"
                />
            )}

            <aside
                style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    height: '100dvh',
                    width: `${SIDEBAR_W}px`,
                    background: 'var(--sidebar-bg)',
                    borderRight: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 50,
                    transform: open ? 'translateX(0)' : undefined,
                    transition: 'transform 0.25s ease, background 0.2s ease, border-color 0.2s ease',
                }}
                className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                {/* ── Logo ── */}
                <div style={{
                    padding: '18px 14px 16px',
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <div style={{
                            width: '28px', height: '28px',
                            borderRadius: '7px',
                            background: 'linear-gradient(135deg, #2DD4BF 0%, #0d9488 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 14px rgba(45,212,191,0.25)',
                            flexShrink: 0,
                        }}>
                            <Zap size={14} color="#0A0A0F" strokeWidth={2.5} fill="#0A0A0F" />
                        </div>
                        <span style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            fontSize: '17px',
                            color: 'var(--text)',
                            letterSpacing: '-0.025em',
                        }}>
                            FlashTTS
                        </span>
                    </Link>
                </div>

                {/* ── Nav ── */}
                <nav style={{
                    flex: 1,
                    padding: '16px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '26px',
                    overflowY: 'auto',
                }}>
                    {/* Main */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <GroupLabel>Menu</GroupLabel>
                        {MAIN_NAV.map(item => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={isActive(item.href)}
                            />
                        ))}
                    </div>

                    {/* Account */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <GroupLabel>Account</GroupLabel>
                        {BOTTOM_NAV.map(item => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={isActive(item.href)}
                            />
                        ))}
                    </div>
                </nav>

                {/* ── User Card ── */}
                <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        padding: '9px 10px',
                        borderRadius: '10px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: '30px', height: '30px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #2DD4BF 0%, #0d9488 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700, fontSize: '11px',
                            color: '#0A0A0F',
                            flexShrink: 0,
                            letterSpacing: '-0.02em',
                        }}>
                            {avatar}
                        </div>

                        {/* Name + Plan */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 600, fontSize: '13.5px',
                                color: 'var(--text)', margin: 0,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {name}
                            </p>
                            <p style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '11.5px', fontWeight: 500,
                                color: ACCENT, margin: '1px 0 0',
                            }}>
                                {plan} plan
                            </p>
                        </div>

                        {/* Sign out */}
                        <button
                            onClick={onSignOut}
                            title="Sign out"
                            style={{
                                background: 'none', border: 'none',
                                cursor: 'pointer', padding: '4px',
                                borderRadius: '6px',
                                color: 'var(--muted)',
                                display: 'flex', alignItems: 'center',
                                transition: 'all 0.15s ease',
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = '#f87171';
                                e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = 'var(--muted)';
                                e.currentTarget.style.background = 'none';
                            }}
                        >
                            <LogOut size={15} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

// ─── Credits Chip ─────────────────────────────────────────────────────────────
function CreditsChip({ profile }: { profile: Profile | null }) {
    const used      = profile?.credits_used  ?? 0;
    const limit     = profile?.credits_limit ?? 10000;
    const remaining = Math.max(0, limit - used);
    const pct       = Math.min(100, (used / limit) * 100);
    const low       = pct > 80;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'var(--card-bg)',
            border: `1px solid ${low ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
            fontFamily: 'Inter, sans-serif',
            transition: 'background 0.2s ease',
        }}>
            <Zap size={12} color={low ? '#f87171' : ACCENT} fill={low ? '#f87171' : ACCENT} />
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: low ? '#f87171' : ACCENT }}>
                {fmtNum(remaining)}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 400 }}>
                credits left
            </span>
        </div>
    );
}

// ─── Background Orbs (dark mode only) ────────────────────────────────────────
function Orbs() {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', top: '-160px', right: '-80px',
                width: '440px', height: '440px', borderRadius: '50%',
                background: '#2DD4BF', filter: 'blur(110px)', opacity: 0.03,
            }} />
            <div style={{
                position: 'absolute', bottom: '-80px', left: '160px',
                width: '340px', height: '340px', borderRadius: '50%',
                background: '#818cf8', filter: 'blur(110px)', opacity: 0.03,
            }} />
        </div>
    );
}

// ─── Theme Toggle Button ──────────────────────────────────────────────────────
function ThemeToggleBtn({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
                width: '36px', height: '36px',
                borderRadius: '8px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--muted)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
            }}
            className="theme-toggle-btn"
        >
            {theme === 'dark'
                ? <Sun  size={15} strokeWidth={2} />
                : <Moon size={15} strokeWidth={2} />
            }
        </button>
    );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const router   = useRouter();
    const pathname = usePathname();
    const [profile,     setProfile]     = useState<Profile | null>(null);
    const [email,       setEmail]       = useState<string | null>(null);
    const [loading,     setLoading]     = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme,       setTheme]       = useState<'light' | 'dark'>('light');

    // ── Theme: restore from localStorage ────────────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem('flashtts_theme') as 'light' | 'dark' | null;
        if (saved === 'dark' || saved === 'light') setTheme(saved);
    }, []);

    // ── Theme: apply data-theme to <html> and persist ────────────────────────
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('flashtts_theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    // Close mobile sidebar on navigation
    useEffect(() => { setSidebarOpen(false); }, [pathname]);

    useEffect(() => {
        const supabase = createClient();
        async function load() {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) { router.push('/login'); return; }
            setEmail(user.email ?? null);

            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, plan, credits_used, credits_limit')
                .eq('id', user.id)
                .single();

            setProfile((data as Profile) ?? null);
            setLoading(false);
        }
        load();
    }, [router]);

    const handleSignOut = async () => {
        await createClient().auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    width: '32px', height: '32px',
                    border: `2.5px solid var(--accent-dim)`,
                    borderTop: `2.5px solid ${ACCENT}`,
                    borderRadius: '50%',
                    animation: 'spin 0.65s linear infinite',
                }} />
            </div>
        );
    }

    const page = PAGE_TITLES[pathname];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', transition: 'background 0.2s ease' }}>
            {theme === 'dark' && <Orbs />}

            {/* ── Sidebar ── */}
            <Sidebar
                profile={profile}
                email={email}
                onSignOut={handleSignOut}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* ── Main Content ── */}
            <main
                style={{
                    minHeight: '100vh',
                    position: 'relative',
                    zIndex: 1,
                    marginLeft: 0,
                }}
                className="md:!ml-[240px]"
            >
                <AnnouncementBanner />

                {/* Top Bar */}
                {page && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '24px 28px 0',
                        flexWrap: 'wrap',
                        gap: '12px',
                    }}>
                        {/* Mobile hamburger + page title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                style={{
                                    display: 'none', background: 'var(--card-bg)',
                                    border: '1px solid var(--border)', borderRadius: '8px',
                                    width: '36px', height: '36px', cursor: 'pointer',
                                    alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--muted)', flexShrink: 0,
                                }}
                                className="mob-menu-btn"
                            >
                                <Menu size={16} />
                            </button>

                            <div>
                                <h1 style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '22px',
                                    fontWeight: 700,
                                    color: 'var(--text)',
                                    margin: 0,
                                    letterSpacing: '-0.025em',
                                }}>
                                    {page.title}
                                </h1>
                                <p style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '13px',
                                    color: 'var(--muted)',
                                    margin: '3px 0 0',
                                    fontWeight: 400,
                                }}>
                                    {page.sub}
                                </p>
                            </div>
                        </div>

                        {/* Right: theme toggle + credits */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ThemeToggleBtn theme={theme} onToggle={toggleTheme} />
                            <CreditsChip profile={profile} />
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <div style={{ padding: '20px 28px 40px' }}>
                    {children}
                </div>
            </main>

            <style>{`
                .dash-nav-item:hover {
                    background: var(--hover) !important;
                    color: var(--text) !important;
                }
                .theme-toggle-btn:hover {
                    border-color: var(--accent) !important;
                    color: var(--accent) !important;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                nav::-webkit-scrollbar { width: 0; }
                @media (max-width: 768px) {
                    .mob-menu-btn { display: flex !important; }
                }
            `}</style>
        </div>
    );
}
