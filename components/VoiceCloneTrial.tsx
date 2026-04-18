'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mic, Square, Play, Pause, Check, Zap, Loader2 } from 'lucide-react';
import styles from './VoiceCloneTrial.module.css';

export default function VoiceCloneTrial() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'result'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = () => {
    setStatus('recording');
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev >= 10) {
          stopRecording();
          return 10;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('processing');
    setTimeout(() => {
      setStatus('result');
    }, 3000);
  };

  const togglePlay = () => {
    if (!audioRef.current) {
        // High quality sample URL - using a placeholder for now
        audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
        audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return (
    <div className={styles.trialContainer}>
      <div className={styles.trialHeader}>
        <span className={styles.trialLabel}>Interactive Demo</span>
        <h3 className={styles.trialTitle}>Experience the magic of instant cloning.</h3>
      </div>

      {status === 'idle' && (
        <div className={styles.recordZone}>
          <div className={styles.timer}>00:10</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Record a 10-second sample</p>
          <button className={styles.recordBtn} onClick={startRecording}>
            <Mic color="#fff" size={28} />
          </button>
        </div>
      )}

      {status === 'recording' && (
        <div className={`${styles.recordZone} ${styles.recordZoneActive}`}>
          <div className={`${styles.timer} ${styles.timerActive}`}>
            00:{String(10 - seconds).padStart(2, '0')}
          </div>
          <div className={styles.waveContainer}>
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className={`${styles.waveBar} ${styles.waveBarActive}`}
                style={{ animationDelay: `${i * 0.1}s`, height: `${10 + Math.random() * 20}px` }}
              />
            ))}
          </div>
          <button className={`${styles.recordBtn} ${styles.recordBtnActive}`} onClick={stopRecording}>
            <Square fill="#fff" color="#fff" size={24} />
          </button>
        </div>
      )}

      {status === 'processing' && (
        <div className={styles.processing}>
          <div className={styles.spinner}></div>
          <p className={styles.processingText}>Analyzing voice DNA...</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Extracting pitch, tone, and inflection patterns.</p>
        </div>
      )}

      {status === 'result' && (
        <div className={styles.result}>
          <div className={styles.successIcon}>✨</div>
          <p className={styles.resultText}>Demo Preview Ready</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0 0 12px', textAlign: 'center' }}>
            This is a sample audio preview. Real voice cloning is available in the studio after signup.
          </p>

          <button className={styles.playBtn} onClick={togglePlay}>
            {isPlaying ? <Pause fill="#fff" size={20} /> : <Play fill="#fff" size={20} />}
            {isPlaying ? 'Stop Preview' : 'Play Sample Preview'}
          </button>

          <Link href="/signup" className={styles.ctaBtn}>
            <Zap size={18} fill="currentColor" style={{ marginRight: '8px' }} />
            Save this Voice & Use in Studio
          </Link>
          <button 
            onClick={() => setStatus('idle')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--muted)', 
              fontSize: '0.85rem', 
              marginTop: '16px', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
        Interactive demo only — not real voice cloning. Full cloning available after signup.
      </div>
    </div>
  );
}
