import { ComparisonData } from './elevenlabs';

export const cartesiaData: ComparisonData = {
  competitorName: 'Cartesia',
  slug: 'cartesia',
  metaTitle: 'Cartesia vs ElevenLabs vs FlashTTS: 2026 Voice AI Comparison',
  metaDescription: 'Comparing Cartesia AI vs ElevenLabs? See how Cartesia Sonic compares to ElevenLabs in latency and quality, and why FlashTTS gives creators 10x more credits.',
  hero: {
    badge: 'HONEST COMPARISON 2026',
    title: 'Cartesia vs ElevenLabs vs FlashTTS: The Creator Breakdown',
    subheadline: "Cartesia Sonic is built for ultra-fast API bots. ElevenLabs is built for premium audiobooks at a steep cost. FlashTTS gives video creators and publishers the best of both worlds: studio quality with 10x more character credits."
  },
  verdictCards: [
    {
      icon: 'lightning',
      title: 'Built for Daily Publishing',
      text: 'FlashTTS offers 200k chars for $9 vs Cartesia developer credit burns. Generate daily without surprise bills.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'dollar',
      title: 'Predictable Creator Pricing',
      text: 'Flat monthly credits without confusing token or concurrency calculations.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'waveform',
      title: 'Studio Quality Audio',
      text: 'Lifelike emotional delivery with breaths and pauses for video & podcasts.',
      badge: 'Tie',
      badgeColor: 'gray'
    }
  ],
  table: {
    rows: [
      { feature: 'Primary Focus', flashTts: 'Content Creators & Authors', competitor: 'Conversational Bot APIs', win: 'flash' },
      { feature: 'Starter Price', flashTts: '$9 / 200k chars', competitor: '$5 - $25 dev tiers', win: 'flash' },
      { feature: 'Pro Plan', flashTts: '$39 / 2M chars', competitor: 'Usage-based metering', win: 'flash' },
      { feature: 'Voice Cloning', flashTts: '1-Click Instant Cloning', competitor: 'API-based cloning', win: 'flash' },
      { feature: 'Audiobook Studio', flashTts: 'Full multi-chapter studio', competitor: 'Not available', win: 'flash' },
      { feature: 'Latency (Speed)', flashTts: 'Ultra-fast streaming', competitor: '~100ms (Sonic model)', win: 'competitor' },
      { feature: 'Commercial License', flashTts: 'Included on all paid plans', competitor: 'Tier dependent', win: 'flash' },
      { feature: 'Browser Interface', flashTts: 'No-code Creator Studio', competitor: 'Developer-first console', win: 'flash' },
      { feature: 'Export Formats', flashTts: '320kbps MP3 & Lossless WAV', competitor: 'PCM, WAV, MP3', win: 'tie' },
      { feature: 'Languages Supported', flashTts: '19+ Languages', competitor: '15+ Languages', win: 'flash' }
    ]
  },
  pricingBreakdown: {
    heading: 'The Real Cost of Creator Workflows',
    subtext: "Cartesia's model pricing is great for real-time customer support calls, but video creators publishing daily YouTube videos run into unexpected overage fees.",
    creators: [
      {
        type: 'Faceless YouTube Channel (10 videos/mo)',
        needs: '250,000 chars/month',
        competitorCost: '$35 - $50 (overages)',
        flashTtsCost: '$19 (Creator Plan)',
        savings: 'Save $31/mo',
        savingsYearly: '$372 saved per year'
      },
      {
        type: 'Daily TikTok & Reels Agency (60 clips/mo)',
        needs: '1,500,000 chars/month',
        competitorCost: '$160+ / month',
        flashTtsCost: '$39 (Pro Plan)',
        savings: 'Save $121/mo',
        savingsYearly: '$1,452 saved per year'
      },
      {
        type: 'Full Audiobook (80,000 words)',
        needs: '500,000 chars in one batch',
        competitorCost: 'Manual splicing needed',
        flashTtsCost: 'Included in Pro plan',
        savings: 'Ready in 2 hours',
        savingsYearly: 'Zero sound engineering fees'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You need a ready-to-use web studio to paste scripts and download MP3s in seconds.',
      'You want generous character allowances (up to 3M chars) that do not run out mid-month.',
      'You produce audiobooks, podcasts, or faceless YouTube videos requiring natural pauses.',
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
      a: 'Cartesia specializes in ultra-low latency (Sonic model) designed for real-time voice agents. ElevenLabs offers high-end audio quality at a premium price ($99/mo for Pro). FlashTTS bridges this gap by providing studio-quality voices with 6x to 10x more character credits at a fraction of the cost, purpose-built for video creators and authors.'
    },
    {
      q: 'Is Cartesia better than ElevenLabs for video creators?',
      a: 'Not necessarily. Cartesia is built primarily for developers building voice bots via API. For creators who need a simple browser interface, audio chapter management, and predictable monthly credits, FlashTTS or ElevenLabs are much easier to use.'
    },
    {
      q: 'Can I clone my voice on FlashTTS like in Cartesia or ElevenLabs?',
      a: 'Yes. FlashTTS allows you to clone your voice in under 60 seconds directly in your web browser. All clones are saved to your private library with full commercial rights on paid plans.'
    }
  ]
};

