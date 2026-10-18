import {chromium} from 'playwright';
import {serve} from './static-server.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=await serve('dist',4176);const results=[];
await mkdir('test-results',{recursive:true});
try{
 for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
  const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
  try{
   const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'allow'});
   const page=await context.newPage();
   await page.addInitScript(()=>window.addEventListener('message',e=>{if(e.data?.channel==='between-lines'&&e.data.type==='snapshot')window.testSnapshot=e.data.snapshot;}));
   await page.goto('http://127.0.0.1:4176/between-lines/');
   await page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
   const input=page.frameLocator('iframe').locator('#input');
   await input.press('Control+v');
   await page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='VISUAL');
   await input.press('Escape');
   assert.equal(await page.locator('.notice').count(),0);
   await input.evaluate(el=>{const e=new Event('paste',{bubbles:true,cancelable:true});el.dispatchEvent(e);});
   await page.waitForFunction(()=>document.querySelector('.notice')?.textContent.includes('External paste'));
   assert.equal(await page.evaluate(()=>window.testSnapshot.text.startsWith('died today')),true);
   results.push({channel,case:'Ctrl+V keeps Visual Block; external paste blocked',passed:true});
   // The server never adds COOP/COEP: a service-worker update must keep isolation.
   await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
   await page.reload();await page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
   assert.equal(await page.evaluate(()=>crossOriginIsolated),true);
   results.push({channel,case:'service worker update and reload',passed:true});
   await context.close();
   // No localStorage is a recoverable session, not a blank page.
   const restricted=await browser.newContext();
   await restricted.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('Storage disabled');}}));
   const p=await restricted.newPage();await p.goto('http://127.0.0.1:4176/between-lines/');
   await p.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
   assert.match(await p.locator('.notice').innerText(),/Export progress/);
   const k=p.frameLocator('iframe').locator('#input');
   for(const key of ['i',...'Mother ','Escape',':','w','Enter'])await k.press(key);
   await p.getByRole('button',{name:'Check this page'}).click();await p.locator('.result.success').waitFor();
   results.push({channel,case:'storage unavailable: edit, complete and export reminder',passed:true});
   await restricted.close();
   // A failed worker request can be restarted once the transport is available.
   const broken=await browser.newContext({serviceWorkers:'block'});const b=await broken.newPage();
   await b.route('**/*',async route=>{
    if(route.request().url().endsWith('/vendor/vim.js'))return route.abort();
    const response=await route.fetch();return route.fulfill({response,headers:{...response.headers(),'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp'}});
   });
   await b.goto('http://127.0.0.1:4176/between-lines/');await b.getByRole('button',{name:'Restart editor'}).waitFor({timeout:30000});
   await b.unroute('**/*');
   await b.route('**/*',async route=>{const response=await route.fetch();return route.fulfill({response,headers:{...response.headers(),'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp'}});});
   await b.getByRole('button',{name:'Restart editor'}).click();await b.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
   results.push({channel,case:'worker network error and recovery',passed:true});await broken.close();
   console.log(channel,'resilience checks passed');
  }finally{await browser.close();}
 }
}finally{server.close();await writeFile('test-results/resilience-results.json',JSON.stringify(results,null,2));}
