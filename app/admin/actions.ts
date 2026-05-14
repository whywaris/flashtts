import { createClient } from '@supabase/supabase-js'

const PLAN_PRICES: Record<string, number> = {
  free: 0, starter: 9, creator: 19, pro: 39, studio: 79,
}

const PLAN_COLORS: Record<string, string> = {
  free: '#e5e7eb',
  starter: '#3b82f6',
  creator: '#f59e0b',
  pro: '#8b5cf6',
  studio: '#ef4444',
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export interface DashboardStats {
  total_users: number
  paid_users: number
  free_users: number
  total_chars: number
  estimated_mrr: number
  new_users_7d: number
  prev_users_7d: number
  new_paid_7d: number
  prev_paid_7d: number
}

export interface DailySignup {
  date: string
  signups: number
}

export interface PlanDistribution {
  plan: string
  count: number
  color: string
}

export interface RecentUser {
  id: string
  email: string
  full_name: string | null
  plan: string
  credits_used: number
  created_at: string
}

export interface DashboardData {
  stats: DashboardStats
  growth: DailySignup[]
  planDist: PlanDistribution[]
  recentUsers: RecentUser[]
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = createAdminClient()

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const { data: allProfiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan, credits_used, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchDashboardData error:', error.message)
    return {
      stats: {
        total_users: 0, paid_users: 0, free_users: 0,
        total_chars: 0, estimated_mrr: 0,
        new_users_7d: 0, prev_users_7d: 0,
        new_paid_7d: 0, prev_paid_7d: 0,
      },
      growth: [],
      planDist: [],
      recentUsers: [],
    }
  }

  const profiles = allProfiles ?? []

  // ── Stat metrics ─────────────────────────────────────────────────────────
  const normPlan = (p: { plan: string | null }) =>
    (p.plan || 'free').toLowerCase()

  const total_users = profiles.length
  const paid_users = profiles.filter(p => normPlan(p) !== 'free').length
  const free_users = total_users - paid_users
  const total_chars = profiles.reduce((s, p) => s + (p.credits_used || 0), 0)
  const estimated_mrr = profiles.reduce(
    (s, p) => s + (PLAN_PRICES[normPlan(p)] ?? 0), 0
  )

  const new_users_7d = profiles.filter(
    p => new Date(p.created_at) >= sevenDaysAgo
  ).length

  const prev_users_7d = profiles.filter(p => {
    const d = new Date(p.created_at)
    return d >= fourteenDaysAgo && d < sevenDaysAgo
  }).length

  const new_paid_7d = profiles.filter(
    p => new Date(p.created_at) >= sevenDaysAgo && normPlan(p) !== 'free'
  ).length

  const prev_paid_7d = profiles.filter(p => {
    const d = new Date(p.created_at)
    return d >= fourteenDaysAgo && d < sevenDaysAgo && normPlan(p) !== 'free'
  }).length

  // ── Growth chart (30-day range, fill gaps with 0) ─────────────────────────
  const dateMap = new Map<string, number>()
  for (const p of profiles) {
    const d = new Date(p.created_at)
    if (d >= thirtyDaysAgo) {
      const key = d.toISOString().split('T')[0]
      dateMap.set(key, (dateMap.get(key) ?? 0) + 1)
    }
  }

  const growth: DailySignup[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    growth.push({ date: key, signups: dateMap.get(key) ?? 0 })
  }

  // ── Plan distribution ─────────────────────────────────────────────────────
  const planCountMap = new Map<string, number>()
  for (const p of profiles) {
    const plan = normPlan(p)
    planCountMap.set(plan, (planCountMap.get(plan) ?? 0) + 1)
  }

  const planDist: PlanDistribution[] = ['free', 'starter', 'creator', 'pro', 'studio']
    .filter(plan => planCountMap.has(plan))
    .map(plan => ({
      plan,
      count: planCountMap.get(plan)!,
      color: PLAN_COLORS[plan],
    }))

  // ── Recent users ──────────────────────────────────────────────────────────
  const recentUsers: RecentUser[] = profiles.slice(0, 5).map(p => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    plan: normPlan(p),
    credits_used: p.credits_used || 0,
    created_at: p.created_at,
  }))

  return {
    stats: {
      total_users, paid_users, free_users, total_chars, estimated_mrr,
      new_users_7d, prev_users_7d, new_paid_7d, prev_paid_7d,
    },
    growth,
    planDist,
    recentUsers,
  }
}