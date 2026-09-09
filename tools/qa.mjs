import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))); }

// Run a static server separately; BASE_URL may also point to a review deployment.
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:8765';
const failures = [];
let checks = 0;
const executablePath = process.env.BROWSER_EXECUTABLE ||
  (existsSync(chromium.executablePath()) ? undefined :
    ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync));
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
async function check(name, action) {
  checks++;
  try { await action(); console.log(`PASS ${name}`); }
  catch (error) { failures.push({ name, error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
}
async function settle(page) { await page.waitForTimeout(550); }
async function openCard(page, card) {
  // Automation may scroll the card again to avoid sticky controls before clicking.
  // Measure the user's position at pointerdown, before the app locks the page.
  await page.evaluate(() => document.addEventListener('pointerdown', () => {
    window.__qaOpenScrollY = scrollY;
  }, { once: true, capture: true }));
  await card.click();
  return page.evaluate(() => window.__qaOpenScrollY);
}
async function mode(page, value) {
  await page.locator(value === 'banquet' ? '[data-section-target="banquet"]' : `.main-tab[data-type="${value}"]`).click();
  await settle(page);
  assert.equal(await page.locator('html').getAttribute('data-menu-mode'), value);
}
async function alignment(page, selector) {
  const result = await page.evaluate(selector => {
    const target = document.querySelector(selector);
    const header = document.querySelector('#siteHeader');
    const controls = document.querySelector('#menuControls');
    return { top: target.getBoundingClientRect().top, bottom: controls.getBoundingClientRect().bottom,
      controlsTop: controls.getBoundingClientRect().top,
      viewport: innerHeight, header: header.getBoundingClientRect().height };
  }, selector);
  assert.ok(result.top >= result.bottom - 4 && result.top < result.viewport, JSON.stringify(result));
  assert.ok(result.controlsTop <= result.header + 2, `navigation did not align sticky controls: ${JSON.stringify(result)}`);
}
try {
  for (const width of [390, 320, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.locator('.menu-card').first().waitFor();
    const originalData = await page.evaluate(() => JSON.stringify([MENU, BANQUET_MENU]));
    for (const lang of ['RU', 'KZ', 'EN']) {
      const prefix = `${width}px/${lang}`;
      await page.locator(`.lang-btn[data-lang="${lang}"]`).click();
      await check(`${prefix} all modes and first-category alignment`, async () => {
        for (const value of ['bar', 'banquet', 'kitchen']) {
          await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
          await mode(page, value);
          assert.equal(await page.locator('.main-tab.is-active').count(), 1);
          await alignment(page, value === 'banquet' ? '.banquet-group' : '[data-category-section]');
        }
      });
      await check(`${prefix} rapid latest mode wins`, async () => {
        await page.evaluate(() => {
          for (const selector of ['[data-type="bar"]', '[data-section-target="banquet"]', '[data-type="kitchen"]', '[data-type="bar"]']) document.querySelector(`.main-tab${selector}`).click();
        });
        await settle(page);
        assert.equal(await page.locator('html').getAttribute('data-menu-mode'), 'bar');
        await alignment(page, '[data-category-section]');
      });
      await check(`${prefix} search to banquet clears search layout`, async () => {
        await page.locator('#searchInput').fill('zzzz-no-results');
        await page.waitForTimeout(180);
        await mode(page, 'banquet');
        assert.equal(await page.locator('.menu-shell.is-searching, #menuControls.is-searching').count(), 0);
        assert.equal(await page.locator('#categoryNav').isVisible(), false);
        assert.equal(await page.locator('#banquetCategories').isVisible(), true);
        assert.equal(await page.locator('#searchModeNote').isVisible(), false);
      });
      await check(`${prefix} pending clear-search cannot override banquet navigation`, async () => {
        await mode(page, 'kitchen');
        await page.locator('#searchInput').fill('чай');
        await page.waitForTimeout(180);
        await page.evaluate(() => {
          document.querySelector('#clearSearchBtn').click();
          document.querySelector('[data-section-target="banquet"]').click();
        });
        await settle(page);
        assert.equal(await page.locator('html').getAttribute('data-menu-mode'), 'banquet');
        await alignment(page, '.banquet-group');
      });
      await check(`${prefix} banquet modal focus, repeated close, reopen and scroll`, async () => {
        await mode(page, 'banquet');
        const card = page.locator('.banquet-card').last();
        await card.scrollIntoViewIfNeeded();
        await settle(page);
        const initialY = await openCard(page, card);
        await settle(page);
        for (const key of ['Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) {
          await page.keyboard.press(key);
          assert.ok(await page.evaluate(() => Boolean(document.activeElement.closest('#banquetModal'))), 'focus escaped banquet dialog');
        }
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
        await page.keyboard.press('Escape');
        await settle(page);
        assert.equal(await page.locator('#banquetModal').isVisible(), false);
        assert.ok(Math.abs(await page.evaluate(() => scrollY) - initialY) < 5, 'scroll was not restored');
        await card.click();
        await settle(page);
        assert.equal(await page.locator('#banquetModal').isVisible(), true);
        await page.keyboard.press('Escape');
        await settle(page);
      });
      // Recover independently so one modal assertion does not cascade into unrelated checks.
      await page.keyboard.press('Escape');
      await settle(page);
      await check(`${prefix} no horizontal page overflow`, async () => {
        const dimensions = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
        assert.ok(dimensions.document <= dimensions.viewport + 1, JSON.stringify(dimensions));
      });
      await check(`${prefix} kitchen modal restores focus and scroll`, async () => {
        await mode(page, 'kitchen');
        const card = page.locator('.menu-card').nth(4);
        await card.scrollIntoViewIfNeeded();
        await settle(page);
        const initialY = await openCard(page, card);
        await settle(page);
        for (const key of ['Tab', 'Tab', 'Shift+Tab']) {
          await page.keyboard.press(key);
          assert.ok(await page.evaluate(() => Boolean(document.activeElement.closest('#itemModal'))), 'focus escaped item dialog');
        }
        await page.keyboard.press('Escape');
        await settle(page);
        assert.equal(await page.locator('#itemModal').isVisible(), false);
        const restoredY = await page.evaluate(() => scrollY);
        assert.ok(Math.abs(restoredY - initialY) < 5, `item scroll was not restored: ${initialY} -> ${restoredY}`);
        assert.ok(await card.evaluate(element => element === document.activeElement), 'item focus was not restored');
      });
      await page.keyboard.press('Escape');
      await settle(page);
    }
    await check(`${width}px menu data unchanged`, async () => assert.equal(await page.evaluate(() => JSON.stringify([MENU, BANQUET_MENU])), originalData));
    await check(`${width}px no runtime errors`, async () => assert.deepEqual(errors, []));
    await context.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify({ checks, passed: checks - failures.length, failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
