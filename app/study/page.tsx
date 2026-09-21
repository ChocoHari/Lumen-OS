'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/components/AuthProvider';
import { RequireAuth } from '@/components/RequireAuth';
import { db, type Note } from '@/lib/db';
import { answerFromNotes, generateFlashcards, generateQuiz, type StudyAIResponse } from '@/lib/ai';

export default function StudyPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [flashcards, setFlashcards] = useState<StudyAIResponse['flashcards']>([]);
  const [quiz, setQuiz] = useState<StudyAIResponse['quiz']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    db.notes.where('userId').equals(user.id).toArray().then((items) => {
      setNotes(items.filter((note) => note.status === 'perfected'));
    });
  }, [user]);

  const courseIds = Array.from(new Set(notes.map((n) => n.courseId)));
  const context = notes
    .filter((n) => selectedCourses.length === 0 || selectedCourses.includes(n.courseId))
    .map((n) => n.contentText || '');

  async function askAI() {
    setError('');
    const trimmed = question.trim();
    if (!trimmed) {
      setError('Enter a question first.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/ai/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, context })
      });
      const data = (await response.json()) as StudyAIResponse;
      if (!response.ok) throw new Error(data.answer || 'Unable to generate study response.');
      setAnswer(data.answer);
      setFlashcards(data.flashcards);
      setQuiz(data.quiz);
    } catch (err) {
      const fallbackAnswer = answerFromNotes(trimmed, context);
      setAnswer(fallbackAnswer);
      setFlashcards(generateFlashcards(context));
      setQuiz(generateQuiz(context));
      setError(err instanceof Error ? err.message : 'AI request failed. Fallback used.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-bg p-5">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
          <Sidebar />
          <section>
            <TopBar title="AI Study Room" />
            <div className="rounded-xl2 border border-gray-100 bg-white p-4">
              <p className="mb-2 text-sm font-semibold">Select courses</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {courseIds.map((id) => (
                  <button
                    key={id}
                    onClick={() =>
                      setSelectedCourses((prev) =>
                        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs ${selectedCourses.includes(id) ? 'bg-black text-white' : 'bg-accent'}`}
                  >
                    Course {id}
                  </button>
                ))}
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question based on perfected notes..."
                className="mb-2 h-24 w-full rounded-xl2 border border-gray-200 p-3 text-sm"
              />
              <button onClick={askAI} disabled={loading} className="rounded-xl2 bg-black px-3 py-2 text-sm text-white">
                {loading ? 'Generating…' : 'Ask'}
              </button>
              {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}
              {answer && <pre className="mt-3 whitespace-pre-wrap rounded-xl2 bg-gray-50 p-3 text-sm">{answer}</pre>}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm font-semibold">Flashcards</p>
                  {(flashcards.length ? flashcards : generateFlashcards(context)).map((card) => (
                    <p key={card.id} className="text-xs">Q: {card.front} — A: {card.back}</p>
                  ))}
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold">Quiz</p>
                  {(quiz.length ? quiz : generateQuiz(context)).map((item, i) => (
                    <p key={i} className="text-xs">{item.question}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
