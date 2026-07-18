'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import AdminSidebar from '@/components/dashboard/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname === '/admin/login';

  useEffect(() => {
    if (loading || isLoginRoute) return;
    if (!user) router.push('/admin/login');
    else if (profile && profile.role !== 'admin') router.push('/admin/login');
  }, [user, profile, loading, router, isLoginRoute]);

  if (isLoginRoute) return <>{children}</>;

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (profile.role !== 'admin') return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
