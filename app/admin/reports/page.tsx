'use client';

import { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Users, DollarSign, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminHeader from '@/components/dashboard/AdminHeader';
import { supabase } from '@/lib/supabase';

const COLORS = ['#f59e0b', '#111827', '#6b7280', '#d97706', '#10b981'];

export default function AdminReportsPage() {
  const [stats, setStats] = useState({ users: 0, investments: 0, totalRevenue: 0, totalWithdrawn: 0, pendingDeposits: 0, pendingWithdrawals: 0 });
  const [planData, setPlanData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('user_investments').select('id', { count: 'exact' }),
      supabase.from('deposits').select('amount, status'),
      supabase.from('withdrawals').select('amount, status'),
      supabase.from('user_investments').select('amount, investment_plans(name)'),
    ]).then(([users, inv, deps, wits, invPlans]) => {
      const depData = deps.data || [];
      const witData = wits.data || [];
      setStats({
        users: users.count || 0,
        investments: inv.count || 0,
        totalRevenue: depData.filter((d: any) => d.status === 'approved').reduce((s: number, d: any) => s + d.amount, 0),
        totalWithdrawn: witData.filter((w: any) => w.status === 'approved').reduce((s: number, w: any) => s + w.amount, 0),
        pendingDeposits: depData.filter((d: any) => d.status === 'pending').reduce((s: number, d: any) => s + d.amount, 0),
        pendingWithdrawals: witData.filter((w: any) => w.status === 'pending').reduce((s: number, w: any) => s + w.amount, 0),
      });

      if (invPlans.data) {
        const planMap: Record<string, number> = {};
        invPlans.data.forEach((i: any) => {
          const name = i.investment_plans?.name || 'Unknown';
          planMap[name] = (planMap[name] || 0) + i.amount;
        });
        setPlanData(Object.entries(planMap).map(([name, value]) => ({ name, value })));
      }
      setLoading(false);
    });
  }, []);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      deposits: Math.floor(Math.random() * 50000 + 10000),
      withdrawals: Math.floor(Math.random() * 30000 + 5000),
      users: Math.floor(Math.random() * 100 + 20),
    };
  });

  const exportReport = () => {
    const data = [
      ['Metric', 'Value'],
      ['Total Users', stats.users],
      ['Total Investments', stats.investments],
      ['Total Revenue', `$${stats.totalRevenue.toLocaleString()}`],
      ['Total Withdrawn', `$${stats.totalWithdrawn.toLocaleString()}`],
      ['Pending Deposits', `$${stats.pendingDeposits.toLocaleString()}`],
      ['Pending Withdrawals', `$${stats.pendingWithdrawals.toLocaleString()}`],
    ];
    const csv = data.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'report.csv'; a.click();
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Reports & Analytics" subtitle="Platform performance overview" />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <button onClick={exportReport} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors text-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Users', value: stats.users.toLocaleString(), color: 'bg-blue-100 text-blue-600' },
            { label: 'Investments', value: stats.investments.toLocaleString(), color: 'bg-amber-100 text-amber-600' },
            { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'bg-green-100 text-green-600' },
            { label: 'Withdrawn', value: `$${stats.totalWithdrawn.toLocaleString()}`, color: 'bg-red-100 text-red-600' },
            { label: 'Net Revenue', value: `$${(stats.totalRevenue - stats.totalWithdrawn).toLocaleString()}`, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Pending', value: `$${(stats.pendingDeposits + stats.pendingWithdrawals).toLocaleString()}`, color: 'bg-orange-100 text-orange-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`text-2xl font-black mb-1 ${s.color.split(' ')[1]}`}>{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-black mb-5">Monthly Revenue vs Withdrawals</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']} />
                <Bar dataKey="deposits" name="Deposits" fill="#f59e0b" radius={[5, 5, 0, 0]} />
                <Bar dataKey="withdrawals" name="Withdrawals" fill="#111827" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-black mb-5">User Growth</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
                <Area type="monotone" dataKey="users" name="New Users" stroke="#f59e0b" strokeWidth={2.5} fill="url(#usersGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-black mb-5">Investment by Plan</h2>
            {planData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No investment data yet</div>
            ) : (
              <div className="flex items-center gap-6">
                <PieChart width={200} height={200}>
                  <Pie data={planData} cx={100} cy={100} innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {planData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
                <div className="space-y-3">
                  {planData.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div><div className="text-sm font-semibold text-black">{p.name}</div><div className="text-xs text-gray-500">${p.value.toLocaleString()}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-black mb-5">Platform Summary</h2>
            <div className="space-y-4">
              {[
                { label: 'Profit Margin', value: stats.totalRevenue > 0 ? `${(((stats.totalRevenue - stats.totalWithdrawn) / stats.totalRevenue) * 100).toFixed(1)}%` : '0%', bar: stats.totalRevenue > 0 ? ((stats.totalRevenue - stats.totalWithdrawn) / stats.totalRevenue) * 100 : 0, color: 'bg-green-500' },
                { label: 'Deposit Approval Rate', value: '92%', bar: 92, color: 'bg-amber-500' },
                { label: 'Withdrawal Approval Rate', value: '88%', bar: 88, color: 'bg-blue-500' },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-600">{m.label}</span>
                    <span className="font-bold text-black">{m.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
