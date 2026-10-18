import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {serve} from './static-server.mjs';

const server=await serve('dist',4178);
const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('test-results',{recursive:true});
try{
 for(const width of [1366,390,320])for(const language of ['en','zh']){
  const page=await browser.newPage({viewport:{width,height:844}});
  await page.goto('http://127.0.0.1:4178/between-lines/');
  if(width>600)await page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
  await page.locator('#language').selectOption(language);
  const rules=page.locator('[aria-controls="counting-rules"]');
  const source=page.locator('[aria-controls="text-source"]');
  const positions=()=>page.locator('.support-toggles > button').evaluateAll(buttons=>buttons.map(button=>{
   const box=button.getBoundingClientRect();return {x:box.x,y:box.y+scrollY,bottom:box.bottom+scrollY};
  }));
  const original=await positions();
  assert.equal(original[0].y,original[1].y,'Both controls share a row.');
  assert(original[1].x>original[0].x);
  for(const control of [rules,source,rules,source,source,rules,source,rules]){
   await control.focus();await control.press('Space');
   assert.deepEqual(await positions(),original,'Expanding either panel must not move the controls.');
   for(const panel of ['.rule-body','.source-body'])if(await page.locator(panel).count()){
    const top=await page.locator(panel).evaluate(element=>element.getBoundingClientRect().top+scrollY);
    assert(top>=original[0].bottom,'Expanded content appears below both controls.');
   }
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow.');
  await rules.click();await source.click();
  await page.screenshot({path:`test-results/support-${width}-${language}.png`,fullPage:true});
  await page.locator('.levels-menu > summary').click();
  const selected=page.locator('.catalogue button[aria-current]');
  assert.equal(await selected.evaluate(element=>getComputedStyle(element).borderLeftWidth),'0px');
  const asymmetric=await page.evaluate(()=>{
   const elements=['notice','mode insert','next-button','help-drawer'].map(className=>{
    const element=document.createElement('div');element.className=className;document.body.append(element);return element;
   });
   const found=elements.filter(element=>{const style=getComputedStyle(element);return parseFloat(style.borderLeftWidth)>parseFloat(style.borderRightWidth);}).map(element=>element.className);
   elements.forEach(element=>element.remove());return found;
  });
  assert.deepEqual(asymmetric,[],'State styles must not use a left accent border.');
  await page.close();
 }
 console.log('Support controls stay horizontal in both languages at desktop and mobile widths; panels and border styles passed.');
}finally{await browser.close();server.close();}
