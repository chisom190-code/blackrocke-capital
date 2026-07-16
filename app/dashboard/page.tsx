'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle, Clock, BarChart2, ArrowRight, CheckCircle, AlertCircle, XCircle, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase, UserInvestment, InvestmentPlan, Deposit, Withdrawal, Notification } from '@/lib/supabase';

const CHART_COLORS = ['#f59e0b', '#111827', '#6b7280', '#d97706'];

function StatCard({ label, value, icon: Icon, color, sub, trend }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-black mb-1">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [investments, setInvestments] = useState<(UserInvestment & { investment_plans: InvestmentPlan })[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('user_investments').select('*, investment_plans(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]).then(([inv, dep, wit, notif]) => {
      if (inv.data) setInvestments(inv.data as any);
      if (dep.data) setDeposits(dep.data as any);
      if (wit.data) setWithdrawals(wit.data as any);
      if (notif.data) setNotifications(notif.data as any);
      setLoading(false);
    });
    refreshProfile();
  }, [user]);

  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: (profile?.balance || 0) * (0.8 + i * 0.03),
      earnings: (profile?.total_earnings || 0) * (0.5 + i * 0.08),
    };
  });

  const pieData = [
    { name: 'Active', value: activeInvestments.length || 1 },
    { name: 'Completed', value: investments.filter(i => i.status === 'completed').length || 0 },
    { name: 'Balance', value: Math.max(profile?.balance || 0, 1) },
  ].filter(d => d.value > 0);

  const statusIcon = (s: string) => {
    if (s === 'approved' || s === 'active') return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    if (s === 'rejected') return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
  };

  const fmt = (n: number) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getRemainingDays = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Dashboard Overview" />
      <div className="p-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Balance" value={fmt(profile?.balance || 0)} icon={DollarSign} color="bg-amber-100 text-amber-600" trend={12.5} />
          <StatCard label="Total Deposits" value={fmt(profile?.total_deposits || 0)} icon={ArrowDownCircle} color="bg-green-100 text-green-600" trend={8.2} />
          <StatCard label="Active Investments" value={activeInvestments.length} icon={TrendingUp} color="bg-blue-100 text-blue-600" sub={`${fmt(totalInvested)} invested`} />
          <StatCard label="Total Profit" value={fmt(profile?.total_earnings || 0)} icon={BarChart2} color="bg-emerald-100 text-emerald-600" trend={23.1} />
          <StatCard label="Pending Withdrawals" value={fmt(profile?.pending_withdrawals || 0)} icon={Clock} color="bg-orange-100 text-orange-600" sub={`${pendingWithdrawals.length} pending`} />
          <StatCard label="Total Withdrawn" value={fmt(profile?.total_withdrawals || 0)} icon={ArrowUpCircle} color="bg-purple-100 text-purple-600" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-black">Portfolio Performance</h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-gray-500">Balance</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-800" /><span className="text-gray-500">Earnings</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, '']} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
                <Area type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2.5} fill="url(#balanceGrad)" />
                <Area type="monotone" dataKey="earnings" stroke="#111827" strokeWidth={2} fill="url(#earnGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-black mb-6">Portfolio Breakdown</h2>
            <div className="flex justify-center mb-4">
              <PieChart width={160} height={160}>
                <Pie data={pieData} cx={80} cy={80} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-2">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Investments */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-black">Active Investments</h2>
            <Link href="/dashboard/investments" className="text-amber-600 text-sm font-semibold hover:text-amber-500 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {activeInvestments.length === 0 ? (
            <div className="p-10 text-center">
              <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-4">No active investments yet</p>
              <Link href="/dashboard/deposits" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors">
                <Plus className="w-4 h-4" /> Make a Deposit
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activeInvestments.map(inv => {
                const remaining = getRemainingDays(inv.end_date);
                const total = inv.investment_plans?.duration_days || 7;
                const elapsed = total - remaining;
                const progress = Math.min(100, (elapsed / total) * 100);
                return (
                  <div key={inv.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-black text-sm">{inv.investment_plans?.name}</div>
                        <div className="text-gray-400 text-xs mt-0.5">Started {new Date(inv.start_date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-black">${inv.amount.toLocaleString()}</div>
                        <div className="text-green-600 text-xs font-semibold">+{inv.roi_percent}% ROI</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>Progress</span>
                      <span className="font-semibold text-amber-600">{remaining} days left</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
                      <span>Expected: <span className="text-green-600 font-bold">${inv.expected_return.toLocaleString()}</span></span>
                      <span>{progress.toFixed(0)}% complete</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Deposits */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-black">Recent Deposits</h2>
              <Link href="/dashboard/deposits" className="text-amber-600 text-xs font-semibold hover:text-amber-500">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {deposits.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No deposits yet</div>
              ) : deposits.map(d => (
                <div key={d.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <ArrowDownCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-black">{d.crypto_type}</div>
                      <div className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black text-sm">${d.amount.toLocaleString()}</span>
                    {statusIcon(d.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-black">Recent Notifications</h2>
              <Link href="/dashboard/notifications" className="text-amber-600 text-xs font-semibold hover:text-amber-500">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No notifications yet</div>
              ) : notifications.map(n => (
                <div key={n.id} className={`p-4 hover:bg-gray-50/50 transition-colors ${!n.is_read ? 'bg-amber-50/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-amber-500' : 'bg-gray-300'}`} />
                    <div>
                      <div className="text-sm font-semibold text-black">{n.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
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
