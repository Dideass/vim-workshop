import type {EditorSnapshot,LevelDefinition,PlayMode} from './types';
type Event={type:string;snapshot?:EditorSnapshot;check?:number;reason?:string;message?:string;key?:string;ctrl?:boolean;shift?:boolean};
let helpFiles:Promise<Record<string,string>>|undefined;
function loadHelp(){
 return helpFiles??=fetch(new URL('vim-help.json',new URL(import.meta.env.BASE_URL,location.href))).then(response=>{if(!response.ok)throw Error('Vim help files could not load. Restart the editor to retry.');return response.json();}).catch(error=>{helpFiles=undefined;throw error;});
}
export class EditorAdapter {
 readonly session=crypto.randomUUID();
 private pending=new Map<number,{resolve:(s:EditorSnapshot)=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
 private serial=0;
 private inputBlocked=false;
 private bootTimer:ReturnType<typeof setTimeout>;
 constructor(private frame:HTMLIFrameElement,private text:string,private rules:LevelDefinition['rules'],private mode:PlayMode,private file:string,private listener:(event:Event)=>void,private setup?:LevelDefinition['setup']){
  window.addEventListener('message',this.receive);
  this.bootTimer=setTimeout(()=>this.listener({type:'error',message:'The editor did not load. Check your connection, then restart.'}),25000);
  frame.src=new URL(`editor.html?session=${this.session}&runtime=${encodeURIComponent(import.meta.env.VITE_RUNTIME_VERSION)}`,new URL(import.meta.env.BASE_URL,location.href)).href;
 }
 private receive=(e:MessageEvent)=>{
  if(e.origin!==location.origin||e.source!==this.frame.contentWindow||e.data?.channel!=='between-lines'||e.data.token!==this.session)return;
  const event=e.data as Event;
  if(['ready','error','exit'].includes(event.type))clearTimeout(this.bootTimer);
  if(event.type==='mounted')loadHelp().then(help=>this.send({type:'init',text:this.text,rules:this.rules,mode:this.mode,file:this.file,setup:this.setup,help,inputBlocked:this.inputBlocked})).catch(error=>this.listener({type:'error',message:String(error)}));
  if(event.type==='snapshot'&&event.snapshot){
   event.snapshot.modified=!!event.snapshot.modified;
   if(event.check){const p=this.pending.get(event.check);if(p){clearTimeout(p.timer);p.resolve(event.snapshot);this.pending.delete(event.check);}}
  }
  this.listener(event);
 };
 private send(data:Record<string,unknown>){this.frame.contentWindow?.postMessage({token:this.session,...data},location.origin);}
 focus(){this.send({type:'focus'});}
 setBlocked(blocked:boolean){this.inputBlocked=blocked;this.send({type:'block-input',blocked});}
 read():Promise<EditorSnapshot>{return new Promise((resolve,reject)=>{const check=++this.serial;const timer=setTimeout(()=>{this.pending.delete(check);reject(Error('Vim is busy. Press Esc, then check again.'));},5000);this.pending.set(check,{resolve,reject,timer});this.send({type:'check',check});});}
 destroy(){clearTimeout(this.bootTimer);window.removeEventListener('message',this.receive);for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('Editor restarted.'));}this.pending.clear();this.frame.src='about:blank';}
}
