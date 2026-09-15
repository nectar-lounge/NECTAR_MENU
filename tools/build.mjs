import { readFile, writeFile } from 'node:fs/promises';
import { transform } from 'esbuild';
import { runInNewContext } from 'node:vm';

async function transformAndWrite(source, outfile, loader) {
  const { code } = await transform(source, {
    loader,
    minify: true,
    charset: 'utf8',
    legalComments: 'none',
    target: loader === 'css' ? undefined : ['es2019']
  });
  await writeFile(outfile, code, 'utf8');
}

async function minify(sources, outfile, loader) {
  const source = (await Promise.all(sources.map(file => readFile(file, 'utf8')))).join('\n;\n');
  await transformAndWrite(source, outfile, loader);
}

async function buildMenuData() {
  const source = await readFile('menu-data.js', 'utf8');
  const { MENU, TRANSLATIONS } = runInNewContext(`${source}\n;({ MENU, TRANSLATIONS })`);
  const categoryData = {};
  const rows = MENU.map(item => {
    categoryData[item.category_id] ||= {
      category_ru: item.category_ru,
      category_kz: item.category_kz,
      category_en: item.category_en
    };
    return [
      item.id, item.type, item.category_id,
      item.name_ru, item.name_kz, item.name_en,
      item.price, item.weight || '',
      item.composition_ru || '', item.composition_kz || '', item.composition_en || '',
      item.thumb_image || '', item.full_image || '', item.image || '',
      item.tags || [], item.featured ? 1 : 0, item.note || '', item.available === false ? 0 : 1,
    ];
  });
  const hydrated = `
    const MENU_CATEGORIES=${JSON.stringify(categoryData)};
    const MENU=${JSON.stringify(rows)}.map(row=>{
      const [id,type,category_id,name_ru,name_kz,name_en,price,weight,composition_ru,composition_kz,composition_en,thumb_image,full_image,image,tags,featured,note,available]=row;
      const item={...MENU_CATEGORIES[category_id],id,type,category_id,name_ru,name_kz,name_en,price,composition_ru,composition_kz,composition_en};
      if(weight)item.weight=weight;
      if(thumb_image)item.thumb_image=thumb_image;
      if(full_image)item.full_image=full_image;
      if(image)item.image=image;
      if(tags.length)item.tags=tags;
      if(featured)item.featured=true;
      if(note)item.note=note;
      if(!available)item.available=false;
      return item;
    });
    const TRANSLATIONS=${JSON.stringify(TRANSLATIONS)};
  `;
  await transformAndWrite(hydrated, 'menu-data.min.js', 'js');
}

await Promise.all([
  minify(['styles.css'], 'styles.min.css', 'css'),
  minify(['ui-core.js'], 'ui-core.min.js', 'js'),
  buildMenuData(),
  minify(['app.js'], 'app.min.js', 'js'),
  minify(['banquet-data.js', 'banquet.js'], 'banquet.min.js', 'js')
]);
