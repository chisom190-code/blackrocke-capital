'use client';

import { useEffect, useState } from 'react';
import { Receipt, Search, Download, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase, Transaction } from '@/lib/supabase';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) { setTxns(data as any); setFiltered(data as any); } setLoading(false); });
  }, [user]);

  useEffect(() => {
    let result = txns;
    if (search) result = result.filter(t => t.notes?.toLowerCase().includes(search.toLowerCase()) || t.reference?.toLowerCase().includes(search.toLowerCase()) || t.type.includes(search.toLowerCase()));
    if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter);
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    setFiltered(result);
  }, [search, typeFilter, statusFilter, txns]);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Status', 'Reference', 'Notes'];
    const rows = filtered.map(t => [new Date(t.created_at).toLocaleDateString(), t.type, t.amount, t.status, t.reference || '', t.notes || '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
  };

  const typeIcon = (type: string) => {
    if (type === 'deposit') return <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><ArrowDownRight className="w-4 h-4 text-green-600" /></div>;
    if (type === 'withdrawal') return <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><ArrowUpRight className="w-4 h-4 text-red-600" /></div>;
    if (type === 'investment') return <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-amber-600" /></div>;
    return <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-blue-600" /></div>;
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { approved: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700' };
    return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${map[s] || 'bg-gray-100 text-gray-700'}`}>{s}</span>;
  };

  const totalIn = txns.filter(t => ['deposit', 'earning'].includes(t.type) && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
  const totalOut = txns.filter(t => t.type === 'withdrawal' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Transaction History" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5"><div className="text-2xl font-black text-black mb-1">{txns.length}</div><div className="text-gray-500 text-sm">Total Transactions</div></div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5"><div className="text-2xl font-black text-green-700 mb-1">${totalIn.toLocaleString()}</div><div className="text-gray-500 text-sm">Total Inflows</div></div>
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5"><div className="text-2xl font-black text-red-700 mb-1">${totalOut.toLocaleString()}</div><div className="text-gray-500 text-sm">Total Outflows</div></div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5"><div className="text-2xl font-black text-amber-700 mb-1">{txns.filter(t => t.status === 'pending').length}</div><div className="text-gray-500 text-sm">Pending</div></div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
              {['all', 'deposit', 'withdrawal', 'investment', 'earning'].map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
              {['all', 'pending', 'approved', 'rejected'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
            </select>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-black">Transactions ({filtered.length})</h2>
          </div>
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center"><Receipt className="w-12 h-12 text-gray-200 mx-auto mb-4" /><p className="text-gray-400 text-sm">No transactions found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>{['', 'Date', 'Type', 'Amount', 'Status', 'Reference', 'Notes'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">{typeIcon(t.type)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${t.type === 'deposit' ? 'bg-green-100 text-green-700' : t.type === 'withdrawal' ? 'bg-red-100 text-red-700' : t.type === 'investment' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-black">${t.amount.toLocaleString()}</td>
                      <td className="px-5 py-4">{statusBadge(t.status)}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 font-mono">{t.reference || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{t.notes || '—'}</td>
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
