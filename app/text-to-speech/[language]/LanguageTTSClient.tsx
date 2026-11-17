import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScriptBox from '@/components/marketing/ScriptBox';
import FaqList, { faqSchema, type Faq } from '@/components/marketing/FaqList';
import PlanLimitsTable from '@/components/marketing/PlanLimitsTable';
import RelatedLinks from '@/components/marketing/RelatedLinks';
import { INDIC_LANGUAGES, type LanguageData } from '@/data/languages/indic';
import { CLONE_SAMPLE_SECONDS, LANGUAGE_COUNT_LABEL } from '@/lib/siteStats';
import { PLANS } from '@/lib/plans';

const FREE = PLANS.find((p) => p.isFree)!;
const section = 'max-w-[1100px] mx-auto px-4 sm:px-6';
const h2 = "font-['Syne'] font-extrabold text-[30px] sm:text-[40px] text-slate-900 tracking-tight mb-4";
const card = 'bg-white rounded-[20px] border border-[#e2dfdb] p-6';

// Product facts shared by every language page, built from lib/plans.ts.
function commonFaqs(l: LanguageData): Faq[] {
  return [
    { q: `Is ${l.name} text to speech free?`, a: `Yes. The Free plan includes ${FREE.chars} characters a month and 1 voice clone, with no credit card. Free-plan audio is for personal use; paid plans add commercial rights.` },
    { q: `How long can one ${l.name} generation be?`, a: `${PLANS.map((p) => `${p.name}: ${p.charsPerGen}`).join(', ')} characters per generation. Split longer scripts at natural breaks.` },
    { q: `Can I use ${l.name} voiceovers on YouTube?`, a: 'Yes, on any paid plan. Follow each platform’s disclosure rules for realistic AI audio; YouTube has an altered or synthetic content setting at upload.' },
    { q: `Can I clone my own voice for ${l.name}?`, a: `Yes. Record a ${CLONE_SAMPLE_SECONDS}-second sample of your own voice on the Voice Cloning page and use it with ${l.name} scripts. Only clone voices you have permission to use.` },
    { q: 'Which formats can I download?', a: 'MP3 and WAV on every plan.' },
  ];
}

export default function LanguageTTSClient({ langData: l }: { langData: LanguageData }) {
  const faqs = [...l.faqs, ...commonFaqs(l)];
  const steps = [
    { t: `Paste your ${l.name} script`, d: `Write or paste ${l.script} text into the Text to Speech studio and select ${l.name} as the language.` },
    { t: 'Choose a voice', d: `Pick a voice from the library or your own cloned voice, then generate a short test line.` },
    { t: 'Generate and download', d: 'Regenerate any line that needs a change, then download MP3 or WAV.' },
  ];
  const otherLanguages = Object.values(INDIC_LANGUAGES).filter((o) => o.slug !== l.slug);

  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans text-slate-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: `${l.name} Text to Speech - FlashTTS`,
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web',
              inLanguage: l.langCode,
              description: l.metaDescription,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            },
            faqSchema(faqs),
          ]),
        }}
      />
      <Navbar />

      <section className="pt-28 pb-16 lg:pt-40 px-4 sm:px-6 border-b border-[#e2dfdb]">
        <div className="max-w-[860px] mx-auto text-center">
          <div className="inline-flex px-4 py-1.5 rounded-full border-2 border-[#E8522A]/20 bg-[#E8522A]/5 text-[#E8522A] font-bold text-[12px] uppercase tracking-widest mb-6">
            {l.name} · {l.nativeName}
          </div>
          <h1 className="font-['Syne'] font-extrabold text-[36px] sm:text-[54px] leading-[1.08] tracking-tight mb-6 text-slate-900">{l.heroHeadline}</h1>
          <p className="text-[17px] sm:text-[19px] text-slate-600 mb-10 leading-relaxed">{l.heroSubheadline}</p>
          <ScriptBox defaultText={l.defaultSampleText} placeholder={l.samplePlaceholder} />
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-[13px] font-bold text-slate-500">
            <span>✓ {FREE.chars} free characters a month</span>
            <span>✓ Commercial rights on paid plans</span>
            <span>✓ MP3 and WAV download</span>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className={section}>
          <h2 className={h2}>How to make a {l.name} voiceover</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {steps.map((s, i) => (
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
          <h2 className={h2}>What you can make in {l.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
            {l.useCases.map((u) => (
              <div key={u.title} className={card}>
                <h3 className="font-['Syne'] font-bold text-[19px] text-slate-900 mb-2">{u.title}</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className={section}>
          <h2 className={h2}>Tips for {l.name} scripts</h2>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {l.tips.map((t) => (
              <li key={t} className="bg-[#F0EDE8] rounded-[20px] border border-[#e2dfdb] p-6 text-slate-700 text-[15px] leading-relaxed">{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20">
        <div className={section}>
          <h2 className={h2}>Plans and limits</h2>
          <p className="text-slate-600 text-[16px] mb-8">The same plans cover all {LANGUAGE_COUNT_LABEL}.</p>
          <PlanLimitsTable />
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          <h2 className={`${h2} text-center mb-10`}>{l.name} text to speech FAQ</h2>
          <FaqList faqs={faqs} />
        </div>
      </section>

      <section className="py-20">
        <div className={`${section} space-y-14`}>
          <RelatedLinks
            title="Other Indian languages"
            links={otherLanguages.map((o) => ({ href: `/text-to-speech/${o.slug}`, label: `${o.name} text to speech`, desc: o.nativeName }))}
          />
          <RelatedLinks
            title="More from FlashTTS"
            links={[
              { href: '/text-to-speech', label: 'Text to Speech', desc: `All ${LANGUAGE_COUNT_LABEL}` },
              { href: '/voice-cloning', label: 'Voice Cloning', desc: 'Clone your own voice' },
              { href: '/audiobook', label: 'Audiobook Studio', desc: 'Multi-chapter narration' },
            ]}
          />
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto bg-[#E8522A] rounded-3xl p-10 sm:p-14 text-center text-white shadow-xl">
          <h2 className="font-['Syne'] font-extrabold text-[32px] sm:text-[44px] tracking-tight leading-tight mb-4">Start your first {l.name} voiceover</h2>
          <p className="text-white/85 text-[16px] max-w-[550px] mx-auto mb-8">{FREE.chars} free characters a month. No credit card required.</p>
          <Link href="/signup" className="inline-flex py-4 px-10 bg-slate-900 hover:bg-black text-white rounded-xl font-['Syne'] font-bold text-[16px]">
            Create a free account →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
