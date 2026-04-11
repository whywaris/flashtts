'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  BarChart2, Activity, Zap, Headphones, 
  Languages, TrendingUp, User, Globe, 
  ArrowUpRight, PieChart, Layers, Cpu, Server
} from 'lucide-react'

interface UsageStats {
  totalChars: number
  totalAudios: number
  avgCharsPerUser: number
  topLanguage: string
  apiRequests: number
}

interface TopUser {
  id: string
  email: string
  plan: string
  credits_used: number
}

export default function UsageStats() {
  const [stats, setStats] = useState<UsageStats>({ 
    totalChars: 0, totalAudios: 14520, avgCharsPerUser: 0, 
    topLanguage: 'English', apiRequests: 89400 
  })
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageData()
  }, [])

  async function fetchUsageData() {
    const supabase = createClient()
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, plan, credits_used')
      .order('credits_used', { ascending: false })
      .limit(10)

    if (profiles) {
      setTopUsers(profiles)
      const totalChars = profiles.reduce((acc, curr) => acc + (curr.credits_used || 0), 0)
      setStats(prev => ({
        ...prev,
        totalChars: totalChars,
        avgCharsPerUser: profiles.length > 0 ? totalChars / profiles.length : 0
      }))
    }
    setLoading(false)
  }

  if (loading) return <div className="text-gray-400 font-medium">Quantifying system performance...</div>

  const metrics = [
    { label: 'Total Chars', value: stats.totalChars.toLocaleString(), icon: BarChart2, color: 'bg-yellow-50 text-yellow-500' },
    { label: 'Audio Assets', value: stats.totalAudios.toLocaleString(), icon: Headphones, color: 'bg-emerald-50 text-emerald-500' },
    { label: 'Avg/User', value: stats.avgCharsPerUser.toFixed(0), icon: User, color: 'bg-blue-50 text-blue-500' },
    { label: 'Top Logic', value: stats.topLanguage, icon: Globe, color: 'bg-purple-50 text-purple-500' },
    { label: 'API Queries', value: stats.apiRequests.toLocaleString(), icon: Server, color: 'bg-amber-50 text-amber-500' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
           <h1 className="text-2xl font-black font-['Syne'] tracking-tight m-0 text-[#111827]">Infrastructural Usage</h1>
           <p className="text-[#6b7280] text-[13px] font-medium mt-1 uppercase tracking-wider">Metrical analysis of system throughput.</p>
        </div>
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#f0fdf4] border border-[#dcfce7] rounded-full text-[10px] font-black uppercase tracking-widest text-[#166534] shadow-sm">
           <Activity size={12} className="text-emerald-500 animate-pulse" /> SYSTEM OPERATIONAL
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <div key={i} className="bg-white p-6 rounded-[28px] border border-[#e9ecef] shadow-sm group hover:translate-y-[-4px] transition-all">
               <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 transition-all shadow-sm ${m.color}`}>
                  <Icon size={20} strokeWidth={2.5} />
               </div>
               <div>
                  <div className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mb-2 px-1">{m.label}</div>
                  <div className="text-2xl font-black font-['Syne'] text-[#111827] tracking-tight">{m.value}</div>
               </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Usage Chart */}
        <div className="bg-white rounded-[32px] border border-[#e9ecef] p-10 shadow-sm space-y-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-['Syne'] m-0 text-[#111827]">Consumption Velocity</h2>
              <p className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mt-1">7-Day Character Flow</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#fffbeb] flex items-center justify-center text-[#f5c518] shadow-sm">
               <TrendingUp size={20} />
            </div>
          </div>

          <div className="flex items-end justify-between gap-5 h-64 pt-6">
            {[45, 62, 58, 75, 92, 84, 110].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-5 group">
                <div 
                  className="w-full bg-[#f1f3f5] rounded-t-xl transition-all duration-500 relative hover:bg-[#f5c518] cursor-pointer"
                  style={{ height: `${(val / 1100) * 1000}%` }}
                >
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[10px] font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap shadow-2xl z-10">
                    {(val * 1000).toLocaleString()} <span className="text-[#f5c518] text-[8px] ml-1 uppercase">Chars</span>
                  </div>
                </div>
                <span className="text-[9px] font-black text-[#9ca3af] uppercase tracking-widest group-hover:text-[#111827] transition-colors">OCT {17+i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language & Distribution */}
        <div className="bg-white rounded-[32px] border border-[#e9ecef] p-10 shadow-sm space-y-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-['Syne'] m-0 text-[#111827]">Linguistic Reach</h2>
              <p className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mt-1">Linguistic distribution model</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-blue-500 shadow-sm">
               <Globe size={20} />
            </div>
          </div>
          
          <div className="space-y-8">
            {[
              { label: 'English', percent: 68, color: 'bg-[#f5c518]' },
              { label: 'Spanish', percent: 12, color: 'bg-blue-500' },
              { label: 'French', percent: 8, color: 'bg-emerald-500' },
              { label: 'German', percent: 5, color: 'bg-rose-500' },
              { label: 'Other', percent: 7, color: 'bg-gray-300' },
            ].map((lang, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#6b7280] px-1">
                  <span>{lang.label}</span>
                  <span className="text-[#111827]">{lang.percent}%</span>
                </div>
                <div className="h-2 w-full bg-[#f1f3f5] rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${lang.color} shadow-sm`}
                    style={{ width: `${lang.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Users Table */}
      <div className="bg-white rounded-[32px] border border-[#e9ecef] overflow-hidden shadow-sm">
        <div className="p-10 border-b border-[#e9ecef] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black font-['Syne'] m-0 text-[#111827]">Efficiency Leaderboard</h2>
            <p className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mt-1">Power user consumption indices</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center text-[#111827] shadow-sm transition-all hover:bg-[#111827] hover:text-[#f5c518]">
             <Layers size={22} strokeWidth={2.5} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="px-10 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest w-24">Rank</th>
                <th className="px-10 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest">Active User Profile</th>
                <th className="px-10 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest text-center">Plan Tier</th>
                <th className="px-10 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest text-center">Character Volume</th>
                <th className="px-10 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest text-right">System Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f5]">
              {topUsers.map((user, index) => {
                const total = stats.totalChars || 1
                const impact = ((user.credits_used / total) * 100).toFixed(1)
                return (
                  <tr key={user.id} className="hover:bg-[#fcfdfe] transition-colors group">
                    <td className="px-10 py-7">
                       <span className={`text-[13px] font-black ${index < 3 ? 'text-[#f5c518]' : 'text-[#adb5bd]'}`}>#{index + 1}</span>
                    </td>
                    <td className="px-10 py-7">
                       <div className="text-[14px] font-black text-[#111827] tracking-tight hover:text-[#f5c518] transition-colors cursor-pointer">
                         {user.email}
                       </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border ${
                         user.plan === 'Agency' ? 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]' :
                         user.plan === 'Pro' ? 'bg-[#f3e8ff] text-[#6b21a8] border-[#e9d5ff]' : 'bg-[#f9fafb] text-[#374151] border-[#e5e7eb]'
                       }`}>
                         {user.plan}
                       </span>
                    </td>
                    <td className="px-10 py-7 text-center">
                       <div className="text-[14px] font-black text-[#111827] flex items-center justify-center gap-2">
                         <span>{(user.credits_used || 0).toLocaleString()}</span>
                         <span className="text-[9px] font-black text-[#9ca3af] uppercase tracking-tighter">Units</span>
                       </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                       <div className="text-[11px] font-black text-[#111827] bg-[#f8f9fa] inline-block px-3 py-1 rounded-lg border border-[#e9ecef] shadow-sm">
                          {impact}% <span className="text-[8px] text-[#9ca3af] ml-0.5">LOAD</span>
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
