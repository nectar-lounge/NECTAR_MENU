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
    const originalData = await page.evaluate(() => JSON.stringify(MENU));
    await check(`${width}px classic menu source contract`, async () => {
      const contract = await page.evaluate(() => {
        const kitchenOrder = [...new Set(MENU.filter(item => item.type === 'kitchen').map(item => item.category_id))];
        const barOrder = [...new Set(MENU.filter(item => item.type === 'bar').map(item => item.category_id))];
        const wines = MENU.filter(item => item.category_id === 'wine_glass' || item.category_id === 'wine_bottle');
        return {
          total: MENU.length,
          kitchen: MENU.filter(item => item.type === 'kitchen').length,
          bar: MENU.filter(item => item.type === 'bar').length,
          kitchenOrder,
          barOrder,
          hookah: MENU.filter(item => /кальян|hookah|shisha/i.test(`${item.name_ru} ${item.name_kz} ${item.name_en}`)).length,
          badGlassWine: wines.filter(item => item.category_id === 'wine_glass' && item.weight !== '150ml').map(item => item.name_ru),
          badBottleWine: wines.filter(item => item.category_id === 'wine_bottle' && item.weight !== (/b-0041[01]-/.test(item.id) ? '200ml' : '750ml')).map(item => item.name_ru),
          cocktails: MENU.filter(item => item.category_id === 'cocktails').map(item => ({ name: item.name_en, composition: item.composition_en })),
          missingTranslations: MENU.filter(item => !item.name_ru || !item.name_kz || !item.name_en || !item.composition_ru || !item.composition_kz || !item.composition_en).map(item => item.id),
        };
      });
      assert.equal(contract.total, 159);
      assert.equal(contract.kitchen, 80);
      assert.equal(contract.bar, 79);
      assert.deepEqual(contract.kitchenOrder, ['cold', 'salads', 'hot_starters', 'soups', 'mains', 'pasta', 'pizza_bakery', 'beer_snacks', 'grill', 'sharing', 'sides_sauces', 'desserts_fruit']);
      assert.deepEqual(contract.barOrder, ['cocktails', 'wine_glass', 'wine_bottle', 'beer', 'vodka', 'whisky_cognac', 'gin_rum_tequila', 'lemonades', 'soft_drinks', 'tea', 'tea_addons']);
      assert.equal(contract.hookah, 0);
      assert.deepEqual(contract.badGlassWine, []);
      assert.deepEqual(contract.badBottleWine, []);
      assert.deepEqual(contract.cocktails, [
        { name: 'Gimlet', composition: 'Gin and lime cordial' },
        { name: 'Margarita', composition: 'Tequila, orange liqueur and lime' }
      ]);
      assert.deepEqual(contract.missingTranslations, []);
    });
    await check(`${width}px banquet code is lazy before first use`, async () => {
      assert.equal(await page.evaluate(() => typeof BANQUET_MENU), 'undefined');
      assert.equal(await page.locator('script[src="banquet.min.js"]').count(), 0);
    });
    for (const lang of ['RU', 'KZ', 'EN']) {
      const prefix = `${width}px/${lang}`;
      await page.locator(`.lang-btn[data-lang="${lang}"]`).click();
      await check(`${prefix} accessible names expose menu details and localized search`, async () => {
        const details = await page.locator('.menu-card').first().evaluate(element => ({
          explicitLabel: element.getAttribute('aria-label'),
          text: element.innerText.replace(/\s+/g, ' ').trim()
        }));
        assert.equal(details.explicitLabel, null);
        assert.ok(/₸/.test(details.text), `price is missing from the card's accessible contents: ${details.text}`);
        const expectedSearchLabel = { RU: 'Поиск по меню', KZ: 'Мәзірден іздеу', EN: 'Search the menu' }[lang];
        assert.equal(await page.locator('#searchInput').getAttribute('aria-label'), expectedSearchLabel);
      });
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
    await check(`${width}px menu data unchanged`, async () => assert.equal(await page.evaluate(() => JSON.stringify(MENU)), originalData));
    await check(`${width}px no runtime errors`, async () => assert.deepEqual(errors, []));
    await context.close();
  }

  await check('Google Fonts stylesheet is non-blocking with a no-script fallback', async () => {
    const html = await fetch(baseURL).then(response => response.text());
    assert.match(html, /rel="preload" as="style" href="https:\/\/fonts\.googleapis\.com\/css2\?/);
    assert.match(html, /rel="stylesheet" media="print" onload="this\.media='all'"/);
    assert.match(html, /<noscript><link href="https:\/\/fonts\.googleapis\.com\/css2\?.+rel="stylesheet"><\/noscript>/);
  });

  for (const profile of [
    { name: 'iPhone 13', portrait: [390, 664], landscape: [664, 390] },
    { name: 'Pixel 5', portrait: [393, 727], landscape: [727, 393] }
  ]) {
    await check(`${profile.name} rotation keeps sticky controls above bottom navigation`, async () => {
      const page = await browser.newPage({ viewport: { width: profile.portrait[0], height: profile.portrait[1] } });
      await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
      await page.locator('.menu-card').first().waitFor();
      await page.evaluate(() => window.scrollTo({ top: 310, behavior: 'instant' }));
      await page.setViewportSize({ width: profile.landscape[0], height: profile.landscape[1] });
      await page.waitForTimeout(300);
      const geometry = await page.evaluate(() => {
        const controls = document.querySelector('#menuControls').getBoundingClientRect();
        const header = document.querySelector('#siteHeader').getBoundingClientRect();
        const bottomNav = document.querySelector('.bottom-nav').getBoundingClientRect();
        return { controlsTop: controls.top, controlsBottom: controls.bottom, headerBottom: header.bottom, bottomNavTop: bottomNav.top };
      });
      assert.ok(geometry.controlsTop >= geometry.headerBottom - 1, JSON.stringify(geometry));
      assert.ok(geometry.controlsBottom <= geometry.bottomNavTop + 1, JSON.stringify(geometry));
      await page.close();
    });
  }
} finally { await browser.close(); }
console.log(JSON.stringify({ checks, passed: checks - failures.length, failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
