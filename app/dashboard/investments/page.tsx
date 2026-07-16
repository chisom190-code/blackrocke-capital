'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Download, Clock, CheckCircle, XCircle, AlertCircle, Plus, Calendar } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase, UserInvestment, InvestmentPlan } from '@/lib/supabase';

function Countdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Completed'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endDate]);
  return <span className="font-mono text-xs font-semibold text-amber-600">{timeLeft}</span>;
}

export default function InvestmentsPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<(UserInvestment & { investment_plans: InvestmentPlan })[]>([]);
  const [tab, setTab] = useState<'active' | 'all'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('user_investments').select('*, investment_plans(*)')
      .eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setInvestments(data as any); setLoading(false); });
  }, [user]);

  const filtered = tab === 'active' ? investments.filter(i => i.status === 'active') : investments;

  const getProgress = (inv: UserInvestment) => {
    const total = new Date(inv.end_date).getTime() - new Date(inv.start_date).getTime();
    const elapsed = Date.now() - new Date(inv.start_date).getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${map[s] || 'bg-gray-100 text-gray-700'}`}>{s}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="My Investments" />
      <div className="p-6 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invested', value: `$${investments.reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
            { label: 'Active Plans', value: investments.filter(i => i.status === 'active').length, color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
            { label: 'Expected Returns', value: `$${investments.reduce((s, i) => s + i.expected_return, 0).toLocaleString()}`, color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
            { label: 'Completed', value: investments.filter(i => i.status === 'completed').length, color: 'bg-gray-50 border-gray-200', textColor: 'text-gray-700' },
          ].map((c, i) => (
            <div key={i} className={`rounded-2xl border p-5 ${c.color}`}>
              <div className={`text-2xl font-black mb-1 ${c.textColor}`}>{c.value}</div>
              <div className="text-gray-500 text-sm">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + List */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
              {(['active', 'all'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'}`}>
                  {t === 'active' ? 'Active' : 'All History'}
                </button>
              ))}
            </div>
            <Link href="/dashboard/deposits" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors">
              <Plus className="w-4 h-4" /> New Investment
            </Link>
          </div>

          {loading ? (
            <div className="p-16 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No {tab} investments</p>
              <Link href="/dashboard/deposits" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors">
                <Plus className="w-4 h-4" /> Start Investing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(inv => {
                const progress = getProgress(inv);
                const remaining = Math.max(0, Math.ceil((new Date(inv.end_date).getTime() - Date.now()) / 86400000));
                return (
                  <div key={inv.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-bold text-black">{inv.investment_plans?.name}</div>
                          <div className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(inv.start_date).toLocaleDateString()} → {new Date(inv.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(inv.status)}
                        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-amber-400 hover:text-amber-600 transition-colors">
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">Invested</div>
                        <div className="font-black text-black">${inv.amount.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">ROI Rate</div>
                        <div className="font-black text-green-600">{inv.roi_percent}%</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">Expected Return</div>
                        <div className="font-black text-amber-600">${inv.expected_return.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">Profit</div>
                        <div className="font-black text-emerald-600">+${(inv.expected_return - inv.amount).toLocaleString()}</div>
                      </div>
                    </div>

                    {inv.status === 'active' && (
                      <>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-500">Progress: {progress.toFixed(0)}%</span>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="text-gray-500">Remaining: </span>
                            <Countdown endDate={inv.end_date} />
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 relative overflow-hidden"
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/30 animate-pulse" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
