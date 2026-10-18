// Send the actual physical Shift combinations a US keyboard produces. Sending
// press('%') alone misses vim.wasm's handling of Shift+Digit5 and similar keys.
const shifted={...Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c=>[c,'Shift+Key'+c])),
 '%':'Shift+Digit5','*':'Shift+Digit8','#':'Shift+Digit3','@':'Shift+Digit2','$':'Shift+Digit4',
 '^':'Shift+Digit6','!':'Shift+Digit1','(':'Shift+Digit9',')':'Shift+Digit0',
 ':':'Shift+Semicolon','"':'Shift+Quote','<':'Shift+Comma','>':'Shift+Period','|':'Shift+Backslash',
 '~':'Shift+Backquote','?':'Shift+Slash','_':'Shift+Minus','+':'Shift+Equal','{':'Shift+BracketLeft','}':'Shift+BracketRight'};
export async function sendVimKeys(input,sequence,{literal=false}={}){
 for(const key of sequence.match(/<(?:Esc|CR|Tab|C-[a-z])>|[\s\S]/g)||[]){
  await input.press(key==='<Esc>'?'Escape':key==='<CR>'?'Enter':key==='<Tab>'?'Tab':key.startsWith('<C-')?'Control+'+key[3]:key===' '?'Space':!literal&&shifted[key]||key);
 }
}
