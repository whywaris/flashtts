import { LEMON_VARIANTS, VARIANT_TO_PLAN } from '@/lib/plans';

export type PlanKey = 'free' | 'starter' | 'creator' | 'pro' | 'studio';

export const PLANS: Record<
  PlanKey,
  { variantMonthly: number | null; variantYearly: number | null; credits: number; name: string }
> = {
  free:    { variantMonthly: null,                            variantYearly: null,                           credits: 10000,   name: 'Free'    },
  starter: { variantMonthly: LEMON_VARIANTS.starter.monthly,  variantYearly: LEMON_VARIANTS.starter.yearly,  credits: 200000,  name: 'Starter' },
  creator: { variantMonthly: LEMON_VARIANTS.creator.monthly,  variantYearly: LEMON_VARIANTS.creator.yearly,  credits: 600000,  name: 'Creator' },
  pro:     { variantMonthly: LEMON_VARIANTS.pro.monthly,      variantYearly: LEMON_VARIANTS.pro.yearly,      credits: 2000000, name: 'Pro'     },
  studio:  { variantMonthly: LEMON_VARIANTS.studio.monthly,   variantYearly: LEMON_VARIANTS.studio.yearly,   credits: 3000000, name: 'Studio'  },
};

export function getVariantId(plan: string, billing: 'monthly' | 'yearly'): number | null {
  const p = PLANS[plan as PlanKey];
  if (!p) return null;
  return billing === 'yearly' ? p.variantYearly : p.variantMonthly;
}

export function getPlanByVariantId(variantId: number): string | null {
  return VARIANT_TO_PLAN[variantId] ?? null;
}
