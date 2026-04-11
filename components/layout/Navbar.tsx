'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import styles from './layout.module.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <div className={styles.navLogoMark}>F</div>
            <span>FlashTTS</span>
          </Link>
          
          <ul className={styles.navLinks}>
            <li><Link href="/voice-cloning">Voice Cloning</Link></li>
            <li><Link href="/audiobook">Audiobook</Link></li>
            <li><Link href="/#pricing">Pricing</Link></li>
            <li><Link href="/#features">Features</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>

          <div className={styles.navRight}>
            <Link href="/login" className={styles.btnSmGhost}>Log in</Link>
            <Link href="/signup" className={styles.btnSmFill}>Start free →</Link>
          </div>

          <button className={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE OVERLAY ── */}
      <div className={`${styles.mobileOverlay} ${isMenuOpen ? styles.mobileOverlayOpen : ''}`}>
        <div className={styles.container} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Link href="/voice-cloning" onClick={() => setIsMenuOpen(false)} className={styles.mobileLink}>Voice Cloning</Link>
          <Link href="/audiobook" onClick={() => setIsMenuOpen(false)} className={styles.mobileLink}>Audiobook</Link>
          <Link href="/#pricing" onClick={() => setIsMenuOpen(false)} className={styles.mobileLink}>Pricing</Link>
          <Link href="/#features" onClick={() => setIsMenuOpen(false)} className={styles.mobileLink}>Features</Link>
          <Link href="/blog" onClick={() => setIsMenuOpen(false)} className={styles.mobileLink}>Blog</Link>
          
          <hr style={{ border: 'none', borderTop: '1px solid rgba(10,10,15,0.08)', margin: '10px 0' }} />
          <Link href="/login" className={styles.btnSmGhost} style={{ textAlign: 'center' }}>Log in</Link>
          <Link href="/signup" className={styles.btnSmFill} style={{ textAlign: 'center' }}>Start free →</Link>
        </div>
      </div>
    </>
  );
}
