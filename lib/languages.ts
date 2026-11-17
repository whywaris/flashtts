// Every language FlashTTS supports: the TTS Studio list plus the Indic landing-page languages.
// Kept dependency-light so lib/plans.ts and lib/siteStats.ts can both import it without a cycle.
import { LANGUAGES } from '@/utils/demo-data';
import { INDIC_LANGUAGES } from '@/data/languages/indic';

export interface SiteLanguage {
  code: string;
  label: string;
  slug?: string; // set when /text-to-speech/<slug> exists
}

const indic = Object.values(INDIC_LANGUAGES);

export const ALL_LANGUAGES: SiteLanguage[] = [
  ...LANGUAGES.map((l) => ({
    code: l.code,
    label: l.label,
    slug: indic.find((i) => i.langCode === l.code)?.slug,
  })),
  ...indic
    .filter((i) => !LANGUAGES.some((l) => l.code === i.langCode))
    .map((i) => ({ code: i.langCode, label: i.name, slug: i.slug })),
];
