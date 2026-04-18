'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  Check, 
  Eye, 
  EyeOff, 
  Zap, 
  AlertTriangle, 
  Lock, 
  User, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  CreditCard,
  Trash2,
  Mail
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getAvatarBackdrop } from '@/utils/avatar';

// ─── Plan Feature Mapping ───────────────────────────────────────────────────
const PLAN_DATA: Record<string, { label: string; chars: string; clones: string; voices: string }> = {
  free: { 
    label: 'Free Plan', 
    chars: '10,000 chars/mo', 
    clones: '1 clone', 
    voices: 'Basic voices' 
  },
  starter: { 
    label: 'Starter Plan', 
    chars: '200,000 chars/mo', 
    clones: '2 clones', 
    voices: '20-30 voices' 
  },
  creator: { 
    label: 'Creator Plan', 
    chars: '500,000 chars/mo', 
    clones: '5 clones', 
    voices: '50+ voices' 
  },
  pro: { 
    label: 'Pro Plan', 
    chars: '1,000,000 chars/mo', 
    clones: '9 clones', 
    voices: '100+ voices' 
  },
  studio: { 
    label: 'Studio Plan', 
    chars: '3,000,000 chars/mo', 
    clones: '15 clones', 
    voices: 'Full library' 
  },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Profile State
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // UI State
  const [dangerZoneExpanded, setDangerZoneExpanded] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteAudioModal, setShowDeleteAudioModal] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

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
    return parts.length >= 1 ? parts[0][0].toUpperCase() : 'U';
  }, [fullName]);

  const avatarBg = useMemo(() => getAvatarBackdrop(fullName || 'User'), [fullName]);

  // Handle Profile Update
  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error('Error updating profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      // Re-authenticate
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (reAuthError) throw new Error('Current password is incorrect');

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAudio = async () => {
    try {
      const { error } = await supabase
        .from('tts_jobs')
        .delete()
        .eq('user_id', profile.id);

      if (error) throw error;
      toast.success('All audio history deleted');
    } catch (err: any) {
      toast.error('Error deleting audio: ' + err.message);
    } finally {
      setShowDeleteAudioModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    toast.loading('Processing...');
    
    // Sign out user correctly
    await supabase.auth.signOut();
    toast.dismiss();
    toast.error('Contact support to delete account for safety.', { duration: 5000 });
    router.push('/login');
  };

  if (loading) return null;

  const currentPlan = profile?.plan?.toLowerCase() || 'free';
  const planInfo = PLAN_DATA[currentPlan] || PLAN_DATA.free;
  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.credits_limit || 10000;
  const usagePercentage = (creditsUsed / creditsLimit) * 100;
  
  const progressBarColor = usagePercentage > 90 ? '#ef4444' : usagePercentage > 70 ? '#f5c518' : '#22d3a5';

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '1200px' }}>
      <Toaster position="top-right" />

      {showDeleteAudioModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', width: 'min(400px,90vw)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: 800, color: 'var(--text)', margin: '0 0 10px' }}>Delete Audio History?</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 24px', lineHeight: 1.6 }}>This will permanently delete all your generated audio files. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDeleteAudioModal(false)} style={{ flex: 1, padding: '12px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteAudio} style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ── LEFT COLUMN: Profile & Password ── */}
        <div className="flex-1 w-full space-y-6">
          
          {/* CARD: PROFILE */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '24px' }}>
              PROFILE
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', background: avatarBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 800, color: '#000', border: '2px solid rgba(0,0,0,0.05)'
              }}>
                {initials}
              </div>
              <button 
                onClick={() => toast('Photo upload coming soon!', { icon: '📸' })}
                style={{ 
                  background: 'none', border: 'none', color: 'var(--muted)', 
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                }}
              >
                Change Photo
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>FULL NAME</label>
                <input 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    value={email} 
                    readOnly
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--muted)', cursor: 'not-allowed', outline: 'none' }}
                  />
                  <Lock size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', opacity: 0.5 }}>Cannot be changed</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>USERNAME</label>
                <input 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  placeholder="@username"
                  style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
                />
              </div>

              <button 
                onClick={handleSaveProfile}
                disabled={savingProfile}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '12px', background: '#f5c518', 
                  color: '#000', fontWeight: 800, fontSize: '14px', cursor: 'pointer', border: 'none',
                  opacity: savingProfile ? 0.7 : 1, transition: 'transform 0.1s'
                }}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* CARD: PASSWORD */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '24px' }}>
              PASSWORD
            </p>

            <div className="space-y-4">
              <div style={{ position: 'relative' }}>
                <input 
                  type={showCurrentPw ? 'text' : 'password'}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', paddingRight: '46px', color: 'var(--text)', outline: 'none' }}
                />
                <button onClick={() => setShowCurrentPw(!showCurrentPw)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input 
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', paddingRight: '46px', color: 'var(--text)', outline: 'none' }}
                />
                <button onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', paddingRight: '46px', color: 'var(--text)', outline: 'none' }}
                />
                <button onClick={() => setShowConfirmPw(!showConfirmPw)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button 
                onClick={handleUpdatePassword}
                disabled={updatingPassword || !currentPassword || !newPassword || !confirmPassword}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '12px', background: '#f5c518', 
                  color: '#000', fontWeight: 800, fontSize: '14px', cursor: 'pointer', border: 'none',
                  opacity: (updatingPassword || !currentPassword || !newPassword || !confirmPassword) ? 0.5 : 1
                }}
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Plan & Danger Zone ── */}
        <div style={{ width: '100%', maxWidth: '320px' }} className="space-y-6">
          
          {/* CARD: ACTIVE PLAN */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ background: 'rgba(34,211,165,0.1)', color: '#22d3a5', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.1em' }}>
                ACTIVE PLAN
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Zap size={22} color="#f5c518" fill="#f5c518" />
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                {planInfo.label}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {[planInfo.chars, planInfo.clones, planInfo.voices].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--muted)' }}>
                  <Check size={14} color="#22d3a5" strokeWidth={3} />
                  {feature}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Credits Used This Month</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', background: progressBarColor, width: `${usagePercentage}%`, transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {creditsUsed.toLocaleString()} / {creditsLimit.toLocaleString()} chars used
              </p>
            </div>

            {currentPlan !== 'studio' && (
              <a 
                href="/dashboard/billing"
                style={{ 
                  display: 'flex', width: '100%', padding: '14px', borderRadius: '12px', 
                  background: '#f5c518', color: '#000', fontWeight: 800, fontSize: '14px', 
                  alignItems: 'center', justifyContent: 'center', textDecoration: 'none', gap: '8px'
                }}
              >
                ⚡ Upgrade Plan
              </a>
            )}
          </div>

          {/* CARD: DANGER ZONE */}
          <div style={{ 
            background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', 
            borderRadius: '16px', padding: dangerZoneExpanded ? '24px' : '16px', overflow: 'hidden'
          }}>
            <button 
              onClick={() => setDangerZoneExpanded(!dangerZoneExpanded)}
              style={{ 
                width: '100%', background: 'none', border: 'none', display: 'flex', 
                alignItems: 'center', justifyContent: 'space-between', color: '#ef4444', 
                fontWeight: 700, fontSize: '14px', cursor: 'pointer', padding: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                Danger Zone
              </div>
              {dangerZoneExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {dangerZoneExpanded && (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => setShowDeleteAudioModal(true)}
                  style={{ 
                    width: '100%', padding: '12px', borderRadius: '10px', background: 'none', 
                    border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', 
                    fontWeight: 600, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Delete All Generated Audio
                </button>

                <div style={{ borderTop: '1px solid rgba(239,68,68,0.1)', paddingTop: '16px', marginTop: '4px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
                    Type <strong style={{ color: 'var(--text)' }}>DELETE</strong> to confirm account deletion
                  </p>
                  <input 
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    style={{ 
                      width: '100%', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', 
                      borderRadius: '10px', padding: '10px 14px', color: 'var(--text)', outline: 'none',
                      marginBottom: '12px'
                    }}
                  />
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE'}
                    style={{ 
                      width: '100%', padding: '12px', borderRadius: '10px', background: '#ef4444', 
                      color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none',
                      opacity: deleteConfirmText !== 'DELETE' ? 0.5 : 1
                    }}
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
        input::placeholder { color: var(--muted); opacity: 0.3; }
        .space-y-6 > * + * { margin-top: 24px; }
        .space-y-4 > * + * { margin-top: 16px; }
        @media (max-width: 1024px) {
          #right-col { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
