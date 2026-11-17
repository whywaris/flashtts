import { PAID_PLAN_COSTS, formatPer1k, LANGUAGE_COUNT_LABEL } from '@/lib/siteStats';

export interface ComparisonData {
  competitorName: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  hero: {
    badge: string;
    title: string;
    subheadline: string;
  };
  verdictCards: {
    icon: 'lightning' | 'dollar' | 'microphone' | 'shield' | 'infinity' | 'waveform';
    title: string;
    text: string;
    badge: string; // e.g. 'FlashTTS Wins', 'Tie', 'Our opinion'
    badgeColor: 'green' | 'gray';
  }[];
  table: {
    rows: {
      feature: string;
      flashTts: string;
      competitor: string;
      win?: 'flash' | 'tie' | 'competitor';
    }[];
  };
  // Competitor plans from their official pricing page. Per-1k cost is computed in the template.
  pricing: {
    sourceUrl: string; // TODO per page: official pricing URL
    note?: string;
    competitorPlans: { name: string; price: number | null; chars: number | null; estimated?: boolean; note?: string }[];
  };
  pricingBreakdown: {
    heading: string;
    subtext: string;
    // FlashTTS side is computed from lib/plans.ts via flashPlanFor(chars).
    creators: {
      type: string;
      chars: number;
      competitorCost: string;
      competitorMath: string;
    }[];
  };
  whyChoose: {
    flashTts: string[];
    competitor: string[];
  };
  faqs: {
    q: string;
    a: string;
  }[];
  problemSection?: {
    title: string;
    subtext: string;
    cards: {
      icon: 'clock-x' | 'warning' | 'calculator' | 'stop' | 'bell-off' | 'check-circle';
      title: string;
      text: string;
    }[];
  };
  differenceBanner?: {
    left: { label: string; icon: 'book' | 'headphones'; title: string; text: string; tag: string; };
    right: { label: string; icon: 'mic' | 'waveform'; title: string; text: string; tag: string; };
  };
  warningSection?: {
    title: string;
    text: string;
    source: string;
    sourceUrl?: string; // section renders only when a source link is set
    quote?: string;
    quoteSource?: string;
    note?: string;
    mathCard?: {
      title: string;
      competitorLabel: string;
      flashTtsLabel: string;
    };
    comparisonCallout?: {
      leftLabel: string;
      leftText: string;
      rightLabel: string;
      rightText: string;
    };
  };
}

// TODO: verify every ElevenLabs value below on https://elevenlabs.io/pricing (official page)
// and set COMPETITOR_PRICES_CHECKED in lib/siteStats.ts. Values are carried over from the previous page, not re-checked.
const EL_PLANS = [
  { name: 'Starter', price: 6, chars: 30000 },
  { name: 'Creator', price: 22, chars: 100000 },
  { name: 'Pro', price: 99, chars: 500000 },
  { name: 'Scale', price: 330, chars: 2000000 },
];
const elPer1k = EL_PLANS.map((p) => (p.price / p.chars) * 1000);
const flashPer1k = PAID_PLAN_COSTS.map((p) => p.per1k);
const range = (a: number[]) => `${formatPer1k(Math.min(...a))}-${formatPer1k(Math.max(...a))}`;

