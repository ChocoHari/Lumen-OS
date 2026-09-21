'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { syncAllWithSupabase } from '@/lib/sync';

export function TopBar({ title }: { title: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  async function syncNow() {
    if (!user) return;
    setSyncing(true);
    const result = await syncAllWithSupabase(user.id);
    setSyncMessage(result.ok ? 'Synced' : `Sync failed: ${result.error}`);
    setSyncing(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <header className="mb-5 rounded-xl2 border border-gray-100 bg-white px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-xs text-gray-500">Offline-first workspace for focused learning</p>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <button onClick={syncNow} disabled={syncing} className="rounded-xl2 border border-gray-200 px-3 py-1.5 text-xs">
                {syncing ? 'Syncing…' : 'Sync now'}
              </button>
              <button onClick={signOut} className="rounded-xl2 bg-black px-3 py-1.5 text-xs text-white">
                Sign out
              </button>
            </>
          )}
          {!user && <Link href="/login" className="rounded-xl2 bg-black px-3 py-1.5 text-xs text-white">Login</Link>}
        </div>
      </div>
      {syncMessage && <p className="mt-2 text-xs text-gray-500">{syncMessage}</p>}
    </header>
  );
}
