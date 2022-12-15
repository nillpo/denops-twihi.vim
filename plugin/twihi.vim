" twihi
" Author: skanehira
" License: MIT

if exists('loaded_twihi')
  finish
endif
let g:loaded_twihi = 1

command! -nargs=+ TwihiSearch call twihi#timeline("search", <q-args>)
command! -nargs=1 TwihiList call twihi#timeline("list", <q-args>)
command! -nargs=? TwihiHome call twihi#timeline("home")
command! -nargs=1 TwihiTimeline call twihi#timeline("user", <f-args>)
command! TwihiMentions call twihi#timeline("mentions")
command! -nargs=? -complete=file TwihiTweet call twihi#tweet(<f-args>)
command! TwihiEditConfig call denops#notify("twihi", "editConfig", [])

augroup twihi-highlight
  autocmd ColorScheme * call twihi#internal#helper#_define_highlight()
augroup END

call twihi#internal#helper#_define_highlight()
