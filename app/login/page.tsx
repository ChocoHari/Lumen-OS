'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/';

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(nextPath);
    }
  }, [isLoading, nextPath, router, user]);

  async function sendMagicLink() {
    if (!supabase) {
      setMessage('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${nextPath}` }
    });

    setMessage(error ? error.message : 'Magic link sent. Check your email.');
  }

  return (
    <main className="mx-auto min-h-screen max-w-md p-6">
      <div className="mt-20 rounded-xl3 border border-gray-100 bg-white p-6">
        <h1 className="mb-1 text-xl font-semibold">Login to Lumen</h1>
        <p className="mb-4 text-xs text-gray-500">Magic link sign-in</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          className="mb-3 w-full rounded-xl2 border border-gray-200 px-3 py-2"
        />
        <button onClick={sendMagicLink} className="w-full rounded-xl2 bg-black px-3 py-2 text-white">
          Send magic link
        </button>
        {message && <p className="mt-3 text-xs text-gray-600">{message}</p>}
      </div>
    </main>
  );
}
