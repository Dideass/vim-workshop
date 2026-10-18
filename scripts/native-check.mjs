import {levelData} from './level-data.mjs';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {practiceVimrc} from '../public/practice.js';
import {practiceCases} from './practice-cases.mjs';
const alternatives=process.argv.includes('--alternatives');
const {levels,getVariant}=await levelData();
const vim=process.env.VIM_BIN|| (process.platform==='win32'?'D:/Git/usr/bin/vim.exe':'vim');
await mkdir('test-results/native',{recursive:true});
let failed=0;const results=[];
for(const base of levels){if(process.env.NATIVE_LEVELS&&!process.env.NATIVE_LEVELS.split(',').includes(String(base.id)))continue;for(const [label,level] of [[String(base.id),base],...(base.variant?[[base.id+'v',getVariant(base)]]:[]),...(alternatives?practiceCases.filter(c=>c.id===base.id&&!c.blockedPaste&&!c.name.startsWith('overbudget-')).map(c=>[base.id+'-'+c.name,{...base,solutions:[c.sequence]}]):[])]){
 for(const [i,seq] of level.solutions.entries()){
  const file=path.resolve(`test-results/native/${label}-${i}.txt`).replaceAll('\\','/');
  const script=path.resolve(`test-results/native/${label}-${i}.vim`).replaceAll('\\','/');
  const assets=path.resolve(`test-results/native/${label}-${i}-assets`).replaceAll('\\','/');
  const actionFile=path.resolve(`test-results/native/${label}-${i}-actions.json`).replaceAll('\\','/');
  await mkdir(assets,{recursive:true});
  for(const [name,text] of Object.entries(level.setup?.files||{}))await writeFile(path.join(assets,name),text);
  await writeFile(file,level.initial);
  const keys=seq.replaceAll('\\','\\\\').replaceAll('"','\\"').replace(/<(Esc|CR|Tab|C-[a-z])>/g,'\\<$1>');
  await writeFile(script,`set nocompatible\nset encoding=utf-8 noautoindent nosmartindent nomodeline nomore\n${practiceVimrc(level.rules.requiredActions)}\n${level.setup?.shiftWidth?'set sw='+level.setup.shiftWidth+'\n':''}execute 'edit ' . fnameescape('${file.replaceAll("'","''")}')\nnormal! gg0\ncall feedkeys("${keys}", 'xt')\ncall writefile([json_encode(g:bl_actions)],'${actionFile}')\nqa!\n`);
  if(level.rules.requiredActions?.includes('confirm-substitution')){
   // Silent Ex mode skips interactive :s///c prompts. Run real Vim in a
   // terminal job instead, sending physical answers through its terminal API.
   const child=script.replace('.vim','-interactive.vim');
   const boot=(await readFile(script,'utf8')).split('call feedkeys(')[0];
   await writeFile(child,boot+`autocmd VimLeavePre * call writefile([json_encode(g:bl_actions)],'${actionFile}')\n`);
   const at=seq.indexOf('<CR>');const tail=seq.slice(at+4);const save=tail.indexOf(':');
   const quote=value=>value.replaceAll('\\','\\\\').replaceAll('"','\\"').replaceAll('<CR>','\\<CR>');
   await writeFile(script,`let b=term_start([v:progpath,'-N','-u','NONE','-i','NONE','-n','-S','${child}'],{'hidden':1,'term_rows':30,'term_cols':100})\ncall term_wait(b,200)\ncall term_sendkeys(b,"${quote(seq.slice(0,at)+'<CR>')}")\ncall term_wait(b,150)\n`+
    [...tail.slice(0,save)].map(answer=>`call term_sendkeys(b,"${quote(answer)}")\ncall term_wait(b,100)\n`).join('')+
    `call term_sendkeys(b,"${quote(tail.slice(save)+':qa!<CR>')}")\nfor i in range(100)\n call term_wait(b,50)\n if job_status(term_getjob(b)) ==# 'dead'\n  break\n endif\nendfor\nif job_status(term_getjob(b)) !=# 'dead'\n call job_stop(term_getjob(b),'kill')\n cquit 1\nendif\nqa!\n`);
  }
  const r=spawnSync(vim,['-N','-u','NONE','-i','NONE','-n','-es','-S',script],{cwd:assets,encoding:'utf8',timeout:15000,windowsHide:true});
  const actual=(await readFile(file,'utf8')).replaceAll('\r\n','\n');
  const actions=JSON.parse(await readFile(actionFile,'utf8').catch(()=>'[]'));
  const missing=(level.rules.requiredActions||[]).filter(action=>!actions.includes(action));
  const ok=actual===level.expected&&r.status===0&&missing.length===0;
  results.push({level:label,solution:i+1,passed:ok,exit:r.status,actions,missing});
  if(!ok){failed++;let at=0;while(at<Math.min(actual.length,level.expected.length)&&actual[at]===level.expected[at])at++;console.error('FAIL',label,i+1,{at,actual:actual.slice(at,at+80),expected:level.expected.slice(at,at+80),exit:r.status,missing},r.stderr.slice(0,300));}else console.log('PASS',label,i+1);
 }
}}
await writeFile(alternatives?'test-results/native-alternative-results.json':'test-results/native-results.json',JSON.stringify(results,null,2));
if(failed)process.exitCode=1;
