import ts from 'typescript';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
export async function levelData(){
 await mkdir('test-results/data',{recursive:true});
 for(const name of ['rules','course-data','levels']){
  let code=ts.transpileModule(await readFile(`src/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  code=code.replaceAll("from './rules'","from './rules.mjs'");
  code=code.replaceAll("from './course-data'","from './course-data.mjs'");
  await writeFile(`test-results/data/${name}.mjs`,code);
 }
 return import(pathToFileURL(path.resolve('test-results/data/levels.mjs')).href+'?v='+Date.now());
}
