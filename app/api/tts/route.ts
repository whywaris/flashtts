import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { spawn } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const MODAL_API_URL = 'https://genztts--flashtts-api.modal.run';

// ─── Character limits per plan ────────────────────────────────────────────────
const PLAN_LIMITS: Record<string, number> = {
  free: 10000,
  starter: 200000,
  creator: 500000,
  pro: 1000000,
  studio: 3000000,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // ─── Auth check ───────────────────────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─── Get user profile ─────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, credits_used, credits_limit')
      .eq('id', user.id)
      .single();

    const plan = profile?.plan || 'free';
    const creditsUsed = profile?.credits_used || 0;
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    // ─── Parse request ────────────────────────────────────────────────────
    const body = await req.json();
    const {
      text,
      referenceAudioUrl,
      exaggeration = 0.5,
      cfg_weight = 0.5,
      temperature = 0.8,
    } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const charCount = text.trim().length;

    // ─── Credits check ────────────────────────────────────────────────────
    if (creditsUsed + charCount > limit) {
      return NextResponse.json(
        { error: 'Character limit exceeded. Please upgrade your plan.' },
        { status: 402 }
      );
    }

    // ─── Validate reference audio ─────────────────────────────────────────
    if (!referenceAudioUrl) {
      return NextResponse.json(
        { error: 'No reference audio found for this voice' },
        { status: 400 }
      );
    }

    // ─── Fetch reference audio and convert to WAV base64 ─────────────────
    let refAudioBase64: string | null = null;

    try {
      console.log('[FlashTTS] Fetching cloned voice reference audio:', referenceAudioUrl);
      const audioRes = await fetch(referenceAudioUrl);
      if (audioRes.ok) {
        const originalBuffer = Buffer.from(await audioRes.arrayBuffer());

        try {
          const inputPath = join(tmpdir(), `input-${randomUUID()}`);
          const outputPath = join(tmpdir(), `output-${randomUUID()}.wav`);

          await writeFile(inputPath, originalBuffer);

          await new Promise((resolve, reject) => {
            const ff = spawn('ffmpeg', [
              '-i', inputPath,
              '-ar', '16000',
              '-ac', '1',
              '-f', 'wav',
              outputPath,
              '-y',
            ]);
            ff.on('close', (code) => code === 0 ? resolve(true) : reject(new Error(`ffmpeg exited with code ${code}`)));
            ff.on('error', reject);
          });

          const wavBuffer = await readFile(outputPath);
          refAudioBase64 = wavBuffer.toString('base64');
          console.log('[FlashTTS] WAV conversion done, size:', wavBuffer.byteLength);

          await unlink(inputPath).catch(() => {});
          await unlink(outputPath).catch(() => {});
        } catch (convErr) {
          console.warn('[FlashTTS] ffmpeg failed, using original:', convErr);
          refAudioBase64 = originalBuffer.toString('base64');
        }
      } else {
        console.error('[FlashTTS] Failed to fetch reference audio:', audioRes.status);
      }
    } catch (e) {
      console.error('[FlashTTS] Reference audio fetch error:', e);
    }

    const modalPayload: Record<string, unknown> = {
      text: text.trim(),
      ref_audio_base64: refAudioBase64,
      exaggeration,
      temperature,
      cfg_weight,
      seed: 0,
    };

    // ─── Call Modal API ───────────────────────────────────────────────────
    const modalRes = await fetch(MODAL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modalPayload),
    });

    if (!modalRes.ok) {
      const err = await modalRes.text();
      console.error('[FlashTTS] Modal error:', err);
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
    }

    const modalData = await modalRes.json();

    if (modalData.error) {
      return NextResponse.json({ error: modalData.error }, { status: 500 });
    }

    // ─── Upload audio to Cloudflare R2 ────────────────────────────────────
    const audioBuffer = Buffer.from(modalData.audio_base64, 'base64');
    const fileName = `tts/${user.id}/${Date.now()}.wav`;

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (uploadError) {
      console.error('[FlashTTS] Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 });
    }

    // ─── Get public URL ───────────────────────────────────────────────────
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName);

    // ─── Update credits used ──────────────────────────────────────────────
    await supabase
      .from('profiles')
      .update({ credits_used: creditsUsed + charCount })
      .eq('id', user.id);

    // ─── Return audio URL ─────────────────────────────────────────────────
    return NextResponse.json({
      audioUrl: publicUrl,
      characters_processed: charCount,
      sample_rate: modalData.sample_rate,
    });

  } catch (err: any) {
    console.error('[FlashTTS] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
