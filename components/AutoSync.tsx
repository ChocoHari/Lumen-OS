'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { syncAllWithSupabase } from '@/lib/sync';

export function AutoSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    syncAllWithSupabase(user.id);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const onOnline = () => {
      syncAllWithSupabase(user.id);
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [user]);

  return null;
}
