import { ComparisonData } from './elevenlabs';

export const murfData: ComparisonData = {
  competitorName: 'Murf AI',
  slug: 'murf',
  metaTitle: 'FlashTTS vs Murf AI: 4x More Audio at Half the Price',
  metaDescription: 'Comparing FlashTTS vs Murf AI? FlashTTS gives creators 4x more audio generation at half the price — with voice cloning included on all plans. No minute limits. See the full breakdown.',
  hero: {
    badge: 'HONEST COMPARISON',
    title: 'FlashTTS vs Murf AI: More Audio, No Minute Limits',
    subheadline: "Murf AI charges $19/month for just 2 hours of audio. FlashTTS gives you 200,000 characters — roughly 200+ minutes — for the same price. No expiring minutes. No surprise stops."
  },
  verdictCards: [
    {
      icon: 'lightning',
      title: '4x More Audio',
      text: '200k chars (~200 mins) for $9 vs 2 hrs/mo on Murf\'s $19 Creator plan.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'dollar',
      title: '53% Cheaper',
      text: 'FlashTTS starts at $9/mo. Murf Creator starts at $19/mo.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'microphone',
      title: 'Cloning Included',
      text: 'FlashTTS includes voice cloning on all paid plans. Murf requires Enterprise.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    }
  ],
  table: {
    rows: [
      { feature: 'Free Plan', flashTts: '10,000 chars', competitor: '10 mins lifetime', win: 'flash' },
      { feature: 'Basic / Starter', flashTts: '200k / $9', competitor: '2hrs / $19', win: 'flash' },
      { feature: 'Business / Creator', flashTts: '500k / $19', competitor: '8hrs / $66', win: 'flash' },
      { feature: 'Pro', flashTts: '1M / $39', competitor: 'Enterprise only', win: 'flash' },
      { feature: 'Studio', flashTts: '3M / $79', competitor: 'Enterprise only', win: 'flash' },
      { feature: 'Voice Cloning', flashTts: 'All paid plans', competitor: 'Enterprise only', win: 'flash' },
      { feature: 'Unused Credits', flashTts: 'Roll over', competitor: 'Expire monthly', win: 'flash' },
      { feature: 'Languages', flashTts: '19 languages', competitor: '20 languages', win: 'tie' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'Creator+', win: 'flash' },
      { feature: 'Download Audio', flashTts: 'All paid plans', competitor: 'Creator+', win: 'flash' },
      { feature: 'Free Downloads', flashTts: 'No', competitor: 'No', win: 'tie' },
      { feature: 'Generation Type', flashTts: 'Character-based', competitor: 'Minute-based', win: 'flash' },
      { feature: 'API Access', flashTts: 'Studio plan', competitor: 'Enterprise only', win: 'flash' }
    ]
  },
  problemSection: {
    title: 'The Hidden Problem With Minute-Based Pricing',
    subtext: "Murf AI measures usage by actual audio duration — not characters. Here's why that hurts creators.",
    cards: [
      {
        icon: 'clock-x',
        title: 'Minutes Expire',
        text: "Murf's 2 hrs/month expires at month end. Unused minutes are gone forever. FlashTTS characters never expire."
      },
      {
        icon: 'warning',
        title: 'You Hit the Wall Mid-Project',
        text: 'Run out of minutes on Murf? Generation stops immediately. No warning. No buffer.'
      },
      {
        icon: 'calculator',
        title: "Math Doesn't Work for Daily Creators",
        text: '2 hrs = ~120 minutes of audio. A daily YouTube creator needs 600+ minutes per month minimum.'
      }
    ]
  },
  pricingBreakdown: {
    heading: 'What You Actually Get Per Dollar',
    subtext: "Switch to FlashTTS — character-based pricing that never runs out mid-project.",
    creators: [
      {
        type: 'Weekly Podcast Creator',
        needs: '~180 mins audio/month',
        competitorCost: '$19/mo (barely fits)',
        flashTtsCost: '$9/mo (Starter)',
        savings: '$10/mo',
        savingsYearly: '$120/year'
      },
      {
        type: 'Daily Shorts + YouTube Creator',
        needs: '~600 mins audio/month',
        competitorCost: '$66/mo (Business)',
        flashTtsCost: '$19/mo (Creator)',
        savings: '$47/mo',
        savingsYearly: '$564/year'
      },
      {
        type: 'Agency (Multiple Clients)',
        needs: '~1,500 mins audio/month',
        competitorCost: 'Enterprise (Custom)',
        flashTtsCost: '$39/mo (Pro)',
        savings: 'Massive Savings',
        savingsYearly: 'Enterprise vs $39/mo'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You publish content daily or weekly',
      'You need high-volume audio generation',
      'You want voice cloning without Enterprise',
      'You hate expiring credits',
      'Budget matters to your business',
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
      a: 'Yes — significantly. FlashTTS starts at $9/month with 200,000 characters included. Murf AI\'s Creator plan starts at $19/month but limits you to just 2 hours of audio per month. For high-volume creators, FlashTTS delivers 4x more audio at half the price.'
    },
    {
      q: 'Does Murf AI include voice cloning?',
      a: 'No — Murf AI reserves voice cloning for Enterprise plan customers only, which requires custom pricing. FlashTTS includes voice cloning on all paid plans starting from $9/month.'
    },
    {
      q: 'What happens when you run out of minutes on Murf AI?',
      a: 'When your Voice Generation Time (VGT) runs out on Murf AI, generation stops immediately with no buffer or warning. Unused minutes also do not carry over to the next month — they expire. FlashTTS uses character-based credits that are more predictable for daily content creators.'
    },
    {
      q: 'Which is better for YouTubers — FlashTTS or Murf AI?',
      a: 'For YouTubers who publish regularly, FlashTTS is the stronger choice. A daily YouTube creator typically needs 600+ minutes of audio per month. Murf AI\'s Creator plan only provides 120 minutes (2 hours) — requiring a $66/month Business upgrade. FlashTTS covers the same volume for just $19/month.'
    },
    {
      q: 'Does FlashTTS have commercial rights like Murf AI?',
      a: 'Yes. All FlashTTS paid plans include full commercial usage rights — meaning you can use generated audio on YouTube, TikTok, podcasts, client projects, and paid ads without any additional licensing fees.'
    }
  ]
};
