'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, X, Save, Copy } from 'lucide-react';
import AdminHeader from '@/components/dashboard/AdminHeader';
import { supabase, Wallet } from '@/lib/supabase';

type WalletForm = { crypto_type: string; network: string; address: string; label: string; is_active: boolean; };
const defaultForm: WalletForm = { crypto_type: 'USDT', network: 'TRC20', address: '', label: '', is_active: true };

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<WalletForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('wallets').select('*').order('crypto_type')
      .then(({ data }) => { if (data) setWallets(data as any); setLoading(false); });
  }, []);

  const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const copy = (addr: string, id: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const save = async () => {
    if (!form.address.trim()) { showMsg('Wallet address is required'); return; }
    if (editingId) {
      const { error } = await supabase.from('wallets').update(form).eq('id', editingId);
      if (error) { showMsg('Error: ' + error.message); return; }
      setWallets(w => w.map(wallet => wallet.id === editingId ? { ...wallet, ...form } : wallet));
    } else {
      const { data, error } = await supabase.from('wallets').insert(form).select().single();
      if (error) { showMsg('Error: ' + error.message); return; }
      setWallets(w => [...w, data as any]);
    }
    setShowForm(false); setEditingId(null); setForm(defaultForm);
    showMsg(editingId ? 'Wallet updated!' : 'Wallet added!');
  };

  const deleteWallet = async (id: string) => {
    if (!confirm('Delete this wallet?')) return;
    await supabase.from('wallets').delete().eq('id', id);
    setWallets(w => w.filter(wallet => wallet.id !== id));
    showMsg('Wallet deleted!');
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('wallets').update({ is_active: !current }).eq('id', id);
    setWallets(w => w.map(wallet => wallet.id === id ? { ...wallet, is_active: !current } : wallet));
  };

  const CRYPTO_NETWORKS: Record<string, string[]> = {
    USDT: ['TRC20', 'ERC20', 'BEP20'],
    BTC: ['Bitcoin'],
    ETH: ['ERC20', 'BEP20'],
    BNB: ['BEP20'],
    LTC: ['Litecoin'],
    XRP: ['Ripple'],
  };

  const cryptoColors: Record<string, string> = { USDT: 'bg-green-100 text-green-700', BTC: 'bg-orange-100 text-orange-700', ETH: 'bg-blue-100 text-blue-700', BNB: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Wallet Management" subtitle="Manage deposit wallet addresses" />
      <div className="p-6 space-y-6">
        {msg && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{msg}</div>}

        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" /> Add Wallet
        </button>

        {showForm && (
          <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-lg max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-black text-lg">{editingId ? 'Edit Wallet' : 'Add New Wallet'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cryptocurrency</label>
                  <select value={form.crypto_type} onChange={e => setForm(f => ({ ...f, crypto_type: e.target.value, network: CRYPTO_NETWORKS[e.target.value]?.[0] || '' }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
                    {Object.keys(CRYPTO_NETWORKS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Network</label>
                  <select value={form.network} onChange={e => setForm(f => ({ ...f, network: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
                    {(CRYPTO_NETWORKS[form.crypto_type] || []).map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. USDT TRC20 Main" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Wallet Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Enter wallet address" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm font-mono" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative ${form.is_active ? 'bg-amber-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${form.is_active ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">Active (visible to users)</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={save} className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Add'} Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wallets.map(wallet => (
            <div key={wallet.id} className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-300 ${!wallet.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-3 py-1 rounded-lg font-bold ${cryptoColors[wallet.crypto_type] || 'bg-gray-100 text-gray-700'}`}>{wallet.crypto_type}</span>
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">{wallet.network}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(wallet.id); setForm({ crypto_type: wallet.crypto_type, network: wallet.network, address: wallet.address, label: wallet.label || '', is_active: wallet.is_active }); setShowForm(true); }}
                    className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-amber-100 hover:text-amber-700 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteWallet(wallet.id)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-700 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="font-semibold text-black mb-2">{wallet.label || `${wallet.crypto_type} Wallet`}</div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 font-mono text-xs text-gray-600 truncate">{wallet.address}</div>
                <button onClick={() => copy(wallet.address, wallet.id)} className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center hover:bg-amber-200 transition-colors flex-shrink-0">
                  {copied === wallet.id ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
                </button>
              </div>
              <button onClick={() => toggleActive(wallet.id, wallet.is_active)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${wallet.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {wallet.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
