import { test } from '@playwright/test';

// The critical path this project exists to prove: sign in with Google,
// upload a PDF, watch it move from "processing" to "ready" via polling,
// ask a question, and see a streamed answer. This can't run today because
// it needs four real external services simultaneously — Google OAuth, AWS
// S3, Voyage AI, and Anthropic — and only placeholder credentials are
// configured for local development (see each Etapa's .env.example).
//
// Once real credentials are available, this becomes: use Playwright's
// storageState to inject a real Better Auth session cookie (skipping the
// interactive Google consent screen, which Playwright can't drive), then:
//   1. Upload a small real PDF through the dropzone
//   2. Poll (or wait) for the document card's status to reach "Ready"
//   3. Open the document, ask a question, assert the streamed answer
//      contains recognizable content from the PDF
test.skip('sign in -> upload -> ask a question -> see a streamed answer', () => {
  // Intentionally not implemented — see comment above.
});
