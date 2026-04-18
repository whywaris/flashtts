import { ComparisonData } from './elevenlabs';

export const speechifyData: ComparisonData = {
  competitorName: 'Speechify',
  slug: 'speechify',
  metaTitle: 'FlashTTS vs Speechify: Built for Creators, Not Readers',
  metaDescription: 'Comparing FlashTTS vs Speechify? Speechify is a reading app — not a content creation tool. FlashTTS is built for YouTubers, Podcasters & Agencies who need studio-quality audio at scale.',
  hero: {
    badge: 'HONEST COMPARISON',
    title: 'FlashTTS vs Speechify: Wrong Tool vs Right Tool',
    subheadline: "Speechify was built to help you READ content — not CREATE it. If you're a YouTuber, Podcaster, or Agency needing studio-quality voiceovers at scale, you need FlashTTS — not a reading app."
  },
  differenceBanner: {
    left: {
      label: 'Speechify',
      icon: 'book',
      title: 'A Reading App',
      text: 'Designed to read documents, articles and PDFs aloud for personal productivity. Not built for content creators.',
      tag: 'For personal reading'
    },
    right: {
      label: 'FlashTTS',
      icon: 'waveform',
      title: 'A Creation Tool',
      text: 'Built to generate studio-quality voiceovers, clone voices, and produce audio content at scale for creators.',
      tag: 'For content creators'
    }
  },
  verdictCards: [
    {
      icon: 'lightning',
      title: 'Built for Creation',
      text: 'FlashTTS generates studio-quality voiceovers. Speechify reads your existing documents aloud.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'microphone',
      title: 'Voice Cloning Included',
      text: 'FlashTTS includes voice cloning on all paid plans. Speechify has no voice cloning for creators.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'dollar',
      title: 'Better Value',
      text: 'FlashTTS $9/mo vs Speechify $11.58/mo — with actual creation tools included.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    }
  ],
  table: {
    rows: [
      { feature: 'Primary Purpose', flashTts: 'Content Creation', competitor: 'Personal Reading', win: 'flash' },
      { feature: 'Free Plan', flashTts: '10,000 chars', competitor: 'Basic (limited)', win: 'flash' },
      { feature: 'Starter Price', flashTts: '$9/mo', competitor: '$11.58/mo (annual)', win: 'flash' },
      { feature: 'Monthly Price', flashTts: '$9/mo', competitor: '$29/mo', win: 'flash' },
      { feature: 'Audio Generation', flashTts: '200k chars/mo', competitor: '150k words/mo', win: 'flash' },
      { feature: 'Voice Cloning', flashTts: 'All paid plans', competitor: 'Not available', win: 'flash' },
      { feature: 'Studio-Quality Export', flashTts: 'Yes', competitor: 'Limited', win: 'flash' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'Not for creation', win: 'flash' },
      { feature: 'Custom Voiceovers', flashTts: 'Yes', competitor: 'No', win: 'flash' },
      { feature: 'Languages', flashTts: '19 languages', competitor: '60+ languages', win: 'tie' },
      { feature: 'API for Developers', flashTts: 'Studio plan', competitor: 'Separate product', win: 'tie' },
      { feature: 'Audiobook Creation', flashTts: 'Yes', competitor: 'No', win: 'flash' },
      { feature: 'Podcast Production', flashTts: 'Yes', competitor: 'No', win: 'flash' },
      { feature: 'YouTube Voiceovers', flashTts: 'Yes', competitor: 'Not designed for this', win: 'flash' }
    ]
  },
  pricingBreakdown: {
    heading: 'What You\'re Actually Paying For',
    subtext: "Switch to FlashTTS — purpose-built for creators who publish daily.",
    creators: [
      {
        type: 'Faceless YouTube Creator',
        needs: 'Studio voiceovers',
        competitorCost: 'Not designed for this',
        flashTtsCost: '$9/mo (Starter)',
        savings: 'Purpose-Built',
        savingsYearly: 'Commercial Rights Included'
      },
      {
        type: 'Podcast Creator',
        needs: 'Natural AI narration',
        competitorCost: 'Reading tool',
        flashTtsCost: '$19/mo (Creator)',
        savings: 'Right Tool',
        savingsYearly: '500k chars included'
      },
      {
        type: 'Agency (10+ clients)',
        needs: 'Scalable production',
        competitorCost: 'No bulk tools',
        flashTtsCost: '$39/mo (Pro)',
        savings: 'Built for Scale',
        savingsYearly: '1M chars included'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You publish content daily or weekly',
      'You need high-volume audio generation',
      'You want voice cloning without custom pricing',
      'You need direct studio-quality exports',
      'Budget matters to your business',
      'You produce for YouTube, Podcasts or Clients'
    ],
    competitor: [
      'You want books/articles read aloud',
      'You need PDF narration tools',
      'You have reading difficulties (Dyslexia)',
      'You need Chrome Extension for browsing',
      'Enterprise-level compliance is required'
    ]
  },
  warningSection: {
    title: 'A Note on Speechify Billing',
    text: 'Independent user reports across Reddit and BBB document unexpected auto-renewal charges from Speechify — including charges after confirmed cancellations. Always use a separate payment method when trialing and set calendar reminders before trial expiration.',
    source: 'Publicly available user reports'
  },
  faqs: [
    {
      q: 'Is Speechify good for content creators?',
      a: 'Speechify was primarily designed as a personal reading and productivity app — helping users listen to documents, articles, and books. While it has some voice generation features, it is not purpose-built for content creators who need studio-quality voiceovers, voice cloning, or high-volume audio production. FlashTTS is specifically designed for YouTubers, Podcasters, and Agencies who create audio content at scale.'
    },
    {
      q: 'Can Speechify clone your voice?',
      a: 'Speechify does not offer voice cloning as a standard feature for content creators. FlashTTS includes voice cloning on all paid plans starting from $9/month — allowing you to clone your voice in under 60 seconds and generate unlimited content with it.'
    },
    {
      q: 'Is FlashTTS cheaper than Speechify?',
      a: 'FlashTTS starts at $9/month vs Speechify\'s $11.58/month (annual) or $29/month (monthly). But more importantly, FlashTTS is built for content creation — giving you studio-quality voiceovers, voice cloning, and commercial rights. Speechify\'s pricing is for a reading app, not a production tool.'
    },
    {
      q: 'What is the best Speechify alternative for YouTubers?',
      a: 'For YouTubers who need high-quality AI voiceovers at scale, FlashTTS is the strongest alternative. It offers 200,000 characters per month for $9, includes voice cloning, supports 19 languages, and is purpose-built for creators who publish daily content.'
    },
    {
      q: 'Does FlashTTS work for audiobooks like Speechify?',
      a: 'Yes — FlashTTS has a dedicated Audiobook Studio that allows creators to generate long-form narration at scale. Unlike Speechify which reads existing content for personal listening, FlashTTS generates original studio-quality audio you can publish and sell commercially.'
    }
  ]
};
