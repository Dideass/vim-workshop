import type {Progress,Completion} from './types';
import {LEVEL_COUNT} from './levels';
// Curriculum revision: start fresh; language uses a separate preference key.
export const STORAGE_KEY='vim-workshop.progress.v3';
export const emptyProgress=():Progress=>({version:3,completed:{},drafts:{},seenSolutions:[]});
const idOk=(id:string)=>/^[1-9]\d*$/.test(id)&&Number(id)<=LEVEL_COUNT;
export function parseProgress(input:string):Progress {
 if(input.length>8_000_000)throw Error('This progress file is too large.');
 let p;
 try{p=JSON.parse(input);}catch{throw Error('This is not a supported VIM WorkShop progress file.');}
 if(p?.version===1||p?.version===2)throw Error('This progress belongs to an older course and cannot unlock the revised challenges.');
 if(p?.version!==3||!p.completed||typeof p.completed!=='object'||Array.isArray(p.completed)||!p.drafts||typeof p.drafts!=='object'||Array.isArray(p.drafts)||!Array.isArray(p.seenSolutions))throw Error('This is not a supported VIM WorkShop progress file.');
 const result=emptyProgress();
 for(const [id,v] of Object.entries(p.completed)){
  const c=v as Completion;
  if(!idOk(id)||!c||typeof c.assisted!=='boolean'||!Number.isSafeInteger(c.keys)||c.keys<0||typeof c.completedAt!=='string'||!Number.isFinite(Date.parse(c.completedAt)))throw Error('Invalid completion record.');
  result.completed[id]={assisted:c.assisted,keys:c.keys,completedAt:c.completedAt};
 }
 for(const [id,v] of Object.entries(p.drafts)){
  if(!idOk(id)||typeof v!=='string'||v.length>200000)throw Error('Invalid saved draft.');
  result.drafts[id]=v;
 }
 if(!p.seenSolutions.every((id:unknown)=>typeof id==='string'&&idOk(id)))throw Error('Invalid hint history.');
 result.seenSolutions=[...new Set(p.seenSolutions)] as string[];return result;
}
export function loadProgress():{progress:Progress;warning:string} {
 try {
  localStorage.removeItem('vim-workshop.progress.v2');
  localStorage.removeItem('between-lines.progress.v1');
  const raw=localStorage.getItem(STORAGE_KEY);return {progress:raw?parseProgress(raw):emptyProgress(),warning:''};}
 catch{return {progress:emptyProgress(),warning:'Local progress is unavailable or unreadable. Export progress before leaving.'};}
}
export function storeProgress(p:Progress):boolean {try {localStorage.setItem(STORAGE_KEY,JSON.stringify(p));return true;}catch{return false;}}
export function unlocked(p:Progress,id:number):boolean {return id===1||Array.from({length:id-1},(_,i)=>String(i+1)).every(k=>!!p.completed[k]);}
export function recordCompletion(p:Progress,id:string,c:Completion):Progress {
 const old=p.completed[id];
 const best=old&&(!old.assisted&&c.assisted||old.assisted===c.assisted&&old.keys<=c.keys)?old:c;
 return {...p,completed:{...p.completed,[id]:best}};
}
