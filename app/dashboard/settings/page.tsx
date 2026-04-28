'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, AlertTriangle, Lock, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const T = {
  bg:      'var(--bg)',
  card:    'var(--card-bg)',
  surface: 'var(--surface)',
  accent:  '#2DD4BF',
  border:  'var(--border)',
  text:    'var(--text)',
  muted:   'var(--muted)',
};

const PLAN_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  free:    { bg: 'rgba(136,136,160,0.15)', color: '#8888A0', label: 'Free' },
  starter: { bg: 'rgba(59,130,246,0.15)',  color: '#60A5FA', label: 'Starter' },
  creator: { bg: 'rgba(45,212,191,0.15)',  color: '#2DD4BF', label: 'Creator' },
  pro:     { bg: 'rgba(168,85,247,0.15)',  color: '#C084FC', label: 'Pro' },
  studio:  { bg: 'rgba(234,179,8,0.15)',   color: '#FACC15', label: 'Studio' },
};

function formatNumber(n: number | null | undefined) {
  if (n == null) return '—';
  return n.toLocaleString();
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [dangerZoneExpanded, setDangerZoneExpanded] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteAudioModal, setShowDeleteAudioModal] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setEmail(user.email || '');
        setUsername(profileData.username || '');
      }
      setLoading(false);
    }
    init();
  }, [router, supabase]);

  const initials = useMemo(() => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.[0]?.toUpperCase() || 'U';
  }, [fullName]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: fullName, username, updated_at: new Date().toISOString() }).eq('id', profile.id);
      if (error) throw error;
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setUpdatingPassword(true);
    try {
      const { error: reAuthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
      if (reAuthError) throw new Error('Current password is incorrect');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAudio = async () => {
    try {
      const { error } = await supabase.from('tts_jobs').delete().eq('user_id', profile.id);
      if (error) throw error;
      toast.success('Audio history deleted');
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setShowDeleteAudioModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    await supabase.auth.signOut();
    toast.error('Contact support@flashtts.com to delete your account.', { duration: 6000 });
    router.push('/login');
  };

  if (loading) return null;

  const plan = profile?.plan || 'free';
  const badge = PLAN_BADGE[plan] ?? PLAN_BADGE.free;

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '11px 14px',
    color: T.text,
    outline: 'none',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: T.muted,
    marginBottom: 7,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: T.muted,
    margin: '0 0 20px',
  };

  const cardStyle: React.CSSProperties = {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: 24,
  };

  const primaryBtn: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: 8,
    background: T.accent,
    color: '#0A0A0F',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s, transform 0.1s',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 980 }}>
      <Toaster position="top-right" toastOptions={{ style: { background: T.card, color: T.text, border: `1px solid ${T.border}` } }} />


      {/* Delete audio modal */}
      {showDeleteAudioModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, width: 'min(400px,90vw)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: T.text, margin: '0 0 10px' }}>Delete Audio History?</h3>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 24px', lineHeight: 1.6 }}>This will permanently delete all your generated audio files. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteAudioModal(false)} style={{ flex: 1, padding: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteAudio} style={{ flex: 1, padding: 12, background: '#ef4444', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* 2-column grid */}
      <div className="settings-grid">

        {/* ── LEFT COLUMN (60%) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile card */}
          <div style={cardStyle}>
            <p style={sectionLabel}>PROFILE</p>

            {/* Avatar centered */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div
                className="avatar-circle"
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(45,212,191,0.2)',
                  border: '2px solid #2DD4BF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 800, color: T.accent,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <button
                onClick={() => toast('Photo upload coming soon!', { icon: '📸' })}
                style={{ background: 'none', border: 'none', color: T.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' }}
              >
                Change Photo
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  className="settings-input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  style={inputBase}
                  autoComplete="off"
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={email}
                    readOnly
                    style={{ ...inputBase, background: `${T.surface}80`, color: T.muted, cursor: 'not-allowed', paddingRight: 40 }}
                  />
                  <Lock size={14} color={T.muted} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: 11, color: T.muted, marginTop: 5, opacity: 0.6 }}>Cannot be changed</p>
              </div>

              <div>
                <label style={labelStyle}>Username</label>
                <input
                  className="settings-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="@username"
                  style={inputBase}
                  autoComplete="off"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                style={{ ...primaryBtn, opacity: savingProfile ? 0.65 : 1 }}
                className="teal-btn"
              >
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Password card */}
          <div style={cardStyle}>
            <p style={sectionLabel}>PASSWORD</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([
                { label: 'Current Password', val: currentPassword, set: setCurrentPassword, show: showCurrentPw, toggle: () => setShowCurrentPw(p => !p) },
                { label: 'New Password',     val: newPassword,     set: setNewPassword,     show: showNewPw,     toggle: () => setShowNewPw(p => !p) },
                { label: 'Confirm Password', val: confirmPassword, set: setConfirmPassword, show: showConfirmPw, toggle: () => setShowConfirmPw(p => !p) },
              ] as const).map(({ label, val, set, show, toggle }) => (
                <div key={label} style={{ position: 'relative' }}>
                  <input
                    type={show ? 'text' : 'password'}
                    placeholder={label}
                    value={val}
                    onChange={e => set(e.target.value)}
                    className="settings-input"
                    autoComplete="new-password"
                    style={{ ...inputBase, paddingRight: 44 }}
                  />
                  <button
                    onClick={toggle}
                    type="button"
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: T.muted, cursor: 'pointer', display: 'flex', padding: 0 }}
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              ))}

              <button
                onClick={handleUpdatePassword}
                disabled={updatingPassword || !currentPassword || !newPassword || !confirmPassword}
                style={{ ...primaryBtn, opacity: (updatingPassword || !currentPassword || !newPassword || !confirmPassword) ? 0.4 : 1 }}
                className="teal-btn"
              >
                {updatingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (40%) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Account Info card */}
          <div style={cardStyle}>
            <p style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: '0 0 20px' }}>Account Info</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Email',             value: email },
                { label: 'Member Since',      value: formatDate(profile?.created_at) },
                { label: 'Characters Used',   value: formatNumber(profile?.credits_used) },
                { label: 'Characters Limit',  value: formatNumber(profile?.credits_limit) },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
                  }}
                >
                  <span style={{ fontSize: 12, color: T.muted }}>{label}</span>
                  <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{value}</span>
                </div>
              ))}

              {/* Current Plan row with badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 12, color: T.muted }}>Current Plan</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: badge.bg, color: badge.color,
                  letterSpacing: '0.04em',
                }}>
                  {badge.label}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/billing')}
              style={{
                width: '100%', marginTop: 18, padding: '11px',
                borderRadius: 8, background: 'transparent',
                border: `1px solid ${T.accent}`, color: T.accent,
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 0.2s',
              }}
              className="outline-btn"
            >
              <Zap size={14} />
              Upgrade Plan
            </button>
          </div>

          {/* Danger Zone card */}
          <div style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12,
            padding: dangerZoneExpanded ? 24 : 18,
            overflow: 'hidden',
            transition: 'padding 0.2s',
          }}>
            <button
              onClick={() => setDangerZoneExpanded(!dangerZoneExpanded)}
              style={{ width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ef4444', fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} /> Danger Zone
              </div>
              {dangerZoneExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {dangerZoneExpanded && (
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => setShowDeleteAudioModal(true)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Delete All Generated Audio
                </button>

                <div style={{ borderTop: '1px solid rgba(239,68,68,0.12)', paddingTop: 16, marginTop: 4 }}>
                  <p style={{ fontSize: 12, color: T.muted, marginBottom: 10, lineHeight: 1.6 }}>
                    Type <strong style={{ color: T.text }}>DELETE</strong> to confirm account deletion
                  </p>
                  <input
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    style={{ width: '100%', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: T.text, outline: 'none', marginBottom: 10, fontSize: 14, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                    autoComplete="off"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE'}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed', border: 'none', opacity: deleteConfirmText !== 'DELETE' ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: 60fr 40fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 720px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
        input::placeholder { color: rgba(136,136,160,0.5); }
        .settings-input:focus { border-color: #2DD4BF !important; }
        .teal-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 18px rgba(45,212,191,0.25); }
        .outline-btn:hover { background: rgba(45,212,191,0.08) !important; }
      `}</style>
    </div>
  );
}
