'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { NotesUploader } from '@/components/NotesUploader';
import { NotesViewer } from '@/components/NotesViewer';
import { db, type Note } from '@/lib/db';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [courseFilter, setCourseFilter] = useState('all');

  async function refresh() {
    setNotes(await db.notes.toArray());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    if (courseFilter === 'all') return notes;
    return notes.filter((n) => n.courseId === Number(courseFilter));
  }, [notes, courseFilter]);

  const courseIds = Array.from(new Set(notes.map((note) => note.courseId)));

  return (
    <main className="min-h-screen bg-bg p-5">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <section>
          <TopBar title="Notes Vault" />
          <div className="mb-4 grid gap-4 lg:grid-cols-[220px_1fr]">
            <aside className="rounded-xl2 border border-gray-100 bg-white p-4">
              <p className="mb-2 text-sm font-semibold">Filter by course</p>
              <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="w-full rounded-xl2 border border-gray-200 px-3 py-2 text-sm">
                <option value="all">All courses</option>
                {courseIds.map((id) => (
                  <option key={id} value={id}>
                    Course {id}
                  </option>
                ))}
              </select>
            </aside>
            <NotesUploader onUploaded={refresh} />
          </div>
          <NotesViewer notes={filtered} onUpdated={refresh} />
        </section>
      </div>
    </main>
  );
}
