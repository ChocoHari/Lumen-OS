'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { db, type Assignment, type Course, type Note, type Rewrite, type Task } from '@/lib/db';

const tabs = ['Overview', 'Notes', 'Rewrite', 'Assignments', 'Tasks'] as const;

type Tab = (typeof tabs)[number];

export default function CourseWorkspacePage() {
  const params = useParams<{ id: string }>();
  const courseId = Number(params.id);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [course, setCourse] = useState<Course | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [rewrites, setRewrites] = useState<Rewrite[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    db.courses.get(courseId).then((c) => setCourse(c ?? null));
    db.notes.where('courseId').equals(courseId).toArray().then(setNotes);
    db.rewrites.where('courseId').equals(courseId).toArray().then(setRewrites);
    db.assignments.where('courseId').equals(courseId).toArray().then(setAssignments);
    db.tasks.toArray().then(setTasks);
  }, [courseId]);

  const recentNotes = useMemo(() => [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5), [notes]);

  return (
    <main className="min-h-screen bg-bg p-5">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <section>
          <TopBar title={course ? `${course.code} Workspace` : 'Course Workspace'} />
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl2 px-3 py-1.5 text-sm ${activeTab === tab ? 'bg-black text-white' : 'bg-white border border-gray-100'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="rounded-xl2 border border-gray-100 bg-white p-4 text-sm">
            {activeTab === 'Overview' && (
              <div>
                <p className="font-semibold">Progress: {course?.progress ?? 0}%</p>
                <p className="mt-2 mb-1 text-xs text-gray-500">Recent notes</p>
                {recentNotes.map((note) => (
                  <p key={note.id}>{note.fileName} · {note.status}</p>
                ))}
                {!recentNotes.length && <p className="text-gray-500">No notes yet.</p>}
              </div>
            )}
            {activeTab === 'Notes' && notes.map((note) => <p key={note.id}>{note.fileName} · {note.status}</p>)}
            {activeTab === 'Rewrite' && rewrites.map((rewrite) => <p key={rewrite.id}>Note #{rewrite.noteId}: {rewrite.wordCount} words</p>)}
            {activeTab === 'Assignments' && assignments.map((item) => <p key={item.id}>{item.title} · {item.status}</p>)}
            {activeTab === 'Tasks' && tasks.map((task) => <p key={task.id}>{task.title} · {task.done ? 'done' : 'todo'}</p>)}
          </div>
        </section>
      </div>
    </main>
  );
}
