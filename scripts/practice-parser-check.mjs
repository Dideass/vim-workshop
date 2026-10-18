import {practiceVimrc} from '../public/practice.js';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
const cases=[
 ['g/^@/norm 0x$x',['global']],
 ['5,39global#^@#normal! 0x$x',['global']],
 ["'<,'>g/^@/normal 0x$x",['global']],
 ['silent! keepjumps 5,$g/^@/norm 0x$x',['global']],
 ['/word\\/part/,$v#keep#d',['inverse-global']],
 ['%global!#keep#d',['global','inverse-global']],
 ['%s/foo/bar/gc',['confirm-substitution']],
 ['%substitute!foo!bar!gc',['confirm-substitution']],
 ['%s/a\\/b/c\\/d/gc',['confirm-substitution']],
 ['%s#foo#c#g',[]],
 ['%s/c/c/g',[]],
 ['%s/foo/bar/g " c in a comment',[]],
 ['echo "g/foo/ and s/foo/bar/gc"',[]],
 ['wincmd w',['window-switch']],
 ['winc w',['window-switch']],
 ['wincmd s',[]]
];
await mkdir('test-results/parser',{recursive:true});
const file=path.resolve('test-results/parser/run.vim').replaceAll('\\','/');
const output=path.resolve('test-results/parser/actions.json').replaceAll('\\','/');
const quote=value=>"'"+value.replaceAll("'","''")+"'";
await writeFile(file,'set nocompatible\n'+practiceVimrc()+
 `let inputs=json_decode(${quote(JSON.stringify(cases))})\nlet output=[]\n`+
 `for item in inputs\n let g:bl_actions=[]\n call BLCommand(item[0])\n call add(output,{'command':item[0],'actions':copy(g:bl_actions)})\nendfor\n`+
 `call writefile([json_encode(output)],${quote(output)})\nqa!\n`);
const vim=process.env.VIM_BIN||(process.platform==='win32'?'D:/Git/usr/bin/vim.exe':'vim');
const result=spawnSync(vim,['-N','-u','NONE','-i','NONE','-n','-es','-S',file],{encoding:'utf8',windowsHide:true,timeout:15000});
assert.equal(result.status,0,result.stderr);
const actual=JSON.parse(await readFile(output,'utf8'));
for(const [index,[command,expected]] of cases.entries())assert.deepEqual(actual[index].actions,expected,command);
console.log('PASS',cases.length,'native Vim command-parser cases, including false positives.');
