// Landing-page content for /text-to-speech/<language>. Product facts (limits, plans, formats) are added by
// the page from lib/plans.ts; this file holds only language-specific copy. No quality guarantees.
export interface LanguageData {
  slug: string;
  name: string;
  nativeName: string;
  langCode: string;
  script: string; // writing system to paste
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  samplePlaceholder: string;
  defaultSampleText: string;
  useCases: { title: string; description: string }[];
  tips: string[];
  faqs: { q: string; a: string }[];
}

export const INDIC_LANGUAGES: Record<string, LanguageData> = {
  hindi: {
    slug: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    langCode: 'hi',
    script: 'Devanagari',
    metaTitle: 'Hindi Text to Speech Online | AI Hindi Voice Generator',
    metaDescription: 'Turn Hindi scripts in Devanagari into AI voiceovers for YouTube, Reels, stories and lessons. Download MP3 or WAV. Start free with 10,000 characters a month.',
    heroHeadline: 'Hindi Text to Speech for YouTube, Reels and Stories',
    heroSubheadline: 'Paste your Hindi script in Devanagari, choose a voice or clone your own, and download the voiceover as MP3 or WAV.',
    samplePlaceholder: 'यहाँ अपना हिंदी टेक्स्ट लिखें या पेस्ट करें...',
    defaultSampleText: 'नमस्ते! आज हम जानेंगे कि रोज़ एक छोटा वीडियो बनाने की आदत कैसे डालें।',
    useCases: [
      { title: 'Faceless YouTube & Shorts', description: 'Narrate explainers, motivation and fact videos without recording your own voice.' },
      { title: 'Kahaniyan & audiobooks', description: 'Read stories and serialised fiction chapter by chapter in a consistent voice.' },
      { title: 'Education & exam prep', description: 'Turn lesson notes into listening material students can replay.' },
      { title: 'Devotional & spiritual audio', description: 'Narrate daily readings and explanations for podcasts and channels.' },
    ],
    tips: [
      'Write in Devanagari for the most predictable pronunciation. Hinglish in Roman letters can be read with English sounds, so test one line first.',
      'Use the purna viram (।) or a full stop to end sentences, and commas where you want a breath.',
      'Write numbers the way you want them spoken (for example "पच्चीस" instead of 25) if the default reading is wrong.',
      'Spell English brand names in Devanagari when you want Hindi pronunciation.',
    ],
    faqs: [
      { q: 'Can I write Hindi in Devanagari and Hinglish?', a: 'Devanagari is the safest input. Hinglish written in Roman letters may be read with English pronunciation, so generate a short test line before a full script.' },
      { q: 'Can I mix English words into a Hindi script?', a: 'Yes. Mixed scripts are common in Hindi videos; write English words in Devanagari if you want them pronounced the Hindi way.' },
    ],
  },
  punjabi: {
    slug: 'punjabi',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    langCode: 'pa',
    script: 'Gurmukhi',
    metaTitle: 'Punjabi Text to Speech Online | AI Punjabi Voice Generator',
    metaDescription: 'Turn Punjabi scripts in Gurmukhi into AI voiceovers for YouTube, Reels, poetry and ads. Download MP3 or WAV. Start free with 10,000 characters a month.',
    heroHeadline: 'Punjabi Text to Speech for Creators',
    heroSubheadline: 'Paste your Punjabi script in Gurmukhi, choose a voice or clone your own, and download the voiceover as MP3 or WAV.',
    samplePlaceholder: 'ਇੱਥੇ ਆਪਣਾ ਪੰਜਾਬੀ ਟੈਕਸਟ ਲਿਖੋ ਜਾਂ ਪੇਸਟ ਕਰੋ...',
    defaultSampleText: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਅਸੀਂ ਪੰਜਾਬ ਦੇ ਇਤਿਹਾਸ ਦੀ ਇੱਕ ਛੋਟੀ ਕਹਾਣੀ ਸੁਣਾਂਗੇ।',
    useCases: [
      { title: 'Punjabi YouTube channels', description: 'History, culture and commentary videos narrated from your script.' },
      { title: 'Poetry & story narration', description: 'Read kavita and short stories aloud for audio posts and podcasts.' },
      { title: 'Local business ads', description: 'Short promos for shops and services aimed at Punjabi-speaking customers.' },
      { title: 'Diaspora content', description: 'Videos for Punjabi audiences in Canada, the UK and elsewhere.' },
    ],
    tips: [
      'Paste text in Gurmukhi. Romanised Punjabi may be read with English pronunciation, so test a line first.',
      'Use the danda (।) or a full stop to end sentences, and commas for short pauses.',
      'Write numbers and dates in words when you want a specific reading.',
      'For poetry, put each line on its own line or end it with a comma to keep the rhythm.',
    ],
    faqs: [
      { q: 'Which script should I use for Punjabi?', a: 'Use Gurmukhi. If your text is in Shahmukhi or Roman letters, generate a short test line first and listen before producing a full script.' },
      { q: 'Can I use it for Punjabi poetry?', a: 'Yes. Line breaks and punctuation control the pauses, so format the poem the way you want it read.' },
    ],
  },
  marathi: {
    slug: 'marathi',
    name: 'Marathi',
    nativeName: 'मराठी',
    langCode: 'mr',
    script: 'Devanagari',
    metaTitle: 'Marathi Text to Speech Online | AI Marathi Voice Generator',
    metaDescription: 'Turn Marathi scripts in Devanagari into AI voiceovers for YouTube, news, lessons and audiobooks. Download MP3 or WAV. Start free with 10,000 characters a month.',
    heroHeadline: 'Marathi Text to Speech for Creators',
    heroSubheadline: 'Paste your Marathi script in Devanagari, choose a voice or clone your own, and download the voiceover as MP3 or WAV.',
    samplePlaceholder: 'येथे तुमचा मराठी मजकूर लिहा किंवा पेस्ट करा...',
    defaultSampleText: 'नमस्कार! आज आपण महाराष्ट्रातील एका किल्ल्याचा छोटा इतिहास ऐकणार आहोत.',
    useCases: [
      { title: 'History & culture channels', description: 'Narrated documentaries and explainers about Maharashtra and beyond.' },
      { title: 'News & current affairs', description: 'Turn daily bulletins into audio quickly from a written script.' },
      { title: 'Education', description: 'Lesson narration and revision audio for Marathi-medium students.' },
      { title: 'Audiobooks & stories', description: 'Chapter-by-chapter narration with the Audiobook Studio.' },
    ],
    tips: [
      'Paste text in Devanagari for the most predictable pronunciation.',
      'Use full stops and commas to control pauses; split long sentences.',
      'Write numbers and abbreviations in words when the default reading is wrong.',
      'Test place names and personal names on a short line before generating a whole script.',
    ],
    faqs: [
      { q: 'Does it read Marathi conjuncts (जोडाक्षरे) correctly?', a: 'Test the words that matter to you on a short line. If a word sounds wrong, try an alternative spelling or rephrase it, then regenerate just that line.' },
      { q: 'Can I narrate a Marathi audiobook?', a: 'Yes. Paste the manuscript into the Audiobook Studio, which splits it into chapters you can generate one by one.' },
    ],
  },
  gujarati: {
    slug: 'gujarati',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    langCode: 'gu',
    script: 'Gujarati',
    metaTitle: 'Gujarati Text to Speech Online | AI Gujarati Voice Generator',
    metaDescription: 'Turn Gujarati scripts into AI voiceovers for business videos, Shorts, devotional audio and stories. Download MP3 or WAV. Start free with 10,000 characters a month.',
    heroHeadline: 'Gujarati Text to Speech for Creators and Businesses',
    heroSubheadline: 'Paste your Gujarati script, choose a voice or clone your own, and download the voiceover as MP3 or WAV.',
    samplePlaceholder: 'અહીં તમારું ગુજરાતી લખાણ લખો અથવા પેસ્ટ કરો...',
    defaultSampleText: 'નમસ્તે! આજે આપણે નાના વ્યવસાય માટે ત્રણ સરળ માર્કેટિંગ ટીપ્સ જોઈશું.',
    useCases: [
      { title: 'Business & finance videos', description: 'Explainers for trading, commerce and small-business channels.' },
      { title: 'Product promos', description: 'Short voiceovers for shop and service ads aimed at Gujarati speakers.' },
      { title: 'Devotional audio', description: 'Narrate readings and explanations for bhajan and spiritual channels.' },
      { title: 'Stories for children', description: 'Read short stories aloud for audio posts and videos.' },
    ],
    tips: [
      'Paste text in Gujarati script for the most predictable pronunciation.',
      'End sentences with a full stop and use commas for pauses.',
      'Write prices and numbers in words when you want a specific reading.',
      'Spell English product names in Gujarati when you want local pronunciation.',
    ],
    faqs: [
      { q: 'Can I export Gujarati audio as MP3?', a: 'Yes. Every plan can download MP3 or WAV.' },
      { q: 'Can I use Gujarati voiceovers in ads?', a: 'Yes, on any paid plan, which includes commercial rights. Free-plan audio is for personal use.' },
    ],
  },
  kannada: {
    slug: 'kannada',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    langCode: 'kn',
    script: 'Kannada',
    metaTitle: 'Kannada Text to Speech Online | AI Kannada Voice Generator',
    metaDescription: 'Turn Kannada scripts into AI voiceovers for YouTube, e-learning, stories and podcasts. Download MP3 or WAV. Start free with 10,000 characters a month.',
    heroHeadline: 'Kannada Text to Speech for Creators',
    heroSubheadline: 'Paste your Kannada script, choose a voice or clone your own, and download the voiceover as MP3 or WAV.',
    samplePlaceholder: 'ಇಲ್ಲಿ ನಿಮ್ಮ ಕನ್ನಡ ಪಠ್ಯವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
    defaultSampleText: 'ನಮಸ್ಕಾರ! ಇಂದು ನಾವು ತಂತ್ರಜ್ಞಾನದ ಬಗ್ಗೆ ಒಂದು ಸಣ್ಣ ವಿಷಯವನ್ನು ತಿಳಿಯೋಣ.',
    useCases: [
      { title: 'Tech & fact channels', description: 'Narrate explainers and list videos from a written script.' },
      { title: 'E-learning', description: 'Lesson narration and revision audio for Kannada-medium learners.' },
      { title: 'Children’s stories', description: 'Read short stories aloud for audio posts and videos.' },
      { title: 'Podcasts', description: 'Intros, segments and episode summaries in a consistent voice.' },
    ],
    tips: [
      'Paste text in Kannada script; romanised Kannada may be read with English pronunciation.',
      'Use full stops and commas to set pauses, and keep sentences short.',
      'Write numbers and dates in words when you want a specific reading.',
      'Test names and technical terms on a short line before generating a whole script.',
    ],
    faqs: [
      { q: 'Is Kannada Unicode text supported?', a: 'Yes. Paste Kannada Unicode text directly into the studio.' },
      { q: 'Can I narrate a full Kannada lesson?', a: 'Yes. Split long lessons at natural breaks so each part fits your plan’s per-generation limit, then join the files in your editor.' },
    ],
  },
  malayalam: {
    slug: 'malayalam',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    langCode: 'ml',
    script: 'Malayalam',
    metaTitle: 'Malayalam Text to Speech Online | AI Malayalam Voice Generator',
    metaDescription: 'Turn Malayalam scripts into AI voiceovers for YouTube, reviews, lessons and stories. Download MP3 or WAV. Start free with 10,000 characters a month.',
    heroHeadline: 'Malayalam Text to Speech for Creators',
    heroSubheadline: 'Paste your Malayalam script, choose a voice or clone your own, and download the voiceover as MP3 or WAV.',
    samplePlaceholder: 'ഇവിടെ നിങ്ങളുടെ മലയാളം വാചകം നൽകുക...',
    defaultSampleText: 'നമസ്കാരം! ഇന്ന് നമുക്ക് ഒരു പുതിയ സിനിമയുടെ ചെറിയ അവലോകനം കേൾക്കാം.',
    useCases: [
      { title: 'Film & review channels', description: 'Narrate movie reviews and commentary from your script.' },
      { title: 'News & explainers', description: 'Turn written bulletins and explainers into audio.' },
      { title: 'Education', description: 'Lesson narration and revision audio for Malayalam-medium learners.' },
      { title: 'Stories & audiobooks', description: 'Chapter-by-chapter narration with the Audiobook Studio.' },
    ],
    tips: [
      'Paste text in Malayalam script; Manglish in Roman letters may be read with English pronunciation.',
      'Use full stops and commas to control pauses; split very long sentences.',
      'Write numbers and dates in words when you want a specific reading.',
      'Test words with chillu letters and complex conjuncts on a short line before the full script.',
    ],
    faqs: [
      { q: 'How do I check pronunciation of difficult words?', a: 'Generate a short test line with the words that matter, listen, and adjust the spelling or wording if needed before producing the full script.' },
      { q: 'Can I use Manglish?', a: 'Malayalam script is the safest input. Manglish in Roman letters may be read with English pronunciation, so test a line first.' },
    ],
  },
};
