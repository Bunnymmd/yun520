const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    console.log(`[console:${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (error) => {
    console.error(`[pageerror] ${error && error.stack ? error.stack : error}`);
  });
  page.on('requestfailed', (request) => {
    console.error(`[requestfailed] ${request.method()} ${request.url()} ${request.failure() ? request.failure().errorText : ''}`);
  });

  try {
    await page.goto('http://127.0.0.1:4173/tests/wechat-role-reply-contract-smoke.html', {
      waitUntil: 'load',
      timeout: 120000
    });
    await page.waitForTimeout(35000);
    const result = await page.locator('#result').textContent();
    const status = await page.locator('#result').getAttribute('data-status');
    console.log(`[result-status] ${status || ''}`);
    console.log(`[result-text] ${result || ''}`);
    if (status !== 'pass') {
      const debug = await page.evaluate(async () => {
        const frame = document.getElementById('app-frame');
        const win = frame && frame.contentWindow;
        const doc = frame && frame.contentDocument;
        let storedMessages = [];
        const prompt = win && win.__testCapturedChatRequest && win.__testCapturedChatRequest.messages && win.__testCapturedChatRequest.messages[0]
          ? String(win.__testCapturedChatRequest.messages[0].content || '')
          : '';
        try {
          if (win && win.MiniDB && win.MiniDB.databases && win.MiniDB.databases.contacts) {
            storedMessages = await win.MiniDB.databases.contacts.messages.toArray();
          }
        } catch (error) {
          storedMessages = [{ error: error && error.message ? error.message : String(error) }];
        }
        return {
          frameUrl: win && win.location ? win.location.href : '',
          hasMiniDb: !!(win && win.MiniDB),
          miniDbReady: !!(win && win.MiniDB && win.MiniDB.__ready),
          capturedRequest: !!(win && win.__testCapturedChatRequest),
          replyRequestCount: win && typeof win.__testReplyRequestCount === 'number' ? win.__testReplyRequestCount : -1,
          capturedRequestPreview: win && win.__testCapturedChatRequest
            ? JSON.stringify(win.__testCapturedChatRequest).slice(0, 800)
            : '',
          promptHasStickerCatalog: prompt.includes('"availableStickers"'),
          promptAllowsSticker: prompt.includes('"allowedType": "sticker"'),
          promptStickerCountOne: prompt.includes('"availableStickerCount": 1'),
          noticeText: doc && doc.getElementById('mini-system-toast') ? doc.getElementById('mini-system-toast').textContent : '',
          stickerNodeCount: doc ? doc.querySelectorAll('#chat-scroll .mini-wechat-sticker-card img').length : -1,
          dividerCount: doc ? doc.querySelectorAll('#chat-scroll .mini-wechat-bubble-divider').length : -1,
          chatText: doc && doc.querySelector('#chat-scroll') ? doc.querySelector('#chat-scroll').innerText : '',
          storedMessages: storedMessages.map((entry) => ({
            type: entry && entry.type,
            payload: entry && entry.payload ? {
              assetId: entry.payload.assetId,
              packId: entry.payload.packId,
              dataUrl: entry.payload.dataUrl ? String(entry.payload.dataUrl).slice(0, 40) : '',
              content: entry.payload.content || null,
              description: entry.payload.description || null
            } : null
          }))
        };
      });
      console.log(`[debug] ${JSON.stringify(debug, null, 2)}`);
      throw new Error(`Smoke page did not pass. Status=${status || 'missing'}`);
    }
  } finally {
    await page.screenshot({ path: 'test-results/wechat-role-reply-contract-runner.png', fullPage: true }).catch(() => {});
    await browser.close().catch(() => {});
  }
}

run().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
