'use client';

import { useEffect, useState } from 'react';
import { Search, UserX, UserCheck, Eye, Shield, ChevronDown } from 'lucide-react';
import AdminHeader from '@/components/dashboard/AdminHeader';
import { supabase, Profile } from '@/lib/supabase';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) { setUsers(data as any); setFiltered(data as any); } setLoading(false); });
  }, []);

  useEffect(() => {
    let r = users;
    if (search) r = r.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.country?.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== 'all') r = r.filter(u => u.role === roleFilter);
    setFiltered(r);
  }, [search, roleFilter, users]);

  const toggleSuspend = async (id: string, current: boolean) => {
    await supabase.from('profiles').update({ is_suspended: !current }).eq('id', id);
    setUsers(u => u.map(p => p.id === id ? { ...p, is_suspended: !current } : p));
    setMsg(`User ${!current ? 'suspended' : 'unsuspended'} successfully`);
    setTimeout(() => setMsg(''), 3000);
  };

  const changeRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id);
    setUsers(u => u.map(p => p.id === id ? { ...p, role: role as any } : p));
    setMsg(`User role updated to ${role}`);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="User Management" subtitle={`${users.length} registered users`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5"><div className="text-2xl font-black text-black mb-1">{users.length}</div><div className="text-gray-500 text-sm">Total Users</div></div>
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5"><div className="text-2xl font-black text-blue-700 mb-1">{users.filter(u => u.role === 'investor').length}</div><div className="text-gray-500 text-sm">Investors</div></div>
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5"><div className="text-2xl font-black text-red-700 mb-1">{users.filter(u => u.is_suspended).length}</div><div className="text-gray-500 text-sm">Suspended</div></div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5"><div className="text-2xl font-black text-green-700 mb-1">{users.filter(u => u.kyc_status === 'verified').length}</div><div className="text-gray-500 text-sm">KYC Verified</div></div>
        </div>

        {msg && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{msg}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 bg-white text-sm">
              <option value="all">All Roles</option>
              <option value="investor">Investor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-black">Users ({filtered.length})</h2></div>
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>{['User', 'Country', 'Balance', 'Total Invested', 'KYC', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => (
                    <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${u.is_suspended ? 'opacity-60' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-amber-700 font-black text-xs">{(u.full_name || '?')[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-black text-sm">{u.full_name || '—'}</div>
                            <div className="text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{u.country || '—'}</td>
                      <td className="px-5 py-4 font-bold text-black text-sm">${(u.balance || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 font-semibold text-amber-600 text-sm">${(u.total_invested || 0).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${u.kyc_status === 'verified' ? 'bg-green-100 text-green-700' : u.kyc_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.kyc_status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="text-xs px-2 py-1 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-400">
                          <option value="investor">investor</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${u.is_suspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {u.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleSuspend(u.id, u.is_suspended)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.is_suspended ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                          {u.is_suspended ? <><UserCheck className="w-3 h-3" /> Unsuspend</> : <><UserX className="w-3 h-3" /> Suspend</>}
                        </button>
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
