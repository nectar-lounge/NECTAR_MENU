import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))); }

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:8765';
const executablePath = process.env.BROWSER_EXECUTABLE ||
  (existsSync(chromium.executablePath()) ? undefined :
    ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync));
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });

try {
  const context = await browser.newContext({ viewport: { width: 393, height: 727 } });
  const page = await context.newPage();
  await page.route('https://fonts.googleapis.com/**', route => {
    setTimeout(() => route.abort().catch(() => {}), 3000);
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 400,
    downloadThroughput: 50 * 1024,
    uploadThroughput: 20 * 1024
  });

  const startedAt = performance.now();
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  const domMs = Math.round(performance.now() - startedAt);
  await page.locator('.menu-card').first().waitFor();
  const usableMs = Math.round(performance.now() - startedAt);
  const resources = await page.evaluate(() => performance.getEntriesByType('resource')
    .filter(entry => ['link', 'script'].includes(entry.initiatorType))
    .map(entry => ({
      name: entry.name.split('/').pop(),
      durationMs: Math.round(entry.duration),
      transferBytes: entry.transferSize
    })));

  console.log(JSON.stringify({ profile: 'slow3G', domMs, usableMs, resources }, null, 2));
  assert.ok(usableMs < 5000, `first usable menu took ${usableMs} ms; expected < 5000 ms`);
  await context.close();
} finally {
  await browser.close();
}
