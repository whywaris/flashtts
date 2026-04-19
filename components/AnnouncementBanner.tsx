'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
}

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  info:    { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', icon: 'ℹ️' },
  warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', icon: '⚠️' },
  success: { bg: '#F0FDF4', border: '#22C55E', text: '#14532D', icon: '✅' },
  error:   { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', icon: '🚨' },
}

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<Announcement | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, message, type')
        .eq('is_active', true)
        .or('ends_at.is.null,ends_at.gt.' + new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        const key = `dismissed_announcement_${data.id}`
        if (sessionStorage.getItem(key)) return
        setBanner(data)
      }
    }

    load()
  }, [])

  if (!banner || dismissed) return null

  const s = TYPE_STYLES[banner.type] ?? TYPE_STYLES.info

  function dismiss() {
    sessionStorage.setItem(`dismissed_announcement_${banner!.id}`, 'true')
    setDismissed(true)
  }

  return (
    <div style={{
      width: '100%',
      background: s.bg,
      borderLeft: `4px solid ${s.border}`,
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>{s.icon}</span>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: s.text }}>{banner.title}</span>
          <span style={{ fontSize: '13px', color: s.text, marginLeft: '8px', opacity: 0.85 }}>{banner.message}</span>
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0, background: 'transparent', border: 'none',
          cursor: 'pointer', color: s.text, fontSize: '18px', lineHeight: 1,
          opacity: 0.6, padding: '0 4px',
        }}
      >
        ×
      </button>
    </div>
  )
}
