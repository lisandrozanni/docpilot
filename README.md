# DocPilot

Upload a PDF, ask questions about it, get streamed answers grounded in the document's actual
content. Built as a portfolio project to be defensible in technical interviews — every
non-obvious choice below has a reason and a trade-off attached, including what was deliberately
left out.

**Stack:** Next.js 16 (BFF) · Fastify (API) · PostgreSQL 17 + pgvector · Drizzle ORM ·
Better Auth (Google OAuth) · Claude Opus 5 (streaming Q&A) · Voyage AI (embeddings) · AWS S3
(presigned uploads).

## How it works

```
Browser ──Server Actions/fetch──▶ Next.js (BFF) ──JWT (JWKS)──▶ Fastify API
                                                                     │
                                          ┌──────────────┬──────────┼──────────┐
                                          ▼              ▼          ▼          ▼
                                     PostgreSQL         S3     Claude API  Voyage AI
                                     + pgvector
```

- **Next.js is a BFF, not just a frontend.** It owns the session (Better Auth) and proxies
  authenticated calls to the API — the browser never talks to Fastify or S3 directly, and never
  holds AWS credentials.
- **Uploads go straight to S3.** The API only issues a presigned PUT URL; the file bytes never
  pass through either server.
- **RAG, not "paste the whole document in."** Each PDF is chunked, embedded with Voyage AI, and
  stored in pgvector. A question retrieves the top-K most relevant chunks (cosine similarity,
  HNSW index) instead of stuffing the entire document into every prompt.
- **Answers stream.** The chat Route Handler forwards Claude's stream token-by-token over SSE;
  the system prompt (document context) is marked for prompt caching since it's the stable prefix
  across a conversation's turns.

## Getting started

