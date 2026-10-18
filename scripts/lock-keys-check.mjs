import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {serve} from './static-server.mjs';
import {sendVimKeys} from './keyboard.mjs';

const server=await serve('dist',4189),results=[];
await mkdir('test-results',{recursive:true});
try{for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
 const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
 try{
  const page=await browser.newPage();
  await page.addInitScript(()=>{
   if(window===parent)window.addEventListener('message',e=>{
    if(e.data?.channel==='between-lines'&&e.data.type==='snapshot'){
     window.testSnapshot=e.data.snapshot;window.testToken=e.data.token;
    }
   });
   window.lockAudit=[];
   document.addEventListener('keydown',e=>{
    if(['CapsLock','NumLock','ScrollLock'].includes(e.key))
     queueMicrotask(()=>window.lockAudit.push({key:e.key,prevented:e.defaultPrevented}));
   },true);
  });
  const input=()=>page.frameLocator('iframe').locator('#input');
  const ready=()=>page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
  const send=sequence=>sendVimKeys(input(),sequence);
  const keys=async()=>Number(await page.locator('.key-counter strong').innerText());
  const restart=async()=>{
   const token=await page.evaluate(()=>window.testToken);
   await page.locator('.reset-button').click();
   await page.waitForFunction(old=>window.testToken!==old,token);await ready();
  };
  const locks=async()=>{
   for(const key of ['CapsLock','NumLock','ScrollLock']){
    await input().press(key);await input().press(key);
   }
  };
  await page.goto(process.env.LOCK_KEYS_URL||'http://127.0.0.1:4189/between-lines/');await ready();
  const initial=await page.evaluate(()=>window.testSnapshot.text);

  // In Insert mode the old adapter inserted tabs for Caps Lock. Lock events
  // must also retain their OS/browser default and cost no challenge keys.
  await send('i');await locks();await send('aA<Esc>');
  await page.waitForFunction(text=>window.testSnapshot.text==='aA'+text,initial);
  assert.equal(await keys(),4);
  const audit=await input().evaluate(()=>window.lockAudit);
  assert.equal(audit.length,6);assert(audit.every(e=>!e.prevented));

  // Lock toggles cannot alter Normal/Visual commands or the Ex command line.
  await restart();await locks();await send('V');await locks();await send('<Esc>');
  await ready();assert.equal(await page.evaluate(()=>window.testSnapshot.text),initial);
  assert.equal(await keys(),2);
  await send('iZ<Esc>:');await locks();await send('w<CR>');
  await page.waitForFunction(text=>window.testSnapshot.saved==='Z'+text&&!window.testSnapshot.modified,initial);
  assert.equal(await keys(),8);

  // Filtering Caps Lock must not filter a genuine Tab or Ctrl+T indentation.
  for(const sequence of ['i<Tab><Esc>','i<C-t><Esc>']){
   await restart();await send(sequence);
   await page.waitForFunction(text=>window.testSnapshot.text==='\t'+text,initial);
   assert.equal(await keys(),3);
  }

  // Honor a system-remapped Caps Lock that arrives as Escape. The logical key,
  // not its physical code, determines whether to filter the event.
  await restart();await send('i');
  await input().evaluate(element=>element.dispatchEvent(new KeyboardEvent('keydown',{
   key:'Escape',code:'CapsLock',keyCode:27,bubbles:true,cancelable:true
  })));
  await ready();await send('iZ<Esc>');
  await page.waitForFunction(text=>window.testSnapshot.text==='Z'+text,initial);
  assert.equal(await keys(),5);
  results.push({channel,lockDefaultsPreserved:true,casePreserved:true,lockKeysFree:true,realTabAndCtrlT:true,remappedEscape:true,passed:true});
  console.log(channel,'lock keys, letter case, counting, Tab/Ctrl+T and remapped Escape passed');
 }finally{await browser.close();}
}}finally{
 server.close();await writeFile('test-results/lock-keys-results.json',JSON.stringify(results,null,2));
}
