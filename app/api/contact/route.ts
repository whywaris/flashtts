import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'FlashTTS Contact <noreply@flashtts.com>',
      to: ['support@flashtts.com'],
      subject: `Contact Form: ${subject} from ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111827;">
          <h2 style="font-size: 24px; font-weight: 800; border-bottom: 2px solid #f1f3f5; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p style="margin-top: 20px;"><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
            <p style="font-weight: 800; font-size: 14px; text-transform: uppercase; color: #6b7280; margin-bottom: 10px;">Message:</p>
            <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
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
