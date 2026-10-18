import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {serve} from './static-server.mjs';
import {levelData} from './level-data.mjs';
const {levels,getVariant}=await levelData();
const server=await serve('dist',4180);const results=[];
await mkdir('test-results',{recursive:true});
try{
 for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
  const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
  try{
   const page=await browser.newPage({viewport:{width:1366,height:768}});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   const ready=()=>page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL'||document.querySelector('.mode')?.textContent==='普通模式');
   const input=()=>page.frameLocator('iframe').locator('#input');
   const send=async seq=>{for(const k of seq.match(/<(?:Esc|CR|C-[a-z])>|[\s\S]/g)||[])await input().press(k==='<Esc>'?'Escape':k==='<CR>'?'Enter':/^<C-/.test(k)?'Control+'+k[3]:k);};
   const check=()=>page.locator('.check-button').click();
   const transition=async action=>{const src=await page.locator('iframe').getAttribute('src');await action();await page.waitForFunction(old=>document.querySelector('iframe')?.getAttribute('src')!==old,src);await ready();};
   const scene=page.locator('.completion-scene');
   await page.goto('http://127.0.0.1:4180/between-lines/');await ready();
   await send('iMother <Esc>');await check();await page.locator('.result').waitFor();
   assert.equal(await scene.count(),0,'Unsaved text cannot trigger celebration.');
   await send(':w<CR>');await check();await scene.waitFor();
   assert.equal(await scene.locator('strong').textContent(),'Level cleared');
   assert.equal(await scene.locator('.filled').count(),1);
   assert.equal(await scene.locator('.completion-progress-label').count(),0);
   assert(await scene.locator('.pixel-title rect').count()>100,'The title must be built from actual pixel cells.');
   assert.equal(await scene.evaluate(e=>getComputedStyle(e).pointerEvents),'none');
   assert.equal(await page.getByRole('button',{name:'Next page →'}).isVisible(),true);
   await scene.evaluate(e=>Promise.all(e.getAnimations({subtree:true}).map(animation=>animation.finished)));
   await page.screenshot({path:`test-results/${channel}-completion.png`});
   // The stamp must remain after the former 2.4-second dismissal deadline.
   await page.waitForTimeout(2700);
   assert.equal(await scene.isVisible(),true);assert.equal(await scene.evaluate(e=>getComputedStyle(e).opacity),'1');
   const stamp=await scene.elementHandle();
   await check();assert.equal(await stamp.evaluate(e=>e.isConnected),true,'Checking again must retain the same stamp.');
   await transition(()=>page.getByRole('button',{name:'↺ Restart',exact:true}).click());
   assert.equal(await scene.count(),0,'Restart must clear the previous completion stamp.');
   await send(levels[0].solutions[0]);await check();await scene.waitFor();
   await transition(()=>page.getByRole('button',{name:'Next page →'}).click());
   assert.equal(await scene.count(),0,'Moving on immediately must clear the celebration.');
   await page.locator('.levels-menu summary').click();
   await transition(()=>page.getByRole('button',{name:/01.*The missing word/}).click());
   assert.equal(await scene.count(),0,'Returning to a completed level must not show a completion stamp.');
   await page.reload();await ready();
   assert.equal(await scene.count(),0,'Reloading a completed level must not show a completion stamp.');
   // The new finale is level 33, with no bonus variant after it.
   const completed=Object.fromEntries(levels.slice(0,-1).map(l=>[l.id,{keys:0,assisted:false,completedAt:new Date().toISOString()}]));
   await page.evaluate(p=>{localStorage.setItem('vim-workshop.progress.v3',JSON.stringify(p));localStorage.setItem('vim-workshop.language','zh');},{version:3,completed,drafts:{},seenSolutions:[]});
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.goto('http://127.0.0.1:4180/between-lines/#/level/33');await page.reload();await ready();
   assert.equal(await scene.count(),0);
   await send(levels.at(-1).solutions[0]);await check();await scene.waitFor();
   assert.equal(await scene.locator('strong').textContent(),'全部通关！');
   assert.equal(await scene.locator('.completion-congratulations').textContent(),'恭喜你！');
   assert.equal(await scene.locator('.filled').count(),33);
   assert.equal(await scene.locator('strong .pixel-title').evaluate(e=>new Set([...e.querySelectorAll('rect')].map(r=>r.getAttribute('fill'))).size),7);
   assert.equal(await scene.evaluate(e=>e.getAnimations({subtree:true}).length),0);
   assert.equal(await scene.locator('.completion-fragments').evaluate(e=>getComputedStyle(e).display),'none');
   assert.equal(await page.locator('.next-button').count(),0);
   assert.equal(await page.getByRole('button',{name:'挑战一道变式 →'}).count(),0);
   await page.screenshot({path:`test-results/${channel}-completion-zh.png`});
   await page.getByLabel('Language',{exact:true}).selectOption('en');
   assert.equal(await scene.locator('strong').textContent(),'All levels cleared!');
   await page.screenshot({path:`test-results/${channel}-completion-final-en.png`});
   await transition(()=>page.getByRole('button',{name:'Explore',exact:true}).click());
   await send(levels.at(-1).solutions[0]);await check();await page.locator('.result.success').waitFor();
   assert.equal(await scene.count(),0,'Explore stays unscored.');
   assert.deepEqual(errors,[]);results.push({channel,passed:true});
   console.log(channel,'33-level completion, persistent stamp, no final variant, and reduced-motion checks passed');
  }finally{await browser.close();}
 }
}finally{server.close();await writeFile('test-results/completion-results.json',JSON.stringify(results,null,2));}
