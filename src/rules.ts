import type {LevelDefinition,EditorSnapshot,AttemptResult} from './types';
export const normalize=(s:string)=>s.replace(/\r\n/g,'\n').replace(/\n$/,'');
export function parseKeys(sequence:string):string[] { return sequence.match(/<(?:Esc|CR|Tab|BS|Del|Up|Down|Left|Right|C-[a-z])>|[\s\S]/g)||[]; }
// Multiply by 1.1 and round up, using the exact ratio 11/10.
export const budgetFor=(solutions:readonly string[])=>{
 if(!solutions.length)throw Error('A challenge needs a reference solution.');
 return Math.ceil(Math.min(...solutions.map(s=>parseKeys(s).length))*11/10);
};
export function blockedKey(key:string,rules:LevelDefinition['rules']):string|undefined {
 if(rules.noArrows && /^Arrow(Up|Down|Left|Right)$/.test(key))return 'Arrow keys are disabled in this challenge.';
 if(rules.noErase && ['Backspace','Delete'].includes(key))return 'Backspace and Delete are disabled in this challenge.';
}
export function judge(level:Pick<LevelDefinition,'expected'|'rules'>,snapshot:EditorSnapshot,keys:number,violations:string[],assisted:boolean):AttemptResult {
 const contentOk=normalize(snapshot.text)===normalize(level.expected);
 const savedOk=!snapshot.modified&&normalize(snapshot.saved)===normalize(snapshot.text);
 const missingActions=(level.rules.requiredActions||[]).filter(action=>!snapshot.actions?.includes(action));
 const budgetExceeded=level.rules.maxKeys!==undefined&&keys>level.rules.maxKeys;
 const rulesOk=violations.length===0&&missingActions.length===0&&!budgetExceeded;
 const passed=contentOk&&savedOk&&rulesOk;
 let message='There are still changes to make. Check the task and keep the other lines intact.';
 if(contentOk&&!savedOk)message='The text is right. Save it with :w, then check again.';
 else if(contentOk&&missingActions.length)message='Text repaired. Complete the practice actions listed in Rules, then save and check again.';
 else if(contentOk&&violations.length)message='Text repaired. Blocked input marked this attempt. Restart for a fresh attempt.';
 else if(contentOk&&budgetExceeded)message='Text repaired. Key budget exceeded: {used} / {limit}. Restart for a fresh attempt.';
 else if(passed)message='Text repaired. All challenge rules met.';
 return {contentOk,savedOk,rulesOk,passed,keys,violations,assisted,message,missingActions,budgetExceeded,keyLimit:level.rules.maxKeys};
}
