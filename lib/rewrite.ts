import { db } from '@/lib/db';

export async function saveRewrite(noteId: number, courseId: number, body: string) {
  const now = new Date().toISOString();
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  const existing = await db.rewrites.where('noteId').equals(noteId).first();
  if (existing?.id) {
    await db.rewrites.update(existing.id, { body, wordCount, updatedAt: now });
  } else {
    await db.rewrites.add({ noteId, courseId, body, wordCount, updatedAt: now });
  }

  await db.notes.update(noteId, { status: 'rewritten' });
}
