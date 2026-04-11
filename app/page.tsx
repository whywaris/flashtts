'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

// --- Sub-components ---

const Feature = ({ tag, title, desc, icon, num, type = 'default', span = 'featA' }: any) => (
  <div className={`${styles.feat} ${styles[span]}`}>
    <div className={`${styles.featTag} ${type === 'accent' ? styles.featTagAccent : type === 'violet' ? styles.featTagViolet : ''}`}>
      {tag}
    </div>
    <span className={styles.featIcon}>{icon}</span>
    <div className={styles.featTitle}>{title}</div>
    <p className={styles.featDesc}>{desc}</p>
    {title === '29 Languages' && (
      <div className={styles.featLangs}>
        <span className={styles.langPill}>🇺🇸 EN</span>
        <span className={styles.langPill}>🇵🇰 UR</span>
        <span className={styles.langPill}>🇸🇦 AR</span>
        <span className={styles.langPill}>🇪🇸 ES</span>
        <span className={styles.langPill}>🇩🇪 DE</span>
        <span className={styles.langPill}>🇫🇷 FR</span>
        <span className={styles.langPill} style={{ background: 'var(--ink)', color: '#fff' }}>+23</span>
      </div>
    )}
    <div className={styles.featNumber}>{num}</div>
  </div>
);

const Step = ({ n, title, desc, hasArrow = true }: any) => (
  <div className={styles.step}>
    <span className={styles.stepN}>{n}</span>
    <div className={styles.stepTitle}>{title}</div>
    <p className={styles.stepDesc}>{desc}</p>
    {hasArrow && <div className={styles.stepArrow}>→</div>}
  </div>
);

const Plan = ({ name, price, priceYearly, chars, features, isFeatured = false, isYearly = false, cta }: any) => (
  <div className={`${styles.plan} ${isFeatured ? styles.planFeatured : ''}`}>
    {isFeatured && <div className={styles.planBadge}>⭐ Most popular</div>}
    <p className={styles.planName}>{name}</p>
    <div className={styles.planPriceWrap}>
      <span className={styles.planPrice}>
        <sup>$</sup>{isYearly ? priceYearly : price}
      </span>
      {isYearly && priceYearly !== '0' && (
        <span style={{ fontSize: '15px', color: 'var(--muted)', marginLeft: '8px', textDecoration: 'line-through', fontWeight: 500 }}>
          ${price}
        </span>
      )}
    </div>
    <p className={styles.planPer}>{isYearly && price !== '0' ? 'per month, billed annually' : price === '0' ? 'forever free' : 'per month'}</p>
    <p className={styles.planChars}>{chars}</p>
    <ul className={styles.planFeatures}>
      {features.map((f: string, i: number) => <li key={i}>{f}</li>)}
    </ul>
    <Link 
      href="/signup" 
      className={`${styles.planCta} ${isFeatured ? styles.planCtaFill : styles.planCtaOutline}`}
    >
      {cta}
    </Link>
  </div>
);


