'use client';

import { Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { profile } = useAuth();
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-black">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <span className="text-black text-xs font-black">{(profile?.full_name || 'A')[0].toUpperCase()}</span>
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-black leading-tight">{profile?.full_name || 'Admin'}</div>
          <div className="text-xs text-amber-600 font-semibold">Administrator</div>
        </div>
      </div>
    </header>
  );
}
