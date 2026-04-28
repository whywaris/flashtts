import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { submitRunPodJob, pollRunPodJob } from '@/lib/runpod'

export const maxDuration = 120

const CLONE_LIMITS: Record<string, number> = {
  free: 1, starter: 3, creator: 10, pro: 25, studio: 999,
}

function r2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  })
}

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  if (!process.env.RUNPOD_API_KEY || !process.env.RUNPOD_ENDPOINT_ID) {
    return NextResponse.json({ error: 'TTS service not configured' }, { status: 500 })
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = adminClient()

    // ── Profile + plan ──────────────────────────────────────────────────────
    const { data: profile } = await admin
      .from('profiles')
      .select('plan, is_banned')
      .eq('id', user.id)
      .single()

    if (profile?.is_banned) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    const plan       = profile?.plan || 'free'
    const cloneLimit = CLONE_LIMITS[plan] ?? 1

    // ── Clone count check (studio = unlimited = 999) ─────────────────────────
    if (cloneLimit < 999) {
      const { count } = await admin
        .from('saved_voices')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('source', 'cloned')

      if ((count ?? 0) >= cloneLimit) {
        return NextResponse.json({
          error: 'clone_limit_reached',
          message: `Your ${plan} plan allows ${cloneLimit} voice ${cloneLimit === 1 ? 'clone' : 'clones'}. Upgrade to create more.`,
        }, { status: 402 })
      }
    }

    // ── Parse multipart form ────────────────────────────────────────────────
    const form      = await req.formData()
    const voiceName = (form.get('voiceName') as string | null)?.trim()
    const audioFile = form.get('audioFile') as File | null

    if (!voiceName) return NextResponse.json({ error: 'Voice name is required' }, { status: 400 })
    if (!audioFile) return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    if (audioFile.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large. Max 20MB.' }, { status: 400 })
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    // ── Magic byte validation (no client MIME trust) ──────────────────────
    const magic    = audioBuffer.slice(0, 12)
    const isWebm   = magic[0] === 0x1a && magic[1] === 0x45 && magic[2] === 0xdf && magic[3] === 0xa3
    const isMp3Id3 = magic[0] === 0x49 && magic[1] === 0x44 && magic[2] === 0x33
    const isMp3Sync = magic[0] === 0xff && (magic[1] & 0xe0) === 0xe0
    const isWav    = magic[0] === 0x52 && magic[1] === 0x49 && magic[2] === 0x46 && magic[3] === 0x46
    const isOgg    = magic[0] === 0x4f && magic[1] === 0x67 && magic[2] === 0x67 && magic[3] === 0x53
    const isM4a    = magic[4] === 0x66 && magic[5] === 0x74 && magic[6] === 0x79 && magic[7] === 0x70

    if (!isWebm && !isMp3Id3 && !isMp3Sync && !isWav && !isOgg && !isM4a) {
      return NextResponse.json({ error: 'Invalid audio file. Upload MP3, WAV, M4A, OGG, or WebM.' }, { status: 400 })
    }

    const contentType = isWebm ? 'audio/webm'
      : (isMp3Id3 || isMp3Sync) ? 'audio/mpeg'
      : isWav ? 'audio/wav'
      : isOgg ? 'audio/ogg'
      : 'audio/mp4'
    const ext = isWebm ? 'webm' : isWav ? 'wav' : isOgg ? 'ogg' : 'mp3'

    // ── Validate voice on RunPod ────────────────────────────────────────────
    const reference_audio_b64 = audioBuffer.toString('base64')

    const jobId = await submitRunPodJob({
      text:               'Hello! This is your cloned voice.',
      language_id:        'en',
      exaggeration:       0.5,
      cfg_weight:         0.5,
      reference_audio_b64,
    })
    await pollRunPodJob(jobId) // discard output — validates the sample works

    // ── Upload to Cloudflare R2 ─────────────────────────────────────────────
    const r2Key = `cloned-voices/${user.id}/${Date.now()}.${ext}`
    await r2Client().send(new PutObjectCommand({
      Bucket:      process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key:         r2Key,
      Body:        audioBuffer,
      ContentType: contentType,
    }))
    const r2Url = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${r2Key}`

    // ── Save to saved_voices ────────────────────────────────────────────────
    const voiceId = crypto.randomUUID()
    const { error: dbErr } = await admin.from('saved_voices').insert({
      user_id:    user.id,
      voice_id:   voiceId,
      voice_name: voiceName,
      source:     'cloned',
      r2_url:     r2Url,
      language:   'en',
      gender:     'neutral',
    })

    if (dbErr) {
      console.error('[TTS clone] DB insert:', dbErr.message)
      return NextResponse.json({ error: 'Failed to save voice clone' }, { status: 500 })
    }

    return NextResponse.json({ voiceId, name: voiceName, r2_url: r2Url })

  } catch (err: any) {
    console.error('[TTS clone]', err.message)
    return NextResponse.json(
      { error: err.message || 'Voice cloning failed. Please try again.' },
      { status: 500 }
    )
  }
}
