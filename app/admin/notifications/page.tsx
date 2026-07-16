'use client';

import { useEffect, useState } from 'react';
import { Send, Bell, Users, CheckCircle, X } from 'lucide-react';
import AdminHeader from '@/components/dashboard/AdminHeader';
import { supabase } from '@/lib/supabase';

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all', user_id: '' });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('id, full_name').order('full_name').then(({ data }) => { if (data) setUsers(data); });
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20).then(({ data }) => { if (data) setRecent(data); });
  }, []);

  const send = async () => {
    if (!form.title || !form.message) { setMsg('Fill in all fields'); return; }
    setSending(true);
    const insertData: any[] = [];
    if (form.target === 'all') {
      users.forEach(u => insertData.push({ user_id: u.id, type: form.type, title: form.title, message: form.message }));
    } else if (form.target === 'user' && form.user_id) {
      insertData.push({ user_id: form.user_id, type: form.type, title: form.title, message: form.message });
    }
    if (insertData.length > 0) {
      const { error } = await supabase.from('notifications').insert(insertData);
      if (error) { setMsg('Error: ' + error.message); setSending(false); return; }
    }
    setMsg(`Notification sent to ${insertData.length} user(s)!`);
    setForm({ title: '', message: '', type: 'info', target: 'all', user_id: '' });
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setRecent(data);
    setSending(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setRecent(n => n.filter(item => item.id !== id));
  };

  const typeColors: Record<string, string> = { info: 'bg-blue-100 text-blue-700', success: 'bg-green-100 text-green-700', warning: 'bg-orange-100 text-orange-700', deposit: 'bg-emerald-100 text-emerald-700', withdrawal: 'bg-red-100 text-red-700', investment: 'bg-amber-100 text-amber-700', login: 'bg-purple-100 text-purple-700' };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Notifications" subtitle="Send notifications to users" />
      <div className="p-6 space-y-6">
        {msg && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{msg}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-black text-lg mb-5">Send Notification</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target</label>
                <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
                  <option value="all">All Users ({users.length})</option>
                  <option value="user">Specific User</option>
                </select>
              </div>
              {form.target === 'user' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select User</label>
                  <select value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
                    <option value="">Choose user...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.id.slice(0, 8)}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
                  {['info', 'success', 'warning', 'deposit', 'withdrawal', 'investment'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm" placeholder="Notification title" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm resize-none" placeholder="Notification message..." />
            </div>
            <button onClick={send} disabled={sending} className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-70">
              {sending ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              Send Notification
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-black">Recent Notifications ({recent.length})</h2></div>
          <div className="divide-y divide-gray-50">
            {recent.map(n => (
              <div key={n.id} className="flex items-start gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>{n.type}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-black text-sm">{n.title}</div>
                  <div className="text-gray-500 text-xs mt-0.5 truncate">{n.message}</div>
                  <div className="text-gray-400 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <button onClick={() => deleteNotif(n.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {recent.length === 0 && <div className="p-12 text-center text-gray-400 text-sm">No notifications sent yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
