import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScriptBox from '@/components/marketing/ScriptBox';
import FaqList, { faqSchema, type Faq } from '@/components/marketing/FaqList';
import PlanLimitsTable from '@/components/marketing/PlanLimitsTable';
import RelatedLinks, { COMPARISON_LINKS, PRODUCT_LINKS } from '@/components/marketing/RelatedLinks';
import { ALL_LANGUAGES, LANGUAGE_COUNT_LABEL, CLONE_SAMPLE_SECONDS } from '@/lib/siteStats';
import { PLANS } from '@/lib/plans';

const URL = 'https://www.flashtts.com/text-to-speech';
const FREE = PLANS.find((p) => p.isFree)!;
const PAID = PLANS.filter((p) => !p.isFree);

export const metadata: Metadata = {
  title: `Text to Speech Online: AI Voiceovers in ${LANGUAGE_COUNT_LABEL}`,
  description: `Turn scripts into AI voiceovers in ${LANGUAGE_COUNT_LABEL}. Download MP3 or WAV, clone your own voice, and start free with 10,000 characters a month.`,
  alternates: { canonical: URL },
  openGraph: { title: 'Text to Speech Online | FlashTTS', url: URL, type: 'website', images: ['/og-image.png'] },
};

const STEPS = [
  { t: 'Paste your script', d: `Type or paste text into the studio. Each generation can be up to ${FREE.charsPerGen} characters on Free and up to ${PAID[PAID.length - 1].charsPerGen} on Studio.` },
  { t: 'Choose a voice', d: `Pick a voice from the library or use your own cloned voice (a ${CLONE_SAMPLE_SECONDS}-second sample is enough to start).` },
  { t: 'Generate and download', d: 'Listen in the browser, regenerate any line you want to change, then download the audio as MP3 or WAV.' },
];

const USE_CASES = [
  { t: 'YouTube & faceless channels', d: 'Narrate explainers, list videos and documentaries without recording your own voice.' },
  { t: 'Shorts, Reels & TikTok', d: 'Short scripts fit in a single generation, so you can test several takes quickly.' },
  { t: 'Podcasts & intros', d: 'Generate intros, ad reads and segment voiceovers in a consistent voice.' },
  { t: 'Audiobooks', d: 'Use the Audiobook Studio to split a manuscript into chapters and narrate each one.' },
  { t: 'E-learning & training', d: 'Turn lesson scripts into narration and update a single slide without re-recording.' },
  { t: 'Multilingual versions', d: `Produce the same video in more than one of our ${LANGUAGE_COUNT_LABEL}.` },
];

const FEATURES = [
  { t: 'Voice library', d: `Free accounts get a basic set of voices; paid plans unlock the full library.` },
  { t: 'Voice cloning on every plan', d: `${PLANS.map((p) => `${p.name}: ${p.voiceClones}`).join(' · ')} clones.` },
  { t: 'Emotion and delivery controls', d: 'Adjust expressiveness and variation in the studio to change how a line is read.' },
  { t: 'MP3 and WAV export', d: 'Download compressed MP3 for uploads or WAV for editing.' },
  { t: 'Generation history', d: `${PLANS.map((p) => `${p.name}: ${p.history.replace(' history', '')}`).join(' · ')}.` },
  { t: 'Commercial rights on paid plans', d: 'Use audio from any paid plan on YouTube, podcasts, ads and client work. Free-plan audio is for personal use.' },
];

const TIPS = [
  'Use punctuation to control pacing: commas for short pauses, full stops for longer ones, and paragraph breaks between ideas.',
  'Write numbers, dates and abbreviations the way you want them spoken ("twenty twenty-six", "doctor") when the default reading is wrong.',
  'Keep sentences short. Long sentences with several clauses are harder to follow when heard.',
  'Split long scripts at natural breaks so each part fits your plan’s per-generation limit, then join the files in your editor.',
  'Test one paragraph with two or three voices before generating a whole video.',
  'Listen to the final audio once before publishing and regenerate any word that sounds off.',
];

const FAQS: Faq[] = [
  { q: 'Is FlashTTS text to speech free?', a: `Yes. The Free plan includes ${FREE.chars} characters a month and 1 voice clone, with no credit card. Free-plan audio is for personal use; paid plans from $${PAID[0].priceMonthly}/month add commercial rights.` },
  { q: 'How many languages are supported?', a: `FlashTTS supports ${LANGUAGE_COUNT_LABEL}: ${ALL_LANGUAGES.map((l) => l.label).join(', ')}.` },
  { q: 'What audio formats can I download?', a: 'MP3 and WAV on every plan.' },
  { q: 'How long can one generation be?', a: `${PLANS.map((p) => `${p.name}: ${p.charsPerGen}`).join(', ')} characters per generation. Longer scripts can be split into parts.` },
  { q: 'How many characters do I get each month?', a: `${PLANS.map((p) => `${p.name}: ${p.chars}`).join(', ')}. The allowance resets each billing cycle.` },
  { q: 'Can I use the audio on YouTube and in ads?', a: 'Yes, on any paid plan. Platforms may ask you to disclose realistic AI-generated audio; YouTube, for example, has an altered or synthetic content setting at upload.' },
  { q: 'Can I use my own voice?', a: `Yes. Record or upload a ${CLONE_SAMPLE_SECONDS}-second sample of your own voice on the Voice Cloning page, then select it in the studio. Only clone voices you have permission to use.` },
  { q: 'What happens when I run out of characters?', a: 'Generation pauses until your allowance resets at the next billing cycle, or you can upgrade to a larger plan at any time.' },
  { q: 'How do I make the voice sound more natural?', a: 'Write for the ear: short sentences, clear punctuation, and numbers written the way you want them spoken. Then compare two or three voices on the same paragraph.' },
];

