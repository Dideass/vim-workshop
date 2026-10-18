import {sendVimKeys} from './keyboard.mjs';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {serve} from './static-server.mjs';
import {levelData} from './level-data.mjs';
const {levels,getVariant}=await levelData();
await mkdir('test-results',{recursive:true});
const server=await serve('dist',4175);const results=[];
try{
for(const channel of process.env.BROWSERS?.split(',')||['chrome','msedge']){
 const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel,headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>window.addEventListener('message',e=>{if(e.data?.channel==='between-lines'&&e.data.type==='snapshot'){window.testSnapshot=e.data.snapshot;window.testSnapshotToken=e.data.token;}}));
  const ready=()=>page.waitForFunction(()=>document.querySelector('.mode')?.textContent==='NORMAL',{},{timeout:25000});
  const input=()=>page.frameLocator('iframe[title="Real Vim editor"]').locator('#input');
  const send=sequence=>sendVimKeys(input(),sequence);
  const text=()=>page.evaluate(()=>window.testSnapshot?.text);
  const waitSaved=expected=>page.waitForFunction(s=>window.testSnapshot?.text===s&&window.testSnapshot.saved===s&&!window.testSnapshot.modified,expected,{timeout:5000});
  const waitText=expected=>page.waitForFunction(s=>window.testSnapshot?.text===s,expected,{timeout:5000}).catch(async e=>{await page.screenshot({path:'test-results/failure.png',fullPage:true});console.error('TEXT MISMATCH',{expected,actual:await text(),heading:await page.locator('h1').innerText(),keys:await page.locator('.key-counter').innerText()});throw e;});
  const transition=async action=>{const token=await page.evaluate(()=>window.testSnapshotToken);await action();await page.waitForFunction(t=>window.testSnapshotToken&&window.testSnapshotToken!==t,token);await ready();};
  const restart=async()=>{const token=await page.evaluate(()=>window.testSnapshotToken);await page.getByRole('button',{name:'↺ Restart',exact:true}).click();await page.waitForFunction(t=>window.testSnapshotToken&&window.testSnapshotToken!==t,token);await ready();};
  const check=async passed=>{await page.getByRole('button',{name:'Check this page'}).click();await page.locator('.result').waitFor();const actual=await page.locator('.result').evaluate(e=>e.classList.contains('success'));if(actual!==passed)console.error('JUDGMENT MISMATCH',{heading:await page.locator('h1').innerText(),result:await page.locator('.result').innerText(),snapshot:await page.evaluate(()=>window.testSnapshot),keys:await page.locator('.key-counter').innerText()});assert.equal(actual,passed);};
  await page.goto('http://127.0.0.1:4175/between-lines/');
  await ready().catch(async e=>{console.error(await page.locator('body').innerText());console.error('snapshot',await text());throw e;});
  assert.equal(await page.evaluate(()=>crossOriginIsolated),true);
  assert.equal(await text(),levels[0].initial);
  assert.equal(await page.locator('.catalogue button:disabled').count(),32);
  await page.screenshot({path:`test-results/${channel}-desktop.png`,fullPage:true});
  // Unsaved success must not complete; undo/redo and a check cannot mutate text.
  await send('iMother <Esc>');await waitText(levels[0].expected);await check(false);
  assert.match(await page.locator('.result').innerText(),/Save it with :w/);
  await send('u');await waitText(levels[0].initial);await send('<C-r>');await waitText(levels[0].expected);
  await send(':w<CR>');await check(true);
  assert.equal(await page.locator('.catalogue button:disabled').count(),31);
  await restart();await send(levels[0].solutions[1]);await check(true);
  results.push({channel,case:'entry / save / undo / redo / alternative',passed:true});
  // Test all real keys, both reference solutions, and every transfer page.
  for(const base of levels){
   if(base.id===1)continue;
   await transition(()=>page.getByRole('button',{name:`Next page →`,exact:true}).click());
   for(const [i,seq] of base.solutions.entries()){
    if(i)await restart();await send(seq);await waitText(base.expected);await waitSaved(base.expected);await check(true);
    const count=(seq.match(/<(?:Esc|CR|C-[a-z])>|[\s\S]/g)||[]).length;
    assert.equal(await page.locator('.key-counter strong').innerText(),String(count));
    results.push({channel,level:base.id,solution:i+1,passed:true,keys:count});
   }
   if(base.variant){
    await transition(()=>page.getByRole('button',{name:'Try a fresh variation →'}).click());const v=getVariant(base);
    for(const [i,seq] of v.solutions.entries()){if(i)await restart();await send(seq);await waitText(v.expected);await waitSaved(v.expected);await check(true);results.push({channel,level:base.id+'v',solution:i+1,passed:true});}
   }
  }
  await page.locator('.levels-menu > summary').click();
  assert.equal(await page.locator('.catalogue button').count(),33);
  assert.equal(await page.locator('.catalogue button:disabled').count(),0);
  assert.equal(await page.locator('.catalogue .progress-label').count(),0);
  await page.locator('.levels-menu > summary').click();
  // Budget fail still reports repaired text, and forbidden keys cannot modify it.
  await page.goto('http://127.0.0.1:4175/between-lines/#/level/6');await ready();
  await transition(()=>page.getByRole('button',{name:'Challenge',exact:true}).click());
  const before=await text();await input().press('ArrowRight');await page.locator('.notice').waitFor();assert.equal(await text(),before);
  await send(levels[5].solutions[0]);await check(false);assert.match(await page.locator('.result').innerText(),/Text repaired/);
  await restart();for(let i=0;i<levels[5].rules.maxKeys+1;i++)await send('h');await send(levels[5].solutions[0]);await check(false);
  results.push({channel,case:'forbidden keys / budget overflow / separate content result',passed:true});
  // Fresh instance drops register and undo history; hint use survives restart.
  await restart();await send('"ayyqaIbad<Esc>q');await restart();await send('u"ap@a');await waitText(levels[5].initial);
  await page.getByRole('button',{name:'Hint',exact:true}).click();await page.getByRole('button',{name:'Next hint'}).click();await page.getByRole('button',{name:'Reveal one solution'}).click();await page.getByRole('button',{name:'Close and edit'}).click();
  await restart();await send(levels[5].solutions[0]);await check(true);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('vim-workshop.progress.v3')).seenSolutions.includes('6')),true);
  // Help, keyboard exit, source and exploration.
  await input().press('F6');await page.waitForFunction(()=>document.activeElement?.classList.contains('check-button'));
  await page.getByRole('button',{name:'Field notes'}).click();await page.getByRole('dialog',{name:'Field notes'}).waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
  await transition(()=>page.getByRole('button',{name:'Explore',exact:true}).click());await input().press('ArrowRight');await send(':q!<CR>');await page.getByRole('button',{name:'Restart editor'}).waitFor();await transition(()=>page.getByRole('button',{name:'Restart editor'}).click());
  results.push({channel,case:'fresh registers / hints / focus / help / exploration / quit recovery',passed:true});
  // Refresh restores saved drafts in unscored exploration.
  await transition(()=>page.getByRole('button',{name:'Challenge',exact:true}).click());await send('iDRAFT <Esc>:w<CR>');await waitText('DRAFT '+levels[5].initial);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('vim-workshop.progress.v3')).drafts['6'].startsWith('DRAFT '));
  await page.reload();await ready();assert.equal(await page.locator('.mode-switch .selected').innerText(),'Explore');await waitText('DRAFT '+levels[5].initial);
  // Export and deliberate import replacement through actual UI.
  await page.locator('.progress-menu summary').click();const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Export progress'}).click();const download=await downloadEvent;await download.saveAs(`test-results/${channel}-progress.json`);
  await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')});await page.waitForFunction(()=>document.querySelector('.notice')?.textContent.includes('supported'));
  await page.locator('input[type=file]').setInputFiles(`test-results/${channel}-progress.json`);await transition(()=>page.getByRole('dialog',{name:'Import progress'}).getByRole('button',{name:'Import progress',exact:true}).click());
  results.push({channel,case:'draft restore / export / invalid import / valid import',passed:true});
  // Narrow layout must stay inside the viewport; no claims about touch editing.
  await page.getByRole('button',{name:'Behind the text'}).click();await page.locator('.source-body').waitFor();
  await page.setViewportSize({width:390,height:844});await page.locator('.mobile-preview').waitFor();await page.screenshot({path:`test-results/${channel}-mobile.png`,fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
  console.log(channel,'all browser checks passed');await context.close();
 }catch(e){results.push({channel,error:String(e),passed:false});throw e;}finally{await browser.close();}
}
}finally{server.close();await writeFile('test-results/browser-results.json',JSON.stringify(results,null,2));}
