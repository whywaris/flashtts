'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { 
  Users, DollarSign, Zap, TrendingUp, 
  ArrowUpRight, Plus, FileText, Mail, Shield, ChevronRight
} from 'lucide-react'

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    paidUsers: 0,
    mrr: 0,
    totalChars: 0,
    recentUsers: [] as any[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()
      
      // Real counts from Supabase
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: paidCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('plan', 'Free')
      const { data: recent } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5)
      
      // Calculate real MRR from actual plan prices
      const PLAN_MRR: Record<string, number> = { starter: 9, creator: 19, pro: 39, studio: 79 }
      const { data: paidProfiles } = await supabase.from('profiles').select('plan').neq('plan', 'free').neq('plan', 'Free')
      const realMrr = (paidProfiles || []).reduce((sum, p) => sum + (PLAN_MRR[(p.plan || '').toLowerCase()] || 0), 0)

      // Real total chars generated
      const { data: charData } = await supabase.from('profiles').select('credits_used')
      const totalChars = (charData || []).reduce((s, p) => s + (p.credits_used || 0), 0)

      setStats({
        totalUsers: usersCount || 0,
        paidUsers: paidCount || 0,
        mrr: realMrr,
        totalChars,
        recentUsers: recent || []
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return <div className="text-gray-400 font-medium">Crunching numbers...</div>

  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      trend: '',
      color: '#22c55e',
      isDark: true
    },
    {
      label: 'Paid Users',
      value: stats.paidUsers.toLocaleString(),
      icon: StarIcon,
      trend: '',
      color: '#f5c518',
      isDark: false
    },
    {
      label: 'Est. Monthly Revenue',
      value: `$${stats.mrr.toLocaleString()}`,
      icon: DollarSign,
      trend: '',
      color: '#1a1a2e',
      isDark: false
    },
    {
      label: 'Chars Generated',
      value: stats.totalChars > 1_000_000 ? `${(stats.totalChars / 1_000_000).toFixed(1)}M` : stats.totalChars > 1000 ? `${(stats.totalChars / 1000).toFixed(0)}K` : stats.totalChars.toString(),
      icon: Zap,
      trend: '',
      color: '#a855f7',
      isDark: false
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <div 
              key={i} 
              className={`
                relative p-6 rounded-[24px] border transition-all hover:translate-y-[-4px]
                ${card.isDark ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white shadow-xl shadow-navy/10' : 'bg-white border-[#e9ecef] text-[#111827] shadow-sm'}
              `}
            >
              <button className={`absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center border ${card.isDark ? 'border-white/20 hover:bg-white/10' : 'border-[#e9ecef] hover:bg-[#f8f9fa]'} transition-colors`}>
                 <ArrowUpRight size={14} className={card.isDark ? 'text-white' : 'text-[#6b7280]'} />
              </button>
              
              <div className={`text-[11px] font-black uppercase tracking-widest mb-3 ${card.isDark ? 'text-white/70' : 'text-[#6b7280]'}`}>
                {card.label}
              </div>
              
              <div className="text-3xl font-black font-['Instrument_Serif'] tracking-tight mb-4 text-inherit">
                {card.value}
              </div>

              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${card.isDark ? 'bg-white/10 text-white' : 'bg-[#f8f9fa] text-[#111827] border border-[#e9ecef]'}`}>
                {card.trend} <span className={`font-medium italic ${card.isDark ? 'text-white/60' : 'text-[#6b7280]'}`}>vs last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Growth Chart */}
        <div className="bg-white border border-[#e9ecef] rounded-[24px] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black font-['Instrument_Serif'] m-0 text-[#111827]">User Growth</h3>
              <p className="text-[10px] text-[#6b7280] font-black uppercase tracking-widest mt-1">Weekly Platform Scaling</p>
            </div>
            <div className="flex gap-2 items-center">
               <div className="w-2.5 h-2.5 bg-[#1a1a2e] rounded-full" />
               <span className="text-[10px] font-black text-[#111827] uppercase tracking-tighter">Current Surge</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 h-[200px] pt-4">
            {[45, 62, 38, 85, 52, 90, 70].map((h, i) => {
              const days = ['S','M','T','W','T','F','S']
              const isActive = i === 5 // Friday active
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full relative group">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer ${isActive ? 'bg-[#1a1a2e] shadow-lg shadow-navy/20' : 'bg-[#f1f3f5]'} bar-pattern`}
                      style={{ height: `${h}%` }}
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                       {h}%
                    </div>
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-tighter ${isActive ? 'text-[#111827]' : 'text-[#adb5bd]'}`}>{days[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right - Gauge breakdown */}
        <div className="bg-white border border-[#e9ecef] rounded-[24px] p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="self-start mb-6 w-full text-left">
             <h3 className="text-lg font-black font-['Instrument_Serif'] m-0 text-[#111827]">Revenue Breakdown</h3>
             <p className="text-[10px] text-[#6b7280] font-black uppercase tracking-widest mt-1">Plan conversion efficiency</p>
          </div>

          <div className="relative w-[180px] h-[180px] mb-8">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="stroke-[#f1f3f5]"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-[#f5c518]"
                strokeWidth="3.5"
                strokeDasharray="41, 100"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-black font-['Instrument_Serif'] text-[#111827]">41%</div>
              <div className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mt-[-2px]">Conversion</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full border-t border-[#f1f3f5] pt-8 mt-auto">
            <div className="text-center group">
               <div className="flex items-center justify-center gap-2 mb-1">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#f5c518]" />
                 <span className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest">PRO USERS</span>
               </div>
               <div className="text-xl font-black font-['Instrument_Serif'] text-[#111827] group-hover:scale-110 transition-transform">{stats.paidUsers.toLocaleString()}</div>
            </div>
            <div className="text-center group">
               <div className="flex items-center justify-center gap-2 mb-1">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#f1f3f5] border border-[#e9ecef]" />
                 <span className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest">FREE USERS</span>
               </div>
               <div className="text-xl font-black font-['Instrument_Serif'] text-[#111827] group-hover:scale-110 transition-transform">{Math.max(0, stats.totalUsers - stats.paidUsers).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Recent Users Table */}
        <div className="lg:col-span-2 bg-white border border-[#e9ecef] rounded-[24px] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-[#e9ecef] flex items-center justify-between">
            <h3 className="text-lg font-black font-['Instrument_Serif'] m-0 text-[#111827]">Recent Signups</h3>
            <Link href="/admin/users" className="text-[11px] font-black text-[#f5c518] uppercase tracking-widest flex items-center gap-1 hover:underline group">
               Full User Directory <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                 <tr className="bg-[#f9fafb]">
                    <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">Subscriber Identity</th>
                    <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">Logged On</th>
                    <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider text-center">Tier</th>
                    <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider text-right">Activity</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#e9ecef]">
                 {stats.recentUsers.map((user, i) => (
                   <tr key={i} className="hover:bg-[#fcfdfe] transition-colors group">
                     <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center font-black text-[#111827] group-hover:bg-[#1a1a2e] group-hover:text-white transition-all">
                           {user.full_name?.[0] || 'U'}
                         </div>
                         <div className="min-w-0">
                            <div className="text-[14px] font-black text-[#111827] truncate leading-none mb-1">{user.full_name || 'Anonymous User'}</div>
                            <div className="text-[11px] text-[#6b7280] font-medium truncate max-w-[180px]">{user.email}</div>
                         </div>
                       </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="text-[13px] font-bold text-[#374151]">
                           {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                     </td>
                     <td className="px-8 py-6 text-center">
                       <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${user.plan === 'Free' ? 'bg-[#f1f3f5] text-[#374151] border-gray-200' : 'bg-[#fffbeb] text-[#f5c518] border-[#f5c518]/20'}`}>
                         {user.plan || 'Free'}
                       </span>
                     </td>
                     <td className="px-8 py-6 text-right">
                       <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 uppercase tracking-tighter">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         Active Pulse
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>

        {/* Right - Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-black font-['Instrument_Serif'] px-2">Quick Actions</h3>
          {[
            { label: 'Add New Voice', href: '/admin/voices', icon: Plus, color: '#f5c518' },
            { label: 'Write Blog Post', href: '/admin/blog', icon: FileText, color: '#f5c518' },
            { label: 'Send Broadcast', href: '/admin/emails', icon: Mail, color: '#f5c518' },
            { label: 'Review Abuse Reports', href: '/admin/abuse', icon: Shield, color: '#f5c518' },
          ].map((action, i) => {
            const Icon = action.icon
            return (
              <Link 
                key={i} 
                href={action.href}
                className="flex items-center justify-between p-5 bg-white border border-[#e9ecef] rounded-[22px] transition-all hover:border-[#f5c518]/40 hover:translate-x-1 group no-underline"
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-[#fffbeb] border border-[#f5c518]/10 flex items-center justify-center text-[#f5c518]">
                      <Icon size={18} strokeWidth={2.5} />
                   </div>
                   <span className="text-[13.5px] font-bold text-[#111827] group-hover:text-black">{action.label}</span>
                </div>
                <ChevronRight size={16} className="text-[#adb5bd] group-hover:text-[#f5c518] group-hover:translate-x-1 transition-all" />
              </Link>
            )
          })}
          
          <div className="p-6 bg-[#1a1a2e] rounded-[24px] text-white overflow-hidden relative group">
             <div className="relative z-10">
               <h4 className="text-sm font-bold font-['Instrument_Serif'] mb-2 tracking-tight">System Status</h4>
               <p className="text-[11px] text-white/50 mb-4 leading-relaxed">All services are currently running smoothly across all regions.</p>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  PERFORMANCE 100%
               </div>
             </div>
             <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all" />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .bar-pattern {
          background-image: linear-gradient(45deg, rgba(255,255,255,.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.05) 50%, rgba(255,255,255,.05) 75%, transparent 75%, transparent);
          background-size: 8px 8px;
        }
      `}</style>
    </div>
  )
}

function StarIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
