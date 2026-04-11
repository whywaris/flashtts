'use client';

// Run in Supabase SQL: ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text;
// IMPORTANT: Create 'avatars' bucket in Supabase Storage
// Supabase → Storage → New bucket → name: avatars → Public: true

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Check, Eye, EyeOff, Zap, AlertTriangle, Camera } from 'lucide-react';

interface Profile { 
  id: string; 
  full_name?: string | null; 
  username?: string | null; 
  plan?: string | null; 
  avatar_url?: string | null; 
  credits_limit?: number | null;
}

const PLAN_FEATURES = {
  Free: ['5,000 chars/month', '19 languages', 'Basic voices', '1 cloned voice'],
  Creator: ['100,000 chars/month', '19 languages', 'All voices', '10 cloned voices', 'Priority synthesis'],
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--glass)', border: '1px solid var(--border)',
  borderRadius: '12px', padding: '11px 14px', color: 'var(--text)', fontSize: '13.5px',
  fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', caretColor: 'var(--accent)',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', opacity: 0.8,
};
const sectionCard: React.CSSProperties = {
  background: 'var(--card-bg)', border: '1px solid var(--border)',
  borderRadius: '20px', padding: '24px', marginBottom: '16px',
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [plan, setPlan] = useState('Free');
  const [creditsLimit, setCreditsLimit] = useState(5000);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ success: false, error: '' });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }
      
      setUser(user);
      setEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        setFullName(profile.full_name || '');
        setUsername(profile.username || '');
        setAvatarUrl(profile.avatar_url || '');
        setPlan(profile.plan || 'Free');
        setCreditsLimit(profile.credits_limit || 5000);
      }
    }
    load();
  }, [router]);

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, WebP allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Max file size is 2MB');
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      alert('Photo updated!');
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdatePassword() {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setUpdatingPassword(true);
    setPasswordStatus({ success: false, error: '' });
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      alert('Password updated successfully!');
      setPasswordStatus({ success: true, error: '' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus(s => ({ ...s, success: false })), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
      setPasswordStatus({ success: false, error: err.message });
    } finally {
      setUpdatingPassword(false);
    }
  }

  const handleDeleteAccount = async () => {
    alert('Account deletion is not yet fully implemented for safety. Please contact support.');
  };

  const getInitials = () => {
    if (fullName) {
      const p = fullName.split(' ');
      return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : fullName.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase() || 'U';
  };

  const pwInput = (val: string, onChange: (v: string) => void, placeholder: string) => (
    <div style={{ position: 'relative' }}>
      <input type={showPw ? 'text' : 'password'} value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: '42px' }} />
      <button onClick={() => setShowPw(s => !s)}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, opacity: 0.6 }}>
        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div>
          {/* Profile */}
          <div style={sectionCard}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 18px', opacity: 0.7 }}>Profile</p>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(245,197,24,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, color: '#f5c518', flexShrink: 0
                }}>
                  {getInitials()}
                </div>
              )}
              
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {uploading ? 'Uploading...' : <><Camera size={14} /> Change Photo</>}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle} /></div>
              <div><label style={labelStyle}>Email</label>
                <input value={email} readOnly style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} /></div>
              <div><label style={labelStyle}>Username</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', opacity: 0.5, fontSize: '14px' }}>@</span>
                  <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" style={{ ...inputStyle, paddingLeft: '28px' }} />
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--accent)', border: 'none', color: 'var(--bg)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Password */}
          <div style={sectionCard}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 18px', opacity: 0.7 }}>Password</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pwInput(currentPassword, setCurrentPassword, 'Current password')}
              {pwInput(newPassword, setNewPassword, 'New password')}
              {pwInput(confirmPassword, setConfirmPassword, 'Confirm new password')}
              {passwordStatus.error && <p style={{ fontSize: '12px', color: 'rgba(255,100,100,0.8)', margin: 0 }}>{passwordStatus.error}</p>}
              <button onClick={handleUpdatePassword} disabled={updatingPassword || !newPassword}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: passwordStatus.success ? 'rgba(34,211,165,0.12)' : (updatingPassword || !newPassword) ? 'rgba(245,197,24,0.3)' : 'var(--accent)', border: passwordStatus.success ? '1px solid rgba(34,211,165,0.3)' : 'none', color: passwordStatus.success ? '#22d3a5' : 'var(--bg)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', cursor: (updatingPassword || !newPassword) ? 'not-allowed' : 'pointer' }}>
                {updatingPassword ? 'Updating…' : passwordStatus.success ? '✓ Updated' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {/* Plan */}
          <div style={sectionCard}>
            <div style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: '6px', background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.2)', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Active Plan</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--text)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--accent)" fill="var(--accent)" /> {plan[0].toUpperCase() + plan.slice(1)} Plan
            </h3>
            <ul style={{ margin: '0 0 18px', paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.Free).map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)', opacity: 0.9 }}>
                  <Check size={13} color="#22d3a5" strokeWidth={3} /> {f.includes('chars/month') ? `${creditsLimit.toLocaleString()} chars/month` : f}
                </li>
              ))}
            </ul>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {(['Free', 'Creator'] as const).map(p => (
                <div key={p} style={{ padding: '12px', borderRadius: '12px', background: plan.toLowerCase() === p.toLowerCase() ? 'rgba(245,197,24,0.08)' : 'var(--glass)', border: plan.toLowerCase() === p.toLowerCase() ? '1.5px solid rgba(245,197,24,0.3)' : '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: plan.toLowerCase() === p.toLowerCase() ? 'var(--accent)' : 'var(--text)', margin: '0 0 4px', opacity: plan.toLowerCase() === p.toLowerCase() ? 1 : 0.6 }}>{p}</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0, opacity: 0.6 }}>{p === 'Free' ? '5K chars/mo' : '100K chars/mo'}</p>
                </div>
              ))}
            </div>
            <button style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--accent)', border: 'none', color: 'var(--bg)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', letterSpacing: '-0.01em' }}>
              ⚡ Upgrade to Creator
            </button>
          </div>

          {/* Danger Zone */}
          <div style={{ ...sectionCard, background: 'rgba(255,50,50,0.04)', border: '1px solid rgba(255,80,80,0.2)', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
              <AlertTriangle size={14} color="rgba(255,100,100,0.8)" />
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'rgba(255,100,100,0.85)', margin: 0 }}>Danger Zone</p>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.5, opacity: 0.7 }}>These actions are irreversible. Please be certain before proceeding.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{ width: '100%', padding: '11px', borderRadius: '11px', background: 'transparent', border: '1px solid rgba(255,80,80,0.4)', color: 'rgba(255,100,100,0.7)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                Delete All Generated Audio
              </button>
              <button onClick={handleDeleteAccount}
                style={{ width: '100%', padding: '11px', borderRadius: '11px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.4)', color: 'rgba(255,100,100,0.7)', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`input::placeholder { color: var(--muted); opacity: 0.5; }`}</style>
    </div>
  );
}
