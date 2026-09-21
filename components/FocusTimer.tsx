'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { db, type FocusSession } from '@/lib/db';
import { supabase } from '@/lib/supabase';

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export function FocusTimer() {
  const [seconds, setSeconds] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [noteId, setNoteId] = useState('');
  const [history, setHistory] = useState<FocusSession[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    db.focusSessions.where('userId').equals(user.id).toArray().then((sessions) =>
      setHistory(sessions.filter((s) => s.completedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)))
    );
  }, [user]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const logSession = useCallback(async () => {
    const session = {
      userId: user?.id,
      courseId: Number(courseId) || undefined,
      noteId: Number(noteId) || undefined,
      durationMinutes: 25,
      completedAt: new Date().toISOString()
    };

    await db.focusSessions.add(session);
    if (user) {
      const sessions = await db.focusSessions.where('userId').equals(user.id).toArray();
      setHistory(sessions.filter((s) => s.completedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)));
    }

    if (supabase) {
      await supabase.from('focus_sessions').insert({
        user_id: session.userId,
        course_id: session.courseId,
        note_id: session.noteId,
        duration_minutes: session.durationMinutes,
        completed_at: session.completedAt
      });
    }

    if (session.courseId) {
      const course = await db.courses.get(session.courseId);
      if (course?.id) {
        await db.courses.update(course.id, { progress: Math.min(100, course.progress + 2), updatedAt: new Date().toISOString() });
      }
    }
  }, [courseId, noteId, user]);

  useEffect(() => {
    if (seconds > 0) return;
    setRunning(false);
    if (!isBreak) {
      logSession();
      setIsBreak(true);
      setSeconds(BREAK_SECONDS);
    } else {
      setIsBreak(false);
      setSeconds(WORK_SECONDS);
    }
  }, [seconds, isBreak, logSession]);

  const label = useMemo(() => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }, [seconds]);

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <section className="rounded-xl2 border border-gray-100 bg-white p-4">
        <h3 className="mb-2 font-semibold">Pomodoro {isBreak ? 'Break' : 'Focus'}</h3>
        <p className="mb-3 text-4xl font-semibold">{label}</p>
        <div className="mb-3 grid gap-2 text-sm">
          <input value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="Course ID" className="rounded-xl2 border border-gray-200 px-3 py-2" />
          <input value={noteId} onChange={(e) => setNoteId(e.target.value)} placeholder="Note ID" className="rounded-xl2 border border-gray-200 px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRunning((r) => !r)} className="rounded-xl2 bg-black px-3 py-2 text-sm text-white">
            {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={() => { setRunning(false); setSeconds(isBreak ? BREAK_SECONDS : WORK_SECONDS); }} className="rounded-xl2 border border-gray-200 px-3 py-2 text-sm">
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-xl2 border border-gray-100 bg-white p-4">
        <h3 className="mb-2 font-semibold">Today&apos;s focus history</h3>
        <div className="space-y-2 text-sm">
          {history.map((session) => (
            <div key={session.id} className="rounded-xl2 border border-gray-100 p-2">
              {new Date(session.completedAt).toLocaleTimeString()} · {session.durationMinutes}m · course {session.courseId ?? '—'} · note {session.noteId ?? '—'}
            </div>
          ))}
          {!history.length && <p className="text-gray-500">No sessions logged yet.</p>}
        </div>
      </section>
    </div>
  );
}
