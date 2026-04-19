const { test, expect } = require('@playwright/test');

test('anniversary isolation smoke page passes', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/tests/anniversary-isolation-smoke.html');
  await expect(page.locator('#result')).toHaveAttribute('data-status', 'pass', { timeout: 30000 });
});
