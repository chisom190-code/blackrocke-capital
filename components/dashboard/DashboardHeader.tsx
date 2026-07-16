'use client';

import { Bell, Search, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function DashboardHeader({ title }: { title: string }) {
  const { user, profile } = useAuth();
  const [unread, setUnread] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', user.id).eq('is_read', false)
      .then(({ count }) => setUnread(count || 0));
  }, [user]);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-lg font-bold text-black">{title}</h1>
      <div className="flex items-center gap-3">
        <Link href="/dashboard/notifications" className="relative w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-amber-50 transition-colors border border-gray-100">
          <Bell className="w-4 h-4 text-gray-600" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        <div className="relative">
          <button
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-black text-xs font-black">
                {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-black leading-tight">{profile?.full_name || 'Investor'}</div>
              <div className="text-xs text-gray-400">{profile?.role}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-50">
              <Link href="/dashboard/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setDropdownOpen(false)}>Profile Settings</Link>
              <Link href="/dashboard/notifications" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setDropdownOpen(false)}>Notifications</Link>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <Link href="/" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setDropdownOpen(false)}>Back to Website</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
