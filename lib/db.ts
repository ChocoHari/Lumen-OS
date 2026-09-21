import Dexie, { Table } from 'dexie';

export type NoteStatus = 'uploaded' | 'rewritten' | 'perfected';
export type RewriteStatus = 'draft' | 'published' | 'perfected';

export interface Course {
  id?: number;
  userId?: string;
  code: string;
  name: string;
  lecturer: string;
  room: string;
  credits: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id?: number;
  userId?: string;
  courseId: number;
  fileName: string;
  mimeType: string;
  fileData: ArrayBuffer;
  fileUrl?: string;
  contentText?: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Rewrite {
  id?: number;
  userId?: string;
  noteId: number;
  courseId: number;
  body: string;
  wordCount: number;
  status: RewriteStatus;
  updatedAt: string;
}

export interface Assignment {
  id?: number;
  userId?: string;
  courseId: number;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'doing' | 'done';
  noteId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id?: number;
  userId?: string;
  assignmentId: number;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id?: number;
  userId?: string;
  courseId?: number;
  noteId?: number;
  durationMinutes: number;
  completedAt: string;
}

export interface SyncMeta {
  key: string;
  value: string;
  updatedAt: string;
}

class LumenDB extends Dexie {
  courses!: Table<Course, number>;
  notes!: Table<Note, number>;
  rewrites!: Table<Rewrite, number>;
  assignments!: Table<Assignment, number>;
  tasks!: Table<Task, number>;
  focusSessions!: Table<FocusSession, number>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super('lumen-db');
    this.version(1).stores({
      courses: '++id, code, name, createdAt'
    });
    this.version(2).stores({
      courses: '++id, code, name, createdAt, userId',
      notes: '++id, courseId, status, createdAt, userId'
    });
    this.version(3).stores({
      courses: '++id, code, name, createdAt, userId',
      notes: '++id, courseId, status, createdAt, userId',
      rewrites: '++id, noteId, courseId, updatedAt',
      assignments: '++id, courseId, dueDate, status, priority',
      tasks: '++id, assignmentId, done',
      focusSessions: '++id, courseId, noteId, completedAt'
    });
    this.version(4)
      .stores({
        courses: '++id, code, name, createdAt, updatedAt, userId',
        notes: '++id, courseId, status, createdAt, updatedAt, userId',
        rewrites: '++id, noteId, courseId, status, updatedAt, userId',
        assignments: '++id, courseId, dueDate, status, priority, createdAt, updatedAt, userId',
        tasks: '++id, assignmentId, done, createdAt, updatedAt, userId',
        focusSessions: '++id, courseId, noteId, completedAt, userId',
        syncMeta: '&key, updatedAt'
      })
      .upgrade(async (tx) => {
        const now = new Date().toISOString();
        await tx.table('courses').toCollection().modify((course: Partial<Course>) => {
          course.updatedAt = course.updatedAt || course.createdAt || now;
        });
        await tx.table('notes').toCollection().modify((note: Partial<Note>) => {
          note.updatedAt = note.updatedAt || note.createdAt || now;
        });
        await tx.table('rewrites').toCollection().modify((rewrite: Partial<Rewrite>) => {
          rewrite.status = rewrite.status || 'draft';
          rewrite.updatedAt = rewrite.updatedAt || now;
        });
        await tx.table('assignments').toCollection().modify((assignment: Partial<Assignment>) => {
          assignment.createdAt = assignment.createdAt || now;
          assignment.updatedAt = assignment.updatedAt || assignment.createdAt || now;
        });
        await tx.table('tasks').toCollection().modify((task: Partial<Task>) => {
          task.createdAt = task.createdAt || now;
          task.updatedAt = task.updatedAt || task.createdAt || now;
        });
      });
  }
}

export const db = new LumenDB();