export default function HomePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [activeVoice, setActiveVoice] = useState('Emma (US)');
  // Remove local menu state if no longer needed
  // const [isMenuOpen, setIsMenuOpen] = useState(false);

  const voices = ['Emma (US)', 'Marcus (UK)', 'Aria (AU)', 'Zaid (AE)', 'Sofia (ES)'];


  return (
    <div className={styles.homeContainer}>
      <Navbar />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroLeft}>
            <div className={styles.heroEyebrow}><span></span> 23 Languages · Voice Cloning · Audiobooks</div>
            <h1>Your voice,<br /><em>everywhere</em><br />you create.</h1>
            <p className={styles.heroSub}>FlashTTS turns your scripts into studio-quality AI voiceovers in seconds. Built for YouTubers, Podcasters, TikTokers, and Faceless creators.</p>
            <div className={styles.heroActions}>
              <Link href="/signup" className={styles.btnHeroCta}>Start free — 10K chars/month</Link>
              <button className={styles.btnHeroPlay}><div className={styles.playDot}></div> Hear a sample</button>
            </div>
            <div className={styles.heroTrust}>
              <div className={styles.avatars}>
                <div className={styles.avatar}>YT</div>
                <div className={`${styles.avatar} ${styles.avatarViolet}`}>PK</div>
                <div className={`${styles.avatar} ${styles.avatarAccent}`}>TK</div>
                <div className={`${styles.avatar} ${styles.avatarTeal}`}>AC</div>
                <div className={`${styles.avatar} ${styles.avatarOrange}`}>+</div>
              </div>
              <p>Trusted by 12,000+ creators worldwide</p>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.demoCard}>
              <div className={styles.demoCardTop}>
                <div className={styles.demoCardLabel}>Try it now</div>
                <textarea 
                  className={styles.demoTextarea} 
                  defaultValue="Welcome to my channel! Today we're exploring the most breathtaking hidden valleys in the world, and trust me — you won't believe what we found."
                />
              </div>
              <div className={styles.demoVoices}>
                {voices.map(v => (
                  <div 
                    key={v} 
                    className={`${styles.voiceChip} ${activeVoice === v ? styles.voiceChipActive : ''}`}
                    onClick={() => setActiveVoice(v)}
                  >
                    <div className={styles.voiceDot}></div>{v}
                  </div>
                ))}
              </div>
              <div className={styles.waveformWrap}>
                <div className={styles.waveformMini}>
                  {[...Array(24)].map((_, i) => <div key={i} className={styles.wb}></div>)}
                </div>
                <div className={styles.waveformTime}>0:23 / 0:46</div>
              </div>
              <div className={styles.demoControls}>
                <button className={styles.demoGenBtn}>Generate audio</button>
                <span className={styles.demoMeta}>286 chars used</span>
              </div>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <div className={styles.heroStatN}>29+</div>
                <div className={styles.heroStatL}>Languages</div>
              </div>
              <div className={styles.heroStat} style={{ borderLeft: '1px solid var(--line)' }}>
                <div className={styles.heroStatN}>∞</div>
                <div className={styles.heroStatL}>Voices included</div>
              </div>
              <div className={styles.heroStat} style={{ borderLeft: '1px solid var(--line)' }}>
                <div className={styles.heroStatN}>&lt;1s</div>
                <div className={styles.heroStatL}>Generation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className={styles.creatorBar}>
        <div className={styles.marqueeTrack}>
          {['YouTubers', 'Podcasters', 'TikTokers', 'Audiobook Authors', 'Faceless Creators', 'Content Agencies', 'Course Creators'].map((cat, i) => (
            <div key={i} className={styles.marqueeItem}><span className={styles.mi}>✦</span> {cat}</div>
          ))}
          {['YouTubers', 'Podcasters', 'TikTokers', 'Audiobook Authors', 'Faceless Creators', 'Content Agencies', 'Course Creators'].map((cat, i) => (
            <div key={i+10} className={styles.marqueeItem}><span className={styles.mi}>✦</span> {cat}</div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className={styles.features} id="features">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Features</p>
              <h2 className={styles.sectionTitle}>Everything you need.<br />Nothing you don't.</h2>
            </div>
            <p className={styles.sectionDesc}>One platform for all your voice production needs — from a single line to a full audiobook, we've got it covered.</p>
          </div>

          <div className={styles.featuresGrid}>
            <Feature tag="Core" title="Text to Speech" desc="Generate natural, expressive AI voiceovers from any text. Control speed, pitch, emotion and tone with fine-grained settings." icon="🗣️" num="01" type="accent" span="featA" />
            <Feature tag="Popular" title="Voice Cloning" desc="Clone any voice from just a 10-second sample. Create your signature voice and use it everywhere." icon="🎭" num="02" type="violet" span="featB" />
            <Feature tag="Global" title="29 Languages" desc="Native support for major global languages including English, Arabic, Spanish, and more." icon="🌍" num="03" span="featC" />
            <Feature tag="New" title="Audiobooks" desc="Turn full manuscripts into chapter-marked audiobooks with a single click." icon="📚" num="04" span="featD" />
            <Feature tag="Transcription" title="Voice to Text" desc="Transcribe any audio or video to accurate, timestamped text. Perfect for repurposing content." icon="🎤" num="05" span="featE" />
            <Feature tag="Pro" title="Priority Queue" desc="Creator & Pro plans skip the line. Your audio is done before everyone else's." icon="⚡" num="06" type="accent" span="featF" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.how}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>How it works</p>
              <h2 className={styles.sectionTitle}>Paste. Pick a voice.<br />Download your audio.</h2>
            </div>
            <p className={styles.sectionDesc}>FlashTTS is designed to get out of your way. From pasting your script to downloading your audio — it takes under 60 seconds.</p>
          </div>
          <div className={styles.stepsGrid}>
            <Step n="01" title="Paste your script" desc="Type or paste any text — a YouTube script, a product description, or script. Any length works." />
            <Step n="02" title="Choose your voice" desc="Browse unlimited free voices or use your own cloned voice. Pick language, accent, and speed." />
            <Step n="03" title="Generate & download" desc="Hit generate. Your studio-quality audio is ready in seconds. Export as MP3 or WAV." hasArrow={false} />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Pricing</p>
              <h2 className={styles.sectionTitle}>Start free.<br />Scale as you grow.</h2>
            </div>
            <div>
              <p className={styles.sectionDesc}>No hidden fees. No character traps. Cancel anytime.</p>
              <div className={styles.pricingToggle}>
                <div className={styles.toggleBtn}>
                  <button className={!isYearly ? styles.active : ''} onClick={() => setIsYearly(false)}>Monthly</button>
                  <button className={isYearly ? styles.active : ''} onClick={() => setIsYearly(true)}>Yearly</button>
                </div>
                <span className={styles.saveBadge}>Save 20%</span>
              </div>
            </div>
          </div>

          <div className={styles.plans}>
            <Plan name="Free" price="0" priceYearly="0" chars="10,000 chars / 10 mins" features={[
              "Max 500 chars per generation",
              "Up to ~20 generations",
              "0 voice clones",
              "5–8 basic voices only",
              "Slow generation speed",
              "Watermark on audio"
            ]} cta="Try for Free" isYearly={isYearly} />
            <Plan name="Starter" price="9" priceYearly="7" chars="200,000 chars / 200 mins" features={[
              "Max 3,000 chars per generation",
              "~65 generations",
              "2 voice clones",
              "20–30 standard voices",
              "Normal generation speed",
              "No watermark"
            ]} cta="Get Started" isYearly={isYearly} />
            <Plan name="Creator" price="19" priceYearly="15" chars="500,000 chars / 500 mins" features={[
              "Max 5,000 chars per generation",
              "~100 generations",
              "5 voice clones",
              "50+ voices with emotions",
              "Fast generation speed",
              "High-quality audio export"
            ]} isFeatured={true} cta="Start Creating" isYearly={isYearly} />
            <Plan name="Pro" price="39" priceYearly="31" chars="1,000,000 chars / 1000 mins" features={[
              "Max 10,000 chars per generation",
              "~100 generations",
              "9 voice clones",
              "100+ premium voices",
              "Priority processing",
              "All export formats"
            ]} cta="Upgrade to Pro" isYearly={isYearly} />
            <Plan name="Studio" price="79" priceYearly="63" chars="3,000,000 chars / 3000 mins" features={[
              "Max 20,000 chars per generation",
              "~150 generations",
              "15 voice clones",
              "Full library + exclusive voices",
              "API access & Team collab",
              "Commercial usage rights"
            ]} cta="Start Studio Plan" isYearly={isYearly} />
          </div>
        </div>
      </section>

      {/* ── COMPARE ── */}
      <section className={styles.compare} id="compare">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Compare</p>
              <h2 className={styles.sectionTitle}>How we stack up<br />against the big names.</h2>
            </div>
            <p className={styles.sectionDesc}>ElevenLabs and Play.ht charge a premium for features that FlashTTS includes by default — even on the free plan.</p>
          </div>

          <div className={styles.compareWrap}>
            <table className={styles.ct}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className={styles.flash}>⚡ FlashTTS</th>
                  <th>ElevenLabs</th>
                  <th>Play.ht</th>
                  <th>Murf AI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Free plan available</td>
                  <td className={styles.flash}><span className={styles.ctBest}>Yes — 10K/mo</span></td>
                  <td>✓ 10K/mo</td>
                  <td><span>Limited</span></td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Voice cloning on free</td>
                  <td className={styles.flash}><span className={styles.ctYes}>✓</span></td>
                  <td><span className={styles.ctNo}>✕</span></td>
                  <td><span className={styles.ctNo}>✕</span></td>
                  <td><span className={styles.ctNo}>✕</span></td>
                </tr>
                <tr>
                  <td>Starting price</td>
                  <td className={styles.flash}><span className={styles.ctBest}>$0 free</span></td>
                  <td>$5/mo</td>
                  <td>$31/mo</td>
                  <td>$19/mo</td>
                </tr>
                {/* More rows can be added here */}
              </tbody>
            </table>
          </div>
        </div>
      </section>


      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2>Start making content<br /><em>that sounds great.</em></h2>
          <p>Free plan includes 10,000 characters every month. No credit card needed.</p>
          <div className={styles.ctaBtns}>
            <Link href="/signup" className={styles.btnCtaWhite}>⚡ Get started free</Link>
            <Link href="#pricing" className={styles.btnCtaOutline}>View pricing</Link>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
