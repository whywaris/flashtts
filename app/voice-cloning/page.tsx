import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VoiceCloneTrial from '@/components/VoiceCloneTrial';
import FaqList, { faqSchema, type Faq } from '@/components/marketing/FaqList';
import RelatedLinks, { COMPARISON_LINKS, PRODUCT_LINKS } from '@/components/marketing/RelatedLinks';
import { LANGUAGE_COUNT_LABEL, CLONE_SAMPLE_SECONDS } from '@/lib/siteStats';
import { PLANS } from '@/lib/plans';

const URL = 'https://www.flashtts.com/voice-cloning';

export const metadata: Metadata = {
  title: 'AI Voice Cloning: Clone Your Own Voice for Voiceovers',
  description: `Clone your own voice from a ${CLONE_SAMPLE_SECONDS}-second sample and use it for voiceovers in ${LANGUAGE_COUNT_LABEL}. Included on every plan, with consent required for every clone.`,
  alternates: { canonical: URL },
  openGraph: { title: 'AI Voice Cloning | FlashTTS', url: URL, type: 'website', images: ['/og-image.png'] },
};

const STEPS = [
  { t: 'Record or upload a sample', d: `Record about ${CLONE_SAMPLE_SECONDS} seconds in the browser, or upload an MP3, WAV, M4A or OGG file (up to 10 MB).` },
  { t: 'Confirm consent and save', d: 'Name the voice, confirm you have the right to clone it, and save it to your library.' },
  { t: 'Generate with your voice', d: 'Select the clone in the Text to Speech studio or the Audiobook Studio and generate from any script.' },
];

const SAMPLE_TIPS = [
  'Record in a quiet room with soft furnishings; avoid echoey kitchens and bathrooms.',
  'One speaker only: no music, TV or other voices in the background.',
  'Speak at your normal pace and volume, the way you want the clone to sound.',
  'Keep the microphone at a steady distance and avoid touching it while recording.',
  'Read a few complete sentences rather than single words.',
  'If the result sounds off, record a new sample; the sample quality matters more than its length.',
];

const USES = [
  { t: 'Your own videos', d: 'Narrate YouTube videos and Shorts in your voice without recording every script.' },
  { t: 'Fix a line later', d: 'Change a sentence in a published script and regenerate it instead of re-recording the take.' },
  { t: 'Other languages', d: `Use your clone with scripts in any of our ${LANGUAGE_COUNT_LABEL}.` },
  { t: 'Courses and audiobooks', d: 'Keep one consistent narrator voice across lessons or chapters.' },
];

const FAQS: Faq[] = [
  { q: 'How long should my voice sample be?', a: `About ${CLONE_SAMPLE_SECONDS} seconds of clear speech is enough to create a clone. A clean, quiet recording matters more than a long one.` },
  { q: 'Is voice cloning included in the free plan?', a: `Yes. ${PLANS.map((p) => `${p.name}: ${p.voiceClones} clone${p.voiceClones === '1' ? '' : 's'}`).join(', ')}.` },
  { q: 'Can I clone someone else’s voice?', a: 'Only with their clear permission. Cloning a person without consent, impersonating real people, and using clones for fraud or scams are prohibited by our Voice Cloning Policy and Terms.' },
  { q: 'Which file formats can I upload?', a: 'MP3, WAV, M4A and OGG files up to 10 MB, or record directly in the browser.' },
  { q: 'Can my cloned voice speak other languages?', a: `Yes. You can use a clone with scripts in any of our ${LANGUAGE_COUNT_LABEL}.` },
  { q: 'Can I use my cloned voice commercially?', a: 'Yes, on any paid plan. Free-plan audio is for personal use.' },
  { q: 'Do I need to disclose that the voice is AI-generated?', a: 'Follow the rules of each platform you publish on. YouTube, for example, asks creators to use the altered or synthetic content setting for realistic AI audio that could be mistaken for a real person.' },
  { q: 'Can I delete a cloned voice?', a: 'Yes. Delete it from your library at any time, or contact support@flashtts.com. Deleting your account deletes your samples and clones.' },
];

const section = 'max-w-[1200px] mx-auto px-4 sm:px-6';
const h2 = "font-['Syne'] font-extrabold text-[30px] sm:text-[40px] text-slate-900 tracking-tight mb-4";
const card = 'bg-white rounded-[20px] border border-[#e2dfdb] p-6';

