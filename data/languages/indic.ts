export interface LanguageData {
  slug: string;
  name: string;
  nativeName: string;
  langCode: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  samplePlaceholder: string;
  defaultSampleText: string;
  voices: {
    name: string;
    gender: 'Male' | 'Female';
    tone: string;
    bestFor: string;
  }[];
  useCases: {
    title: string;
    description: string;
  }[];
  faqs: {
    q: string;
    a: string;
  }[];
}

export const INDIC_LANGUAGES: Record<string, LanguageData> = {
  hindi: {
    slug: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    langCode: 'hi',
    metaTitle: 'Hindi Text to Speech Online Free | AI Hindi Voice Generator | FlashTTS',
    metaDescription: 'Convert Hindi text to speech with ultra-realistic AI voiceover. Native Devanagari script support, multiple accents, and emotional voices for YouTube & Reels.',
    heroHeadline: 'AI Hindi Text to Speech with Studio-Quality Natural Voices',
    heroSubheadline: 'Paste your Hindi script in Devanagari or Hinglish. Generate broadcast-ready audio for YouTube Shorts, motivational channels, audiobooks, and news in seconds.',
    samplePlaceholder: 'यहाँ अपना हिंदी टेक्स्ट लिखें या पेस्ट करें...',
    defaultSampleText: 'नमस्ते! फ्लैश टीटीएस में आपका स्वागत है। अब आप अपने यूट्यूब वीडियो, पॉडकास्ट और कहानियों के लिए बिल्कुल प्राकृतिक हिंदी आवाजें बना सकते हैं।',
    voices: [
      { name: 'Aarav', gender: 'Male', tone: 'Deep & Authoritative', bestFor: 'Documentaries & News' },
      { name: 'Ananya', gender: 'Female', tone: 'Warm & Engaging', bestFor: 'Audiobooks & Kahaniyan' },
      { name: 'Kabir', gender: 'Male', tone: 'Energetic & Fast', bestFor: 'Faceless YouTube Shorts' },
      { name: 'Pooja', gender: 'Female', tone: 'Clear & Professional', bestFor: 'E-learning & Corporate' }
    ],
    useCases: [
      { title: 'Faceless YouTube & Shorts', description: 'Create viral Hindi reels and motivation channels without recording your own voice.' },
      { title: 'Hindi Kahaniyan & Audiobooks', description: 'Narrate dramatic stories and mythological series with emotional character inflections.' },
      { title: 'Devotional & Bhakti Audio', description: 'Calm, reverent voices ideal for daily shlokas, chalisa narration, and spiritual podcasts.' },
      { title: 'Educational & UPSC Lectures', description: 'Clear pronunciation of technical and formal Hindi vocabulary for students.' }
    ],
    faqs: [
      { q: 'Can I type Hindi in both Devanagari script and Hinglish?', a: 'Yes! FlashTTS natively parses both Devanagari Unicode script (हिंदी) and Latin Hinglish (Hindi) seamlessly.' },
      { q: 'Is the generated Hindi speech monetization-friendly on YouTube?', a: '100% yes. All audio generated on FlashTTS comes with royalty-free commercial rights. Your YouTube and Instagram channels will never receive copyright strikes.' },
      { q: 'How many Hindi voice avatars are available?', a: 'FlashTTS offers multiple distinct Indian Hindi accents, including deep male storytellers, high-energy reel narrators, and natural female presenters.' }
    ]
  },
  punjabi: {
    slug: 'punjabi',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ / پنجابی',
    langCode: 'pa',
    metaTitle: 'Punjabi Text to Speech AI Online | Natural Punjabi Voices | FlashTTS',
    metaDescription: 'Generate authentic Punjabi voiceovers online. Supports Gurmukhi script with natural pronunciation for Punjabi YouTube channels, poetry, and reels.',
    heroHeadline: 'Authentic Punjabi Text to Speech with Natural Dialects',
    heroSubheadline: 'Built specifically for Punjabi creators across India, Pakistan, and the global diaspora. Convert Gurmukhi text into clear, studio-grade narration.',
    samplePlaceholder: 'ਇੱਥੇ ਆਪਣਾ ਪੰਜਾਬੀ ਟੈਕਸਟ ਲਿਖੋ ਜਾਂ ਪੇਸਟ ਕਰੋ...',
    defaultSampleText: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਫਲੈਸ਼ ਟੀਟੀਐਸ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਆਪਣੀਆਂ ਵੀਡੀਓਜ਼ ਅਤੇ ਪੋਡਕਾਸਟਾਂ ਲਈ ਅਸਲੀ ਪੰਜਾਬੀ ਆਵਾਜ਼ਾਂ ਵਿੱਚ ਆਡੀਓ ਬਣਾਓ।',
    voices: [
      { name: 'Gurpreet', gender: 'Male', tone: 'Bold & Traditional', bestFor: 'History, Folk & Explainer' },
      { name: 'Harleen', gender: 'Female', tone: 'Gentle & Melodious', bestFor: 'Poetry, Stories & Podcasts' },
      { name: 'Maninder', gender: 'Male', tone: 'Youthful & Dynamic', bestFor: 'Shorts & Social Reels' }
    ],
    useCases: [
      { title: 'Punjabi YouTube Channels', description: 'Publish daily history, culture, and commentary videos in authentic accents.' },
      { title: 'Kavita & Story Narration', description: 'Capture the rhythmic cadence and emotional depth required for Punjabi literature.' },
      { title: 'Business Advertisements', description: 'Reach Punjabi-speaking consumers in Canada, the UK, and Punjab with hyper-local ads.' }
    ],
    faqs: [
      { q: 'Does FlashTTS support Gurmukhi script?', a: 'Yes! You can paste direct Gurmukhi characters (ਪੰਜਾਬੀ) and our neural engine renders accurate tone and pronunciation.' },
      { q: 'Can I use this for Canadian Punjabi YouTube channels?', a: 'Absolutely. The accents are specifically tuned to sound native to both Majha/Doaba dialects and diaspora audiences.' }
    ]
  },
  marathi: {
    slug: 'marathi',
    name: 'Marathi',
    nativeName: 'मराठी',
    langCode: 'mr',
    metaTitle: 'Marathi Text to Speech AI Online | Realistic Marathi Voices | FlashTTS',
    metaDescription: 'Convert Marathi text into natural human speech. Studio-quality voices for Maharashtra creators, audiobooks, and YouTube explainer channels.',
    heroHeadline: 'Studio-Grade Marathi Text to Speech Engine',
    heroSubheadline: 'Bring your Marathi scripts to life. High-fidelity audio synthesis tailored for regional creators, education, and social media.',
    samplePlaceholder: 'येथे तुमचा मराठी मजकूर लिहा किंवा पेस्ट करा...',
    defaultSampleText: 'नमस्कार! फ्लॅश टीटीएस मध्ये आपले स्वागत आहे. आता आपल्या मराठी यूट्यूब व्हिडिओ आणि ऑडिओबुकसाठी उत्कृष्ट आवाज मिळवा.',
    voices: [
      { name: 'Rohan', gender: 'Male', tone: 'Deep & Inspiring', bestFor: 'Historical & Biographies' },
      { name: 'Sayali', gender: 'Female', tone: 'Clear & Expressive', bestFor: 'Audiobooks & News' }
    ],
    useCases: [
      { title: 'Historical & Chhatrapati Shivaji Maharaj Series', description: 'Authoritative, resonant narration for history and culture channels.' },
      { title: 'Marathi News & Current Affairs', description: 'Rapid script-to-audio workflows for daily bulletin publishers.' }
    ],
    faqs: [
      { q: 'Does it support pure Marathi vocabulary (शुद्ध मराठी)?', a: 'Yes, our model is trained on rich Marathi literature, ensuring flawless pronunciation of nasal sounds (अनुस्वार) and conjuncts (जोडाक्षरे).' }
    ]
  },
  gujarati: {
    slug: 'gujarati',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    langCode: 'gu',
    metaTitle: 'Gujarati Text to Speech AI Online | Gujarati Voice Generator | FlashTTS',
    metaDescription: 'Create realistic Gujarati audio from text. Natural accents for business explainers, YouTube Shorts, and regional audiobook narration.',
    heroHeadline: 'Realistic Gujarati Text to Speech for Creators & Business',
    heroSubheadline: 'Transform Gujarati manuscripts into clear audio. Instant MP3 download with commercial rights.',
    samplePlaceholder: 'અહીં તમારું ગુજરાતી લખાણ લખો અથવા પેસ્ટ કરો...',
    defaultSampleText: 'નમસ્તે! ફ્લેશ ટીટીએસમાં આપનું સ્વાગત છે. વ્યવસાયિક વિડિઓઝ અને પોડકાસ્ટ માટે શ્રેષ્ઠ ગુજરાતી અવાજ બનાવો.',
    voices: [
      { name: 'Kavya', gender: 'Female', tone: 'Sweet & Professional', bestFor: 'Commercials & Learning' },
      { name: 'Darshan', gender: 'Male', tone: 'Confident & Crisp', bestFor: 'Business & Documentaries' }
    ],
    useCases: [
      { title: 'Business & Finance Videos', description: 'Perfect for trading, commerce, and entrepreneurship channels in Gujarat.' },
      { title: 'Religious & Bhajan Channels', description: 'Soothing voice delivery for devotional content.' }
    ],
    faqs: [
      { q: 'Can I export Gujarati audio in MP3 format?', a: 'Yes, you can export high-quality 320kbps MP3 files with a single click.' }
    ]
  },
  kannada: {
    slug: 'kannada',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    langCode: 'kn',
    metaTitle: 'Kannada Text to Speech AI Online | Realistic Kannada Voices | FlashTTS',
    metaDescription: 'Convert Kannada text into natural human speech. Flawless Kannada accents for YouTube, e-learning, and podcast narration.',
    heroHeadline: 'Natural Kannada Text to Speech for Modern Creators',
    heroSubheadline: 'High-speed voice synthesis for Kannada language content. Zero robotic monotone.',
    samplePlaceholder: 'ಇಲ್ಲಿ ನಿಮ್ಮ ಕನ್ನಡ ಪಠ್ಯವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
    defaultSampleText: 'ನಮಸ್ಕಾರ! ಫ್ಲ್ಯಾಶ್ ಟಿಟಿಎಸ್ ಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಯೂಟ್ಯೂಬ್ ವೀಡಿಯೊಗಳು ಮತ್ತು ಪಾಡ್ಕಾಸ್ಟ್ಗಳಿಗಾಗಿ ನೈಸರ್ಗಿಕ ಧ್ವನಿಯನ್ನು ರಚಿಸಿ.',
    voices: [
      { name: 'Suresh', gender: 'Male', tone: 'Authoritative & Resonant', bestFor: 'Narration & Explainer' },
      { name: 'Deepa', gender: 'Female', tone: 'Warm & Eloquent', bestFor: 'Stories & Commercials' }
    ],
    useCases: [
      { title: 'Kannada Tech & Fact Channels', description: 'Fast script-to-audio creation for daily YouTube creators.' },
      { title: 'Children Stories & Audiobooks', description: 'Expressive intonation for regional literature.' }
    ],
    faqs: [
      { q: 'Is Kannada Unicode text supported?', a: 'Yes, full Kannada Unicode script is parsed with accurate phoneme mapping.' }
    ]
  },
  malayalam: {
    slug: 'malayalam',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    langCode: 'ml',
    metaTitle: 'Malayalam Text to Speech AI Online | Malayalam Voice Generator | FlashTTS',
    metaDescription: 'Convert Malayalam text to speech online. Natural Malayalam voices for YouTube, news, educational content, and podcasts on FlashTTS.',
    heroHeadline: 'Ultra-Natural Malayalam Text to Speech Voiceover',
    heroSubheadline: 'Say goodbye to robotic Malayalam synthesizers. FlashTTS captures nuanced chillu letters and long vowels perfectly.',
    samplePlaceholder: 'ഇവിടെ നിങ്ങളുടെ മലയാളം വാചകം നൽകുക...',
    defaultSampleText: 'നമസ്കാരം! ഫ്ലാഷ് ടിടിഎസിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ സോഷ്യൽ മീഡിയ വീഡിയോകൾക്കായി മികച്ച മലയാളം ശബ്ദം സൃഷ്ടിക്കൂ.',
    voices: [
      { name: 'Rahul', gender: 'Male', tone: 'Crisp & Informative', bestFor: 'News & Tech Reviews' },
      { name: 'Meera', gender: 'Female', tone: 'Warm & Storyteller', bestFor: 'Audiobooks & Shorts' }
    ],
    useCases: [
      { title: 'Kerala YouTube & Cinema Reviews', description: 'Natural speaking rhythm for movie reviews and commentary channels.' },
      { title: 'Malayalam Audiobooks & Stories', description: 'Nuanced pronunciation for regional short stories and novels.' }
    ],
    faqs: [
      { q: 'Does it handle Malayalam complex ligatures (കൂട്ടക്ഷരങ്ങൾ)?', a: 'Yes, our model accurately pronounces complex Malayalam conjuncts and chillu characters without stuttering.' }
    ]
  }
};

