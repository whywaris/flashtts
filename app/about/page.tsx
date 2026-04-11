import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = {
  title: 'About FlashTTS | High-Quality AI Text-to-Speech',
  description: 'Learn about our mission to provide expressive, natural AI voices for everyone.',
};

export default function AboutPage() {
  return (
    <LegalLayout title="About FlashTTS" badge="ABOUT US">
      <section>
        <p>
          FlashTTS is an AI-powered text-to-speech platform built to give everyone 
          a voice. We believe that creating professional audio content should be 
          fast, affordable, and accessible to everyone — from solo creators to 
          global enterprises.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is to break down the barriers to high-quality audio production. 
          By leveraging the latest advancements in neural networks and deep learning, 
          we enable creators to generate studio-quality voiceovers without the need 
          for expensive equipment or professional voice talent.
        </p>

        <h2>What We Do</h2>
        <p>
          FlashTTS converts written text into natural, expressive audio using 
          cutting-edge AI technology. With 600+ voices across 19 languages, 
          our platform serves a diverse range of needs:
        </p>
        <ul>
          <li><strong>Content Creators & YouTubers</strong>: Engage your audience with high-quality narration.</li>
          <li><strong>Podcast Producers</strong>: Create intro, outros, or entire episodes with ease.</li>
          <li><strong>Audiobook Narrators</strong>: Turn manuscripts into immersive listening experiences.</li>
          <li><strong>Marketing Teams</strong>: Scale your ad production with consistent brand voices.</li>
          <li><strong>Educators</strong>: Make learning materials more accessible and engaging.</li>
          <li><strong>Developers</strong>: Integrate professional TTS into your apps via our robust API.</li>
        </ul>

        <h2>Our Technology</h2>
        <p>
          We use state-of-the-art neural text-to-speech models to generate 
          human-like voices that capture the nuances of human speech. 
          Our platform is designed for speed and simplicity without compromising on quality.
        </p>
        <ul>
          <li>600+ premium AI voices with varying tones and styles.</li>
          <li>19 supported languages covering major global regions.</li>
          <li>Advanced voice cloning technology for personalized audio.</li>
          <li>Real-time audio generation and instant exports.</li>
        </ul>

        <div className="highlight-box">
          FlashTTS is committed to responsible AI usage. 
          We have strict policies against the misuse of voice cloning technology 
          to protect individuals and ensure ethical content creation.
        </div>

        <h2>Contact Us</h2>
        <p>
          Have questions about our technology or how FlashTTS can help your project? 
          We'd love to hear from you.
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:support@flashtts.com">support@flashtts.com</a><br />
          <strong>Response time:</strong> Typically within 24 hours on business days.
        </p>
      </section>
    </LegalLayout>
  );
}
