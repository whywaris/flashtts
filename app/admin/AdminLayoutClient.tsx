'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import {
  LayoutDashboard, Users, DollarSign, FileText, Music,
  BarChart2, Shield, Mail, LogOut, ArrowLeft, Zap, Megaphone
} from 'lucide-react'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient()
      const { data: { user: userRes } } = await supabase.auth.getUser()
      if (!userRes) { router.push('/login'); return; }
      setUser(userRes)

      const { data: profileRes } = await supabase.from('profiles').select('*').eq('id', userRes.id).single()
      setProfile(profileRes)

      if (profileRes?.role !== 'admin') {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }
    checkAdmin()
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#f5c518]/20 border-t-[#f5c518] rounded-full animate-spin" />
    </div>
  )

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-6">🔐</div>
      <h1 className="text-2xl font-black mb-2" style={{ fontFamily: 'Instrument Serif, serif' }}>Access Denied</h1>
      <p className="text-[#6b7280] max-w-md mb-8" style={{ fontFamily: 'Geist, sans-serif' }}>
        Your account ({user?.email}) does not have admin privileges.
      </p>
      <Link href="/dashboard" className="px-6 py-3 bg-[#1a1a2e] text-white rounded-xl font-bold flex items-center gap-2 no-underline" style={{ fontFamily: 'Geist, sans-serif' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
    </div>
  )

  const navGroups = [
    {
      title: 'MENU',
      items: [
        { label: 'Overview',            href: '/admin',                  icon: LayoutDashboard },
        { label: 'Users',               href: '/admin/users',            icon: Users },
        { label: 'Announcements',       href: '/admin/announcements',    icon: Megaphone },
        { label: 'Revenue',             href: '/admin/revenue',          icon: DollarSign },
        { label: 'Write & Manage Blog', href: '/admin/blog',    icon: FileText },
        { label: 'Add & Manage Voices', href: '/admin/voices',  icon: Music },
        { label: 'Usage',               href: '/admin/usage',   icon: BarChart2 },
      ]
    },
    {
      title: 'GENERAL',
      items: [
        { label: 'Abuse Control',  href: '/admin/abuse',   icon: Shield },
        { label: 'Send Emails',    href: '/admin/emails',  icon: Mail },
      ]
    }
  ]

  const pageTitle = navGroups.flatMap(g => g.items).find(i => i.href === pathname)?.label || 'Admin Panel'

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] font-['Geist']">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-[#e9ecef] flex flex-col sticky top-0 h-screen shrink-0 relative z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#f5c518] rounded-full flex items-center justify-center font-black text-[#111827]">F</div>
            <div>
               <div className="font-black text-xl tracking-tight leading-none text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>FlashTTS</div>
               <div className="bg-[#fffbeb] text-[#f5c518] text-[9px] font-bold px-2 py-0.5 rounded-full inline-block border border-[#f5c518]/20 mt-1 uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>ADMIN</div>
            </div>
          </div>

          <nav className="space-y-8">
            {navGroups.map(group => (
              <div key={group.title}>
                <div className="text-[10px] font-black text-[#9ca3af] tracking-widest mb-4 px-3 uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>{group.title}</div>
                <div className="space-y-1">
                  {group.items.map(item => {
                    const active = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all group no-underline
                          ${active 
                            ? 'bg-[#fffbeb] text-[#111827] font-bold border-l-[3px] border-[#f5c518]' 
                            : 'text-[#6b7280] hover:bg-[#f8f9fa] hover:text-[#111827]'}
                        `}
                      >
                        <Icon size={18} className={active ? 'text-[#f5c518]' : 'text-[#9ca3af] group-hover:text-[#111827]'} />
                        <span className="text-[13.5px]" style={{ fontFamily: 'Geist, sans-serif' }}>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 text-center">
          <div className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest" style={{ fontFamily: 'Geist, sans-serif' }}>
            v1.0.4 Secure
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-[70px] bg-white border-b border-[#e9ecef] px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-black m-0 text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-[#e9ecef]">
              <div className="text-right hidden sm:block">
                <div className="text-[13px] font-bold text-[#111827]" style={{ fontFamily: 'Geist, sans-serif' }}>{profile?.full_name || 'Admin User'}</div>
                <div className="text-[11px] text-[#6b7280] font-medium" style={{ fontFamily: 'Geist, sans-serif' }}>{user?.email || 'admin@flashtts.com'}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center font-bold text-[#111827]" style={{ fontFamily: 'Geist, sans-serif' }}>
                {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>

            <Link href="/dashboard" className="px-5 py-2.5 bg-[#f8f9fa] border border-[#e9ecef] rounded-xl text-[11px] font-black uppercase tracking-widest text-[#6b7280] hover:text-[#111827] hover:bg-[#fffbeb] hover:border-[#f5c518]/20 transition-all flex items-center gap-2 group shadow-sm no-underline" style={{ fontFamily: 'Geist, sans-serif' }}>
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
               Exit Admin
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-[1600px] w-full mx-auto" style={{ fontFamily: 'Geist, sans-serif' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
