'use client';

import { useState } from 'react';
import { addNote } from '@/lib/notes';

export function NotesUploader({ onUploaded }: { onUploaded: () => Promise<void> | void }) {
  const [courseId, setCourseId] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  async function upload() {
    if (!files?.length || !courseId) return;
    for (const file of Array.from(files)) {
      await addNote({ courseId: Number(courseId), file });
    }
    await onUploaded();
    setFiles(null);
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
      <button onClick={upload} className="rounded-xl2 bg-black px-3 py-2 text-sm text-white">
        Upload
      </button>
    </div>
  );
}
