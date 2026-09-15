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
const executablePath = existsSync(chromium.executablePath()) ? undefined :
  ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('.menu-card').first().waitFor();
  await page.locator('#appLoader').waitFor({ state: 'hidden' });

  const secondCategory = page.locator('.category-tab').nth(1);
  const categoryId = await secondCategory.getAttribute('data-category-id');
  await secondCategory.click();
  assert.equal(await page.locator(`[data-category-section="${categoryId}"]`).evaluate(node => node.classList.contains('category-tap-reveal')), true);

  const card = page.locator(`[data-category-section="${categoryId}"] .menu-card`).first();
  await card.click();
  await page.locator('#itemModal.is-open').waitFor();
  assert.equal(await page.locator('#itemModal').evaluate(node => node.classList.contains('has-card-origin')), true);
  await page.waitForTimeout(380);
  await page.screenshot({ path: '../../outputs/stage-a-linked-modal.png', fullPage: false });
  await page.keyboard.press('Escape');
  await page.locator('#itemModal').waitFor({ state: 'hidden' });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedCategory = page.locator('.category-tab').nth(2);
  const reducedCategoryId = await reducedCategory.getAttribute('data-category-id');
  await reducedCategory.click();
  assert.equal(await page.locator(`[data-category-section="${reducedCategoryId}"]`).evaluate(node => node.classList.contains('category-tap-reveal')), false);
  const reducedCard = page.locator(`[data-category-section="${reducedCategoryId}"] .menu-card`).first();
  await reducedCard.click();
  await page.locator('#itemModal.is-open').waitFor();
  assert.equal(await page.locator('#itemModal').evaluate(node => node.classList.contains('has-card-origin')), false);
  await page.keyboard.press('Escape');
  await page.locator('#itemModal').waitFor({ state: 'hidden' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.menu-card').first().waitFor();
  await page.locator('#appLoader').waitFor({ state: 'hidden' });
  await page.locator('#connectivityBanner').waitFor({ state: 'visible' });
  assert.match(await page.locator('#connectivityBanner').textContent(), /сохранённое меню/i);
  await page.screenshot({ path: '../../outputs/stage-a-offline-menu.png', fullPage: false });

  await page.locator('.main-tab[data-section-target="banquet"]').click();
  await page.locator('.banquet-card').first().waitFor();
  assert.equal(await page.locator('.banquet-card').count(), 31);
  assert.deepEqual(errors, []);

  console.log(JSON.stringify({
    loadingState: 'PASS',
    categoryTransition: 'PASS',
    linkedModal: 'PASS',
    reducedMotion: 'PASS',
    offlineReload: 'PASS',
    offlineBanquet: 'PASS',
    runtimeErrors: errors
  }, null, 2));
} finally {
  await context.setOffline(false).catch(() => {});
  await context.close();
  await browser.close();
}
