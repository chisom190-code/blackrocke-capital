'use client';

import { useEffect, useState } from 'react';
import { Users, Copy, CheckCircle, Link2, Gift, TrendingUp } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase, UserSettings, Referral } from '@/lib/supabase';

export default function ReferralsPage() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('user_settings').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('referrals').select('*, referred:referred_id(full_name, created_at)').eq('referrer_id', user.id).order('created_at', { ascending: false }),
    ]).then(async ([settRes, refRes]) => {
      if (settRes.data) {
        setSettings(settRes.data as any);
        // Fetch referrer name if referred_by exists
        const s = settRes.data as any;
        if (s.referred_by) {
          const { data: refProf } = await supabase.from('profiles').select('full_name').eq('id', s.referred_by).maybeSingle();
          if (refProf) setReferredBy(refProf.full_name);
        }
      }
      if (refRes.data) setReferrals(refRes.data);
      setLoading(false);
    });
  }, [user]);

  const referralCode = settings?.referral_code || '—';
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${referralCode}`;

  const copy = (type: 'code' | 'link') => {
    navigator.clipboard.writeText(type === 'code' ? referralCode : referralLink);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalEarnings = referrals.reduce((s: number, r: any) => s + (r.earnings || 0), 0);
  const activeReferrals = referrals.filter(r => r.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Referral Program" />
      <div className="p-6 space-y-6">

        {/* Referred By */}
        {referredBy && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Referred By</div>
              <div className="font-bold text-black">{referredBy}</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Referrals', value: referrals.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
            { label: 'Active Referrals', value: activeReferrals, icon: TrendingUp, color: 'bg-green-100 text-green-600' },
            { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString()}`, icon: Gift, color: 'bg-amber-100 text-amber-600' },
            { label: 'Commission Rate', value: '5%', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}><Icon className="w-5 h-5" /></div>
                <div className="text-2xl font-black text-black mb-1">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Referral Code */}
        <div className="bg-black rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center"><Gift className="w-5 h-5 text-black" /></div>
            <div>
              <h2 className="font-bold text-white">Your Referral Code</h2>
              <p className="text-gray-400 text-sm">Earn 5% commission on every investment your referrals make</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Referral Code</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-mono font-black text-2xl text-amber-400 tracking-widest text-center">
                  {referralCode}
                </div>
                <button onClick={() => copy('code')} className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 text-black rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors">
                  {copied === 'code' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'code' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Referral Link</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-gray-300 text-sm truncate">
                  {referralLink}
                </div>
                <button onClick={() => copy('link')} className="flex items-center gap-1.5 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
                  {copied === 'link' ? <CheckCircle className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  {copied === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-black mb-5">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Share Your Code', desc: 'Share your unique referral code or link with friends and family.' },
              { step: '02', title: 'They Register', desc: 'Your referral signs up using your code and makes their first investment.' },
              { step: '03', title: 'Earn 5% Commission', desc: 'Receive 5% commission on every investment your referral makes, paid instantly.' },
            ].map((s, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-black text-sm flex-shrink-0">{s.step}</div>
                <div>
                  <div className="font-bold text-black mb-1">{s.title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-black">Referred Users ({referrals.length})</h2></div>
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : referrals.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">No referrals yet. Share your code to start earning!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>{['User', 'Joined', 'Commission Rate', 'Earnings', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {referrals.map((r: any) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <span className="text-amber-700 text-xs font-black">{(r.referred?.full_name || '?')[0].toUpperCase()}</span>
                          </div>
                          <span className="font-semibold text-black text-sm">{r.referred?.full_name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-sm font-bold text-green-600">{r.commission_rate}%</td>
                      <td className="px-5 py-4 font-bold text-black">${(r.earnings || 0).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
