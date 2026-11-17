import Link from 'next/link';

export type RelatedLink = { href: string; label: string; desc?: string };

export default function RelatedLinks({ title, links }: { title: string; links: RelatedLink[] }) {
  return (
    <div>
      <h2 className="font-['Syne'] font-extrabold text-[26px] sm:text-[32px] text-slate-900 tracking-tight mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="block bg-white border border-[#e2dfdb] rounded-[16px] p-5 hover:border-[#E8522A] transition-colors">
            <div className="font-bold text-slate-900">{l.label} →</div>
            {l.desc && <div className="text-[13px] text-slate-500 mt-1">{l.desc}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const COMPARISON_LINKS: RelatedLink[] = [
  { href: '/vs/elevenlabs', label: 'FlashTTS vs ElevenLabs' },
  { href: '/vs/murf', label: 'FlashTTS vs Murf AI' },
  { href: '/vs/speechify', label: 'FlashTTS vs Speechify' },
  { href: '/vs/lovo', label: 'FlashTTS vs LOVO AI' },
  { href: '/vs/wellsaid', label: 'FlashTTS vs WellSaid Labs' },
  { href: '/vs/naturalreader', label: 'FlashTTS vs NaturalReader' },
];

export const PRODUCT_LINKS: RelatedLink[] = [
  { href: '/text-to-speech', label: 'Text to Speech', desc: 'Turn scripts into voiceovers' },
  { href: '/voice-cloning', label: 'Voice Cloning', desc: 'Clone your own voice' },
  { href: '/audiobook', label: 'Audiobook Studio', desc: 'Multi-chapter narration' },
  { href: '/tools', label: 'Free Tools', desc: 'Duration and file-size calculators' },
  { href: '/pricing', label: 'Pricing', desc: 'Plans and limits' },
  { href: '/blog', label: 'Blog', desc: 'Guides for creators' },
];
