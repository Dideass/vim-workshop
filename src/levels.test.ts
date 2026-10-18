import {it,expect} from 'vitest';
import {levels,getVariant} from './levels';
import {budgetFor,judge} from './rules';
import {actionLabels} from './practice';
it('publishes window workflows that avoid the browser-reserved close-tab shortcut',()=>{
 for(const id of [19,23])for(const solution of levels[id-1].solutions){
  expect(solution).not.toContain('<C-w>');
  expect(solution).toMatch(/:winc(?:md)? w<CR>/);
 }
 expect(actionLabels['window-switch']).toContain(':winc w');
});
it('ships 33 distinct, attributed real-source challenges with progressively longer literature',()=>{
 expect(levels).toHaveLength(33);expect(levels.at(-1)?.source.author).toBe('Jorge Luis Borges');
 expect(levels.filter(l=>l.category==='lyrics')).toHaveLength(8);
 expect(new Set(levels.map(l=>l.source.author)).size).toBe(33);
 for(const author of ['Jorge Luis Borges','Italo Calvino','Wang Xiaobo','Gabriel García Márquez','Yukio Mishima','Homer','Albert Camus','Jean-Paul Sartre','Haruki Murakami','Yasunari Kawabata','Franz Kafka','Lu Xun','The Beatles','Linkin Park','Arianne / The End of Evangelion'])expect(levels.some(l=>l.source.author===author),author).toBe(true);
 for(const l of levels){
  const words=l.initial.trim().split(/\s+/).length;
  expect(words).toBeGreaterThan(0);if(l.id<=3)expect(words).toBeLessThan(40);
  if(l.id>=24)expect(l.initial.trimEnd().split('\n').length).toBeGreaterThan(80);
  if(l.category==='lyrics')expect(l.expected.trim().split(/\s+/).length).toBeLessThanOrEqual(10);
  expect(l.variant).toBeUndefined();expect(l.source.kind).toBe('excerpt');
  expect(l.initial).not.toBe(l.expected);expect(l.source.basis).toBeTruthy();expect(l.source.edition).toBeTruthy();
  expect(l.solutions.length).toBeGreaterThan(0);expect(Object.keys(l.rules).length).toBeLessThanOrEqual(2);
  expect(l.hints).toHaveLength(2);expect(l.zh?.hints).toHaveLength(2);
  expect([...l.hints,...l.zh!.hints].join('\n')).not.toMatch(/One possible route:|一种可行解法/);
  for(const action of l.rules.requiredActions||[])expect(actionLabels[action]).toBeTruthy();
  if(l.rules.maxKeys)expect(l.rules.maxKeys).toBe(budgetFor(l.solutions));
 }
 expect(Math.max(...levels.map(l=>l.initial.split('\n').length))).toBeGreaterThan(1000);
 expect(()=>getVariant(levels[32])).toThrow();
});

it('uses complete user-supplied sentences and protects the added text',()=>{
 const endings:Record<number,string>={5:'Golden Pavilion.',7:'Boeing 747.',8:'scratches, gouges, and graffiti.',11:'when his father took him to see ice.'};
 for(const id of [5,7,8,11]){
  const level=levels[id-1];
  expect(level.source.textOrigin).toBe('user-provided-translation');
  expect(level.zh?.source.textOrigin).toBe('user-provided-translation');
  expect(level.expected.trimEnd().endsWith(endings[id])).toBe(true);
  const snapshot={text:level.expected,saved:level.expected,modified:false,mode:'n',line:1,column:1,actions:level.rules.requiredActions};
  expect(judge(level,snapshot,level.rules.maxKeys!,[],false).passed).toBe(true);
  const altered=level.expected.replace(endings[id],'Changed.');
  expect(judge(level,{...snapshot,text:altered,saved:altered},1,[],false).contentOk).toBe(false);
 }
 expect(levels[4].initial.split('\n')[0]).toBe(levels[4].initial.split('\n')[1]);
 expect(levels[6].initial.match(/thirty-eight/g)).toHaveLength(1);
 expect(levels[6].expected).toContain('thirty-seven');
 // Every letter of the corrupted suffix differs; a one-character replacement cannot repair it.
 expect([..."eight"].filter((letter,index)=>letter!=="seven"[index])).toHaveLength(5);
 expect(levels[7].initial.match(/\[city without a name\]/g)).toHaveLength(1);
 expect(levels[10].initial.match(/FIRING SQUAD/g)).toHaveLength(1);
 expect(levels[10].expected).toContain('Colonel Aureliano Buendia');
});

