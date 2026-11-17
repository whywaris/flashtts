import React from 'react';
import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';
import { COMPETITOR_PRICES_CHECKED } from '@/lib/siteStats';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'How FlashTTS comparisons are sourced, trademark notice, and limits of our content.',
  alternates: {
    canonical: 'https://www.flashtts.com/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer" badge="LEGAL" lastUpdated="November 17, 2026">
      <section>
        <h2>Comparisons and Prices</h2>
        <p>
          Our comparison pages use publicly available information from each company&apos;s website, checked on the
          date shown on the page (currently {COMPETITOR_PRICES_CHECKED}). Prices, plans and features change often.
          Always check the provider&apos;s official pricing page before you buy. Where we convert minutes or words
          to characters, the figures are estimates and are labelled as such.
        </p>

        <h2>No Affiliation</h2>
        <p>
          FlashTTS is an independent product. We are not affiliated with, sponsored by, or endorsed by any company
          named on this site, including ElevenLabs, Murf AI, Speechify, LOVO, WellSaid Labs, NaturalReader,
          Cartesia and Fish Audio.
        </p>

        <h2>Trademarks</h2>
        <p>
          All product names, logos and brands are the property of their respective owners and are used here only
          to identify the products being compared.
        </p>

        <h2>Generated Audio</h2>
        <p>
          The output of text-to-speech and voice cloning depends on the text, voice and sample you provide.
          Results vary, and you are responsible for reviewing audio before you publish it.
        </p>

        <h2>Not Legal Advice</h2>
        <p>
          Content on this site about voice rights, platform policies, monetization or AI disclosure is general
          information, not legal advice. For questions about your specific situation, consult a qualified lawyer.
        </p>

        <h2>Contact</h2>
        <p>
          If you think something on this site is inaccurate, email{' '}
          <a href="mailto:support@flashtts.com">support@flashtts.com</a> and we will review it.
        </p>
      </section>
    </LegalLayout>
  );
}
