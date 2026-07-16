'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle, Globe, Shield, TrendingUp, Bell } from 'lucide-react';
import AdminHeader from '@/components/dashboard/AdminHeader';
import { supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s: any) => { map[s.key] = s.value; });
        setSettings(map);
      }
      setLoading(false);
    });
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange} className={`w-12 h-6 rounded-full transition-all duration-300 relative ${value ? 'bg-amber-500' : 'bg-gray-300'}`}>
      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all duration-300 ${value ? 'left-6' : 'left-0.5'}`} />
    </button>
  );

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Platform Settings" subtitle="Configure platform-wide settings" />
      <div className="p-6 space-y-6 max-w-4xl">
        {saved && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Settings saved successfully!</div>}

        {/* General Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5 text-amber-600" /></div>
            <h2 className="font-bold text-black text-lg">General Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
              <input value={settings.site_name || ''} onChange={e => updateSetting('site_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
              <input value={settings.support_email || ''} onChange={e => updateSetting('support_email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm" />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
            <h2 className="font-bold text-black text-lg">Financial Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Min Deposit ($)', key: 'min_deposit' },
              { label: 'Min Withdrawal ($)', key: 'min_withdrawal' },
              { label: 'Max Withdrawal ($)', key: 'max_withdrawal' },
              { label: 'Referral Rate (%)', key: 'referral_rate' },
              { label: 'Deposit Fee (%)', key: 'deposit_fee' },
              { label: 'Withdrawal Fee (%)', key: 'withdrawal_fee' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                <input type="number" value={settings[key] || ''} onChange={e => updateSetting(key, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm" placeholder="0" />
              </div>
            ))}
          </div>
        </div>

        {/* Email Notification Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center"><Bell className="w-5 h-5 text-amber-600" /></div>
            <h2 className="font-bold text-black text-lg">Email Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'email_login_notifications', label: 'Login Notifications', desc: 'Send admin email when a user logs in' },
              { key: 'email_deposit_notifications', label: 'Deposit Notifications', desc: 'Send admin email when a deposit is submitted' },
              { key: 'email_withdrawal_notifications', label: 'Withdrawal Notifications', desc: 'Send admin email when a withdrawal is requested' },
              { key: 'email_investment_notifications', label: 'Investment Notifications', desc: 'Send admin email when an investment starts' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold text-black text-sm">{label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
                </div>
                <Toggle value={settings[key] !== 'false'} onChange={() => updateSetting(key, settings[key] === 'false' ? 'true' : 'false')} />
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-amber-600" /></div>
            <h2 className="font-bold text-black text-lg">Security & Access</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Temporarily disable access to the platform' },
              { key: 'email_verification', label: 'Email Verification', desc: 'Require email verification on registration' },
              { key: 'kyc_required', label: 'KYC Required', desc: 'Require KYC verification before withdrawals' },
              { key: 'two_fa_enabled', label: 'Force 2FA for Admins', desc: 'Require 2FA for all admin accounts' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold text-black text-sm">{label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
                </div>
                <Toggle value={settings[key] === 'true'} onChange={() => updateSetting(key, settings[key] === 'true' ? 'false' : 'true')} />
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-md shadow-amber-200 disabled:opacity-70">
          {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />} Save All Settings
        </button>
      </div>
    </div>
  );
}
