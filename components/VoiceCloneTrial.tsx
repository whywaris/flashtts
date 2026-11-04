'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mic, Square, Play, Pause, Zap, CheckCircle2, UploadCloud, RotateCcw } from 'lucide-react';
import styles from './VoiceCloneTrial.module.css';

const WAVE_BARS = [12, 24, 16, 30, 36, 22, 14, 28, 32, 18, 26, 15];
const SAMPLE_AUDIO_URL = 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3';

export default function VoiceCloneTrial() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'result'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const startRecording = async () => {
    setStatus('recording');
    setSecondsLeft(10);
    audioChunksRef.current = [];

    // Attempt real browser mic recording if supported & permitted
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setUserAudioUrl(url);
          }
          // Stop media stream tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      }
    } catch {
      // If mic is denied or unsupported, smoothly proceed in interactive demo mode
      mediaRecorderRef.current = null;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          finishRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setStatus('processing');

    setTimeout(() => {
      setStatus('result');
    }, 2600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setUserAudioUrl(url);
      setStatus('processing');
      setTimeout(() => {
        setStatus('result');
      }, 2600);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        setUserAudioUrl(url);
        setStatus('processing');
        setTimeout(() => {
          setStatus('result');
        }, 2600);
      }
    }
  };

  const togglePlay = () => {
    const playSrc = userAudioUrl || SAMPLE_AUDIO_URL;

    if (!audioRef.current || audioRef.current.src !== playSrc) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(playSrc);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setUserAudioUrl(null);
    setSecondsLeft(10);
    setStatus('idle');
  };

  if (!mounted) {
    return (
      <div className={styles.trialContainer}>
        <div className={styles.trialHeader}>
          <span className={styles.trialLabel}>Interactive Demo</span>
          <h3 className={styles.trialTitle}>Experience the magic of instant cloning.</h3>
        </div>
        <div className={styles.recordZone}>
          <div className={styles.timer}>00:10</div>
          <p className={styles.recordHint}>Record a 10-second sample</p>
          <button className={styles.recordBtn} aria-label="Start Recording" type="button">
            <Mic color="#fff" size={28} />
          </button>
        </div>
        <p className={styles.trialFootnote}>
          Interactive demo only - not real voice cloning. Full cloning available after signup.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.trialContainer}>
      <div className={styles.trialHeader}>
        <span className={styles.trialLabel}>Interactive Demo</span>
        <h3 className={styles.trialTitle}>Experience the magic of instant cloning.</h3>
      </div>

      {/* Mode Switcher Tabs */}
      {status === 'idle' && (
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'record' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('record')}
          >
            <Mic size={15} />
            Record Sample
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'upload' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={15} />
            Upload Audio
          </button>
        </div>
      )}

      {/* ── RECORD TAB: IDLE ── */}
      {status === 'idle' && activeTab === 'record' && (
        <div className={styles.recordZone}>
          <div className={styles.timer}>00:10</div>
          <p className={styles.recordHint}>Record a 10-second sample</p>
          <button
            className={styles.recordBtn}
            onClick={startRecording}
            aria-label="Start Recording"
            type="button"
          >
            <Mic color="#fff" size={28} />
          </button>
        </div>
      )}

      {/* ── UPLOAD TAB: IDLE ── */}
      {status === 'idle' && activeTab === 'upload' && (
        <div
          className={`${styles.uploadZone} ${isDragging ? styles.uploadZoneActive : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="audio/mp3,audio/wav,audio/m4a,audio/webm,audio/ogg"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <div className={styles.uploadIconWrap}>
            <UploadCloud size={24} />
          </div>
          <p className={styles.uploadTitle}>Drop audio file here</p>
          <p className={styles.uploadSub}>MP3, WAV, or M4A (up to 10MB)</p>
          <button
            type="button"
            className={styles.browseBtn}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </button>
        </div>
      )}

      {/* ── RECORDING STATE ── */}
      {status === 'recording' && (
        <div className={`${styles.recordZone} ${styles.recordZoneActive}`}>
          <div className={`${styles.timer} ${styles.timerActive}`}>
            00:{String(secondsLeft).padStart(2, '0')}
          </div>
          <div className={styles.waveContainer}>
            {WAVE_BARS.map((h, i) => (
              <div
                key={i}
                className={`${styles.waveBar} ${styles.waveBarActive}`}
                style={{
                  animationDelay: `${i * 0.08}s`,
                  height: `${h}px`
                }}
              />
            ))}
          </div>
          <button
            className={`${styles.recordBtn} ${styles.recordBtnActive}`}
            onClick={finishRecording}
            aria-label="Stop Recording"
            type="button"
          >
            <Square fill="#fff" color="#fff" size={22} />
          </button>
        </div>
      )}

      {/* ── PROCESSING STATE ── */}
      {status === 'processing' && (
        <div className={styles.processing}>
          <div className={styles.spinner} />
          <p className={styles.processingText}>Analyzing voice DNA...</p>
          <p className={styles.processingSub}>Extracting timbre, pitch contour, and speech cadence.</p>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} />
          </div>
        </div>
      )}

      {/* ── RESULT STATE ── */}
      {status === 'result' && (
        <div className={styles.result}>
          <div className={styles.successBadge}>
            <CheckCircle2 size={13} />
            Clone Preview Ready
          </div>
          <h4 className={styles.resultTitle}>Voice Cloned Successfully</h4>
          <p className={styles.resultSub}>
            Listen to your cloned audio sample below or unlock full studio generation.
          </p>

          <button className={styles.playBtn} onClick={togglePlay} type="button">
            {isPlaying ? <Pause fill="#fff" size={18} /> : <Play fill="#fff" size={18} />}
            {isPlaying ? 'Stop Audio Preview' : 'Play Cloned Audio Preview'}
          </button>

          <Link href="/signup" className={styles.ctaBtn}>
            <Zap size={16} fill="currentColor" />
            Save Voice & Open Studio Free
          </Link>

          <button className={styles.resetBtn} onClick={handleReset} type="button">
            <RotateCcw size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Try another voice sample
          </button>
        </div>
      )}

      <p className={styles.trialFootnote}>
        Interactive demo only - not real voice cloning. Full cloning available after signup.
      </p>
    </div>
  );
}
