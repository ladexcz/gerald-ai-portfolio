# Gerald Cahanza: AI-native portfolio

A one-screen portfolio where visitors talk to Gerald's animated avatar instead of scrolling
sections. Bio, projects, skills and contact details come out through the conversation, and the
avatar steers people toward a free discovery call.

Built with Next.js 15 (App Router), Vercel AI SDK 7, Framer Motion and lucide-react.

## Run it locally

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Open `.env` and set **one** key:

| Variable | Where to get it | Default model |
|---|---|---|
| `GROQ_API_KEY` | https://console.groq.com/keys | `openai/gpt-oss-120b` |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | `gpt-4o-mini` |

Groq is used when both are set. Override the model with `GROQ_MODEL` or `OPENAI_MODEL`.
(Groq retired Llama 3.1 70B; Llama 3.3 70B is its replacement.)

```bash
npm run dev               # http://localhost:3000
```

Without a key the page still loads, and the chat shows a "try again or email me" message.

## Where things live

| File | What it does |
|---|---|
| `app/page.tsx` | The intro screen (avatar, greeting, suggestion chips, input) and the chat thread |
| `components/Avatar.tsx` | The SVG character: breathing, blinking, eyes that follow the pointer, thinking tilt, talking mouth, smile after a reply |
| `components/ChatMessage.tsx` | Visitor lines (left, plain) and avatar replies (right, cyan-edged bubble, markdown) |
| `components/Composer.tsx` | The input: Enter sends, Shift+Enter adds a line, a stop button while replying |
| `app/api/chat/route.ts` | Streams the reply from Groq or OpenAI with the system prompt |
| `lib/prompt.ts` | **The knowledge base.** Resume text, contact details and reply rules. Edit this when the CV changes |
| `lib/links.ts` | Calendly, email and LinkedIn links used by the header and error message |

## Deploy to Render

1. Push this folder to a GitHub repository.
2. In Render, choose **New > Blueprint** and pick the repo. `render.yaml` sets up a Node web
   service (`npm install && npm run build`, then `npm start`).
3. When Render asks, paste `GROQ_API_KEY` (or `OPENAI_API_KEY`).
4. After the first deploy, add `NEXT_PUBLIC_SITE_URL` with the live URL so share previews
   point at the right address, then redeploy.

Manual setup works too: **New > Web Service**, runtime Node, build command
`npm install && npm run build`, start command `npm start`.

Render's free plan sleeps after inactivity, so the first visit after a quiet spell takes a few
seconds to wake up.

## Deploy to Vercel

Import the repo at https://vercel.com/new, add the same environment variable, deploy. No
`vercel.json` is needed: the chat route sets its own `maxDuration`.

## Still to do

- Swap the cartoon for a likeness of Gerald if wanted (the SVG in `components/Avatar.tsx`
  uses colours at the top of the file for skin, hair and shirt).
- Set `NEXT_PUBLIC_SITE_URL` once there is a domain.
- Put a spending limit on the AI provider account. The route caps history and reply length but
  has no per-visitor rate limit.
