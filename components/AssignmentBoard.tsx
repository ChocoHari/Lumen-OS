'use client';

import { useEffect, useMemo, useState } from 'react';
import { db, type Assignment } from '@/lib/db';

export function AssignmentBoard() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [form, setForm] = useState({ courseId: 0, title: '', dueDate: '', priority: 'medium' as Assignment['priority'] });

  async function refresh() {
    setItems(await db.assignments.toArray());
  }

  useEffect(() => {
    refresh();
  }, []);

  const overdue = useMemo(
    () =>
      items.filter((item) => item.status !== 'done' && new Date(item.dueDate).getTime() < Date.now()).length,
    [items]
  );

  async function addAssignment() {
    if (!form.title || !form.dueDate) return;
    await db.assignments.add({ ...form, status: 'todo' });
    setForm({ courseId: 0, title: '', dueDate: '', priority: 'medium' });
    await refresh();
  }

  async function setStatus(id: number, status: Assignment['status']) {
    await db.assignments.update(id, { status });
    await refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <section className="rounded-xl2 border border-gray-100 bg-white p-4">
        <h3 className="mb-3 font-semibold">Add assignment</h3>
        <div className="grid gap-2 text-sm">
          <input placeholder="Course ID" className="rounded-xl2 border border-gray-200 px-3 py-2" value={form.courseId || ''} onChange={(e) => setForm((s) => ({ ...s, courseId: Number(e.target.value) }))} />
          <input placeholder="Title" className="rounded-xl2 border border-gray-200 px-3 py-2" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
          <input type="date" className="rounded-xl2 border border-gray-200 px-3 py-2" value={form.dueDate} onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))} />
          <select className="rounded-xl2 border border-gray-200 px-3 py-2" value={form.priority} onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value as Assignment['priority'] }))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={addAssignment} className="rounded-xl2 bg-black px-3 py-2 text-white">
            Add
          </button>
        </div>
        <p className="mt-3 text-xs text-red-600">Overdue alerts: {overdue}</p>
      </section>

      <section className="rounded-xl2 border border-gray-100 bg-white p-4">
        <h3 className="mb-3 font-semibold">Board</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {(['todo', 'doing', 'done'] as const).map((status) => (
            <div key={status} className="rounded-xl2 border border-gray-100 p-3">
              <p className="mb-2 text-sm font-semibold capitalize">{status}</p>
              {items
                .filter((item) => item.status === status)
                .map((item) => (
                  <article key={item.id} className="mb-2 rounded-xl2 border border-gray-100 p-2 text-xs">
                    <p className="font-semibold">{item.title}</p>
                    <p>Due: {item.dueDate}</p>
                    <p>Priority: {item.priority}</p>
                    <p>Course ID: {item.courseId}</p>
                    <div className="mt-1 flex gap-1">
                      {(['todo', 'doing', 'done'] as const).map((s) => (
                        <button key={s} onClick={() => item.id && setStatus(item.id, s)} className="rounded bg-gray-100 px-2 py-1">
                          {s}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
