'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { CourseGrid } from '@/components/CourseGrid';
import { MetricCards, countPerfected } from '@/components/MetricCards';
import { db, type FocusSession, type Note } from '@/lib/db';

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    db.notes.toArray().then(setNotes);
    db.focusSessions.toArray().then(setSessions);
  }, []);

  const focusMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
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
  );
}
