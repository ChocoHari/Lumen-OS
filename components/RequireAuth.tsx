'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!supabase || isLoading || user) return;
    router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
  }, [isLoading, pathname, router, user]);

  if (!supabase) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <main className="min-h-screen bg-bg p-6 text-sm text-gray-500">Checking session…</main>;
  }

  if (!user) {
    return <main className="min-h-screen bg-bg p-6 text-sm text-gray-500">Redirecting to login…</main>;
  }

  return <>{children}</>;
}
