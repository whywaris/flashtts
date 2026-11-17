import { ComparisonData } from './elevenlabs';
import { LANGUAGE_COUNT_LABEL } from '@/lib/siteStats';

// TODO: verify every Speechify value below on https://speechify.com/pricing (official page) and set
// COMPETITOR_PRICES_CHECKED in lib/siteStats.ts. Values carried over from the previous page, not re-checked.

export const speechifyData: ComparisonData = {
  competitorName: 'Speechify',
  slug: 'speechify',
  metaTitle: 'FlashTTS vs Speechify: Built for Creators, Not Readers',
  metaDescription: 'Comparing FlashTTS vs Speechify? Speechify is built around reading content aloud. FlashTTS is built for YouTubers, Podcasters and Agencies creating voiceovers. Pricing and features compared.',
  hero: {
    badge: 'COMPARISON',
    title: 'FlashTTS vs Speechify: Reading App vs Creation Tool',
    subheadline: "Speechify is built to help you listen to content. FlashTTS is built to create voiceovers, clone voices and export audio for publishing. Which one fits depends on what you're making."
  },
  differenceBanner: {
    left: {
      label: 'Speechify',
      icon: 'book',
      title: 'A Reading App',
      text: 'Designed to read documents, articles and PDFs aloud for personal productivity.',
      tag: 'For personal reading'
    },
    right: {
      label: 'FlashTTS',
      icon: 'waveform',
      title: 'A Creation Tool',
      text: 'Built to generate voiceovers, clone voices, and produce audio content for creators.',
      tag: 'For content creators'
    }
  },
  verdictCards: [
    {
      icon: 'lightning',
      title: 'Built for Creation',
      text: 'FlashTTS generates voiceovers for publishing. Speechify focuses on reading existing documents aloud.',
      badge: 'Our opinion',
      badgeColor: 'gray'
    },
    {
      icon: 'microphone',
      title: 'Voice Cloning Included',
      text: 'FlashTTS includes voice cloning on every plan. Voice cloning is not listed on the Speechify plans we compared.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'dollar',
      title: 'Monthly Price',
      text: 'FlashTTS $9/mo vs Speechify $29/mo billed monthly ($11.58/mo billed annually).',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    }
  ],
  table: {
    rows: [
      { feature: 'Primary Purpose', flashTts: 'Content Creation', competitor: 'Personal Reading' },
      { feature: 'Free Plan', flashTts: '10,000 chars/mo', competitor: 'Basic (limited)', win: 'tie' },
      { feature: 'Monthly billing', flashTts: '$9/mo', competitor: '$29/mo', win: 'flash' },
      { feature: 'Annual billing', flashTts: '$7/mo', competitor: '$11.58/mo', win: 'flash' },
      { feature: 'Monthly allowance', flashTts: '200,000 chars', competitor: '150,000 words', win: 'competitor' },
      { feature: 'Voice Cloning', flashTts: 'Every plan', competitor: 'Not listed', win: 'flash' },
      { feature: 'Languages', flashTts: LANGUAGE_COUNT_LABEL, competitor: '60+ languages', win: 'competitor' },
      { feature: 'API for Developers', flashTts: 'Studio plan', competitor: 'Separate product', win: 'tie' },
      { feature: 'Audiobook Studio', flashTts: 'Multi-chapter', competitor: 'Not listed', win: 'flash' }
    ]
  },
  pricing: {
    sourceUrl: '', // TODO: https://speechify.com/pricing once verified
    note: 'Speechify bills by words, so per-character cost is not directly comparable.',
    competitorPlans: [
      { name: 'Premium (annual)', price: 11.58, chars: null, note: '150k words/mo' },
      { name: 'Premium (monthly)', price: 29, chars: null, note: '150k words/mo' },
    ],
  },
  pricingBreakdown: {
    heading: 'Which FlashTTS Plan Covers Your Usage',
    subtext: 'FlashTTS side uses the cheapest plan whose allowance covers the usage. Speechify allowance is in words.',
    creators: [
      {
        type: 'Faceless YouTube Creator',
        chars: 200000,
        competitorCost: '$29/mo (monthly)',
        competitorMath: '150,000 words/mo allowance; word-based, built for listening'
      },
      {
        type: 'Daily Creator',
        chars: 600000,
        competitorCost: '$29/mo (monthly)',
        competitorMath: '150,000 words/mo allowance; word-based, built for listening'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You publish content daily or weekly',
      'You want voice cloning included',
      'You need audio exports for publishing',
      'You produce for YouTube, Podcasts or Clients'
    ],
    competitor: [
      'You want books/articles read aloud',
      'You need PDF narration tools',
      'You have reading difficulties (Dyslexia)',
      'You need Chrome Extension for browsing',
      'You need more than ' + LANGUAGE_COUNT_LABEL
    ]
  },
  // Hidden until sourceUrl is set. TODO: link the specific public reports, or delete this section.
  warningSection: {
    title: 'A Note on Speechify Billing',
    text: 'Some public user reports describe unexpected auto-renewal charges. Check renewal terms and set a reminder before any trial ends.',
    source: 'Public user reports',
    sourceUrl: ''
  },
  faqs: [
    {
      q: 'Is Speechify good for content creators?',
      a: 'Speechify was primarily designed as a reading and productivity app - helping users listen to documents, articles and books. FlashTTS is built for creators who need voiceovers, voice cloning and audio exports for publishing.'
    },
    {
      q: 'Can Speechify clone your voice?',
      a: 'Voice cloning is not listed on the Speechify plans we compared - check Speechify\'s site for current features. FlashTTS includes voice cloning on every plan, starting with 1 clone on Free.'
    },
    {
      q: 'Is FlashTTS cheaper than Speechify?',
      a: 'On monthly billing, FlashTTS Starter is $9/month vs Speechify\'s $29/month ($11.58/month billed annually). Speechify bills by words and FlashTTS by characters, so compare the allowance against your own usage.'
    },
    {
      q: 'What is the best Speechify alternative for YouTubers?',
      a: `If you need voiceovers rather than read-aloud, FlashTTS is built for that: 200,000 characters a month for $9, voice cloning on every plan, and ${LANGUAGE_COUNT_LABEL}.`
    },
    {
      q: 'Does FlashTTS work for audiobooks?',
      a: 'Yes - FlashTTS has an Audiobook Studio for multi-chapter narration. Paid plans include commercial rights, so you can publish and sell the audio.'
    }
  ]
};
