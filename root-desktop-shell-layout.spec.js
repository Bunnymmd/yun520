const { test, expect } = require('@playwright/test');

test('root shell keeps desktop widgets clear on wide viewport reload', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('iframe[data-route="desktop"]', { timeout: 20000 });
  await page.waitForTimeout(1500);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('iframe[data-route="desktop"]', { timeout: 20000 });
  await page.waitForTimeout(1500);

  const shellScale = Number.parseFloat(await page.evaluate(() => (
    getComputedStyle(document.documentElement).getPropertyValue('--mini-shell-scale').trim()
  )));
  const frameHandle = await page.$('iframe[data-route="desktop"]');
  const frame = await frameHandle.contentFrame();
  const result = await frame.evaluate(() => {
    function rect(element) {
      const bounds = element.getBoundingClientRect();
      return {
        top: Number(bounds.top.toFixed(2)),
        bottom: Number(bounds.bottom.toFixed(2)),
        left: Number(bounds.left.toFixed(2)),
        right: Number(bounds.right.toFixed(2)),
        width: Number(bounds.width.toFixed(2)),
        height: Number(bounds.height.toFixed(2))
      };
    }

    function intersectsRect(a, b, epsilon = 1) {
      return !(
        a.right <= b.left + epsilon
        || a.left >= b.right - epsilon
        || a.bottom <= b.top + epsilon
        || a.top >= b.bottom - epsilon
      );
    }

    const pageElement = document.querySelector('.page');
    const widgetRects = Array.from(pageElement.querySelectorAll('[data-mini-desktop-widget="1"]'))
      .map((item) => ({
        id: item.dataset.miniDesktopWidgetId || item.className,
        rect: rect(item)
      }));
    const iconRects = Array.from(pageElement.querySelectorAll('.mini-desktop-icon-layer > .app-item[data-mini-desktop-icon="1"]'))
      .map((item) => ({
        id: item.dataset.miniDesktopIconId || item.className,
        slot: item.dataset.miniDesktopSlot || '',
        rect: rect(item)
      }));

    const overlaps = [];
    widgetRects.forEach((widget) => {
      iconRects.forEach((icon) => {
        if (!intersectsRect(widget.rect, icon.rect)) return;
        overlaps.push({
          widgetId: widget.id,
          iconId: icon.id,
          slot: icon.slot,
          widgetRect: widget.rect,
          iconRect: icon.rect
        });
      });
    });

    return {
      pageRect: rect(pageElement),
      widgetRects,
      iconRects: iconRects.slice(0, 8),
      overlaps
    };
  });

  expect(shellScale, JSON.stringify({ shellScale, result }, null, 2)).toBeGreaterThan(0);
  expect(shellScale, JSON.stringify({ shellScale, result }, null, 2)).toBeLessThan(1);
  expect(result.overlaps, JSON.stringify({ shellScale, result }, null, 2)).toHaveLength(0);
});
