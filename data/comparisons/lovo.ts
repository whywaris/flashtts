import { ComparisonData } from './elevenlabs';
import { LANGUAGE_COUNT_LABEL, CHARS_PER_AUDIO_MINUTE } from '@/lib/siteStats';

// TODO: verify every LOVO value below on https://lovo.ai/pricing (official page) and set
// COMPETITOR_PRICES_CHECKED in lib/siteStats.ts. Values carried over from the previous page, not re-checked.
// LOVO bills by audio minutes; character figures are estimates at CHARS_PER_AUDIO_MINUTE.
const min = (m: number) => m * CHARS_PER_AUDIO_MINUTE;

export const lovoData: ComparisonData = {
  competitorName: 'LOVO AI',
  slug: 'lovo',
  metaTitle: 'FlashTTS vs LOVO AI: Price per Character Compared',
  metaDescription: 'LOVO AI bills by audio hours, FlashTTS by characters. We convert both to an estimated cost per 1,000 characters, show the math, and list where LOVO is the better pick.',
  hero: {
    badge: 'PRICE COMPARISON',
    title: 'FlashTTS vs LOVO AI: Price per Character Compared',
    subheadline: "LOVO AI's Basic plan is $25/month for 2 hours of audio. FlashTTS Starter is $9/month for 200,000 characters (about 200 minutes, estimated). Here is the per-character math."
  },
  verdictCards: [
    {
      icon: 'dollar',
      title: 'Lower Cost per Character (est.)',
      text: 'Converted at ~1,000 characters per audio minute, FlashTTS costs less per character on every plan we compared.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'microphone',
      title: 'Voice Cloning on Every Plan',
      text: 'FlashTTS includes cloning on every plan. LOVO lists cloning from its Pro plan.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'waveform',
      title: 'More Languages & Video Tools',
      text: 'LOVO lists 100+ languages plus a built-in video editor.',
      badge: 'LOVO Wins',
      badgeColor: 'gray'
    }
  ],
  table: {
    rows: [
      { feature: 'Free Plan', flashTts: '10,000 chars/mo', competitor: '20 mins trial only', win: 'flash' },
      { feature: 'Basic / Starter', flashTts: '200,000 chars / $9', competitor: '2 hrs / $25', win: 'flash' },
      { feature: 'Mid tier', flashTts: '600,000 chars / $19', competitor: '5 hrs / $48', win: 'flash' },
      { feature: 'Pro', flashTts: '2,000,000 chars / $39', competitor: '20 hrs / $149', win: 'flash' },
      { feature: 'Studio', flashTts: '3,000,000 chars / $79', competitor: 'Enterprise', win: 'flash' },
      { feature: 'Voice Cloning', flashTts: 'Every plan', competitor: 'Pro plan+', win: 'flash' },
      { feature: 'Unused allowance', flashTts: 'Resets each billing cycle', competitor: 'Resets monthly', win: 'tie' },
      { feature: 'Languages', flashTts: LANGUAGE_COUNT_LABEL, competitor: '100+ languages', win: 'competitor' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'All paid plans', win: 'tie' },
      { feature: 'Billing unit', flashTts: 'Characters', competitor: 'Audio hours' }
    ]
  },
  // Hidden until sourceUrl is set (template renders warnings only with a linked source).
  // TODO: link the exact Capterra/G2 review quoted below, or delete this section.
  warningSection: {
    title: 'User Reports of Removed Voices',
    text: 'Some user reviews report LOVO AI removing voices from its library, which affected ongoing projects.',
    source: 'Capterra review',
    sourceUrl: '',
    quote: "Lovo have deleted the voices. That makes it hugely expensive in time and money. I really wish I'd never heard of this product.",
    quoteSource: 'Capterra review',
  },
  pricing: {
    sourceUrl: '', // TODO: https://lovo.ai/pricing once verified
    note: 'LOVO figures are converted from audio hours at ~1,000 characters per minute (estimate).',
    competitorPlans: [
      { name: 'Basic', price: 25, chars: min(120), estimated: true },
      { name: 'Pro', price: 48, chars: min(300), estimated: true },
      { name: 'Pro+', price: 149, chars: min(1200), estimated: true },
    ],
  },
  pricingBreakdown: {
    heading: 'Cost Scenarios',
    subtext: 'Each scenario uses the cheapest plan whose allowance covers the usage. Minutes converted at ~1,000 chars/min (est.).',
    creators: [
      {
        type: 'Weekly YouTube Creator',
        chars: min(180),
        competitorCost: '$48/mo (Pro)',
        competitorMath: '~180 min needed > 120 min on Basic ($25) → Pro, 300 min'
      },
      {
        type: 'Daily Shorts + Faceless Creator',
        chars: min(500),
        competitorCost: '$149/mo (Pro+)',
        competitorMath: '~500 min needed > 300 min on Pro ($48) → Pro+, 1,200 min'
      },
      {
        type: 'Audiobook + Podcast Creator',
        chars: min(1000),
        competitorCost: '$149/mo (Pro+)',
        competitorMath: '~1,000 min needed ≤ 1,200 min included'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You publish content daily or weekly',
      'You want a lower cost per character',
      'You want voice cloning without a Pro plan',
      'You\'re a YouTuber, Podcaster or Agency'
    ],
    competitor: [
      'You need 100+ language support',
      'You need built-in video editor',
      'You need AI image generation bundled',
      'You need subtitle generation built-in'
    ]
  },
  faqs: [
    {
      q: 'Is FlashTTS cheaper than LOVO AI?',
      a: 'Per character, yes on every plan we compared (estimated, converting LOVO hours at ~1,000 characters per minute). FlashTTS Starter is $9/month for 200,000 characters; LOVO Basic is $25/month for 2 hours of audio.'
    },
    {
      q: 'Does LOVO AI delete voices?',
      a: '' // TODO: answer only with a linked source. Hidden until filled.
    },
    {
      q: 'Does LOVO AI include voice cloning?',
      a: 'LOVO lists voice cloning from its Pro plan ($48/month). FlashTTS includes voice cloning on every plan, including Starter at $9/month.'
    },
    {
      q: 'What is the best LOVO AI alternative for content creators?',
      a: 'If you want character-based pricing and voice cloning on every plan, FlashTTS is worth trying: 200,000 characters for $9/month and a free tier to test with. If you need 100+ languages or a built-in video editor, LOVO may fit better.'
    },
    {
      q: 'How does LOVO AI compare to FlashTTS for audiobooks?',
      a: 'FlashTTS has a multi-chapter Audiobook Studio and bills by characters, so you can estimate a book\'s cost from its length. LOVO bills by audio time. Compare both against your manuscript length.'
    }
  ]
};
