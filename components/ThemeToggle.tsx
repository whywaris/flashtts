'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/dashboard/layout';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '7px 14px',
        borderRadius: '100px',
        background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : '1px solid rgba(0,0,0,0.1)',
        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
        fontSize: '12.5px',
        fontWeight: 600,
        fontFamily: 'DM Sans, sans-serif',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    >
      {isDark ? (
        <>
          <Sun size={13} strokeWidth={2} />
          Light
        </>
      ) : (
        <>
          <Moon size={13} strokeWidth={2} />
          Dark
        </>
      )}
    </button>
  );
}
