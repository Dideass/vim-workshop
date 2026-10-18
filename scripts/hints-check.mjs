import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {serve} from './static-server.mjs';

const server=await serve('dist',4179);const results=[];
await mkdir('test-results',{recursive:true});
try{
 for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
  const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
  try{
   const page=await browser.newPage({viewport:{width:1366,height:768}});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.addInitScript(()=>{
    window.addEventListener('message',e=>{if(e.data?.channel==='between-lines'&&e.data.type==='snapshot'){window.testSnapshot=e.data.snapshot;window.testToken=e.data.token;}});
    const fill=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(text,...args){
     if(String(text).includes('~'))(window.tildeDraws??=[]).push({text,color:this.fillStyle});
     return fill.call(this,text,...args);
    };
   });
   await page.goto('http://127.0.0.1:4179/between-lines/');
   await page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
   const input=()=>page.frameLocator('iframe').locator('#input');
   const state=()=>page.evaluate(()=>({token:window.testToken,text:window.testSnapshot.text,keys:document.querySelector('.key-counter strong').textContent}));
   const tildeDraws=await input().evaluate(()=>window.tildeDraws||[]);
   assert(tildeDraws.some(draw=>draw.color==='#8e8e8e'),'Vim must draw visible gray EOF tildes.');
   assert.equal(await page.locator('.language-control').innerText(),'English\n简体中文');
   const chevron=await page.locator('.levels-menu summary').evaluate(e=>({content:getComputedStyle(e,'::after').content,transform:getComputedStyle(e,'::after').transform}));
   assert.equal(chevron.content,'""');
   await page.locator('.levels-menu summary').click();
   assert.notEqual(await page.locator('.levels-menu summary').evaluate(e=>getComputedStyle(e,'::after').transform),chevron.transform);
   await page.keyboard.press('Escape');
   // Begin with an unsaved edit; reading hints must preserve both it and the attempt.
   for(const key of ['i','A','Escape'])await input().press(key);
   await page.waitForFunction(()=>window.testSnapshot.text.startsWith('A'));
   const before=await state();
   await page.getByRole('button',{name:'Hint',exact:true}).click();
   const dialog=page.getByRole('dialog',{name:'Hints'});await dialog.waitFor();
   assert.equal(await dialog.evaluate(e=>e.matches(':modal')),true);
   assert.equal(await page.getByRole('button',{name:'Previous hint'}).isDisabled(),true);
   assert(!JSON.parse(await page.evaluate(()=>localStorage.getItem('vim-workshop.progress.v3'))).seenSolutions.includes('1'));
   // Native modal focus and iframe input interception both protect the editor.
   const blocked=await input().evaluate(e=>{
    const key=new KeyboardEvent('keydown',{key:'x',bubbles:true,cancelable:true});e.dispatchEvent(key);
    const paste=new Event('paste',{bubbles:true,cancelable:true});e.dispatchEvent(paste);
    return {key:key.defaultPrevented,paste:paste.defaultPrevented};
   });
   assert.deepEqual(blocked,{key:true,paste:true});
   await page.keyboard.type('cannotedit');
   assert.deepEqual(await state(),before);assert.equal(await page.locator('.notice').count(),0);
   await page.getByRole('button',{name:'Next hint'}).click();
   assert.equal(await dialog.locator('[aria-pressed=true]').innerText(),'2. A tool to look up');
   await page.getByRole('button',{name:'Previous hint'}).click();
   assert.equal(await dialog.locator('[aria-pressed=true]').innerText(),'1. A direction');
   await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false);
   await page.getByRole('button',{name:'Hint',exact:true}).click();
   await page.getByRole('button',{name:'Next hint'}).click();
   await page.getByRole('button',{name:'Reveal one solution'}).click();
   assert.equal(await dialog.locator('.hint code').isVisible(),true);
   assert(JSON.parse(await page.evaluate(()=>localStorage.getItem('vim-workshop.progress.v3'))).seenSolutions.includes('1'));
   await page.screenshot({path:`test-results/${channel}-hint-modal.png`});
   await page.getByRole('button',{name:'Close and edit'}).click();
   assert.equal(await dialog.isVisible(),false);assert.deepEqual(await state(),before);
   // Focus is restored through the same asynchronous iframe message channel as input unlocking.
   await page.waitForFunction(()=>document.activeElement?.tagName==='IFRAME'&&document.querySelector('iframe').contentDocument.activeElement?.id==='input');
   await page.keyboard.press('x');await page.waitForFunction(s=>window.testSnapshot.text!==s,before.text);
   assert.equal(Number((await state()).keys),Number(before.keys)+1);
   assert.equal((await state()).token,before.token);
   await page.getByRole('button',{name:'Hint',exact:true}).click();
   assert.equal(await dialog.locator('[aria-pressed=true]').innerText(),'3. One possible route');
   await page.getByRole('button',{name:'Previous hint'}).click();
   await page.getByRole('button',{name:'Close hints',exact:true}).click();assert.equal(await dialog.isVisible(),false);
   await page.getByRole('button',{name:'Hint',exact:true}).click();await page.mouse.click(10,10);assert.equal(await dialog.isVisible(),false);
   await page.getByLabel('Language',{exact:true}).selectOption('zh');
   await page.getByRole('button',{name:'提示',exact:true}).click();
   await page.getByRole('button',{name:'上一级提示'}).click();
   await page.getByRole('button',{name:'关闭提示',exact:true}).click();
   await page.setViewportSize({width:390,height:844});await page.locator('.mobile-preview').waitFor();
   await page.getByRole('button',{name:'提示',exact:true}).click();
   const mobile=page.getByRole('dialog');assert.equal(await mobile.evaluate(e=>e.scrollWidth<=e.clientWidth),true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.screenshot({path:`test-results/${channel}-hint-modal-mobile.png`});
   await page.keyboard.press('Escape');assert.deepEqual(errors,[]);
   results.push({channel,tildeDraws,passed:true});console.log(channel,'modal navigation, input blocking, assistance, EOF tildes and header passed');
  }finally{await browser.close();}
 }
}finally{server.close();await writeFile('test-results/hints-results.json',JSON.stringify(results,null,2));}
