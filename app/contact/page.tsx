import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact Us | FlashTTS Customer Support',
  description: "Have questions? We're here to help with any inquiries about FlashTTS AI text-to-speech.",
};

export default function ContactPage() {
  return (
    <LegalLayout title="Contact Us" badge="GET IN TOUCH">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Column: Info */}
        <section>
          <h2>How can we help?</h2>
          <p>
            We're here to help with any questions about FlashTTS. Whether you're 
            a solo creator with a technical question or an enterprise looking 
            for a custom solution, our team is ready to assist.
          </p>

          <div className="mt-10 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d1c] mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#0a0a0f] text-sm mb-1">General Support</h4>
                <p className="text-sm text-[#6b7280]">For all general questions and account assistance.</p>
                <a href="mailto:support@flashtts.com" className="text-sm font-bold text-[#ff4d1c] hover:underline">support@flashtts.com</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d1c] mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#0a0a0f] text-sm mb-1">Billing Questions</h4>
                <p className="text-sm text-[#6b7280]">For subscription management and billing inquiries.</p>
                <a href="mailto:billing@flashtts.com" className="text-sm font-bold text-[#ff4d1c] hover:underline">billing@flashtts.com</a>
              </div>
            </div>


            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d1c] mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#0a0a0f] text-sm mb-1">Abuse Reports</h4>
                <p className="text-sm text-[#6b7280]">To report misuse of our platform or voice cloning.</p>
                <a href="mailto:abuse@flashtts.com" className="text-sm font-bold text-[#ff4d1c] hover:underline">abuse@flashtts.com</a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8">
            <h4 className="font-bold text-[#0a0a0f] text-[11px] uppercase tracking-widest mb-6">Business Hours</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-[#0a0a0f]">Mon - Fri</p>
                <p className="text-[#6b7280]">9:00 AM - 6:00 PM EST</p>
              </div>
              <div>
                <p className="font-bold text-[#0a0a0f]">Sat - Sun</p>
                <p className="text-[#6b7280]">Limited support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Form */}
        <div>
          <ContactForm />
        </div>
      </div>
    </LegalLayout>
  );
}
