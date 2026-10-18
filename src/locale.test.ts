import {describe,it,expect} from 'vitest';
import mainSource from './main.tsx?raw';
import ts from 'typescript';
import {levels,getVariant,chapters} from './levels';
import {chinese,localizeLevel,translate} from './locale';
import {actionLabels} from './practice';

describe('UI language is independent from the English exercise',()=>{
 it('translates all 33 tasks and hints without touching editor data',()=>{
  for(const original of levels){
   const variant=original.title!==levels[original.id-1].title;
   const zh=localizeLevel(original,'zh',variant);
   for(const action of original.rules.requiredActions||[])expect(chinese[actionLabels[action]],`Missing practice translation: ${action}`).toBeTruthy();
   expect(zh.title).toMatch(/[\u4e00-\u9fff]/);expect(zh.task).toMatch(/[\u4e00-\u9fff]/);
   for(const hint of zh.hints)expect(hint).toMatch(/[\u4e00-\u9fff]/);
   expect(zh.initial).toBe(original.initial);expect(zh.expected).toBe(original.expected);
   expect(zh.solutions).toBe(original.solutions);expect(zh.rules).toBe(original.rules);
   expect(zh.source.note).toMatch(/[\u4e00-\u9fff]/);
   expect(zh.source.edition).toMatch(/[\u4e00-\u9fff]/);
   expect(zh.source.basis).toMatch(/[\u4e00-\u9fff]/);
   expect(localizeLevel(original,'en')).toBe(original);
  }
  for(const chapter of chapters)expect(translate('zh',chapter)).not.toBe(chapter);
 });
 it('covers every static UI message used by the main view',()=>{
  const source=ts.createSourceFile('main.tsx',mainSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const messages:string[]=[];
  const collect=(node:ts.Node)=>{if(ts.isStringLiteral(node))messages.push(node.text);else if(ts.isConditionalExpression(node)){collect(node.whenTrue);collect(node.whenFalse);}};
  const visit=(node:ts.Node)=>{if(ts.isCallExpression(node)&&node.expression.getText(source)==='t'&&node.arguments[0])collect(node.arguments[0]);ts.forEachChild(node,visit);};
  visit(source);
  for(const message of messages)expect(chinese[message],`Missing Chinese UI text: ${message}`).toBeTruthy();
 });
 it('formats counts and translates known errors without altering command notation',()=>{
  expect(translate('zh','{count} keys or fewer',{count:22})).toBe('最多 22 次按键');
  expect(translate('zh','Error: Invalid saved draft.')).toBe('草稿格式有误。');
  expect(translate('zh','The text is right. Save it with :w, then check again.')).toContain(':w');
 });
});
