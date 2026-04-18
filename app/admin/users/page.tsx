'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Search, Filter, ChevronDown, MoreHorizontal,
  Mail, Shield, ShieldOff, Trash2, User,
  ArrowUpRight, ExternalLink, X, CheckCircle2, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  full_name: string
  username: string
  plan: string
  credits_used: number
  created_at: string
  is_banned: boolean
  banned_reason?: string
}

const PLANS = ['All', 'free', 'starter', 'creator', 'pro', 'studio']
const STATUSES = ['All', 'Active', 'Banned']

export default function UsersManager() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banReason, setBanReason] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  async function handleChangePlan(userId: string, newPlan: string) {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId)
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
    }
  }

  async function handleBan(userId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ is_banned: true, banned_reason: banReason }).eq('id', userId)
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: true, banned_reason: banReason } : u))
      setShowBanModal(false)
      setBanReason('')
    }
  }

  async function handleUnban(userId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ is_banned: false, banned_reason: null }).eq('id', userId)
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: false, banned_reason: undefined } : u))
    }
  }

  const filteredUsers = users.filter(u => {
    const searchLow = search.toLowerCase()
    const matchesSearch = (u.email?.toLowerCase().includes(searchLow) || u.full_name?.toLowerCase().includes(searchLow))
    const matchesPlan = filterPlan === 'All' || u.plan?.toLowerCase() === filterPlan.toLowerCase()
    const matchesStatus = filterStatus === 'All' || (filterStatus === 'Banned' ? u.is_banned : !u.is_banned)
    return matchesSearch && matchesPlan && matchesStatus
  })

  const getLimit = (plan: string) => {
    const p = plan?.toLowerCase()
    if (p === 'starter') return 200000
    if (p === 'creator') return 600000
    if (p === 'pro') return 1000000
    if (p === 'agency') return 3000000
    return 10000 // Free
  }

  const getPlanColor = (plan: string) => {
    const p = plan?.toLowerCase()
    if (p === 'starter') return 'bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]'
    if (p === 'creator') return 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
    if (p === 'star') return 'bg-[#fffbeb] text-[#d97706] border-[#fef3c7]'
    if (p === 'pro') return 'bg-[#ede9fe] text-[#5b21b6] border-[#ddd6fe]'
    if (p === 'agency') return 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]'
    return 'bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]'
  }

  if (loading) return <div className="text-gray-400 font-medium font-['Syne']">Accessing encrypted user vault...</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-2xl font-black font-['Syne'] tracking-tight m-0 text-[#111827]">Users Directory</h1>
             <div className="bg-[#f5c518] text-[#111827] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-yellow-500/10">
               {filteredUsers.length} MEMBERS
             </div>
           </div>
           <p className="text-[#6b7280] text-[13px] font-medium leading-none">Administrative control over platform participation.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="px-5 py-2.5 bg-white border border-[#e9ecef] rounded-xl text-[11px] font-black uppercase tracking-widest text-[#111827] flex items-center gap-2 hover:bg-[#f8f9fa] transition-all no-underline shadow-sm active:scale-95">
             <ArrowUpRight size={14} strokeWidth={3} /> Sync CSV
           </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
            <input 
              type="text" 
              placeholder="Filter by name, email or unique ID..."
              className="w-full bg-white border border-[#e9ecef] rounded-2xl py-3.5 pl-12 pr-4 text-[14px] outline-none focus:ring-4 focus:ring-[#f5c518]/10 focus:border-[#f5c518]/30 transition-all font-medium text-[#111827] placeholder-[#9ca3af] shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="flex gap-4">
            <select 
              className="bg-white border border-[#e9ecef] rounded-xl px-5 py-3.5 text-[11px] font-black uppercase tracking-widest text-[#374151] outline-none cursor-pointer focus:ring-4 focus:ring-[#f5c518]/10 focus:border-[#f5c518]/30 transition-all shadow-sm"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              {PLANS.map(p => <option key={p} value={p}>{p} RANGE</option>)}
            </select>
            <select 
              className="bg-white border border-[#e9ecef] rounded-xl px-5 py-3.5 text-[11px] font-black uppercase tracking-widest text-[#374151] outline-none cursor-pointer focus:ring-4 focus:ring-[#f5c518]/10 focus:border-[#f5c518]/30 transition-all shadow-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s} STATE</option>)}
            </select>
         </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#e9ecef] rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e9ecef]">
                <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">Identity Pool</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">Current Tier</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">Quota Efficiency</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">Joined On</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider">State</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#6b7280] uppercase tracking-wider text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9ecef]">
              {filteredUsers.map((user) => {
                const limit = getLimit(user.plan)
                const usagePercent = Math.min(((user.credits_used || 0) / limit) * 100, 100)
                const planColor = getPlanColor(user.plan)

                return (
                  <tr key={user.id} className="hover:bg-[#fcfdfe] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center font-black text-[#111827] text-xs group-hover:bg-[#111827] group-hover:text-white transition-all">
                          {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                           <div className="text-[14px] font-black text-[#111827] truncate group-hover:text-[#f5c518] transition-colors">{user.full_name || 'Anonymous Identity'}</div>
                           <div className="text-[11px] text-[#6b7280] font-medium truncate max-w-[180px]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <select 
                         className={`px-3 py-1.5 rounded-full text-[10px] font-black border uppercase outline-none cursor-pointer transition-all shadow-sm ${planColor}`}
                         value={user.plan || 'Free'}
                         onChange={(e) => handleChangePlan(user.id, e.target.value)}
                       >
                         {PLANS.filter(p => p !== 'All').map(p => (
                            <option key={p} value={p}>{p}</option>
                         ))}
                       </select>
                    </td>
                    <td className="px-8 py-6 min-w-[200px]">
                       <div className="flex items-center justify-between text-[9px] font-black text-[#6b7280] mb-2 uppercase tracking-widest px-1">
                          <span>{(user.credits_used || 0).toLocaleString()} <span className="opacity-50">GENS</span></span>
                          <span className="text-[#111827]">{Math.round(usagePercent)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-[#f1f3f5] rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 rounded-full ${
                              usagePercent > 85 ? 'bg-rose-500' : usagePercent > 50 ? 'bg-[#f5c518]' : 'bg-[#111827]'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="text-[13px] font-bold text-[#374151]">
                          {new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       {user.is_banned ? (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]">
                           <AlertCircle size={10} strokeWidth={3} /> Blocked
                         </div>
                       ) : (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]">
                           <CheckCircle2 size={10} strokeWidth={3} /> Active
                         </div>
                       )}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Link 
                           href={`/admin/emails?to=${user.email}`}
                           className="w-10 h-10 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] hover:bg-[#1a1a2e] hover:text-white flex items-center justify-center text-[#6b7280] transition-all no-underline shadow-sm"
                           title="Direct Communication"
                         >
                           <Mail size={16} />
                         </Link>
                         {user.is_banned ? (
                           <button 
                             onClick={() => handleUnban(user.id)}
                             className="w-10 h-10 rounded-xl bg-[#dcfce7] hover:bg-[#166534] hover:text-white flex items-center justify-center text-[#166534] transition-all border border-[#bbf7d0] shadow-sm"
                             title="Revoke Suspension"
                           >
                             <ShieldOff size={16} />
                           </button>
                         ) : (
                           <button 
                             onClick={() => {
                               setSelectedUser(user.id)
                               setShowBanModal(true)
                             }}
                             className="w-10 h-10 rounded-xl bg-[#fee2e2] hover:bg-[#991b1b] hover:text-white flex items-center justify-center text-[#991b1b] transition-all border border-[#fecaca] shadow-sm"
                             title="Suspend Access"
                           >
                             <Shield size={16} />
                           </button>
                         )}
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center">
               <div className="text-4xl mb-4 opacity-20">👤</div>
               <h3 className="text-lg font-black font-['Syne'] m-0">No users found</h3>
               <p className="text-xs text-[#6b7280] font-bold mt-1 uppercase">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[24px] p-8 border border-[#e9ecef] shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black font-['Syne'] tracking-tight">Restrict User</h2>
                <p className="text-[11px] text-[#6b7280] font-bold uppercase tracking-wider mt-1">Access control mitigation</p>
              </div>
              <button 
                onClick={() => setShowBanModal(false)}
                className="w-8 h-8 rounded-full bg-[#f8f9fa] flex items-center justify-center text-[#9ca3af] hover:text-[#111827] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-[#6b7280] px-1">Detailed Reason</label>
               <textarea 
                 placeholder="Why are you restricting this user's access?"
                 className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl p-4 text-[13.5px] h-32 outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/40 transition-all resize-none font-medium"
                 value={banReason}
                 onChange={(e) => setBanReason(e.target.value)}
               />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setShowBanModal(false)}
                className="flex-1 py-3 text-xs font-black uppercase text-[#6b7280] hover:bg-[#f8f9fa] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleBan(selectedUser!)}
                disabled={!banReason}
                className="flex-1 py-3 bg-[#1a1a2e] text-white rounded-xl font-black text-xs uppercase hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-navy/20"
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
