'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Users, Receipt, Bell, User, ChevronLeft, ChevronRight,
  LogOut, Shield, TrendingDown, Menu, X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp },
  { href: '/dashboard/deposits', label: 'Deposits', icon: ArrowDownCircle },
  { href: '/dashboard/withdrawals', label: 'Withdrawals', icon: ArrowUpCircle },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut, profile } = useAuth();
  const { isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingDown className="w-5 h-5 text-black" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-black text-black leading-none">BlackRocke</div>
            <div className="text-xs font-bold text-amber-500">Capital</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-black'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-black' : 'text-gray-400 group-hover:text-black'}`} />
              {!collapsed && <span className="font-medium text-sm">{label}</span>}
              {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 bg-black rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          >
            <Shield className="w-5 h-5 flex-shrink-0 text-amber-500" />
            {!collapsed && <span className="font-medium text-sm">Admin Panel</span>}
          </Link>
        )}
        <button
          onClick={() => signOut()}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col bg-white border-r border-gray-100 flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ height: '100vh', position: 'sticky', top: 0 }}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:border-amber-400 hover:text-amber-600 transition-all z-10 ${isRTL ? 'left-auto right-auto -left-3' : ''}`}
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-gray-500" />
            : <ChevronLeft className="w-3 h-3 text-gray-500" />
          }
        </button>
      </div>

      {/* Mobile Hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-md"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}
