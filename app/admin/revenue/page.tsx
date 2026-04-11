'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  DollarSign, TrendingUp, Users, 
  ArrowUpRight, ArrowDownRight, 
  Calendar, PieChart, BarChart2,
  Activity, Info
} from 'lucide-react'

interface RevenueStats {
  mrr: number
  arr: number
  paidUsers: number
  churnRate: number
  arpu: number
}

interface PlanStats {
  name: string
  users: number
  revenue: number
  percentage: number
}

const PLAN_PRICES: any = {
  Starter: 15,
  Creator: 29,
  Star: 39,
  Pro: 49,
  Agency: 79,
  Free: 0
}

export default function RevenueDashboard() {
  const [stats, setStats] = useState<RevenueStats>({ mrr: 0, arr: 0, paidUsers: 0, churnRate: 5.2, arpu: 0 })
  const [planBreakdown, setPlanBreakdown] = useState<PlanStats[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('28d')

  useEffect(() => {
    fetchRevenueData()
  }, [period])

  async function fetchRevenueData() {
    const supabase = createClient()
    const { data: profiles } = await supabase.from('profiles').select('plan')
    
    if (profiles) {
      const counts: any = { Free: 0, Starter: 0, Creator: 0, Star: 0, Pro: 0, Agency: 0 }
      profiles.forEach(p => {
        const plan = p.plan || 'Free'
        if (counts[plan] !== undefined) counts[plan]++
        else counts.Free++
      })

      const breakdown: PlanStats[] = Object.keys(counts).map(name => {
        const users = counts[name]
        const revenue = users * (PLAN_PRICES[name] || 0)
        return { name, users, revenue, percentage: 0 }
      })

      const totalRevenue = breakdown.reduce((acc, curr) => acc + curr.revenue, 0)
      const paidUsersCount = profiles.filter(p => p.plan && p.plan !== 'Free').length

      const finalBreakdown = breakdown.map(b => ({
        ...b,
        percentage: totalRevenue > 0 ? (b.revenue / totalRevenue) * 100 : 0
      }))

      setPlanBreakdown(finalBreakdown)
      setStats({
        mrr: totalRevenue,
        arr: totalRevenue * 12,
        paidUsers: paidUsersCount,
        churnRate: 5.2,
        arpu: paidUsersCount > 0 ? totalRevenue / paidUsersCount : 0
      })
    }
    setLoading(false)
  }

  if (loading) return <div className="text-gray-400 font-medium">Analyzing financial data...</div>

  const getPlanStyle = (name: string) => {
     const n = name.toLowerCase()
     if (n === 'starter') return 'bg-blue-500'
     if (n === 'creator') return 'bg-amber-500'
     if (n === 'star') return 'bg-yellow-400'
     if (n === 'pro') return 'bg-purple-500'
     if (n === 'agency') return 'bg-emerald-500'
     return 'bg-gray-300'
  }

  const statCards = [
    { label: 'MRR', value: `$${stats.mrr.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', isUp: true },
    { label: 'ARR', value: `$${stats.arr.toLocaleString()}`, icon: TrendingUp, trend: '+8.2%', isUp: true },
    { label: 'Paid Users', value: stats.paidUsers.toLocaleString(), icon: Users, trend: '+4.1%', isUp: true },
    { label: 'Churn Rate', value: `${stats.churnRate}%`, icon: Activity, trend: '-0.4%', isUp: false },
    { label: 'ARPU', value: `$${stats.arpu.toFixed(2)}`, icon: PieChart, trend: '+2.1%', isUp: true },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-black font-['Syne'] tracking-tight m-0 text-[#111827]">Revenue Insights</h1>
           <p className="text-[#6b7280] text-[13px] font-medium mt-1 uppercase tracking-wider">Financial Performance Matrix</p>
        </div>
        
        <div className="flex items-center gap-1 p-1 bg-white border border-[#e9ecef] rounded-full shadow-sm">
          {['24h', '7d', '28d', '3m', '6m', '1y'].map(p => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-full transition-all ${
                period === p ? 'bg-[#1a1a2e] text-white shadow-lg shadow-navy/20' : 'text-[#6b7280] hover:text-[#111827] hover:bg-[#f8f9fa]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="bg-white p-6 rounded-[24px] border border-[#e9ecef] shadow-sm hover:translate-y-[-4px] transition-all group">
               <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center text-[#111827] group-hover:bg-[#1a1a2e] group-hover:text-white transition-all">
                     <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <div className={`text-[10px] font-black flex items-center gap-0.5 px-2 py-1 rounded-full ${card.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                     {card.isUp ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                     {card.trend}
                  </div>
               </div>
               <div>
                  <div className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mb-2 px-1">{card.label}</div>
                  <div className="text-2xl font-black font-['Syne'] tracking-tight text-[#111827]">{card.value}</div>
               </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Plan Breakdown Table */}
        <div className="xl:col-span-2 bg-white rounded-[24px] border border-[#e9ecef] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-[#e9ecef] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black font-['Syne'] m-0 text-[#111827]">Tier Distribution</h3>
              <p className="text-[11px] text-[#6b7280] font-bold uppercase tracking-wider mt-1">Growth across subscription levels</p>
            </div>
            <button className="text-[#9ca3af] hover:text-[#111827] transition-colors">
               <Info size={18} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f9fafb]">
                  <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">Subscription Tier</th>
                  <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">Subscribers</th>
                  <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">Monthly Revenue</th>
                  <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider text-right">Dominance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9ecef]">
                {planBreakdown.map((plan) => (
                  <tr key={plan.name} className="hover:bg-[#fcfdfe] transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full ${getPlanStyle(plan.name)} shadow-[0_0_8px_currentColor] animate-pulse`} />
                          <span className="text-[14px] font-black text-[#111827] uppercase tracking-tight">{plan.name}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="text-[13px] font-bold text-[#374151]">
                          {plan.users.toLocaleString()} <span className="text-[11px] text-[#9ca3af] font-medium uppercase">Active</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-[14px] font-black text-[#111827]">
                       ${plan.revenue.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 min-w-[180px]">
                      <div className="flex items-center justify-end gap-5">
                        <div className="flex-1 h-1.5 bg-[#f1f3f5] rounded-full overflow-hidden max-w-[100px]">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${getPlanStyle(plan.name)}`}
                            style={{ width: `${plan.percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-black text-[#111827] w-12 text-right">{plan.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7-Day Revenue Trend (Mock Bar Chart) */}
        <div className="bg-white rounded-[24px] border border-[#e9ecef] p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-10">
              <div>
                 <h3 className="text-lg font-black font-['Syne'] m-0 text-[#111827]">Velocity Tracking</h3>
                 <p className="text-[10px] text-[#6b7280] font-black uppercase mt-1">Daily Accumulation</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#fffbeb] flex items-center justify-center text-[#f5c518]">
                 <BarChart2 size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 h-48 pt-4">
              {[45, 62, 58, 75, 92, 84, 98].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div 
                    className="w-full bg-[#f1f3f5] hover:bg-[#1a1a2e] rounded-t-lg transition-all duration-500 relative cursor-pointer"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap shadow-2xl z-10">
                       <div className="text-[#f5c518] text-[8px] mb-0.5 uppercase">SURGE</div>
                       +${(h * 12).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-[#9ca3af] uppercase tracking-tighter group-hover:text-[#111827] transition-colors">OCT {20+i}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#e9ecef] space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                   <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wide">New Accounts</span>
                </div>
                <span className="text-sm font-black text-emerald-500">+14.2%</span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[#f5c518] rounded-full" />
                   <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wide">Expansions</span>
                </div>
                <span className="text-sm font-black text-[#111827]">+8.4%</span>
             </div>
             
             <div className="mt-4 p-4 bg-[#fffbeb] border border-[#f5c518]/20 rounded-2xl">
                <div className="text-[10px] font-black text-[#f5c518] uppercase mb-1">PROJECTION</div>
                <p className="text-[12px] text-[#856404] font-medium m-0 leading-tight">Revenue is expected to exceed target by 12% this quarter.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
