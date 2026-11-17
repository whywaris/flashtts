import { ComparisonData } from './elevenlabs';
import { LANGUAGE_COUNT_LABEL, CHARS_PER_AUDIO_MINUTE } from '@/lib/siteStats';

// TODO: verify every Murf value below on https://murf.ai/pricing (official page) and set
// COMPETITOR_PRICES_CHECKED in lib/siteStats.ts. Values carried over from the previous page, not re-checked.
// Murf bills by audio minutes; character figures are estimates at CHARS_PER_AUDIO_MINUTE.
const min = (m: number) => m * CHARS_PER_AUDIO_MINUTE;

export const murfData: ComparisonData = {
  competitorName: 'Murf AI',
  slug: 'murf',
  metaTitle: 'FlashTTS vs Murf AI: Character vs Minute Pricing Compared',
  metaDescription: 'Murf AI bills by audio minutes, FlashTTS by characters. We convert both to an estimated cost per 1,000 characters, show the math, and list where Murf is the better pick.',
  hero: {
    badge: 'PRICE COMPARISON',
    title: 'FlashTTS vs Murf AI: Characters vs Minutes',
    subheadline: "Murf AI's Creator plan is $19/month for 2 hours of audio. FlashTTS Starter is $9/month for 200,000 characters (about 200 minutes, estimated). Here is the per-character math."
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
      title: 'Voice Cloning',
      text: 'Included on every FlashTTS plan. Murf lists voice cloning on Enterprise.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'lightning',
      title: 'Team & Slides Tools',
      text: 'Murf offers collaboration and presentation integrations that FlashTTS does not.',
      badge: 'Murf Wins',
      badgeColor: 'gray'
    }
  ],
  table: {
    rows: [
      { feature: 'Free Plan', flashTts: '10,000 chars/mo', competitor: '10 mins lifetime', win: 'flash' },
      { feature: 'Entry price', flashTts: '$9/mo', competitor: '$19/mo', win: 'flash' },
      { feature: 'Entry allowance', flashTts: '200,000 chars (~200 min est.)', competitor: '2 hrs', win: 'flash' },
      { feature: 'Mid tier', flashTts: '600,000 chars / $19', competitor: '8 hrs / $66', win: 'flash' },
      { feature: 'Pro', flashTts: '2,000,000 chars / $39', competitor: 'Enterprise only', win: 'flash' },
      { feature: 'Studio', flashTts: '3,000,000 chars / $79', competitor: 'Enterprise only', win: 'flash' },
      { feature: 'Voice Cloning', flashTts: 'Every plan', competitor: 'Enterprise only', win: 'flash' },
      { feature: 'Unused allowance', flashTts: 'Resets each billing cycle', competitor: 'Resets monthly', win: 'tie' },
      { feature: 'Languages', flashTts: LANGUAGE_COUNT_LABEL, competitor: '20 languages', win: 'flash' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'Creator+', win: 'tie' },
      { feature: 'Billing unit', flashTts: 'Characters', competitor: 'Audio minutes' },
      { feature: 'API Access', flashTts: 'Studio plan', competitor: 'Enterprise only', win: 'flash' }
    ]
  },
  pricing: {
    sourceUrl: '', // TODO: https://murf.ai/pricing once verified
    note: 'Murf figures are converted from audio minutes at ~1,000 characters per minute (estimate).',
    competitorPlans: [
      { name: 'Creator', price: 19, chars: min(120), estimated: true },
      { name: 'Business', price: 66, chars: min(480), estimated: true },
      { name: 'Enterprise', price: null, chars: null, note: 'Custom pricing' },
    ],
  },
  pricingBreakdown: {
    heading: 'Cost Scenarios',
    subtext: 'Each scenario uses the cheapest plan whose allowance covers the usage. Minutes converted at ~1,000 chars/min (est.).',
    creators: [
      {
        type: 'Weekly Podcast Creator',
        chars: min(180),
        competitorCost: '$66/mo (Business)',
        competitorMath: '~180 min needed > 120 min on Creator ($19) → Business, 480 min'
      },
      {
        type: 'Daily Shorts + YouTube Creator',
        chars: min(600),
        competitorCost: 'Enterprise (custom)',
        competitorMath: '~600 min needed > 480 min on Business ($66)'
      },
      {
        type: 'Agency (Multiple Clients)',
        chars: min(1500),
        competitorCost: 'Enterprise (custom)',
        competitorMath: '~1,500 min needed > 480 min on Business ($66)'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You publish content daily or weekly',
      'You need high-volume audio generation',
      'You want voice cloning without Enterprise',
      'You prefer paying per character, not per minute',
      'You\'re a YouTuber, Podcaster or Agency'
    ],
    competitor: [
      'You need PowerPoint integration',
      'Your team needs collaboration tools',
      'You produce low-volume audio (< 2hrs/mo)',
      'You need Google Slides integration',
      'Enterprise-level compliance is required'
    ]
  },
  faqs: [
    {
      q: 'Is FlashTTS cheaper than Murf AI?',
      a: 'Per character, yes on every plan we compared (estimated, converting Murf minutes at ~1,000 characters per minute). FlashTTS Starter is $9/month for 200,000 characters; Murf Creator is $19/month for 2 hours of audio.'
    },
    {
      q: 'Does Murf AI include voice cloning?',
      a: 'Murf lists voice cloning on its Enterprise plan - check Murf\'s pricing page for current terms. FlashTTS includes voice cloning on every plan: 1 clone on Free, 3 on Starter ($9/mo).'
    },
    {
      q: 'What happens when you run out of minutes on Murf AI?',
      a: 'Check Murf\'s pricing page for its current top-up and upgrade options. On FlashTTS, generation pauses when you reach your monthly character allowance until it resets at the next billing cycle, or you can upgrade to a larger plan at any time.'
    },
    {
      q: 'Which is better for YouTubers - FlashTTS or Murf AI?',
      a: 'It depends on volume. At about 600 minutes of audio a month (est. 600,000 characters), FlashTTS Creator ($19/mo) covers it, while Murf Business (8 hours, $66/mo) does not. For low volume or team features, Murf may suit you better.'
    },
    {
      q: 'Does FlashTTS include commercial rights?',
      a: 'Yes, on all paid plans: you can use generated audio on YouTube, TikTok, podcasts, client projects and ads. The Free plan is not licensed for commercial use.'
    }
  ]
};
