# 33 关训练覆盖（2026-10-18）

正文、出处和完整句子保持不变。本轮改变初始损坏、任务、训练动作与预算；前两关仍不限步数。

## 逐关设计

| 关 | 任务形态 | 查阅方向 | 操作目标 | 上限 |
|---|---|---|---|---:|
| 01 | 在 died 前补上 Mother 和一个空格，然后保存。 | 按 i 输入缺失单词与空格，按 Esc，再输入 :w 并回车。 | 内容与预算 | 不限 |
| 02 | 删除两行开头的 #，保留其余文字，然后保存。 | h j k l 移动，x 删除光标下的字符。可查 :help x。 | 内容与预算 | 不限 |
| 03 | 将 speaking 首字母改为大写，把末尾 ? 改为句号，然后保存。 | r 替换单个字符，$ 到行尾。可查 :help r 和 :help $。 | 内容与预算 | 8 |
| 04 | 把 shrot 修复为 long，其余文字保持不变，然后保存。 | w、b 按单词移动，cw 修改单词。可查 :help w 和 :help cw。 | 内容与预算 | 14 |
| 05 | 删除重复的开篇行；撤销这次删除一次，再重做并保存。 | u 回退一次修改，Ctrl+r 重新应用；可查 :help undo 和 :help CTRL-R。 | Undo (u); Redo (Ctrl+r in Normal mode) | 8 |
| 06 | 删除三处 #，保留歌词其他内容，然后保存。 | f 在当前行查找字符，; 重复该查找。可查 :help f 和 :help ;。 | 内容与预算 | 11 |
| 07 | 用 R 将 thirty-eight 中的 eight 覆盖为 seven，保留句子其余内容，然后保存。 | R 连续覆盖字符，Esc 结束替换模式；可先搜索定位损坏单词。可查 :help R。 | Replace mode (R) | 19 |
| 08 | 用 % 配对定位括号（也可用于 d%），将整个括号词组改为 city，保留其余内容并保存。 | 光标在括号之前时，% 也能查找本行后面的括号并跳到配对端；d 等操作符同样可以使用 % 作为移动范围。可查 :help %。 | Match brackets (%) | 16 |
| 09 | 在行首补回 I、行末补回 nothing.；从两端进入插入状态并保存。 | I 从首个非空白字符前插入，A 从最后一个字符后追加。可查 :help I 和 :help A。 | Insert at first nonblank (I); Append at line end (A) | 18 |
| 10 | 把损坏的整行恢复为：Hell is other people. 然后保存。 | cc 修改整行，C 修改光标到行末。可查 :help cc 和 :help C。 | Change line (cc / C) | 29 |
| 11 | 将 FIRING SQUAD 转为小写，保留其余文字，然后保存。 | gu 可与移动范围组合，数字可作用于移动范围。可查 :help gu。 | 内容与预算 | 10 |
| 12 | 把以 Come 开头的行移回第一行，保留两行内容，然后保存。 | dd 剪切整行，p、P 分别粘贴到当前行后、前。可查 :help p。 | 内容与预算 | 7 |
| 13 | 在第一节之后补回 "We slowly drove, he knew no haste,"；新开一行插入并保存。 | o 在下方新开行，O 在上方新开行；可用行号定位缺口。可查 :help o 和 :help O。 | Open a line (o / O) | 46 |
| 14 | 复制开篇行补回最后一节，并删除 @@ 批注；保留可用的复制内容，然后保存。 | yy 复制整行，"_dd 删除而不覆盖副本，"0P 使用最近复制的内容。可查 :help quote_ 和 :help quote0。 | Linewise yank (e.g. yy) | 16 |
| 15 | 按字符选中 XX 及其后一个空格，删除选区后保存。 | v 开始字符选区，数字可扩展移动范围，d 删除选区。可查 :help v。 | Character selection (v) | 10 |
| 16 | 前后翻页检查诗篇，再把移到全文末尾的开篇行放回顶部，最后保存。 | Ctrl+f、Ctrl+b 前后翻页，G、gg 到达两端。可查 :help CTRL-F 和 :help G。 | Page forward (Ctrl+f); Page backward (Ctrl+b) | 11 |
| 17 | 去掉 Ulysses 后面的两处 @；用当前单词搜索追踪姓名，然后保存。 | *、# 搜索当前完整单词，g*、g# 不要求单词边界；n 继续搜索，N 反向。可查 :help star 和 :help gstar。 | Current-word search (* / # / g* / g#) | 25 |
| 18 | 将两处 wizh 修复为 wish，用 . 重复第一次修改；保留其余内容并保存。 | 点号重复上次修改，; 重复行内字符查找。可查 :help . 和 :help ;。 | Repeat a change (.) | 10 |
| 19 | 用双引号文本对象将问题恢复为 "What's happened to me?"；在 Vim 内打开一次 :help，返回正文后保存。 | 帮助会打开窗口；用 :winc w 返回正文，避免 Ctrl+w 关闭浏览器标签页；ci" 仅修改引号内部。可查 :help iquote。 | Open Vim help (:help / :h); Double-quote object (i" / a") | 59 |
| 20 | 将 i 修复为 I；设置位置标记并按整行选择，去掉第 5–39 行的边栏，然后保存。 | m 设置标记，V 按整行选择；标记位置也可限定范围。可查 :help mark 和 :help V。 | Set a mark (m + letter); Line selection (V) | 24 |
| 21 | 将四个片段合并为一行，单词间保留一个空格，然后保存。 | J 用空格连接行，可以带数字一次合并多行。可查 :help J。 | 内容与预算 | 6 |
| 22 | 将前五行的缩进移回左边界；缩进宽度为 4，使用减少缩进操作后保存。 | < 加移动范围减少缩进；<< 按整行处理，可视选区也接受 <。可查 :help <。 | Outdent (< motion / << / Visual <) | 7 |
| 23 | 从另一个窗口中的 reference.txt 取回完整句子；复制后切回本文件，替换残缺行并保存。 | :sp、:vs 打开分屏；输入 :winc w 并回车切换窗口，它是 :wincmd w 的简写。Ctrl+w 可能关闭浏览器标签页。用 yy 与 Vp 传递整行，可查 :help window-move-cursor。 | Split reference.txt (:sp / :vs); Switch windows (:winc w); Linewise yank (e.g. yy) | 37 |
| 24 | 用 Ctrl+v 矩形选择删除每行最左侧四列的 >> 边栏（包括空白段落行），保留正文并保存。 | Ctrl+v 选择矩形，用 G 扩展，再删除选中的列。可查 :help blockwise-visual。 | Block selection (Ctrl+v) | 9 |
| 25 | 参照前文将 @@@ 与 ### 恢复为 Alexandrovna。先复制到具名寄存器，再在插入模式用 Ctrl+r 读取寄存器，最后保存。 | 具名寄存器可保留副本，插入模式下 Ctrl+r 插入寄存器内容。可查 :help registers 和 :help i_CTRL-R。 | Named-register yank (e.g. "a); Insert register (Ctrl+r in Insert mode) | 38 |
| 26 | 去掉各行外侧的 > 与 <；录制可靠的逐行修复，再回放宏处理全文，最后保存。 | q 录制宏，@ 回放；让每一行开始时的光标位置都可靠。可查 :help q。 | Record a macro (q + register); Replay a macro (@ + register) | 20 |
| 27 | 每处相邻重复单词只保留一份，保留大小写、标点和段落，然后保存。 | 捕获单词，再用反向引用匹配相同单词。可查 :help /\( 和 :help /\1。 | 内容与预算 | 29 |
| 28 | 用 :global（简写 :g）删除标记行开头的 @ 与末尾的 #，保留其他行并保存。 | 可用全局选择在匹配行上执行普通模式操作。可查 :help :global 和 :help :normal。 | Global command (:g / :global) | 21 |
| 29 | 按四位行号恢复升序，再删除每行行号、／ 与后随空格，保留空白段落，然后保存。 | 数字排序与字典排序不同；可用模式删除索引边栏。可查 :help :sort。 | 内容与预算 | 26 |
| 30 | 用 gq 将每段重排至 60 列，连接句子时使用单个空格。保留所有单词及空白段落边界，然后保存。 | gq 格式化移动范围或选区，textwidth 与 joinspaces 会影响结果。可查 :help gq 和 :help textwidth。 | Format paragraphs (gq) | 27 |
| 31 | 用 :vglobal（简写 :v）删除未标记行，保留带 ／ 标记的行及空白段落；去掉余下边栏与行尾空格，然后保存。 | :v 选择不匹配模式的行；先删除它们，再去掉保留行的边栏。可查 :help :vglobal。 | Inverse global (:v / :g!) | 36 |
| 32 | 把两处 MrUtterson 修复为 Mr. Utterson；通过确认提示审阅替换，保留其余文字并保存。 | 替换标志 c 会逐次询问；y 接受一处，a 接受余下全部。可查 :help :s_c。 | Substitution with confirmation (:s…c) | 39 |
| 33 | 将 Berkeleey 修复为 Berkeley，去除相邻重复词、数字边栏及行尾空格，再把最后一行移回顶部；保留其余文字和段落边界，然后保存。 | 把目标拆成数类独立修复，并检查不应修改的正文是否完好。 | 内容与预算 | 85 |

## 组合与边界

- 基础输入与修改：i / I / A / o / O / R / cc / C / cw / s / r / Esc。
- 定位与搜索：h j k l、w / e / b、0 / $、gg / G、数字行号、f / ;、% 、Ctrl+f / Ctrl+b、* / # / n / N。
- 删除、复制和寄存器：x / dd / D、yy / p / P、"_dd、"0P、具名寄存器、插入模式 Ctrl+r。
- 选择与结构：v / V / Ctrl+v、计数操作、<< / <、配对与引号文本对象、位置标记、J、gq。
- 工作流：u / Ctrl+r、点号重复、q / @ 宏、:help、:vsplit、:winc w、多缓冲区文本传递。
- Ex 与批量处理：替换确认 y / a、:global / :normal、:vglobal、范围、正则捕获和反向引用、数字排序、单词边界和综合修复。

此表区分明确练习与 Vim 本身支持的能力；不声称通关一次就覆盖所有 Vim 功能。终端启动、多项目目录、任意文件读写以及所有 Vim 选项不假装由静态网页训练完成。

## 规则和证据

有操作目标的关卡会在 Rules 明示接受的命令：例如配对移动写为 `%`（包括 `d%`），与 `ca[` 等括号文本对象分开；I/A、v/V/Ctrl+v、:v、两种模式下的 Ctrl+r 也逐项区分。提示中的其他工具是建议，不会增加隐藏的判题条件。证据来自真实 Vim 的映射调用、TextYankPost、缓冲区和命令事件，不用键盘字符串正则猜测模式。映射返回原生命令，不实现 Vim 模拟器。文字正确但缺少动作时，分别反馈内容正确和缺少的动作；探索模式不应用这些限制。规则不是安全沙箱，也不声称数学上排除了 Vim 所有可能的等价解法。

预算为 ceil(k × 1.1)，k 是满足本关完整规则的最短已验证参考输入。组合键计一次，宏内部回放不追加物理按键，保存计入。正式提示只展示预算内参考。

## 提示一致性

课程数据仅保留两条概念提示；第三级直接渲染排序、过滤后的 level.solutions[0]，没有独立的手写命令副本。逐关中英文浏览器测试核对：只有一个 code 元素、没有重复解法段落、显示值等于当前参考，并真实回放得到目标全文且满足训练动作和预算。

## 本地帮助与进度

vim-wasm 的 npm 数据包不含帮助文档；现从官方 vim/vim 的 v8.2.0055 标签加入 139 份匹配版本英文文档及 tags。它们随站点发布，初始化后 :help 可离线使用。

按用户要求，改版课程从第 1 关重新开始；旧通关、草稿及提示记录清空，界面语言保留。新版使用 v3 进度格式，旧文件无法解锁新题，新版记录可正常保存和导入导出。

## 操作说明与记录一致性

第 07 关损坏为 `thirty-eight`，用 R 将整个五字母词 `eight` 覆盖为 `seven`，正确原文和预算保持不变。第 08 关要求使用 `%` 配对移动：单独 `%`、操作符中的 `d%`、可视模式中的 `%` 均计入，不要求先用 `f[`。`ca[` 本身不包含 `%`，仍须满足公开的操作目标。规则不比较整段按键是否等于参考答案。

这轮复现了真实 Shift+5 输入 `%` 的漏记：浏览器 event.key 已经是 `%`，vim.wasm 再收到 Shift 后按 `<S-%>` 查找映射，原生命令仍能编辑，普通 `%` 映射却漏记。输入桥现在将无 Ctrl/Alt/Meta 的可打印 Shift 字符按其实际字符转交；特殊键及真正的修饰组合保持原样。回归使用真实 Shift+数字、Shift+字母和 Shift+标点，不再只发送直接字符。

同时覆盖操作符／可视模式、`<` 加移动范围、Ctrl+w 的控制键别名、g*/g#、带地址／修饰前缀／不同分隔符的 Ex 命令，以及 `:g!` 的反向全局别名。确认替换通过实际标志识别，模式或注释中的 c 不算确认。`scripts/practice-cases.mjs` 的独立路径覆盖全部 22 个有训练目标的关卡；超预算路径只报告预算，禁用输入单独报告，不假称操作未完成。预算与正文没有因本次修复改变。

复现：`npm run test:native -- --alternatives`、`node scripts/practice-parser-check.mjs`、`npm run test:practice`、`npm run test:course`。这些测试验证明确列出的路径，不声称证明所有可能 Vim 程序的等价性。
