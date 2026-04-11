import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = {
  title: 'Refund Policy | FlashTTS Satisfaction Guarantee',
  description: 'Learn about our 7-day money-back guarantee and subscription refund terms.',
};

export default function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" badge="LEGAL" lastUpdated="March 1, 2026">
      <section>
        <div className="highlight-box">
          "We want you to be completely satisfied with FlashTTS. 
          If you're not happy, we'll make it right."
        </div>

        <h2>Overview</h2>
        <p>
          At FlashTTS, we stand behind our product. This policy outlines 
          when and how refunds are issued to our subscribers.
        </p>

        <h2>7-Day Money-Back Guarantee</h2>
        <p>
          New subscribers on any paid plan (Starter, Creator, Pro, Agency) are 
          eligible for a full refund within <strong>7 days</strong> of their 
          first payment — no questions asked.
        </p>

        <h3>How to request a refund:</h3>
        <ul>
          <li>Email <a href="mailto:support@flashtts.com">support@flashtts.com</a> with the subject "Refund Request".</li>
          <li>Include your account email address and an optional reason (your feedback helps us improve!).</li>
          <li>Refunds are processed within 5-10 business days to your original payment method.</li>
        </ul>

        <h2>When Refunds Are NOT Issued</h2>
        <p>We do not issue refunds in the following cases:</p>
        <ul>
          <li>Requests made after 7 days of the initial subscription start.</li>
          <li>For usage already consumed (significant character generation).</li>
          <li>For annual plans after 30 days of purchase.</li>
          <li>For accounts terminated due to serious violations of our <a href="/terms">Terms of Service</a>.</li>
          <li>Partial month refunds for cancelled subscriptions.</li>
        </ul>

        <h2>Subscription Cancellation</h2>
        <p>
          You can cancel your subscription at any time via your dashboard:
        </p>
        <p>
          <strong>Dashboard → Settings → Billing → Cancel Plan</strong>
        </p>
        <p>
          Cancellation stops future charges. You will retain access to your plan 
          features until the end of your current billing period.
        </p>

        <h2>Annual Plan Refunds</h2>
        <p>
          Annual plan refunds are available within 30 days of purchase. 
          After 30 days, we can offer account credits for future use instead 
          of a direct refund.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about your billing or this policy, 
          please reach out:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:support@flashtts.com">support@flashtts.com</a><br />
          <strong>Response time:</strong> Typically within 24 hours.
        </p>
      </section>
    </LegalLayout>
  );
}
