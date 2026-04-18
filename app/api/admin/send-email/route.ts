import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAdmin } from '@/lib/admin-guard'
import { createClient } from '@/utils/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function buildHtml(subject: string, message: string): string {
  const safeSubject = escapeHtml(subject)
  const safeMessage = escapeHtml(message)
  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #080810; color: #f0f0f8; padding: 40px; border-radius: 20px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 30px;">
        <div style="width: 32px; height: 32px; background: #f5c518; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #000;">F</div>
        <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #f5c518;">FlashTTS</span>
      </div>
      <h2 style="color: #f5c518; font-family: 'Syne', sans-serif; font-size: 24px; margin-bottom: 20px;">${safeSubject}</h2>
      <p style="font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8); white-space: pre-wrap;">${safeMessage}</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #7a7a9a;">
        <p>FlashTTS Team — The Fastest AI Voice Platform</p>
      </div>
    </div>
  `
}

export async function POST(req: Request) {
  try {
    const denied = await requireAdmin()
    if (denied) return denied

    const { to, subject, message, template, audience } = await req.json()

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    const cleanSubject = String(subject).slice(0, 500)
    const cleanMessage = String(message).slice(0, 10000)
    const html = buildHtml(cleanSubject, cleanMessage)
    const supabase = await createClient()

    // ── Broadcast to segment ────────────────────────────────────────────────
    if (audience && audience !== 'Custom Email') {
      let query = supabase.from('profiles').select('email')
      if (audience === 'Paid Users') {
        query = query.not('plan', 'in', '("free","Free")')
      } else if (audience === 'Free Tier Only') {
        query = query.in('plan', ['free', 'Free'])
      }
      // 'All Users' — no extra filter

      const { data: profiles, error: fetchErr } = await query
      if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

      const emails = (profiles || []).map(p => p.email).filter(Boolean)
      if (emails.length === 0) {
        return NextResponse.json({ error: 'No users found for this audience' }, { status: 400 })
      }

      // Resend batch (max 100 per call)
      let sent = 0
      for (let i = 0; i < emails.length; i += 100) {
        const batch = emails.slice(i, i + 100)
        for (const email of batch) {
          await resend.emails.send({ from: 'FlashTTS <noreply@flashtts.com>', to: [email], subject: cleanSubject, html })
          sent++
        }
      }

      await supabase.from('email_logs').insert({
        email_to: `[${audience}] ${sent} recipients`,
        subject: cleanSubject,
        template,
        status: 'sent',
      })

      return NextResponse.json({ success: true, sent })
    }

    // ── Single recipient ────────────────────────────────────────────────────
    if (!to) return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 })

    const { data, error } = await resend.emails.send({
      from: 'FlashTTS <noreply@flashtts.com>',
      to: [to],
      subject: cleanSubject,
      html,
    })

    if (error) return NextResponse.json({ error }, { status: 500 })

    await supabase.from('email_logs').insert({
      email_to: to,
      subject: cleanSubject,
      template,
      status: 'sent',
      resend_id: data?.id,
    })

    return NextResponse.json({ success: true, id: data?.id })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
