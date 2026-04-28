const ENDPOINT = () => process.env.RUNPOD_ENDPOINT_ID!
const API_KEY   = () => process.env.RUNPOD_API_KEY!

export async function submitRunPodJob(input: Record<string, unknown>): Promise<string> {
  const res = await fetch(`https://api.runpod.ai/v2/${ENDPOINT()}/run`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`RunPod submit failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  if (!data.id) throw new Error('RunPod did not return a job ID')
  return data.id as string
}

export async function pollRunPodJob(jobId: string, timeoutMs = 120_000): Promise<string> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    await sleep(2_000)

    let data: any
    try {
      const res = await fetch(`https://api.runpod.ai/v2/${ENDPOINT()}/status/${jobId}`, {
        headers: { Authorization: `Bearer ${API_KEY()}` },
      })
      if (!res.ok) continue
      data = await res.json()
    } catch {
      continue
    }

    if (data.status === 'COMPLETED') {
      const b64 = data.output?.audio_base64 ?? data.output?.audio
      if (!b64 || typeof b64 !== 'string') {
        throw new Error('RunPod completed but returned no audio data')
      }
      return b64
    }

    if (data.status === 'FAILED') {
      throw new Error(data.error || 'RunPod job failed')
    }

    // IN_QUEUE | IN_PROGRESS — keep polling
  }

  throw new Error('Audio generation timed out after 120 seconds. Please try again.')
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}
