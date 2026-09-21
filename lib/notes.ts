import mammoth from 'mammoth';
import { db, type NoteStatus } from '@/lib/db';
import { supabase } from '@/lib/supabase';

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

  return '';
}

export async function addNote(input: {
  courseId: number;
  file: File;
  userId?: string;
}) {
  const { courseId, file, userId } = input;
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

  return db.notes.add({
    courseId,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileData,
    fileUrl,
    contentText,
    status: 'uploaded',
    userId,
    createdAt: new Date().toISOString()
  });
}

export async function updateNoteStatus(id: number, status: NoteStatus) {
  await db.notes.update(id, { status });
}
