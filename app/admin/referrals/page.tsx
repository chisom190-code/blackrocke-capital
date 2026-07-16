'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/dashboard/AdminHeader';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Users, TrendingUp } from 'lucide-react';

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('referrals')
      .select('*, referrer:referrer_id(full_name), referred:referred_id(full_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setReferrals(data); setLoading(false); });
  }, []);

  const totalEarnings = referrals.reduce((s, r) => s + (r.earnings || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Referral Management" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5"><div className="text-2xl font-black mb-1">{referrals.length}</div><div className="text-gray-500 text-sm">Total Referrals</div></div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5"><div className="text-2xl font-black text-amber-700 mb-1">${totalEarnings.toLocaleString()}</div><div className="text-gray-500 text-sm">Total Commission Paid</div></div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5"><div className="text-2xl font-black text-green-700 mb-1">{referrals.filter(r => r.status === 'active').length}</div><div className="text-gray-500 text-sm">Active Referrals</div></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-black">All Referrals ({referrals.length})</h2></div>
          {loading ? <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>{['Referrer', 'Referred User', 'Commission', 'Earnings', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {referrals.map((r: any) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-black text-sm">{r.referrer?.full_name || '—'}</td>
                      <td className="px-5 py-4 font-semibold text-black text-sm">{r.referred?.full_name || '—'}</td>
                      <td className="px-5 py-4 text-green-600 font-bold text-sm">{r.commission_rate}%</td>
                      <td className="px-5 py-4 font-bold text-amber-600 text-sm">${(r.earnings || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {referrals.length === 0 && <div className="p-12 text-center text-gray-400 text-sm">No referrals yet</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
