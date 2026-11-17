// Single source of truth for public-facing product numbers and founder info.
// Import from here; never hardcode these values in pages.
import { PLANS } from '@/lib/plans';
import { LANGUAGES } from '@/utils/demo-data';

// Derived from the TTS Studio language list (utils/demo-data.ts, same 20 codes as the
// <select> in app/dashboard/tts/page.tsx).
// TODO: confirm against `select count(distinct language) from voices where is_active` in Supabase.
export const LANGUAGE_COUNT = LANGUAGES.length;
export const LANGUAGE_COUNT_LABEL = `${LANGUAGE_COUNT} languages`;

// TODO: set from `select count(*) from voices where is_active` in Supabase.
// While null, pages must not show a voice count.
export const VOICE_COUNT: number | null = null;

export const FOUNDER = {
  name: 'Theo Green',
  role: 'Founder',
  initials: 'TG',
  // TODO: add photo URL (e.g. /avatars/theo-green.jpg). Initials avatar renders until set.
  photoUrl: '',
  // TODO: add LinkedIn URL. Link is hidden until set.
  linkedinUrl: '',
  // TODO: founder bio. Nothing renders until set — do not invent credentials.
  bio: '',
};

// Price per 1,000 characters, monthly billing. price / characters x 1000.
export const PAID_PLAN_COSTS = PLANS.filter((p) => !p.isFree).map((p) => ({
  id: p.id,
  name: p.name,
  price: p.priceMonthly,
  credits: p.credits,
  per1k: (p.priceMonthly / p.credits) * 1000,
}));

export const formatPer1k = (v: number) => `$${v.toFixed(4)}`;
export const formatChars = (n: number) => n.toLocaleString('en-US');

// Cheapest paid plan whose monthly allowance covers `chars`, with the math shown.
export function flashPlanFor(chars: number) {
  const plan = PAID_PLAN_COSTS.find((p) => p.credits >= chars);
  if (!plan) {
    const top = PAID_PLAN_COSTS[PAID_PLAN_COSTS.length - 1];
    return { label: `Requires ${top.name} + overage`, math: `${formatChars(chars)} needed > ${formatChars(top.credits)} on ${top.name}` };
  }
  return {
    label: `$${plan.price}/mo (${plan.name})`,
    math: `${formatChars(chars)} needed ≤ ${formatChars(plan.credits)} included`,
  };
}

// Rough conversion used only to compare minute-based competitors. Labelled "est." wherever shown.
// TODO: confirm with real generations (≈150 wpm × ~6.5 chars/word).
export const CHARS_PER_AUDIO_MINUTE = 1000;

// Homepage demo clips. TODO: generate MP3s, upload to /public/samples, then list them here.
// Demo section and "Hear a sample" buttons stay hidden while this is empty.
export const DEMO_SAMPLES: { src: string; voice: string; language: string }[] = [];

// TODO: set to the month you verified competitor prices on their official pricing pages.
export const COMPETITOR_PRICES_CHECKED = '[MONTH YEAR]';
