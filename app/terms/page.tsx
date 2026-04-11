import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = {
  title: 'Terms of Service | FlashTTS User Agreement',
  description: 'Review the rules and guidelines for using the FlashTTS platform and services.',
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" badge="LEGAL" lastUpdated="March 1, 2026">
      <section>
        <h2>Agreement to Terms</h2>
        <p>
          By accessing FlashTTS at flashtts.com, you agree to these Terms of Service. 
          If you disagree with any part of these terms, please do not use our services.
        </p>

        <h2>Account Registration</h2>
        <ul>
          <li>You must be at least 18 years old to create an account.</li>
          <li>You are responsible for maintaining the security of your account and password.</li>
          <li>One account per person or entity. Bulk registration is prohibited.</li>
          <li>You must provide accurate information during the registration process.</li>
        </ul>

        <h2>Acceptable Use</h2>
        <p>You MAY use FlashTTS to:</p>
        <ul>
          <li>Create audio content for personal or commercial use (on paid plans).</li>
          <li>Generate voiceovers, podcasts, audiobooks, and e-learning materials.</li>
          <li>Clone your own voice or voices for which you have explicit rights.</li>
          <li>Access our API for integration into your legitimate applications.</li>
        </ul>

        <div className="highlight-box-red">
          <strong>❌ Prohibited Use</strong>: You MAY NOT use FlashTTS to generate content 
          that impersonates real people without consent, create deepfakes for deception, 
          harass others, or violate any laws.
        </div>

        <h2>Intellectual Property</h2>
        <ul>
          <li>FlashTTS owns all platform technology, algorithms, and AI models.</li>
          <li><strong>Ownership</strong>: You own the audio content you generate while on a paid plan.</li>
          <li><strong>Watermarks</strong>: Free plan audio may include sonic watermarks.</li>
          <li><strong>License</strong>: A commercial use license is included in all paid subscriptions.</li>
        </ul>

        <h2>Payment Terms</h2>
        <ul>
          <li>Subscriptions are billed on a monthly or annual basis.</li>
          <li>No refunds are issued for partial months (see our <a href="/refund">Refund Policy</a>).</li>
          <li>We reserve the right to change pricing with a 30-day notice.</li>
          <li>Failed payments may result in immediate suspension of services.</li>
        </ul>

        <h2>Termination</h2>
        <p>
          We reserve the right to terminate or suspend accounts that violate these 
          terms without prior notice. You may cancel your account at any time.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          FlashTTS is provided "as is". We are not liable for service interruptions, 
          loss of generated content, or any indirect damages resulting from 
          platform use.
        </p>

        <h2>Governing Law</h2>
        <p>
          These terms are governed by the laws of the United States.
        </p>

        <h2>Contact Us</h2>
        <p>
          For any questions regarding these terms, please contact us:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:support@flashtts.com">support@flashtts.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
