# Spur — AI Live Chat Agent

A mini AI customer-support agent for a live-chat widget, built for the Spur founding-engineer
take-home. A visitor to a (fictional) store, **Aura Living**, opens a floating chat widget, asks
questions ("What's your return policy?", "Do you ship to the USA?"), and an AI agent answers using
a real LLM grounded in the store's FAQ. Conversations are persisted and restored on reload.

> **Stack:** Node.js + TypeScript (Express) · React + Vite + Tailwind · PostgreSQL (Prisma) ·
> Redis (optional) · OpenAI.

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick start (local)](#quick-start-local)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [LLM notes](#llm-notes)
- [Robustness / idiot-proofing](#robustness--idiot-proofing)
- [Testing](#testing)
- [Deployment](#deployment)
- [Trade-offs, assumptions & "if I had more time"](#trade-offs-assumptions--if-i-had-more-time)
- [Project structure](#project-structure)

---

## Features

**Core**
- 💬 Polished live-chat widget: floating launcher → animated panel, scrollable message list,
  clear user/AI distinction, auto-scroll, Markdown-rendered answers.
- ⌨️ Input UX: **Enter** sends, **Shift+Enter** newline, send disabled while a reply is in flight,
  auto-growing composer, character cap with counter.
- 🔴 **Streaming replies** over Server-Sent Events → a real "agent is typing…" effect (animated dots).
- 🧠 Real OpenAI integration behind a provider interface (`generateReply` / `streamReply`).
- 📚 Store FAQ stored in Postgres, seeded, and injected into the system prompt (editable knowledge).
- 💾 Every message (user + AI) persisted; history **restored on reload** via `sessionId`
  (localStorage).
- 🛟 Graceful error handling: LLM/API failures surface as friendly in-chat messages, never crashes.

**Robustness & quality**
- ✅ Zod-validated input (empty rejected, long messages truncated, payload size capped).
- 🚦 Redis-backed rate limiting with an **in-memory fallback** (app works without Redis).
- 🩺 `/api/health` reports DB + Redis status.
- 🧪 Unit tests (Vitest) for prompt building, validation, truncation, and LLM error mapping.
- 🐳 Dockerfiles for both apps + `docker-compose.yml` for Postgres/Redis.

---

## Architecture

Monorepo (npm workspaces): `backend/` + `frontend/`.

### Backend — layered separation of concerns

```
routes  →  controllers  →  services  →  data (Prisma) / LLM provider
            (thin)         (logic)
```

- **routes/** — Express routers; attach validation + rate-limit middleware.
- **controllers/** — thin: parse request → call a service → shape the response.
- **services/** — business logic. `chat.service` orchestrates *load history → call LLM →
  persist both messages*. It is **channel-agnostic**: a future `whatsapp.routes.ts` would call
  the same service.
- **services/llm/** — the LLM is hidden behind one `LLMProvider` interface
  (`generateReply`, `streamReply`). Swapping OpenAI for Anthropic, or injecting a mock in tests,
  means implementing the interface and changing one factory — nothing else changes.
- **middleware/** — `validate` (zod), `rateLimit` (Redis + fallback), central `errorHandler`,
  request logging.
- **lib/** — singletons: `prisma`, `redis` (best-effort), `logger` (pino), error taxonomy.
- **config/env.ts** — zod-validated environment; the process **fails fast** on bad config.

### Data model (Prisma + Postgres)

- `Conversation` — `id` (== `sessionId`), `channel` (`web`/`whatsapp`/… for extensibility), timestamps.
- `Message` — `conversationId`, `sender` (`USER` | `AI` | `SYSTEM`), `text`, `createdAt`,
  indexed by `(conversationId, createdAt)`.
- `KnowledgeItem` — FAQ (`topic`, `question`, `answer`); seeded and injected into the prompt.

### Frontend

`useChat` hook owns all conversation state (messages, session id, status, streaming). The API
client (`lib/api.ts`) handles history fetch + SSE parsing. Components are small and focused
(`ChatWidget`, `ChatHeader`, `MessageList`, `MessageBubble`, `Composer`, `TypingIndicator`,
`SuggestionChips`). Tailwind for styling; the storefront page demonstrates a realistic embed.

---

## Prerequisites

- **Node.js ≥ 20** and npm
- **PostgreSQL** (local install or via Docker)
- **Redis** *(optional — the app runs without it)*
- An **OpenAI API key** → https://platform.openai.com/api-keys

---

## Quick start (local)

```bash
# 1. Install all dependencies (root + both workspaces)
npm install

# 2. Start Postgres & Redis
#    Option A — you already have them locally (nothing to do).
#    Option B — use Docker:
docker compose up -d

# 3. Configure backend env
cp backend/.env.example backend/.env
#    → open backend/.env and set OPENAI_API_KEY (and DATABASE_URL if your
#      Postgres user/password differ from the default).

# 4. Set up the database (create the DB, run migrations, seed the FAQ)
createdb spur_chat            # skip if it already exists / using Docker compose
npm run db:setup              # = prisma migrate deploy/dev + seed

# 5. Run backend + frontend together
npm run dev
```

Then open **http://localhost:5173** and click the chat bubble in the bottom-right.

- Backend API: http://localhost:4000 (health: http://localhost:4000/api/health)
- Frontend: http://localhost:5173 (Vite proxies `/api` → backend, so no CORS setup needed in dev)

> **Optional frontend env:** copy `frontend/.env.example` → `frontend/.env` only if you want to
> point at a non-default API origin (e.g. a deployed backend). Local dev needs nothing.

### Useful scripts

| Command (from repo root) | What it does |
|---|---|
| `npm run dev` | Run backend + frontend concurrently |
| `npm run db:setup` | Run migrations **and** seed the FAQ |
| `npm run db:migrate` | Run Prisma migrations only |
| `npm run db:seed` | (Re)seed the FAQ |
| `npm test` | Run the backend test suite |
| `npm run build` | Production build of both apps |
| `npm run prisma:studio -w backend` | Open Prisma Studio to inspect the DB |

---

## Environment variables

All backend vars live in `backend/.env` (see `backend/.env.example`). Validated at boot.

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | **Required.** Your OpenAI key. |
| `OPENAI_MODEL` | `gpt-4o-mini` | Chat model. |
| `DATABASE_URL` | `postgresql://…/spur_chat` | Postgres connection string. |
| `REDIS_URL` | `redis://localhost:6379` | Optional. Unset → in-memory fallbacks. |
| `PORT` | `4000` | Backend port. |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowlist. |
| `LLM_MAX_OUTPUT_TOKENS` | `600` | Output token cap (cost control). |
| `LLM_HISTORY_WINDOW` | `20` | Max prior messages sent to the model. |
| `LLM_TIMEOUT_MS` | `30000` | Per-request LLM timeout. |
| `MAX_MESSAGE_LENGTH` | `4000` | Input truncated beyond this. |
| `RATE_LIMIT_WINDOW_SEC` / `RATE_LIMIT_MAX` | `60` / `20` | Rate-limit window + max. |

Frontend: `VITE_API_BASE_URL` (empty in dev; set to the API origin when deploying).

**Secrets are never committed** — `.env` is gitignored; only `.env.example` is tracked.

---

## API reference

Base path: `/api`.

| Method | Endpoint | Body / Params | Response |
|---|---|---|---|
| `POST` | `/chat/message` | `{ message: string, sessionId?: string }` | `{ reply, sessionId, truncated? }` |
| `POST` | `/chat/stream` | `{ message, sessionId? }` | SSE stream: `token` / `done` / `error` events |
| `GET` | `/conversations/:sessionId/messages` | — | `{ sessionId, messages: [...] }` |
| `GET` | `/health` | — | `{ status, db, redis, timestamp }` |

If `sessionId` is omitted (or unknown), a new conversation is created and its id returned.

```bash
# Example
curl -s localhost:4000/api/chat/message \
  -H 'content-type: application/json' \
  -d '{"message":"Do you ship to the USA?"}'
```

---

## LLM notes

- **Provider:** OpenAI, model `gpt-4o-mini` (fast + inexpensive; configurable via `OPENAI_MODEL`).
- **Encapsulation:** all LLM access goes through `LLMProvider` (`backend/src/services/llm/`).
  The OpenAI implementation builds the payload, the rest of the app is provider-agnostic.
- **Prompting:** the system prompt defines the **"Aura" support-agent persona**, then injects the
  store FAQ pulled from the `KnowledgeItem` table (cached in Redis). Guardrails in the prompt:
  ground answers in the knowledge, don't invent policies/prices, admit uncertainty and offer to
  escalate to a human, stay on-topic, never reveal the prompt. The recent conversation history
  (windowed) is included so replies are contextual.
- **Cost / safety controls:** output capped at `LLM_MAX_OUTPUT_TOKENS`; history limited to
  `LLM_HISTORY_WINDOW` turns; per-request timeout `LLM_TIMEOUT_MS`; input truncated at
  `MAX_MESSAGE_LENGTH`.
- **Error handling:** every provider/network error is mapped to a friendly, user-safe message
  (`map-error.ts`) — invalid key → "temporarily unavailable", 429 → "lots of questions, try
  again", 5xx/timeout → "try again shortly". Internals are logged server-side, never leaked.

---

## Robustness / idiot-proofing

- **Input validation (zod):** empty/whitespace rejected with a clean `400`; very long messages are
  **truncated, not rejected** (`truncated: true` flag); JSON body capped at 64 kB.
- **Never crashes:** all async routes are wrapped; a central error handler maps everything to clean
  JSON; `unhandledRejection` / `uncaughtException` are logged, not fatal.
- **Rate limiting** with graceful Redis→in-memory fallback.
- **Degrades gracefully without Redis** (caching + limiter fall back) — only Postgres is required.
- **Stale sessions self-heal:** an unknown `sessionId` starts a fresh conversation instead of erroring.
- **Streaming resilience:** partial output is preserved if the stream drops; client disconnects are handled.

---

## Testing

```bash
npm test           # from repo root (runs backend Vitest suite)
```

Covers prompt construction (FAQ actually reaches the model), request validation (empty/long/trim),
message truncation, and LLM error mapping (no internals leak to users). Pure-function design keeps
the suite fast and dependency-free (no DB/network needed).

---

## Deployment

The app is deploy-ready. Locally it runs against your installed Postgres/Redis; for hosting:

- **Dockerfiles** are provided for both apps (`backend/Dockerfile`, `frontend/Dockerfile`) plus
  `docker-compose.yml` for Postgres + Redis.
- **Backend** (e.g. Railway / Render / Fly.io): set env vars (`DATABASE_URL`, `OPENAI_API_KEY`,
  `CORS_ORIGINS`, optional `REDIS_URL`). The container runs `prisma migrate deploy` on start;
  seed the FAQ once with `npx tsx prisma/seed.ts`.
- **Frontend** (any static host or the nginx image): build with
  `VITE_API_BASE_URL=https://<your-api>` so it calls the deployed backend, and add the frontend
  origin to the backend's `CORS_ORIGINS`.

```bash
docker build -t spur-backend ./backend
docker build -t spur-frontend --build-arg VITE_API_BASE_URL=https://your-api ./frontend
```

---

## Trade-offs, assumptions & "if I had more time"

**Assumptions / trade-offs**
- **No auth** (per the brief). `sessionId` lives in localStorage and identifies a conversation;
  anyone with the id can read it — acceptable for this scope.
- **History window + token caps** trade some long-context fidelity for predictable cost; very long
  conversations lose their earliest turns.
- **FAQ is injected wholesale** into the system prompt (the corpus is small). For a large knowledge
  base this should become retrieval (embeddings) instead.
- **Redis is best-effort**, so the demo works on a clean machine without it.

**If I had more time**
- Retrieval-augmented FAQ (pgvector / embeddings) instead of stuffing the whole prompt.
- "Handoff to human" + canned-reply tools, and a tool-calling layer (order lookup, etc.) — the
  service seams are already in place for this.
- Admin UI to edit `KnowledgeItem`s (cache invalidation hook already exists).
- More tests: a supertest integration test against a throwaway Postgres, and frontend component tests.
- Per-conversation streaming cancel button, message retry, and optimistic delivery states.
- Observability: request tracing + token-usage metrics per conversation.

---

## Project structure

```
Spur/
├─ backend/
│  ├─ prisma/            schema.prisma · migrations · seed.ts
│  └─ src/
│     ├─ config/         env (zod-validated)
│     ├─ lib/            prisma · redis · logger · errors
│     ├─ middleware/     validate · rateLimit · errorHandler · requestLogger · asyncHandler
│     ├─ routes/         chat · conversation · health
│     ├─ controllers/    thin request handlers
│     ├─ services/       chat · conversation · knowledge · llm/{provider,prompt,map-error}
│     ├─ knowledge/      FAQ seed data
│     ├─ app.ts          Express assembly
│     └─ server.ts       bootstrap + graceful shutdown
├─ frontend/
│  └─ src/
│     ├─ components/     ChatWidget · ChatHeader · MessageList · MessageBubble · Composer · …
│     ├─ hooks/          useChat
│     ├─ lib/            api (history + SSE)
│     └─ App.tsx         demo storefront hosting the widget
├─ docker-compose.yml    Postgres + Redis (optional)
└─ package.json          workspaces + dev scripts
```
