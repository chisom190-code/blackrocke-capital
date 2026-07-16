'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Users, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Wallet, UsersRound, BarChart2, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, Menu, X, Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/plans', label: 'Investment Plans', icon: TrendingUp },
  { href: '/admin/deposits', label: 'Deposits', icon: ArrowDownCircle },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: ArrowUpCircle },
  { href: '/admin/wallets', label: 'Wallets', icon: Wallet },
  { href: '/admin/referrals', label: 'Referrals', icon: UsersRound },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-950">
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-black" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-black text-white leading-none">Admin Panel</div>
            <div className="text-xs font-bold text-amber-500">BlackRocke Capital</div>
          </div>
        )}
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : undefined}>
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-black' : 'text-gray-500 group-hover:text-white'}`} />
              {!collapsed && <span className="font-medium text-sm">{label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all ${collapsed ? 'justify-center' : ''}`}>
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Investor View</span>}
        </Link>
        <button onClick={() => signOut()} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all ${collapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`} style={{ height: '100vh', position: 'sticky', top: 0 }}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-24 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shadow-sm hover:border-amber-400 hover:text-amber-400 transition-all z-10">
          {collapsed ? <ChevronRight className="w-3 h-3 text-gray-400" /> : <ChevronLeft className="w-3 h-3 text-gray-400" />}
        </button>
      </div>
      <button className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-md" onClick={() => setMobileOpen(true)}>
        <Menu className="w-5 h-5 text-white" />
      </button>
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/70 z-40" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20">
              <X className="w-4 h-4 text-white" />
            </button>
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}
