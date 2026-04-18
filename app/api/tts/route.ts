import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const PLANS: Record<string, { perRequest: number }> = {
  free: { perRequest: 500 },
  starter: { perRequest: 3000 },
  creator: { perRequest: 5000 },
  pro: { perRequest: 10000 },
  studio: { perRequest: 20000 },
};

// Guest rate limiting via Upstash Redis REST API (10 req/min per IP)
async function checkGuestRateLimit(ip: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false; // fail closed — no Redis = no guest access

  try {
    const key = `rl:guest:${ip}`;
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, 60]]),
    });
    const data = await res.json();
    const count: number = data[0]?.result ?? 0;
    return count <= 10;
  } catch {
    return true;
  }
}

// Validate that voice_url is an absolute https URL pointing to an allowed domain
function isValidVoiceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const allowed = [
      process.env.CLOUDFLARE_R2_PUBLIC_URL,
      'supabase.co',
      'supabase.in',
    ].filter(Boolean);
    return allowed.some(a => parsed.hostname === new URL(a!).hostname || parsed.hostname.endsWith('.supabase.co'));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      text,
      voice_id,
      voice_name,
      voice_url,       // ✅ Frontend can pass sample_url directly
      speed = 1.0,
      language = 'en',
      guest = false,   // guest trial (no auth required, 250 char limit)
    } = await req.json()

    // ── Validation ───────────────────────────────────────────────────────────
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const inputChars: number = text.length

    // ── Guest mode (homepage demo) ───────────────────────────────────────────
    if (guest) {
      if (inputChars > 250) {
        return NextResponse.json({ error: 'Demo limit: 250 characters max' }, { status: 400 })
      }
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const allowed = await checkGuestRateLimit(ip);
      if (!allowed) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
      return await callRunPod({ text, voice_id: null, voice_url: null, voice_name: 'Demo', speed: 1.0, language })
    }

    // ── Auth ─────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Profile ──────────────────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, credits_used, credits_limit, is_banned')
      .eq('id', user.id)
      .single()

    if (profile?.is_banned) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    const planKey = (profile?.plan || 'free').toLowerCase()
    const plan = PLANS[planKey] || PLANS['free']

    // ── Limit checks ─────────────────────────────────────────────────────────
    if (inputChars > plan.perRequest) {
      return NextResponse.json(
        { error: `Per request limit exceeded. Max ${plan.perRequest.toLocaleString()} chars on your plan.` },
        { status: 400 }
      )
    }

    // Atomically deduct credits before generating — prevents concurrent-request abuse
    const { data: reserved, error: reserveErr } = await supabase.rpc('deduct_credits_atomic', {
      p_user_id: user.id,
      p_amount: inputChars,
    })

    if (reserveErr || !reserved) {
      return NextResponse.json(
        { error: 'Credit limit reached. Please upgrade your plan.' },
        { status: 402 }
      )
    }

    // ── Resolve voice sample URL ──────────────────────────────────────────────
    // Priority: 1) voice_url passed directly from frontend (must pass allowlist check)
    //           2) Lookup from voices table using voice_id
    //           3) Lookup from saved_voices r2_url (for cloned voices)
    let resolvedVoiceUrl: string | null = null

    if (voice_url) {
      if (!isValidVoiceUrl(voice_url)) {
        return NextResponse.json({ error: 'Invalid voice URL' }, { status: 400 })
      }
      resolvedVoiceUrl = voice_url;
    }

    if (!resolvedVoiceUrl && voice_id) {
      // Try voices table first (library voices)
      const { data: libVoice } = await supabase
        .from('voices')
        .select('sample_url')
        .eq('id', voice_id)
        .single()

      if (libVoice?.sample_url) {
        resolvedVoiceUrl = libVoice.sample_url
      } else {
        // Try saved_voices r2_url (cloned voices)
        const { data: savedVoice } = await supabase
          .from('saved_voices')
          .select('r2_url, sample_url')
          .eq('voice_id', voice_id)
          .eq('user_id', user.id)
          .single()

        resolvedVoiceUrl = savedVoice?.r2_url || savedVoice?.sample_url || null
      }
    }

    // ── Call RunPod ───────────────────────────────────────────────────────────
    const result = await callRunPod({
      text,
      voice_id,
      voice_url: resolvedVoiceUrl,
      voice_name,
      speed,
      language,
    })

    // If RunPod failed, refund credits atomically
    if (result instanceof NextResponse && result.status !== 200) {
      await supabase.rpc('increment_credits', { user_id: user.id, amount: -inputChars })
      return result
    }

    // ── Save to history ───────────────────────────────────────────────────────
    try {
      await supabase.from('tts_jobs').insert({
        user_id: user.id, voice_id, voice_name,
        text_input: text, char_count: inputChars,
        language, created_at: new Date().toISOString(),
      })
    } catch (e) { console.error('[TTS] History save failed:', e) }

    return result

  } catch (error: any) {
    console.error('[TTS] API error:', error)
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 })
  }
}

// ── RunPod helper ─────────────────────────────────────────────────────────────
async function callRunPod({
  text, voice_id, voice_url, voice_name, speed, language,
}: {
  text: string; voice_id?: string | null; voice_url?: string | null;
  voice_name?: string | null; speed: number; language: string;
}): Promise<NextResponse> {

  if (!process.env.RUNPOD_API_KEY || !process.env.RUNPOD_CHATTERBOX_ENDPOINT) {
    return NextResponse.json({ error: 'TTS service not configured' }, { status: 500 })
  }

  const runpodUrl = `https://api.runpod.ai/v2/${process.env.RUNPOD_CHATTERBOX_ENDPOINT}/runsync`

  const runpodBody = {
    input: {
      text,
      // ✅ Pass resolved voice URL — this is what RunPod uses for voice cloning/selection
      voice: voice_url || null,
      voice_url: voice_url || null,   // some handlers use this key
      voice_id: voice_id || null,
      voice_name: voice_name || null,
      speed,
      language,
      output_format: 'mp3',
    }
  }

  const res = await fetch(runpodUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
    },
    body: JSON.stringify(runpodBody),
  })

  if (!res.ok) {
    const errorText = await res.text()
    return NextResponse.json(
      { error: `RunPod error (${res.status}): ${errorText.slice(0, 200)}` },
      { status: 500 }
    )
  }

  const data = await res.json()
  const audioBase64 =
    data.output?.audio_base64 ||
    data.output?.audio ||
    data.output

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return NextResponse.json({ error: 'No audio generated' }, { status: 500 })
  }

  const audioBuffer = Buffer.from(audioBase64, 'base64')

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="flashtts-audio.mp3"',
      'Content-Length': audioBuffer.length.toString(),
      'Cache-Control': 'no-cache',
    },
  })
}