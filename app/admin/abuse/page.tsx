'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Shield, AlertTriangle, CheckCircle, 
  XCircle, Filter, Search, User, 
  ExternalLink, Ban, Unlock, Clock,
  MoreVertical, ShieldAlert, ShieldCheck,
  AlertCircle, ChevronRight, X
} from 'lucide-react'
import Link from 'next/link'

interface AbuseReport {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
  reporter_email?: string
  reported_email?: string
}

interface BannedUser {
  id: string
  email: string
  banned_reason: string
  created_at: string
}

export default function AbuseControl() {
  const [reports, setReports] = useState<AbuseReport[]>([])
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data: reportsData } = await supabase.from('abuse_reports').select('*').order('created_at', { ascending: false })

    if (reportsData) {
      const userIds = Array.from(new Set([
        ...reportsData.map(r => r.reporter_id),
        ...reportsData.map(r => r.reported_user_id)
      ]))
      const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', userIds)
      const emailMap = Object.fromEntries(profiles?.map(p => [p.id, p.email]) || [])
      const enhancedReports = reportsData.map(r => ({
        ...r,
        reporter_email: emailMap[r.reporter_id] || 'Unknown',
        reported_email: emailMap[r.reported_user_id] || 'Unknown'
      }))
      setReports(enhancedReports)
    }

    const { data: bannedData } = await supabase.from('profiles').select('id, email, banned_reason, created_at').eq('is_banned', true)
    setBannedUsers(bannedData || [])
    setLoading(false)
  }

  async function updateReportStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase.from('abuse_reports').update({ status }).eq('id', id)
    if (!error) {
      setReports(reports.map(r => r.id === id ? { ...r, status: status as any } : r))
    }
  }

  async function handleUnban(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ is_banned: false, banned_reason: null }).eq('id', id)
    if (!error) {
      setBannedUsers(bannedUsers.filter(u => u.id !== id))
    }
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length
  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter)

  if (loading) return <div className="text-gray-400 font-medium">Monitoring platform health...</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
           <div className="flex items-center gap-4 mb-2">
             <h1 className="text-2xl font-black font-['Syne'] tracking-tight m-0 text-[#111827]">Moderation Desk</h1>
             <span className="bg-[#e11d48] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl shadow-rose-500/20">
               {pendingCount} CRITICAL ALERTS
             </span>
           </div>
           <p className="text-[#6b7280] text-[13px] font-bold uppercase tracking-widest">Platform integrity surveillance.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="px-6 py-3 bg-[#fef2f2] border border-[#fee2e2] rounded-2xl text-[11px] font-black text-[#e11d48] uppercase tracking-widest flex items-center gap-2.5 hover:bg-[#e11d48] hover:text-white transition-all shadow-sm active:scale-95">
             <ShieldAlert size={14} strokeWidth={3} /> EMERGENCY PURGE
           </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Active Reports', value: pendingCount, icon: AlertTriangle, color: 'text-[#e11d48] bg-[#fef2f2] border-[#fee2e2]' },
           { label: 'Blacklisted', value: bannedUsers.length, icon: Ban, color: 'text-[#111827] bg-[#f8f9fa] border-[#e9ecef]' },
           { label: 'Neutralized', value: reports.filter(r => r.status !== 'pending').length, icon: ShieldCheck, color: 'text-[#166534] bg-[#f0fdf4] border-[#dcfce7]' },
         ].map((s, i) => {
           const Icon = s.icon
           return (
             <div key={i} className="bg-white p-7 rounded-[32px] border border-[#e9ecef] shadow-sm flex items-center justify-between group hover:translate-y-[-4px] transition-all">
                 <div>
                    <div className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mb-2 px-1">{s.label}</div>
                    <div className="text-3xl font-black font-['Syne'] text-[#111827] tracking-tight">{s.value}</div>
                 </div>
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-all group-hover:rotate-6 ${s.color}`}>
                    <Icon size={24} strokeWidth={2.5} />
                 </div>
             </div>
           )
         })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Reports Queue (70%) */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 p-1.5 bg-[#f1f3f5] border border-[#e9ecef] rounded-2xl w-fit shadow-inner">
            {['pending', 'resolved', 'dismissed', 'all'].map(s => (
              <button 
                key={s}
                onClick={() => setFilter(s)}
                className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${
                  filter === s ? 'bg-[#111827] text-[#f5c518] shadow-lg' : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[32px] border border-[#e9ecef] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#e9ecef]">
                    <th className="px-10 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest">Case Profile</th>
                    <th className="px-10 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest">Incident Log</th>
                    <th className="px-10 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest">Timestamp</th>
                    <th className="px-10 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f3f5]">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#fcfdfe] transition-colors group">
                      <td className="px-10 py-7">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-[#6b7280] uppercase tracking-widest">
                            ORIGIN <span className="text-[#111827] hover:text-[#f5c518] transition-colors cursor-pointer">@{report.reporter_email?.split('@')[0]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-[#e11d48] uppercase tracking-widest">
                            TARGET <span className="hover:underline cursor-pointer">@{report.reported_email?.split('@')[0]}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7 max-w-xs">
                         <div className="text-[14px] font-bold text-[#111827] leading-relaxed line-clamp-2 italic border-l-2 border-[#f5c518] pl-4">"{report.reason}"</div>
                      </td>
                      <td className="px-10 py-7 text-[12px] font-black text-[#9ca3af] uppercase tracking-tighter">
                         {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-10 py-7 text-right">
                        {report.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                             <button 
                                onClick={() => updateReportStatus(report.id, 'resolved')}
                                className="w-10 h-10 border border-[#dcfce7] bg-[#f0fdf4] text-[#166534] rounded-xl flex items-center justify-center hover:bg-[#166534] hover:text-white transition-all shadow-sm"
                                title="Approve & Resolve"
                             >
                                <CheckCircle size={18} />
                             </button>
                             <button 
                                onClick={() => updateReportStatus(report.id, 'dismissed')}
                                className="w-10 h-10 border border-[#e9ecef] bg-[#f8f9fa] text-[#6b7280] rounded-xl flex items-center justify-center hover:bg-[#111827] hover:text-white transition-all shadow-sm"
                                title="Dismiss Report"
                             >
                                <XCircle size={18} />
                             </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border ${report.status === 'resolved' ? 'bg-[#f0fdf4] text-[#166534] border-[#dcfce7]' : 'bg-[#f9fafb] text-[#9ca3af] border-[#e5e7eb]'}`}>
                             <div className={`w-1 h-1 rounded-full ${report.status === 'resolved' ? 'bg-[#166534]' : 'bg-[#9ca3af]'}`} />
                             {report.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-24 text-center">
                         <div className="w-16 h-16 bg-[#f0fdf4] text-[#166534] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <ShieldCheck size={32} />
                         </div>
                         <h3 className="text-xl font-black font-['Syne'] m-0 text-[#111827]">Secure Perimeter</h3>
                         <p className="text-[10px] text-[#6b7280] font-black mt-2 uppercase tracking-widest">Grid clear. No active threats detected in this sector.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Banned Hall (30%) */}
        <div className="bg-white rounded-[32px] border border-[#e9ecef] p-10 space-y-10 shadow-sm h-fit sticky top-[100px]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-['Syne'] m-0 text-[#111827]">Entry Denied</h2>
              <p className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mt-1">Global platform blacklists</p>
            </div>
            <Link href="/admin/users?status=Banned" className="w-11 h-11 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-[#f5c518] transition-all shadow-sm">
               <ExternalLink size={18} />
            </Link>
          </div>

          <div className="space-y-5 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
            {bannedUsers.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-[#e1e4e8] rounded-[32px] bg-[#fcfdfe]">
                 <ShieldCheck size={32} className="text-[#d1d5db] mx-auto mb-4 opacity-50" />
                 <p className="text-[9px] font-black text-[#9ca3af] uppercase tracking-widest">Zero Hostility Logged</p>
              </div>
            ) : bannedUsers.map(user => (
              <div key={user.id} className="p-6 rounded-[28px] bg-white border border-[#e9ecef] shadow-sm flex items-center justify-between group animate-in slide-in-from-right-6 hover:border-[#fee2e2] transition-colors">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-black text-[#111827] truncate mb-1 tracking-tight">{user.email}</h3>
                  <div className="flex items-center gap-3 text-[9px] font-black text-[#9ca3af] uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock size={11} className="text-[#f5c518]" /> {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 p-3 bg-[#fef2f2] rounded-xl border border-[#fee2e2] text-[11px] font-bold text-[#e11d48] italic line-clamp-2 leading-relaxed">
                    "{user.banned_reason || 'No specific reason documented'}"
                  </div>
                </div>
                <button 
                  onClick={() => handleUnban(user.id)}
                  className="w-11 h-11 border border-[#e9ecef] bg-white rounded-xl flex items-center justify-center text-[#adb5bd] hover:text-[#166534] hover:border-[#bbf7d0] hover:bg-[#f0fdf4] transition-all opacity-0 group-hover:opacity-100 shadow-sm ml-5 shrink-0" 
                  title="Restore Access"
                >
                  <Unlock size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-[#f1f3f5]">
             <div className="flex items-start gap-4 p-5 bg-[#fffbeb] rounded-3xl border border-[#fef3c7] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#f5c518] shadow-sm shrink-0">
                  <AlertCircle size={20} strokeWidth={2.5} />
                </div>
                <div>
                   <div className="text-[10px] font-black text-[#a16207] uppercase tracking-widest mb-1.5">Rule Enforcement</div>
                   <p className="text-[13px] text-[#854d0e] font-bold m-0 leading-snug tracking-tight">Restrictive measures are binding. Verify all counter-appeals against behavioral forensics.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e9ecef;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #adb5bd;
        }
      `}</style>
    </div>
  )
}
