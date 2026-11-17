import { ComparisonData } from './elevenlabs';
import { LANGUAGE_COUNT_LABEL } from '@/lib/siteStats';

// TODO: verify every Fish Audio value below on https://fish.audio (official pricing page) and set
// COMPETITOR_PRICES_CHECKED in lib/siteStats.ts. Values carried over from the previous page, not re-checked.

export const fishAudioData: ComparisonData = {
  competitorName: 'Fish Audio',
  slug: 'fish-audio',
  metaTitle: 'Fish Audio vs ElevenLabs vs FlashTTS: 2026 Voice AI Comparison',
  metaDescription: 'Comparing Fish.Audio vs ElevenLabs? See how open-source voice cloning compares with hosted studios, and where FlashTTS fits for creators who want a no-setup web studio.',
  hero: {
    badge: 'COMPARISON 2026',
    title: 'Fish.Audio vs ElevenLabs vs FlashTTS: The Real Breakdown',
    subheadline: "Fish Audio is known for open-source zero-shot voice cloning. For creators who don't want to manage GPU servers, FlashTTS is a hosted web studio with fixed monthly character allowances."
  },
  verdictCards: [
    {
      icon: 'microphone',
      title: 'No Technical Setup',
      text: 'No GPU setup, Python environments, or HuggingFace tokens. Runs in the browser.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'dollar',
      title: 'Clear Commercial Rights',
      text: 'Commercial rights on all paid FlashTTS plans.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'waveform',
      title: 'Open Weights',
      text: 'Fish Audio publishes model weights you can self-host and modify.',
      badge: 'Fish Audio Wins',
      badgeColor: 'gray'
    }
  ],
  table: {
    rows: [
      { feature: 'Core Tech', flashTts: 'Hosted neural TTS & cloning', competitor: 'Fish-Speech (Zero-shot)', win: 'tie' },
      { feature: 'Ease of Use', flashTts: 'Web Studio (No code)', competitor: 'Web app + Self-hosted code', win: 'flash' },
      { feature: 'Starter Price', flashTts: '$9 / 200,000 characters', competitor: 'Credit packs / Free weights', win: 'tie' },
      { feature: 'Audiobook Support', flashTts: 'Multi-chapter studio', competitor: 'Single-generation clips', win: 'flash' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'Open model licensing rules', win: 'flash' },
      { feature: 'Languages Supported', flashTts: LANGUAGE_COUNT_LABEL, competitor: 'Multilingual (English/Chinese focus)', win: 'tie' },
      { feature: 'Export Formats', flashTts: 'MP3 + WAV', competitor: 'WAV', win: 'tie' }
    ]
  },
  pricing: {
    sourceUrl: '', // TODO: Fish Audio official pricing URL once verified
    note: 'Fish Audio sells credit packs or free self-hosted weights, so a per-plan character figure is not on record.',
    competitorPlans: [
      { name: 'Credit packs', price: null, chars: null, note: 'Not on record' },
      { name: 'Self-hosted', price: null, chars: null, note: 'Free weights + your GPU cost' },
    ],
  },
  pricingBreakdown: {
    heading: 'Cloud Studio vs Credits or Self-Hosting',
    subtext: 'FlashTTS side uses the cheapest plan whose allowance covers the usage. Fish Audio figures are our earlier estimates, not quotes.',
    creators: [
      {
        type: 'Solo YouTuber / Podcaster',
        chars: 200000,
        competitorCost: '$20+ (est.)',
        competitorMath: 'Credits or GPU bill; estimate - verify on Fish Audio'
      },
      {
        type: 'Active Content Creator (Daily Shorts)',
        chars: 600000,
        competitorCost: '$60+ (est.)',
        competitorMath: 'Credit packs; estimate - verify on Fish Audio'
      },
      {
        type: 'Audiobook Publisher / Agency',
        chars: 2000000,
        competitorCost: '$150+ (est.)',
        competitorMath: 'Credits or GPU cluster; estimate - verify on Fish Audio'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You want voiceovers without configuring GPU drivers or Python environments.',
      'You want a multi-chapter audiobook editor in the browser.',
      'You want predictable monthly pricing with up to 3 million characters per month.'
    ],
    competitor: [
      'You are an AI researcher or developer wanting to experiment with open-source model weights.',
      'You have dedicated GPU servers and prefer self-hosting your voice pipeline locally.',
      'You primarily generate Chinese and English bilingual audio experiments.'
    ]
  },
  faqs: [
    {
      q: 'What is the main difference between Fish Audio, ElevenLabs, and FlashTTS?',
      a: 'Fish Audio is known for its open-source Fish-Speech architecture, good for developers with their own hardware. ElevenLabs is a broad hosted voice platform. FlashTTS is a hosted web studio for creators with fixed monthly character allowances and a lower cost per character than ElevenLabs on every plan we compared.'
    },
    {
      q: 'Does FlashTTS require high-end hardware like running Fish Audio locally?',
      a: 'No. FlashTTS runs in the cloud. You can generate speech from any laptop, tablet or phone browser without installing software or owning a GPU.'
    },
    {
      q: 'Can I monetize YouTube videos made with FlashTTS?',
      a: 'Yes. All paid FlashTTS plans include commercial rights, so you can use the audio in monetized videos. The Free plan is not licensed for commercial use. Follow YouTube\'s disclosure rules for synthetic content where they apply.'
    }
  ]
};
