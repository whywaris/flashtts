'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import {
  Send, Mail, Users, Zap, AlertTriangle,
  History, CheckCircle2, XCircle, Search,
  ChevronDown, Info, Trash2, MailOpen,
  ArrowRight, AtSign, Layout, Pencil,
  RefreshCcw, Sparkles
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface EmailLog {
  id: string
  email_to: string
  subject: string
  template: string
  status: string
  created_at: string
}

const TEMPLATES = ['Welcome', 'Plan Upgrade', 'Warning', 'System Alert', 'Custom']
const AUDIENCES = ['Custom Email', 'All Users', 'Paid Users', 'Free Tier Only']

function EmailsManagerContent() {
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const [to, setTo] = useState(searchParams.get('to') || '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [template, setTemplate] = useState('Welcome')
  const [audience, setAudience] = useState('Custom Email')

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('email_logs').select('*').order('created_at', { ascending: false })
    if (data) setLogs(data)
    setLoading(false)
  }

  async function handleSend() {
    if ((audience === 'Custom Email' && !to) || !subject || !message) {
      toast.error('Please complete all required fields.')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message, template, audience })
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Broadcast dispatched successfully!')
        setSubject('')
        setMessage('')
        fetchLogs()
      } else {
        toast.error('Dispatch Error: ' + data.error)
      }
    } catch (err: any) {
      toast.error('Network failure during dispatch.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
           <h1 className="text-2xl font-black font-['Syne'] tracking-tight m-0 text-[#111827]">Broadcast Center</h1>
           <p className="text-[#6b7280] text-[13px] font-bold uppercase tracking-widest mt-1">Metrical terminal for user engagement.</p>
        </div>
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#fffbeb] border border-[#fef3c7] rounded-full text-[10px] font-black uppercase tracking-widest text-[#a16207] shadow-sm">
           <Zap size={12} className="text-[#f5c518] fill-[#f5c518]" /> RESEND INTEGRATED
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 min-h-[700px]">
        
        {/* Left: Compose (70%) */}
        <section className="flex-1">
           <div className="bg-white border border-[#e9ecef] rounded-[32px] shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-10 border-b border-[#e9ecef] bg-[#fcfdfe] flex items-center justify-between">
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#111827] text-[#f5c518] flex items-center justify-center shadow-xl shadow-navy/20">
                       <Pencil size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h3 className="text-lg font-black font-['Syne'] m-0 text-[#111827]">Draft Composition</h3>
                       <p className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mt-0.5">Initialize new outbound stream</p>
                    </div>
                 </div>
                 <button onClick={() => { setSubject(''); setMessage(''); }} className="w-10 h-10 rounded-xl bg-white border border-[#e9ecef] flex items-center justify-center text-[#adb5bd] hover:text-[#e11d48] hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm">
                    <Trash2 size={18} />
                 </button>
              </div>

              <div className="p-10 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                       <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1 flex items-center gap-2">
                          <Users size={12} strokeWidth={3} className="text-[#f5c518]" /> Audience Segment
                       </label>
                       <select 
                         className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-4 text-[13px] font-black text-[#111827] uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-[#f5c518]/5 focus:bg-white transition-all shadow-sm"
                         value={audience}
                         onChange={(e) => setAudience(e.target.value)}
                       >
                         {AUDIENCES.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2.5">
                       <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1 flex items-center gap-2">
                          <AtSign size={12} strokeWidth={3} className="text-[#f5c518]" /> Target Address
                       </label>
                       <input 
                         type="email" 
                         placeholder="e.g. user@example.com"
                         className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-4 text-[14px] font-bold text-[#111827] outline-none disabled:opacity-40 focus:ring-4 focus:ring-[#f5c518]/5 focus:bg-white transition-all shadow-sm"
                         value={to}
                         onChange={(e) => setTo(e.target.value)}
                         disabled={audience !== 'Custom Email'}
                       />
                    </div>
                 </div>

                 <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1 flex items-center gap-2">
                       <Layout size={12} strokeWidth={3} className="text-[#f5c518]" /> Subject Line
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter a compelling subject..."
                      className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-4 text-[16px] font-black text-[#111827] placeholder:text-[#adb5bd] placeholder:font-bold outline-none focus:ring-4 focus:ring-[#f5c518]/5 focus:bg-white transition-all shadow-sm tracking-tight"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div className="space-y-2.5">
                       <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1 flex items-center gap-2">
                          <Sparkles size={12} strokeWidth={3} className="text-[#f5c518]" /> Dynamic Template
                       </label>
                       <select 
                         className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-4 text-[13px] font-black text-[#111827] uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-[#f5c518]/5 focus:bg-white transition-all shadow-sm"
                         value={template}
                         onChange={(e) => setTemplate(e.target.value)}
                       >
                          {TEMPLATES.map(t => <option key={t} value={t}>{t.toUpperCase()} LOGIC</option>)}
                       </select>
                    </div>
                    <div className="p-5 bg-[#eff6ff] border border-[#dbeafe] rounded-2xl flex items-center gap-4 shadow-inner">
                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm border border-[#dbeafe] shrink-0">
                          <Info size={16} />
                       </div>
                       <p className="text-[11px] text-[#1e40af] font-bold m-0 leading-snug tracking-tight">Support for variables: <b>{'{name}'}</b>, <b>{'{plan}'}</b>, and <b>{'{usage}'}</b> is enabled.</p>
                    </div>
                 </div>

                 <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1 flex items-center gap-2">
                       <MailOpen size={12} strokeWidth={3} className="text-[#f5c518]" /> Transmission Body (HTML)
                    </label>
                    <textarea 
                      placeholder="Craft your high-impact message here..."
                      className="w-full bg-[#fcfdfe] border border-[#e9ecef] rounded-[32px] p-8 text-[14px] font-medium text-[#111827] leading-relaxed h-[350px] outline-none focus:ring-4 focus:ring-[#f5c518]/5 focus:bg-white transition-all resize-none shadow-sm font-mono border-dashed"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                 </div>

                 <div className="pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[9px] font-black text-[#adb5bd] uppercase tracking-widest">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       Preview rendering active
                    </div>
                    <button 
                      onClick={handleSend}
                      disabled={sending}
                      className="px-12 py-5 bg-[#f5c518] text-[#111827] rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center gap-4 hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl shadow-yellow-500/20 disabled:opacity-50"
                    >
                      {sending ? 'DISPATCHING ARCHIVE...' : <><Send size={18} strokeWidth={3} /> INITIALIZE BROADCAST</>}
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* Right: History (30%) */}
        <aside className="w-full xl:w-[450px] shrink-0">
           <div className="bg-white border border-[#e9ecef] rounded-[32px] p-10 shadow-sm flex flex-col h-full sticky top-[100px]">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-xl font-black font-['Syne'] m-0 text-[#111827] italic">Dispatch Logs</h3>
                    <p className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mt-1">Outbound history archive</p>
                 </div>
                 <button onClick={fetchLogs} className="w-11 h-11 bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-[#f5c518] transition-all shadow-sm">
                    <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                 </button>
              </div>

              <div className="space-y-5 overflow-y-auto pr-3 custom-scrollbar flex-1">
                {logs.length === 0 ? (
                  <div className="text-center py-24 border-2 border-dashed border-[#e1e4e8] rounded-[32px] bg-[#fcfdfe]">
                    <History size={32} className="text-[#d1d5db] mx-auto mb-4 opacity-50" />
                    <p className="text-[9px] font-black text-[#9ca3af] uppercase tracking-widest">Zero transmission history</p>
                  </div>
                ) : logs.map((log) => (
                  <div key={log.id} className="p-6 rounded-[28px] bg-white border border-[#e9ecef] hover:border-[#f5c518]/30 transition-all group cursor-pointer relative shadow-sm">
                    <div className="flex items-start justify-between gap-5 mb-4">
                       <div className="min-w-0">
                          <div className="text-[14px] font-black text-[#111827] truncate leading-tight group-hover:text-blue-600 transition-colors tracking-tight">{log.email_to}</div>
                          <div className="text-[11px] font-bold text-[#6b7280] truncate mt-1 tracking-tight">{log.subject}</div>
                       </div>
                       <div className="shrink-0 text-[9px] font-black text-[#adb5bd] uppercase tracking-widest mt-1">
                          {new Date(log.created_at).toLocaleDateString()}
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-[#f1f3f5] text-[8px] font-black uppercase text-[#6b7280] tracking-widest border border-[#e9ecef] shadow-sm">{log.template}</span>
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-[#166534] uppercase tracking-widest">
                            <CheckCircle2 size={12} strokeWidth={3} className="text-emerald-500" /> DISPATCHED
                          </span>
                       </div>
                       <button className="w-9 h-9 bg-[#fef2f2] text-[#e11d48] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#e11d48] hover:text-white shadow-sm">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-10 border-t border-[#f1f3f5] space-y-6">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#6b7280] px-1">
                    <span>Dispatch Fidelity</span>
                    <span className="text-[#166534]">99.8% Efficiency</span>
                 </div>
                 <div className="h-2 w-full bg-[#f1f3f5] rounded-full overflow-hidden shadow-inner">
                    <div className="h-full w-[99.8%] bg-emerald-500 rounded-full shadow-sm" />
                 </div>
                 <p className="text-[11px] text-[#adb5bd] font-bold italic leading-relaxed tracking-tight">Logs are architecture-retained for 30 cycles. Significant batches may require propagation delay.</p>
              </div>
           </div>
        </aside>
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
      `}</style>
    </div>
  )
}

export default function EmailsManager() {
  return (
    <Suspense fallback={<div>Loading terminal...</div>}>
      <EmailsManagerContent />
    </Suspense>
  )
}
