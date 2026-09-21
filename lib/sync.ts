import { db, type Assignment, type Course, type FocusSession, type Note, type Rewrite, type Task } from '@/lib/db';
import { supabase } from '@/lib/supabase';

type SyncResult = {
  ok: boolean;
  syncedAt: string;
  error?: string;
};

async function writeSyncMeta(key: string, value: string) {
  await db.syncMeta.put({ key, value, updatedAt: new Date().toISOString() });
}

function nowIso() {
  return new Date().toISOString();
}

export async function syncAllWithSupabase(userId: string): Promise<SyncResult> {
  if (!supabase) {
    return { ok: true, syncedAt: nowIso() };
  }

  try {
    const syncedAt = nowIso();
    await db.transaction('rw', db.courses, db.notes, db.rewrites, db.assignments, db.tasks, db.focusSessions, async () => {
      await db.courses.toCollection().modify((item: { userId?: string }) => {
        if (!item.userId) item.userId = userId;
      });
      await db.notes.toCollection().modify((item: { userId?: string }) => {
        if (!item.userId) item.userId = userId;
      });
      await db.rewrites.toCollection().modify((item: { userId?: string }) => {
        if (!item.userId) item.userId = userId;
      });
      await db.assignments.toCollection().modify((item: { userId?: string }) => {
        if (!item.userId) item.userId = userId;
      });
      await db.tasks.toCollection().modify((item: { userId?: string }) => {
        if (!item.userId) item.userId = userId;
      });
      await db.focusSessions.toCollection().modify((item: { userId?: string }) => {
        if (!item.userId) item.userId = userId;
      });
    });

    const localCourses = await db.courses.where('userId').equals(userId).toArray();
    const coursesPayload = localCourses.map(({ id, ...course }) => ({
      ...course,
      user_id: userId,
      created_at: course.createdAt,
      updated_at: course.updatedAt
    }));

    if (coursesPayload.length > 0) {
      await supabase.from('courses').upsert(coursesPayload, { onConflict: 'user_id,code' });
    }

    const localNotes = await db.notes.where('userId').equals(userId).toArray();
    const notesPayload = localNotes.map(({ id, fileData, ...note }) => ({
      ...note,
      user_id: userId,
      course_id: note.courseId,
      file_name: note.fileName,
      mime_type: note.mimeType,
      file_url: note.fileUrl,
      content_text: note.contentText,
      created_at: note.createdAt,
      updated_at: note.updatedAt
    }));
    if (notesPayload.length > 0) {
      await supabase.from('notes').upsert(notesPayload, { onConflict: 'user_id,file_name,created_at' });
    }

    const localRewrites = await db.rewrites.where('userId').equals(userId).toArray();
    const rewritesPayload = localRewrites.map(({ id, ...rewrite }) => ({
      ...rewrite,
      user_id: userId,
      note_id: rewrite.noteId,
      course_id: rewrite.courseId,
      word_count: rewrite.wordCount,
      updated_at: rewrite.updatedAt
    }));
    if (rewritesPayload.length > 0) {
      await supabase.from('rewrites').upsert(rewritesPayload, { onConflict: 'user_id,note_id' });
    }

    const localAssignments = await db.assignments.where('userId').equals(userId).toArray();
    const assignmentsPayload = localAssignments.map(({ id, ...assignment }) => ({
      ...assignment,
      user_id: userId,
      course_id: assignment.courseId,
      due_date: assignment.dueDate,
      note_id: assignment.noteId,
      created_at: assignment.createdAt,
      updated_at: assignment.updatedAt
    }));
    if (assignmentsPayload.length > 0) {
      await supabase.from('assignments').upsert(assignmentsPayload, { onConflict: 'user_id,course_id,title,created_at' });
    }

    const localTasks = await db.tasks.where('userId').equals(userId).toArray();
    const tasksPayload = localTasks.map(({ id, ...task }) => ({
      ...task,
      user_id: userId,
      assignment_id: task.assignmentId,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    }));
    if (tasksPayload.length > 0) {
      await supabase.from('tasks').upsert(tasksPayload, { onConflict: 'user_id,assignment_id,title,created_at' });
    }

    const localFocusSessions = await db.focusSessions.where('userId').equals(userId).toArray();
    const focusPayload = localFocusSessions.map(({ id, ...session }) => ({
      ...session,
      user_id: userId,
      course_id: session.courseId,
      note_id: session.noteId,
      duration_minutes: session.durationMinutes,
      completed_at: session.completedAt
    }));
    if (focusPayload.length > 0) {
      await supabase.from('focus_sessions').upsert(focusPayload, { onConflict: 'user_id,completed_at,course_id,note_id' });
    }

    const [{ data: courses }, { data: notes }, { data: rewrites }, { data: assignments }, { data: tasks }, { data: sessions }] = await Promise.all([
      supabase.from('courses').select('*').eq('user_id', userId),
      supabase.from('notes').select('*').eq('user_id', userId),
      supabase.from('rewrites').select('*').eq('user_id', userId),
      supabase.from('assignments').select('*').eq('user_id', userId),
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('focus_sessions').select('*').eq('user_id', userId)
    ]);

    await db.transaction('rw', db.courses, db.notes, db.rewrites, db.assignments, db.tasks, db.focusSessions, async () => {
      if (courses) {
        await db.courses.clear();
        const normalizedCourses: Course[] = courses.map((course) => ({
          id: Number(course.id),
          userId: course.user_id,
          code: course.code,
          name: course.name,
          lecturer: course.lecturer,
          room: course.room,
          credits: course.credits,
          progress: course.progress,
          createdAt: course.created_at,
          updatedAt: course.updated_at ?? course.created_at
        }));
        await db.courses.bulkPut(normalizedCourses);
      }

      if (notes) {
        await db.notes.clear();
        const normalizedNotes: Note[] = notes.map((note) => ({
          id: Number(note.id),
          userId: note.user_id,
          courseId: Number(note.course_id),
          fileName: note.file_name,
          mimeType: note.mime_type,
          fileData: new ArrayBuffer(0),
          fileUrl: note.file_url ?? undefined,
          contentText: note.content_text ?? undefined,
          status: note.status,
          createdAt: note.created_at,
          updatedAt: note.updated_at ?? note.created_at
        }));
        await db.notes.bulkPut(normalizedNotes);
      }

      if (rewrites) {
        await db.rewrites.clear();
        const normalizedRewrites: Rewrite[] = rewrites.map((rewrite) => ({
          id: Number(rewrite.id),
          userId: rewrite.user_id,
          noteId: Number(rewrite.note_id),
          courseId: Number(rewrite.course_id),
          body: rewrite.body,
          wordCount: rewrite.word_count,
          status: rewrite.status,
          updatedAt: rewrite.updated_at
        }));
        await db.rewrites.bulkPut(normalizedRewrites);
      }

      if (assignments) {
        await db.assignments.clear();
        const normalizedAssignments: Assignment[] = assignments.map((assignment) => ({
          id: Number(assignment.id),
          userId: assignment.user_id,
          courseId: Number(assignment.course_id),
          title: assignment.title,
          dueDate: assignment.due_date,
          priority: assignment.priority,
          status: assignment.status,
          noteId: assignment.note_id ?? undefined,
          createdAt: assignment.created_at,
          updatedAt: assignment.updated_at ?? assignment.created_at
        }));
        await db.assignments.bulkPut(normalizedAssignments);
      }

      if (tasks) {
        await db.tasks.clear();
        const normalizedTasks: Task[] = tasks.map((task) => ({
          id: Number(task.id),
          userId: task.user_id,
          assignmentId: Number(task.assignment_id),
          title: task.title,
          done: task.done,
          createdAt: task.created_at,
          updatedAt: task.updated_at ?? task.created_at
        }));
        await db.tasks.bulkPut(normalizedTasks);
      }

      if (sessions) {
        await db.focusSessions.clear();
        const normalizedSessions: FocusSession[] = sessions.map((session) => ({
          id: Number(session.id),
          userId: session.user_id ?? undefined,
          courseId: session.course_id ? Number(session.course_id) : undefined,
          noteId: session.note_id ? Number(session.note_id) : undefined,
          durationMinutes: session.duration_minutes,
          completedAt: session.completed_at
        }));
        await db.focusSessions.bulkPut(normalizedSessions);
      }
    });

    await writeSyncMeta('last_sync_at', syncedAt);
    return { ok: true, syncedAt };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    await writeSyncMeta('last_sync_error', message);
    return { ok: false, syncedAt: nowIso(), error: message };
  }
}

export async function getSyncMeta(key: string) {
  return db.syncMeta.get(key);
}
