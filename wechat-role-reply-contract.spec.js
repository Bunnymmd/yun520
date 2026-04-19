const { test, expect } = require('@playwright/test');

test('wechat role reply contract smoke page passes', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/tests/wechat-role-reply-contract-smoke.html');
  await expect(page.locator('#result')).toHaveAttribute('data-status', 'pass', { timeout: 30000 });
});
