import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const banquet=fs.readFileSync(new URL('../banquet.js',import.meta.url),'utf8');
const checks=[
['single shared menuControls',(html.match(/id="menuControls"/g)||[]).length===1],
['banquet submenu inside controls',html.indexOf('id="banquetCategories"')>html.indexOf('id="menuControls"') && html.indexOf('id="banquetCategories"')<html.indexOf('class="menu-content"')],
['shared controls sticky in banquet',/data-menu-mode="banquet"\]\s+#menuControls[\s\S]*?position:\s*sticky/.test(css)],
['banquet submenu relative inside sticky parent',/#menuControls > \.banquet-categories\s*\{[\s\S]*?position:\s*relative/.test(css)],
['first heading rendered',/banquet-group__title/.test(banquet)],
['first category reset',/const first = categories\(\)\[0\]\?\.id/.test(banquet)],
['immediate first-group alignment',/scrollBanquetModeToFirstCategory\(\);/.test(app) && !/requestAnimationFrame\(\(\) => scrollBanquetModeToFirstCategory\(\)\)/.test(app)]
];
let bad=0; for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++;} if(bad)process.exit(1);
