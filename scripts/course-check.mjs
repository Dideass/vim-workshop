import {sendVimKeys} from './keyboard.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {serve} from './static-server.mjs';
import {levelData} from './level-data.mjs';
const {levels}=await levelData();
const server=await serve('dist',4184);const results=[];
await mkdir('test-results',{recursive:true});
try{for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
 const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{
   if(window!==parent){
    window.testInputBlocked=false;
    window.addEventListener('message',event=>{
     if(event.source===parent&&event.origin===location.origin&&event.data?.type==='block-input')
      queueMicrotask(()=>window.testInputBlocked=!!event.data.blocked);
    });
    return;
   }
   if(!localStorage.getItem('vim-workshop.progress.v3'))localStorage.setItem('vim-workshop.progress.v3',JSON.stringify({version:3,completed:Object.fromEntries(Array.from({length:33},(_,i)=>[i+1,{assisted:false,keys:1,completedAt:'2026-10-18T00:00:00.000Z'}])),drafts:{},seenSolutions:[]}));
   window.addEventListener('message',event=>{if(event.data?.channel==='between-lines'&&event.data.type==='snapshot'){window.testSnapshot=event.data.snapshot;window.testToken=event.data.token;}});
  });
  const ready=()=>page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL',null,{timeout:30000});
  const input=()=>page.frameLocator('iframe').locator('#input');
  const send=sequence=>sendVimKeys(input(),sequence);
  const restart=async()=>{const token=await page.evaluate(()=>window.testToken);await page.locator('.reset-button').click();await page.waitForFunction(old=>window.testToken!==old,token);await ready();};
  await page.goto('http://127.0.0.1:4184/between-lines/');await ready();
  for(const level of levels){
   if(process.env.COURSE_LEVELS&&!process.env.COURSE_LEVELS.split(',').includes(String(level.id)))continue;
   if(level.id!==1){const token=await page.evaluate(()=>window.testToken);await page.evaluate(id=>location.hash=`/level/${id}`,level.id);await page.waitForFunction(old=>window.testToken!==old,token);await ready();}
   // Correct saved text and an in-budget edit must still explain the exact missing command.
   const alternatives={
    7:{sequence:'/eight<CR>cwseven<Esc>:w<CR>',missing:/Replace mode \(R\)/},
    8:{sequence:'f[ca[city<Esc>:w<CR>',missing:/Match brackets \(%\)/},
    9:{sequence:'iI<Esc>Anothing.<Esc>:w<CR>',missing:/Insert at first nonblank \(I\)/}
   };
   const alternative=alternatives[level.id];
   if(alternative){
    await restart();await send(alternative.sequence);
    await page.waitForFunction(expected=>window.testSnapshot.text===expected&&!window.testSnapshot.modified,level.expected);
    await page.locator('.check-button').click();await page.locator('.result').waitFor();
    assert(!(await page.locator('.result').evaluate(element=>element.classList.contains('success'))));
    assert.match(await page.locator('.result').innerText(),alternative.missing);
    assert(Number(await page.locator('.key-counter strong').innerText())<=level.rules.maxKeys,'An in-budget alternative gets an explicit missing-action explanation.');
    // The same command is visible before attempting the task in both interface languages.
    assert.match(await page.locator('.rules-list').innerText(),alternative.missing);
    if(level.id===8){
     await page.locator('#language').selectOption('zh');
     assert.match(await page.locator('.rules-list').innerText(),/括号配对定位（%）/);
     assert.match(await page.locator('.result').innerText(),/括号配对定位（%）/);
     await page.locator('#language').selectOption('en');
    }
    console.log(channel,'explicit practice feedback',level.id);
   }
   for(const [index,sequence] of level.solutions.entries()){
    await restart();
    assert.equal(await page.evaluate(()=>window.testSnapshot.text),level.initial);
    assert.equal(await page.locator('.key-counter strong').innerText(),'0');
    for(const required of level.rules.requiredActions||[])assert(!(await page.evaluate(()=>window.testSnapshot.actions)).includes(required),'Restart clears practice evidence.');
    // Stage three has one route, taken directly from the current validated list.
    for(const language of ['en','zh']){
     await page.locator('#language').selectOption(language);
     await page.locator('.hint-button').click();
     const dialog=page.locator('.hint-dialog');
     const next=dialog.locator('.hint-navigation button').last();
     while(await next.isEnabled())await next.click();
     assert.equal(await dialog.locator('.hint code').count(),1);
     assert.equal(await dialog.locator('.hint code').innerText(),level.solutions[0]);
     assert.equal(await dialog.locator('.hint > p:not(.assisted-note)').count(),0,'No duplicate or stale route prose.');
     await dialog.locator('.hint-done').click();
     await dialog.waitFor({state:'hidden'});
    }
    await page.locator('#language').selectOption('en');
    // Native dialog focus restoration can finish after the close click resolves.
    // Reacquire focus while polling instead of waiting forever after one focus().
    await page.waitForFunction(()=>{
     const frame=document.querySelector('iframe');
     if(document.querySelector('.hint-dialog').open)return false;
     // Closing the DOM dialog precedes its asynchronous iframe unblock message.
     // A synthetic focus() must not bypass that message and drop early keys.
     if(frame?.contentWindow?.testInputBlocked!==false)return false;
     frame?.contentDocument?.getElementById('input')?.focus();
     return document.activeElement===frame&&frame.contentDocument.activeElement?.id==='input';
    });
    await send(sequence);
    await page.waitForFunction(expected=>window.testSnapshot?.text===expected&&window.testSnapshot.saved===expected&&!window.testSnapshot.modified,level.expected,{timeout:10000}).catch(async error=>{
     const snapshot=await page.evaluate(()=>window.testSnapshot);console.error(channel,level.id,index,{mode:snapshot.mode,actions:snapshot.actions,actualStart:snapshot.text.slice(0,100),expectedStart:level.expected.slice(0,100)});throw error;
    });
    const actions=await page.evaluate(()=>window.testSnapshot.actions||[]);
    for(const required of level.rules.requiredActions||[])assert(actions.includes(required),`${level.id}: missing ${required}`);
    await page.locator('.check-button').click();await page.locator('.result').waitFor();
    assert(await page.locator('.result').evaluate(element=>element.classList.contains('success')),await page.locator('.result').innerText());
    const keys=(sequence.match(/<(?:Esc|CR|Tab|C-[a-z])>|[\s\S]/g)||[]).length;
    assert.equal(await page.locator('.key-counter strong').innerText(),String(keys));
    assert(!level.rules.maxKeys||keys<=level.rules.maxKeys);
    results.push({channel,level:level.id,solution:index+1,keys,budget:level.rules.maxKeys,actions,passed:true});
    if([19,23,26,32].includes(level.id))await page.screenshot({path:`test-results/course-${level.id}-${channel}.png`,fullPage:true});
   }
   console.log(channel,'PASS',level.id,level.rules.maxKeys??'unlimited');
  }
 }finally{await browser.close();}
}}finally{server.close();await writeFile(process.env.COURSE_LEVELS?'test-results/course-focused-results.json':'test-results/course-results.json',JSON.stringify(results,null,2));}
