import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const banquet=fs.readFileSync(new URL('../banquet.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

const tests=[
 ['one main selector', (html.match(/class="main-tabs"/g)||[]).length===1],
 ['one kitchen/bar submenu host', (html.match(/id="categoryNav"/g)||[]).length===1],
 ['one banquet submenu host', (html.match(/id="banquetCategories"/g)||[]).length===1],
 ['one category strip', (html.match(/id="categoryStrip"/g)||[]).length===1],
 ['language click owned only by app', !/closest\(['"]\.lang-btn['"]\)/.test(banquet)],
 ['semantic language event emitted', /nectar:languagechange/.test(app)],
 ['semantic language event consumed', /nectar:languagechange/.test(banquet)],
 ['banquet language does not render hidden kitchen menu', /if \(state\.mode === 'banquet'\)[\s\S]*?return;/.test(app)],
 ['runtime single-submenu invariant', /function enforceMenuChromeInvariant/.test(app)],
 ['mode visibility hides categoryNav for banquet', /categoryNav\.hidden = banquet/.test(app)],
 ['mode visibility hides banquet nav outside banquet', /banquetCategories\.hidden = !banquet/.test(app)],
 ['CSS hidden hardening', /#categoryNav\[hidden\],[\s\S]*?#banquetCategories\[hidden\][\s\S]*?display:\s*none\s*!important/.test(css)],
 ['Kitchen Bar Banquet are same shared menu shell', (html.match(/id="menuControls"/g)||[]).length===1 && !/id="banquet-section"/.test(html)],
 ['banquet first category reset on language/mode', /resetAndRenderFirstCategory/.test(banquet)],
 ['banquet search stays excluded', /if \(state\.mode === 'banquet'\)/.test(app)]
];
let failures=0;
for(const [name,ok] of tests){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failures++;}
if(failures)process.exit(1);
