import { test, expect } from '@playwright/test';

test.describe('unauthenticated access', () => {
  test('redirects /documents to /login', async ({ page }) => {
    await page.goto('/documents');
    await expect(page).toHaveURL('/login');
  });

  test('login page renders the Google sign-in option', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to DocPilot' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  });

  test('clicking "Continue with Google" starts a real OAuth redirect to Google', async ({
    page,
  }) => {
    await page.goto('/login');

    // Real network navigation, not a mock: Better Auth's sign-in endpoint
    // builds a genuine Google OAuth URL (PKCE challenge, redirect_uri,
    // scopes) and the browser actually navigates to it. This proves the
    // OAuth kickoff wiring works end-to-end up to the point where real Google
    // credentials would take over — see Etapa 4.
    //
    // The request URL is captured on the way OUT, not read back from
    // page.url() afterward: with a placeholder client_id, Google's real
    // server rejects it and redirects again to its own "invalid_client"
    // error page, which has none of the original query params. Asserting on
    // the outbound request is what's actually true regardless of whether the
    // configured client_id is valid.
    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().startsWith('https://accounts.google.com/')),
      page.getByRole('button', { name: 'Continue with Google' }).click(),
    ]);

    const url = new URL(request.url());
    expect(url.hostname).toBe('accounts.google.com');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/api/auth/callback/google',
    );
    expect(url.searchParams.has('code_challenge')).toBe(true);
  });
});
