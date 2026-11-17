import { ComparisonData } from './elevenlabs';
import { LANGUAGE_COUNT_LABEL } from '@/lib/siteStats';

// TODO: verify every NaturalReader value below on https://www.naturalreaders.com/pricing.html (official page)
// and set COMPETITOR_PRICES_CHECKED in lib/siteStats.ts. Values carried over from the previous page, not re-checked.

export const naturalreaderData: ComparisonData = {
  competitorName: 'NaturalReader',
  slug: 'naturalreader',
  metaTitle: 'FlashTTS vs NaturalReader: Commercial Rights and Pricing Compared',
  metaDescription: 'Comparing FlashTTS vs NaturalReader? NaturalReader personal plans are for personal use; FlashTTS includes commercial rights and voice cloning on paid plans from $9/mo. Plans side by side.',
  hero: {
    badge: 'COMPARISON',
    title: 'FlashTTS vs NaturalReader: Built for Creators, Not Just Readers',
    subheadline: "NaturalReader's personal plans are licensed for personal use; commercial use needs their separate Commercial plan. FlashTTS includes commercial rights on every paid plan from $9/month."
  },
  verdictCards: [
    {
      icon: 'shield',
      title: 'Commercial Rights Included',
      text: 'FlashTTS includes commercial rights on all paid plans. NaturalReader personal plans are for personal use.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'microphone',
      title: 'Voice Cloning Included',
      text: 'FlashTTS includes voice cloning on every plan. NaturalReader lists cloning on its Commercial plan.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'dollar',
      title: 'Lower Top-Tier Price',
      text: 'NaturalReader Pro is $25.90/mo vs FlashTTS Pro at $39/mo (for personal use).',
      badge: 'NaturalReader Wins',
      badgeColor: 'gray'
    }
  ],
  // Hidden until sourceUrl is set. TODO: link NaturalReader's licensing terms.
  warningSection: {
    title: 'NaturalReader Personal Plans = Personal Use',
    text: "NaturalReader's personal plans license downloaded audio for personal use. For YouTube, podcasts or client work you need their Commercial plan. FlashTTS includes commercial rights on every paid plan.",
    source: 'NaturalReader pricing terms',
    sourceUrl: '',
    comparisonCallout: {
      leftLabel: 'NaturalReader Personal Plus $20.90/mo',
      leftText: 'Personal use only',
      rightLabel: 'FlashTTS Starter $9/mo',
      rightText: 'Commercial rights included'
    }
  },
  table: {
    rows: [
      { feature: 'Free Plan', flashTts: '10,000 chars/mo', competitor: 'Limited (personal)', win: 'tie' },
      { feature: 'Starter Price', flashTts: '$9/mo', competitor: '$9.99/mo (non-AI voices)', win: 'flash' },
      { feature: 'Plus / Creator Price', flashTts: '$19/mo', competitor: '$20.90/mo', win: 'flash' },
      { feature: 'Pro Price', flashTts: '$39/mo', competitor: '$25.90/mo', win: 'competitor' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'Commercial plan only', win: 'flash' },
      { feature: 'Daily Limit', flashTts: 'None (monthly allowance only)', competitor: 'Daily limits apply' },
      { feature: 'Voice Cloning', flashTts: 'Every plan', competitor: 'Commercial plan only', win: 'flash' },
      { feature: 'Languages', flashTts: LANGUAGE_COUNT_LABEL, competitor: '28 languages', win: 'competitor' },
      { feature: 'API Access', flashTts: 'Studio plan', competitor: 'Commercial plan only', win: 'tie' }
    ]
  },
  pricing: {
    sourceUrl: '', // TODO: https://www.naturalreaders.com/pricing.html once verified
    note: 'NaturalReader per-plan character allowances are not in our records, so per-character cost is not shown for NaturalReader.',
    competitorPlans: [
      { name: 'Personal', price: 9.99, chars: null, note: 'Allowance not on record' },
      { name: 'Plus', price: 20.9, chars: null, note: 'Allowance not on record' },
      { name: 'Pro', price: 25.9, chars: null, note: 'Allowance not on record' },
    ],
  },
  pricingBreakdown: {
    heading: 'Cost Scenarios for Monetized Content',
    subtext: 'FlashTTS side uses the cheapest plan whose allowance covers the usage.',
    creators: [
      {
        type: 'TikTok & Shorts Creator',
        chars: 200000,
        competitorCost: 'Commercial plan',
        competitorMath: 'Personal plans ($9.99-$25.90) are personal-use; Commercial price not on record'
      },
      {
        type: 'Agency producing client audio',
        chars: 600000,
        competitorCost: 'Commercial plan',
        competitorMath: 'Client work needs commercial rights; Commercial price not on record'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You monetize your content on any platform',
      'You need commercial rights included',
      'You want voice cloning from day one',
      'You publish daily or weekly content',
      'You\'re a YouTuber, Podcaster or Agency'
    ],
    competitor: [
      'You only need personal reading/listening',
      'You\'re a student consuming documents',
      'You need OCR for scanned documents',
      'You need accessibility tools for dyslexia',
      'You don\'t need to monetize the audio'
    ]
  },
  faqs: [
    {
      q: 'Can you use NaturalReader for commercial use?',
      a: 'NaturalReader\'s personal plans license downloaded audio for personal use; commercial use requires their Commercial plan. Check NaturalReader\'s current terms. FlashTTS includes commercial rights on all paid plans from $9/month.'
    },
    {
      q: 'Does NaturalReader have daily character limits?',
      a: 'Check NaturalReader\'s pricing page for its current daily and monthly limits on each plan. FlashTTS has no daily cap: you can use your monthly character allowance whenever you like, within the per-generation limit of your plan.'
    },
    {
      q: 'Is FlashTTS cheaper than NaturalReader?',
      a: 'It depends on the plan. FlashTTS Starter ($9) and Creator ($19) cost less than NaturalReader Personal ($9.99) and Plus ($20.90); NaturalReader Pro ($25.90) costs less than FlashTTS Pro ($39). For commercial use, compare FlashTTS against NaturalReader\'s Commercial plan.'
    },
    {
      q: 'What is the best NaturalReader alternative for content creators?',
      a: `If you need commercial rights, FlashTTS includes them on every paid plan from $9/month, along with voice cloning and ${LANGUAGE_COUNT_LABEL}.`
    },
    {
      q: 'Does NaturalReader include voice cloning?',
      a: 'NaturalReader lists voice cloning on its Commercial plan. FlashTTS includes voice cloning on every plan - no separate commercial plan required.'
    }
  ]
};
