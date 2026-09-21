'use client';

import ReactMarkdown from 'react-markdown';
import { useMemo, useState } from 'react';
import { updateNoteStatus } from '@/lib/notes';
import { type Note, type NoteStatus } from '@/lib/db';

const statuses: NoteStatus[] = ['uploaded', 'rewritten', 'perfected'];

function bufferToBlobUrl(data: ArrayBuffer, mimeType: string) {
  return URL.createObjectURL(new Blob([data], { type: mimeType }));
}

export function NotesViewer({ notes, onUpdated }: { notes: Note[]; onUpdated: () => Promise<void> | void }) {
  const [selectedId, setSelectedId] = useState<number | null>(notes[0]?.id ?? null);
  const selected = notes.find((n) => n.id === selectedId) ?? notes[0];

  const previewUrl = useMemo(() => {
    if (!selected) return '';
    if (selected.fileUrl) return selected.fileUrl;
    return bufferToBlobUrl(selected.fileData, selected.mimeType);
  }, [selected]);

  if (!notes.length) {
    return <div className="rounded-xl2 border border-gray-100 bg-white p-4 text-sm text-gray-500">No notes yet.</div>;
  }

  async function changeStatus(status: NoteStatus) {
    if (!selected?.id) return;
    await updateNoteStatus(selected.id, status);
    await onUpdated();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-xl2 border border-gray-100 bg-white p-3">
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => setSelectedId(note.id ?? null)}
            className={`mb-2 w-full rounded-xl2 px-3 py-2 text-left text-sm ${
              selected?.id === note.id ? 'bg-black text-white' : 'hover:bg-gray-50'
            }`}
          >
            {note.fileName}
          </button>
        ))}
      </aside>
      <article className="rounded-xl2 border border-gray-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">{selected.fileName}</h3>
          <select
            value={selected.status}
            onChange={(e) => changeStatus(e.target.value as NoteStatus)}
            className="rounded-xl2 border border-gray-200 px-2 py-1 text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {selected.mimeType.includes('pdf') ? (
          <iframe src={previewUrl} className="h-[500px] w-full rounded-xl2 border border-gray-100" title="pdf" />
        ) : selected.fileName.endsWith('.md') || selected.mimeType.includes('markdown') ? (
          <div className="prose max-w-none text-sm">
            <ReactMarkdown>{selected.contentText || ''}</ReactMarkdown>
          </div>
        ) : selected.fileName.endsWith('.txt') || selected.mimeType.startsWith('text/plain') ? (
          <pre className="whitespace-pre-wrap text-sm">{selected.contentText}</pre>
        ) : selected.fileName.endsWith('.docx') ? (
          <div className="text-sm text-gray-500">DOCX preview placeholder (text extracted for rewrite).</div>
        ) : (
          <div className="text-sm text-gray-500">Preview not available.</div>
        )}
      </article>
    </div>
  );
}
