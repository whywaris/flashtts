export interface Voice {
  id: string;
  name: string;
  lang: string;
  initials: string;
  style: string;
}

export interface Language {
  code: string;
  label: string;
  flag: string;
  text: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', flag: '🇺🇸', text: "In a world where every second counts, your voice is your greatest asset. Generate studio-quality audio in seconds — no waiting, no retakes, no expensive voice actors." },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦', text: "في عالم يتسارع فيه الزمن، صوتك هو أقوى أداة لديك. أنشئ تسجيلات صوتية احترافية في ثوانٍ — بلا انتظار، بلا إعادة تسجيل، بلا تكalif باهظة." },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', text: "एक ऐसी दुनिया में जहाँ हर पल मायने रखता है, आपकी आवाज़ आपकी सबसे बड़ी ताकत है। सेकंडों में स्टूडियो-क्वालिटी ऑडियो बनाएं — बिना इंतजार, बिना रीटेक।" },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', text: "En un mundo donde cada segundo importa, tu voz es tu mayor activo. Genera audio de calidad profesional en segundos — sin esperas, sin repeticiones, sin actores costosos." },
  { code: 'fr', label: 'French', flag: '🇫🇷', text: "Dans un monde où chaque seconde compte, votre voix est votre meilleur atout. Créez des voix professionnelles en quelques secondes — sans attente, sans prise multiple." },
  { code: 'de', label: 'German', flag: '🇩🇪', text: "In einer Welt, in der jede Sekunde zählt, ist deine Stimme dein stärkstes Werkzeug. Erstelle professionelle Audioaufnahmen in Sekunden — ohne Wartezeit, ohne Wiederholungen." },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵', text: "すべての瞬間が大切な世界で、あなたの声は最大の武器です。待ち時間なし、撮り直しなし — 数秒でスタジオ品質の音声を生成しましょう。" },
  { code: 'ko', label: 'Korean', flag: '🇰🇷', text: "매 순간이 중요한 세상에서, 당신의 목소리는 가장 강력한 도구입니다. 기다림 없이, 재녹음 없이 — 몇 초 만에 스튜디오 품질의 오디오를 만들어보세요." },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹', text: "Num mundo onde cada segundo importa, sua voz é o seu maior ativo. Gere áudio de qualidade profissional em segundos — sem esperas, sem regravações, sem custos elevados." },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷', text: "Her saniyenin önemli olduğu bir dünyada sesiniz en büyük varlığınızdır. Saniyeler içinde profesyonel kalitede ses oluşturun — bekleme yok, tekrar kayıt yok." },
  { code: 'it', label: 'Italian', flag: '🇮🇹', text: "In un mondo dove ogni secondo conta, la tua voce è il tuo patrimonio più grande. Genera audio di qualità professionale in pochi secondi — senza attese, senza ripetizioni." },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱', text: "In een wereld waar elke seconde telt, is jouw stem je grootste troef. Genereer professionele audiokwaliteit in seconden — geen wachttijd, geen herhalingen, geen dure stemacteurs." },
  { code: 'pl', label: 'Polish', flag: '🇵🇱', text: "W świecie, gdzie każda sekunda ma znaczenie, Twój głos jest Twoim największym atutem. Twórz profesjonalne nagrania w kilka sekund — bez czekania, bez powtórek." },
  { code: 'ru', label: 'Russian', flag: '🇷🇺', text: "В мире, где каждая секунда на счету, ваш голос — ваш главный инструмент. Создавайте профессиональные аудиозаписи за секунды — без ожидания и повторных записей." },
  { code: 'sv', label: 'Swedish', flag: '🇸🇪', text: "In en värld där varje sekund räknas är din röst ditt starkaste verktyg. Skapa professionellt ljud på sekunder — ingen väntetid, inga omtagningar, inga dyra röstskådespelare." },
  { code: 'no', label: 'Norwegian', flag: '🇳🇴', text: "I en verden der hvert sekund teller, er stemmen din ditt sterkeste verktøy. Lag profesjonell lydkvalitet på sekunder — ingen ventetid, ingen omtakinger." },
  { code: 'fi', label: 'Finnish', flag: '🇫🇮', text: "Maailmassa, jossa jokainen sekunti on tärkeä, äänesi on tärkein työkalusi. Luo ammattilaistason ääntä sekunneissa — ei odottelua, ei uusintoja, ei kalliita näyttelijöitä." },
  { code: 'da', label: 'Danish', flag: '🇩🇰', text: "I en verden, hvor hvert sekund tæller, er din stemme dit stærkeste redskab. Skab professionel lydkvalitet på få sekunder — ingen ventetid, ingen omtagninger, ingen dyre skuespillere." },
  { code: 'el', label: 'Greek', flag: '🇬🇷', text: "Σε έναν κόσμο όπου κάθε δευτερόλεπτο μετράει, η φωνή σας είναι το πιο ισχυρό εργαλείο σας. Δημιουργήστε επαγγελματικό ήχο σε δευτερόλεπτα — χωρίς αναμονή, χωρίς επανάληψη." },
  { code: 'ms', label: 'Malay', flag: '🇲🇾', text: "Dalam dunia di mana setiap saat penting, suara anda adalah aset terbesar anda. Jana audio berkualiti studio dalam beberapa saat — tanpa penantian, tanpa rakaman semula." },
];

