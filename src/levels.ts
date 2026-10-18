import type {LevelDefinition} from './types';
import {budgetFor,parseKeys} from './rules';
import {courseData} from './course-data';
interface Damage {kind:string;find?:string;value?:string;all?:boolean;start?:number;end?:number;groups?:number;every?:number;word?:string}
interface CourseInput extends Omit<LevelDefinition,'initial'|'expected'> {text:string;expectedText?:string;damage:Damage[];budget:boolean}
const lines=(text:string)=>text.replace(/\n$/,'').split('\n');
export function damageText(text:string,damage:Damage[]):string {
 let result=text;
 for(const d of damage){
  if(d.kind==='replace'){result=d.all?result.replaceAll(d.find!,d.value!):result.replace(d.find!,d.value!);continue;}
  if(d.kind==='word-replace'){result=result.replace(new RegExp(`\\b${d.find}\\b`,'g'),d.value!);continue;}
  if(d.kind==='same')continue;
  if(d.kind==='duplicate-words'){let word=0;result=result.replace(/\b[A-Za-z]+\b/g,w=>++word%17===0?`${w} ${w}`:w);continue;}
  if(d.kind==='last-names'){const total=result.split(d.word!).length-1;let seen=0;result=result.replaceAll(d.word!,()=>++seen===total-1?'@@@':seen===total?'###':d.word!);continue;}
  let rows=lines(result);
  if(d.kind==='prefix')rows=rows.map((r,i)=>i+1>=(d.start||1)&&i+1<=(d.end||Infinity)?d.value!+r:r);
  else if(d.kind==='duplicate-first')rows.unshift(rows[0]);
  else if(d.kind==='remove-line')rows.splice(d.start!-1,1);
  else if(d.kind==='rotate-first')rows.push(rows.shift()!);
  else if(d.kind==='break-words'){const words=result.trim().split(/\s+/),size=Math.ceil(words.length/d.groups!);rows=Array.from({length:d.groups!},(_,i)=>words.slice(i*size,(i+1)*size).join(' '));}
  else if(d.kind==='trailing')rows=rows.map((r,i)=>i%(d.every||1)===0?r+'   ':r);
  else if(d.kind==='frame-lines')rows=rows.map(r=>'> '+r+' <');
  else if(d.kind==='marked-lines')rows=rows.map((r,i)=>i%3===0?'@'+r+'#':r);
  else if(d.kind==='number-prefix'||d.kind==='number-reverse'){rows=rows.map((r,i)=>`${String(i+1).padStart(4,'0')}| ${r}`);if(d.kind==='number-reverse')rows.reverse();}
  else if(d.kind==='noise-lines')rows=rows.flatMap((r,i)=>i%9===0?[r,'@@ '+String(i+1).padStart(4,'0')]:[r]);
  else throw Error(`Unknown damage: ${d.kind}`);
  result=rows.join('\n')+'\n';
 }
 return result;
}
export const levels:LevelDefinition[]=(courseData as unknown as CourseInput[]).map(input=>{
 const {text,damage,budget,expectedText,...data}=input;
 const maxKeys=budget?budgetFor(data.solutions):undefined;
 const solutions=[...data.solutions].sort((a,b)=>parseKeys(a).length-parseKeys(b).length).filter(s=>!maxKeys||parseKeys(s).length<=maxKeys);
 return {...data,initial:damageText(text,damage),expected:expectedText||text,solutions,rules:{...data.rules,...(maxKeys?{maxKeys}:{})}};
});
export const LEVEL_COUNT=levels.length;
export const chapters=['First steps','Objects and repetition','Working at scale','The long edit'];
export function getVariant(_level:LevelDefinition):LevelDefinition {throw Error('This course has no variant levels.');}
