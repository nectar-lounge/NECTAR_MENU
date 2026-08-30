import fs from 'node:fs';
const html = fs.readFileSync('index.html','utf8');
const app = fs.readFileSync('app.js','utf8');
const banquet = fs.readFileSync('banquet.js','utf8');
const css = fs.readFileSync('styles.css','utf8');
function ok(cond,msg){ if(!cond){ console.error('UI CONTRACT FAIL:',msg); process.exit(1); } }
ok((html.match(/<button class="main-tab/g)||[]).length===6,'two persistent selectors must expose 3 tabs each');
ok(!html.includes('class="banquet-hero"'),'Banquet secondary photo hero must not exist');
ok(html.includes('data-section-target="banquet"'),'Banquet selector target missing');
ok(banquet.includes("nav:'БАНКЕТЫ'") && banquet.includes("nav:'БАНКЕТТЕР'") && banquet.includes("nav:'BANQUETS'"),'Banquet selector labels must be uppercase in RU/KZ/EN');
ok(css.includes('pointer-events: none !important') && css.includes('.main-tabs__indicator'),'moving pill must not intercept taps');
ok(app.includes("const banquetActive = state.section === 'banquet'"),'selector active state must track Banquets');
ok(app.includes("? section === 'menu' || section === 'banquet'"),'bottom Menu destination must stay active for Banquets');
ok(app.includes("ALLOWED_BAR_CATEGORY_IDS") && !app.includes("BANQUET_MENU") ,'main search/index must not depend on BANQUET_MENU');
ok(!html.includes('data-i18n="tap_hint"'),'obsolete tap hint must stay removed');
ok(!html.includes('Обслуживание'),'Info service field must stay removed');
console.log('UI contract OK: persistent 3-way selector; uniform labels; no banquet hero; search isolated; bottom nav contract preserved.');
