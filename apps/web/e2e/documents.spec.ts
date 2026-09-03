import { test, expect } from '@playwright/test';

test('root redirects to /documents with no login gate', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/documents');
});
