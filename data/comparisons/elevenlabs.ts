export interface ComparisonData {
  competitorName: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  hero: {
    badge: string;
    title: string;
    subheadline: string;
  };
  verdictCards: {
    icon: 'lightning' | 'dollar' | 'microphone' | 'shield' | 'infinity' | 'waveform';
    title: string;
    text: string;
    badge: string;
    badgeColor: 'green' | 'gray';
  }[];
  table: {
    rows: {
      feature: string;
      flashTts: string;
      competitor: string;
      win?: 'flash' | 'tie' | 'competitor';
    }[];
  };
  pricingBreakdown: {
    heading: string;
    subtext: string;
    creators: {
      type: string;
      needs: string;
      competitorCost: string;
      flashTtsCost: string;
      savings: string;
      savingsYearly: string;
    }[];
  };
  whyChoose: {
    flashTts: string[];
    competitor: string[];
  };
  faqs: {
    q: string;
    a: string;
  }[];
  problemSection?: {
    title: string;
    subtext: string;
    cards: {
      icon: 'clock-x' | 'warning' | 'calculator' | 'stop' | 'bell-off' | 'check-circle';
      title: string;
      text: string;
    }[];
  };
  differenceBanner?: {
    left: { label: string; icon: 'book' | 'headphones'; title: string; text: string; tag: string; };
    right: { label: string; icon: 'mic' | 'waveform'; title: string; text: string; tag: string; };
  };
  warningSection?: {
    title: string;
    text: string;
    source: string;
    quote?: string;
    quoteSource?: string;
    note?: string;
    mathCard?: {
      title: string;
      competitorLabel: string;
      flashTtsLabel: string;
    };
    comparisonCallout?: {
      leftLabel: string;
      leftText: string;
      rightLabel: string;
      rightText: string;
    };
  };
}

