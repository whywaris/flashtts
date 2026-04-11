'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Plus, Search, Filter, Mic, Globe, 
  Play, Trash2, Power, Headphones, User,
  Languages, CheckCircle2, ChevronDown, X
} from 'lucide-react'

interface Voice {
  id: string
  voice_id?: string
  name: string
  language: string
  gender: string
  description?: string
  sample_url?: string
  is_active: boolean
  is_premium: boolean
  created_at: string
}

const LANGUAGES = ['All', 'English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese']
const GENDERS = ['All', 'Male', 'Female', 'Neutral']

export default function VoiceManager() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLang, setFilterLang] = useState('All')
  const [filterGender, setFilterGender] = useState('All')
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [newVoice, setNewVoice] = useState({
    name: '', language: 'English', gender: 'Male', 
    description: '', sample_url: '', is_active: true, is_premium: false
  })

  useEffect(() => {
    fetchVoices()
  }, [])

  async function fetchVoices() {
    const supabase = createClient()
    const { data } = await supabase.from('tts_voices').select('*').order('name')
    if (data) setVoices(data)
    setLoading(false)
  }

  async function handleToggleActive(id: string, current: boolean) {
    const supabase = createClient()
    const { error } = await supabase.from('tts_voices').update({ is_active: !current }).eq('id', id)
    if (!error) {
      setVoices(voices.map(v => v.id === id ? { ...v, is_active: !current } : v))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this voice?')) return
    const supabase = createClient()
    const { error } = await supabase.from('tts_voices').delete().eq('id', id)
    if (!error) setVoices(voices.filter(v => v.id !== id))
  }

  async function handleAddVoice() {
    const supabase = createClient()
    const { error } = await supabase.from('tts_voices').insert([newVoice])
    if (!error) {
      alert('Voice added!')
      setShowAddModal(false)
      fetchVoices()
    } else {
      alert(error.message)
    }
  }

  const filteredVoices = voices.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase())
    const matchesLang = filterLang === 'All' || v.language === filterLang
    const matchesGender = filterGender === 'All' || v.gender === filterGender
    return matchesSearch && matchesLang && matchesGender
  })

  const stats = {
    total: voices.length,
    active: voices.filter(v => v.is_active).length,
    inactive: voices.filter(v => !v.is_active).length,
    languages: new Set(voices.map(v => v.language)).size
  }

  if (loading) return <div className="text-gray-400 font-medium">Loading voice library...</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
           <h1 className="text-2xl font-black font-['Syne'] tracking-tight m-0 text-[#111827]">Voices Curation</h1>
           <p className="text-[#6b7280] text-[13px] font-medium mt-1">Orchestrate and calibrate your synthetic voice ecosystem.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#f5c518] text-[#111827] rounded-xl font-black text-xs tracking-widest uppercase shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={3} /> ADD NEW VOICE
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: 'Inventory Size', value: stats.total, color: 'text-[#111827]', bg: 'bg-[#f8f9fa]' },
           { label: 'Operational', value: stats.active, color: 'text-emerald-600', bg: 'bg-[#f0fdf4]' },
           { label: 'Offline', value: stats.inactive, color: 'text-rose-600', bg: 'bg-[#fef2f2]' },
           { label: 'Linguistic Grid', value: stats.languages, color: 'text-blue-600', bg: 'bg-[#eff6ff]' },
         ].map((s, i) => (
           <div key={i} className={`p-6 rounded-[24px] border border-[#e9ecef] shadow-sm ${s.bg} transition-all hover:translate-y-[-2px]`}>
              <div className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mb-2 px-1">{s.label}</div>
              <div className={`text-2xl font-black font-['Syne'] tracking-tight ${s.color}`}>{s.value}</div>
           </div>
         ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9ca3af] group-focus-within:text-[#f5c518] transition-colors" size={16} />
           <input 
             type="text" 
             placeholder="Query voice manifest..."
             className="w-full bg-white border border-[#e9ecef] rounded-2xl py-4 pl-12 pr-6 text-[14px] outline-none focus:ring-4 focus:ring-[#f5c518]/5 focus:border-[#f5c518]/20 transition-all font-bold text-[#111827] placeholder:text-[#adb5bd]"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
        <div className="flex gap-4">
           <select 
             className="bg-white border border-[#e9ecef] rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-[#f5c518]/5 transition-all shadow-sm text-[#111827]"
             value={filterLang}
             onChange={(e) => setFilterLang(e.target.value)}
           >
             {LANGUAGES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
           </select>
           <select 
             className="bg-white border border-[#e9ecef] rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-[#f5c518]/5 transition-all shadow-sm text-[#111827]"
             value={filterGender}
             onChange={(e) => setFilterGender(e.target.value)}
           >
             {GENDERS.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
           </select>
        </div>
      </div>

      {/* Voices Table */}
      <div className="bg-white border border-[#e9ecef] rounded-[28px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e9ecef]">
                <th className="px-8 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest">Voice Architecture</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest">Linguistic DNA</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest text-center">Lifecycle</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6b7280] uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f5]">
              {filteredVoices.map((voice) => (
                <tr key={voice.id} className="hover:bg-[#fcfdfe] transition-colors group">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center text-[#111827] group-hover:bg-[#111827] group-hover:text-white transition-all shadow-sm">
                        <Mic size={20} strokeWidth={2.5} />
                      </div>
                      <div className="max-w-xs">
                        <div className="text-[15px] font-black text-[#111827] flex items-center gap-2 tracking-tight">
                           {voice.name}
                           {voice.is_premium && <span className="text-[8px] bg-[#111827] text-[#f5c518] px-2 py-0.5 rounded-full font-black tracking-widest shadow-lg shadow-navy/20">PRO</span>}
                        </div>
                        <div className="text-[11px] text-[#6b7280] font-bold mt-1 line-clamp-1 opacity-80">{voice.description || 'No description provided'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-col gap-2">
                      <span className="flex items-center gap-2 text-[13px] font-black text-[#111827] uppercase tracking-tight">
                        <Globe size={14} className="text-[#f5c518]" /> {voice.language}
                      </span>
                      <span className="flex items-center gap-2 text-[11px] font-bold text-[#6b7280] uppercase tracking-widest opacity-60">
                        <User size={12} strokeWidth={3} /> {voice.gender}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <button 
                      onClick={() => handleToggleActive(voice.id, voice.is_active)}
                      className={`
                        inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm
                        ${voice.is_active 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'}
                      `}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${voice.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {voice.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      {voice.sample_url && (
                        <button className="w-10 h-10 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] hover:bg-[#111827] hover:text-[#f5c518] flex items-center justify-center text-[#6b7280] transition-all shadow-sm" title="Preview Audio">
                          <Play size={16} fill="currentColor" stroke="none" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(voice.id)}
                        className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white flex items-center justify-center text-rose-600 transition-all shadow-sm"
                        title="Purge Voice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Voice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-[24px] p-8 border border-[#e9ecef] shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black font-['Syne'] tracking-tight text-[#111827]">Expand Library</h2>
                <p className="text-[10px] text-[#6b7280] font-black uppercase tracking-widest mt-1">Integrate a new AI voice profile</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center text-[#9ca3af] hover:text-[#111827] hover:bg-[#f1f3f5] transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-[#374151] tracking-widest px-1">Display Alias</label>
                 <input 
                   type="text" 
                   className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-4 text-[14px] font-bold text-[#111827] outline-none focus:ring-4 focus:ring-[#f5c518]/5 focus:bg-white transition-all shadow-sm"
                   placeholder="e.g. Rachel Premium"
                   value={newVoice.name}
                   onChange={e => setNewVoice({...newVoice, name: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-[#374151] tracking-widest px-1">Native Language</label>
                 <select 
                   className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-4 text-[11px] font-black text-[#111827] uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-[#f5c518]/5 transition-all shadow-sm"
                   value={newVoice.language}
                   onChange={e => setNewVoice({...newVoice, language: e.target.value})}
                 >
                   {LANGUAGES.filter(l => l !== 'All').map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-[#374151] tracking-widest px-1">Vocal Profile</label>
                 <select 
                   className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-4 text-[11px] font-black text-[#111827] uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-[#f5c518]/5 transition-all shadow-sm"
                   value={newVoice.gender}
                   onChange={e => setNewVoice({...newVoice, gender: e.target.value})}
                 >
                   {GENDERS.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-[#374151] tracking-widest px-1">Sample Artifact URI</label>
                 <input 
                   type="text" 
                   className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-4 text-[14px] font-medium text-[#111827] placeholder:text-[#adb5bd] outline-none focus:ring-4 focus:ring-[#f5c518]/5 focus:bg-white transition-all shadow-sm"
                   placeholder="https://storage.provider/..."
                   value={newVoice.sample_url}
                   onChange={e => setNewVoice({...newVoice, sample_url: e.target.value})}
                 />
               </div>
               <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black uppercase text-[#374151] tracking-widest px-1">Acoustic Description</label>
                 <textarea 
                   className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-3xl p-5 text-[14px] font-medium text-[#374151] h-28 resize-none outline-none focus:ring-4 focus:ring-[#f5c518]/5 focus:bg-white transition-all shadow-sm leading-relaxed"
                   placeholder="Describe the sonic character... e.g. Authoritative yet warm, mid-range."
                   value={newVoice.description}
                   onChange={e => setNewVoice({...newVoice, description: e.target.value})}
                 />
               </div>
               <div className="md:col-span-2 flex items-center justify-between p-5 bg-[#fcfdfe] rounded-3xl border border-[#e9ecef] shadow-inner">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-[#111827] text-[#f5c518] rounded-xl flex items-center justify-center font-black text-[10px] tracking-widest shadow-xl shadow-navy/20">PRO</div>
                     <div>
                        <div className="text-[13px] font-black text-[#111827] uppercase tracking-tight">Premium Tier Allocation</div>
                        <div className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest mt-0.5">Visible only to active subscribers</div>
                     </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 accent-[#111827] cursor-pointer"
                    checked={newVoice.is_premium}
                    onChange={e => setNewVoice({...newVoice, is_premium: e.target.checked})}
                  />
               </div>
            </div>

            <button 
              onClick={handleAddVoice}
              className="w-full py-5 bg-[#f5c518] text-[#111827] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-xl shadow-yellow-500/20"
            >
              Commit to Library
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
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
