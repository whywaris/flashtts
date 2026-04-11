import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = {
  title: 'Voice Cloning Policy | FlashTTS Ethics & Safety',
  description: 'Understand the ethical guidelines and legal requirements for using voice cloning on our platform.',
};

export default function VoiceCloningPolicyPage() {
  return (
    <LegalLayout title="Voice Cloning Policy" badge="IMPORTANT POLICY">
      <section>
        <div className="highlight-box-red">
          ⚠️ <strong>Misuse of voice cloning technology is a serious violation 
          of our Terms of Service and may be illegal.</strong> Please read this 
          policy carefully before using voice cloning features.
        </div>

        <h2>What is Voice Cloning?</h2>
        <p>
          Voice cloning creates a digital replica of a voice from a short 
          audio sample. While this technology is powerful for creators, it must 
          be used responsibly to prevent fraud and identity theft.
        </p>

        <h2>Permitted Uses</h2>
        <p>You MAY use FlashTTS to clone:</p>
        <ul>
          <li>✅ <strong>Your own voice</strong> for personal or commercial content creation.</li>
          <li>✅ <strong>Voices of people</strong> who have given explicit, written consent.</li>
          <li>✅ <strong>Public domain</strong> recordings where you have verified copyright status.</li>
          <li>✅ <strong>Synthetic voices</strong> for which you have the legal right to clone.</li>
        </ul>

        <h2>Prohibited Uses</h2>
        <p>You MAY NOT use FlashTTS to clone:</p>
        <ul>
          <li>❌ Any person's voice without their <strong>explicit written consent</strong>.</li>
          <li>❌ Voices of public figures, celebrities, or government officials.</li>
          <li>❌ Voices intended to create misleading or deceptive content (deepfakes).</li>
          <li>❌ Voices used to impersonate someone for fraud, harassment, or harm.</li>
          <li>❌ Voices of minors (individuals under 18 years of age).</li>
          <li>❌ Voices used in news, judicial, or medical contexts to spread misinformation.</li>
        </ul>

        <h2>Consent Requirements</h2>
        <p>When cloning someone else's voice, you must:</p>
        <ol className="list-decimal pl-6 space-y-4 mb-8">
          <li><strong>Obtain written consent</strong>: A clear document signed by the voice owner.</li>
          <li><strong>Inform them</strong>: Explain exactly how the cloned voice will be used and where.</li>
          <li><strong>Right to Revoke</strong>: Allow the owner to revoke their consent at any time.</li>
          <li><strong>Documentation</strong>: Keep records of consent for at least 3 years after cloning.</li>
        </ol>

        <h2>Deepfake Policy</h2>
        <p>
          Creating audio deepfakes — realistic fake recordings that misrepresent 
          what someone said — is strictly prohibited. This may violate federal 
          laws (such as the DEEPFAKES Accountability Act), state laws, and result 
          in civil liability for defamation.
        </p>

        <h2>Enforcement & Penalties</h2>
        <p>
          We actively monitor our platform for policy violations.
          Violations will result in:
        </p>
        <ul>
          <li>Immediate and permanent account suspension.</li>
          <li>Forfeiture of all generated assets and subscription credits.</li>
          <li>Reporting to relevant law enforcement agencies if illegal activity is suspected.</li>
          <li>Legal action for damages in serious cases.</li>
        </ul>

        <h2>Report Abuse</h2>
        <p>
          If you believe someone is misusing voice cloning technology on FlashTTS:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:abuse@flashtts.com">abuse@flashtts.com</a>
        </p>
        <p>
          All reports are investigated by our safety team within 24 hours.
        </p>

        <div className="highlight-box">
          By using our Voice Cloning features, you agree to this policy 
          and take full responsibility for the ethical use of the cloned voice.
        </div>
      </section>
    </LegalLayout>
  );
}
