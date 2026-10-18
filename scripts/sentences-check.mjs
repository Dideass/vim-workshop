import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {serve} from './static-server.mjs';
import {levelData} from './level-data.mjs';

const {levels}=await levelData();
const server=await serve('dist',4182);
await mkdir('test-results',{recursive:true});
try{for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
 const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
 try{for(const id of [5,7,8,11]){
  const level=levels[id-1];
  const draft=id===8?level.initial:level.expected;
  const page=await browser.newPage({viewport:{width:1366,height:900}});
  await page.addInitScript(({id,draft})=>{
   if(window!==parent)return;
   const completed=Object.fromEntries(Array.from({length:11},(_,i)=>[String(i+1),{assisted:false,keys:5,completedAt:'2026-10-18T00:00:00.000Z'}]));
   if(!localStorage.getItem('vim-workshop.progress.v3'))localStorage.setItem('vim-workshop.progress.v3',JSON.stringify({version:3,completed,drafts:{[id]:draft},seenSolutions:['8']}));
   window.addEventListener('message',event=>{if(event.data?.channel==='between-lines'&&event.data.type==='snapshot'){window.testSnapshot=event.data.snapshot;window.testSnapshotToken=event.data.token;}});
  },{id,draft});
  await page.goto(`http://127.0.0.1:4182/between-lines/#/level/${id}`);
  const ready=()=>page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
  await ready();
  const expected=id===8?level.initial:level.expected;
  assert.equal(await page.evaluate(()=>window.testSnapshot.text),expected);
  assert.equal(await page.locator('.mode-switch .selected').innerText(),'Explore');
  assert.equal(await page.locator('.completion-scene').count(),0);
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('vim-workshop.progress.v3')));
  assert.equal(Object.keys(progress.completed).length,11);assert.deepEqual(progress.seenSolutions,['8']);
  assert.equal(progress.drafts[id],expected);
  await page.locator('[aria-controls="text-source"]').click();
  assert.match(await page.locator('.source-body').innerText(),/user-provided Chinese/);
  const token=await page.evaluate(()=>window.testSnapshotToken);
  await page.locator('#language').selectOption('zh');
  assert.match(await page.locator('.source-body').innerText(),/用户提供的中文/);
  assert.equal(await page.evaluate(()=>window.testSnapshot.text),expected);
  assert.equal(await page.evaluate(()=>window.testSnapshotToken),token);
  await page.locator('#language').selectOption('en');
  await page.locator('[aria-controls="text-source"]').click();
  await page.getByRole('button',{name:'Challenge',exact:true}).click();
  await page.waitForFunction(old=>window.testSnapshotToken!==old,token);await ready();
  assert.equal(await page.evaluate(()=>window.testSnapshot.text),level.initial);
  assert.equal(await page.locator('.key-counter strong').innerText(),'0');
  await page.screenshot({path:`test-results/sentence-${id}-${channel}.png`});
  await page.close();
 }
 console.log(channel,'complete sentence drafts, bilingual attribution and clean restart passed.');
 }finally{await browser.close();}
}}finally{server.close();}
