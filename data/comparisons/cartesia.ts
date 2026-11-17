import { ComparisonData } from './elevenlabs';
import { LANGUAGE_COUNT_LABEL } from '@/lib/siteStats';

// TODO: verify every Cartesia value below on https://cartesia.ai/pricing (official page) and set
// COMPETITOR_PRICES_CHECKED in lib/siteStats.ts. Values carried over from the previous page, not re-checked.

export const cartesiaData: ComparisonData = {
  competitorName: 'Cartesia',
  slug: 'cartesia',
  metaTitle: 'Cartesia vs ElevenLabs vs FlashTTS: 2026 Voice AI Comparison',
  metaDescription: 'Comparing Cartesia AI vs ElevenLabs? Cartesia Sonic targets real-time voice agents; FlashTTS is a browser studio for creators with character-based plans. Features and pricing compared.',
  hero: {
    badge: 'COMPARISON 2026',
    title: 'Cartesia vs ElevenLabs vs FlashTTS: The Creator Breakdown',
    subheadline: "Cartesia Sonic is built for low-latency API voice agents. FlashTTS is a browser studio for video creators and publishers with fixed monthly character allowances."
  },
  verdictCards: [
    {
      icon: 'lightning',
      title: 'Built for Daily Publishing',
      text: 'FlashTTS offers 200,000 characters for $9/month in a no-code web studio.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'dollar',
      title: 'Predictable Creator Pricing',
      text: 'Flat monthly character allowances instead of usage-based developer billing.',
      badge: 'Our opinion',
      badgeColor: 'gray'
    },
    {
      icon: 'waveform',
      title: 'Low-Latency Streaming',
      text: 'Cartesia Sonic is built for real-time voice agents.',
      badge: 'Cartesia Wins',
      badgeColor: 'gray'
    }
  ],
  table: {
    rows: [
      { feature: 'Primary Focus', flashTts: 'Content Creators & Authors', competitor: 'Conversational Bot APIs' },
      { feature: 'Starter Price', flashTts: '$9 / 200,000 chars', competitor: '$5 - $25 dev tiers', win: 'tie' },
      { feature: 'Pro Plan', flashTts: '$39 / 2,000,000 chars', competitor: 'Usage-based metering' },
      { feature: 'Voice Cloning', flashTts: 'In the web studio', competitor: 'API-based cloning', win: 'flash' },
      { feature: 'Audiobook Studio', flashTts: 'Multi-chapter studio', competitor: 'Not listed', win: 'flash' },
      { feature: 'Latency', flashTts: 'Not published', competitor: '~100ms (Sonic model)', win: 'competitor' },
      { feature: 'Commercial License', flashTts: 'All paid plans', competitor: 'Tier dependent', win: 'tie' },
      { feature: 'Browser Interface', flashTts: 'No-code Creator Studio', competitor: 'Developer-first console', win: 'flash' },
      { feature: 'Export Formats', flashTts: 'MP3 + WAV', competitor: 'PCM, WAV, MP3', win: 'tie' },
      { feature: 'Languages Supported', flashTts: LANGUAGE_COUNT_LABEL, competitor: '15+ languages', win: 'flash' }
    ]
  },
  pricing: {
    sourceUrl: '', // TODO: https://cartesia.ai/pricing once verified
    note: 'Cartesia uses usage-based developer pricing, so a per-plan character figure is not on record.',
    competitorPlans: [
      { name: 'Developer tiers', price: null, chars: null, note: '$5-$25, usage-based' },
    ],
  },
  pricingBreakdown: {
    heading: 'Cost Scenarios',
    subtext: 'FlashTTS side uses the cheapest plan whose allowance covers the usage. Cartesia figures are our earlier estimates, not quotes.',
    creators: [
      {
        type: 'Faceless YouTube Channel (10 videos/mo)',
        chars: 250000,
        competitorCost: '$35 - $50 (est.)',
        competitorMath: 'Usage-based; estimate - verify on Cartesia pricing'
      },
      {
        type: 'Daily TikTok & Reels Agency (60 clips/mo)',
        chars: 1500000,
        competitorCost: '$160+ (est.)',
        competitorMath: 'Usage-based; estimate - verify on Cartesia pricing'
      },
      {
        type: 'Full Audiobook (80,000 words)',
        chars: 500000,
        competitorCost: 'Usage-based',
        competitorMath: 'API only; no audiobook editor listed'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You need a ready-to-use web studio to paste scripts and download MP3s.',
      'You want fixed monthly character allowances (up to 3M chars).',
      'You produce audiobooks, podcasts, or faceless YouTube videos.',
      'You want built-in voice cloning without writing API integration code.'
    ],
    competitor: [
      'You are building a live AI telephone agent where 100ms response time is critical.',
      'You only need raw WebSocket audio streams for backend software engineering.',
      'You prefer paying strictly per-character metered developer rates.'
    ]
  },
  faqs: [
    {
      q: 'How does Cartesia compare to ElevenLabs and FlashTTS?',
      a: 'Cartesia specializes in low latency (Sonic model) for real-time voice agents. ElevenLabs is a broad voice platform. FlashTTS is a browser studio for creators with fixed monthly character allowances and a lower cost per character than ElevenLabs on every plan we compared.'
    },
    {
      q: 'Is Cartesia better than ElevenLabs for video creators?',
      a: 'Not necessarily. Cartesia is built primarily for developers building voice bots via API. For creators who want a browser interface, chapter management and predictable monthly allowances, FlashTTS or ElevenLabs are easier to use.'
    },
    {
      q: 'Can I clone my voice on FlashTTS?',
      a: 'Yes. FlashTTS lets you clone your voice directly in your browser on every plan. Clones are saved to your private library, with commercial rights on paid plans.'
    }
  ]
};
