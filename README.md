# DocPilot

Upload a PDF, ask questions about it, get streamed answers grounded in the document's actual
content.

**Stack:** Next.js 16 (BFF) · Fastify (API) · PostgreSQL 17 + pgvector · Drizzle ORM ·
Claude Opus 5 (streaming Q&A) · Voyage AI (embeddings) · AWS S3 (presigned uploads).

There is no login — the app runs as a single fixed user.

```
Browser ──Server Actions/fetch──▶ Next.js (BFF) ────────────▶ Fastify API
                                                                     │
                                          ┌──────────────┬──────────┼──────────┐
                                          ▼              ▼          ▼          ▼
                                     PostgreSQL         S3     Claude API  Voyage AI
                                     + pgvector
```

- **Next.js is a BFF, not just a frontend.** It proxies calls to the API — the browser never
  talks to Fastify or S3 directly.
- **Uploads go straight to S3** via a presigned PUT URL; file bytes never pass through a server.
- **RAG, not "paste the whole document in."** Chunks are embedded with Voyage AI and retrieved by
  similarity from pgvector instead of stuffing the whole document into every prompt.
- **Answers stream** token-by-token from Claude over SSE.

## Getting started

**Prerequisites:** Node 22+ (see `.nvmrc`), Docker, and API keys for AWS S3, Anthropic, and
Voyage AI.

```bash
git clone git@github.com:lisandrozanni/docpilot.git
cd docpilot
npm install

docker compose up -d                        # PostgreSQL (pgvector-enabled)

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# fill in apps/api/.env — AWS/Anthropic/Voyage keys

npm run db:migrate --workspace=@docpilot/api

npm run dev --workspace=@docpilot/api       # http://localhost:3001
npm run dev --workspace=@docpilot/web       # http://localhost:3000
```

Open `http://localhost:3000` — you'll land straight on `/documents`, no login required.

## Project structure

```
docpilot/
├── apps/
│   ├── web/          Next.js 16 (App Router) — BFF, UI
│   └── api/           Fastify — routes → service → repository, per domain
├── packages/shared/    Zod schemas shared between web, api, and RHF forms
└── docker-compose.yml  Postgres 17 + pgvector, dev only
```

## Testing

```bash
npm run test                                        # unit tests, all workspaces
npm run test:integration --workspace=@docpilot/api   # Testcontainers: real ephemeral Postgres
npm run test:e2e --workspace=@docpilot/web           # Playwright, real browser
```

CI (`.github/workflows/ci.yml`) runs lint/typecheck/unit in parallel, then integration, then a
production build, then e2e.

## Notable decisions

- **Separate Fastify API** instead of Next.js Route Handlers — PDF processing/embedding is
  background work that doesn't fit request/response.
- **Drizzle over Prisma** — SQL close to 1:1 with what actually runs.
- **pgvector** instead of a dedicated vector database — one database to operate and back up.
- **No login.** The app previously had Google OAuth via Better Auth; it was removed to keep the
  project runnable without external OAuth credentials, so it now runs as a single fixed user
  (`apps/api/src/lib/require-auth.ts`).

## License

MIT — see [LICENSE](./LICENSE).
