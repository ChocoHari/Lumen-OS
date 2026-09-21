'use client';

import { useState } from 'react';
import { addNote, validateNoteFile } from '@/lib/notes';

export function NotesUploader({ onUploaded, userId }: { onUploaded: () => Promise<void> | void; userId?: string }) {
  const [courseId, setCourseId] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function upload() {
    if (!files?.length || !courseId) return;
    setMessage('');
    setIsUploading(true);
    for (const file of Array.from(files)) {
      const validation = validateNoteFile(file);
      if (!validation.ok) {
        setMessage(validation.error);
        setIsUploading(false);
        return;
      }
      await addNote({ courseId: Number(courseId), file, userId });
    }
    await onUploaded();
    setFiles(null);
    setMessage('Upload complete.');
    setIsUploading(false);
  }

  return (
    <div className="rounded-xl2 border border-dashed border-gray-300 bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold">Upload Notes</h3>
      <input
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        placeholder="Course ID"
        className="mb-2 w-full rounded-xl2 border border-gray-200 px-3 py-2 text-sm"
      />
      <input
        type="file"
        accept=".pdf,.md,.docx,.txt"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="mb-3 text-sm"
      />
      <button onClick={upload} disabled={isUploading} className="rounded-xl2 bg-black px-3 py-2 text-sm text-white disabled:opacity-60">
        {isUploading ? 'Uploading…' : 'Upload'}
      </button>
      {message && <p className="mt-2 text-xs text-gray-600">{message}</p>}
    </div>
  );
}
