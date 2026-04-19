const { test, expect } = require('@playwright/test');

test('contacts multi worldbook smoke page passes', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/tests/contacts-worldbook-multi-smoke.html');
  await expect(page.locator('#result')).toHaveAttribute('data-status', 'pass', { timeout: 30000 });
});
