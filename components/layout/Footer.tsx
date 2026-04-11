import Link from 'next/link';
import styles from './layout.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <div className={styles.footerLogo}>
              <div className={styles.navLogoMark}>F</div>
              <span>FlashTTS</span>
            </div>
            <p className={styles.footerDesc}>
              High-fidelity AI voices for creators. Professional audio in seconds.
            </p>
          </div>
          
          <div className={styles.footerCol}>
            <h4>Product</h4>
            <ul>
              <li><Link href="/">Text to Speech</Link></li>
              <li><Link href="/voice-cloning">Voice Cloning</Link></li>
              <li><Link href="/audiobook">Audiobook</Link></li>
              <li><Link href="/#pricing">Pricing</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerCol}>
            <h4>Legal</h4>
            <ul>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/refund">Refund Policy</Link></li>
              <li><Link href="/voice-cloning-policy">Voice Cloning Policy</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerCol}>
            <h4>Social</h4>
            <ul>
              <li><Link href="https://x.com/flashtts">X</Link></li>
              <li><Link href="https://github.com/flashtts">Github</Link></li>
              <li><Link href="https://www.youtube.com/@flashtts">YouTube</Link></li>
              <li><Link href="https://www.linkedin.com/company/flashtts">LinkedIn</Link></li>
              <li><Link href="https://www.facebook.com/flashtts">Facebook</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Footer bottom space removed */}
      </div>
    </footer>
  );
}
