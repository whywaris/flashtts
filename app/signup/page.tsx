'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px 14px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', fontSize: '14px',
        color: '#f0f0f8', outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'DM Sans, sans-serif',
    }

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '11px',
        fontWeight: 700, color: '#7a7a9a',
        marginBottom: '7px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
    }

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
            <div style={{
                minHeight: '100vh',
                background: '#080810',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'DM Sans', sans-serif",
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
            }}>

                {/* Background orbs */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                    <div style={{ position: 'absolute', width: '400px', height: '400px', background: '#f5c518', borderRadius: '50%', filter: 'blur(90px)', opacity: 0.06, top: '-100px', right: '10%' }} />
                    <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#5b8ef0', borderRadius: '50%', filter: 'blur(90px)', opacity: 0.05, bottom: '-80px', left: '20%' }} />
                </div>

                {/* Card */}
                <div style={{
                    width: '100%',
                    maxWidth: '420px',
                    background: 'rgba(255,255,255,0.045)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '40px 36px',
                    backdropFilter: 'blur(28px)',
                    position: 'relative',
                    zIndex: 1,
                }}>

                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            background: '#f5c518', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '14px', color: '#000', flexShrink: 0,
                        }}>F</div>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#f0f0f8', letterSpacing: '-0.3px' }}>
                            FlashTTS
                        </span>
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f0f0f8', marginBottom: '6px', fontFamily: 'Syne, sans-serif' }}>
                        Create your account
                    </h1>
                    <p style={{ fontSize: '13px', color: '#7a7a9a', marginBottom: '28px' }}>
                        Start free — 10,000 characters every month
                    </p>

                    <form onSubmit={handleSignup}>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                type="text" value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Waris Jamil" required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'rgba(245,197,24,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        <div style={{ marginBottom: '14px' }}>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email" value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'rgba(245,197,24,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Password</label>
                            <input
                                type="password" value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                                required minLength={8}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'rgba(245,197,24,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(240,91,91,0.1)',
                                border: '1px solid rgba(240,91,91,0.2)',
                                borderRadius: '10px', padding: '10px 14px',
                                fontSize: '13px', color: '#f05b5b',
                                marginBottom: '16px',
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '13px',
                                background: '#f5c518', color: '#000',
                                border: 'none', borderRadius: '12px',
                                fontSize: '14px', fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            {loading ? 'Creating account...' : '⚡ Get Started Free'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#7a7a9a', marginTop: '20px' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: '#f5c518', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>

                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#383858', marginTop: '14px', lineHeight: 1.5 }}>
                        By signing up you agree to our{' '}
                        <Link href="/terms" style={{ color: '#7a7a9a', textDecoration: 'underline' }}>Terms</Link>
                        {' & '}
                        <Link href="/privacy" style={{ color: '#7a7a9a', textDecoration: 'underline' }}>Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </>
    )
}