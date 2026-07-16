'use client';

import { useEffect, useState } from 'react';
import { User, Lock, Bell, Shield, Eye, EyeOff, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase, UserSettings, LoginActivity } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications' | 'activity'>('profile');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', country: '' });
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (!user || !profile) return;
    setProfileForm({ full_name: profile.full_name || '', phone: profile.phone || '', country: profile.country || '' });
    Promise.all([
      supabase.from('user_settings').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('login_activity').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]).then(([s, la]) => {
      if (s.data) setSettings(s.data as any);
      if (la.data) setLoginActivity(la.data as any);
    });
  }, [user, profile]);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ ...profileForm, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (error) showMsg(error.message, 'error');
    else { await refreshProfile(); showMsg('Profile updated successfully!', 'success'); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (passForm.new !== passForm.confirm) { showMsg('Passwords do not match', 'error'); return; }
    if (passForm.new.length < 6) { showMsg('Password must be at least 6 characters', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passForm.new });
    if (error) showMsg(error.message, 'error');
    else { setPassForm({ current: '', new: '', confirm: '' }); showMsg('Password changed successfully!', 'success'); }
    setSaving(false);
  };

  const saveNotificationSettings = async () => {
    if (!user || !settings) return;
    setSaving(true);
    const { error } = await supabase.from('user_settings').update({
      email_on_login: settings.email_on_login,
      email_on_deposit: settings.email_on_deposit,
      email_on_withdrawal: settings.email_on_withdrawal,
      email_on_investment: settings.email_on_investment,
    }).eq('id', user.id);
    if (error) showMsg(error.message, 'error');
    else showMsg('Notification preferences saved!', 'success');
    setSaving(false);
  };

  const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia', 'Japan', 'China', 'India', 'Brazil', 'UAE', 'Saudi Arabia', 'Russia', 'South Korea', 'Singapore', 'Other'];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Profile & Settings" />
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Profile Header Card */}
          <div className="bg-black rounded-2xl p-8 flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-black text-3xl font-black">
                {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors">
                <Camera className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'Investor'}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${profile?.kyc_status === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {profile?.kyc_status === 'verified' ? '✓ KYC Verified' : 'KYC Pending'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-semibold capitalize">{profile?.role}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit flex-wrap">
            {([
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'activity', label: 'Login Activity', icon: Shield },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {msg && (
            <div className={`flex items-center gap-3 p-4 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {msg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {msg.text}
            </div>
          )}

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-black text-lg mb-6">Personal Information</h3>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm" placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input value={user?.email || ''} disabled className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm text-gray-400 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <select value={profileForm.country} onChange={e => setProfileForm(f => ({ ...f, country: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-70">
                  {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {tab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-black text-lg mb-6">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  {(['current', 'new', 'confirm'] as const).map(field => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">{field === 'confirm' ? 'Confirm New Password' : field === 'new' ? 'New Password' : 'Current Password'}</label>
                      <div className="relative">
                        <input type={showPass[field] ? 'text' : 'password'} value={passForm[field]} onChange={e => setPassForm(f => ({ ...f, [field]: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm pr-12" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPass(s => ({ ...s, [field]: !s[field] }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPass[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={changePassword} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-70">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-black text-lg">Two-Factor Authentication</h3>
                    <p className="text-gray-500 text-sm mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${settings?.two_fa_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {settings?.two_fa_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">
                  <Shield className="w-4 h-4" /> {settings?.two_fa_enabled ? 'Disable' : 'Enable'} 2FA
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {tab === 'notifications' && settings && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-black text-lg mb-6">Email Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'email_on_login' as const, label: 'Login Alerts', desc: 'Get notified when your account is accessed' },
                  { key: 'email_on_deposit' as const, label: 'Deposit Updates', desc: 'Notifications for deposit status changes' },
                  { key: 'email_on_withdrawal' as const, label: 'Withdrawal Updates', desc: 'Notifications for withdrawal status changes' },
                  { key: 'email_on_investment' as const, label: 'Investment Updates', desc: 'Notifications for investment completions and returns' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-black text-sm">{label}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
                    </div>
                    <button
                      onClick={() => setSettings(s => s ? { ...s, [key]: !s[key] } : s)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings[key] ? 'bg-amber-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-all duration-300 ${settings[key] ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
                <button onClick={saveNotificationSettings} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-70">
                  {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Login Activity Tab */}
          {tab === 'activity' && (
            <div className="bg-white rounded-2xl border border-gray-100">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-black">Login Activity</h3>
                <p className="text-gray-400 text-sm mt-0.5">Recent sign-ins to your account</p>
              </div>
              {loginActivity.length === 0 ? (
                <div className="p-12 text-center"><Shield className="w-12 h-12 text-gray-200 mx-auto mb-4" /><p className="text-gray-400 text-sm">No login activity recorded yet</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {loginActivity.map(la => (
                    <div key={la.id} className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${la.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-semibold text-black text-sm">{la.device || 'Unknown Device'} — {la.browser || 'Unknown Browser'}</div>
                          <div className="text-gray-400 text-xs mt-0.5">{la.city && la.country ? `${la.city}, ${la.country}` : la.country || 'Unknown Location'}{la.ip_address ? ` · ${la.ip_address}` : ''}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{new Date(la.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{new Date(la.created_at).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
