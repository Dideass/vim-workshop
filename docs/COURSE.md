# 33 关课程与素材记录

这是已经接入应用的课程清单，不是待实现的占位表。25 个文学关、8 个歌词关；每位作者、乐队或动画来源只出现一关。没有额外变式关，最后一关为博尔赫斯。

文学长文逐渐增长，短歌词作为复习间奏。长度不要求机械递增：诗歌保持真实诗节，歌词保留真实短句，不重复段落凑长度。第 24–32 关使用约 340–1,500 行的长文；第 33 关使用较短但需要多类修复的博尔赫斯早期散文片段。所有英文正文都来自真实来源，错误、边栏、重复词和索引数字由程序加入，修复目标不含原创微小说。

受保护的现代作品只收入短引文，歌词只收入极短摘录。较长英译使用已经核实的早期版本或明确许可版本。鲁迅、王小波和博尔赫斯的工坊英译，以及第 5、7、8、11 关依据用户所给中文完成的英译，均明确标注，不冒充出版译本。博尔赫斯最终关选的是 1925 年《Inquisiciones》中《La encrucijada de Berkeley》的开头（印刷页 109–112），没有混用后期作品或现代译本。

## 关卡

| 关 | 作者／音乐来源 | 作品／片段 | 目标文本行数 | 训练内容 |
|---|---|---|---:|---|
| 01 | Albert Camus | The Stranger | 1 | 在 died 前补上 Mother 和一个空格，然后保存。 |
| 02 | Wang Xiaobo | Golden Age | 2 | 删除两行开头的 #，保留其余文字，然后保存。 |
| 03 | The Beatles | Let It Be | 1 | 将 speaking 首字母改为大写，把末尾 ? 改为句号，然后保存。 |
| 04 | Yasunari Kawabata | Snow Country | 1 | 把 shrot 修复为 long，其余文字保持不变，然后保存。 |
| 05 | Yukio Mishima | The Temple of the Golden Pavilion | 2 | 删除重复的开篇行；撤销这次删除一次，再重做并保存。 |
| 06 | Linkin Park | In the End | 1 | 删除三处 #，保留歌词其他内容，然后保存。 |
| 07 | Haruki Murakami | Norwegian Wood | 1 | 用 R 将 thirty-eight 中的 eight 覆盖为 seven，保留句子其余内容，然后保存。 |
| 08 | Italo Calvino | Invisible Cities | 5 | 用 % 配对定位括号（也可用于 d%），将整个括号词组改为 city，保留其余内容并保存。 |
| 09 | Arianne / The End of Evangelion | Komm, süsser Tod | 1 | 在行首补回 I、行末补回 nothing.；从两端进入插入状态并保存。 |
| 10 | Jean-Paul Sartre | No Exit | 1 | 把损坏的整行恢复为：Hell is other people. 然后保存。 |
| 11 | Gabriel García Márquez | One Hundred Years of Solitude | 3 | 将 FIRING SQUAD 转为小写，保留其余文字，然后保存。 |
| 12 | Nirvana | Come as You Are | 2 | 把以 Come 开头的行移回第一行，保留两行内容，然后保存。 |
| 13 | Emily Dickinson | The Chariot / Because I could not stop for Death | 24 | 在第一节之后补回 "We slowly drove, he knew no haste,"；新开一行插入并保存。 |
| 14 | William Blake | The Tiger | 29 | 复制开篇行补回最后一节，并删除 @@ 批注；保留可用的复制内容，然后保存。 |
| 15 | Queen | Bohemian Rhapsody | 1 | 按字符选中 XX 及其后一个空格，删除选区后保存。 |
| 16 | Edgar Allan Poe | The Raven | 125 | 前后翻页检查诗篇，再把移到全文末尾的开篇行放回顶部，最后保存。 |
| 17 | Homer | The Odyssey, Book I | 155 | 去掉 Ulysses 后面的两处 @；用当前单词搜索追踪姓名，然后保存。 |
| 18 | Pink Floyd | Wish You Were Here | 1 | 将两处 wizh 修复为 wish，用 . 重复第一次修改；保留其余内容并保存。 |
| 19 | Franz Kafka | Metamorphosis, Part I | 223 | 用双引号文本对象将问题恢复为 "What's happened to me?"；在 Vim 内打开一次 :help，返回正文后保存。 |
| 20 | Lu Xun | A Madman's Diary, sections I–III (opening) | 79 | 将 i 修复为 I；设置位置标记并按整行选择，去掉第 5–39 行的边栏，然后保存。 |
| 21 | David Bowie | Heroes | 1 | 将四个片段合并为一行，单词间保留一个空格，然后保存。 |
| 22 | Oscar Wilde | The Picture of Dorian Gray, Chapter I | 260 | 将前五行的缩进移回左边界；缩进宽度为 4，使用减少缩进操作后保存。 |
| 23 | Radiohead | No Surprises | 1 | 从另一个窗口中的 reference.txt 取回完整句子；复制后切回本文件，替换残缺行并保存。 |
| 24 | Fyodor Dostoevsky | Notes from Underground, Part I | 343 | 用 Ctrl+v 矩形选择删除每行最左侧四列的 >> 边栏（包括空白段落行），保留正文并保存。 |
| 25 | Leo Tolstoy | Anna Karenina, Part One | 399 | 参照前文将 @@@ 与 ### 恢复为 Alexandrovna。先复制到具名寄存器，再在插入模式用 Ctrl+r 读取寄存器，最后保存。 |
| 26 | Nikolai Gogol | The Mantle / The Overcoat | 504 | 去掉各行外侧的 > 与 <；录制可靠的逐行修复，再回放宏处理全文，最后保存。 |
| 27 | Herman Melville | Bartleby, the Scrivener | 599 | 每处相邻重复单词只保留一份，保留大小写、标点和段落，然后保存。 |
| 28 | Virginia Woolf | Mrs. Dalloway (opening) | 717 | 用 :global（简写 :g）删除标记行开头的 @ 与末尾的 #，保留其他行并保存。 |
| 29 | James Joyce | The Dead, from Dubliners | 802 | 按四位行号恢复升序，再删除每行行号、／ 与后随空格，保留空白段落，然后保存。 |
| 30 | Mary Shelley | Frankenstein, Letter I onward | 1398 | 用 gq 将每段重排至 60 列，连接句子时使用单个空格。保留所有单词及空白段落边界，然后保存。 |
| 31 | Lewis Carroll | Alice's Adventures in Wonderland, Chapters I onward | 950 | 用 :vglobal（简写 :v）删除未标记行，保留带 ／ 标记的行及空白段落；去掉余下边栏与行尾空格，然后保存。 |
| 32 | Robert Louis Stevenson | Strange Case of Dr Jekyll and Mr Hyde | 1068 | 把两处 MrUtterson 修复为 Mr. Utterson；通过确认提示审阅替换，保留其余文字并保存。 |
| 33 | Jorge Luis Borges | Inquisiciones: La encrucijada de Berkeley (opening, pp. 109–112) | 88 | 将 Berkeleey 修复为 Berkeley，去除相邻重复词、数字边栏及行尾空格，再把最后一行移回顶部；保留其余文字和段落边界，然后保存。 |

