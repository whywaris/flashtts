import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const PLANS: Record<string, { perRequest: number }> = {
  free:    { perRequest: 500 },
  starter: { perRequest: 3000 },
  creator: { perRequest: 5000 },
  pro:     { perRequest: 10000 },
  studio:  { perRequest: 20000 },
};

export async function POST(req: NextRequest) {
  try {
    const { text, voice_id, voice_name, speed = 1.0, language = 'en' } = await req.json()

    // ── Validation ───────────────────────────────────────────────────────────
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const inputChars: number = text.length

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

    // Banned check
    if (profile?.is_banned) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    const planKey = (profile?.plan || 'free').toLowerCase()
    const plan = PLANS[planKey] || PLANS['free']

    // ── Limit checks ─────────────────────────────────────────────────────────
    // 1. Per-request character limit
    if (inputChars > plan.perRequest) {
      return NextResponse.json(
        { error: `Per request limit exceeded. Max ${plan.perRequest.toLocaleString()} chars on your plan.` },
        { status: 400 }
      )
    }

    // 2. Monthly credits limit
    const creditsUsed = profile?.credits_used || 0
    const creditsLimit = profile?.credits_limit || 10000

    if (creditsUsed + inputChars > creditsLimit) {
      return NextResponse.json(
        { error: 'Credit limit reached. Please upgrade your plan.' },
        { status: 402 }
      )
    }

    // ── RunPod config check ───────────────────────────────────────────────────
    // NOTE: env var is RUNPOD_CHATTERBOX_ENDPOINT (not RUNPOD_ENDPOINT_ID)
    if (!process.env.RUNPOD_API_KEY || !process.env.RUNPOD_CHATTERBOX_ENDPOINT) {
      console.error('[TTS] Missing env vars — RUNPOD_API_KEY or RUNPOD_CHATTERBOX_ENDPOINT not set')
      return NextResponse.json({ error: 'TTS service not configured' }, { status: 500 })
    }

    // ── Call RunPod Chatterbox TTS ────────────────────────────────────────────
    const runpodUrl = `https://api.runpod.ai/v2/${process.env.RUNPOD_CHATTERBOX_ENDPOINT}/runsync`
    console.log('[TTS] Calling RunPod endpoint:', process.env.RUNPOD_CHATTERBOX_ENDPOINT)

    const runpodResponse = await fetch(runpodUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
      body: JSON.stringify({
        input: {
          text: text,
          voice: voice_id || null,
          voice_name: voice_name || null,
          speed: speed,
          language: language,
          output_format: 'mp3',
        }
      }),
    })

    console.log('[TTS] RunPod HTTP status:', runpodResponse.status)

    if (!runpodResponse.ok) {
      const errorText = await runpodResponse.text()
      console.error('[TTS] RunPod error body:', errorText)
      return NextResponse.json(
        { error: `RunPod error (${runpodResponse.status}): ${errorText.slice(0, 200)}` },
        { status: 500 }
      )
    }

    const runpodData = await runpodResponse.json()
    console.log('[TTS] RunPod response status:', runpodData.status)

    // Support multiple output shapes from Chatterbox handler
    const audioBase64 =
      runpodData.output?.audio_base64 ||
      runpodData.output?.audio ||
      runpodData.output

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      console.error('[TTS] No audio in RunPod response:', JSON.stringify(runpodData))
      return NextResponse.json({ error: 'No audio generated' }, { status: 500 })
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64')

    // ── Update credits used ───────────────────────────────────────────────────
    await supabase.rpc('increment_credits', {
      user_id: user.id,
      amount: inputChars,
    })

    // --- History Save Block ---
    try {
      await supabase.from('tts_jobs').insert({
        user_id: user.id,
        voice_id,
        voice_name,
        text_input: text,
        char_count: inputChars,
        language: language,
        created_at: new Date().toISOString()
      });
    } catch (histError) {
      console.error("Failed to save history:", histError);
    }

    // ── Return audio ──────────────────────────────────────────────────────────
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="flashtts-audio.mp3"',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error: any) {
    console.error('[TTS] API error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