const section = 'max-w-[1200px] mx-auto px-4 sm:px-6';
const h2 = "font-['Syne'] font-extrabold text-[30px] sm:text-[40px] text-slate-900 tracking-tight mb-4";
const card = 'bg-white rounded-[20px] border border-[#e2dfdb] p-6';

export default function TextToSpeechPage() {
  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans text-slate-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(FAQS)) }} />
      <Navbar />

      <section className="pt-32 pb-20 lg:pt-44 px-4 sm:px-6 border-b border-[#e2dfdb]">
        <div className="max-w-[860px] mx-auto text-center">
          <h1 className="font-['Syne'] font-extrabold text-[40px] sm:text-[56px] lg:text-[64px] leading-[1.05] tracking-tight mb-6 text-slate-900">
            Text to Speech for <span className="text-[#E8522A]">Creators</span>
          </h1>
          <p className="text-[17px] sm:text-[20px] text-slate-600 mb-10 leading-relaxed">
            Turn scripts into AI voiceovers in {LANGUAGE_COUNT_LABEL}. Pick a library voice or your own cloned voice, then download MP3 or WAV.
          </p>
          <ScriptBox defaultText="Welcome back to the channel. Today we're looking at three simple ways to plan a week of videos without burning out." />
          <p className="mt-6 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
            {FREE.chars} free characters a month · No credit card · {LANGUAGE_COUNT_LABEL}
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className={section}>
          <h2 className={h2}>How text to speech works in FlashTTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {STEPS.map((s, i) => (
              <div key={s.t} className="bg-[#F0EDE8] rounded-[20px] border border-[#e2dfdb] p-6">
                <div className="w-10 h-10 rounded-full bg-[#E8522A] text-white flex items-center justify-center font-bold mb-4">{i + 1}</div>
                <h3 className="font-['Syne'] font-bold text-[19px] text-slate-900 mb-2">{s.t}</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className={section}>
          <h2 className={h2}>What you can make</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {USE_CASES.map((u) => (
              <div key={u.t} className={card}>
                <h3 className="font-['Syne'] font-bold text-[18px] text-slate-900 mb-2">{u.t}</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className={section}>
          <h2 className={h2}>{LANGUAGE_COUNT_LABEL}</h2>
          <p className="text-slate-600 text-[16px] mb-8 max-w-[700px]">Write your script in the language you want spoken. Languages with their own guide are linked.</p>
          <div className="flex flex-wrap gap-3">
            {ALL_LANGUAGES.map((l) =>
              l.slug ? (
                <Link key={l.code} href={`/text-to-speech/${l.slug}`} className="px-4 py-2 rounded-full bg-[#E8522A]/10 text-[#E8522A] font-bold text-[14px] hover:bg-[#E8522A] hover:text-white transition-colors">
                  {l.label} →
                </Link>
              ) : (
                <span key={l.code} className="px-4 py-2 rounded-full bg-[#F0EDE8] border border-[#e2dfdb] text-slate-700 font-semibold text-[14px]">{l.label}</span>
              )
            )}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className={section}>
          <h2 className={h2}>Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {FEATURES.map((f) => (
              <div key={f.t} className={card}>
                <h3 className="font-['Syne'] font-bold text-[18px] text-slate-900 mb-2">{f.t}</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className={section}>
          <h2 className={h2}>Plans and limits</h2>
          <p className="text-slate-600 text-[16px] mb-8">Every limit below is the one the studio enforces.</p>
          <PlanLimitsTable />
        </div>
      </section>

      <section className="py-20">
        <div className={section}>
          <h2 className={h2}>Tips for scripts that sound good aloud</h2>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPS.map((t) => (
              <li key={t} className={`${card} text-slate-700 text-[15px] leading-relaxed`}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          <h2 className={`${h2} text-center mb-10`}>Text to speech FAQ</h2>
          <FaqList faqs={FAQS} />
        </div>
      </section>

      <section className="py-20">
        <div className={`${section} space-y-14`}>
          <RelatedLinks title="Compare FlashTTS" links={COMPARISON_LINKS} />
          <RelatedLinks title="More from FlashTTS" links={PRODUCT_LINKS.filter((l) => l.href !== '/text-to-speech')} />
        </div>
      </section>

      <section className="py-20 bg-white text-center px-4">
        <h2 className={h2}>Start with {FREE.chars} free characters</h2>
        <p className="text-[17px] text-slate-600 mb-8">No credit card required. Upgrade only when you need more.</p>
        <Link href="/signup" className="inline-flex py-4 px-10 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[18px]">
          Create a free account
        </Link>
      </section>

      <Footer />
    </div>
  );
}