export const DEMO_VOICES: Record<string, Voice[]> = {
  en: [
    { id: 'en-1', name: 'James', lang: 'en', initials: 'JM', style: 'Warm & Dramatic' },
    { id: 'en-2', name: 'Emma', lang: 'en', initials: 'EM', style: 'Calm & Gentle' },
    { id: 'en-3', name: 'Oliver', lang: 'en', initials: 'OL', style: 'Fast & Energetic' },
    { id: 'en-4', name: 'Sophia', lang: 'en', initials: 'SP', style: 'Professional & Crisp' },
    { id: 'en-5', name: 'Liam', lang: 'en', initials: 'LM', style: 'Deep & Authoritative' },
  ],
  ar: [
    { id: 'ar-1', name: 'Ahmed', lang: 'ar', initials: 'AH', style: 'Formal & News' },
    { id: 'ar-2', name: 'Fatima', lang: 'ar', initials: 'FT', style: 'Soft & Flowing' },
    { id: 'ar-3', name: 'Omar', lang: 'ar', initials: 'OM', style: 'Dramatic Narration' },
    { id: 'ar-4', name: 'Layla', lang: 'ar', initials: 'LY', style: 'Clear & Engaging' },
    { id: 'ar-5', name: 'Yousef', lang: 'ar', initials: 'YS', style: 'Deep & Resonant' },
  ],
  hi: [
    { id: 'hi-1', name: 'Aarav', lang: 'hi', initials: 'AR', style: 'Smooth & Friendly' },
    { id: 'hi-2', name: 'Ishani', lang: 'hi', initials: 'IS', style: 'Sweet & Warm' },
    { id: 'hi-3', name: 'Vihaan', lang: 'hi', initials: 'VH', style: 'Energetic Storyteller' },
    { id: 'hi-4', name: 'Ananya', lang: 'hi', initials: 'AN', style: 'Professional Anchor' },
    { id: 'hi-5', name: 'Kabir', lang: 'hi', initials: 'KB', style: 'Classic & Mature' },
  ],
  es: [
    { id: 'es-1', name: 'Mateo', lang: 'es', initials: 'MT', style: 'Passion & Fire' },
    { id: 'es-2', name: 'Lucia', lang: 'es', initials: 'LC', style: 'Bright & Cheerful' },
    { id: 'es-3', name: 'Diego', lang: 'es', initials: 'DG', style: 'Cool & Modern' },
    { id: 'es-4', name: 'Elena', lang: 'es', initials: 'EL', style: 'Corporate & Smooth' },
    { id: 'es-5', name: 'Carlos', lang: 'es', initials: 'CL', style: 'Old School Radio' },
  ],
  fr: [
    { id: 'fr-1', name: 'Lucas', lang: 'fr', initials: 'LU', style: 'Elegant & Soft' },
    { id: 'fr-2', name: 'Chloe', lang: 'fr', initials: 'CH', style: 'Chic & Expressive' },
    { id: 'fr-3', name: 'Antoine', lang: 'fr', initials: 'AN', style: 'Strong & Sharp' },
    { id: 'fr-4', name: 'Manon', lang: 'fr', initials: 'MN', style: 'Sweet & Melodic' },
    { id: 'fr-5', name: 'Pierre', lang: 'fr', initials: 'PR', style: 'Sophisticated' },
  ],
  de: [
    { id: 'de-1', name: 'Lukas', lang: 'de', initials: 'LK', style: 'Precise & Direct' },
    { id: 'de-2', name: 'Mia', lang: 'de', initials: 'MI', style: 'Friendly & Clear' },
    { id: 'de-3', name: 'Finn', lang: 'de', initials: 'FN', style: 'Young & Lively' },
    { id: 'de-4', name: 'Hannah', lang: 'de', initials: 'HN', style: 'Professional' },
    { id: 'de-5', name: 'Max', lang: 'de', initials: 'MX', style: 'Calm & Trustworthy' },
  ],
  ja: [
    { id: 'ja-1', name: 'Haruto', lang: 'ja', initials: 'HR', style: 'Heroic & Firm' },
    { id: 'ja-2', name: 'Akari', lang: 'ja', initials: 'AK', style: 'Soft & High Pitch' },
    { id: 'ja-3', name: 'Ren', lang: 'ja', initials: 'RN', style: 'Cool & Distant' },
    { id: 'ja-4', name: 'Yui', lang: 'ja', initials: 'YI', style: 'Emotional Anime' },
    { id: 'ja-5', name: 'Kenji', lang: 'ja', initials: 'KJ', style: 'Steady & Deep' },
  ],
  ko: [
    { id: 'ko-1', name: 'Min-jun', lang: 'ko', initials: 'MJ', style: 'Gentle K-Drama' },
    { id: 'ko-2', name: 'Seo-yeon', lang: 'ko', initials: 'SY', style: 'Polite & Clear' },
    { id: 'ko-3', name: 'Do-yun', lang: 'ko', initials: 'DY', style: 'Energetic Idol' },
    { id: 'ko-4', name: 'Ji-woo', lang: 'ko', initials: 'JW', style: 'Warm & Caring' },
    { id: 'ko-5', name: 'Hyun-woo', lang: 'ko', initials: 'HW', style: 'Low & Charismatic' },
  ],
  pt: [
    { id: 'pt-1', name: 'Joao', lang: 'pt', initials: 'JO', style: 'Rhythmic & Lively' },
    { id: 'pt-2', name: 'Beatriz', lang: 'pt', initials: 'BT', style: 'Soft & Seductive' },
    { id: 'pt-3', name: 'Miguel', lang: 'pt', initials: 'MG', style: 'Clear News Style' },
    { id: 'pt-4', name: 'Mariana', lang: 'pt', initials: 'MA', style: 'Friendly & Open' },
    { id: 'pt-5', name: 'Tiago', lang: 'pt', initials: 'TG', style: 'Strong Narrative' },
  ],
  tr: [
    { id: 'tr-1', name: 'Emre', lang: 'tr', initials: 'EM', style: 'Dynamic & Fast' },
    { id: 'tr-2', name: 'Zeynep', lang: 'tr', initials: 'ZN', style: 'Emotional & Deep' },
    { id: 'tr-3', name: 'Can', lang: 'tr', initials: 'CN', style: 'Youthful & Cool' },
    { id: 'tr-4', name: 'Elif', lang: 'tr', initials: 'EF', style: 'Bright & Professional' },
    { id: 'tr-5', name: 'Mert', lang: 'tr', initials: 'MR', style: 'Bold & Striking' },
  ],
  it: [
    { id: 'it-1', name: 'Leonardo', lang: 'it', initials: 'LE', style: 'Operatic & Grand' },
    { id: 'it-2', name: 'Giulia', lang: 'it', initials: 'GL', style: 'Soft & Elegant' },
    { id: 'it-3', name: 'Matteo', lang: 'it', initials: 'MT', style: 'Modern & Sharp' },
    { id: 'it-4', name: 'Sofia', lang: 'it', initials: 'SF', style: 'Classic Cinema' },
    { id: 'it-5', name: 'Alessandro', lang: 'it', initials: 'AL', style: 'Warm Storyteller' },
  ],
  nl: [
    { id: 'nl-1', name: 'Daan', lang: 'nl', initials: 'DA', style: 'Level-headed' },
    { id: 'nl-2', name: 'Emma', lang: 'nl', initials: 'EM', style: 'Bright & Clear' },
    { id: 'nl-3', name: 'Levi', lang: 'nl', initials: 'LV', style: 'Modern Business' },
    { id: 'nl-4', name: 'Sophie', lang: 'nl', initials: 'SO', style: 'Friendly Neighbor' },
    { id: 'nl-5', name: 'Bram', lang: 'nl', initials: 'BR', style: 'Calm & Direct' },
  ],
  pl: [
    { id: 'pl-1', name: 'Jakub', lang: 'pl', initials: 'JK', style: 'Firm & Steady' },
    { id: 'pl-2', name: 'Zuzanna', lang: 'pl', initials: 'ZU', style: 'Sweet & Poetic' },
    { id: 'pl-3', name: 'Filip', lang: 'pl', initials: 'FL', style: 'Energetic Radio' },
    { id: 'pl-4', name: 'Lena', lang: 'pl', initials: 'LN', style: 'Clear & Formal' },
    { id: 'pl-5', name: 'Antoni', lang: 'pl', initials: 'AN', style: 'Deep Narrative' },
  ],
  ru: [
    { id: 'ru-1', name: 'Ivan', lang: 'ru', initials: 'IV', style: 'Classic & Bold' },
    { id: 'ru-2', name: 'Anna', lang: 'ru', initials: 'AN', style: 'Velvety & Deep' },
    { id: 'ru-3', name: 'Dmitry', lang: 'ru', initials: 'DM', style: 'Fast & Precise' },
    { id: 'ru-4', name: 'Maria', lang: 'ru', initials: 'MR', style: 'Soft & Gentle' },
    { id: 'ru-5', name: 'Artyom', lang: 'ru', initials: 'AR', style: 'Professional News' },
  ],
  sv: [
    { id: 'sv-1', name: 'Hugo', lang: 'sv', initials: 'HG', style: 'Cool & Relaxed' },
    { id: 'sv-2', name: 'Alice', lang: 'sv', initials: 'AL', style: 'Bright Nordic' },
    { id: 'sv-3', name: 'Oscar', lang: 'sv', initials: 'OS', style: 'Steady Business' },
    { id: 'sv-4', name: 'Ebba', lang: 'sv', initials: 'EB', style: 'Warm & Kind' },
    { id: 'sv-5', name: 'Liam', lang: 'sv', initials: 'LM', style: 'Young & Hip' },
  ],
  no: [
    { id: 'no-1', name: 'Isak', lang: 'no', initials: 'IS', style: 'Fresh & Crisp' },
    { id: 'no-2', name: 'Nora', lang: 'no', initials: 'NR', style: 'Clear & Natural' },
    { id: 'no-3', name: 'Aksel', lang: 'no', initials: 'AK', style: 'Direct & Firm' },
    { id: 'no-4', name: 'Frida', lang: 'no', initials: 'FR', style: 'Bright & Happy' },
    { id: 'no-5', name: 'Emil', lang: 'no', initials: 'EM', style: 'Gentle Flow' },
  ],
  fi: [
    { id: 'fi-1', name: 'Onni', lang: 'fi', initials: 'ON', style: 'Steady & Deep' },
    { id: 'fi-2', name: 'Aino', lang: 'fi', initials: 'AI', style: 'Soft & Pure' },
    { id: 'fi-3', name: 'Elias', lang: 'fi', initials: 'EL', style: 'Clear & Modern' },
    { id: 'fi-4', name: 'Venla', lang: 'fi', initials: 'VN', style: 'Friendly & Fast' },
    { id: 'fi-5', name: 'Vaino', lang: 'fi', initials: 'VA', style: 'Professional' },
  ],
  da: [
    { id: 'da-1', name: 'Noah', lang: 'da', initials: 'NO', style: 'Hygge & Warm' },
    { id: 'da-2', name: 'Freja', lang: 'da', initials: 'FR', style: 'Clear & Cool' },
    { id: 'da-3', name: 'Victor', lang: 'da', initials: 'VI', style: 'Steady Anchor' },
    { id: 'da-4', name: 'Alma', lang: 'da', initials: 'AL', style: 'Soft Narration' },
    { id: 'da-5', name: 'Emil', lang: 'da', initials: 'EM', style: 'Direct & Precise' },
  ],
  el: [
    { id: 'el-1', name: 'Nikolas', lang: 'el', initials: 'NK', style: 'Grand & Formal' },
    { id: 'el-2', name: 'Eleni', lang: 'el', initials: 'EL', style: 'Sweet & Classic' },
    { id: 'el-3', name: 'Giorgos', lang: 'el', initials: 'GI', style: 'Strong Dramatic' },
    { id: 'el-4', name: 'Maria', lang: 'el', initials: 'MR', style: 'Clear & Modern' },
    { id: 'el-5', name: 'Dimitris', lang: 'el', initials: 'DM', style: 'Warm Business' },
  ],
  ms: [
    { id: 'ms-1', name: 'Adam', lang: 'ms', initials: 'AD', style: 'Smooth & Polite' },
    { id: 'ms-2', name: 'Nur', lang: 'ms', initials: 'NR', style: 'Soft & Friendly' },
    { id: 'ms-3', name: 'Irfan', lang: 'ms', initials: 'IR', style: 'Energetic News' },
    { id: 'ms-4', name: 'Siti', lang: 'ms', initials: 'SI', style: 'Sweet & Warm' },
    { id: 'ms-5', name: 'Hafiz', lang: 'ms', initials: 'HF', style: 'Professional' },
  ],
};
