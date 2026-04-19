const { test, expect } = require('@playwright/test');

test('desktop widgets do not overlap app icons after reload', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/tests/desktop-layout-overlap-smoke.html');
  await page.waitForSelector('#result[data-status]', { timeout: 20000 });

  const status = await page.locator('#result').getAttribute('data-status');
  const output = await page.locator('#result').textContent();

  expect(status, output || '').toBe('pass');
});
