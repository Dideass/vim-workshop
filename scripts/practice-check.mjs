import {sendVimKeys} from './keyboard.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {serve} from './static-server.mjs';
import {levelData} from './level-data.mjs';
import {practiceCases} from './practice-cases.mjs';
const {levels}=await levelData();
const {version}=JSON.parse(await readFile('package.json','utf8'));
const server=await serve('dist',4186),results=[];
await mkdir('test-results',{recursive:true});
try{for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
 const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
 try{
  const page=await browser.newPage();
  const runtimeRequests=[];page.on('request',r=>{if(/\/(?:editor|practice)\.js\?/.test(r.url()))runtimeRequests.push(r.url());});
  await page.addInitScript(()=>{
   if(window!==parent)return;
   if(!localStorage.getItem('vim-workshop.progress.v3'))localStorage.setItem('vim-workshop.progress.v3',JSON.stringify({version:3,completed:Object.fromEntries(Array.from({length:33},(_,i)=>[i+1,{assisted:false,keys:1,completedAt:'2026-10-18T00:00:00.000Z'}])),drafts:{},seenSolutions:[]}));
   window.addEventListener('message',e=>{if(e.data?.channel==='between-lines'&&e.data.type==='snapshot'){window.testSnapshot=e.data.snapshot;window.testToken=e.data.token;}});
  });
  const ready=()=>page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL',null,{timeout:30000});
  const input=()=>page.frameLocator('iframe').locator('#input');
  const send=(sequence,options)=>sendVimKeys(input(),sequence,options);
  await page.goto('http://127.0.0.1:4186/between-lines/');await ready();
  assert.equal(new URL(await page.locator('iframe').getAttribute('src')).searchParams.get('runtime'),version);
  for(const name of ['editor','practice'])assert(runtimeRequests.some(url=>new URL(url).pathname.endsWith('/'+name+'.js')&&new URL(url).searchParams.get('v')===version),'Runtime modules must use the same release as the parent app.');
  for(const item of practiceCases){
   if(process.env.PRACTICE_CASES&&!process.env.PRACTICE_CASES.split(',').includes(item.name))continue;
   const level=levels[item.id-1],token=await page.evaluate(()=>window.testToken);
   await page.evaluate(id=>location.hash=`/level/${id}`,item.id);
   if(await page.evaluate(()=>window.testToken)===token)await page.locator('.reset-button').click();
   await page.waitForFunction(old=>window.testToken!==old,token);await ready();
   assert.equal(await page.evaluate(()=>window.testSnapshot.text),level.initial);
   if(item.blockedPaste)await input().evaluate(element=>element.dispatchEvent(new Event('paste',{bubbles:true,cancelable:true})));
   await send(item.sequence,{literal:!!item.literal});
   await page.waitForFunction(expected=>window.testSnapshot.text===expected&&window.testSnapshot.saved===expected&&!window.testSnapshot.modified,level.expected,{timeout:10000});
   const actions=await page.evaluate(()=>window.testSnapshot.actions||[]);
   const missing=(level.rules.requiredActions||[]).filter(action=>!actions.includes(action));
   const keys=(item.sequence.match(/<(?:Esc|CR|Tab|C-[a-z])>|[\s\S]/g)||[]).length;
   await page.locator('.check-button').click();await page.locator('.result').waitFor();
   const message=await page.locator('.result').innerText();
   assert.deepEqual(missing,[],`${item.name}: native operation was not recorded. ${message}`);
   const inBudget=!level.rules.maxKeys||keys<=level.rules.maxKeys;
   assert.equal(await page.locator('.result').evaluate(e=>e.classList.contains('success')),inBudget&&!item.blockedPaste,`${item.name}: ${message}`);
   if(!inBudget)assert.match(message,/budget/i,'A budget failure must not pretend that an action is missing.');
   if(item.blockedPaste){assert.match(message,/Blocked input/);assert.match(message,/External paste/);}
   if(item.name==='overbudget-direct-percent'){
    assert(message.includes(`${keys} / ${level.rules.maxKeys}`));
    await page.locator('#language').selectOption('zh');
    assert.match(await page.locator('.result').innerText(),/按键数超过预算/);
    assert(!message.includes('Match brackets'),'A recorded % must not be reported missing.');
    await page.locator('#language').selectOption('en');
   }
   if(item.name==='direct-percent'){
    assert(inBudget);assert(!item.sequence.includes('f['));
    await page.screenshot({path:`test-results/direct-percent-${channel}.png`});
   }
   results.push({channel,...item,keys,budget:level.rules.maxKeys,actions,passed:true});console.log(channel,'PASS',item.name,item.blockedPaste?'blocked input':inBudget?'cleared':'budget only');
  }
 }finally{await browser.close();}
}}finally{server.close();await writeFile(process.env.PRACTICE_CASES?'test-results/practice-focused-results.json':'test-results/practice-results.json',JSON.stringify(results,null,2));}
