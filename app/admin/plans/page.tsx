'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, X, Save } from 'lucide-react';
import AdminHeader from '@/components/dashboard/AdminHeader';
import { supabase, InvestmentPlan } from '@/lib/supabase';

type PlanForm = { name: string; min_amount: string; max_amount: string; roi_percent: string; duration_days: string; description: string; features: string; is_active: boolean; sort_order: string; };
const defaultForm: PlanForm = { name: '', min_amount: '', max_amount: '', roi_percent: '', duration_days: '7', description: '', features: '', is_active: true, sort_order: '0' };

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PlanForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('investment_plans').select('*').order('sort_order')
      .then(({ data }) => { if (data) setPlans(data as any); setLoading(false); });
  }, []);

  const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const startEdit = (plan: InvestmentPlan) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name, min_amount: plan.min_amount.toString(), max_amount: plan.max_amount.toString(),
      roi_percent: plan.roi_percent.toString(), duration_days: plan.duration_days.toString(),
      description: plan.description, features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      is_active: plan.is_active, sort_order: plan.sort_order.toString(),
    });
    setShowForm(true);
  };

  const save = async () => {
    const payload = {
      name: form.name, min_amount: parseFloat(form.min_amount), max_amount: parseFloat(form.max_amount),
      roi_percent: parseFloat(form.roi_percent), duration_days: parseInt(form.duration_days),
      description: form.description, is_active: form.is_active, sort_order: parseInt(form.sort_order),
      features: form.features.split('\n').filter(f => f.trim()),
      slug: editingId ? undefined : form.name.toLowerCase().replace(/\s+/g, '-'),
    };
    if (editingId) {
      const { error } = await supabase.from('investment_plans').update(payload).eq('id', editingId);
      if (error) { showMsg('Error: ' + error.message); return; }
      setPlans(p => p.map(plan => plan.id === editingId ? { ...plan, ...payload } as any : plan));
    } else {
      const { data, error } = await supabase.from('investment_plans').insert({ ...payload, slug: payload.slug! }).select().single();
      if (error) { showMsg('Error: ' + error.message); return; }
      setPlans(p => [...p, data as any]);
    }
    setShowForm(false); setEditingId(null); setForm(defaultForm);
    showMsg(editingId ? 'Plan updated!' : 'Plan created!');
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    await supabase.from('investment_plans').delete().eq('id', id);
    setPlans(p => p.filter(plan => plan.id !== id));
    showMsg('Plan deleted!');
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('investment_plans').update({ is_active: !current }).eq('id', id);
    setPlans(p => p.map(plan => plan.id === id ? { ...plan, is_active: !current } : plan));
  };

  const planColors = ['border-gray-200', 'border-amber-300', 'border-gray-600', 'border-amber-500'];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Investment Plans" subtitle="Manage investment portfolio tiers" />
      <div className="p-6 space-y-6">
        {msg && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{msg}</div>}

        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" /> Add New Plan
        </button>

        {showForm && (
          <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-black text-lg">{editingId ? 'Edit Plan' : 'New Investment Plan'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { label: 'Plan Name', key: 'name', placeholder: 'Foundation Portfolio' },
                { label: 'Min Amount ($)', key: 'min_amount', placeholder: '50', type: 'number' },
                { label: 'Max Amount ($)', key: 'max_amount', placeholder: '2000', type: 'number' },
                { label: 'ROI (%)', key: 'roi_percent', placeholder: '10', type: 'number' },
                { label: 'Duration (days)', key: 'duration_days', placeholder: '7', type: 'number' },
                { label: 'Sort Order', key: 'sort_order', placeholder: '1', type: 'number' },
              ].map(({ label, key, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm" placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm resize-none" placeholder="Plan description..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Features (one per line)</label>
                <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm font-mono resize-none" placeholder="Daily profit reports&#10;Email notifications&#10;24/7 support" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative ${form.is_active ? 'bg-amber-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${form.is_active ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">Plan Active</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={save} className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {editingId ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) => (
            <div key={plan.id} className={`bg-white rounded-2xl border-2 ${planColors[i % 4]} p-5 hover:shadow-lg transition-all duration-300 ${!plan.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{plan.is_active ? 'Active' : 'Inactive'}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(plan)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-amber-100 hover:text-amber-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deletePlan(plan.id)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-700 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="font-black text-black text-lg mb-1">{plan.name}</h3>
              <div className="text-4xl font-black text-amber-500 mb-3">{plan.roi_percent}%</div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Range:</span><span className="font-bold text-black">${plan.min_amount.toLocaleString()}–${plan.max_amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Duration:</span><span className="font-bold text-black">{plan.duration_days} days</span></div>
              </div>
              <button onClick={() => toggleActive(plan.id, plan.is_active)}
                className={`w-full mt-4 py-2 rounded-xl text-xs font-bold transition-colors ${plan.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {plan.is_active ? 'Deactivate' : 'Activate'} Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