逐关操作与解法覆盖见 [COVERAGE.md](COVERAGE.md)。正文与修复目标全部保持本轮改版前的字节内容，变更限于初始损坏、任务、提示、操作目标及预算。

## 训练梯度

- 01–08：模式与保存、字符删除／替换、单词移动、整行删除、撤销／重做、行内查找、连续覆盖、配对括号。
- 09–16：行首／行尾插入、整行修改、大小写操作、剪切／粘贴、o/O、复制诗句与保护寄存器、字符选择、翻页与文件两端。
- 17–23：当前单词搜索与双向重复、点号重复、引号文本对象、原生帮助窗口、标记与整行选择、连接、计数缩进、分屏和缓冲区之间复制。
- 24–33：矩形选择、具名寄存器、插入寄存器、宏、正则捕获与反向引用、全局命令与反向选择、数字排序、段落重排、替换确认及综合修复。

部分关卡把训练动作明确写入 Rules，例如撤销／重做、矩形选择、具名寄存器和宏。动作证据由真实 Vim 内部记录；只修好正文而未完成动作目标不会通关。其余关卡以及同一目标内的不同有效做法仍然接受。不会把“熟练使用所有 Vim 功能”作为单次通关能够证明的事实；效率、复习与迁移仍需真实学习者体验检验。

## 按键预算

逐关文本边界检查见 [TEXT-AUDIT.md](TEXT-AUDIT.md)。第 5、7、8、11 关已依据用户提供的完整中文句子重新英译并补齐；其余文学关卡未发现摘录边界造成的半句。原文与译文记录见 `user-provided-passages.json`。

取已验证参考解法中的最短按键数 `k`，计算 `ceil(k × 1.1)`，只向上取整，不再取 5 的倍数。20 次对应 22 次预算，15 次对应 17 次预算，21 次对应 24 次预算。保存命令计入按键；组合键按一次计，宏内部回放不追加物理按键。

这里的“最短参考解法”是当前已知并经真实 Vim 回放的解法，不声称在 Vim 的所有可能写法中证明了全局最优。较慢、超出当前预算的候选不会显示为正式通关解法。更短的玩家解法仍可通关，并可据此进一步校准参考记录。

## 可追溯性与进度

`source-manifest.json` 记录每关作者、作品、原作年代、译者／版本、来源链接、使用依据、目标行数、词数和 SHA-256。长文本另记首尾行；应用中的 Behind the text 展示对应元数据。本轮改版按用户要求从第 1 关重新开始，使用 `vim-workshop.progress.v3`；旧成绩、草稿和提示记录清空，界面语言保留，旧文件无法解锁改版关卡。
