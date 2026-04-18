'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    Music,
    Mic,
    Headphones,
    Bookmark,
    Users,
    Settings,
    CreditCard,
    Zap,
    LogOut,
    ChevronDown,
    Menu,
    X,
    Clock,
    Library,
    Flame,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Profile {
    id: string;
    full_name?: string | null;
    plan?: string | null;
    avatar_url?: string | null;
}

// ─── Nav config ──────────────────────────────────────────────────────────────
const MAIN_NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Text to Speech', icon: FileText, href: '/dashboard/tts' },
    { label: 'Voice Library', icon: Music, href: '/dashboard/library' },
    { label: 'Voice Cloning', icon: Mic, href: '/dashboard/cloning' },
    { label: 'Ebook to AudioBook', icon: Library, href: '/dashboard/audiobooks' },
    { label: 'Saved Voices', icon: Bookmark, href: '/dashboard/saved' },
    { label: 'Voice History', icon: Clock, href: '/dashboard/history' },
];

const ACCOUNT_NAV = [
    { label: 'Billing', icon: CreditCard, href: '/dashboard/billing' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    { label: 'Roast Me', icon: Flame, href: '/dashboard/roast-me' },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
function getInitials(name?: string | null, email?: string | null): string {
    if (name) {
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'U';
}

// ─── NavLink ─────────────────────────────────────────────────────────────────
function NavLink({
    href,
    icon: Icon,
    label,
    active,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
}) {
    return (
        <Link
            href={href}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 500,
                fontFamily: 'Geist, sans-serif',
                letterSpacing: '0.01em',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
                ...(active
                    ? {
                        background: 'rgba(245, 197, 24, 0.08)',
                        color: '#f5c518',
                        border: '1px solid rgba(245, 197, 24, 0.18)',
                    }
                    : {
                        color: 'var(--muted)',
                        border: '1px solid transparent',
                    }),
            }}
            className={active ? '' : 'nav-link-hover'}
        >
            <Icon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {label}
        </Link>
    );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({
    profile,
    email,
    onSignOut,
    open,
    onClose,
}: {
    profile: Profile | null;
    email: string | null;
    onSignOut: () => void;
    open: boolean;
    onClose: () => void;
}) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const displayName = profile?.full_name || email?.split('@')[0] || 'User';
    const plan = profile?.plan || 'Free';
    const initials = getInitials(profile?.full_name, email);

    return (
        <>
            {/* Overlay for mobile */}
            {open && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                    background: 'var(--sidebar-bg)',
                    backdropFilter: 'blur(25px)',
                    WebkitBackdropFilter: 'blur(25px)',
                    borderRight: '1px solid var(--sidebar-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                }}
            >
            {/* ── Logo ── */}
            <div
                style={{
                    padding: '24px 20px 20px',
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                }}
            >
                <Link
                    href="/dashboard"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        textDecoration: 'none',
                    }}
                >
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '9px',
                            background: 'linear-gradient(135deg, #f5c518 0%, #ffaa00 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 16px rgba(245,197,24,0.35)',
                            flexShrink: 0,
                        }}
                    >
                        <Zap size={17} color="#080810" strokeWidth={2.5} fill="#080810" />
                    </div>
                    <span
                        style={{
                            fontFamily: 'Instrument Serif, serif',
                            fontWeight: 800,
                            fontSize: '20px',
                            color: 'var(--text)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        FlashTTS
                    </span>
                </Link>
            </div>

            {/* ── Navigation ── */}
            <nav style={{ flex: 1, padding: '16px 12px 8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* MAIN */}
                <div>
                    <p
                        style={{
                            fontFamily: 'Geist, sans-serif',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--muted)',
                            padding: '0 12px',
                            marginBottom: '6px',
                        }}
                    >
                        Main
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {MAIN_NAV.map((item) => (
                            <NavLink
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={isActive(item.href)}
                            />
                        ))}
                    </div>
                </div>

                {/* ACCOUNT */}
                <div>
                    <p
                        style={{
                            fontFamily: 'Geist, sans-serif',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--muted)',
                            padding: '0 12px',
                            marginBottom: '6px',
                        }}
                    >
                        Account
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {ACCOUNT_NAV.map((item) => (
                            <NavLink
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={isActive(item.href)}
                            />
                        ))}
                    </div>
                </div>
            </nav>

            {/* ── User Pill ── */}
            <div
                style={{
                    padding: '12px',
                    borderTop: '1px solid var(--border)',
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                    }}
                >
                    {/* Avatar */}
                    <div
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f5c518 0%, #ff6b35 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Geist, sans-serif',
                            fontWeight: 700,
                            fontSize: '12px',
                            color: '#080810',
                            flexShrink: 0,
                        }}
                    >
                        {initials}
                    </div>

                    {/* Name + Plan */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                            style={{
                                fontFamily: 'Geist, sans-serif',
                                fontWeight: 600,
                                fontSize: '13px',
                                color: 'var(--text)',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {displayName}
                        </p>
                        <span
                            style={{
                                fontFamily: 'Geist, sans-serif',
                                fontSize: '10px',
                                fontWeight: 600,
                                color: '#f5c518',
                                background: 'rgba(245,197,24,0.1)',
                                border: '1px solid rgba(245,197,24,0.2)',
                                borderRadius: '4px',
                                padding: '1px 5px',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                            }}
                        >
                            {plan}
                        </span>
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={onSignOut}
                        title="Sign out"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            color: 'var(--muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s ease, background 0.15s ease',
                            flexShrink: 0,
                        }}
                        className="sign-out-btn"
                    >
                        <LogOut size={14} strokeWidth={2} />
                    </button>
                </div>
            </div>


        </aside>
        </>
    );
}

