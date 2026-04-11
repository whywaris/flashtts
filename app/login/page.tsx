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

    async function handleGoogleLogin() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
        if (error) alert(error.message)
    }

    return (
        <div className="min-h-screen bg-[#faf8f3] flex flex-col items-center justify-center p-6 relative">
            {/* Background Texture Placeholder */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4cfc8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="w-full max-w-md bg-white border border-[#e5e0d8] p-10 rounded-[32px] shadow-xl shadow-[#d4cfc8]/20 relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 mb-8 no-underline group">
                    <div className="text-3xl">⚡</div>
                    <span className="text-2xl font-black font-['Instrument Serif'] text-[#0a0a0f] tracking-tight">FlashTTS</span>
                </Link>

                <h1 className="text-3xl font-black font-['Instrument Serif'] text-[#0a0a0f] mb-2 tracking-tight">Welcome back</h1>
                <p className="text-[#6b6878] font-medium mb-8">Access your pro audio workspace.</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-[#0a0a0f] uppercase tracking-widest pl-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-5 py-4 bg-[#fafaf8] border border-[#e5e0d8] rounded-2xl text-[14px] font-medium focus:border-[#ff4d1c] focus:ring-0 outline-none transition-all"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[11px] font-black text-[#0a0a0f] uppercase tracking-widest">Password</label>
                            <Link href="/forgot-password" className="text-[11px] font-bold text-[#6b6878] hover:text-[#ff4d1c] transition-colors">Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            className="w-full px-5 py-4 bg-[#fafaf8] border border-[#e5e0d8] rounded-2xl text-[14px] font-medium focus:border-[#ff4d1c] focus:ring-0 outline-none transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-medium">{error}</div>}

                    <button type="submit" className="w-full py-5 bg-[#ff4d1c] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-[#ff4d1c]/20" disabled={loading}>
                        {loading ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-[#e5e0d8]" />
                    <span className="text-[10px] font-black text-[#d4cfc8] uppercase tracking-[0.2em]">OR</span>
                    <div className="flex-1 h-px bg-[#e5e0d8]" />
                </div>

                <button type="button" onClick={handleGoogleLogin} className="w-full py-4 bg-white border border-[#e5e0d8] rounded-2xl font-bold text-sm text-[#0a0a0f] hover:bg-[#fafaf8] transition-all flex items-center justify-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.2-2.7-.4-4z"/>
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.4l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
                        <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41 35.8 44 30.3 44 24c0-1.3-.2-2.7-.4-4z"/>
                    </svg>
                    Continue with Google
                </button>

                <p className="mt-8 text-center text-[13px] text-[#6b6878] font-medium">
                    New here?{' '}
                    <Link href="/signup" className="text-[#ff4d1c] font-black hover:underline underline-offset-4 ml-1 transition-all">Create an account</Link>
                </p>
            </div>
        </div>
    )
}