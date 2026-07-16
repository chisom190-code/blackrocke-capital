'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, DollarSign, MessageSquare, ArrowDownCircle, ArrowUpCircle, CheckCircle, Clock, XCircle, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AdminHeader from '@/components/dashboard/AdminHeader';
import { supabase } from '@/lib/supabase';

function StatCard({ label, value, icon: Icon, color, change }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-black mb-1">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, investments: 0, revenue: 0, deposits: 0, withdrawals: 0, messages: 0, pendingDeposits: 0, pendingWithdrawals: 0 });
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('user_investments').select('id, status', { count: 'exact' }).eq('status', 'active'),
      supabase.from('deposits').select('amount, status'),
      supabase.from('withdrawals').select('amount, status'),
      supabase.from('contact_messages').select('id', { count: 'exact' }).eq('is_read', false),
      supabase.from('deposits').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('withdrawals').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
    ]).then(([users, inv, deps, wits, msgs, recDep, recWit]) => {
      const depData = deps.data || [];
      const witData = wits.data || [];
      setStats({
        users: users.count || 0,
        investments: inv.count || 0,
        revenue: depData.filter((d: any) => d.status === 'approved').reduce((s: number, d: any) => s + d.amount, 0),
        deposits: depData.length,
        withdrawals: witData.length,
        messages: msgs.count || 0,
        pendingDeposits: depData.filter((d: any) => d.status === 'pending').length,
        pendingWithdrawals: witData.filter((w: any) => w.status === 'pending').length,
      });
      if (recDep.data) setRecentDeposits(recDep.data);
      if (recWit.data) setRecentWithdrawals(recWit.data);
      setLoading(false);
    });
  }, []);

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), deposits: Math.floor(Math.random() * 5000 + 1000), withdrawals: Math.floor(Math.random() * 3000 + 500) };
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${map[s] || 'bg-gray-100 text-gray-700'}`}>{s}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Admin Dashboard" subtitle="BlackRocke Capital Management" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.users.toLocaleString()} icon={Users} color="bg-blue-100 text-blue-600" change={12.5} />
          <StatCard label="Active Investments" value={stats.investments.toLocaleString()} icon={TrendingUp} color="bg-amber-100 text-amber-600" change={8.3} />
          <StatCard label="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-green-100 text-green-600" change={23.1} />
          <StatCard label="Unread Messages" value={stats.messages.toLocaleString()} icon={MessageSquare} color="bg-red-100 text-red-600" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Deposits', value: stats.deposits, icon: ArrowDownCircle, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Pending Deposits', value: stats.pendingDeposits, icon: Clock, color: 'bg-amber-100 text-amber-600' },
            { label: 'Total Withdrawals', value: stats.withdrawals, icon: ArrowUpCircle, color: 'bg-purple-100 text-purple-600' },
            { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: Clock, color: 'bg-orange-100 text-orange-600' },
          ].map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-black mb-5">Revenue Overview (7 days)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
                <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#f59e0b" strokeWidth={2.5} fill="url(#depGrad)" />
                <Area type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#111827" strokeWidth={2} fill="url(#depGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-black mb-5">Transaction Volume</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
                <Bar dataKey="deposits" name="Deposits" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="withdrawals" name="Withdrawals" fill="#111827" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-black">Recent Deposits</h2>
              <a href="/admin/deposits" className="text-amber-600 text-xs font-semibold hover:text-amber-500">View all</a>
            </div>
            <div className="divide-y divide-gray-50">
              {recentDeposits.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <div className="font-semibold text-black text-sm">{d.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-gray-400 text-xs">{d.crypto_type} · {new Date(d.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-black">${d.amount.toLocaleString()}</span>
                    {statusBadge(d.status)}
                  </div>
                </div>
              ))}
              {recentDeposits.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No deposits yet</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-black">Recent Withdrawals</h2>
              <a href="/admin/withdrawals" className="text-amber-600 text-xs font-semibold hover:text-amber-500">View all</a>
            </div>
            <div className="divide-y divide-gray-50">
              {recentWithdrawals.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <div className="font-semibold text-black text-sm">{w.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-gray-400 text-xs">{w.crypto_type} · {new Date(w.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-black">${w.amount.toLocaleString()}</span>
                    {statusBadge(w.status)}
                  </div>
                </div>
              ))}
              {recentWithdrawals.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No withdrawals yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