export const elevenLabsData: ComparisonData = {
  competitorName: 'ElevenLabs',
  slug: 'elevenlabs',
  metaTitle: 'FlashTTS vs ElevenLabs: Price per Character Compared',
  metaDescription: 'FlashTTS vs ElevenLabs, tier by tier. Lower cost per character on every plan, including where ElevenLabs is cheaper to start. Prices, math and sources inside.',
  hero: {
    badge: 'PRICE COMPARISON',
    title: 'FlashTTS vs ElevenLabs: Price per Character Compared',
    subheadline: "ElevenLabs is a strong product. If you publish often, the number that matters is cost per character. Here is every tier side by side - including where ElevenLabs costs less."
  },
  verdictCards: [
    {
      icon: 'dollar',
      title: 'Lower Cost per Character',
      text: `FlashTTS: ${range(flashPer1k)} per 1,000 characters. ElevenLabs: ${range(elPer1k)}.`,
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'lightning',
      title: 'Cheaper Entry Plan',
      text: 'ElevenLabs Starter is $6/mo vs $9/mo for FlashTTS Starter - with 30,000 vs 200,000 characters.',
      badge: 'ElevenLabs Wins',
      badgeColor: 'gray'
    },
    {
      icon: 'microphone',
      title: 'Voice Quality',
      text: 'Both produce natural-sounding AI voices. Quality is subjective - try both free tiers with your own script.',
      badge: 'Our opinion',
      badgeColor: 'gray'
    }
  ],
  table: {
    rows: [
      { feature: 'Free Plan', flashTts: '10,000 chars/mo', competitor: '10,000 chars/mo', win: 'tie' },
      { feature: 'Starter price', flashTts: '$9/mo', competitor: '$6/mo', win: 'competitor' },
      { feature: 'Starter characters', flashTts: '200,000', competitor: '30,000', win: 'flash' },
      { feature: 'Creator', flashTts: '600,000 / $19', competitor: '100,000 / $22', win: 'flash' },
      { feature: 'Pro', flashTts: '2,000,000 / $39', competitor: '500,000 / $99', win: 'flash' },
      { feature: 'Studio / Scale', flashTts: '3,000,000 / $79', competitor: '2,000,000 / $330', win: 'flash' },
      // TODO verify: old page said both "Paid add-on" and "from Creator onwards" for ElevenLabs cloning.
      { feature: 'Voice Cloning', flashTts: 'Every plan (1 clone on Free)', competitor: 'Paid plans', win: 'tie' },
      { feature: 'Languages', flashTts: LANGUAGE_COUNT_LABEL, competitor: '29 languages', win: 'competitor' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'All paid plans', win: 'tie' },
      { feature: 'API Access', flashTts: 'Studio plan', competitor: 'Creator+', win: 'competitor' },
      { feature: 'Voice Library', flashTts: 'Library + your clones', competitor: '3,000+ voices', win: 'competitor' },
      { feature: 'Watermark Free', flashTts: 'All paid plans', competitor: 'All paid plans', win: 'tie' }
    ]
  },
  pricing: {
    sourceUrl: '', // TODO: https://elevenlabs.io/pricing once verified
    competitorPlans: EL_PLANS,
  },
  pricingBreakdown: {
    heading: 'Cost Scenarios',
    subtext: 'Each scenario uses the cheapest plan whose monthly allowance actually covers the usage.',
    creators: [
      {
        type: 'Podcast + Shorts Creator',
        chars: 300000,
        competitorCost: '$99/mo (Pro)',
        competitorMath: '300,000 needed > 100,000 on Creator ($22) → Pro, 500,000 included'
      },
      {
        type: 'Daily YouTube Creator',
        chars: 600000,
        competitorCost: '$330/mo (Scale) or Pro + overage',
        competitorMath: '600,000 needed > 500,000 on Pro ($99) → Scale, 2,000,000 included'
      },
      {
        type: 'Faceless Channel Owner (3 channels)',
        chars: 1500000,
        competitorCost: '$330/mo (Scale)',
        competitorMath: '1,500,000 needed ≤ 2,000,000 included'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You publish content daily or weekly',
      'You need high-volume audio generation',
      'You want a lower cost per character',
      'You want voice cloning on every plan',
      'You\'re a YouTuber, Podcaster or Agency'
    ],
    competitor: [
      'You need more languages than FlashTTS supports',
      'You want a larger voice library',
      'You need API access below a top-tier plan',
      'You only generate a little audio (ElevenLabs Starter is cheaper)'
    ]
  },
  faqs: [
    {
      q: 'Is FlashTTS cheaper than ElevenLabs?',
      a: `Per character, yes on every plan we compared: FlashTTS costs ${range(flashPer1k)} per 1,000 characters, ElevenLabs ${range(elPer1k)}. ElevenLabs has the cheaper entry plan ($6 vs $9), but it includes 30,000 characters vs 200,000.`
    },
    {
      q: 'Does FlashTTS have the same voice quality as ElevenLabs?',
      a: 'Voice quality is subjective and depends on the voice and the script. Both services have a free tier, so the fairest test is to generate the same paragraph of your own script on each and listen on the device your audience uses.'
    },
    {
      q: 'Can I clone my voice on FlashTTS?',
      a: 'Yes. Voice cloning is included on every FlashTTS plan: 1 clone on Free, 3 on Starter, 10 on Creator, 25 on Pro and unlimited on Studio.'
    },
    {
      q: 'What happens when I run out of credits on ElevenLabs?',
      a: 'Check the ElevenLabs pricing page for its current upgrade and overage options. On FlashTTS, generation pauses when you reach your monthly allowance until it resets at the next billing cycle, or you can upgrade to a larger plan at any time.'
    },
    {
      q: 'Is there a free plan on FlashTTS?',
      a: 'Yes. FlashTTS offers a free tier with 10,000 characters a month - no credit card required. Free-plan audio is for personal use and may include a watermark (see our Terms).'
    }
  ]
};