export default function VoiceCloningPage() {
  return (
    <div className="bg-[#F0EDE8] min-h-screen font-sans text-slate-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(FAQS)) }} />
      <Navbar />

      <section className="pt-32 pb-20 lg:pt-44 px-4 sm:px-6 border-b border-[#e2dfdb]">
        <div className={`${section} grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[40px] sm:text-[56px] leading-[1.05] tracking-tight mb-6 text-slate-900">
              Clone <span className="text-[#E8522A]">your own voice</span> for voiceovers
            </h1>
            <p className="text-[17px] sm:text-[19px] text-slate-600 mb-8 leading-relaxed">
              Record a {CLONE_SAMPLE_SECONDS}-second sample, save your voice, and generate narration from any script. Voice cloning is included on every plan, including Free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="px-8 py-4 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[17px] text-center">Clone my voice free</Link>
              <Link href="#how-it-works" className="px-8 py-4 bg-white border-2 border-[#e2dfdb] hover:border-[#E8522A] rounded-xl font-['Syne'] font-bold text-[17px] text-center">How it works</Link>
            </div>
          </div>
          <div className="flex justify-center">
            <VoiceCloneTrial />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white">
        <div className={section}>
          <h2 className={h2}>How voice cloning works</h2>
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
          <h2 className={h2}>How to record a good sample</h2>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_TIPS.map((t) => (
              <li key={t} className={`${card} text-slate-700 text-[15px] leading-relaxed`}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className={section}>
          <h2 className={h2}>What creators use it for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {USES.map((u) => (
              <div key={u.t} className="bg-[#F0EDE8] rounded-[20px] border border-[#e2dfdb] p-6">
                <h3 className="font-['Syne'] font-bold text-[18px] text-slate-900 mb-2">{u.t}</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className={section}>
          <h2 className={h2}>Voice clones per plan</h2>
          <div className="overflow-x-auto rounded-[20px] border border-[#e2dfdb] bg-white mt-6">
            <table className="w-full min-w-[480px] text-left text-[15px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Price / month</th><th className="px-5 py-3">Voice clones</th><th className="px-5 py-3">Commercial use</th></tr>
              </thead>
              <tbody>
                {PLANS.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-bold">{p.name}</td>
                    <td className="px-5 py-3">{p.priceMonthly === 0 ? 'Free' : `$${p.priceMonthly}`}</td>
                    <td className="px-5 py-3">{p.voiceClones}</td>
                    <td className="px-5 py-3">{p.commercialUse ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className={`${section} grid grid-cols-1 md:grid-cols-2 gap-6`}>
          <div className="bg-[#F0EDE8] rounded-[20px] border border-[#e2dfdb] p-8">
            <h2 className="font-['Syne'] font-extrabold text-[26px] text-slate-900 mb-3">Consent comes first</h2>
            <p className="text-slate-600 leading-relaxed">
              Clone only your own voice or a voice you have clear permission to use. Every clone requires a consent confirmation, and impersonation, deceptive deepfakes, fraud and scams are prohibited. Read the{' '}
              <Link href="/voice-cloning-policy" className="text-[#E8522A] font-bold underline">Voice Cloning Policy</Link>.
            </p>
          </div>
          <div className="bg-[#F0EDE8] rounded-[20px] border border-[#e2dfdb] p-8">
            <h2 className="font-['Syne'] font-extrabold text-[26px] text-slate-900 mb-3">Disclose AI audio where required</h2>
            <p className="text-slate-600 leading-relaxed">
              Some platforms and laws require you to label realistic synthetic audio. On YouTube, use the altered or synthetic content setting when you upload realistic AI-generated content.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          <h2 className={`${h2} text-center mb-10`}>Voice cloning FAQ</h2>
          <FaqList faqs={FAQS} />
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className={`${section} space-y-14`}>
          <RelatedLinks title="More from FlashTTS" links={PRODUCT_LINKS.filter((l) => l.href !== '/voice-cloning')} />
          <RelatedLinks title="Compare FlashTTS" links={COMPARISON_LINKS} />
        </div>
      </section>

      <section className="py-20 text-center px-4">
        <h2 className={h2}>Ready to clone your voice?</h2>
        <p className="text-[17px] text-slate-600 mb-8">Free plan includes 1 voice clone. No credit card required.</p>
        <Link href="/signup" className="inline-flex py-4 px-10 bg-[#E8522A] hover:bg-[#d64119] text-white rounded-xl font-['Syne'] font-bold text-[18px]">Get started free</Link>
      </section>

      <Footer />
    </div>
  );
}
