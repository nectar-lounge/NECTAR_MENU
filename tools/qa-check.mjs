import fs from 'node:fs';
import vm from 'node:vm';

function loadData(file, expression) {
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  return vm.runInContext(`${code}\n;${expression}`, sandbox, { filename: file });
}

const menu = loadData('menu-data.js', 'MENU');
const banquet = loadData('banquet-data.js', 'BANQUET_MENU');
if (!Array.isArray(menu)) throw new Error('MENU not found');
if (!Array.isArray(banquet)) throw new Error('BANQUET_MENU not found');

function uniqueIds(items, label) {
  const ids = items.map(x => String(x.id));
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error(`${label}: duplicate ids: ${[...new Set(dup)].join(', ')}`);
}
uniqueIds(menu, 'MENU');
uniqueIds(banquet, 'BANQUET_MENU');

const required = ['id','type','category_id','category_ru','category_kz','category_en','name_ru','name_kz','name_en'];
const bad = menu.filter(x => required.some(k => !String(x?.[k] ?? '').trim()));
if (bad.length) throw new Error(`MENU: missing required fields in ${bad.map(x => x.id).join(', ')}`);
const badPrice = menu.filter(x => x.price != null && (!Number.isFinite(Number(x.price)) || Number(x.price) < 0));
if (badPrice.length) throw new Error(`MENU: invalid prices in ${badPrice.map(x => x.id).join(', ')}`);

console.log(`QA OK: ${menu.length} menu items, ${banquet.length} banquet items; IDs unique; required fields/prices valid.`);
