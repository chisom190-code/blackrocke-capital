'use client';

import { useEffect, useState, useRef } from 'react';
import { ArrowDownCircle, Upload, Copy, CheckCircle, AlertCircle, XCircle, Clock, Plus, X, QrCode, TrendingUp } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase, Deposit, Wallet, InvestmentPlan } from '@/lib/supabase';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3 h-3" />,
    approved: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {icons[status]} {status}
    </span>
  );
}

export default function DepositsPage() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ amount: '', crypto_type: 'USDT', wallet_id: '', txn_hash: '', screenshot: null as File | null, plan_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('wallets').select('*').eq('is_active', true).order('crypto_type'),
      supabase.from('investment_plans').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([dep, wal, pln]) => {
      if (dep.data) setDeposits(dep.data as any);
      if (wal.data) setWallets(wal.data as any);
      if (pln.data) setPlans(pln.data as any);
      setLoading(false);
    });
  }, [user]);

  const selectedWallet = wallets.find(w => w.crypto_type === form.crypto_type);
  const selectedPlan = plans.find(p => p.id === form.plan_id);

  const copyAddress = (addr: string, id: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { setError('Enter a valid amount'); return; }
    if (selectedPlan && (amount < selectedPlan.min_amount || amount > selectedPlan.max_amount)) {
      setError(`Amount must be between $${selectedPlan.min_amount} and $${selectedPlan.max_amount} for ${selectedPlan.name}`);
      return;
    }
    setSubmitting(true);
    setError('');

    let screenshotUrl = null;
    if (form.screenshot) {
      const ext = form.screenshot.name.split('.').pop();
      const path = `deposits/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('screenshots').upload(path, form.screenshot, { upsert: true });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(path);
        screenshotUrl = urlData.publicUrl;
      }
    }

    const { data: depositData, error: depErr } = await supabase.from('deposits').insert({
      user_id: user.id,
      amount,
      crypto_type: form.crypto_type,
      wallet_address: selectedWallet?.address,
      txn_hash: form.txn_hash || null,
      screenshot_url: screenshotUrl,
      plan_id: form.plan_id || null,
      status: 'pending',
    }).select().single();

    if (depErr) { setError(depErr.message); setSubmitting(false); return; }

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'deposit',
      title: 'Deposit Submitted',
      message: `Your deposit of $${amount.toLocaleString()} (${form.crypto_type})${selectedPlan ? ` for ${selectedPlan.name}` : ''} is under review.`,
    });

    setDeposits(prev => [depositData as any, ...prev]);
    setShowForm(false);
    setForm({ amount: '', crypto_type: 'USDT', wallet_id: '', txn_hash: '', screenshot: null, plan_id: '' });
    setSuccess('Deposit submitted successfully! Awaiting admin approval.');
    setTimeout(() => setSuccess(''), 5000);
    setSubmitting(false);
  };

  const totalDeposited = deposits.filter(d => d.status === 'approved').reduce((s, d) => s + d.amount, 0);
  const pendingAmount = deposits.filter(d => d.status === 'pending').reduce((s, d) => s + d.amount, 0);

  const qrUrl = selectedWallet
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedWallet.address)}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Deposits" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-2xl font-black text-black mb-1">${totalDeposited.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">Total Approved Deposits</div>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <div className="text-2xl font-black text-amber-700 mb-1">${pendingAmount.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">Pending Review</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-2xl font-black text-black mb-1">{deposits.length}</div>
            <div className="text-gray-500 text-sm">Total Deposits</div>
          </div>
        </div>

        {success && <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"><CheckCircle className="w-5 h-5" />{success}</div>}
        {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"><AlertCircle className="w-5 h-5" />{error}</div>}

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-200 shadow-md shadow-amber-200">
            <Plus className="w-5 h-5" /> Make a Deposit
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-black text-lg">New Deposit</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cryptocurrency</label>
                  <select value={form.crypto_type} onChange={e => setForm(f => ({ ...f, crypto_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white text-sm">
                    {['USDT', 'BTC', 'ETH', 'BNB'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (USD)</label>
                  <input type="number" min="10" step="0.01" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm" placeholder="100.00" />
                </div>
              </div>

              {/* Investment Plan Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" /> Select Investment Plan (Optional)
                </label>
                <select value={form.plan_id} onChange={e => setForm(f => ({ ...f, plan_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white text-sm">
                  <option value="">No plan — deposit only</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.roi_percent}% ROI / {p.duration_days} days (Min: ${p.min_amount})</option>
                  ))}
                </select>
                {selectedPlan && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <strong>{selectedPlan.name}:</strong> {selectedPlan.roi_percent}% return over {selectedPlan.duration_days} days.
                    Expected profit on ${form.amount || '0'}: <span className="font-bold text-green-600">
                      ${(((parseFloat(form.amount) || 0) * selectedPlan.roi_percent) / 100).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Wallet Address + QR Code */}
              {selectedWallet && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5" /> {selectedWallet.label || selectedWallet.crypto_type} Wallet ({selectedWallet.network})
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 font-mono text-sm text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 break-all">{selectedWallet.address}</div>
                        <button type="button" onClick={() => copyAddress(selectedWallet.address, selectedWallet.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-black rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors flex-shrink-0">
                          {copied === selectedWallet.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied === selectedWallet.id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">Scan the QR code with your wallet app or copy the address above.</p>
                    </div>
                    {qrUrl && (
                      <div className="flex-shrink-0">
                        <div className="bg-white p-2 rounded-xl border border-gray-200 inline-block">
                          <img src={qrUrl} alt="Wallet QR Code" width={140} height={140} className="rounded-lg" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Hash (Optional)</label>
                <input type="text" value={form.txn_hash} onChange={e => setForm(f => ({ ...f, txn_hash: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm font-mono" placeholder="0x..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Screenshot <span className="text-gray-400 font-normal">(Required for faster approval)</span></label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {form.screenshot ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-700">{form.screenshot.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Click to upload screenshot</p>
                      <p className="text-gray-400 text-xs mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && setForm(f => ({ ...f, screenshot: e.target.files![0] }))} />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Important:</strong> Send the exact amount to the wallet address above. Deposits are reviewed within 1-24 hours. Include your transaction hash for faster processing.
                {selectedPlan && <> Your investment will auto-start once the admin approves this deposit.</>}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                  {submitting ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><ArrowDownCircle className="w-4 h-4" /> Submit Deposit</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-black">Deposit History</h2>
          </div>
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : deposits.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No deposits yet. Make your first deposit above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>{['Date', 'Amount', 'Crypto', 'Plan', 'Txn Hash', 'Screenshot', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deposits.map((d: any) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-600">{new Date(d.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4 font-bold text-black">${d.amount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">{d.crypto_type}</span></td>
                      <td className="px-5 py-4 text-sm text-gray-500">{d.plan_id ? <span className="text-amber-600 font-semibold">Investment</span> : '—'}</td>
                      <td className="px-5 py-4 text-sm font-mono text-gray-500 max-w-xs truncate">{d.txn_hash || '—'}</td>
                      <td className="px-5 py-4">
                        {d.screenshot_url ? (
                          <a href={d.screenshot_url} target="_blank" rel="noreferrer" className="text-amber-600 text-xs font-semibold hover:underline">View</a>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
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
