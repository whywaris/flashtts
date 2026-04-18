@AGENTS.md
# FlashTTS — Claude Project Context

## What is FlashTTS?
FlashTTS is a production-ready AI Text-to-Speech SaaS platform built for content creators — YouTubers, Podcasters, Faceless Channel Owners, Audiobook Creators, and Agencies. The core value proposition is **ElevenLabs-quality voices at a fraction of the price**, with 10x more credits per dollar.

**Goal:** 10,000 paid users and $10,000/month revenue by end of 2025.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI Inference | RunPod |
| File Storage | Cloudflare R2 |
| Payments | Paddle |
| Email | Resend |
| DNS/CDN | Cloudflare (DNS-only, grey proxy) |
| Deployment | Vercel |
| Version Control | GitHub (Git Credential Manager) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Font | Syne (headings), Inter (body) |

---

## Design System

### Colors
```
Brand accent:     #E8522A  (orange — primary CTA, highlights)
Page background:  #F0EDE8  (warm cream — all public pages)
Dark background:  #0F0F0F  (dashboard pages)
Text primary:     slate-900 (light mode), white (dark mode)
Text secondary:   slate-600 (light mode), slate-300 (dark mode)
Border:           #e2dfdb  (light mode)
```

### CSS Variables (Dashboard)
```css
--bg, --text, --accent (#f5c518 yellow), --muted, --border, --glass, --card-bg
```

### Design Principles
- Public pages: **Light/cream aesthetic** — clean, professional, warm
- Dashboard pages: **Dark premium aesthetic** — noiz.ai inspired
- Never mix light/dark — strict separation between public and dashboard
- Framer Motion `fadeUp` + `staggerContainer` for all scroll animations
- All sections max-width: 1200px centered
- Mobile-first, fully responsive

### Component Patterns
```tsx
// Standard fade up animation
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
}
```

---

## Pricing Plans

| Plan | Price/mo | Characters | Voice Clones | Notes |
|---|---|---|---|---|
| Free | $0 | 10,000 | 1 | Watermarked, 500 chars/gen |
| Starter | $9 | 200,000 | 2 | 3,000 chars/gen |
| Creator | $19 | 500,000 | 5 | 5,000 chars/gen — Most Popular |
| Pro | $39 | 1,000,000 | 9 | 10,000 chars/gen |
| Studio | $79 | 3,000,000 | 15 | 20,000 chars/gen, API access |

**Yearly discount: 20% off** (Starter→$7, Creator→$15, Pro→$31, Studio→$63)

---

## Database Schema (Supabase)

### Active Tables
```
profiles          — Main user table (use this, NOT users)
voices            — Voice library (1,234+ voices)
tts_jobs          — TTS generation history
cloned_voices     — User voice clones
saved_voices      — User's saved voices (from library or cloned)
credit_transactions — Credit usage log
subscriptions     — Paddle subscription tracking
pricing_plans     — Plan definitions
audiobooks        — Audiobook projects
audiobook_chapters — Individual chapters (has audio_url, duration_seconds)
blog_posts        — Blog content (admin managed)
notifications     — User notifications
announcements     — Platform-wide announcements
api_keys          — API key management
bulk_jobs         — Bulk TTS generation
workspaces        — Team workspaces
workspace_members — Workspace team members
transcriptions    — Speech-to-text results
email_logs        — Resend email tracking
abuse_reports     — User abuse reports (RLS enabled)
usage             — Character usage tracking (RLS enabled)
```

### IMPORTANT: Deleted Tables
```
❌ tts_voices     — DELETED (was duplicate of voices)
❌ users          — DELETED (use profiles instead)
❌ team_members   — DELETED (use workspace_members instead)
```

**NEVER query `tts_voices`, `users`, or `team_members` — they no longer exist.**
Always use `profiles` instead of `users`.

### Key Columns
```typescript
// profiles table
id: uuid
email: string
full_name: string
plan: 'free' | 'starter' | 'creator' | 'pro' | 'studio'
credits_used: bigint
credits_limit: bigint
role: 'user' | 'admin'
is_banned: boolean
onboarding_completed: boolean
onboarding_data: jsonb

// voices table
id: text
name: text
language: text  // 'en', 'ar', 'hi', 'es', 'fr', 'de', etc.
gender: 'male' | 'female' | 'neutral'
sample_url: text  // RunPod needs this URL, NOT voice_id string
style: text
tags: text[]
is_premium: boolean
is_active: boolean

// saved_voices table
id: uuid
user_id: uuid  // references profiles.id
voice_id: text
voice_name: text
source: 'library' | 'cloned'
r2_url: text   // use r2_url NOT sample_url on this table
language: text
gender: text
```

