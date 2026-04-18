import { ComparisonData } from './elevenlabs';

export const wellsaidData: ComparisonData = {
  competitorName: 'WellSaid Labs',
  slug: 'wellsaid',
  metaTitle: 'FlashTTS vs WellSaid Labs: 81% Cheaper With 19 Languages',
  metaDescription: 'Comparing FlashTTS vs WellSaid Labs? WellSaid charges $49/mo for English-only voices with no cloning. FlashTTS gives you 200k credits, 19 languages, and voice cloning for just $9/mo. See the full breakdown.',
  hero: {
    badge: 'HONEST COMPARISON',
    title: 'FlashTTS vs WellSaid Labs: Same Quality, 81% Less Cost',
    subheadline: "WellSaid Labs charges $49/month for English-only voices — with no voice cloning, no free plan, and a 5,000 character clip limit. FlashTTS gives you 200,000 characters, 19 languages, and voice cloning for just $9/month."
  },
  verdictCards: [
    {
      icon: 'dollar',
      title: '81% Cheaper',
      text: 'FlashTTS starts at $9/mo. WellSaid Labs starts at $49/mo. Same studio quality — fraction of cost.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'lightning', // Multi-language maps to lightning/zap
      title: '19 vs 1 Language',
      text: 'FlashTTS supports 19 languages. WellSaid Labs is English only — limiting your global reach.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'microphone',
      title: 'Voice Cloning Included',
      text: 'FlashTTS includes voice cloning on all paid plans. WellSaid Labs has no voice cloning at all.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    }
  ],
  table: {
    rows: [
      { feature: 'Free Plan', flashTts: '10,000 chars', competitor: 'None (7-day trial)', win: 'flash' },
      { feature: 'Starter Price', flashTts: '$9/mo', competitor: '$49/mo', win: 'flash' },
      { feature: 'Creator Price', flashTts: '$19/mo', competitor: '$99/mo', win: 'flash' },
      { feature: 'Pro Price', flashTts: '$39/mo', competitor: '$199/mo', win: 'flash' },
      { feature: 'Languages', flashTts: '19 languages', competitor: 'English only', win: 'flash' },
      { feature: 'Voice Cloning', flashTts: 'All paid plans', competitor: 'Not available', win: 'flash' },
      { feature: 'Clip Length Limit', flashTts: 'No limit', competitor: '5,000 chars max', win: 'flash' },
      { feature: 'Voice Library', flashTts: '1,000+ voices', competitor: '24 pre-selected', win: 'flash' },
      { feature: 'Voice Choice', flashTts: 'Full library', competitor: 'Limited selection', win: 'flash' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'All paid plans', win: 'tie' },
      { feature: 'Voice Quality', flashTts: 'Studio-grade', competitor: 'Studio-grade', win: 'tie' },
      { feature: 'API Access', flashTts: 'Studio plan', competitor: 'Creative plan+', win: 'tie' },
      { feature: 'Mobile Friendly', flashTts: 'Yes', competitor: 'Yes', win: 'tie' }
    ]
  },
  warningSection: {
    title: 'Every Clip Capped at 5,000 Characters',
    text: 'WellSaid Labs limits every single audio clip to 5,000 characters on their Maker plan. A single blog post intro can exceed that. Long-form creators — podcasters, audiobook producers, course creators — have to manually split every script into dozens of clips, then stitch them together. FlashTTS has no clip length limits on any paid plan.',
    source: 'WellSaid Labs Maker Plan terms',
    mathCard: {
      title: 'A 10-minute YouTube script = ~8,000 chars',
      competitorLabel: 'WellSaid clips needed: 2+ manual splits',
      flashTtsLabel: 'FlashTTS clips needed: 1'
    }
  },
  pricingBreakdown: {
    heading: 'The Real Cost Difference',
    subtext: "Switch to FlashTTS — more languages, more features, less cost.",
    creators: [
      {
        type: 'Solo YouTube Creator',
        needs: 'Weekly video voiceovers',
        competitorCost: '$49/mo (Maker)',
        flashTtsCost: '$9/mo (Starter)',
        savings: '$40/mo',
        savingsYearly: '$480/year'
      },
      {
        type: 'Multilingual Content Creator',
        needs: 'English + Spanish + Hindi',
        competitorCost: 'Not possible',
        flashTtsCost: '$19/mo (Creator)',
        savings: 'Right Tool',
        savingsYearly: '19 languages included'
      },
      {
        type: 'Audiobook Producer',
        needs: 'Long-form narration',
        competitorCost: '$99/mo (Creative)',
        flashTtsCost: '$39/mo (Pro)',
        savings: '$60/mo',
        savingsYearly: '$720/year + hours saved'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You need more than English language support',
      'You want voice cloning included',
      'Budget matters to your business',
      'You create long-form audio content',
      'You want a free tier to start',
      'You\'re a YouTuber, Podcaster or Agency'
    ],
    competitor: [
      'You only create English content',
      'You need enterprise SOC2 compliance',
      'Your team needs advanced collaboration',
      'You serve Fortune 500 enterprise clients',
      'Security certifications are mandatory'
    ]
  },
  faqs: [
    {
      q: 'Is FlashTTS cheaper than WellSaid Labs?',
      a: 'Yes — significantly. FlashTTS starts at $9/month with 200,000 characters, 19 language support, and voice cloning included. WellSaid Labs starts at $49/month for English-only voices, no voice cloning, and a 5,000 character clip limit. That makes FlashTTS 81% cheaper at entry level.'
    },
    {
      q: 'Does WellSaid Labs support multiple languages?',
      a: 'No — WellSaid Labs only supports English. This makes it unsuitable for creators who need to produce content in Spanish, Hindi, Arabic, French, or any other language. FlashTTS supports 19 languages on all paid plans, making it the stronger choice for global content creators.'
    },
    {
      q: 'Does WellSaid Labs include voice cloning?',
      a: 'No — WellSaid Labs does not offer voice cloning. They provide pre-built voice avatars which you cannot customize with your own voice. FlashTTS includes voice cloning on all paid plans starting from $9/month, allowing you to clone your voice in under 60 seconds.'
    },
    {
      q: 'What is the best WellSaid Labs alternative for content creators?',
      a: 'For content creators who need affordable, multilingual AI voiceovers with voice cloning, FlashTTS is the strongest WellSaid Labs alternative. It offers 200,000 characters for $9/month, supports 19 languages, includes voice cloning, has no clip length limits, and starts with a free tier — no credit card required.'
    },
    {
      q: 'Is there a free plan on FlashTTS unlike WellSaid Labs?',
      a: 'Yes. FlashTTS offers a permanent free tier with 10,000 characters per month — no credit card required. WellSaid Labs only offers a 7-day trial with limited voice access, after which you must upgrade to a paid plan starting at $49/month.'
    }
  ]
};
