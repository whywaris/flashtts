// Single source of truth for public-facing product numbers and founder info.
// Import from here; never hardcode these values in pages.
import { PLANS } from '@/lib/plans';
import { ALL_LANGUAGES } from '@/lib/languages';

export { ALL_LANGUAGES };

// TTS Studio languages (utils/demo-data.ts) + Indic landing-page languages (data/languages/indic.ts).
export const LANGUAGE_COUNT = ALL_LANGUAGES.length;
export const LANGUAGE_COUNT_LABEL = `${LANGUAGE_COUNT} languages`;

// TODO: set from `select count(*) from voices where is_active` in Supabase.
// While null, pages must not show a voice count.
export const VOICE_COUNT: number | null = null;

export const FOUNDER = {
  name: 'Theo Greenslade',
  role: 'Founder & Software Engineer',
  initials: 'TG',
  photoUrl: 'https://pub-fd880e99144d4575846bfb03d99d3d29.r2.dev/Theo%20Greenslade.jfif',
  linkedinUrl: 'https://www.linkedin.com/in/theogreenslade/',
  // Only facts supplied by the founder. Do not add credentials that were not provided.
  bio: 'Theo Greenslade is a software engineer with 3 years of experience who loves building SaaS products. FlashTTS is one of them: a text-to-speech and voice cloning platform built for creators, with clear limits and a lower cost per character.',
  highlights: ['Software engineer', '3 years of experience', 'Builds SaaS products'],
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

// Voice-clone sample length used in all copy. Matches the free trial recorder (components/VoiceCloneTrial.tsx).
// The clone API enforces no minimum. TODO: confirm the length you want to recommend.
export const CLONE_SAMPLE_SECONDS = 10;

// Homepage demo clips. TODO: generate MP3s, upload to /public/samples, then list them here.
// Demo section and "Hear a sample" buttons stay hidden while this is empty.
export const DEMO_SAMPLES: { src: string; voice: string; language: string }[] = [];

// TODO: set to the month you verified competitor prices on their official pricing pages.
export const COMPETITOR_PRICES_CHECKED = '[MONTH YEAR]';
