import { expect, test } from '@playwright/test';

test('login page applies the application layout and palette', async ({ page }) => {
  await page.goto('/login');
  const main = page.locator('main');
  await expect(main).toHaveCSS('display', 'flex');
  await expect(main).toHaveCSS('background-color', 'rgb(247, 247, 242)');
  const panel = page.getByText('Make sense of every page.');
  await expect(panel).toHaveCSS('font-size', /^(36|48)px$/);
});
