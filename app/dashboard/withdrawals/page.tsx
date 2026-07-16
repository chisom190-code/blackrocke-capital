'use client';

import { useEffect, useState } from 'react';
import { ArrowUpCircle, Plus, X, CheckCircle, AlertCircle, XCircle, Clock, Check } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase, Withdrawal } from '@/lib/supabase';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
  const icons: Record<string, React.ReactNode> = { pending: <Clock className="w-3 h-3" />, approved: <Check className="w-3 h-3" />, completed: <CheckCircle className="w-3 h-3" />, rejected: <XCircle className="w-3 h-3" /> };
  return <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${map[status] || 'bg-gray-100 text-gray-700'}`}>{icons[status]}{status}</span>;
}

export default function WithdrawalsPage() {
  const { user, profile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: '', crypto_type: 'USDT', wallet_address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setWithdrawals(data as any); setLoading(false); });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { setError('Enter a valid amount'); return; }
    if (amount < 10) { setError('Minimum withdrawal is $10'); return; }
    if (amount > (profile?.balance || 0)) { setError('Insufficient balance'); return; }
    if (!form.wallet_address.trim()) { setError('Enter your wallet address'); return; }
    setSubmitting(true); setError('');

    const { data, error: err } = await supabase.from('withdrawals').insert({
      user_id: user.id,
      amount,
      crypto_type: form.crypto_type,
      wallet_address: form.wallet_address,
      status: 'pending',
    }).select().single();

    if (err) { setError(err.message); setSubmitting(false); return; }

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'withdrawal',
      title: 'Withdrawal Requested',
      message: `Your withdrawal of $${amount.toLocaleString()} (${form.crypto_type}) is under review.`,
    });

    setWithdrawals(prev => [data as any, ...prev]);
    setShowForm(false);
    setForm({ amount: '', crypto_type: 'USDT', wallet_address: '' });
    setSuccess('Withdrawal request submitted! Processing within 24-48 hours.');
    setTimeout(() => setSuccess(''), 5000);
    setSubmitting(false);
  };

  const approved = withdrawals.filter(w => w.status === 'completed').reduce((s, w) => s + w.amount, 0);
  const pending = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Withdrawals" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5"><div className="text-2xl font-black text-black mb-1">${(profile?.balance || 0).toLocaleString()}</div><div className="text-gray-500 text-sm">Available Balance</div></div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5"><div className="text-2xl font-black text-green-700 mb-1">${approved.toLocaleString()}</div><div className="text-gray-500 text-sm">Total Withdrawn</div></div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5"><div className="text-2xl font-black text-amber-700 mb-1">${pending.toLocaleString()}</div><div className="text-gray-500 text-sm">Pending</div></div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5"><div className="text-2xl font-black text-black mb-1">{withdrawals.length}</div><div className="text-gray-500 text-sm">Total Requests</div></div>
        </div>

        {success && <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"><CheckCircle className="w-5 h-5" />{success}</div>}
        {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"><AlertCircle className="w-5 h-5" />{error}</div>}

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-md">
            <Plus className="w-5 h-5" /> Request Withdrawal
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-black text-lg">Request Withdrawal</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (USD)</label>
                  <input type="number" min="10" step="0.01" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm" placeholder="Min $10" />
                  <div className="text-xs text-gray-400 mt-1.5">Available: <span className="text-green-600 font-semibold">${(profile?.balance || 0).toLocaleString()}</span></div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cryptocurrency</label>
                  <select value={form.crypto_type} onChange={e => setForm(f => ({ ...f, crypto_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
                    {['USDT', 'BTC', 'ETH'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Wallet Address</label>
                <input type="text" required value={form.wallet_address} onChange={e => setForm(f => ({ ...f, wallet_address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm font-mono" placeholder="Your receiving wallet address" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <strong>Note:</strong> Withdrawals are processed within 24-48 hours. Minimum withdrawal is $10. Ensure your wallet address is correct — transfers cannot be reversed.
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                  {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowUpCircle className="w-4 h-4" /> Submit Request</>}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-black">Withdrawal History</h2></div>
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : withdrawals.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No withdrawal requests yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>{['Date', 'Amount', 'Crypto', 'Wallet Address', 'Notes', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-600">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4 font-bold text-black">${w.amount.toLocaleString()}</td>
                      <td className="px-5 py-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">{w.crypto_type}</span></td>
                      <td className="px-5 py-4 text-sm font-mono text-gray-500 max-w-xs truncate">{w.wallet_address}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{w.notes || '—'}</td>
                      <td className="px-5 py-4"><StatusBadge status={w.status} /></td>
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
