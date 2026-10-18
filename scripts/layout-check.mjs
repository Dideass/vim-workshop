import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {serve} from './static-server.mjs';
const server=await serve('dist',4177);
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
await mkdir('test-results',{recursive:true});
try{
 const page=await browser.newPage();
 const loaded=()=>page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
 for(const viewport of [{width:1366,height:768},{width:1920,height:1080},{width:1024,height:768}]){
  await page.setViewportSize(viewport);await page.goto('http://127.0.0.1:4177/between-lines/');await loaded();
  const editor=await page.locator('.editor-shell').boundingBox();
  const task=await page.locator('.task').boundingBox();const rules=await page.locator('.constraints').boundingBox();const check=await page.locator('.check-button').boundingBox();
  assert(editor.width>=viewport.width*.9,'Vim must occupy at least 90% of the viewport width.');
  assert(editor.height>=viewport.height*.5,'Vim must occupy at least half the viewport height.');
  assert(task.y<editor.y&&rules.y<editor.y,'Task and constraints must precede Vim.');
  assert(check.y+check.height<=viewport.height,'Check must be visible without scrolling.');
  assert.equal(await page.locator('.levels-menu').getAttribute('open'),null);
  assert.equal(await page.locator('.hint-dialog').isVisible(),false);
  const hints=await page.locator('.hint-button').boundingBox();assert(hints.y<editor.y,'Hint control must precede Vim.');
  assert.equal(await page.locator('.hint-button').isVisible(),true);
  const palette=await page.evaluate(()=>({background:getComputedStyle(document.documentElement).backgroundColor,text:getComputedStyle(document.documentElement).color,task:getComputedStyle(document.querySelector('.task-copy')).fontSize}));
  assert.equal(palette.background,'rgb(12, 12, 12)');assert.equal(palette.text,'rgb(222, 222, 222)');assert(parseInt(palette.task)>=15);
  await page.screenshot({path:`test-results/layout-${viewport.width}.png`});
  await page.locator('.levels-menu > summary').click();
  const catalogue=await page.locator('.catalogue').evaluate(panel=>({
   scrollHeight:panel.scrollHeight,clientHeight:panel.clientHeight,
   columns:[...panel.querySelectorAll('.catalogue-column')].map(column=>({
    x:column.getBoundingClientRect().x,ids:[...column.querySelectorAll('.level-number')].map(number=>Number(number.textContent))
   })),
   inside:[...panel.querySelectorAll('button')].every(button=>{
    const bounds=button.getBoundingClientRect(),container=panel.getBoundingClientRect();
    return bounds.top>=container.top&&bounds.bottom<=container.bottom&&bounds.left>=container.left&&bounds.right<=container.right;
   })
  }));
  assert.equal(catalogue.columns.length,3);
  assert.deepEqual(catalogue.columns.map(column=>column.ids),Array.from({length:3},(_,i)=>Array.from({length:11},(_,j)=>i*11+j+1)));
  assert(catalogue.columns[0].x<catalogue.columns[1].x&&catalogue.columns[1].x<catalogue.columns[2].x);
  assert(catalogue.scrollHeight<=catalogue.clientHeight,'All levels must fit without a desktop scrollbar.');
  assert(catalogue.inside,'All 33 levels must fit inside the menu.');
  await page.screenshot({path:`test-results/layout-levels-${viewport.width}.png`});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.levels-menu').getAttribute('open'),null);
  if(viewport.width===1366){
   const input=page.frameLocator('iframe').locator('#input');
   for(const key of ['i',...'Mother ','Escape',':','w','Enter'])await input.press(key);
   await page.getByRole('button',{name:'Check this page'}).click();await page.locator('.result.success').waitFor();
   const next=await page.getByRole('button',{name:'Next page →'}).boundingBox();assert(next.y+next.height<=viewport.height,'Next page must be visible after completion.');
   await page.screenshot({path:'test-results/layout-completed.png'});
   await page.reload();await loaded();
   assert.equal(await page.getByRole('button',{name:'Next page →'}).isVisible(),true,'Completed pages retain Next after refresh.');
   await page.getByRole('button',{name:'Next page →'}).click();await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='Unwanted traces');await loaded();
   await page.locator('.levels-menu > summary').click();await page.getByRole('button',{name:/01.*The missing word/}).click();await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='The missing word');
   assert.equal(await page.locator('.levels-menu').getAttribute('open'),null);
  }
  results.push({viewport,palette,editor,task,rules,check,catalogue,passed:true});
 }
 await page.setViewportSize({width:390,height:844});await page.locator('.mobile-preview').waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'test-results/layout-mobile.png',fullPage:true});
 await page.locator('.levels-menu > summary').click();
 const mobileCatalogue=await page.locator('.catalogue').evaluate(panel=>({
  columns:getComputedStyle(panel.querySelector('.catalogue-columns')).gridTemplateColumns.split(' ').length,
  scrollbar:getComputedStyle(panel).scrollbarColor,
  right:panel.getBoundingClientRect().right,scrollWidth:panel.scrollWidth,clientWidth:panel.clientWidth
 }));
 assert.equal(mobileCatalogue.columns,1);
 assert.equal(mobileCatalogue.scrollbar,'rgb(85, 85, 85) rgb(25, 25, 25)');
 assert(mobileCatalogue.right<=390&&mobileCatalogue.scrollWidth<=mobileCatalogue.clientWidth);
 await page.locator('.catalogue').evaluate(panel=>panel.scrollTop=panel.scrollHeight);
 const lastLevel=await page.locator('.catalogue button').last().boundingBox();
 assert(lastLevel.y>=0&&lastLevel.y+lastLevel.height<=844,'The last level remains reachable on mobile.');
 await page.screenshot({path:'test-results/layout-levels-mobile.png'});
 console.log('Layout, grayscale palette, first completion, level navigation and mobile view passed.');
}finally{await browser.close();server.close();await writeFile('test-results/layout-results.json',JSON.stringify(results,null,2));}