// ─── Background Orbs ─────────────────────────────────────────────────────────
function BackgroundOrbs() {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div
                style={{
                    position: 'absolute',
                    top: '-120px',
                    right: '-120px',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: '#f5c518',
                    filter: 'blur(90px)',
                    opacity: 0.06,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-100px',
                    left: '100px',
                    width: '380px',
                    height: '380px',
                    borderRadius: '50%',
                    background: '#5b8ef0',
                    filter: 'blur(90px)',
                    opacity: 0.06,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '-80px',
                    width: '280px',
                    height: '280px',
                    borderRadius: '50%',
                    background: '#22d3a5',
                    filter: 'blur(90px)',
                    opacity: 0.06,
                }}
            />
        </div>
    );
}

// ─── Client Layout ─────────────────────────────────────────────────────────────
export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const pathname = usePathname();

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        const supabase = createClient();

        async function loadUser() {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push('/login');
                return;
            }
            setEmail(user.email ?? null);
            setUserId(user.id);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const p = profileData as Profile;
            setProfile(p ?? null);
            
            setLoading(false);
        }

        loadUser();
    }, [router]);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: '#080810',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
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
        <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
            <BackgroundOrbs />


            {/* Mobile Header */}
            <header 
                className="md:hidden flex items-center justify-between p-4 border-b border-white/10 sticky top-0 z-30"
                style={{
                    background: 'var(--bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderColor: 'var(--border)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Zap size={16} color="#000" fill="#000" />
                    </div>
                    <span style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 800, fontSize: '18px', color: 'var(--text)' }}>FlashTTS</span>
                </div>
                <button 
                    onClick={() => setSidebarOpen(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
                >
                    <Menu size={24} />
                </button>
            </header>

            <Sidebar 
                profile={profile} 
                email={email} 
                onSignOut={handleSignOut} 
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main
                className="transition-all duration-300 md:ml-64 p-4 md:p-7"
                style={{
                    minHeight: '100vh',
                    background: 'transparent',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {children}
            </main>
        </div>
    );
}
