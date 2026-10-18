import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {serve} from './static-server.mjs';
const server=await serve('dist',4187),results=[];
await mkdir('test-results',{recursive:true});
try{for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
 const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
 try{
  const page=await browser.newPage();
  // Simulate a missed upstream reload callback. The app must still notice
  // controller activation and recover the very first visit automatically.
  await page.addInitScript(()=>{window.coi={doReload(){}};});
  await page.goto('http://127.0.0.1:4187/between-lines/');
  await page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL',null,{timeout:30000});
  assert(await page.evaluate(()=>crossOriginIsolated));
  assert(await page.evaluate(()=>!!navigator.serviceWorker.controller));
  assert.equal(await page.locator('.notice').count(),0);
  const input=page.frameLocator('iframe').locator('#input');
  for(const key of ['i',...'Mother ','Escape',':','w','Enter'])await input.press(key);
  await page.locator('.check-button').click();await page.locator('.result.success').waitFor();
  results.push({channel,firstVisitRecovered:true,passed:true});console.log(channel,'first-visit isolation control race recovered without a manual reload.');
 }finally{await browser.close();}
}}finally{server.close();await writeFile('test-results/isolation-results.json',JSON.stringify(results,null,2));}
