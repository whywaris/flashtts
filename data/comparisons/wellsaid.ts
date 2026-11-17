import { ComparisonData } from './elevenlabs';
import { LANGUAGE_COUNT, LANGUAGE_COUNT_LABEL } from '@/lib/siteStats';

// TODO: verify every WellSaid value below on https://wellsaidlabs.com/pricing (official page) and set
// COMPETITOR_PRICES_CHECKED in lib/siteStats.ts. Values carried over from the previous page, not re-checked.

export const wellsaidData: ComparisonData = {
  competitorName: 'WellSaid Labs',
  slug: 'wellsaid',
  metaTitle: 'FlashTTS vs WellSaid Labs: Price, Languages and Cloning Compared',
  metaDescription: `Comparing FlashTTS vs WellSaid Labs? WellSaid starts at $49/mo for English voices. FlashTTS starts at $9/mo with ${LANGUAGE_COUNT_LABEL} and voice cloning. Plans side by side.`,
  hero: {
    badge: 'COMPARISON',
    title: 'FlashTTS vs WellSaid Labs: Price, Languages and Cloning',
    subheadline: `WellSaid Labs starts at $49/month for English voices. FlashTTS starts at $9/month with ${LANGUAGE_COUNT_LABEL} and voice cloning. WellSaid's enterprise compliance features may matter more for some teams.`
  },
  verdictCards: [
    {
      icon: 'dollar',
      title: 'Lower Entry Price',
      text: 'FlashTTS starts at $9/mo. WellSaid Labs starts at $49/mo.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'lightning',
      title: `${LANGUAGE_COUNT} vs 1 Language`,
      text: `FlashTTS supports ${LANGUAGE_COUNT_LABEL}. WellSaid Labs lists English only.`,
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'microphone',
      title: 'Voice Cloning Included',
      text: 'FlashTTS includes voice cloning on every plan. Voice cloning is not listed on WellSaid plans.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    }
  ],
  table: {
    rows: [
      { feature: 'Free Plan', flashTts: '10,000 chars/mo', competitor: 'None (7-day trial)', win: 'flash' },
      { feature: 'Entry Price', flashTts: '$9/mo', competitor: '$49/mo', win: 'flash' },
      { feature: 'Mid Price', flashTts: '$19/mo', competitor: '$99/mo', win: 'flash' },
      { feature: 'Pro Price', flashTts: '$39/mo', competitor: '$199/mo', win: 'flash' },
      { feature: 'Languages', flashTts: LANGUAGE_COUNT_LABEL, competitor: 'English only', win: 'flash' },
      { feature: 'Voice Cloning', flashTts: 'Every plan', competitor: 'Not listed', win: 'flash' },
      { feature: 'Max per generation', flashTts: '3,000-20,000 chars (by plan)', competitor: '5,000 chars (Maker)', win: 'tie' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'All paid plans', win: 'tie' },
      { feature: 'API Access', flashTts: 'Studio plan', competitor: 'Creative plan+', win: 'competitor' },
      { feature: 'Enterprise compliance', flashTts: 'Not offered', competitor: 'SOC2', win: 'competitor' }
    ]
  },
  pricing: {
    sourceUrl: '', // TODO: https://wellsaidlabs.com/pricing once verified
    note: 'WellSaid character allowances are not in our records, so per-character cost is not shown for WellSaid.',
    competitorPlans: [
      { name: 'Maker', price: 49, chars: null, note: 'Allowance not on record' },
      { name: 'Creative', price: 99, chars: null, note: 'Allowance not on record' },
      { name: 'Pro', price: 199, chars: null, note: 'Allowance not on record' },
    ],
  },
  pricingBreakdown: {
    heading: 'Cost Scenarios',
    subtext: 'FlashTTS side uses the cheapest plan whose allowance covers the usage.',
    creators: [
      {
        type: 'Solo YouTube Creator',
        chars: 200000,
        competitorCost: '$49/mo (Maker)',
        competitorMath: 'Lowest listed plan; allowance not on record'
      },
      {
        type: 'Multilingual Content Creator',
        chars: 600000,
        competitorCost: 'Not available',
        competitorMath: 'WellSaid lists English voices only'
      },
      {
        type: 'Audiobook Producer',
        chars: 2000000,
        competitorCost: '$99/mo (Creative)',
        competitorMath: 'Allowance not on record - check WellSaid pricing'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You need more than English language support',
      'You want voice cloning included',
      'Budget matters to your business',
      'You want a free tier to start',
      'You\'re a YouTuber, Podcaster or Agency'
    ],
    competitor: [
      'You only create English content',
      'You need enterprise SOC2 compliance',
      'Your team needs advanced collaboration',
      'You serve Fortune 500 enterprise clients',
      'Security certifications are mandatory'
    ]
  },
  faqs: [
    {
      q: 'Is FlashTTS cheaper than WellSaid Labs?',
      a: `On listed prices, yes: FlashTTS starts at $9/month with 200,000 characters, ${LANGUAGE_COUNT_LABEL} and voice cloning. WellSaid Labs starts at $49/month for English voices.`
    },
    {
      q: 'Does WellSaid Labs support multiple languages?',
      a: `WellSaid Labs lists English only. FlashTTS supports ${LANGUAGE_COUNT_LABEL} on every plan.`
    },
    {
      q: 'Does WellSaid Labs include voice cloning?',
      a: 'Voice cloning is not listed on WellSaid plans; they offer pre-built voice avatars. FlashTTS includes voice cloning on every plan.'
    },
    {
      q: 'What is the best WellSaid Labs alternative for content creators?',
      a: `If you need more than English or want voice cloning, FlashTTS is worth trying: 200,000 characters for $9/month, ${LANGUAGE_COUNT_LABEL}, voice cloning, and a free tier with no credit card.`
    },
    {
      q: 'Is there a free plan on FlashTTS unlike WellSaid Labs?',
      a: 'Yes. FlashTTS has a free tier with 10,000 characters per month - no credit card required. WellSaid Labs lists a 7-day trial.'
    }
  ]
};
