'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the token in the URL hash; the client SDK picks it up on mount
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
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

        {done ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-black font-['Instrument Serif'] text-[#0a0a0f] mb-3">Password updated!</h1>
            <p className="text-[#6b6878]">Redirecting you to your dashboard…</p>
          </div>
        ) : !ready ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🔗</div>
            <h1 className="text-2xl font-black font-['Instrument Serif'] text-[#0a0a0f] mb-3">Verifying reset link…</h1>
            <p className="text-[#6b6878] text-sm">If nothing happens, your link may have expired.<br />
              <Link href="/forgot-password" className="text-[#ff4d1c] font-bold hover:underline">Request a new one →</Link>
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black font-['Instrument Serif'] text-[#0a0a0f] mb-2 tracking-tight">Set new password</h1>
            <p className="text-[#6b6878] font-medium mb-8">Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#0a0a0f] uppercase tracking-widest pl-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-5 py-4 bg-[#fafaf8] border border-[#e5e0d8] rounded-2xl text-[14px] font-medium focus:border-[#ff4d1c] focus:ring-0 outline-none transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#0a0a0f] uppercase tracking-widest pl-1">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-5 py-4 bg-[#fafaf8] border border-[#e5e0d8] rounded-2xl text-[14px] font-medium focus:border-[#ff4d1c] focus:ring-0 outline-none transition-all"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                />
              </div>

              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-medium">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#ff4d1c] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-[#ff4d1c]/20 disabled:opacity-60"
              >
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
