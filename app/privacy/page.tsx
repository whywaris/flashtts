import React from 'react';
import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | FlashTTS Data Protection',
  description: 'Understand how FlashTTS collects, uses, and protects your personal information.',
  alternates: {
    canonical: 'https://www.flashtts.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" badge="LEGAL" lastUpdated="November 17, 2026">
      <section>
        <div className="highlight-box">
          At FlashTTS, we take your privacy seriously. We never sell your personal data 
          or use it for unauthorized advertising purposes. Your security is our priority.
        </div>

        <h2>Introduction</h2>
        <p>
          FlashTTS ("we", "our", or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and share information 
          about you when you use our services at https://www.flashtts.com.
        </p>

        <h2>Information We Collect</h2>
        
        <h3>Information You Provide</h3>
        <ul>
          <li><strong>Account Information</strong>: Name, email address, and encrypted passwords.</li>
          <li><strong>Payment Information</strong>: Processed securely via Lemon Squeezy, our Merchant of Record and payment gateway. We never store your full credit card details on our servers.</li>
          <li><strong>Profile Information</strong>: Usernames, avatars, and preference settings.</li>
          <li><strong>Content You Create</strong>: Text inputs for TTS, voice recordings for cloning, and generated audio assets.</li>
        </ul>

        <h3>Information Collected Automatically</h3>
        <ul>
          <li><strong>Usage Data</strong>: Pages visited, features utilized, and your generation history.</li>
          <li><strong>Device Information</strong>: Browser type, operating system, and IP address for security auditing.</li>
          <li><strong>Cookies</strong>: Essential cookies for authentication, Google Analytics cookies to understand site usage, and advertising cookies on blog pages only. See our <a href="/cookies">Cookie Policy</a>.</li>
        </ul>

        <h2>Third-Party Advertising & Cookies</h2>
        <p>
          We show ads from Google AdSense on our blog pages (/blog) only - never on product, pricing, tools, sign-up or account pages. These companies may use cookies, web beacons, and other tracking technologies to collect information about your visits to this and other websites in order to provide personalized advertisements about goods and services of interest to you.
        </p>
        <p>
          Google&apos;s use of advertising cookies, including the DoubleClick cookie, enables it and its partners to serve ads based on your visit to FlashTTS and/or other sites on the Internet. Users may opt out of personalized advertising by visiting{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>{' '}
          or{' '}
          <a href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>.
        </p>

        <h2>How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide, maintain, and improve our neural TTS services.</li>
          <li>Process payments and manage your active subscriptions.</li>
          <li>Send transactional emails regarding account updates or billing receipts.</li>
          <li>Send marketing communications, but only if you have opted in.</li>
          <li>Analyze platform usage patterns to optimize performance and user experience.</li>
          <li>Detect, prevent, and address fraud or technical issues.</li>
        </ul>

        <h2>Data Sharing</h2>
        <p>
          We do not sell your personal information. We only share data with essential 
          third-party service providers who assist in our operations:
        </p>
        <ul>
          <li><strong>Supabase</strong>: For secure database and authentication services.</li>
          <li><strong>Lemon Squeezy</strong>: As our Merchant of Record and payment processor for PCI-compliant billing and subscription management.</li>
          <li><strong>Resend</strong>: For reliable transactional email delivery.</li>
          <li><strong>Cloudflare</strong>: For secure asset storage (R2) and DNS.</li>
          <li><strong>Modal and RunPod</strong>: GPU providers that process your text and voice samples to generate audio and voice clones.</li>
          <li><strong>Google Analytics</strong>: Aggregated website usage analytics.</li>
          <li><strong>Google AdSense</strong>: Advertising on blog pages only.</li>
        </ul>

        <h2>Data Retention</h2>
        <p>
          We retain your information as long as your account remains active. 
          You can request account deletion at any time by contacting us at{' '}
          <a href="mailto:support@flashtts.com">support@flashtts.com</a>. Upon deletion, 
          your personal data will be purged from our active systems.
        </p>

        <h2>Voice Recordings</h2>
        <p>
          When you use voice cloning, we store the voice sample you upload or record and the resulting
          voice clone, so you can generate speech with it. Samples are stored in Cloudflare R2 and
          processed by our GPU providers only to create and use your clone.
        </p>
        <ul>
          {/* TODO: confirm the retention period actually enforced in code/storage. */}
          <li><strong>Retention</strong>: We keep voice samples for [TODO] days after you delete the clone, then delete them.</li>
          <li><strong>Deletion</strong>: You can delete a cloned voice in your dashboard or ask us at <a href="mailto:support@flashtts.com">support@flashtts.com</a>. Deleting your account deletes your samples and clones.</li>
          {/* TODO: confirm. Only keep this sentence if it is true for every provider that touches samples. */}
          <li><strong>Training</strong>: Your voice samples are never used to train shared models unless you opt in.</li>
        </ul>

        <h2>Your Rights Under GDPR (EEA and UK)</h2>
        <p>
          If you are in the European Economic Area or the United Kingdom, you have the right to access,
          correct, delete, restrict or object to processing of your personal data, to data portability, and
          to withdraw consent at any time. You can also complain to your local data protection authority
          (in the UK, the Information Commissioner&apos;s Office).
        </p>
        <p>
          <strong>How to request:</strong> email <a href="mailto:support@flashtts.com">support@flashtts.com</a> from
          the address on your account with the subject &quot;Data request&quot;. We may ask you to verify your identity.
          <br />
          <strong>Response time:</strong> within one month of receiving your request (extendable by two months for
          complex requests, in which case we will tell you).
        </p>

        <h2>Your Rights Under the CCPA (California)</h2>
        <p>
          If you are a California resident, you have the right to know what personal information we collect,
          use and disclose; to request deletion; to correct inaccurate information; and not to be discriminated
          against for exercising these rights. We do not sell your personal information. Advertising cookies on
          our blog pages may count as &quot;sharing&quot; for cross-context behavioral advertising; you can opt out via
          {' '}<a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
        </p>
        <p>
          <strong>How to request:</strong> email <a href="mailto:support@flashtts.com">support@flashtts.com</a> with
          the subject &quot;California privacy request&quot;. You may use an authorized agent.
          <br />
          <strong>Response time:</strong> we confirm receipt within 10 business days and respond within 45 days
          (extendable by another 45 days with notice).
        </p>

        <h2>Children's Privacy</h2>
        <p>
          FlashTTS is intended for users who are at least 18 years of age. 
          We do not knowingly collect personal information from minors.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy periodically. We will notify you of any significant 
          changes by posting the new policy on this page and updating the "Last Updated" date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions or concerns regarding this Privacy Policy, 
          please reach out to our privacy team:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:support@flashtts.com">support@flashtts.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
