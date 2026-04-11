'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function VoiceCloningPage() {
  return (
    <div style={{ background: '#faf8f3', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
        <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '100px',
            background: 'rgba(255, 77, 28, 0.1)',
            color: '#ff4d1c',
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px'
          }}>
            New Feature
          </div>
          
          <h1 style={{ 
            fontFamily: 'Instrument Serif, serif',
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            lineHeight: 1,
            color: '#0a0a0f',
            marginBottom: '24px'
          }}>
            Voice Cloning <br />
            <em style={{ color: '#ff4d1c', fontStyle: 'italic' }}>Coming Soon.</em>
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem',
            lineHeight: 1.6,
            color: '#6b6878',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            Create an identical AI clone of your voice with just a short sample. 
            Perfect for consistent branding and faceless content creation.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ 
              padding: '14px 32px',
              background: '#0a0a0f',
              color: '#fff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'transform 0.2s'
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
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}>
              Join Waitlist
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
