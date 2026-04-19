const { spawn } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9222;
const TARGET_URL = 'http://127.0.0.1:4173/';
const START_DELAY_MS = Math.max(0, Number(process.env.APP_OPEN_MEASURE_DELAY_MS || 3500) || 3500);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJson(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) return response.json();
    } catch (error) {}
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function run() {
  const userDataDir = mkdtempSync(join(tmpdir(), 'mini-edge-cdp-'));
  const browser = spawn(
    EDGE_PATH,
    [
      '--headless',
      '--disable-gpu',
      '--remote-debugging-port=' + DEBUG_PORT,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-sync',
      '--user-data-dir=' + userDataDir,
      'about:blank'
    ],
    {
      stdio: ['ignore', 'ignore', 'pipe']
    }
  );

  let stderr = '';
  browser.stderr.on('data', (chunk) => {
    stderr += String(chunk || '');
  });

  try {
    const targets = await waitForJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const pageTarget = Array.isArray(targets)
      ? targets.find((item) => item && item.type === 'page' && item.webSocketDebuggerUrl)
      : null;
    if (!pageTarget) throw new Error('No debuggable page target was found.');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    const pending = new Map();
    let id = 0;

    ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data || '{}'));
      if (!message.id) return;
      const record = pending.get(message.id);
      if (!record) return;
      pending.delete(message.id);
      if (message.error) {
        record.reject(new Error(message.error.message || 'CDP error'));
        return;
      }
      record.resolve(message.result);
    });

    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });

    function cdp(method, params = {}) {
      return new Promise((resolve, reject) => {
        const messageId = ++id;
        pending.set(messageId, { resolve, reject });
        ws.send(JSON.stringify({
          id: messageId,
          method,
          params
        }));
      });
    }

    await cdp('Page.enable');
    await cdp('Runtime.enable');
    await cdp('Page.navigate', { url: TARGET_URL });
    await sleep(START_DELAY_MS);

    const expression = `
      (async () => {
        const waitFor = (check, timeout = 20000, step = 16) => new Promise((resolve, reject) => {
          const start = performance.now();
          const tick = () => {
            try {
              const value = check();
              if (value) {
                resolve(value);
                return;
              }
            } catch (error) {}
            if (performance.now() - start >= timeout) {
              reject(new Error('Timed out waiting for condition.'));
              return;
            }
            setTimeout(tick, step);
          };
          tick();
        });

        await waitFor(() => window.__miniShell);
        await waitFor(() => document.querySelector('iframe[data-route="desktop"][data-loaded="1"]'));

        function warmTrigger(target, desktopWin) {
          if (!target) return;
          if (typeof desktopWin.PointerEvent === 'function') {
            target.dispatchEvent(new desktopWin.PointerEvent('pointerdown', {
              bubbles: true,
              cancelable: true,
              composed: true,
              pointerType: 'touch',
              isPrimary: true
            }));
            return;
          }
          target.dispatchEvent(new desktopWin.MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            composed: true
          }));
        }

        async function measure(selector, route) {
          window.__miniShell.home();
          await waitFor(() => document.querySelector('iframe[data-route="desktop"].active[data-loaded="1"]'));
          const desktopFrame = document.querySelector('iframe[data-route="desktop"]');
          const desktopWin = desktopFrame.contentWindow;
          const desktopDoc = desktopWin.document;
          const trigger = await waitFor(() => desktopDoc.querySelector(selector));

          const firstStart = performance.now();
          warmTrigger(trigger, desktopWin);
          trigger.dispatchEvent(new desktopWin.MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
          await waitFor(() => document.querySelector('iframe[data-route="' + route + '"].active[data-loaded="1"]'));
          const firstOpenMs = Math.round((performance.now() - firstStart) * 100) / 100;

          window.__miniShell.home();
          await waitFor(() => document.querySelector('iframe[data-route="desktop"].active[data-loaded="1"]'));
          const secondTrigger = await waitFor(() => desktopDoc.querySelector(selector));

          const secondStart = performance.now();
          warmTrigger(secondTrigger, desktopWin);
          secondTrigger.dispatchEvent(new desktopWin.MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
          await waitFor(() => document.querySelector('iframe[data-route="' + route + '"].active[data-loaded="1"]'));
          const secondOpenMs = Math.round((performance.now() - secondStart) * 100) / 100;

          return { route, firstOpenMs, secondOpenMs };
        }

        const metrics = [];
        metrics.push(await measure('.p1-wechat', 'wechat'));
        metrics.push(await measure('.p2-contact', 'contacts'));
        metrics.push(await measure('.p1-anni', 'anniversary'));
        metrics.push(await measure('.dock-theme', 'theme'));
        metrics.push(await measure('.dock-settings', 'settings'));
        return metrics;
      })();
    `;

    const result = await cdp('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });

    console.log(JSON.stringify(result.result.value, null, 2));
    ws.close();
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    if (stderr.trim()) console.error(stderr.trim());
    process.exitCode = 1;
  } finally {
    browser.kill('SIGTERM');
    await new Promise((resolve) => browser.once('exit', resolve));
    try {
      rmSync(userDataDir, { recursive: true, force: true });
    } catch (error) {}
  }
}

run();
