import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VoiceCloneTrial from '@/components/VoiceCloneTrial';
import homeStyles from '../page.module.css';

export const metadata: Metadata = {
  title: 'AI Voice Cloning — Clone Any Voice in Seconds | FlashTTS',
  description:
    'Clone any voice instantly with FlashTTS AI voice cloning. Create a perfect digital replica of your voice for TTS, podcasts, audiobooks & content creation. Free to start — no signup required.',
  keywords: [
    'ai voice cloning', 'voice cloning', 'voice cloning ai', 'free voice cloning',
    'ai voice cloning free', 'best ai voice cloning', 'instant voice cloning',
    'voice cloning text to speech', 'voice cloning app', 'ai voice cloning tool',
    'ai voice cloning software', 'free ai voice cloning', 'clone voice ai',
    'voice cloning technology', 'elevenlabs voice cloning alternative',
    'best voice cloning ai', 'real time voice cloning', 'voice cloning online',
    'ai voice cloning online free', 'voice cloning free ai',
  ].join(', '),
  openGraph: {
    title: 'AI Voice Cloning — Clone Any Voice in Seconds | FlashTTS',
    description: 'Clone any voice instantly with FlashTTS. Record 30 seconds — no signup required.',
    type: 'website',
    url: 'https://flashtts.com/voice-cloning',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Voice Cloning — Clone Any Voice | FlashTTS',
    description: 'Clone any voice in seconds with AI. Free — no signup required.',
  },
  alternates: {
    canonical: 'https://flashtts.com/voice-cloning',
  },
};

export default function VoiceCloningPage() {
  return (
    <div className={homeStyles.homeContainer}>
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className={homeStyles.hero} style={{ minHeight: 'auto', paddingBottom: '100px' }}>
        <div className={`${homeStyles.container} ${homeStyles.heroGrid}`}>
          <div className={homeStyles.heroLeft}>
            <div className={homeStyles.heroEyebrow}>
              <span></span> Instant Voice Cloning
            </div>
            <h1>Your voice,<br /><em>digitized</em><br />in seconds.</h1>
            <p className={homeStyles.heroSub}>
              FlashTTS uses state-of-the-art AI to create a perfect digital replica of your voice. 
              Upload a snippet or record live — use your clone for any content.
            </p>
            <div className={homeStyles.heroActions}>
              <Link href="/signup" className={homeStyles.btnHeroCta}>Start Cloning Free</Link>
              <Link href="#how-it-works" className={homeStyles.btnHeroPlay}>Learn how it works</Link>
            </div>
          </div>

          <div className={homeStyles.heroRight} style={{ display: 'flex', justifyContent: 'center' }}>
            <VoiceCloneTrial />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className={homeStyles.how}>
        <div className={homeStyles.container}>
          <div className={homeStyles.sectionHeader}>
            <div>
              <p className={homeStyles.sectionEyebrow}>Process</p>
              <h2 className={homeStyles.sectionTitle}>Three steps to<br />voice immortality.</h2>
            </div>
            <p className={homeStyles.sectionDesc}>
              We've simplified the complex science of neural voice synthesis into a 60-second workflow.
            </p>
          </div>

          <div className={homeStyles.stepsGrid}>
            <div className={homeStyles.step}>
              <span className={homeStyles.stepN}>01</span>
              <div className={homeStyles.stepTitle}>Record or Upload</div>
              <p className={homeStyles.stepDesc}>Provide at least 30 seconds of clear audio. The better the quality, the more accurate the clone.</p>
              <div className={homeStyles.stepArrow}>→</div>
            </div>
            <div className={homeStyles.step}>
              <span className={homeStyles.stepN}>02</span>
              <div className={homeStyles.stepTitle}>Neural Analysis</div>
              <p className={homeStyles.stepDesc}>Our AI extracts your unique vocal characteristics: timbre, pitch, and speech patterns.</p>
              <div className={homeStyles.stepArrow}>→</div>
            </div>
            <div className={homeStyles.step}>
              <span className={homeStyles.stepN}>03</span>
              <div className={homeStyles.stepTitle}>Voice Ready</div>
              <p className={homeStyles.stepDesc}>Your voice is saved to your library forever. Use it in the TTS studio with any of our 29 languages.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className={homeStyles.features}>
        <div className={homeStyles.container}>
          <div className={homeStyles.sectionHeader} style={{ marginBottom: '80px' }}>
            <div>
              <p className={homeStyles.sectionEyebrow}>Possibilities</p>
              <h2 className={homeStyles.sectionTitle}>One voice.<br />Infinite content.</h2>
            </div>
            <p className={homeStyles.sectionDesc}>
              Stop spending hours in front of a mic. Scale your content production while keeping it personal.
            </p>
          </div>

          <div className={homeStyles.featuresGrid}>
            <div className={`${homeStyles.feat} ${homeStyles.featA}`}>
              <div className={homeStyles.featTag}>Content Creators</div>
              <span className={homeStyles.featIcon}>🎞️</span>
              <div className={homeStyles.featTitle}>Scalable Voiceovers</div>
              <p className={homeStyles.featDesc}>Generate voiceovers for your videos in your own voice. Perfect for updates, short-form content, and daily uploads.</p>
            </div>
            <div className={`${homeStyles.feat} ${homeStyles.featB}`}>
              <div className={homeStyles.featTag} style={{ background: 'rgba(91, 33, 182, 0.08)', color: '#5b21b6' }}>Localization</div>
              <span className={homeStyles.featIcon}>🌍</span>
              <div className={homeStyles.featTitle}>Speak Any Language</div>
              <p className={homeStyles.featDesc}>Your cloned voice can speak all 29+ languages we support. Expand your global reach without learning a new tongue.</p>
            </div>
            <div className={`${homeStyles.feat} ${homeStyles.featC}`}>
              <div className={homeStyles.featTag}>Protection</div>
              <span className={homeStyles.featIcon}>🛡️</span>
              <div className={homeStyles.featTitle}>Voice Preservation</div>
              <p className={homeStyles.featDesc}>Digitize your voice and preserve it forever for legacy projects or personal archival.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={homeStyles.ctaSection}>
        <div className={homeStyles.container}>
          <h2 className={homeStyles.sectionTitle} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '32px' }}> Ready to clone your voice?</h2>
          <p className={homeStyles.sectionDesc} style={{ margin: '0 auto 48px' }}>Join 12,000+ creators and start producing high-quality audio today.</p>
          <div className={homeStyles.heroActions} style={{ justifyContent: 'center' }}>
            <Link href="/signup" className={homeStyles.btnHeroCta} style={{ padding: '16px 40px' }}>Get Started Free</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}