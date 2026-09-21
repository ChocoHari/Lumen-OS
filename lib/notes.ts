import mammoth from 'mammoth';
import { db, type NoteStatus } from '@/lib/db';
import { supabase } from '@/lib/supabase';

const MAX_NOTE_SIZE_BYTES = 20 * 1024 * 1024;
const SUPPORTED_NOTE_TYPES = new Set([
  'application/pdf',
  'text/markdown',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

export function validateNoteFile(file: File) {
  if (file.size > MAX_NOTE_SIZE_BYTES) {
    return { ok: false as const, error: 'File too large. Maximum size is 20MB.' };
  }
  if (
    !SUPPORTED_NOTE_TYPES.has(file.type) &&
    !file.name.endsWith('.pdf') &&
    !file.name.endsWith('.md') &&
    !file.name.endsWith('.txt') &&
    !file.name.endsWith('.docx')
  ) {
    return { ok: false as const, error: 'Unsupported file type. Upload PDF, DOCX, MD, or TXT.' };
  }
  return { ok: true as const };
}

export async function extractText(file: File): Promise<string> {
  if (file.type === 'text/markdown' || file.name.endsWith('.md') || file.type === 'text/plain') {
    return file.text();
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  }

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    return `PDF uploaded: ${file.name}\nText extraction is not configured yet, but the file is stored for preview and future processing.`;
  }

  return '';
}

export async function addNote(input: {
  courseId: number;
  file: File;
  userId?: string;
}) {
  const { courseId, file, userId } = input;
  const validation = validateNoteFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }
  const fileData = await file.arrayBuffer();
  const contentText = await extractText(file);
  let fileUrl: string | undefined;

  if (supabase && userId) {
    const objectPath = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('notes').upload(objectPath, file, {
      upsert: false
    });
    if (!error) {
      const { data } = supabase.storage.from('notes').getPublicUrl(objectPath);
      fileUrl = data.publicUrl;
    }
  }

  const now = new Date().toISOString();
  return db.notes.add({
    courseId,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileData,
    fileUrl,
    contentText,
    status: 'uploaded',
    userId,
    createdAt: now,
    updatedAt: now
  });
}

export async function updateNoteStatus(id: number, status: NoteStatus) {
  await db.notes.update(id, { status, updatedAt: new Date().toISOString() });
}
