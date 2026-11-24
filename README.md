# Eccentric Ideator

Pair a design problem with a deliberately eccentric persona to break a workshop team out of predictable ideas.

1. **Problem** – describe the design problem.
2. **Persona** – an eccentric persona is invented to think about it.
3. **Ideas** – the persona proposes ideas; keep, annotate, or make them practical.
4. **Deep dive** – a panel of five stakeholders discusses an idea, and the idea (or the problem) is revised from the points you choose.

## Run locally

Requires Node.js 20 or later.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`
3. Start the app: `npm run dev`, then open http://localhost:3000

The server does not reload when files under `server/` change; restart it after editing prompts.

## Deploy to Vercel

1. Import this repository in Vercel. The settings in `vercel.json` are picked up automatically.
2. Add the environment variable `ANTHROPIC_API_KEY`.
3. Deploy.

The front end is a Vite build served from `dist/`. Every `/api/*` request runs the Express app in `server/app.ts` as one Vercel Function (`api/index.ts`).

## Where things are

- `server/prompts.ts` – every prompt and response schema
- `server/claude.ts` – the Anthropic client and the two model choices
- `server/routes/claude.ts` – the API endpoints
- `components/` – the screens
- `index.css` – theme colours and fonts
