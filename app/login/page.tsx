'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
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
                            background: '#f5c518',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '14px', color: '#000',
                            flexShrink: 0,
                        }}>F</div>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#f0f0f8', letterSpacing: '-0.3px' }}>
                            FlashTTS
                        </span>
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f0f0f8', marginBottom: '6px', fontFamily: 'Syne, sans-serif' }}>
                        Welcome back
                    </h1>
                    <p style={{ fontSize: '13px', color: '#7a7a9a', marginBottom: '28px' }}>
                        Sign in to your FlashTTS account
                    </p>

                    <form onSubmit={handleLogin}>
                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7a7a9a', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px', fontSize: '14px',
                                    color: '#f0f0f8', outline: 'none',
                                    boxSizing: 'border-box',
                                    fontFamily: 'DM Sans, sans-serif',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(245,197,24,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Password
                                </label>
                                <Link href="/forgot-password" style={{ fontSize: '12px', color: '#f5c518', textDecoration: 'none' }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px', fontSize: '14px',
                                    color: '#f0f0f8', outline: 'none',
                                    boxSizing: 'border-box',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(245,197,24,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        {/* Error */}
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

                        {/* Submit */}
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
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {loading ? 'Signing in...' : '⚡ Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#7a7a9a', marginTop: '20px' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" style={{ color: '#f5c518', fontWeight: 600, textDecoration: 'none' }}>
                            Sign up free
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}