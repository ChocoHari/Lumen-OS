'use client';

import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { db, type Note, type Rewrite, type RewriteStatus } from '@/lib/db';
import { saveRewrite } from '@/lib/rewrite';

export function RewriteEditor() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [rewrite, setRewrite] = useState('');
  const [status, setStatus] = useState<RewriteStatus>('draft');
  const [lastEdited, setLastEdited] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    db.notes.where('userId').equals(user.id).toArray().then((list) => {
      setNotes(list);
      setSelectedNoteId(list[0]?.id ?? null);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedNoteId) return;
    db.rewrites
      .where('noteId')
      .equals(selectedNoteId)
      .first()
      .then((r: Rewrite | undefined) => {
        setRewrite(r?.body ?? '');
        setStatus(r?.status ?? 'draft');
        setLastEdited(r?.updatedAt ?? '');
      });
  }, [selectedNoteId]);

  const selected = notes.find((note) => note.id === selectedNoteId);
  const wordCount = rewrite.trim() ? rewrite.trim().split(/\s+/).length : 0;

  async function persist(nextStatus = status) {
    if (!selected?.id) return;
    try {
      await saveRewrite(selected.id, selected.courseId, rewrite, nextStatus);
      setStatus(nextStatus);
      setLastEdited(new Date().toISOString());
      setMessage(nextStatus === 'perfected' ? 'Perfected and promoted to Notes Vault.' : 'Saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    }
  }

  useEffect(() => {
    if (!selected?.id) return;
    const timeout = setTimeout(() => {
      if (!rewrite.trim()) return;
      persist(status);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [rewrite, selected?.id, status]);

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr_1fr]">
      <aside className="rounded-xl2 border border-gray-100 bg-white p-3">
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => setSelectedNoteId(note.id ?? null)}
            className={`mb-2 w-full rounded-xl2 px-3 py-2 text-left text-sm ${
              selectedNoteId === note.id ? 'bg-black text-white' : 'hover:bg-gray-50'
            }`}
          >
            {note.fileName}
          </button>
        ))}
      </aside>
      <article className="rounded-xl2 border border-gray-100 bg-white p-4">
        <h3 className="mb-2 font-semibold">Original</h3>
        <div className="h-[420px] overflow-auto text-sm text-gray-700">{selected?.contentText || 'No note selected.'}</div>
      </article>
      <article className="rounded-xl2 border border-gray-100 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Rewrite</h3>
          <button onClick={() => persist(status)} className="rounded-xl2 bg-black px-3 py-1 text-xs text-white">
            Save
          </button>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RewriteStatus)}
            className="rounded-xl2 border border-gray-200 px-2 py-1 text-xs"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="perfected">Perfected</option>
          </select>
          <button onClick={() => persist('published')} className="rounded-xl2 border border-gray-200 px-2 py-1 text-xs">
            Publish
          </button>
          <button onClick={() => persist('perfected')} className="rounded-xl2 border border-gray-200 px-2 py-1 text-xs">
            Perfect
          </button>
        </div>
        <textarea
          value={rewrite}
          onChange={(e) => setRewrite(e.target.value)}
          className="mb-2 h-40 w-full rounded-xl2 border border-gray-200 p-3 text-sm"
          placeholder="Rewrite for mastery..."
        />
        <p className="mb-3 text-xs text-gray-500">Word count: {wordCount} · Last edited: {lastEdited || '—'}</p>
        {message && <p className="mb-2 text-xs text-gray-600">{message}</p>}
        <div className="prose max-w-none rounded-xl2 border border-gray-100 p-3 text-sm">
          <ReactMarkdown>{rewrite || '_Preview will appear here_'}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