### Critical RPC Functions
```typescript
// Atomic credit deduction — prevents race conditions
await supabase.rpc('deduct_credits_atomic', {
  p_user_id: user.id,
  p_amount: charCount
})
// Returns boolean — true if success, false if insufficient

// Increment credits (for admin/refunds)
await supabase.rpc('increment_credits', {
  user_id: user.id,
  amount: creditsToAdd
})
```

---

## RunPod Integration

**CRITICAL:** RunPod requires the actual audio sample URL (`voice_url`), NOT a string `voice_id`.

```typescript
// WRONG — will produce wrong/default voice
body: JSON.stringify({ voice_id: 'sara_en' })

// CORRECT — always resolve sample_url first
const { data: voice } = await supabase
  .from('voices')
  .select('sample_url')
  .eq('id', voice_id)
  .single()

body: JSON.stringify({ voice_url: voice.sample_url })
```

---

## Supported Languages (19)

```
English (en), Arabic (ar), Hindi (hi), Spanish (es),
French (fr), German (de), Japanese (ja), Korean (ko),
Portuguese (pt), Turkish (tr), Italian (it), Dutch (nl),
Polish (pl), Russian (ru), Swedish (sv), Norwegian (no),
Finnish (fi), Danish (da), Greek (el), Malay (ms)
```

---

## API Routes

```
POST /api/tts              — Generate TTS audio
POST /api/upload-voice     — Upload voice sample to R2
POST /api/webhook/paddle   — Paddle payment webhooks
POST /api/contact          — Contact form submission
POST /api/admin/send-email — Admin bulk email
```

### TTS API Notes
- Guest requests: `{ guest: true }` — 250 char limit, no auth needed
- Authenticated: requires valid Supabase session
- Rate limiting: 10 req/min per IP via Upstash Redis
- Rate limiter MUST fail closed (return false when Redis missing)
- SSRF protection: voice_url validated against R2/Supabase domains only

---

## Site Structure

### Public Pages
```
/                     — Homepage
/text-to-speech       — TTS landing page
/voice-cloning        — Voice cloning landing page
/audiobooks           — Audiobooks landing page
/pricing              — Pricing page
/blog                 — Blog listing
/blog/[slug]          — Blog post (sanitize with isomorphic-dompurify!)
/voices               — Voice library (public)
/tools                — Free tools hub
/tools/[tool-slug]    — Individual free tool
/vs/elevenlabs        — Comparison page
/vs/murf              — Comparison page
/vs/speechify         — Comparison page
/vs/lovo              — Comparison page
/vs/wellsaid          — Comparison page
/vs/naturalreader     — Comparison page
/login                — Login
/signup               — Signup
/forgot-password      — Forgot password
/auth/reset-password  — Password reset (requires token)
/auth/callback        — Auth callback
/privacy-policy       — Legal
/terms                — Legal
/refund-policy        — Legal
/voice-cloning-policy — Legal
/contact              — Contact
/about                — About us
```

### Dashboard Pages (protected, dark theme)
```
/dashboard            — Overview
/dashboard/tts        — TTS Studio
/dashboard/audiobooks — Audiobook Studio
/dashboard/cloning    — Voice Cloning
/dashboard/saved      — Saved Voices
/dashboard/library    — Voice Library
/dashboard/history    — Generation History
/dashboard/settings   — Settings
/dashboard/billing    — Billing
```

### Admin Pages (admin role required)
```
/admin                — Admin dashboard (real stats only)
/admin/users          — User management
/admin/voices         — Voice management (queries voices table)
/admin/blog           — Blog manager
/admin/revenue        — Revenue analytics
/admin/emails         — Bulk email sender
/admin/usage          — Usage analytics
```

---

## Key Components

```
components/layout/Navbar.tsx    — Fixed navbar, frosted glass on scroll
components/layout/Footer.tsx    — 4-column footer with Compare section
```

