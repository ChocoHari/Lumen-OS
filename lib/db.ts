import Dexie, { Table } from 'dexie';

export type NoteStatus = 'uploaded' | 'rewritten' | 'perfected';

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
}

export interface Rewrite {
  id?: number;
  noteId: number;
  courseId: number;
  body: string;
  wordCount: number;
  updatedAt: string;
}

export interface Assignment {
  id?: number;
  courseId: number;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'doing' | 'done';
  noteId?: number;
}

export interface Task {
  id?: number;
  assignmentId: number;
  title: string;
  done: boolean;
}

export interface FocusSession {
  id?: number;
  courseId?: number;
  noteId?: number;
  durationMinutes: number;
  completedAt: string;
}

class LumenDB extends Dexie {
  courses!: Table<Course, number>;
  notes!: Table<Note, number>;
  rewrites!: Table<Rewrite, number>;
  assignments!: Table<Assignment, number>;
  tasks!: Table<Task, number>;
  focusSessions!: Table<FocusSession, number>;

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
  }
}

export const db = new LumenDB();
