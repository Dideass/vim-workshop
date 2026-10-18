import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {serve} from './static-server.mjs';
import {levelData} from './level-data.mjs';

const {levels}=await levelData();const level=levels[8];
const server=await serve('dist',4176);
await mkdir('test-results',{recursive:true});
try{for(const channel of ['chrome','msedge']){
 const browser=await chromium.launch({channel,headless:true});
 try{for(const deviceScaleFactor of [1,2]){
  const page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor});
  await page.addInitScript(()=>{
   const original=CanvasRenderingContext2D.prototype.fillText;
   CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){
    (window.paintedGlyphs??=[]).push({text,x,y,color:this.fillStyle});
    return original.call(this,text,x,y,...args);
   };
   if(window===parent){
    if(!localStorage.getItem('vim-workshop.progress.v3'))localStorage.setItem('vim-workshop.progress.v3',JSON.stringify({version:3,completed:Object.fromEntries(Array.from({length:8},(_,i)=>[String(i+1),{assisted:false,keys:1,completedAt:new Date().toISOString()}])),drafts:{},seenSolutions:[]}));
    window.addEventListener('message',event=>{if(event.data?.channel==='between-lines'&&event.data.type==='snapshot'){window.testSnapshot=event.data.snapshot;window.testSnapshotToken=event.data.token;}});
   }
  });
  await page.goto('http://127.0.0.1:4176/between-lines/#/level/9');
  const ready=()=>page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL');
  await ready();
  const input=()=>page.frameLocator('iframe').locator('#input');
  const send=async sequence=>{for(const key of sequence.match(/<(?:Esc|CR|C-r)>|[\s\S]/g))await input().press(key==='<Esc>'?'Escape':key==='<CR>'?'Enter':key==='<C-r>'?'Control+r':key);};
  const visibleN=async()=>{
   const frame=page.frames().find(frame=>frame.url().includes('editor.html'));
   await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   return frame.evaluate(()=>{
    const dpr=devicePixelRatio;const glyph=window.paintedGlyphs.findLast(g=>g.text==='n'&&g.y<30*dpr);
    if(!glyph)return false;
    const ctx=document.querySelector('canvas').getContext('2d');
    const data=ctx.getImageData(glyph.x,0,12*dpr,22*dpr).data;
    let ink=0;for(let i=0;i<data.length;i+=4)if(data[i]>160&&data[i+1]>160&&data[i+2]>160)ink++;
    return ink>5;
   });
  };
  for(const [sequence,expected,passed] of [
   ['Anothing.<Esc>:w<CR>',level.expected,true],
   ['$i nothing.<Esc>:w<CR>',level.expected.replace('.\n','. \n'),false]
  ]){
   const token=await page.evaluate(()=>window.testSnapshotToken);await page.locator('.reset-button').click();
   await page.waitForFunction(old=>window.testSnapshotToken!==old,token);await ready();
   await send(sequence);await page.waitForFunction(text=>window.testSnapshot?.text===text&&!window.testSnapshot.modified,expected);
   assert(await visibleN(),'The first letter after a space must remain painted, not merely present in the buffer.');
   const frame=page.frames().find(frame=>frame.url().includes('editor.html'));
   assert(await frame.evaluate(()=>window.paintedGlyphs.some(g=>g.text==='·'&&g.color==='#747474')),'Spaces render as gray middle dots.');
   await page.locator('.check-button').click();await page.locator('.result').waitFor();
   assert.equal(await page.locator('.result').evaluate(element=>element.classList.contains('success')),passed);
   if(passed){
    await send('u<C-r>');await page.waitForFunction(text=>window.testSnapshot?.text===text,expected);
    assert(await visibleN(),'Undo and redo preserve the visible letter.');
    await page.screenshot({path:`test-results/spaces-${channel}-${deviceScaleFactor}x.png`});
   }
  }
  console.log(channel,deviceScaleFactor+'x','gray dots, adjacent-letter pixels, undo/redo and grading passed.');
  await page.close();
 }}finally{await browser.close();}
}}finally{server.close();}
