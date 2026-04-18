import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    // Validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email and message required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // ✅ Sanitize — prevent XSS/injection
    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    const safeName = escapeHtml(name.trim())
    const safeEmail = escapeHtml(email.trim())
    const safeSubject = escapeHtml((subject || 'General Inquiry').trim())
    const safeMessage = escapeHtml(message.trim())

    // Send email to owner
    await resend.emails.send({
      from: 'FlashTTS Contact <noreply@flashtts.com>',
      to: process.env.OWNER_NOTIFICATION_EMAIL!,
      replyTo: safeEmail,
      subject: `📩 Contact: ${safeSubject} — from ${safeName}`,
      html: `
        <div style="font-family: sans-serif;
          max-width: 600px; margin: 0 auto;
          padding: 24px; background: #fff;">

          <h2 style="color: #E8522A; margin: 0 0 24px;">
            📩 New Contact Form Submission
          </h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #999;
                width: 80px; font-size: 13px;">
                Name
              </td>
              <td style="padding: 8px 0; font-weight: 700; font-size: 13px;">
                ${safeName}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #999; font-size: 13px;">
                Email
              </td>
              <td style="padding: 8px 0; font-size: 13px;">
                <a href="mailto:${safeEmail}" style="color: #E8522A;">
                  ${safeEmail}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #999; font-size: 13px;">
                Subject
              </td>
              <td style="padding: 8px 0; font-size: 13px;">
                ${safeSubject}
              </td>
            </tr>
          </table>

          <div style="background: #f9f9f9;
            border-left: 4px solid #E8522A;
            border-radius: 8px; padding: 16px;
            margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 11px;
              color: #999; text-transform: uppercase;
              letter-spacing: 1px;">
              Message
            </p>
            <p style="margin: 0; font-size: 15px;
              line-height: 1.7; color: #333;
              white-space: pre-wrap;">
              ${safeMessage}
            </p>
          </div>

          <p style="color: #999; font-size: 12px;
            margin-top: 24px;">
            Sent from FlashTTS Contact Form<br/>
            Reply directly to this email to respond to ${safeName}
          </p>
        </div>
      `
    })

    // Send confirmation to user
    await resend.emails.send({
      from: 'FlashTTS <noreply@flashtts.com>',
      to: safeEmail,
      subject: "We received your message — FlashTTS",
      html: `
        <div style="font-family: sans-serif;
          max-width: 600px; margin: 0 auto;
          padding: 24px; background: #fff;">

          <h2 style="color: #E8522A;">
            Thanks for reaching out, ${safeName}!
          </h2>

          <p style="font-size: 15px; color: #333;
            line-height: 1.7;">
            We've received your message and will 
            get back to you within 24 hours.
          </p>

          <div style="background: #f9f9f9;
            border-radius: 8px; padding: 16px;
            margin: 20px 0;">
            <p style="margin: 0; font-size: 13px;
              color: #666; font-style: italic;">
              Your message: "${safeMessage.slice(0, 200)}${safeMessage.length > 200 ? '...' : ''}"
            </p>
          </div>

          <p style="font-size: 14px; color: #666;">
            — The FlashTTS Team
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

          <p style="font-size: 12px; color: #999;">
            flashtts.com · 
            <a href="https://flashtts.com" style="color: #E8522A;">
              Visit Website
            </a>
          </p>
        </div>
      `
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[CONTACT]', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