export const elevenLabsData: ComparisonData = {
  competitorName: 'ElevenLabs',
  slug: 'elevenlabs',
  metaTitle: 'FlashTTS vs ElevenLabs: 6x More Credits at Half the Price',
  metaDescription: 'Comparing FlashTTS vs ElevenLabs? FlashTTS gives creators 6x more voice credits at half the price. Same studio quality — smarter pricing. See the full breakdown.',
  hero: {
    badge: 'HONEST COMPARISON',
    title: 'FlashTTS vs ElevenLabs: More Credits, Half the Price',
    subheadline: "ElevenLabs is great. But if you're a creator who publishes daily, you'll run out of credits every single month. FlashTTS gives you 6x more — without the premium price tag."
  },
  verdictCards: [
    {
      icon: 'lightning',
      title: '6x More Credits',
      text: '200k credits for $9 vs 30k for $6. More content, less top-ups.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'dollar',
      title: 'Up to 76% Cheaper',
      text: 'Pro plan: $39 vs $99. Same quality, fraction of the cost.',
      badge: 'FlashTTS Wins',
      badgeColor: 'green'
    },
    {
      icon: 'microphone',
      title: 'Same Studio Quality',
      text: 'Both platforms deliver professional-grade AI voices.',
      badge: 'Tie',
      badgeColor: 'gray'
    }
  ],
  table: {
    rows: [
      { feature: 'Free Plan', flashTts: '10,000 chars', competitor: '10,000 chars', win: 'tie' },
      { feature: 'Starter Plan', flashTts: '200k / $9', competitor: '30k / $6', win: 'flash' },
      { feature: 'Creator Plan', flashTts: '500k / $19', competitor: '100k / $22', win: 'flash' },
      { feature: 'Pro Plan', flashTts: '1M / $39', competitor: '500k / $99', win: 'flash' },
      { feature: 'Studio/Scale Plan', flashTts: '3M / $79', competitor: '2M / $330', win: 'flash' },
      { feature: 'Voice Cloning', flashTts: 'Included', competitor: 'Paid add-on', win: 'flash' },
      { feature: 'Languages', flashTts: '19 languages', competitor: '29 languages', win: 'tie' },
      { feature: 'Commercial Rights', flashTts: 'All paid plans', competitor: 'All paid plans', win: 'tie' },
      { feature: 'API Access', flashTts: 'Studio plan', competitor: 'Creator+', win: 'tie' },
      { feature: 'Voice Library', flashTts: '1,000+ voices', competitor: '3,000+ voices', win: 'tie' },
      { feature: 'Watermark Free', flashTts: 'All paid plans', competitor: 'All paid plans', win: 'tie' },
      { feature: 'Generation Speed', flashTts: 'Fast', competitor: 'Fast', win: 'tie' },
      { feature: 'Mobile Friendly', flashTts: 'Yes', competitor: 'Yes', win: 'tie' }
    ]
  },
  pricingBreakdown: {
    heading: 'The Real Cost of Running Out of Credits',
    subtext: "ElevenLabs creators spend 3x more every month just to keep publishing. Here's the math.",
    creators: [
      {
        type: 'Daily YouTube Creator',
        needs: '~600k chars/month',
        competitorCost: '$99/mo (Pro)',
        flashTtsCost: '$19/mo (Creator)',
        savings: '$80/mo',
        savingsYearly: '$960/year'
      },
      {
        type: 'Faceless Channel Owner (3 channels)',
        needs: '~1.5M chars/month',
        competitorCost: '$330/mo (Scale)',
        flashTtsCost: '$39/mo (Pro)',
        savings: '$291/mo',
        savingsYearly: '$3,492/year'
      },
      {
        type: 'Podcast + Shorts Creator',
        needs: '~300k chars/month',
        competitorCost: '$22/mo (Creator)',
        flashTtsCost: '$9/mo (Starter)',
        savings: '$13/mo',
        savingsYearly: '$156/year'
      }
    ]
  },
  whyChoose: {
    flashTts: [
      'You publish content daily or weekly',
      'You need high-volume audio generation',
      'Budget matters to your business',
      'You want more credits for less money',
      'You\'re a YouTuber, Podcaster or Agency',
      'You want voice cloning included'
    ],
    competitor: [
      'You need 29+ language support',
      'You need the largest voice library',
      'Enterprise-level API is your priority',
      'You only generate audio occasionally'
    ]
  },
  faqs: [
    {
      q: 'Is FlashTTS cheaper than ElevenLabs?',
      a: 'Yes — significantly. At the Creator plan level, FlashTTS costs $19/mo vs ElevenLabs $22/mo, but gives you 5x more characters (500k vs 100k). At Pro level, FlashTTS is $39 vs ElevenLabs $99 — with double the credits.'
    },
    {
      q: 'Does FlashTTS have the same voice quality as ElevenLabs?',
      a: 'FlashTTS uses state-of-the-art neural TTS models that deliver studio-grade, natural-sounding audio across 19 languages. While ElevenLabs has a larger voice library, FlashTTS voices are indistinguishable from professional recordings for most content creation use cases.'
    },
    {
      q: 'Can I clone my voice on FlashTTS like ElevenLabs?',
      a: 'Yes. Voice cloning is included on all paid FlashTTS plans. You can clone your voice in under 60 seconds with a short audio sample. ElevenLabs includes voice cloning from their Creator plan onwards as well.'
    },
    {
      q: 'What happens when I run out of credits on ElevenLabs?',
      a: 'On ElevenLabs, you either upgrade to a higher plan or purchase additional credits at a premium rate. FlashTTS gives you significantly more credits per dollar, reducing the chance of running out mid-month — especially important for daily content creators.'
    },
    {
      q: 'Is there a free trial on FlashTTS?',
      a: 'Yes. FlashTTS offers a free tier with 10,000 characters — no credit card required. You can test voices, generate audio, and explore the platform before committing to any paid plan.'
    }
  ]
};
