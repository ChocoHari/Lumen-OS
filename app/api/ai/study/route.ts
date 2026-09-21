import { NextResponse } from 'next/server';
import { localStudyFallback, type StudyAIResponse } from '@/lib/ai';

type RequestPayload = {
  question?: string;
  context?: string[];
};

function buildPrompt(question: string, context: string[]) {
  const joined = context.join('\n').slice(0, 10000);
  return `You are a study assistant. Answer the question using the provided notes context only.
Return strict JSON with keys: answer, flashcards, quiz.
flashcards: array of {id:number, front:string, back:string}, max 5.
quiz: array of {question:string, answer:string}, max 5.

Question:
${question}

Notes context:
${joined || 'No context provided.'}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestPayload;
  const question = body.question?.trim() ?? '';
  const context = Array.isArray(body.context) ? body.context.filter(Boolean) : [];

  if (!question) {
    return NextResponse.json(localStudyFallback('No question provided.', context), { status: 400 });
  }

  const endpoint = process.env.AI_API_ENDPOINT;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!endpoint || !apiKey) {
    return NextResponse.json(localStudyFallback(question, context), { status: 200 });
  }

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: buildPrompt(question, context) }],
        temperature: 0.2
      })
    });

    if (!upstream.ok) {
      const fallback = localStudyFallback(question, context);
      return NextResponse.json(fallback, { status: 200 });
    }

    const data = await upstream.json();
    const text = data?.choices?.[0]?.message?.content as string | undefined;
    if (!text) {
      return NextResponse.json(localStudyFallback(question, context), { status: 200 });
    }

    const parsed = JSON.parse(text) as StudyAIResponse;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(localStudyFallback(question, context), { status: 200 });
  }
}
