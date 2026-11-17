import React from 'react';
import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Which cookies FlashTTS uses, why, and how to opt out.',
  alternates: {
    canonical: 'https://www.flashtts.com/cookies',
  },
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" badge="LEGAL" lastUpdated="November 17, 2026">
      <section>
        <p>
          This page explains the cookies and similar storage FlashTTS uses. For how we handle personal data
          generally, see our <a href="/privacy">Privacy Policy</a>.
        </p>

        <h2>Essential Cookies</h2>
        <p>
          Needed for the site to work. They keep you signed in (Supabase authentication session cookies) and
          remember your cookie-banner choice (stored in your browser&apos;s local storage). These cannot be
          switched off without breaking sign-in.
        </p>

        <h2>Analytics Cookies</h2>
        <p>
          We use Google Analytics (cookies such as <code>_ga</code> and <code>_ga_*</code>) to understand which
          pages are visited and how the site is used, in aggregate.
          Opt out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics opt-out browser add-on</a>.
        </p>

        <h2>Payment Cookies</h2>
        <p>
          When you upgrade, checkout is handled by Lemon Squeezy, our Merchant of Record. Lemon Squeezy may set its
          own cookies on its checkout pages for payment processing and fraud prevention. See
          {' '}<a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer">Lemon Squeezy&apos;s privacy policy</a>.
        </p>

        <h2>Advertising Cookies (Blog Only)</h2>
        <p>
          Our blog pages (/blog) show ads from Google AdSense. Google and its partners, including through the
          DoubleClick cookie, may use cookies to show ads based on your visits to this and other websites.
          We do not load AdSense on product, pricing, tools, sign-up or account pages.
          Opt out of personalized ads at{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>{' '}
          or <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
        </p>

        <h2>Managing Cookies</h2>
        <p>
          You can block or delete cookies in your browser settings. Blocking essential cookies will sign you out
          and may stop parts of the site from working.
        </p>

        <h2>Contact</h2>
        <p>
          Questions: <a href="mailto:support@flashtts.com">support@flashtts.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
