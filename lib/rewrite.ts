import { db } from '@/lib/db';
import type { RewriteStatus } from '@/lib/db';

export async function saveRewrite(noteId: number, courseId: number, body: string, status: RewriteStatus = 'draft') {
  const now = new Date().toISOString();
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  if (status === 'perfected' && wordCount < 80) {
    throw new Error('Perfected rewrites require at least 80 words.');
  }

  const existing = await db.rewrites.where('noteId').equals(noteId).first();
  if (existing?.id) {
    await db.rewrites.update(existing.id, { body, wordCount, status, updatedAt: now });
  } else {
    const note = await db.notes.get(noteId);
    await db.rewrites.add({ noteId, courseId, body, wordCount, status, userId: note?.userId, updatedAt: now });
  }

  await db.notes.update(noteId, {
    status: status === 'perfected' ? 'perfected' : 'rewritten',
    updatedAt: now
  });
}
