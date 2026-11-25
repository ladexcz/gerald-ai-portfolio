import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { SYSTEM_PROMPT } from '@/lib/prompt';

export const maxDuration = 30;

const MAX_HISTORY = 16; // messages kept from the conversation
const MAX_CHARS = 2000; // per text part, keeps a pasted essay from eating the budget

function pickModel() {
  if (process.env.GROQ_API_KEY) {
    // Llama 3.3 70B is no longer served on this Groq account (checked 2026-11-25).
    return groq(process.env.GROQ_MODEL || 'openai/gpt-oss-120b');
  }
  if (process.env.OPENAI_API_KEY) {
    return openai(process.env.OPENAI_MODEL || 'gpt-4o-mini');
  }
  return null;
}

function trim(messages: UIMessage[]): UIMessage[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_HISTORY)
    .map((m) => ({
      ...m,
      parts: m.parts
        .filter((p) => p.type === 'text')
        .map((p) => (p.type === 'text' ? { ...p, text: p.text.slice(0, MAX_CHARS) } : p)),
    }));
}

export async function POST(req: Request) {
  const model = pickModel();
  if (!model) {
    return Response.json(
      { error: 'No AI key set. Add GROQ_API_KEY or OPENAI_API_KEY to .env and restart.' },
      { status: 500 },
    );
  }

  let messages: UIMessage[];
  try {
    const body = (await req.json()) as { messages?: UIMessage[] };
    if (!Array.isArray(body.messages)) throw new Error('messages missing');
    messages = trim(body.messages);
  } catch {
    return Response.json({ error: 'Send a JSON body with a messages array.' }, { status: 400 });
  }

  const result = streamText({
    model,
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
    maxOutputTokens: 600,
    // gpt-oss reasons before answering; keep that short so the 600-token budget goes to the reply.
    providerOptions: { groq: { reasoningEffort: 'low' } },
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error('[chat]', error);
      return 'The AI service did not answer. Try again in a moment.';
    },
  });
}
