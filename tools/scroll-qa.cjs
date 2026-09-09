const assert = require('node:assert/strict');
const {createRequire}=require('node:module');
const {join}=require('node:path');
const {homedir}=require('node:os');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')));}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 let checks=0;
 for(const touch of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:touch,isMobile:touch});
  const page=await context.newPage();await page.goto(process.env.BASE_URL||'http://127.0.0.1:8765',{waitUntil:'networkidle'});
  const cdp=await context.newCDPSession(page);
  for(const mode of ['kitchen','banquet']){
   if(mode==='banquet')await page.locator('[data-section-target="banquet"]').click();
   else await page.evaluate(()=>window.scrollTo({top:400,behavior:'instant'}));
   await page.waitForTimeout(400);
   const strip=page.locator(mode==='kitchen'?'#categoryStrip':'#banquetCategories');
   await strip.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));await page.waitForTimeout(300);
   const box=await strip.boundingBox();assert(box);
   const y=box.y+box.height/2;
   if(touch){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-35,y}]});
    for(let i=1;i<=10;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width-35-i*20,y}]});await page.waitForTimeout(16);}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(350);
    assert(await strip.evaluate(el=>el.scrollLeft)>50,'touch swipe did not scroll');checks++;console.log(`PASS ${mode} native touch swipe`);
   }else{
    await page.mouse.move(box.x+box.width/2,y);await page.mouse.wheel(0,200);await page.waitForTimeout(350);
    assert(await strip.evaluate(el=>el.scrollLeft)>50,'wheel did not scroll');checks++;console.log(`PASS ${mode} mouse wheel`);
    await strip.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));await page.waitForTimeout(300);
    const selected=await strip.locator('button.is-active').getAttribute('data-category-id')||await strip.locator('button.is-active').getAttribute('data-bcat');
    await page.mouse.move(box.x+box.width-35,y);await page.mouse.down();await page.mouse.move(box.x+35,y,{steps:12});await page.mouse.up();await page.waitForTimeout(350);
    assert(await strip.evaluate(el=>el.scrollLeft)>50,'mouse drag did not scroll');
    const after=await strip.locator('button.is-active').getAttribute('data-category-id')||await strip.locator('button.is-active').getAttribute('data-bcat');
    assert.equal(after,selected,'drag activated a category');checks++;console.log(`PASS ${mode} mouse drag without accidental selection`);
    await strip.locator('button').first().focus();await page.keyboard.press('End');await page.waitForTimeout(200);
    assert(await strip.locator('button').last().evaluate(el=>el===document.activeElement),'keyboard did not reach last category');checks++;console.log(`PASS ${mode} keyboard End navigation`);
   }
  }
  await context.close();
 }
 await browser.close();console.log(`${checks}/${checks} scrolling checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});
