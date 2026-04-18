import { ComparisonData } from './elevenlabs';

export const lovoData: ComparisonData = {
  competitorName: 'LOVO AI',
  slug: 'lovo',
  metaTitle: 'FlashTTS vs LOVO AI: 64% Cheaper With No Voice Deletion Risk',
  metaDescription: 'Comparing FlashTTS vs LOVO AI? LOVO AI charges $25/mo for just 2 hours of audio and randomly deletes voices with no warning. FlashTTS gives you more audio, lower price, and zero deletion risk.',
  hero: {
    badge: 'HONEST COMPARISON',
    title: 'FlashTTS vs LOVO AI: More Audio, No Deleted Voices',
    subheadline: "LOVO AI charges $25/month for just 2 hours of audio — and has a documented history of randomly deleting voices mid-project with no warning or compensation. FlashTTS gives you 200,000 characters for $9, with zero deletion risk."
  },
  verdictCards: [
    {
      icon: 'dollar',
      title: '64% Cheaper',
      text: 'FlashTTS Starter = $9/mo. LOVO Basic = $25/mo. Same audio volume, fraction of cost.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'lightning', // Lightning represents Reliability/Shield in this context maps to Zap
      title: 'No Voice Deletion',
      text: 'LOVO AI deletes voices without warning, breaking projects mid-production. FlashTTS voices are permanent.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'waveform',
      title: 'More Per Dollar',
      text: '200k chars (~200 mins) for $9 vs 2hrs/mo on LOVO for $25. Better value at every tier.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    }
  ],
  table: {
    rows: [
      { feature: 'Free Plan', flashTts: '10,000 chars', competitor: '20 mins trial only', win: 'flash' },
      { feature: 'Basic / Starter', flashTts: '200k / $9', competitor: '2hrs / $25', win: 'flash' },
      { feature: 'Creator / Pro', flashTts: '500k / $19', competitor: '5hrs / $48', win: 'flash' },
      { feature: 'Pro', flashTts: '1M / $39', competitor: '20hrs / $149', win: 'flash' },
      { feature: 'Studio', flashTts: '3M / $79', competitor: 'Enterprise', win: 'flash' },
      { feature: 'Voice Cloning', flashTts: 'All paid plans', competitor: 'Pro plan only', win: 'flash' },
      { feature: 'Voice Deletion Risk', flashTts: 'None', competitor: 'Documented', win: 'flash' },
      { feature: 'Unused Credits', flashTts: 'Stable', competitor: 'Expire monthly', win: 'flash' },
      { feature: 'Languages', flashTts: '19 languages', competitor: '100+ languages', win: 'tie' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'All paid plans', win: 'tie' },
      { feature: 'Customer Support', flashTts: 'Responsive', competitor: 'Slow (1-2 weeks)', win: 'flash' },
      { feature: 'Voice Library', flashTts: '1,000+ voices', competitor: '500+ voices', win: 'flash' },
      { feature: 'Free Downloads', flashTts: 'No', competitor: 'No (trial only)', win: 'tie' }
    ]
  },
  warningSection: {
    title: 'Voices Get Deleted Without Warning',
    text: 'Multiple verified user reports on Capterra and G2 document LOVO AI randomly removing voices from their library — breaking ongoing projects with no warning, explanation, or compensation. Users who built content series around specific voices were forced to start over completely.',
    source: 'Verified Capterra Review',
    quote: "Lovo have deleted the voices. That makes it hugely expensive in time and money. I really wish I'd never heard of this product.",
    quoteSource: 'Verified Capterra Review',
    note: "FlashTTS does not delete voices from our library. Your saved voices and cloned voices remain permanently available as long as your account is active."
  },
  pricingBreakdown: {
    heading: 'Real Cost Comparison for Creators',
    subtext: "Switch to FlashTTS — reliable AI audio at a price that makes sense.",
    creators: [
      {
        type: 'Weekly YouTube Creator',
        needs: '~180 mins audio/month',
        competitorCost: '$25/mo (Basic)',
        flashTtsCost: '$9/mo (Starter)',
        savings: '$16/mo',
        savingsYearly: '$192/year'
      },
      {
        type: 'Daily Shorts + Faceless Creator',
        needs: '~500 mins audio/month',
        competitorCost: '$48/mo (Pro)',
        flashTtsCost: '$19/mo (Creator)',
        savings: '$29/mo',
        savingsYearly: '$348/year'
      },
      {
        type: 'Audiobook + Podcast Creator',
        needs: '~1,000 mins audio/month',
        competitorCost: '$149/mo (Pro+)',
        flashTtsCost: '$39/mo (Pro)',
        savings: '$110/mo',
        savingsYearly: '$1,320/year'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You need reliable voices that never get deleted',
      'You publish content daily or weekly',
      'Budget matters to your business',
      'You want voice cloning without Pro plan',
      'You need responsive customer support',
      'You\'re a YouTuber, Podcaster or Agency'
    ],
    competitor: [
      'You need 100+ language support',
      'You need built-in video editor',
      'You need AI image generation bundled',
      'You only produce low-volume audio',
      'You need subtitle generation built-in'
    ]
  },
  faqs: [
    {
      q: 'Is FlashTTS cheaper than LOVO AI?',
      a: 'Yes — significantly. FlashTTS starts at $9/month with 200,000 characters included. LOVO AI\'s Basic plan starts at $25/month with only 2 hours of audio generation. That makes FlashTTS 64% cheaper at entry level, while delivering comparable or greater audio volume for most content creators.'
    },
    {
      q: 'Does LOVO AI delete voices?',
      a: 'Multiple verified user reviews on Capterra and G2 report that LOVO AI has removed voices from their library without warning, breaking ongoing content projects with no compensation. FlashTTS does not delete voices — your saved voices and cloned voices remain permanently available as long as your account is active.'
    },
    {
      q: 'Does LOVO AI include voice cloning?',
      a: 'LOVO AI includes voice cloning starting from their Pro plan at $48/month. FlashTTS includes voice cloning on all paid plans starting from just $9/month — making it significantly more accessible for creators on a budget.'
    },
    {
      q: 'What is the best LOVO AI alternative for content creators?',
      a: 'For content creators who need reliable, affordable AI voiceovers at scale, FlashTTS is the strongest LOVO AI alternative. It offers 200,000 characters for $9/month, includes voice cloning on all plans, has no voice deletion risk, and is purpose-built for YouTubers, Podcasters, and Agencies who publish daily.'
    },
    {
      q: 'How does LOVO AI compare to FlashTTS for audiobooks?',
      a: 'FlashTTS has a dedicated Audiobook Studio designed for long-form narration at scale. LOVO AI\'s minute-based pricing makes audiobook production expensive — a single audiobook chapter can consume a significant portion of your monthly allowance. FlashTTS character-based pricing is far more predictable and cost-effective for audiobook creators.'
    }
  ]
};
