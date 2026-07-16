'use client';

import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import AdminHeader from '@/components/dashboard/AdminHeader';
import { supabase, Deposit } from '@/lib/supabase';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('deposits').select('*, profiles(full_name, country)').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) { setDeposits(data); setFiltered(data); } setLoading(false); });
  }, []);

  useEffect(() => {
    let r = deposits;
    if (search) r = r.filter((d: any) => d.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || d.crypto_type.toLowerCase().includes(search.toLowerCase()) || d.txn_hash?.includes(search));
    if (statusFilter !== 'all') r = r.filter((d: any) => d.status === statusFilter);
    setFiltered(r);
  }, [search, statusFilter, deposits]);

  const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const updateStatus = async (id: string, action: 'approve' | 'reject', userId: string, amount: number, planId?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) { showMsg('Configuration error'); return; }

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/handle-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': anonKey!,
        },
        body: JSON.stringify({
          depositId: id,
          action,
          adminId: session?.user.id,
          planId: planId || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) { showMsg('Error: ' + (result.error || 'Unknown error')); return; }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      setDeposits(d => d.map(dep => dep.id === id ? { ...dep, status: newStatus } : dep));
      showMsg(`Deposit ${newStatus} successfully!${action === 'approve' && planId ? ' Investment auto-started!' : ''}`);
    } catch (err: any) {
      showMsg('Error: ' + err.message);
    }
  };

  const totalPending = deposits.filter(d => d.status === 'pending').reduce((s: number, d: any) => s + d.amount, 0);
  const totalApproved = deposits.filter(d => d.status === 'approved').reduce((s: number, d: any) => s + d.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Deposit Management" subtitle="Review and approve user deposits" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5"><div className="text-2xl font-black mb-1">{deposits.length}</div><div className="text-gray-500 text-sm">Total Deposits</div></div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5"><div className="text-2xl font-black text-amber-700 mb-1">{deposits.filter(d => d.status === 'pending').length}</div><div className="text-gray-500 text-sm">Pending (${totalPending.toLocaleString()})</div></div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5"><div className="text-2xl font-black text-green-700 mb-1">{deposits.filter(d => d.status === 'approved').length}</div><div className="text-gray-500 text-sm">Approved (${totalApproved.toLocaleString()})</div></div>
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5"><div className="text-2xl font-black text-red-700 mb-1">{deposits.filter(d => d.status === 'rejected').length}</div><div className="text-gray-500 text-sm">Rejected</div></div>
        </div>

        {msg && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{msg}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap gap-4">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deposits..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-black">Deposits ({filtered.length})</h2></div>
          {loading ? <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>{['User', 'Amount', 'Crypto', 'Txn Hash', 'Screenshot', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((d: any) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4"><div className="font-semibold text-black text-sm">{d.profiles?.full_name || '—'}</div><div className="text-gray-400 text-xs">{d.profiles?.country || '—'}</div></td>
                      <td className="px-5 py-4 font-black text-black">${d.amount.toLocaleString()}</td>
                      <td className="px-5 py-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">{d.crypto_type}</span></td>
                      <td className="px-5 py-4 text-xs font-mono text-gray-500 max-w-xs truncate">{d.txn_hash || '—'}</td>
                      <td className="px-5 py-4">{d.screenshot_url ? <a href={d.screenshot_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-amber-600 text-xs font-semibold hover:underline"><Eye className="w-3 h-3" />View</a> : <span className="text-gray-400 text-xs">—</span>}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${d.status === 'approved' ? 'bg-green-100 text-green-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        {d.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(d.id, 'approve', d.user_id, d.amount, d.plan_id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors">
                              <CheckCircle className="w-3 h-3" /> Approve
                            </button>
                            <button onClick={() => updateStatus(d.id, 'reject', d.user_id, d.amount)} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        )}
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
