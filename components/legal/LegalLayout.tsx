'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  badge: string;
  lastUpdated?: string;
}

export default function LegalLayout({ children, title, badge, lastUpdated }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#faf8f3] font-['Geist',sans-serif] selection:bg-[#ff4d1c] selection:text-white">
      
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container max-w-[860px] mx-auto px-6">
          {/* Page Header */}
          <div className="mb-12">
            <span className="inline-flex px-3 py-1 bg-[#fef3c7] text-[#92400e] text-[11px] font-black uppercase tracking-[0.15em] rounded-full mb-6 shadow-sm">
              {badge}
            </span>
            <h1 className="text-4xl md:text-[52px] font-extrabold font-['Instrument_Serif'] leading-[1.1] text-[#0a0a0f] mb-6 tracking-tight">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-[13px] font-bold text-[#9ca3af] uppercase tracking-widest">
                Last Updated: {lastUpdated}
              </p>
            )}
          </div>

          {/* Content Area */}
          <div className="legal-content">
            {children}
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .legal-content {
          font-family: 'Geist', sans-serif;
          font-size: 16px;
          line-height: 1.8;
          color: #6b6878;
        }
        .legal-content h2 {
          font-family: 'Instrument Serif', serif;
          font-size: 32px;
          font-weight: 700;
          color: #0a0a0f;
          margin-bottom: 24px;
          margin-top: 48px;
        }
        .legal-content h3 {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          font-weight: 700;
          color: #0a0a0f;
          margin-bottom: 16px;
          margin-top: 32px;
        }
        .legal-content p {
          color: #6b6878;
          margin-bottom: 20px;
        }
        .legal-content ul {
          color: #6b6878;
          margin-bottom: 20px;
          padding-left: 1.5rem;
          list-style-type: disc;
        }
        .legal-content li {
          margin-bottom: 10px;
        }
        .legal-content a {
          color: #ff4d1c;
          transition: all 0.2s;
          font-weight: 600;
        }
        .legal-content a:hover {
          text-decoration: underline;
        }
        .legal-content strong {
          color: #0a0a0f;
          font-weight: 700;
        }
        .highlight-box {
          background: #fff5f2;
          border-left: 4px solid #ff4d1c;
          padding: 1.25rem;
          border-radius: 0 16px 16px 0;
          margin: 2rem 0;
          color: #0a0a0f;
          font-weight: 500;
        }
        .highlight-box-red {
          background: #fee2e2;
          border-left: 4px solid #fca5a5;
          padding: 1rem;
          border-radius: 0 12px 12px 0;
          margin: 1.5rem 0;
          color: #991b1b;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
