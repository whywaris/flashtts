import type { Metadata } from 'next';
import DashboardLayoutClient from './DashboardLayoutClient';

export const metadata: Metadata = {
    title: { default: 'Dashboard — FlashTTS', template: '%s — FlashTTS' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                *, *::before, *::after { box-sizing: border-box; }
                * { font-family: 'Inter', sans-serif; }

                /* ── Light mode (default) ── */
                :root {
                    --bg:           #F5F3EF;
                    --text:         #111118;
                    --accent:       #2DD4BF;
                    --muted:        #6B7280;
                    --faint:        #9CA3AF;
                    --border:       rgba(0,0,0,0.07);
                    --hover:        rgba(0,0,0,0.035);
                    --glass:        rgba(0,0,0,0.01);
                    --card-bg:      #FFFFFF;
                    --card-border:  rgba(0,0,0,0.07);
                    --sidebar-bg:   #FFFFFF;
                    --surface:      #F9F9F7;
                    --accent-dim:   rgba(45,212,191,0.1);
                    --accent-ring:  rgba(45,212,191,0.2);
                }

                /* ── Dark mode ── */
                [data-theme="dark"] {
                    --bg:           #0A0A0F;
                    --text:         #F0F0F5;
                    --muted:        #8888A0;
                    --faint:        #3A3A50;
                    --border:       rgba(255,255,255,0.06);
                    --hover:        rgba(255,255,255,0.035);
                    --glass:        rgba(255,255,255,0.03);
                    --card-bg:      #1A1A24;
                    --card-border:  rgba(255,255,255,0.06);
                    --sidebar-bg:   #111118;
                    --surface:      #111118;
                    --accent-dim:   rgba(45,212,191,0.08);
                    --accent-ring:  rgba(45,212,191,0.18);
                }

                html, body { background: var(--bg); color: var(--text); transition: background 0.2s ease, color 0.2s ease; }

                ::-webkit-scrollbar        { width: 5px; height: 5px; }
                ::-webkit-scrollbar-track  { background: transparent; }
                ::-webkit-scrollbar-thumb  { background: rgba(128,128,128,0.2); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.3); }

                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
            <div style={{ minHeight: '100vh' }}>
                <DashboardLayoutClient>
                    {children}
                </DashboardLayoutClient>
            </div>
        </>
    );
}
