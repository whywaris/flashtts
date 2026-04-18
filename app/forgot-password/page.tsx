'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4cfc8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="w-full max-w-md bg-white border border-[#e5e0d8] p-10 rounded-[32px] shadow-xl shadow-[#d4cfc8]/20 relative z-10">
        <Link href="/" className="flex items-center gap-2 mb-8 no-underline group">
          <div className="text-3xl">⚡</div>
          <span className="text-2xl font-black font-['Instrument Serif'] text-[#0a0a0f] tracking-tight">FlashTTS</span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h1 className="text-2xl font-black font-['Instrument Serif'] text-[#0a0a0f] mb-3">Check your email</h1>
            <p className="text-[#6b6878] mb-6">We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.</p>
            <Link href="/login" className="text-[14px] font-bold text-[#ff4d1c] hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black font-['Instrument Serif'] text-[#0a0a0f] mb-2 tracking-tight">Forget Password</h1>
            <p className="text-[#6b6878] font-medium mb-8">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-medium">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#ff4d1c] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-[#ff4d1c]/20 disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-[#6b6878]">
              Remembered it?{' '}
              <Link href="/login" className="font-bold text-[#ff4d1c] hover:underline">Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
