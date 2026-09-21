export function answerFromNotes(question: string, context: string[]) {
  const basis = context.filter(Boolean).join('\n').slice(0, 1600);
  return `Mock AI answer for: "${question}"\n\nBased on your notes:\n${basis || 'No note excerpts available yet.'}`;
}

export function generateFlashcards(context: string[]) {
  const joined = context.join(' ');
  const words = joined.split(/\s+/).filter((w) => w.length > 5).slice(0, 3);
  return words.map((word, i) => ({
    id: i + 1,
    front: `Define: ${word}`,
    back: `Use your course context to explain ${word} in your own words.`
  }));
}

export function generateQuiz(context: string[]) {
  const topic = context.join(' ').split(/\s+/).slice(0, 8).join(' ') || 'your notes';
  return [
    {
      question: `Summarize the core idea of ${topic}.`,
      answer: 'Write a 3-5 sentence summary from memory.'
    }
  ];
}