### Navbar Links
```
Text to Speech | Voice Cloning | Pricing | Blog
[Log in] [Start Free →]
```

### Footer Columns
```
1. Brand + tagline + social icons (X, YouTube, LinkedIn, Facebook)
2. Product (Text to Speech, Voice Cloning, Audiobooks, Pricing, Blog)
3. Legal (Privacy, Terms, Refund, Voice Cloning Policy, Contact)
4. Compare (vs ElevenLabs, vs Murf AI, vs Speechify, vs LOVO AI, vs WellSaid, vs NaturalReader)
```

---

## Security Rules

### NEVER DO
```typescript
// Never use tts_voices, users, or team_members tables
supabase.from('tts_voices')  // ❌ table deleted
supabase.from('users')       // ❌ table deleted — use profiles
supabase.from('team_members') // ❌ table deleted — use workspace_members

// Never render blog content without sanitization
dangerouslySetInnerHTML={{ __html: post.content }}  // ❌ XSS risk

// Never fail open on rate limiter
if (!redis) return true  // ❌ allows unlimited GPU drain

// Never trust client-provided MIME types for uploads
if (contentType.startsWith('audio/'))  // ❌ verify magic bytes
```

### ALWAYS DO
```typescript
// Always sanitize blog HTML
import DOMPurify from 'isomorphic-dompurify'
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}

// Always fail closed on rate limiter
if (!redis) return false  // ✅

// Always use atomic credit deduction
await supabase.rpc('deduct_credits_atomic', { p_user_id, p_amount })

// Always validate voice_url domain before RunPod
const allowed = ['r2.cloudflarestorage.com', 'supabase.co']
// validate domain before passing to RunPod

// Always check admin role server-side in middleware
if (profile?.role !== 'admin') redirect('/dashboard')
```

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-side only, never expose
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
PADDLE_WEBHOOK_SECRET=            # REAL secret, not 'xxxx'
NEXT_PUBLIC_PADDLE_ENVIRONMENT=   # 'sandbox' or 'production'
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_ENDPOINT=
RESEND_API_KEY=
RUNPOD_API_KEY=
RUNPOD_ENDPOINT_ID=
UPSTASH_REDIS_REST_URL=           # for rate limiting
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SITE_URL=             # https://flashtts.com
```

---

## Common Bugs & Their Fixes

### 1. Voice generates wrong audio
**Cause:** Passing `voice_id` string to RunPod instead of `voice_url`
**Fix:** Always lookup `sample_url` from `voices` table first

### 2. Saved Voices failing silently
**Cause:** Inserting `sample_url` into `saved_voices` table — column doesn't exist
**Fix:** Use `r2_url` column on `saved_voices` table

### 3. Credits race condition
**Cause:** Check credits → generate → deduct (concurrent requests pass check)
**Fix:** Use `deduct_credits_atomic` RPC function (atomic lock)

### 4. `cloned_voices` RLS error
**Cause:** RLS policy blocking insert
**Fix:** Ensure user_id matches auth.uid() in policy

### 5. `useEffect` with async
**Cause:** `await` in non-async useEffect
**Fix:** Use inner `async function init()` pattern:
```typescript
useEffect(() => {
  async function init() {
    await fetchData()
  }
  init()
}, [])
```

### 6. Dashboard dark mode not applying
**Cause:** Missing CSS variables or wrong class on root element
**Fix:** Ensure dashboard layout has dark mode classes applied

### 7. TTS text box starting from middle
**Cause:** Missing `text-left align-top` on textarea
**Fix:** Add `text-left align-top` to textarea className

---

## Onboarding Flow

Shows ONCE after signup — never again. Stored in `profiles.onboarding_completed`.

### Steps
1. **Welcome** — Enter your name (required)
2. **How did you hear about us?** — Podcast, Friends, Claude/ChatGPT, From Work, YouTube, Google, Other
3. **Which describes you best?** — Personal Use, YouTuber, Voice Actor, Content Business, Marketer, Education, TikToker, Shorts Creator, Audiobook Creator
4. **What would you like to do?** — Text to Speech, Audiobooks, Voice Cloning, Dubbing/Voiceovers, Speech to Text, Podcasts
5. **Plan selection** — Free, Starter, Creator, Pro, Studio

Store responses in `profiles.onboarding_data` (jsonb).
Set `profiles.onboarding_completed = true` after completion.

---

## SEO Strategy

### Comparison Pages
All 6 comparison pages follow same template — different data only:
- `/vs/elevenlabs` — "6x More Credits at Half the Price"
- `/vs/murf` — "4x More Audio, No Minute Limits"
- `/vs/speechify` — "Built for Creators, Not Readers"
- `/vs/lovo` — "64% Cheaper With No Voice Deletion Risk"
- `/vs/wellsaid` — "81% Cheaper With 19 Languages"
- `/vs/naturalreader` — "Commercial Rights & No Daily Limits"

Each has: FAQ schema JSON-LD + BreadcrumbList schema

### Meta Tag Pattern
```typescript
export const metadata = {
  title: 'FlashTTS vs [Competitor] (2025): [Key Differentiator]',
  description: '[Pain point]. FlashTTS [solution]. [Key stat]. See the full breakdown.',
}
```

---

## Free Tools (Traffic Magnets)

All tools at `/tools/[slug]`:
```
audio-cutter, volume-changer, audio-speed-changer,
pitch-shifter, audio-equalizer, audio-reverser,
voice-recorder, audio-joiner

