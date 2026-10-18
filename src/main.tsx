import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {levels,chapters,getVariant,LEVEL_COUNT} from './levels';
import {judge} from './rules';
import {loadProgress,parseProgress,recordCompletion,storeProgress,unlocked} from './progress';
import {EditorAdapter} from './editor';
import type {AttemptResult,EditorSnapshot,PlayMode,Progress} from './types';
import {loadLanguage,saveLanguage,translate,localizeLevel,type Language} from './locale';
import {PixelWordmark} from './PixelWordmark';
import {Completion,PixelCheck} from './Completion';
import {actionLabels} from './practice';
import './style.css';

const initialLoad=loadProgress();
const catalogueColumnSize=Math.ceil(LEVEL_COUNT/3);
const catalogueColumns=Array.from({length:3},(_,i)=>levels.slice(i*catalogueColumnSize,(i+1)*catalogueColumnSize));
function route(progress:Progress){
 const match=location.hash.match(/^#\/level\/(\d+)(\/variant)?$/);const id=match?Number(match[1]):1;
 const base=levels.find(l=>l.id===id);
 if(!base||!unlocked(progress,id))return {id:1,variant:false};
 return {id,variant:!!match?.[2]&&!!base.variant&&!!progress.completed[String(id)]};
}
const startingRoute=route(initialLoad.progress);
const modeName=(m:string)=>m.startsWith('i')?'INSERT':m==='v'||m==='V'||m==='\x16'?'VISUAL':m.startsWith('c')?'COMMAND':'NORMAL';
function App(){
 const [progress,setProgress]=useState(initialLoad.progress);
 const [selection,setSelection]=useState(startingRoute);
 const [language,setLanguage]=useState<Language>(loadLanguage);
 const t=(text:string,values:Record<string,string|number>={})=>translate(language,text,values);
 const base=levels[selection.id-1];const level=localizeLevel(selection.variant?getVariant(base):base,language,selection.variant);
 const pageId=String(level.id)+(selection.variant?'v':'');
 const [playMode,setPlayMode]=useState<PlayMode>(initialLoad.progress.drafts[pageId]?'explore':'challenge');
 const [text,setText]=useState(initialLoad.progress.drafts[pageId]||level.initial);
 const [generation,setGeneration]=useState(0);
 const [status,setStatus]=useState('loading');
 const [snapshot,setSnapshot]=useState<EditorSnapshot>();
 const [keys,setKeys]=useState(0);const keyRef=useRef(0);
 const violationRef=useRef<string[]>([]);
 const [hint,setHint]=useState(0);
 const [activeHint,setActiveHint]=useState(0);
 const [hintOpen,setHintOpen]=useState(false);
 const [result,setResult]=useState<AttemptResult>();
 const [celebration,setCelebration]=useState(0);
 const celebrated=useRef(false);const celebrationSerial=useRef(0);
 const [checking,setChecking]=useState(false);
 const [notice,setNotice]=useState(initialLoad.warning);
 const [importOpen,setImportOpen]=useState(false);const [candidate,setCandidate]=useState<Progress>();
 const [help,setHelp]=useState(false);const [sourceOpen,setSourceOpen]=useState(false);const [rulesOpen,setRulesOpen]=useState(false);
 const [focused,setFocused]=useState(false);
 const [mobile,setMobile]=useState(()=>matchMedia('(max-width:600px)').matches);
 const frame=useRef<HTMLIFrameElement>(null);const adapter=useRef<EditorAdapter|undefined>(undefined);
 const levelMenu=useRef<HTMLDetailsElement>(null);
 const hintDialog=useRef<HTMLDialogElement>(null);
 const checkButton=useRef<HTMLButtonElement>(null);const inputFile=useRef<HTMLInputElement>(null);
 const lastSaved=useRef(text);const progressRef=useRef(progress);progressRef.current=progress;
 const generationRef=useRef(0);
 const completed=progress.completed[pageId];const assisted=progress.seenSolutions.includes(pageId);
 const canAdvance=!!progress.completed[String(level.id)];
 const total=levels.filter(l=>progress.completed[String(l.id)]).length;
 const finalClear=!selection.variant&&level.id===LEVEL_COUNT&&total===LEVEL_COUNT;

 useEffect(()=>{if(!storeProgress(progress))setNotice('Local saving is unavailable. Export progress before leaving this page.');},[progress]);
 useEffect(()=>{saveLanguage(language);document.documentElement.lang=language==='zh'?'zh-CN':'en';document.title='VIM WorkShop';},[language]);
 useEffect(()=>{const q=matchMedia('(max-width:600px)');const change=()=>setMobile(q.matches);q.addEventListener('change',change);return()=>q.removeEventListener('change',change);},[]);
 useEffect(()=>{
  const close=(event:Event)=>document.querySelectorAll<HTMLDetailsElement>('[data-popover][open]').forEach(menu=>{if(event instanceof KeyboardEvent ? event.key==='Escape' : !menu.contains(event.target as Node))menu.open=false;});
  document.addEventListener('pointerdown',close);document.addEventListener('keydown',close);
  return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',close);};
 },[]);
 function start(nextMode:PlayMode,nextText=level.initial){
  setHintOpen(false);
  celebrated.current=false;setCelebration(0);
  generationRef.current++;setPlayMode(nextMode);setText(nextText);setGeneration(g=>g+1);setStatus('loading');
  setSnapshot(undefined);keyRef.current=0;setKeys(0);violationRef.current=[];setResult(undefined);setChecking(false);setNotice('');
 }
 function choose(id:number,variant=false){
  const next=levels[id-1];if(!next||!unlocked(progressRef.current,id))return;
  if(levelMenu.current)levelMenu.current.open=false;
  location.hash=`/level/${id}${variant?'/variant':''}`;
 }
 useEffect(()=>{
  const change=()=>{
   const next=route(progressRef.current);const l=next.variant?getVariant(levels[next.id-1]):levels[next.id-1];
   const id=String(next.id)+(next.variant?'v':'');const draft=progressRef.current.drafts[id];
   setSelection(next);setHint(0);setActiveHint(0);setSourceOpen(false);start(draft?'explore':'challenge',draft||l.initial);
  };
  window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);
 },[]);
 useEffect(()=>{
  if(mobile){setStatus('reading');keyRef.current=0;setKeys(0);violationRef.current=[];setResult(undefined);return;}
  if(!frame.current)return;lastSaved.current=text;setFocused(false);
  const currentId=pageId;
  const editor=new EditorAdapter(frame.current,text,level.rules,playMode,level.file,event=>{
   if(event.type==='ready'){setStatus('ready');setFocused(true);}
   if(event.type==='snapshot'&&event.snapshot){
    const s=event.snapshot;setSnapshot(s);
    if(s.saved!==lastSaved.current){lastSaved.current=s.saved;setProgress(p=>({...p,drafts:{...p.drafts,[currentId]:s.saved}}));}
   }
   if(event.type==='key'){
    if(playMode==='challenge'){keyRef.current++;setKeys(keyRef.current);}
    setResult(undefined);setCelebration(0);setFocused(true);
   }
   if(event.type==='violation'){
    const next=[...new Set([...violationRef.current,event.reason!])];violationRef.current=next;setNotice(event.reason!);setResult(undefined);
   }
   if(event.type==='notice')setNotice(event.reason!);
   if(event.type==='error'){setStatus('error');setNotice(event.message||'Vim could not start.');}
   if(event.type==='exit'){setStatus('exited');setNotice('Vim has exited. Restart to open a fresh page.');}
   if(event.type==='leave'){checkButton.current?.focus();setFocused(false);}
  },level.setup);
  adapter.current=editor;
  return()=>{editor.destroy();adapter.current=undefined;};
 },[generation,mobile]);
 useEffect(()=>{
  const dialog=hintDialog.current;
  if(!dialog)return;
  adapter.current?.setBlocked(hintOpen);
  if(hintOpen){
   if(!dialog.open)dialog.showModal();
   const previousOverflow=document.body.style.overflow;
   document.body.style.overflow='hidden';
   return()=>{document.body.style.overflow=previousOverflow;};
  }
  if(dialog.open){dialog.close();adapter.current?.focus();}
 },[hintOpen,generation,mobile]);
 useEffect(()=>{
  if(!help&&!importOpen)return;
  const previous=document.activeElement as HTMLElement;const dialog=document.querySelector('[role="dialog"]')!;
  const focusables=()=>Array.from(dialog.querySelectorAll<HTMLElement>('button,a,[tabindex="0"]'));
  focusables()[0]?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setHelp(false);setImportOpen(false);}if(e.key==='Tab'){const fs=focusables();if(e.shiftKey&&document.activeElement===fs[0]){e.preventDefault();fs.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===fs.at(-1)){e.preventDefault();fs[0]?.focus();}}};
  document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous?.focus();};
 },[help,importOpen]);
 async function check(){
  if(!adapter.current||status!=='ready')return;
  const at=generationRef.current;setChecking(true);
  try{
   const s=await adapter.current.read();if(at!==generationRef.current)return;
   const r=judge(playMode==='explore'?{...level,rules:{}}:level,s,playMode==='challenge'?keyRef.current:0,playMode==='challenge'?violationRef.current:[],assisted);
   setResult(r);
   if(r.passed&&playMode==='challenge'){
    setProgress(p=>recordCompletion(p,pageId,{assisted,keys:keyRef.current,completedAt:new Date().toISOString()}));
    if(!celebrated.current){celebrated.current=true;setCelebration(++celebrationSerial.current);}
   }
  }catch(e){if(at===generationRef.current)setNotice(String(e));}
  finally{if(at===generationRef.current)setChecking(false);}
 }
 function selectHint(next:number){
  if(next<1||next>3)return;
  setHint(previous=>Math.max(previous,next));setActiveHint(next);
  if(next===3)setProgress(p=>({...p,seenSolutions:[...new Set([...p.seenSolutions,pageId])]}));
 }
 function openHints(){if(activeHint===0)selectHint(1);setHintOpen(true);}
 function exportProgress(){
  const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='vim-workshop-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 async function readImport(file?:File){if(!file)return;try{if(file.size>8_000_000)throw Error('Progress file is too large.');setCandidate(parseProgress(await file.text()));setImportOpen(true);}catch(e){setNotice(e instanceof Error?e.message:String(e));}if(inputFile.current)inputFile.current.value='';}
 function applyImport(){if(!candidate)return;setProgress(candidate);progressRef.current=candidate;setImportOpen(false);setCandidate(undefined);const next=route(candidate);setSelection(next);const l=next.variant?getVariant(levels[next.id-1]):levels[next.id-1];const id=String(next.id)+(next.variant?'v':'');setHint(0);setActiveHint(0);start(candidate.drafts[id]?'explore':'challenge',candidate.drafts[id]||l.initial);}
 const ruleLabels=[...(level.rules.maxKeys?[t('{count} keys or fewer',{count:level.rules.maxKeys})]:[]),...(level.rules.noArrows?[t('No arrow keys')]:[]),...(level.rules.noErase?[t('No Backspace / Delete')]:[]),...(level.rules.requiredActions?.map(action=>t(actionLabels[action]))||[])];
 return <div className="app" onPointerDown={e=>{if(!(e.target as Element).closest('.editor-shell'))setFocused(false);}}>
  <header className="topbar">
   <a className="brand" href="#/level/1" aria-label="VIM WorkShop"><PixelWordmark/><span className="sr-only">VIM WorkShop</span></a>
   <div className="top-actions">
    <details className="levels-menu" ref={levelMenu} data-popover>
     <summary>{t('Levels')} <span>{String(level.id).padStart(2,'0')} / {LEVEL_COUNT}</span></summary>
     <nav className="catalogue" aria-label={t('Levels')}>
       <div className="catalogue-columns">{catalogueColumns.map((column,index)=><div className="catalogue-column" key={index}>
       {chapters.map((chapter,c)=>column.some(l=>l.chapter===c+1)&&<section key={chapter}>
       <h2>{t(chapter)}</h2>
        {column.filter(l=>l.chapter===c+1).map(l=>{
        const passed=progress.completed[String(l.id)];const locked=!unlocked(progress,l.id);
        return <button key={l.id} disabled={locked} aria-current={selection.id===l.id?'page':undefined} onClick={()=>choose(l.id)} title={t(locked?'Complete the previous pages to unlock':passed?.assisted?'Completed with a solution':passed?'Completed independently':localizeLevel(l,language).title)}>
         <span className="level-number">{String(l.id).padStart(2,'0')}</span><span>{localizeLevel(l,language).title}</span><span className="level-state" aria-label={t(locked?'locked':passed?'complete':'open')}>{locked?'·':passed?'✓':''}</span>
        </button>;
       })}
      </section>)}
       </div>)}</div>
     </nav>
    </details>
    <button onClick={()=>setHelp(!help)} aria-expanded={help}>{t('Field notes')}</button>
    <details className="progress-menu" data-popover><summary>{t('Progress')}</summary><div><button onClick={exportProgress}>{t('Export progress')}</button><button onClick={()=>inputFile.current?.click()}>{t('Import progress')}</button></div></details>
    <label className="language-control" htmlFor="language"><select id="language" aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="en">English</option><option value="zh">简体中文</option></select></label>
    <input ref={inputFile} type="file" accept="application/json,.json" hidden onChange={e=>readImport(e.target.files?.[0])}/>
   </div>
  </header>
  <main>
   <div className="page-heading">
    <span className="page-number">{String(level.id).padStart(2,'0')}{selection.variant?'v':''}<span> / {LEVEL_COUNT}</span></span>
    <h1>{level.title}</h1>
    <div className="heading-actions">
     {completed&&<span className="completion-mark">✓ {t(completed.assisted?'With a solution':'Completed')}</span>}
     <button className="hint-button" aria-haspopup="dialog" aria-expanded={hintOpen} onClick={openHints}>{t('Hint')}</button>
    </div>
   </div>
   <section className="mission" aria-label={t('Task and rules')}>
    <div className="task"><h2>{t('Task')}</h2><p className="task-copy">{level.task}</p></div>
    <div className="constraints"><h2>{t('Rules')}</h2>
     <ul className="rules-list">
      {ruleLabels.length?ruleLabels.map(r=><li key={r}>{r}</li>):<li>{t('No key limit')}</li>}
      <li>{t('Save first')} <kbd>:w</kbd></li><li>{t('No external paste')}</li>
     </ul>
    </div>
   </section>
   {notice&&<div className="notice" role="status"><p>{t(notice)}</p><button aria-label={t('Dismiss notice')} onClick={()=>setNotice('')}>×</button></div>}
   <section className={'editing-column '+(celebration?'is-celebrating':'')} aria-label={t('Editing workspace')}>
    <div className={'editor-shell '+(focused?'is-focused':'')}>
     <iframe ref={frame} title={t('Real Vim editor')} data-testid="editor"/>
     {celebration>0&&<Completion key={celebration} level={level.id} final={finalClear} title={t(finalClear?'All levels cleared!':'Level cleared')} subtitle={finalClear?t('Congratulations!'):undefined} detail={`${String(level.id).padStart(2,'0')} / ${LEVEL_COUNT} · ${t('{count} keys',{count:keys})}`} count={total} total={LEVEL_COUNT}/>}
     {status!=='ready'&&<div className="editor-overlay">
      <p>{t(status==='loading'?'Loading Vim…':status==='exited'?'Vim is closed. Restart to open a fresh copy.':'Vim could not start in this browser.')}</p>
      {status!=='loading'&&<button onClick={()=>start(playMode)}>{t('Restart editor')}</button>}
     </div>}
    </div>
    <div className="mobile-preview"><pre>{snapshot?.text||text}</pre><p>{t('Reading view. Use a desktop keyboard to edit.')}</p></div>
    <div className="statusbar">
     <span className={'mode '+(snapshot?.mode.startsWith('i')?'insert':'')}>{t(status==='ready'?modeName(snapshot?.mode||'n'):status.toUpperCase())}</span>
     <span>{t(snapshot?.modified?'Unsaved':'Saved')}</span><span className="status-spacer"/><span>{level.file}</span>
    </div>
    <div className="attempt-bar">
     <div className="mode-switch" aria-label={t('Attempt mode')}>
      <button className={playMode==='challenge'?'selected':''} onClick={()=>{if(playMode!=='challenge')start('challenge');}}>{t('Challenge')}</button>
      <button className={playMode==='explore'?'selected':''} onClick={()=>{if(playMode!=='explore')start('explore');}}>{t('Explore')}</button>
     </div>
     <div className={'key-counter '+(level.rules.maxKeys&&keys>level.rules.maxKeys?'over':'')} data-testid="key-counter">
      {playMode==='explore'?t('Unscored'):<><strong>{keys}</strong><span>{level.rules.maxKeys?` / ${level.rules.maxKeys}`:''}{t(' keys')}</span></>}
     </div>
     <button className="reset-button" onClick={()=>start(playMode)}>{t('↺ Restart')}</button>
     <div className="main-actions">
      <button className={'check-button '+(canAdvance&&level.id<LEVEL_COUNT?'':'primary')} ref={checkButton} disabled={status!=='ready'||checking} onClick={check}>{t(checking?'Checking…':'Check this page')}</button>
      {canAdvance&&level.id<LEVEL_COUNT&&<button className="primary next-button" onClick={()=>choose(level.id+1)}>{t('Next page →')}</button>}
     </div>
    </div>
   </section>
   <div className="feedback" aria-live="polite">
    {result&&<div className={'result '+(result.passed?'success':'')}>
     {result.passed&&playMode==='challenge'&&<PixelCheck className="result-stamp"/>}
     <div><strong className="result-label">{t(result.passed?(playMode==='explore'?'Practice complete':'Page repaired'):'Check result')}</strong>
      {!result.passed&&<>
       <p>{t(result.message,{used:result.keys,limit:result.keyLimit??0})}{result.missingActions.length>0&&' '+result.missingActions.map(action=>t(actionLabels[action])).join(' · ')}</p>
       {result.budgetExceeded&&(!result.contentOk||!result.savedOk||result.missingActions.length>0||result.violations.length>0)&&<p>{t('Key budget exceeded: {used} / {limit}.',{used:result.keys,limit:result.keyLimit??0})}</p>}
       {result.violations.map(violation=><p key={violation}>{t(violation)}</p>)}
      </>}
      {result.passed&&playMode==='challenge'&&level.id===LEVEL_COUNT&&<p>{t('All {count} levels complete.',{count:LEVEL_COUNT})}</p>}
     </div>
     {!result.passed&&<div className="result-checks"><span>{result.contentOk?'✓':'○'} {t('Text')}</span><span>{result.savedOk?'✓':'○'} {t('Saved')}</span><span>{playMode==='explore'?'—':result.rulesOk?'✓':'○'} {t('Rules')}</span></div>}
     {result.passed&&playMode==='challenge'&&base.variant&&!selection.variant&&<button onClick={()=>choose(level.id,true)}>{t('Try a fresh variation →')}</button>}
    </div>}
   </div>
   {playMode==='explore'&&<p className="explore-note">{t('Explore is unscored. Switch to Challenge to start a clean attempt.')}</p>}
   <div className="support-row">
    <div className="support-toggles">
     <button onClick={()=>setRulesOpen(!rulesOpen)} aria-expanded={rulesOpen} aria-controls="counting-rules">{t('Counting rules')}</button>
     <button onClick={()=>setSourceOpen(!sourceOpen)} aria-expanded={sourceOpen} aria-controls="text-source">{t('Behind the text')}</button>
    </div>
    {progress.drafts[pageId]&&text!==progress.drafts[pageId]&&<button className="text-button" onClick={()=>start('explore',progress.drafts[pageId])}>{t('Restore saved draft')}</button>}
   </div>
   {rulesOpen&&<div className="rule-body" id="counting-rules">
     <p>{t('Each key sent to Vim counts once, including text and save commands. Modifier keys alone are free. Held keys repeat. Macros count only the keys you press.')}</p>
     <p>{t('A blocked key or external paste marks the attempt. Restart clears it. Reading help is free. F6 moves focus from Vim to the Check button.')}</p>
   </div>}
   {sourceOpen&&<section className="source-body" id="text-source">
    <h2>{t(level.source.title)} <span>— {t(level.source.author)}, {level.source.year}</span></h2>
    <p>{t(level.source.note)}</p><dl><dt>{t('Edition')}</dt><dd>{t(level.source.edition)}</dd><dt>{t('Language')}</dt><dd>{t(level.source.translator)}</dd><dt>{t('Use')}</dt><dd>{t(level.source.basis)}</dd></dl>
    {level.source.url&&<a href={level.source.url} target="_blank" rel="noreferrer">{t('Read the source ↗')}</a>}
    {level.source.rights==='licensed'&&<p><a href={`${import.meta.env.BASE_URL}sources/kafka-5200.txt`} target="_blank" rel="noreferrer">{t('Source text and full licence ↗')}</a></p>}
   </section>}
  </main>
  <dialog ref={hintDialog} className="hint-dialog" aria-labelledby="hint-title" onCancel={e=>{e.preventDefault();setHintOpen(false);}} onClose={()=>setHintOpen(false)} onClick={e=>{if(e.target===e.currentTarget){const rect=e.currentTarget.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)setHintOpen(false);}}}>
   <div className="hint-header"><h2 id="hint-title">{t('Hints')} <span>{activeHint || 1} / 3</span></h2><button className="hint-close" aria-label={t('Close hints')} onClick={()=>setHintOpen(false)}>×</button></div>
   <div className="hint-tabs" role="group" aria-label={t('Hints')}>
    {['A direction','A tool to look up','One possible route'].map((label,i)=><button key={label} disabled={i+1>hint} aria-pressed={activeHint===i+1} onClick={()=>selectHint(i+1)}>{i+1}. {t(label)}</button>)}
   </div>
   <div className="hint">{activeHint===3?<><code>{level.solutions[0]}</code><p className="assisted-note">{t('Completion will be marked “with a solution”.')}</p></>:<p>{level.hints[Math.max(0,activeHint-1)]}</p>}</div>
   <div className="hint-navigation"><button disabled={activeHint<=1} onClick={()=>selectHint(activeHint-1)}>{t('Previous hint')}</button><button disabled={activeHint>=3} onClick={()=>selectHint(activeHint+1)}>{t(activeHint===2?'Reveal one solution':'Next hint')}</button></div>
   <button className="primary hint-done" onClick={()=>setHintOpen(false)}>{t('Close and edit')}</button>
  </dialog>
  {help&&<div className="drawer-backdrop" onClick={()=>setHelp(false)}><section className="help-drawer" role="dialog" aria-modal="true" aria-label={t('Field notes')} onClick={e=>e.stopPropagation()}>
   <button className="close" onClick={()=>setHelp(false)}>{t('Close ×')}</button><h2>{t('Field notes')}</h2>
   <p>{t('Vim has modes. In Normal mode, keys act on text. In Insert mode, keys become text.')}</p>
   <div className="reference-grid">{[['Esc','Return to Normal'],['i / a','Insert before / after the cursor'],['h j k l','Move left, down, up, right'],['w / b','Next / previous word'],['0 / $','Start / end of line'],['gg / G','First / last line'],['/text ↵','Find text; n finds the next match'],['x / dd','Delete a character / cut a line'],['ciw / ci"','Change a word / inside quotes'],['yy / p','Copy a line / put it after'],['u / Ctrl+r','Undo / redo'],['.','Repeat the last change'],[':w ↵','Save the page'],[':help topic ↵','Open Vim’s own manual'],['Ctrl+w w','Switch between editor windows'],[':q ↵','Close the current Vim window'],['F6','Leave the editor for page controls']].map(([key,meaning])=><React.Fragment key={key}><kbd>{key}</kbd><span>{t(meaning)}</span></React.Fragment>)}</div>
   <p className="muted">{t('These notes are free to read during a challenge. Commands typed inside Vim still count.')}</p><a href="https://vimhelp.org/" target="_blank" rel="noreferrer">{t('Open the Vim reference ↗')}</a>
  </section></div>}
  {importOpen&&candidate&&<div className="drawer-backdrop"><section role="dialog" aria-modal="true" aria-label={t('Import progress')} className="import-dialog">
   <h2>{t('Replace local progress?')}</h2><p>{t('This file contains {count} completed pages and variations. Your current local progress will be replaced.',{count:Object.keys(candidate.completed).length})}</p>
   <div><button onClick={()=>setImportOpen(false)}>{t('Cancel')}</button><button className="primary" onClick={applyImport}>{t('Import progress')}</button></div>
  </section></div>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
