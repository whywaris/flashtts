// FAQ list with every answer visible (no accordion), so answers are readable by people and crawlers.
// Questions with an empty answer are skipped; pair with faqSchema() for FAQPage JSON-LD.
export type Faq = { q: string; a: string };

export const visibleFaqs = (faqs: Faq[]) => faqs.filter((f) => f.a.trim());

export function faqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: visibleFaqs(faqs).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export default function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="flex flex-col gap-4">
      {visibleFaqs(faqs).map((faq) => (
        <div key={faq.q} className="bg-white border border-[#e2dfdb] rounded-[20px] p-6 shadow-sm">
          <h3 className="font-['Syne'] font-bold text-[17px] sm:text-[18px] text-slate-900 mb-2">{faq.q}</h3>
          <p className="text-slate-600 text-[15.5px] leading-relaxed">{faq.a}</p>
        </div>
      ))}
    </div>
  );
}
