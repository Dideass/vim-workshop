import {describe,it,expect,vi} from 'vitest';
import {judge,blockedKey,budgetFor,parseKeys} from './rules';
import {parseProgress,emptyProgress,recordCompletion,unlocked,loadProgress,STORAGE_KEY} from './progress';
const level={expected:'A short line.\n',rules:{maxKeys:10}};
const state={text:'A short line.\n',saved:'A short line.\n',modified:false,mode:'n',line:1,column:1};
describe('challenge outcomes',()=>{
 it('accepts exact budget and rejects one key over without losing content success',()=>{expect(judge(level,state,10,[],false).passed).toBe(true);expect(judge(level,state,11,[],false)).toMatchObject({contentOk:true,rulesOk:false,passed:false});});
 it('requires saving the current text',()=>{expect(judge(level,{...state,modified:true},2,[],false)).toMatchObject({contentOk:true,savedOk:false,passed:false});});
 it('rejects changes to untouched text and missing edits',()=>{expect(judge(level,{...state,text:'A short line!'},2,[],false).contentOk).toBe(false);expect(judge(level,{...state,text:'A line.'},2,[],false).contentOk).toBe(false);});
 it('keeps pasted/forbidden attempts distinct from content success',()=>{expect(judge(level,state,2,['No paste'],false)).toMatchObject({contentOk:true,rulesOk:false});});
 it('only normalizes transport newlines, not significant whitespace',()=>{expect(judge(level,{...state,text:'A short line.\r\n'},2,[],false).passed).toBe(true);expect(judge(level,{...state,text:'A short line. '},2,[],false).passed).toBe(false);});
 it('blocks named keys but preserves internal Vim deletion',()=>{expect(blockedKey('Backspace',{noErase:true})).toBeTruthy();expect(blockedKey('x',{noErase:true})).toBeUndefined();expect(blockedKey('ArrowRight',{noArrows:true})).toBeTruthy();});
 it('counts combinations and special keys once',()=>{expect(parseKeys('ci"moon<Esc>:w<CR>')).toHaveLength(11);expect(budgetFor(['x:w<CR>','xx:w<CR>'])).toBe(5);});
 it('uses the shortest reference times 1.1, rounded up to an integer',()=>{
  expect(budgetFor(['x'.repeat(20),'x'.repeat(80)])).toBe(22);
  expect(budgetFor(['x'.repeat(15)])).toBe(17);
  expect(budgetFor(['x'.repeat(25)])).toBe(28);
  expect(budgetFor(['x'.repeat(21)])).toBe(24);
  expect(budgetFor(['x'.repeat(5)])).toBe(6);
  expect(budgetFor(['x'.repeat(35)])).toBe(39);
  expect(budgetFor(['x'.repeat(30)])).toBe(33);
  expect(()=>budgetFor([])).toThrow();
 });
 it('requires actual Vim practice evidence even when the text is correct',()=>{
  const exercise={...level,rules:{maxKeys:10,requiredActions:['undo','redo']}};
  expect(judge(exercise,state,5,[],false)).toMatchObject({contentOk:true,rulesOk:false,missingActions:['undo','redo']});
  expect(judge(exercise,{...state,actions:['undo']},5,[],false).missingActions).toEqual(['redo']);
  expect(judge(exercise,{...state,actions:['undo','redo']},5,[],false).passed).toBe(true);
 });
 it('reports budget, blocked input and missing practice as separate causes',()=>{
  const exercise={...level,rules:{maxKeys:10,requiredActions:['match-pair']}};
  const matched={...state,actions:['match-pair']};
  const over=judge(exercise,matched,11,[],false);
  expect(over).toMatchObject({budgetExceeded:true,keyLimit:10,missingActions:[],rulesOk:false});expect(over.message).toContain('Key budget exceeded');
  const blocked=judge(exercise,matched,5,['External paste'],false);
  expect(blocked).toMatchObject({budgetExceeded:false,missingActions:[],violations:['External paste']});expect(blocked.message).toContain('Blocked input');
  expect(judge(exercise,state,11,['External paste'],false)).toMatchObject({budgetExceeded:true,missingActions:['match-pair'],violations:['External paste']});
 });
});
describe('portable progress',()=>{
 it('round trips and unlocks sequentially',()=>{let p=emptyProgress();expect(unlocked(p,2)).toBe(false);p=recordCompletion(p,'1',{assisted:false,keys:12,completedAt:new Date().toISOString()});expect(unlocked(parseProgress(JSON.stringify(p)),2)).toBe(true);expect(unlocked(p,3)).toBe(false);});
 it('never downgrades independent completion',()=>{let p=recordCompletion(emptyProgress(),'1',{assisted:false,keys:20,completedAt:new Date().toISOString()});p=recordCompletion(p,'1',{assisted:true,keys:10,completedAt:new Date().toISOString()});expect(p.completed['1'].assisted).toBe(false);});
 it('rejects malformed, legacy and oversized imports',()=>{for(const x of ['{}','null',JSON.stringify({...emptyProgress(),completed:{'99':{}}}),JSON.stringify({...emptyProgress(),version:1}),'x'.repeat(8_000_001)])expect(()=>parseProgress(x)).toThrow();});
 it('preserves large drafts and allows the final level of the new course',()=>{const p={...emptyProgress(),drafts:{'33':'A genuine long draft.\n'.repeat(5000)}};expect(parseProgress(JSON.stringify(p)).drafts['33']).toBe(p.drafts['33']);});
 it('clears older course data once while retaining the language and current-course records',()=>{
  const data=new Map([['vim-workshop.progress.v2','old'],['between-lines.progress.v1','old'],['vim-workshop.language','zh']]);
  vi.stubGlobal('localStorage',{getItem:(key:string)=>data.get(key)??null,removeItem:(key:string)=>data.delete(key)});
  try{
   expect(loadProgress()).toEqual({progress:emptyProgress(),warning:''});expect(data.size).toBe(1);expect(data.get('vim-workshop.language')).toBe('zh');
   const current=recordCompletion(emptyProgress(),'1',{assisted:false,keys:10,completedAt:'2026-10-18T00:00:00.000Z'});data.set(STORAGE_KEY,JSON.stringify(current));
   expect(loadProgress().progress).toEqual(current);
  }finally{vi.unstubAllGlobals();}
 });
 it('rejects all prior course records instead of carrying completions into changed exercises',()=>{
  for(const version of [1,2])expect(()=>parseProgress(JSON.stringify({...emptyProgress(),version,completed:{'1':{assisted:false,keys:1,completedAt:'2026-10-18T00:00:00.000Z'}}}))).toThrow(/older course/);
  const fresh=emptyProgress();expect(fresh).toEqual({version:3,completed:{},drafts:{},seenSolutions:[]});expect(unlocked(fresh,2)).toBe(false);
 });
});
