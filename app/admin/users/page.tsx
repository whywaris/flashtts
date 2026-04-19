'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, Mail, X, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  full_name: string
  plan: string
  credits_used: number
  credits_limit: number
  created_at: string
  is_banned: boolean
  banned_reason?: string
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

const PLANS = ['All', 'free', 'starter', 'creator', 'pro', 'studio']
const STATUSES = ['All', 'Active', 'Banned']

const PLAN_LIMITS: Record<string, number> = {
  free: 10000,
  starter: 200000,
  creator: 500000,
  pro: 1000000,
  studio: 3000000,
}

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  free:    { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
  starter: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
  creator: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  pro:     { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  studio:  { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
}

export default function UsersManager() {
  const supabase = createClient() // still used for fetching users list

  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Per-row plan override state
  const [pendingPlans, setPendingPlans] = useState<Record<string, string>>({})
  const [planStatus, setPlanStatus] = useState<Record<string, SaveStatus>>({})

  // Per-row credit limit override state
  const [pendingCredits, setPendingCredits] = useState<Record<string, string>>({})
  const [creditStatus, setCreditStatus] = useState<Record<string, SaveStatus>>({})

  // Ban modal
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banReason, setBanReason] = useState('')

  // Status auto-reset timers
  const planTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const creditTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    fetchUsers()
    return () => {
      Object.values(planTimers.current).forEach(clearTimeout)
      Object.values(creditTimers.current).forEach(clearTimeout)
    }
  }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, plan, credits_used, credits_limit, created_at, is_banned, banned_reason')
      .order('created_at', { ascending: false })
    if (data) {
      setUsers(data)
      // Seed pending credit inputs with current limits
      const creditMap: Record<string, string> = {}
      data.forEach((u: UserProfile) => { creditMap[u.id] = String(u.credits_limit ?? PLAN_LIMITS[u.plan] ?? 10000) })
      setPendingCredits(creditMap)
    }
    setLoading(false)
  }

  // ── Shared admin API helper ───────────────────────────────────────────────
  async function adminUpdate(userId: string, action: string, payload: Record<string, unknown>) {
    const res = await fetch('/api/admin/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, payload }),
    })
    const json = await res.json()
    return { ok: res.ok, data: json, error: res.ok ? null : (json.error || 'Failed') }
  }

  // ── Plan override ─────────────────────────────────────────────────────────
  async function handleSavePlan(userId: string) {
    const newPlan = pendingPlans[userId]
    if (!newPlan) return
    const newLimit = PLAN_LIMITS[newPlan] ?? 10000

    setPlanStatus(s => ({ ...s, [userId]: 'saving' }))
    const { ok } = await adminUpdate(userId, 'update_plan', { plan: newPlan })

    if (!ok) {
      setPlanStatus(s => ({ ...s, [userId]: 'error' }))
    } else {
      setUsers(us => us.map(u => u.id === userId ? { ...u, plan: newPlan, credits_limit: newLimit } : u))
      setPendingPlans(p => { const n = { ...p }; delete n[userId]; return n })
      setPendingCredits(c => ({ ...c, [userId]: String(newLimit) }))
      setPlanStatus(s => ({ ...s, [userId]: 'success' }))
    }

    clearTimeout(planTimers.current[userId])
    planTimers.current[userId] = setTimeout(() =>
      setPlanStatus(s => ({ ...s, [userId]: 'idle' })), 2000)
  }

  // ── Credit limit override ─────────────────────────────────────────────────
  async function handleSaveCredit(userId: string) {
    const raw = pendingCredits[userId] ?? ''
    const val = parseInt(raw, 10)
    if (isNaN(val) || val <= 0 || val > 999999999) return

    setCreditStatus(s => ({ ...s, [userId]: 'saving' }))
    const { ok } = await adminUpdate(userId, 'update_credits', { credits_limit: val })

    if (!ok) {
      setCreditStatus(s => ({ ...s, [userId]: 'error' }))
    } else {
      setUsers(us => us.map(u => u.id === userId ? { ...u, credits_limit: val } : u))
      setCreditStatus(s => ({ ...s, [userId]: 'success' }))
    }

    clearTimeout(creditTimers.current[userId])
    creditTimers.current[userId] = setTimeout(() =>
      setCreditStatus(s => ({ ...s, [userId]: 'idle' })), 2000)
  }

  // ── Ban / Unban ───────────────────────────────────────────────────────────
  async function handleBan(userId: string) {
    const { ok } = await adminUpdate(userId, 'ban', { is_banned: true, banned_reason: banReason })
    if (ok) {
      setUsers(us => us.map(u => u.id === userId ? { ...u, is_banned: true, banned_reason: banReason } : u))
      setShowBanModal(false)
      setBanReason('')
    }
  }

  async function handleUnban(userId: string) {
    const { ok } = await adminUpdate(userId, 'ban', { is_banned: false })
    if (ok) {
      setUsers(us => us.map(u => u.id === userId ? { ...u, is_banned: false } : u))
    }
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q)
    const matchPlan = filterPlan === 'All' || u.plan?.toLowerCase() === filterPlan.toLowerCase()
    const matchStatus = filterStatus === 'All' || (filterStatus === 'Banned' ? u.is_banned : !u.is_banned)
    return matchSearch && matchPlan && matchStatus
  })

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280', fontFamily: 'Geist, sans-serif' }}>
      Loading users...
    </div>
  )

  return (
    <div style={{ fontFamily: 'Geist, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: 0, fontFamily: 'Syne, sans-serif' }}>Users Directory</h1>
            <span style={{ background: '#f5c518', color: '#111', fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>
              {filtered.length} MEMBERS
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Plan & credit overrides, ban controls.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '13px', outline: 'none', color: '#111', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          style={{ padding: '10px 14px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#374151', outline: 'none', cursor: 'pointer' }}
        >
          {PLANS.map(p => <option key={p} value={p}>{p === 'All' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '10px 14px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#374151', outline: 'none', cursor: 'pointer' }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e5e5e5' }}>
                {['User', 'Plan', 'Credit Limit', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const planColor = PLAN_COLORS[user.plan] || PLAN_COLORS.free
                const currentLimit = user.credits_limit ?? PLAN_LIMITS[user.plan] ?? 10000
                const pendingPlan = pendingPlans[user.id]
                const pStatus = planStatus[user.id] ?? 'idle'
                const cStatus = creditStatus[user.id] ?? 'idle'
                const creditVal = pendingCredits[user.id] ?? String(currentLimit)

                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >

                    {/* Col 1 — User */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3f4f6', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: '#111', flexShrink: 0 }}>
                          {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                            {user.full_name || 'Anonymous'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Col 2 — Plan dropdown + Save */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <select
                          value={pendingPlan ?? user.plan ?? 'free'}
                          onChange={e => setPendingPlans(p => ({ ...p, [user.id]: e.target.value }))}
                          style={{
                            padding: '5px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                            background: planColor.bg, color: planColor.text, border: `1px solid ${planColor.border}`,
                            outline: 'none', cursor: 'pointer', textTransform: 'capitalize',
                          }}
                        >
                          {PLANS.filter(p => p !== 'All').map(p => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                          ))}
                        </select>

                        {pendingPlan && pendingPlan !== user.plan && (
                          <button
                            onClick={() => handleSavePlan(user.id)}
                            disabled={pStatus === 'saving'}
                            style={{ padding: '4px 10px', background: '#f5c518', color: '#111', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {pStatus === 'saving' ? '...' : 'Save'}
                          </button>
                        )}
                        {pStatus === 'success' && <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>✓ Updated</span>}
                        {pStatus === 'error'   && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>✗ Failed</span>}
                      </div>
                    </td>

                    {/* Col 3 — Credit limit input */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min={1}
                          max={999999999}
                          value={creditVal}
                          onChange={e => setPendingCredits(c => ({ ...c, [user.id]: e.target.value }))}
                          onBlur={() => handleSaveCredit(user.id)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveCredit(user.id) }}
                          style={{ width: '110px', padding: '5px 8px', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '12px', color: '#111', outline: 'none' }}
                        />
                        {cStatus === 'saving'  && <span style={{ fontSize: '11px', color: '#6b7280' }}>...</span>}
                        {cStatus === 'success' && <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>✓ Saved</span>}
                        {cStatus === 'error'   && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>✗ Failed</span>}
                      </div>
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>
                        Used: {(user.credits_used ?? 0).toLocaleString()} / {currentLimit.toLocaleString()}
                      </div>
                    </td>

                    {/* Col 4 — Joined */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>
                      {new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Col 5 — Status badge */}
                    <td style={{ padding: '14px 16px' }}>
                      {user.is_banned ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
                          <AlertCircle size={9} strokeWidth={3} /> Banned
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                          <CheckCircle2 size={9} strokeWidth={3} /> Active
                        </span>
                      )}
                    </td>

                    {/* Col 6 — Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Link
                          href={`/admin/emails?to=${user.email}`}
                          title="Send email"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3f4f6', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none' }}
                        >
                          <Mail size={14} />
                        </Link>

                        {user.is_banned ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            title="Unban"
                            style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #22c55e', borderRadius: '8px', color: '#166534', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedUser(user.id); setShowBanModal(true) }}
                            title="Ban user"
                            style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>No users found</div>
            </div>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e5e5e5', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: '0 0 2px', fontFamily: 'Syne, sans-serif' }}>Ban User</h2>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>This will suspend their access immediately.</p>
              </div>
              <button onClick={() => setShowBanModal(false)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <X size={15} />
              </button>
            </div>

            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>Reason</label>
            <textarea
              placeholder="Why are you banning this user?"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              style={{ width: '100%', height: '100px', padding: '10px 12px', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '13px', resize: 'none', outline: 'none', color: '#111', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => setShowBanModal(false)}
                style={{ flex: 1, padding: '11px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBan(selectedUser!)}
                disabled={!banReason.trim()}
                style={{ flex: 1, padding: '11px', background: '#111', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: banReason.trim() ? 'pointer' : 'not-allowed', opacity: banReason.trim() ? 1 : 0.4 }}
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
