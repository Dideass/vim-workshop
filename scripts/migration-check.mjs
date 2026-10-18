import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {serve} from './static-server.mjs';
const server=await serve('dist',4181);const results=[];
await mkdir('test-results',{recursive:true});
try{
 for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
  const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
  try{
   const page=await browser.newPage();
   const legacy=JSON.stringify({version:2,completed:Object.fromEntries(Array.from({length:33},(_,i)=>[i+1,{keys:10,assisted:true,completedAt:new Date().toISOString()}])),drafts:{'1':'OLD DRAFT\n'},seenSolutions:['1','18','33']});
   await page.addInitScript(old=>{
    if(window!==parent)return;
    if(!localStorage.getItem('vim-workshop.progress.v3')){
     localStorage.setItem('vim-workshop.progress.v2',old);
     localStorage.setItem('between-lines.progress.v1',JSON.stringify({version:1}));
     localStorage.setItem('vim-workshop.language','zh');
    }
    window.addEventListener('message',e=>{if(e.data?.channel==='between-lines'&&e.data.type==='snapshot')window.testSnapshot=e.data.snapshot;});
   },legacy);
   const ready=()=>page.waitForFunction(()=>['NORMAL','普通模式'].includes(document.querySelector('.mode')?.textContent));
   await page.goto('http://127.0.0.1:4181/between-lines/#/level/18');await ready();
   assert.equal(await page.locator('#language').inputValue(),'zh');
   assert.equal(await page.locator('.catalogue button:disabled').count(),32);
   assert.equal(await page.locator('.key-counter strong').innerText(),'0');
   const fresh=await page.evaluate(()=>JSON.parse(localStorage.getItem('vim-workshop.progress.v3')));
   assert.deepEqual(fresh,{version:3,completed:{},drafts:{},seenSolutions:[]});
   assert.equal(await page.evaluate(()=>localStorage.getItem('vim-workshop.progress.v2')),null);
   assert.equal(await page.evaluate(()=>localStorage.getItem('between-lines.progress.v1')),null);
   assert.notEqual(await page.evaluate(()=>window.testSnapshot.text),'OLD DRAFT\n');
   await page.locator('#language').selectOption('en');
   await page.locator('input[type=file]').setInputFiles({name:'old.json',mimeType:'application/json',buffer:Buffer.from(legacy)});
   await page.waitForFunction(()=>document.querySelector('.notice')?.textContent.includes('older course'));
   await page.locator('#language').selectOption('zh');
   await page.reload();await ready();
   assert.equal(await page.locator('#language').inputValue(),'zh');
   assert.equal(await page.locator('.catalogue button:disabled').count(),32);
   // Fresh-course records still support large drafts and normal progress persistence.
   const completed=Object.fromEntries(Array.from({length:31},(_,i)=>[i+1,{keys:10,assisted:false,completedAt:new Date().toISOString()}]));
   await page.evaluate(p=>{localStorage.setItem('vim-workshop.progress.v3',JSON.stringify(p));localStorage.setItem('vim-workshop.language','en');},{version:3,completed,drafts:{},seenSolutions:[]});
   await page.goto('http://127.0.0.1:4181/between-lines/?large-draft=1#/level/32');await ready();
   const input=()=>page.frameLocator('iframe').locator('#input');
   for(const key of ['i',...'DRAFT ','Escape',':','w','Enter'])await input().press(key);
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('vim-workshop.progress.v3')).drafts['32']?.startsWith('DRAFT '));
   const draft=await page.evaluate(()=>JSON.parse(localStorage.getItem('vim-workshop.progress.v3')).drafts['32']);
   assert(draft.length>50000);
   await page.reload();await ready();
   assert.equal(await page.locator('.mode-switch .selected').innerText(),'Explore');
   assert.equal(await page.evaluate(()=>window.testSnapshot.text),draft);
   assert.equal(await page.locator('.completion-scene').count(),0);
   results.push({channel,freshCourseReset:true,languagePreserved:true,draftCharacters:draft.length,passed:true});console.log(channel,'course reset, language preference and large new-course draft reload passed');
  }finally{await browser.close();}
 }
}finally{server.close();await writeFile('test-results/migration-results.json',JSON.stringify(results,null,2));}
