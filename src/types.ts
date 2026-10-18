export type PlayMode = 'challenge' | 'explore';
export interface SourceInfo { author: string; title: string; year: string; url?: string; edition: string; translator: string; basis: string; note: string; kind: 'excerpt' | 'original';rights?:'quotation'|'public-domain'|'licensed';textOrigin?:'user-provided-translation' }
export interface LevelDefinition {
 id: number; title: string; chapter: number; file: string; task: string; initial: string; expected: string;
 rules: { maxKeys?: number; noArrows?: boolean; noErase?: boolean; requiredActions?:string[] };
 setup?:{files?:Record<string,string>;shiftWidth?:number};
 hints: [string, string]; solutions: string[]; source: SourceInfo;
 category?:'literature'|'lyrics';skills?:string;
 zh?:{title:string;task:string;hints:[string,string];source:SourceInfo};
 variant?: {title:string;task:string;initial:string;expected:string;solutions:[string,string]};
}
export interface EditorSnapshot { text:string; saved:string; modified:boolean; mode:string; line:number; column:number; actions?:string[] }
export interface AttemptResult { contentOk:boolean; savedOk:boolean; rulesOk:boolean; passed:boolean; keys:number; violations:string[]; assisted:boolean; message:string; missingActions:string[]; budgetExceeded:boolean; keyLimit?:number }
export interface Completion { assisted:boolean; keys:number; completedAt:string }
export interface Progress { version:3; completed:Record<string,Completion>; drafts:Record<string,string>; seenSolutions:string[] }
