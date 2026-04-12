'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AudiobookPage() {
  return (
    <div style={{ background: '#faf8f3', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
        <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '100px',
            background: 'rgba(168, 85, 247, 0.1)',
            color: '#a855f7',
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px'
          }}>
            Coming Very Soon
          </div>

          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            lineHeight: 1,
            color: '#0a0a0f',
            marginBottom: '24px'
          }}>
            AI Audiobooks <br />
            <em style={{ color: '#a855f7', fontStyle: 'italic' }}>New Era of Publishing.</em>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            lineHeight: 1.6,
            color: '#6b6878',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            Convert entire manuscripts into high-quality audiobooks in minutes.
            Multi-chapter support, automated narration, and studio-grade output.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              padding: '14px 32px',
              background: '#0a0a0f',
              color: '#fff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem'
            }}>
              Back to Home
            </Link>
            <Link href="/signup" style={{
              padding: '14px 32px',
              background: 'transparent',
              color: '#0a0a0f',
              borderRadius: '10px',
              textDecoration: 'none',
              border: '1px solid rgba(10, 10, 15, 0.2)',
              fontWeight: 600,
              fontSize: '1rem'
            }}>
              Early Access
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