**Prerequisites:** Node 22+ (see `.nvmrc`), Docker, and API keys for Google OAuth, AWS S3,
Anthropic, and Voyage AI (see [What you'll need](#what-youll-need) below).

```bash
git clone git@github.com:lisandrozanni/docpilot.git
cd docpilot
npm install

# Start PostgreSQL (pgvector-enabled image)
docker compose up -d

# Configure each workspace's environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# fill in both .env files — see the table below for where each key comes from

# Apply database migrations (api owns documents/chunks, web owns auth tables)
npm run db:migrate --workspace=@docpilot/api
npm run db:migrate --workspace=@docpilot/web

# Run both services
npm run dev --workspace=@docpilot/api   # http://localhost:3001
npm run dev --workspace=@docpilot/web   # http://localhost:3000
```

Open `http://localhost:3000` — you'll be redirected to `/login`.

### What you'll need

| Variable                                                         | Where to get it                                                                                                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`                      | Google Cloud Console → APIs & Services → Credentials → OAuth client ID (type: Web application). Redirect URI: `http://localhost:3000/api/auth/callback/google`            |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `S3_BUCKET_NAME` | An S3 bucket + an IAM user scoped to `s3:PutObject`/`s3:GetObject` on that bucket only (see `docker-compose.yml`'s neighbor, `apps/api/.env.example`, for the full shape) |
| `ANTHROPIC_API_KEY`                                              | [console.anthropic.com](https://console.anthropic.com) → API Keys                                                                                                         |
| `VOYAGE_API_KEY`                                                 | [voyageai.com](https://www.voyageai.com) → Dashboard → API Keys                                                                                                           |
| `BETTER_AUTH_SECRET`                                             | Any long random string, e.g. `openssl rand -base64 32`                                                                                                                    |

Every one of these is validated at boot with a Zod schema (`lib/env.ts` in each workspace) — the
app fails fast with a clear error instead of a confusing runtime crash three requests in.

## Project structure

```
docpilot/
├── apps/
│   ├── web/                 Next.js 16 (App Router) — BFF, session, UI
│   │   └── src/
│   │       ├── app/         routes only — (auth)/login, (app)/documents, api/*
│   │       ├── features/    feature folders: auth, documents, chat
│   │       ├── components/  shared UI primitives + providers
│   │       └── lib/         auth, db client (Better Auth's own schema), api-client
│   └── api/                 Fastify — business logic, orchestration
│       └── src/
│           ├── modules/     routes → service → repository, per domain
│           ├── infra/       db, s3, llm (Claude), embeddings (Voyage), pdf chunking
│           └── lib/         env, errors, logger, auth (JWKS verification)
├── packages/
│   └── shared/               Zod schemas shared between web, api, and RHF forms
├── docker-compose.yml         Postgres 17 + pgvector, dev only
└── .github/workflows/ci.yml   lint/typecheck/unit → integration → build → e2e
```

Each feature folder owns its `components/`, `hooks/`, `actions.ts` (Server Actions), and
`schemas.ts` — no barrel files, since re-exporting everything through an `index.ts` defeats
tree-shaking. The API mirrors the same idea with `routes → service → repository` layering per
module, so business logic is testable without a database.

## Testing

```bash
npm run test                                        # unit tests, all workspaces
npm run test:integration --workspace=@docpilot/api   # Testcontainers: real ephemeral Postgres
npm run test:e2e --workspace=@docpilot/web           # Playwright, real browser
```

- **Unit** — pure logic (chunking, Zod schemas) and components (Testing Library), no I/O.
- **Integration** — Testcontainers boots a real `pgvector/pgvector:pg17` container per run and
  applies actual migrations against it; this is what catches a broken constraint or index that a
  mocked repository never would.
- **E2E** — Playwright against a real browser, scoped to what's verifiable without live
  Google/AWS/Anthropic/Voyage credentials (the unauthenticated redirect, layout, and error
  states).

CI (`.github/workflows/ci.yml`) runs lint/typecheck/unit in parallel, then integration, then a
production build, then e2e — each stage only starts once the ones it depends on are green.

## Notable architectural decisions

A few choices worth being able to defend, briefly:

- **A separate Fastify API instead of doing everything in Next.js Route Handlers.** PDF
  processing and embedding generation are background work that doesn't fit request/response —
  a dedicated service can run them as in-process async jobs. For a pure MVP, Route Handlers
  would have been less infrastructure; the split is justified here by that async work and by
  demonstrating a layered backend, not by dogma.
- **Drizzle over Prisma.** Drizzle's SQL is close to 1:1 with what actually runs — the explicit
  goal was learning real PostgreSQL, not having an ORM DSL abstract it away.
- **Two separate Postgres schemas, two Drizzle clients.** Better Auth (in `apps/web`) owns
  `user`/`session`/`account`/`verification` and migrates them independently from `apps/api`'s
  `documents`/`document_chunks`. `apps/api` holds a read-only "mirror" table just to build its
  foreign key — it never migrates the real one. Coupling two workspaces' migration histories to
  the same table was the thing to avoid.
- **JWT service-to-service auth via JWKS (asymmetric), not a shared secret.** Better Auth signs
  with Ed25519; the API verifies against `/api/auth/jwks` with no secret in common and no
  callback to Next.js per request.
- **pgvector instead of a dedicated vector database.** One database to operate and back up
  instead of two. HNSW indexing trades a small amount of recall for speed — with the chunk
  volumes here, a sequential scan would also work; the index is the choice that scales.
- **RAG instead of putting the whole document in context.** Cheaper, faster, and avoids models
  losing track of content in very long contexts. For small documents, full-context with prompt
  caching can actually beat RAG — that trade-off is real and worth stating out loud, not just
  reaching for RAG by default.

### Deliberately not included

Terraform/Pulumi, Turborepo/Nx, Redis/BullMQ, Kubernetes, microservices beyond the two services
here, GraphQL, a dedicated vector database, and a component library (UI primitives are
hand-built). Each was left out because the project's actual scope didn't justify it yet — not
because it's never the right call.

## License

MIT — see [LICENSE](./LICENSE).
