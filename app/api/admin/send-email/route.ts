import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { to, subject, message, template } = await req.json()
    
    // 1. Verify admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'FlashTTS <noreply@flashtts.com>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #080810; color: #f0f0f8; padding: 40px; border-radius: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 30px;">
            <div style="width: 32px; height: 32px; background: #f5c518; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #000;">F</div>
            <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #f5c518;">FlashTTS</span>
          </div>
          <h2 style="color: #f5c518; font-family: 'Syne', sans-serif; font-size: 24px; margin-bottom: 20px;">${subject}</h2>
          <p style="font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">${message}</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #7a7a9a;">
            <p>FlashTTS Team — The Fastest AI Voice Platform</p>
            {/* Footer space removed */}
          </div>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    // 3. Log email in database
    await supabase.from('email_logs').insert({
      email_to: to,
      subject,
      template,
      status: 'sent',
      resend_id: data?.id
    })

    return NextResponse.json({ success: true, id: data?.id })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
