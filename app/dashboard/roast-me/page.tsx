'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Bug,
  DollarSign,
  Volume2,
  Zap,
  Layout,
  Lightbulb
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

// ─── Categories ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'bug', label: 'Bug', icon: Bug },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'voice', label: 'Voice Quality', icon: Volume2 },
  { id: 'speed', label: 'Performance', icon: Zap },
  { id: 'ui', label: 'UI Issue', icon: Layout },
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb },
]

// ─── Types ──────────────────────────────────────────────────────────────────
interface Feedback {
  id: string
  created_at: string
  original_complaint: string
  category: string
}

export default function RoastMePage() {
  const [category, setCategory] = useState('bug')
  const [complaint, setComplaint] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [previousFeedback, setPreviousFeedback] = useState<Feedback[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUserId(user.id)
      fetchHistory(user.id)
    }
    init()
  }, [])

  const fetchHistory = async (uid: string) => {
    const { data } = await supabase
      .from('roasts')
      .select('id, created_at, original_complaint, category')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) setPreviousFeedback(data)
  }

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      toast.error('Please write something')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint, category })
      })

      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        toast.success('Feedback sent!')
        if (userId) fetchHistory(userId)
      } else {
        throw new Error(data.error || 'Failed to send')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setComplaint('')
  }

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '580px', margin: '0 auto' }}>
      <title>Roast Me | FlashTTS</title>
      <Toaster position="top-right" />

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(232, 82, 42, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          border: '1px solid rgba(232, 82, 42, 0.2)'
        }}>
          <MessageSquare size={24} color="#E8522A" />
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>
          Roast Me
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
          Got an issue or suggestion? Tell us directly.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Category Pills */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
                WHAT WENT WRONG?
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const active = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '8px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s ease',
                        background: active ? '#E8522A' : 'var(--card-bg)',
                        color: active ? '#fff' : 'var(--muted)',
                        border: active ? '1px solid #E8522A' : '1px solid var(--border)',
                      }}
                    >
                      <Icon size={14} />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Textarea */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
                YOUR FEEDBACK
              </label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value.slice(0, 1000))}
                placeholder="Describe the issue or suggestion..."
                style={{
                  width: '100%', minHeight: '160px', padding: '16px', borderRadius: '16px',
                  background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)',
                  fontSize: '14px', lineHeight: 1.6, outline: 'none', resize: 'vertical'
                }}
              />
              <div style={{ 
                position: 'absolute', right: '16px', bottom: '12px', fontSize: '10px', 
                color: 'var(--muted)', opacity: 0.6, fontWeight: 700 
              }}>
                {complaint.length}/1000
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !complaint.trim()}
              style={{
                width: '100%', padding: '16px', borderRadius: '14px', background: '#E8522A',
                color: '#fff', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '10px', cursor: 'pointer', border: 'none',
                opacity: (loading || !complaint.trim()) ? 0.6 : 1, transition: 'transform 0.1s ease',
                fontFamily: 'Syne, sans-serif'
              }}
            >
              {loading ? (
                <>Sending...</>
              ) : (
                <><Send size={18} /> Send Feedback</>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              textAlign: 'center', padding: '48px 24px', background: 'var(--card-bg)', 
              borderRadius: '24px', border: '1px solid var(--border)' 
            }}
          >
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 211, 165, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
            }}>
              <CheckCircle2 size={32} color="#22d3a5" />
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: '0 0 12px' }}>
              Feedback Sent!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '32px' }}>
              Thanks! We'll look into it as soon as possible.
            </p>
            <button 
              onClick={resetForm}
              style={{ 
                background: 'var(--bg)', color: 'var(--text)', padding: '12px 24px', 
                borderRadius: '12px', border: '1px solid var(--border)', fontSize: '14px', 
                fontWeight: 600, cursor: 'pointer' 
              }}
            >
              Send Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Previous Feedback History */}
      {previousFeedback.length > 0 && (
        <div style={{ marginTop: '64px' }}>
          <h3 style={{ 
            fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, 
            color: 'var(--text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' 
          }}>
            <Clock size={16} /> Your Previous Feedback
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {previousFeedback.map((fb) => {
              const isExpanded = expandedId === fb.id
              const cat = CATEGORIES.find(c => c.id === fb.category) || CATEGORIES[0]
              const Icon = cat.icon
              return (
                <div 
                  key={fb.id}
                  onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                  style={{ 
                    background: 'var(--card-bg)', border: '1px solid var(--border)', 
                    borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        fontSize: '10px', padding: '4px 8px', borderRadius: '6px', 
                        background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', 
                        display: 'flex', alignItems: 'center', gap: '4px' 
                      }}>
                        <Icon size={10} /> {cat.label}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.6 }}>
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} color="var(--muted)" /> : <ChevronDown size={14} color="var(--muted)" />}
                  </div>
                  <p style={{ 
                    marginTop: '12px', fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text)',
                    display: isExpanded ? 'block' : '-webkit-box',
                    WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {fb.original_complaint}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        input::placeholder, textarea::placeholder { color: var(--muted); opacity: 0.3; }
        .space-y-8 > * + * { margin-top: 32px; }
      `}</style>
    </div>
  )
}
