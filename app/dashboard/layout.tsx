'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import DashboardLayoutClient from './DashboardLayoutClient';

export const ThemeContext = createContext({
    isDark: true,
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light') setIsDark(false);
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            root.style.setProperty('--bg', '#080810');
            root.style.setProperty('--text', '#f0f0f8');
            root.style.setProperty('--accent', '#f5c518');
            root.style.setProperty('--muted', '#7a7a9a');
            root.style.setProperty('--border', 'rgba(255,255,255,0.08)');
            root.style.setProperty('--glass', 'rgba(255,255,255,0.04)');
            root.style.setProperty('--card-bg', 'rgba(255,255,255,0.04)');
            root.style.setProperty('--card-border', 'rgba(255,255,255,0.08)');
            root.style.setProperty('--text-primary', '#f0f0f8');
            root.style.setProperty('--text-secondary', '#7a7a9a');
            root.style.setProperty('--text-muted', '#383858');
        } else {
            root.classList.remove('dark');
            root.style.setProperty('--bg', '#ffffff');
            root.style.setProperty('--text', '#080810');
            root.style.setProperty('--accent', '#f5c518');
            root.style.setProperty('--muted', '#666666');
            root.style.setProperty('--border', 'rgba(0,0,0,0.08)');
            root.style.setProperty('--glass', 'rgba(0,0,0,0.02)');
            root.style.setProperty('--card-bg', 'rgba(0,0,0,0.02)');
            root.style.setProperty('--card-border', 'rgba(0,0,0,0.08)');
            root.style.setProperty('--text-primary', '#080810');
            root.style.setProperty('--text-secondary', '#666666');
            root.style.setProperty('--text-muted', '#999999');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            <div style={{ 
                background: 'var(--bg)', 
                color: 'var(--text)', 
                transition: 'background 0.2s, color 0.2s', 
                minHeight: '100vh' 
            }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
                    
                    :root {
                        --font-serif: 'Instrument Serif', serif;
                        --font-sans: 'Geist', sans-serif;
                    }

                    .nav-link-hover:hover {
                        background: rgba(128,128,128,0.08) !important;
                        color: var(--text) !important;
                        opacity: 0.85;
                    }
                    .sign-out-btn:hover {
                        color: rgba(255,80,80,0.8) !important;
                        background: rgba(255,80,80,0.08) !important;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
                <DashboardLayoutClient>
                    {children}
                </DashboardLayoutClient>
            </div>
        </ThemeContext.Provider>
    );
}