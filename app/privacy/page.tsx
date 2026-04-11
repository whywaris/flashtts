import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = {
  title: 'Privacy Policy | FlashTTS Data Protection',
  description: 'Understand how FlashTTS collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" badge="LEGAL" lastUpdated="March 1, 2026">
      <section>
        <div className="highlight-box">
          At FlashTTS, we take your privacy seriously. We never sell your personal data 
          or use it for unauthorized advertising purposes. Your security is our priority.
        </div>

        <h2>Introduction</h2>
        <p>
          FlashTTS ("we", "our", or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and share information 
          about you when you use our services at flashtts.com.
        </p>

        <h2>Information We Collect</h2>
        
        <h3>Information You Provide</h3>
        <ul>
          <li><strong>Account Information</strong>: Name, email address, and encrypted passwords.</li>
          <li><strong>Payment Information</strong>: Processed securely via Stripe. We never store your full credit card details on our servers.</li>
          <li><strong>Profile Information</strong>: Usernames, avatars, and preference settings.</li>
          <li><strong>Content You Create</strong>: Text inputs for TTS, voice recordings for cloning, and generated audio assets.</li>
        </ul>

        <h3>Information Collected Automatically</h3>
        <ul>
          <li><strong>Usage Data</strong>: Pages visited, features utilized, and your generation history.</li>
          <li><strong>Device Information</strong>: Browser type, operating system, and IP address for security auditing.</li>
          <li><strong>Cookies</strong>: Essential cookies for authentication and optional analytics cookies to improve our platform.</li>
        </ul>

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
          <li><strong>Stripe</strong>: For encrypted payment processing.</li>
          <li><strong>Resend</strong>: For reliable transactional email delivery.</li>
          <li><strong>Cloudflare</strong>: For secure asset storage and performance optimization.</li>
        </ul>

        <h2>Data Retention</h2>
        <p>
          We retain your information as long as your account remains active. 
          You can request account deletion at any time by contacting us at 
          <a href="mailto:support@flashtts.com">support@flashtts.com</a>. Upon deletion, 
          your personal data will be purged from our active systems.
        </p>

        <h2>Your Rights (GDPR/CCPA)</h2>
        <p>Depending on your location, you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of any inaccurate information.</li>
          <li>Request deletion of your account and associated data.</li>
          <li>Export your data in a machine-readable format.</li>
          <li>Opt-out of marketing communications at any time.</li>
        </ul>

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
