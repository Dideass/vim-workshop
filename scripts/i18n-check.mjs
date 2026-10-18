import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {serve} from './static-server.mjs';
const server=await serve('dist',4178);const results=[];
await mkdir('test-results',{recursive:true});
try{
 for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
  const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
  try{
   const page=await browser.newPage({viewport:{width:1366,height:768}});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.addInitScript(()=>window.addEventListener('message',e=>{if(e.data?.channel==='between-lines'&&e.data.type==='snapshot'){window.testSnapshot=e.data.snapshot;window.testToken=e.data.token;}}));
   await page.goto('http://127.0.0.1:4178/between-lines/');
   await page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL').catch(async error=>{
    await page.screenshot({path:`test-results/${channel}-i18n-startup-failure.png`,fullPage:true});
    console.error('STARTUP',await page.evaluate(()=>({isolated:crossOriginIsolated,controller:navigator.serviceWorker.controller?.scriptURL,body:document.body.innerText})),errors);
    throw error;
   });
   const input=()=>page.frameLocator('iframe').locator('#input');
   assert.equal(await page.title(),'VIM WorkShop');
   assert.equal(await page.getByRole('link',{name:'VIM WorkShop'}).isVisible(),true);
   assert(await page.locator('.pixel-wordmark rect').count()>80);
   const font=await page.evaluate(()=>getComputedStyle(document.documentElement).fontFamily);assert(font.startsWith('Consolas'));
   if(process.platform==='win32')assert.match(await input().evaluate(e=>getComputedStyle(e).fontFamily),/Consolas/);
   const border=await page.locator('.editor-shell').evaluate(e=>({width:getComputedStyle(e).borderTopWidth,color:getComputedStyle(e).borderTopColor}));assert.equal(border.width,'2px');assert.match(border.color,/177|146/);
   const editor=await page.locator('.editor-shell').boundingBox();const hint=await page.locator('.hint-button').boundingBox();assert(hint.y<editor.y);
   await page.screenshot({path:`test-results/${channel}-workshop-en.png`});
   const initial=await page.evaluate(()=>window.testSnapshot.text);
   for(const key of ['i',...'Mother ','Escape'])await input().press(key);
   await page.waitForFunction(s=>window.testSnapshot.text==='Mother '+s,initial);
   const before=await page.evaluate(()=>({token:window.testToken,text:window.testSnapshot.text,keys:document.querySelector('.key-counter strong').textContent}));
   await page.getByLabel('Language',{exact:true}).selectOption('zh');
   await page.waitForFunction(()=>document.documentElement.lang==='zh-CN');
   assert.equal(await page.locator('h1').innerText(),'缺失的词');assert.match(await page.locator('.task-copy').innerText(),/Mother/);
   assert.equal(await page.getByRole('button',{name:'提示',exact:true}).isVisible(),true);
   const after=await page.evaluate(()=>({token:window.testToken,text:window.testSnapshot.text,keys:document.querySelector('.key-counter strong').textContent}));assert.deepEqual(after,before);
   assert(!/[\u4e00-\u9fff]/.test(after.text));
   await page.screenshot({path:`test-results/${channel}-workshop-zh.png`});
   await page.getByRole('button',{name:'提示',exact:true}).click();assert.match(await page.locator('.hint > p').first().innerText(),/光标/);
   await page.getByRole('button',{name:'下一级提示'}).click();assert.match(await page.locator('.hint > p').first().innerText(),/按 i|插入模式/);
   await page.getByRole('button',{name:'查看一种解法'}).click();assert.match(await page.locator('.hint code').innerText(),/Mother/);
   assert.equal(await page.locator('.hint > p:not(.assisted-note)').count(),0);
   await page.screenshot({path:`test-results/${channel}-workshop-hint-zh.png`});
   await page.getByRole('button',{name:'关闭并继续编辑'}).click();
   await page.getByRole('button',{name:'检查结果',exact:true}).click();await page.locator('.result').waitFor();assert.match(await page.locator('.result').innerText(),/先用 :w 保存/);
   for(const key of [':','w','Enter'])await input().press(key);
   await page.getByRole('button',{name:'检查结果',exact:true}).click();await page.locator('.result.success').waitFor();assert.match(await page.locator('.result').innerText(),/本关通过/);
   await page.getByRole('button',{name:'操作手册'}).click();assert.match(await page.getByRole('dialog').innerText(),/普通模式/);await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'下一关 →'}).click();await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='多余的痕迹');
   await page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='普通模式');
   await input().press('Backspace');await page.locator('.notice').waitFor();assert.match(await page.locator('.notice').innerText(),/本关禁用 Backspace/);
   await page.reload();await page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='普通模式');
   assert.equal(await page.getByLabel('Language',{exact:true}).inputValue(),'zh');
   assert(!/[\u4e00-\u9fff]/.test(await page.evaluate(()=>window.testSnapshot.text)));
   await page.getByRole('button',{name:'文本出处'}).click();assert.match(await page.locator('.source-body').innerText(),/练习/);
   await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('not json')});await page.locator('.notice').waitFor();assert.match(await page.locator('.notice').innerText(),/不是有效的 VIM WorkShop/);
   await page.getByLabel('Language',{exact:true}).selectOption('en');await page.waitForFunction(()=>document.documentElement.lang==='en');assert.equal(await page.locator('h1').innerText(),'Unwanted traces');
   await page.setViewportSize({width:390,height:844});await page.locator('.mobile-preview').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.getByLabel('Language',{exact:true}).selectOption('zh');await page.screenshot({path:`test-results/${channel}-workshop-mobile-zh.png`,fullPage:true});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
   results.push({channel,border,font,passed:true});console.log(channel,'brand, Consolas, border and bilingual flow passed');
  }finally{await browser.close();}
 }
}finally{server.close();await writeFile('test-results/i18n-results.json',JSON.stringify(results,null,2));}
