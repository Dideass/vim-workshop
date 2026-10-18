import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('public/vendor', {recursive:true});
for (const name of ['vim.js','vim.wasm','vim.data','vimwasm.js']) await copyFile(`node_modules/vim-wasm/${name}`,`public/vendor/${name}`);
await copyFile('node_modules/coi-serviceworker/coi-serviceworker.js','public/coi-serviceworker.js');
await mkdir('public/licenses',{recursive:true});
for(const [pkg,file] of [['react','LICENSE'],['react-dom','LICENSE'],['coi-serviceworker','LICENSE']])await copyFile(`node_modules/${pkg}/${file}`,`public/licenses/${pkg}.txt`);
await copyFile('THIRD_PARTY_NOTICES.md','public/THIRD_PARTY_NOTICES.txt');
await copyFile('LICENSE','public/LICENSE.txt');
