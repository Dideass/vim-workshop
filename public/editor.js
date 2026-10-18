import {VimWasm,checkBrowserCompatibility} from './vendor/vimwasm.js';
import {installSpaceMarkers,SPACE_MARKER_COLOR} from './space-markers.js';
// Parent and iframe load the same release, including the action recorder.
const runtime=new URL(location.href).searchParams.get('runtime')||'current';
const {practiceVimrc}=await import('./practice.js?v='+encodeURIComponent(runtime));
const token=new URLSearchParams(location.search).get('session');
const send=(type,data={})=>parent.postMessage({channel:'between-lines',token,type,...data},location.origin);
let vim,settings,ready=false,lastSnapshot='',watchdog,inputBlocked=false;
window.BLReport=(snapshot,check=0)=>{
 const payload=JSON.stringify(snapshot);
 if(payload!==lastSnapshot||check){lastSnapshot=payload;send('snapshot',{snapshot,check});}
 if(!ready){ready=true;clearTimeout(watchdog);document.querySelector('#boot').remove();send('ready');}
};
const vimrc=`set nocompatible
set encoding=utf-8
set noswapfile nobackup nowritebackup noundofile viminfo=
set number norelativenumber noruler laststatus=0 noshowmode noshowcmd
set nowrap sidescroll=1 scrolloff=2 incsearch hlsearch ignorecase smartcase
set backspace=indent,eol,start noautoindent nosmartindent noexpandtab
set list listchars=space:.,trail:.
set guifont=Consolas:h18
set linespace=8
set shortmess+=IF
set nomodeline
syntax off
hi Normal guifg=#dedede guibg=#131313
hi LineNr guifg=#999999 guibg=#131313
hi EndOfBuffer guifg=#8e8e8e guibg=#131313
hi NonText guifg=#999999 guibg=#131313
hi SpecialKey guifg=${SPACE_MARKER_COLOR} guibg=#131313
hi Cursor guifg=#131313 guibg=#a4b9d4
hi Search guifg=#ededed guibg=#484848
hi IncSearch guifg=#131313 guibg=#a4b9d4
hi Visual guifg=NONE guibg=#3c3c3c
hi ModeMsg guifg=#dedede guibg=#131313
function! BLReport(...) abort
 let s = {'text': join(getbufline('/work/page.txt',1,'$'),"\\n")."\\n", 'saved': join(readfile('/work/page.txt'),"\\n")."\\n", 'modified': getbufvar('/work/page.txt','&modified'), 'mode': mode(1), 'line': line('.'), 'column': col('.'), 'actions': g:bl_actions}
 call jsevalfunc('window.BLReport(arguments[0],arguments[1])',[s,a:0 ? a:1 : 0],v:true)
endfunction
augroup BetweenLines
 autocmd!
 autocmd VimEnter * call timer_start(150, {-> BLReport()}, {'repeat': -1})
 autocmd BufWritePost * call BLReport()
augroup END
`;
function forbidden(e){
 if(settings.mode!=='challenge')return '';
 if(settings.rules.noArrows&&/^Arrow(Up|Down|Left|Right)$/.test(e.key))return 'Arrow keys are disabled in this challenge.';
 if(settings.rules.noErase&&['Backspace','Delete'].includes(e.key))return 'Backspace and Delete are disabled in this challenge.';
 // Ctrl+V belongs to Vim's Visual Block mode; actual clipboard pastes are blocked below.
 if(e.metaKey&&e.key.toLowerCase()==='v'||e.shiftKey&&e.key==='Insert')return 'External paste is disabled in challenges. Vim registers still work.';
 return '';
}
document.addEventListener('keydown',e=>{
 if(inputBlocked){e.preventDefault();e.stopImmediatePropagation();return;}
 if(e.target.id!=='input'||!ready)return;
 // Modifier/lock keys must never reach vim.wasm as standalone input. Returning
 // alone only skips our counter; its own keydown listener still receives them.
 // Preserve the browser/OS default so Caps Lock can keep toggling letter case.
 if(['Shift','Control','Alt','AltGraph','Meta','Unidentified','CapsLock','NumLock','ScrollLock'].includes(e.key)){
  e.stopImmediatePropagation();return;
 }
 // Let people leave the canvas without trapping keyboard focus.
 if(e.key==='F6'){e.preventDefault();e.stopImmediatePropagation();send('leave');return;}
 const reason=forbidden(e);
 if(reason){e.preventDefault();e.stopImmediatePropagation();send('violation',{reason});return;}
 if(e.isComposing){e.preventDefault();e.stopImmediatePropagation();send('notice',{reason:'Use an English keyboard layout for these texts.'});return;}
 send('key',{key:e.key,ctrl:e.ctrlKey,shift:e.shiftKey});
 // event.key already includes printable Shift (Shift+5 is "%", Shift+r is "R").
 // Passing Shift again makes vim.wasm look up <S-%>/<S-R> mappings while its
 // built-in commands still edit normally. Canonicalize only printable input;
 // keep real combinations such as Shift+Tab and Ctrl+Shift+keys unchanged.
 if(e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&e.key.length===1&&e.key>=' '&&e.key<='~'){
  e.preventDefault();e.stopImmediatePropagation();
  vim.sendKeydown(e.key,e.keyCode,{shift:false});
 }
},true);
for(const name of ['paste','drop','dragover'])document.addEventListener(name,e=>{
 e.preventDefault();e.stopImmediatePropagation();
 if(inputBlocked)return;
 if(settings?.mode==='challenge'&&name!=='dragover')send('violation',{reason:'External paste and file drops are disabled in challenges.'});
 if(settings?.mode==='explore'&&name==='paste')send('notice',{reason:'Use Vim registers to paste inside the editor.'});
},true);
window.addEventListener('message',async e=>{
 if(e.source!==parent||e.origin!==location.origin||e.data?.token!==token)return;
 const m=e.data;
 try{
  if(m.type==='init'&&!vim){
   settings=m;
   inputBlocked=!!m.inputBlocked;
   const unavailable=checkBrowserCompatibility();if(unavailable)throw Error('Browser isolation is unavailable. Reload once, or open in desktop Chrome or Edge.');
   const canvas=document.querySelector('#screen');
   installSpaceMarkers(canvas);
   vim=new VimWasm({workerScriptPath:new URL('./vendor/vim.js',location.href).href,canvas,input:document.querySelector('#input')});
   vim.onError=e=>send('error',{message:String(e)});
   vim.onVimExit=()=>{ready=false;send('exit');};
   watchdog=setTimeout(()=>send('error',{message:'Vim did not finish starting. Restart the editor to try again.'}),20000);
   const file='/work/'+(/^[a-z][a-z0-9-]*\.txt$/.test(m.file)?m.file:'page.txt');
   // Consolas is a system font. Use a true monospace fallback on hosts without it.
   const probe=document.createElement('canvas').getContext('2d');
   probe.font='18px serif';const fallbackWidth=probe.measureText('iiiiWWWW0000').width;
   probe.font='18px Consolas, serif';const font=probe.measureText('iiiiWWWW0000').width!==fallbackWidth?'Consolas':'monospace';
   const extraFiles=Object.fromEntries(Object.entries(m.setup?.files||{}).filter(([name])=>/^[a-z][a-z0-9-]*\.txt$/.test(name)).map(([name,text])=>['/work/'+name,text]));
   const helpFiles=Object.fromEntries(Object.entries(m.help||{}).map(([name,text])=>['/work/runtime/doc/'+name,text]));
   const config=practiceVimrc(m.rules.requiredActions)+vimrc.replaceAll('/work/page.txt',file).replace('Consolas:h18',font+':h18')+'\ncd /work\nset runtimepath^=/work/runtime helpfile=/work/runtime/doc/help.txt\n'+(m.setup?.shiftWidth?'set shiftwidth='+m.setup.shiftWidth+'\n':'');
   vim.start({dirs:['/work','/work/runtime','/work/runtime/doc'],files:{...helpFiles,...extraFiles,[file]:m.text,'/work/init.vim':config},cmdArgs:['-N','-u','/work/init.vim','-i','NONE',file],clipboard:false});
  }else if(m.type==='check'&&ready){await vim.cmdline('call BLReport('+Number(m.check)+')');}
  else if(m.type==='block-input'){inputBlocked=!!m.blocked;if(inputBlocked)document.querySelector('#input').blur();}
  else if(m.type==='focus'&&ready&&!inputBlocked)vim.focus();
 }catch(e){send('error',{message:String(e)});}
});
send('mounted');
