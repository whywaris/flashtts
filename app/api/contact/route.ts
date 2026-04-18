import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const safeName = escapeHtml(String(name).slice(0, 200));
    const safeEmail = escapeHtml(String(email).slice(0, 200));
    const safeSubject = escapeHtml(String(subject).slice(0, 500));
    const safeMessage = escapeHtml(String(message).slice(0, 5000));

    const { data, error } = await resend.emails.send({
      from: 'FlashTTS Contact <noreply@flashtts.com>',
      to: ['support@flashtts.com'],
      subject: `Contact Form: ${safeSubject} from ${safeName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111827;">
          <h2 style="font-size: 24px; font-weight: 800; border-bottom: 2px solid #f1f3f5; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p style="margin-top: 20px;"><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
            <p style="font-weight: 800; font-size: 14px; text-transform: uppercase; color: #6b7280; margin-bottom: 10px;">Message:</p>
            <p style="line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
