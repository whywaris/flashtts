import { Suspense } from 'react'
import Link from 'next/link'
import { Users, DollarSign, Zap, UserCheck, UserX, ChevronRight, FileText, Mail, Shield } from 'lucide-react'
import { fetchDashboardData, type DashboardData } from './actions'
import { GrowthChart, PlanChart } from './AdminCharts'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function trendBadge(current: number, prev: number) {
  const diff = current - prev
  const pct = prev === 0 ? (current > 0 ? 100 : 0) : Math.round(Math.abs(diff / prev) * 100)
  if (diff > 0) return { label: `+${pct}%`, cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
  if (diff < 0) return { label: `-${pct}%`, cls: 'bg-red-50 text-red-600 border-red-100' }
  return { label: '0%', cls: 'bg-gray-50 text-gray-500 border-gray-100' }
}

const PLAN_BADGE: Record<string, { bg: string; text: string }> = {
  free:    { bg: '#f3f4f6', text: '#374151' },
  starter: { bg: '#dbeafe', text: '#1d4ed8' },
  creator: { bg: '#fef3c7', text: '#92400e' },
  pro:     { bg: '#ede9fe', text: '#5b21b6' },
  studio:  { bg: '#dcfce7', text: '#166534' },
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-36 bg-gray-100 rounded-xl" />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-100 rounded-xl" />
        <div className="h-80 bg-gray-100 rounded-xl" />
      </div>
      {/* Table */}
      <div className="h-72 bg-gray-100 rounded-xl" />
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  accent: string
  icon: React.ElementType
  trend?: { label: string; cls: string }
  sub?: string
}

function StatCard({ label, value, accent, icon: Icon, trend, sub }: StatCardProps) {
  return (
    <div
      className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight leading-none">{value}</div>
      <div className="flex items-center gap-2">
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${trend.cls}`}>
            {trend.label}
          </span>
        )}
        <span className="text-[11px] text-gray-400">{sub ?? 'vs last 7d'}</span>
      </div>
    </div>
  )
}

// ── Dashboard Content (async server component) ────────────────────────────────

async function DashboardContent() {
  let data: DashboardData
  try {
    data = await fetchDashboardData()
  } catch {
    data = {
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

  const { stats, growth, planDist, recentUsers } = data

  const userTrend   = trendBadge(stats.new_users_7d, stats.prev_users_7d)
  const paidTrend   = trendBadge(stats.new_paid_7d, stats.prev_paid_7d)
  const convRate    = stats.total_users > 0
    ? Math.round((stats.paid_users / stats.total_users) * 100)
    : 0

  const statCards: StatCardProps[] = [
    {
      label: 'Total Users',
      value: fmtNumber(stats.total_users),
      accent: '#3b82f6',
      icon: Users,
      trend: userTrend,
    },
    {
      label: 'Paid Users',
      value: fmtNumber(stats.paid_users),
      accent: '#f5c518',
      icon: UserCheck,
      trend: paidTrend,
    },
    {
      label: 'Free Users',
      value: fmtNumber(stats.free_users),
      accent: '#6b7280',
      icon: UserX,
      sub: `${convRate}% conversion`,
    },
    {
      label: 'Chars Generated',
      value: fmtNumber(stats.total_chars),
      accent: '#8b5cf6',
      icon: Zap,
      sub: 'all time',
    },
    {
      label: 'Est. MRR',
      value: `$${fmtNumber(stats.estimated_mrr)}`,
      accent: '#10b981',
      icon: DollarSign,
      sub: `$${fmtNumber(stats.estimated_mrr * 12)} ARR`,
    },
  ]

  return (
    <div className="space-y-8">

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">User Growth</h3>
            <p className="text-xs text-gray-400 mt-0.5">New signups — last 30 days</p>
          </div>
          <GrowthChart data={growth} />
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Plan Distribution</h3>
            <p className="text-xs text-gray-400 mt-0.5">Users by subscription tier</p>
          </div>
          <PlanChart data={planDist} />
        </div>

      </div>

      {/* ── Bottom Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Users Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recent Signups</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 5 registrations</p>
            </div>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs font-semibold text-[#f5c518] hover:opacity-80 transition-opacity no-underline"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">No users yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Credits Used</th>
                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentUsers.map((user, i) => {
                    const badge = PLAN_BADGE[user.plan] ?? PLAN_BADGE.free
                    return (
                      <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                              {(user.full_name?.[0] ?? user.email[0]).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate leading-tight">
                                {user.full_name || 'Anonymous'}
                              </div>
                              <div className="text-xs text-gray-400 truncate max-w-[180px]">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                            style={{ background: badge.bg, color: badge.text }}
                          >
                            {user.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700 font-medium tabular-nums">
                          {fmtNumber(user.credits_used)}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-gray-400">
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 px-1">Quick Actions</h3>
          {[
            { label: 'Write Blog Post', href: '/admin/blog', icon: FileText },
            { label: 'Send Broadcast', href: '/admin/emails', icon: Mail },
            { label: 'Review Abuse Reports', href: '/admin/abuse', icon: Shield },
          ].map(({ label, href, icon: Icon }, i) => (
              <Link
                key={i}
                href={href}
                className="flex items-center justify-between px-4 py-3.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-[#f5c518]/50 hover:shadow-md transition-all group no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Icon size={15} className="text-[#f5c518]" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-[#f5c518] group-hover:translate-x-0.5 transition-all" />
              </Link>
          ))}

          {/* Revenue snapshot */}
          <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Revenue by Plan</h4>
            <div className="space-y-2.5">
              {planDist.filter(p => p.plan !== 'free').map((p) => {
                const PRICES: Record<string, number> = { starter: 9, creator: 19, pro: 39, studio: 79 }
                const rev = p.count * (PRICES[p.plan] ?? 0)
                const maxRev = Math.max(...planDist.filter(x => x.plan !== 'free').map(x => x.count * (PRICES[x.plan] ?? 0)), 1)
                return (
                  <div key={p.plan}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 capitalize">{p.plan}</span>
                      <span className="text-gray-500 font-semibold">${fmtNumber(rev)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.round((rev / maxRev) * 100)}%`, background: p.color }}
                      />
                    </div>
                  </div>
                )
              })}
              {planDist.filter(p => p.plan !== 'free').length === 0 && (
                <p className="text-xs text-gray-400">No paid users yet</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <DashboardContent />
    </Suspense>
  )
}