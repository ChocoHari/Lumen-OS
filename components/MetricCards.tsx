import type { FocusSession, Note } from '@/lib/db';

function calculateStreak(sessions: FocusSession[]) {
  const dates = new Set(sessions.map((s) => s.completedAt.slice(0, 10)));
  let streak = 0;
  const day = new Date();
  while (true) {
    const key = day.toISOString().slice(0, 10);
    if (dates.has(key)) {
      streak += 1;
      day.setDate(day.getDate() - 1);
      continue;
    }
    break;
  }
  return streak;
}

export function MetricCards({ perfectedCount, focusMinutes, sessions }: { perfectedCount: number; focusMinutes: number; sessions: FocusSession[] }) {
  const cards = [
    { label: 'Streak', value: `${calculateStreak(sessions)}d` },
    { label: 'Perfected', value: perfectedCount.toString() },
    { label: 'Focus', value: `${focusMinutes}m` }
  ];

  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl2 border border-gray-100 bg-white p-4 transition hover:shadow-sm">
          <p className="text-xs text-gray-500">{card.label}</p>
          <p className="text-2xl font-semibold">{card.value}</p>
        </article>
      ))}
    </div>
  );
}

export function countPerfected(notes: Note[]) {
  return notes.filter((note) => note.status === 'perfected').length;
}