Converters: mp3-to-flac, mp3-to-wav, mp3-to-aiff, mp3-to-aac,
flac-to-mp3, flac-to-wav, wav-to-mp3, wav-to-flac,
aiff-to-mp3, aac-to-mp3, (and more)
```

---

## Deployment

- **Platform:** Vercel
- **Domain:** Custom domain via Cloudflare
- **Cloudflare setting:** DNS Only (grey cloud) — NOT proxied
- **Why:** Vercel handles SSL — Cloudflare proxy breaks it
- **Git:** GitHub — push to main triggers Vercel auto-deploy

---

## Admin Panel

### Real Data Queries (not hardcoded)
```typescript
// Total users
SELECT COUNT(*) FROM profiles

// Paid users
SELECT COUNT(*) FROM profiles WHERE plan != 'free'

// MRR
SELECT COUNT(*) FROM subscriptions WHERE status = 'active'

// Total chars generated
SELECT SUM(credits_used) FROM profiles

// Revenue by plan
free: $0, starter: $9, creator: $19, pro: $39, studio: $79
```

### Admin Role Check
```typescript
// Always server-side — never trust client
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') redirect('/dashboard')
```

---

## Pending Features (Roadmap)

### Short Term
- [ ] Onboarding flow
- [ ] Dashboard redesign (dark premium)
- [ ] Blog section with admin panel
- [ ] Voice Changer in dashboard sidebar
- [ ] Voice to Text in dashboard sidebar
- [ ] Settings page cleanup
- [ ] About Us page

### Medium Term
- [ ] Workspace / team collaboration
- [ ] Referral program
- [ ] Agency plan (up to 10 members)
- [ ] Advanced SEO landing pages (AI Voice Generator, etc.)
- [ ] Community voices indexing

### Long Term
- [ ] Dubbing/Voiceovers feature
- [ ] Speech to Text feature
- [ ] Celebrity AI voices
- [ ] VS pages (ElevenLabs vs fish.audio)

---

## Code Style Rules

```typescript
// 1. Always use profiles, never users
supabase.from('profiles')  // ✅

// 2. Supabase client — memoize it
const supabase = useMemo(() => createClient(), [])

// 3. Never use alert() — use toast
import toast from 'react-hot-toast'
toast.success('Done!')

// 4. Always revoke blob URLs
useEffect(() => {
  return () => { if (url) URL.revokeObjectURL(url) }
}, [url])

// 5. Use Next.js Image, not <img>
import Image from 'next/image'

// 6. Dashboard layout should NOT be 'use client'
// Move client logic to child components

// 7. Async in useEffect
useEffect(() => {
  async function init() { await fn() }
  init()
}, [])

// 8. Guard window access
const origin = typeof window !== 'undefined'
  ? window.location.origin
  : process.env.NEXT_PUBLIC_SITE_URL
```

---

## Contact & Support Emails

```
support@flashtts.com   — General support
billing@flashtts.com   — Billing questions
abuse@flashtts.com     — Abuse reports
```

---

*Last updated: April 2026*
*Project: FlashTTS | Stack: Next.js + Supabase + RunPod + Paddle*