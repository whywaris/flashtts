'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  info:    { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'Info' },
  warning: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Warning' },
  success: { bg: '#F0FDF4', text: '#14532D', border: '#BBF7D0', label: 'Success' },
  error:   { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', label: 'Error' },
}

const EMPTY_FORM = { title: '', message: '', type: 'info' as const, is_active: false, starts_at: '', ends_at: '' }

export default function AnnouncementsPage() {
  const supabase = createClient()

  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  function openNew() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
  }

  function openEdit(a: Announcement) {
    setEditingId(a.id)
    setForm({
      title: a.title,
      message: a.message,
      type: a.type,
      is_active: a.is_active,
      starts_at: a.starts_at ? a.starts_at.slice(0, 10) : '',
      ends_at: a.ends_at ? a.ends_at.slice(0, 10) : '',
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.message.trim()) return
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      type: form.type,
      is_active: form.is_active,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    }

    if (editingId) {
      const { error } = await supabase.from('announcements').update(payload).eq('id', editingId)
      if (!error) {
        setItems(prev => prev.map(a => a.id === editingId ? { ...a, ...payload } : a))
      }
    } else {
      const { data, error } = await supabase.from('announcements').insert(payload).select().single()
      if (!error && data) setItems(prev => [data, ...prev])
    }

    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (!error) setItems(prev => prev.filter(a => a.id !== id))
    setDeleteConfirmId(null)
  }

  async function handleToggle(a: Announcement) {
    setTogglingId(a.id)
    const next = !a.is_active
    // Optimistic update
    setItems(prev => prev.map(x => x.id === a.id ? { ...x, is_active: next } : x))
    await supabase.from('announcements').update({ is_active: next }).eq('id', a.id)
    setTogglingId(null)
  }

  const cardStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px',
    padding: '18px 20px', display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
  }

  return (
    <div style={{ fontFamily: 'Geist, sans-serif', maxWidth: '860px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: '0 0 4px', fontFamily: 'Syne, sans-serif' }}>Announcements</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Manage platform-wide banners shown to all users.</p>
        </div>
        <button
          onClick={openNew}
          style={{ padding: '10px 18px', background: '#f5c518', color: '#111', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
        >
          + New Announcement
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111', margin: '0 0 18px', fontFamily: 'Syne, sans-serif' }}>
            {editingId ? 'Edit Announcement' : 'New Announcement'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Title */}
            <div>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Announcement title"
                style={inputStyle}
              />
            </div>

            {/* Message */}
            <div>
              <label style={labelStyle}>Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Announcement message..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Type + Active row */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={labelStyle}>Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                  style={inputStyle}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={labelStyle}>Start Date (optional)</label>
                <input type="date" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} style={inputStyle} />
              </div>

              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={labelStyle}>End Date (optional)</label>
                <input type="date" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            {/* Active toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                style={{
                  width: '40px', height: '22px', borderRadius: '11px',
                  background: form.is_active ? '#22c55e' : '#d1d5db',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: '3px', left: form.is_active ? '21px' : '3px',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
              <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>
                {form.is_active ? 'Active — visible to users' : 'Inactive — hidden from users'}
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.message.trim()}
                style={{ padding: '10px 20px', background: '#f5c518', color: '#111', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: (!form.title.trim() || !form.message.trim()) ? 0.5 : 1 }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setForm({ ...EMPTY_FORM }) }}
                style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📢</div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>No announcements yet</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Create one to show a banner to all users.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map(a => {
            const ts = TYPE_STYLES[a.type] ?? TYPE_STYLES.info
            return (
              <div key={a.id} style={cardStyle}>

                {/* Left: info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{a.title}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}>
                      {ts.label}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: a.is_active ? '#dcfce7' : '#f3f4f6', color: a.is_active ? '#166534' : '#6b7280', border: `1px solid ${a.is_active ? '#bbf7d0' : '#e5e5e5'}` }}>
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>
                    {a.message.slice(0, 100)}{a.message.length > 100 ? '…' : ''}
                  </p>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Created {new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {a.ends_at && ` · Expires ${new Date(a.ends_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`}
                  </div>
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

                  {/* Active toggle */}
                  <div
                    onClick={() => !togglingId && handleToggle(a)}
                    style={{
                      width: '36px', height: '20px', borderRadius: '10px',
                      background: a.is_active ? '#22c55e' : '#d1d5db',
                      position: 'relative', cursor: togglingId === a.id ? 'wait' : 'pointer', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: '3px', left: a.is_active ? '19px' : '3px',
                      transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }} />
                  </div>

                  <button
                    onClick={() => openEdit(a)}
                    style={{ padding: '6px 14px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Edit
                  </button>

                  {deleteConfirmId === a.id ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Sure?</span>
                      <button
                        onClick={() => handleDelete(a.id)}
                        style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        style={{ padding: '6px 10px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(a.id)}
                      style={{ padding: '6px 14px', background: '#fff', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: '#f9f9f9',
  border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px',
  color: '#111', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
