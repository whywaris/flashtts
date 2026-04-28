export type PlanId = 'free' | 'starter' | 'creator' | 'pro' | 'studio';

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  yearlyTotal: number;
  chars: string;
  charsPerGen: string;
  voiceClones: string;
  voiceLibrary: string;
  formats: string;
  speed: string;
  history: string;
  emotionControl: string;
  languages: string;
  support: string;
  commercialUse: boolean;
  noWatermark: boolean;
  credits: number;
  isPopular?: boolean;
  isFree?: boolean;
  variantMonthly?: number;
  variantYearly?: number;
}

// LemonSqueezy Variant IDs
export const LEMON_VARIANTS = {
  starter:  { monthly: 1565143, yearly: 1565150 },
  creator:  { monthly: 1565144, yearly: 1565154 },
  pro:      { monthly: 1565147, yearly: 1565152 },
  studio:   { monthly: 1565148, yearly: 1565159 },
} as const;

// Variant ID → Plan mapping for webhook processing
export const VARIANT_TO_PLAN: Record<number, PlanId> = {
  [LEMON_VARIANTS.starter.monthly]: 'starter',
  [LEMON_VARIANTS.starter.yearly]: 'starter',
  [LEMON_VARIANTS.creator.monthly]: 'creator',
  [LEMON_VARIANTS.creator.yearly]: 'creator',
  [LEMON_VARIANTS.pro.monthly]: 'pro',
  [LEMON_VARIANTS.pro.yearly]: 'pro',
  [LEMON_VARIANTS.studio.monthly]: 'studio',
  [LEMON_VARIANTS.studio.yearly]: 'studio',
};

export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    yearlyTotal: 0,
    chars: '10,000',
    charsPerGen: '1,000',
    voiceClones: '1',
    voiceLibrary: 'Basic voices only',
    formats: 'MP3 + WAV',
    speed: 'Standard generation speed',
    history: '7 days history',
    emotionControl: 'Full emotion control',
    languages: 'All 23 languages',
    support: 'Email support',
    commercialUse: true,
    noWatermark: true,
    credits: 10000,
    isFree: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 9,
    priceYearly: 7, // $85/12 ≈ $7.08
    yearlyTotal: 85,
    chars: '200,000',
    charsPerGen: '5,000',
    voiceClones: '3',
    voiceLibrary: 'Full voice library',
    formats: 'MP3 + WAV',
    speed: 'Standard generation speed',
    history: '30 days history',
    emotionControl: 'Full emotion control',
    languages: 'All 23 languages',
    support: 'Email support',
    commercialUse: true,
    noWatermark: true,
    credits: 200000,
    variantMonthly: LEMON_VARIANTS.starter.monthly,
    variantYearly: LEMON_VARIANTS.starter.yearly,
  },
  {
    id: 'creator',
    name: 'Creator',
    priceMonthly: 19,
    priceYearly: 15, // $179/12 ≈ $14.92
    yearlyTotal: 179,
    chars: '600,000',
    charsPerGen: '5,000',
    voiceClones: '10',
    voiceLibrary: 'Full voice library',
    formats: 'MP3 + WAV',
    speed: 'Fast generation speed',
    history: '90 days history',
    emotionControl: 'Full emotion control',
    languages: 'All 23 languages',
    support: 'Priority email support',
    commercialUse: true,
    noWatermark: true,
    credits: 600000,
    isPopular: true,
    variantMonthly: LEMON_VARIANTS.creator.monthly,
    variantYearly: LEMON_VARIANTS.creator.yearly,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 39,
    priceYearly: 31, // $369/12 ≈ $30.75
    yearlyTotal: 369,
    chars: '2,000,000',
    charsPerGen: '10,000',
    voiceClones: '25',
    voiceLibrary: 'Full voice library',
    formats: 'MP3 + WAV',
    speed: 'Priority generation speed',
    history: 'Unlimited history',
    emotionControl: 'Full emotion control',
    languages: 'All 23 languages',
    support: 'Priority + Chat support',
    commercialUse: true,
    noWatermark: true,
    credits: 2000000,
    variantMonthly: LEMON_VARIANTS.pro.monthly,
    variantYearly: LEMON_VARIANTS.pro.yearly,
  },
  {
    id: 'studio',
    name: 'Studio',
    priceMonthly: 79,
    priceYearly: 62, // $749/12 ≈ $62.42
    yearlyTotal: 749,
    chars: '3,000,000',
    charsPerGen: '20,000',
    voiceClones: 'Unlimited',
    voiceLibrary: 'Full library + Exclusive voices',
    formats: 'MP3 + WAV',
    speed: 'Priority generation speed',
    history: 'Unlimited history',
    emotionControl: 'Full emotion control',
    languages: 'All 23 languages',
    support: 'Priority + Chat support',
    commercialUse: true,
    noWatermark: true,
    credits: 3000000,
    variantMonthly: LEMON_VARIANTS.studio.monthly,
    variantYearly: LEMON_VARIANTS.studio.yearly,
  },
];

// Helper to get credits limit for a given plan
export function getCreditsForPlan(plan: string): number {
  const found = PLANS.find(p => p.id === plan);
  return found?.credits ?? 10000;
}
