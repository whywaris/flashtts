import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await req.formData()
    const file = form.get('audio') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Limit: 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 20MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Validate by magic bytes — do not trust client-supplied Content-Type
    const magic = buffer.slice(0, 12)
    const isWebm = magic[0] === 0x1a && magic[1] === 0x45 && magic[2] === 0xdf && magic[3] === 0xa3
    const isMp3Id3 = magic[0] === 0x49 && magic[1] === 0x44 && magic[2] === 0x33  // ID3
    const isMp3Sync = (magic[0] === 0xff && (magic[1] & 0xe0) === 0xe0)            // MPEG sync
    const isWav = magic[0] === 0x52 && magic[1] === 0x49 && magic[2] === 0x46 && magic[3] === 0x46
    const isOgg = magic[0] === 0x4f && magic[1] === 0x67 && magic[2] === 0x67 && magic[3] === 0x53
    const isM4a = magic[4] === 0x66 && magic[5] === 0x74 && magic[6] === 0x79 && magic[7] === 0x70

    if (!isWebm && !isMp3Id3 && !isMp3Sync && !isWav && !isOgg && !isM4a) {
      return NextResponse.json({ error: 'Invalid audio file' }, { status: 400 })
    }

    const contentType = isWebm ? 'audio/webm'
      : (isMp3Id3 || isMp3Sync) ? 'audio/mpeg'
      : isWav ? 'audio/wav'
      : isOgg ? 'audio/ogg'
      : 'audio/mp4'

    const ext = contentType.includes('webm') ? 'webm'
      : contentType.includes('wav') ? 'wav'
      : contentType.includes('ogg') ? 'ogg'
      : contentType.includes('m4a') ? 'm4a'
      : 'mp3'

    const key = `cloned-voices/${user.id}/${Date.now()}.${ext}`

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }))

    const publicUrl = `${PUBLIC_URL}/${key}`
    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    console.error('[upload-voice]', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
