// Positive practice goals are recorded inside real Vim, not inferred from a
// substring of browser keystrokes. These expression mappings return the native
// command unchanged; macro playback and Vim's help windows keep working.
export function practiceVimrc(required=[],reference='reference.txt'){
 const lines=[String.raw`let g:bl_actions = []
function! BLAction(name, keys) abort
 if index(g:bl_actions,a:name) < 0
  call add(g:bl_actions,a:name)
 endif
 return a:keys
endfunction
function! BLYank() abort
 if v:event.operator ==# 'y' && v:event.regtype ==# 'V'
  call BLAction('yank-line','')
 endif
 if v:event.operator ==# 'y' && v:event.regname =~# '^[a-zA-Z]$'
  call BLAction('named-register','')
 endif
endfunction
function! BLVisit() abort
 if &buftype ==# 'help'
  call BLAction('help','')
 endif
 if winnr('$') > 1 && expand('%:t') ==# '${reference.replaceAll("'","''")}'
  call BLAction('reference-buffer','')
 endif
endfunction
" Skip Ex addresses and modifiers without mistaking a pattern for a command.
function! BLExBody(command) abort
 let text = a:command
 let pos = 0
 while pos < strlen(text)
  let char = strpart(text,pos,1)
  if char =~# '\s' || char ==# ':' || char =~# '\d' || index(['.','$','%',',',';','+','-'],char) >= 0
   let pos += 1
  elseif char ==# "'"
   let pos += 2
  elseif char ==# '/' || char ==# '?'
   let end = BLDelimiter(text,pos+1,char)
   if end < 0 | return '' | endif
   let pos = end+1
  else
   let word = matchstr(strpart(text,pos),'^[A-Za-z]\+')
   if word =~# '^\%(sil\%[ent]\|keepj\%[umps]\|keepm\%[arks]\|keepp\%[atterns]\|noa\%[utocmd]\|lockm\%[arks]\|verb\%[ose]\|uns\%[ilent]\|conf\%[irm]\|san\%[dbox]\)$'
    let pos += strlen(word)
    if strpart(text,pos,1) ==# '!' | let pos += 1 | endif
   else
    break
   endif
  endif
 endwhile
 return strpart(text,pos)
endfunction
function! BLDelimiter(text, start, delimiter) abort
 let pos = a:start
 while pos < strlen(a:text)
  let char = strpart(a:text,pos,1)
  if char ==# '\'
   let pos += 2
  elseif char ==# a:delimiter
   return pos
  else
   let pos += 1
  endif
 endwhile
 return -1
endfunction
function! BLCommand(command) abort
 if get(v:event,'abort',0)
  return
 endif
 let body = BLExBody(a:command)
 let name = matchstr(body,'^[A-Za-z]\+')
 let tail = substitute(strpart(body,strlen(name)),'^\s*','','')
 if name =~# '^g\%[lobal]$'
  call BLAction('global','')
  if strpart(tail,0,1) ==# '!'
   call BLAction('inverse-global','')
  endif
 endif
 if name =~# '^v\%[global]$'
  call BLAction('inverse-global','')
 endif
 if name =~# '^s\%[ubstitute]$' || name =~# '^sm\%[agic]$' || name =~# '^sno\%[magic]$'
  let delimiter = strpart(tail,0,1)
  if !empty(delimiter) && delimiter !~# '[A-Za-z0-9\\]'
   let patternEnd = BLDelimiter(tail,1,delimiter)
   let replacementEnd = patternEnd < 0 ? -1 : BLDelimiter(tail,patternEnd+1,delimiter)
   if replacementEnd >= 0 && matchstr(strpart(tail,replacementEnd+1),'^[A-Za-z&]*') =~# 'c'
    call BLAction('confirm-substitution','')
   endif
  endif
 endif
 if name =~# '^winc\%[md]$' && strpart(tail,0,1) =~# '[whjklpWtb]'
  call BLAction('window-switch','')
 endif
endfunction
augroup WorkshopPractice
 autocmd!
 autocmd TextYankPost * call BLYank()
 autocmd BufEnter,BufWinEnter,FileType * call BLVisit()
 autocmd CmdlineLeave : call BLCommand(getcmdline())
augroup END`];
 const mappings={
  undo:[['n','u']],redo:[['n','<C-r>']],
 'replace-mode':[['n','R']], 'match-pair':[['n','%'],['o','%'],['x','%']],
  'line-change':[['n','cc'],['n','C']],
  'line-start-insert':[['n','I']], 'line-end-insert':[['n','A']],
  'open-line':[['n','o'],['n','O']], 'visual-char':[['n','v']],
  'page-forward':[['n','<C-f>']], 'page-back':[['n','<C-b>']],
  'word-search':[['n','*'],['n','#'],['n','g*'],['n','g#']],
  'repeat-change':[['n','.']], 'quote-object':[['o','i"'],['o','a"']],
  mark:[['n','m']], 'visual-line':[['n','V']],
  outdent:[['n','<'],['x','<']],
  'window-switch':[['n','<C-w>w'],['n','<C-w>h'],['n','<C-w>j'],['n','<C-w>k'],['n','<C-w>l'],['n','<C-w>p'],['n','<C-w>W'],['n','<C-w>t'],['n','<C-w>b'],['n','<C-w><C-w>'],['n','<C-w><C-h>'],['n','<C-w><C-j>'],['n','<C-w><C-k>'],['n','<C-w><C-l>'],['n','<C-w><C-p>']],
  'visual-block':[['n','<C-v>']], 'insert-register':[['i','<C-r>']],
  'record-macro':[['n','q']], 'play-macro':[['n','@']],
  format:[['n','gq'],['x','gq']]
 };
 for(const action of required)for(const [mode,key] of mappings[action]||[]){
  const value=key.replaceAll('\\','\\\\').replaceAll('"','\\"').replace(/<([^>]+)>/g,'\\<$1>');
  lines.push(`${mode}noremap <silent> <expr> ${key} BLAction('${action}', "${value}")`);
 }
 return lines.join('\n')+'\n';
}
