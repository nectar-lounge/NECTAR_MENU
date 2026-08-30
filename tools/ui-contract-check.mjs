import fs from 'node:fs';
const html = fs.readFileSync('index.html','utf8');
const app = fs.readFileSync('app.js','utf8');
const banquet = fs.readFileSync('banquet.js','utf8');
const css = fs.readFileSync('styles.css','utf8');
function ok(cond,msg){ if(!cond){ console.error('UI CONTRACT FAIL:',msg); process.exit(1); } }

ok((html.match(/<button class="main-tab/g)||[]).length===3,'one shared selector must expose exactly 3 menu modes');
ok((html.match(/<section class="hero"/g)||[]).length===1,'Kitchen, Bar and Banquet must share one hero instance');
ok(!html.includes('id="banquet-section"'),'Banquet must not exist as a separate SPA section');
ok(html.includes('id="banquetMode" hidden'),'Banquet content must live inside the shared menu section');
ok(html.includes('data-section-target="banquet"'),'Banquet selector target missing');
ok(banquet.includes("nav:'БАНКЕТ'") && banquet.includes("nav:'BANQUET'"),'Banquet selector label must be singular');
ok(!banquet.includes("nav:'БАНКЕТЫ'") && !banquet.includes("nav:'BANQUETS'"),'plural Banquet selector label must not return');
ok(css.includes('.main-tabs__indicator'),'moving pill styling must remain present');
ok(app.includes("mode: 'kitchen'") && app.includes("state.mode = 'banquet'"),'shared menu mode state must include Banquet');
ok(app.includes('function applyMenuModeVisibility()'),'shared menu mode visibility controller missing');
ok(app.includes('function setBanquetMode()'),'Banquet mode switch missing');
ok(app.includes("new CustomEvent('nectar:modechange'"),'mode-change contract missing');
ok(banquet.includes("dataset.menuMode === 'banquet'"),'Banquet behavior must bind to shared menu mode, not a separate section');
ok(app.includes('ALLOWED_BAR_CATEGORY_IDS') && !app.includes('BANQUET_MENU'),'main search/index must stay isolated from BANQUET_MENU');
ok(!html.includes('data-i18n="tap_hint"'),'obsolete tap hint must stay removed');
ok(!html.includes('Обслуживание'),'Info service field must stay removed');
ok(!app.includes("switchSection('banquet')"),'Banquet must never route through SPA section switching');
ok(!app.includes("section === 'banquet'"),'Banquet must never participate in section scroll restoration');
ok(app.includes('scrollBanquetModeToFirstCategory()'),'Banquet must align first category like Kitchen / Bar');
console.log('UI contract OK: one hero, one selector, one menu scroll context; Kitchen/Bar/Banquet are equal modes; search remains Kitchen+Bar only.');
