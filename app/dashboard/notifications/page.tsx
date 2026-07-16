'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, TrendingUp, ArrowDownCircle, ArrowUpCircle, Shield, Info } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase, Notification } from '@/lib/supabase';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  deposit: { icon: ArrowDownCircle, bg: 'bg-green-100', color: 'text-green-600' },
  withdrawal: { icon: ArrowUpCircle, bg: 'bg-red-100', color: 'text-red-600' },
  investment: { icon: TrendingUp, bg: 'bg-amber-100', color: 'text-amber-600' },
  login: { icon: Shield, bg: 'bg-blue-100', color: 'text-blue-600' },
  success: { icon: CheckCheck, bg: 'bg-green-100', color: 'text-green-600' },
  info: { icon: Info, bg: 'bg-gray-100', color: 'text-gray-600' },
  warning: { icon: Bell, bg: 'bg-orange-100', color: 'text-orange-600' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNotifications(data as any); setLoading(false); });
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(n => n.map(item => ({ ...item, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(n => n.map(item => item.id === id ? { ...item, is_read: true } : item));
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(n => n.filter(item => item.id !== id));
  };

  const displayed = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Notifications" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
            {(['all', 'unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-xl font-semibold text-sm hover:bg-amber-400 transition-colors">
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-16 flex justify-center"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-black mb-2">No notifications</h3>
            <p className="text-gray-400 text-sm">{filter === 'unread' ? "You're all caught up!" : "No notifications yet."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(n => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              const Icon = config.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`bg-white rounded-2xl border p-5 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all duration-200 group ${!n.is_read ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-black text-sm">{n.title}</span>
                      {!n.is_read && <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{n.message}</p>
                    <span className="text-gray-400 text-xs mt-1 block">{timeAgo(n.created_at)}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
