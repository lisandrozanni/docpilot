# DocPilot

Upload a PDF, ask questions, and receive streamed answers grounded in its content. DocPilot
uses retrieval-augmented generation (RAG) to find relevant document fragments before calling
Gemini.

## Technologies

| Area           | Technologies                                                       |
| -------------- | ------------------------------------------------------------------ |
| Web            | Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query     |
| API            | Fastify, TypeScript, Zod                                           |
| Database       | PostgreSQL 17, pgvector, Drizzle ORM                               |
| Authentication | Better Auth, Google OAuth, JWT and JWKS                            |
| AI             | Gemini 3.5 Flash-Lite, Voyage AI embeddings                        |
| File storage   | AWS S3, presigned uploads                                          |
| Tooling        | Docker Compose, npm workspaces, Vitest, Playwright, GitHub Actions |

The Next.js app manages sessions and forwards authenticated requests to the Fastify API. PDFs
are uploaded directly to S3, split into chunks, and indexed in pgvector. The API retrieves
relevant chunks and streams Gemini's answer back to the browser.

## Run locally

**Requirements:** Node.js 22 or newer, npm, Docker, and credentials for Google OAuth, AWS S3,
Gemini, and Voyage AI. These services may have usage limits or charges.

1. Install dependencies and build the shared package:

   ```bash
   git clone git@github.com:lisandrozanni/docpilot.git
   cd docpilot
   nvm use 22 # if you use nvm
   npm ci
   npm run build --workspace=@docpilot/shared
   ```

2. Start Docker Desktop, then start the database and enable pgvector:

   ```bash
   docker compose up -d
   docker compose ps # wait until postgres is healthy
   docker compose exec postgres psql -U docpilot -d docpilot -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```

3. Create the environment files if they do not already exist, then fill in the values below:

   ```bash
   cp -n apps/api/.env.example apps/api/.env
   cp -n apps/web/.env.example apps/web/.env
   ```

   | File | Variables                                                                    | Local value or source                                                    |
   | ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
   | Both | `DATABASE_URL`                                                               | `postgresql://docpilot:docpilot_dev_password@localhost:5432/docpilot`    |
   | API  | `AUTH_JWKS_URL`                                                              | `http://localhost:3000/api/auth/jwks`                                    |
   | API  | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` | Your bucket region, name, and IAM credentials                            |
   | API  | `GEMINI_API_KEY`                                                             | Create a key in [Google AI Studio](https://aistudio.google.com/api-keys) |
   | API  | `VOYAGE_API_KEY`                                                             | Create a key in the [Voyage AI dashboard](https://www.voyageai.com/)     |
   | Web  | `BETTER_AUTH_URL`, `API_URL`                                                 | `http://localhost:3000`, `http://localhost:3001`                         |
   | Web  | `BETTER_AUTH_SECRET`                                                         | Generate once with `openssl rand -base64 32` and keep it stable          |
   | Web  | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                   | A Google OAuth web application client                                    |

   In Google Cloud, set the authorized redirect URI to
   `http://localhost:3000/api/auth/callback/google`. If the consent screen is in testing mode,
   add your Google account as a test user. Allow the S3 IAM user `s3:PutObject` and
   `s3:GetObject` for the bucket's objects. Configure the bucket's CORS for local uploads:

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

4. Apply migrations **in this order**: the API tables reference the user table created by web.

   ```bash
   npm run db:migrate --workspace=@docpilot/web
   npm run db:migrate --workspace=@docpilot/api
   ```

5. Start the API and web in separate terminals from the project root:

   ```bash
   npm run dev --workspace=@docpilot/api # http://localhost:3001
   ```

   ```bash
   npm run dev --workspace=@docpilot/web # http://localhost:3000
   ```

   Open [localhost:3000](http://localhost:3000), sign in with Google, and upload a PDF of up to
   10 MB. [localhost:3001/health](http://localhost:3001/health) checks the API and database.

## Troubleshooting

- **`relation "user" does not exist`:** verify that both apps use the intended `DATABASE_URL`
  and run the web migration before the API migration. If the migration is already recorded but
  the table is missing, the database is inconsistent; inspect or restore it before changing the
  migration history. Existing documents may reference missing users.
- **`Failed to decrypt private key`:** the signing key was encrypted with a different
  `BETTER_AUTH_SECRET`. Restore the original secret if possible. Otherwise rotate the stored
  JWKS key so Better Auth can create a new one; existing signed tokens may need to be renewed.
- **S3 upload fails:** check the bucket region, IAM permissions, and CORS origin.
- **The app starts but AI requests fail:** check the Gemini and Voyage keys, model access,
  account quotas, and API logs.

## Tests

```bash
npm run test                                       # unit tests
npm run test:integration --workspace=@docpilot/api # requires Docker
npm run test:e2e --workspace=@docpilot/web          # requires Playwright browsers
```

## License

[MIT](./LICENSE)
