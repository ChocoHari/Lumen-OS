'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { CourseGrid } from '@/components/CourseGrid';
import { MetricCards, countPerfected } from '@/components/MetricCards';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/components/AuthProvider';
import { db, type FocusSession, type Note } from '@/lib/db';

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    db.notes.where('userId').equals(user.id).toArray().then(setNotes);
    db.focusSessions.where('userId').equals(user.id).toArray().then(setSessions);
  }, [user]);

  const focusMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <RequireAuth>
      <main className="min-h-screen bg-bg p-5">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
          <Sidebar />
          <section>
            <TopBar title="Home" />
            <MetricCards perfectedCount={countPerfected(notes)} focusMinutes={focusMinutes} sessions={sessions} />
            <CourseGrid />
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
