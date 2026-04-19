const { test, expect } = require('@playwright/test');

test('contacts editor keeps bottom actions reachable on short viewports', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/tests/contacts-editor-layout-smoke.html?width=640&height=660&scale=100');
  await page.waitForSelector('#result[data-status]', { timeout: 20000 });

  const status = await page.locator('#result').getAttribute('data-status');
  const output = await page.locator('#result').textContent();

  expect(status, output || '').toBe('pass');
});
