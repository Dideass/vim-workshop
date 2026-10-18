<p align="center">
  <img src="docs/assets/readme-header.svg" alt="VIM WorkShop — 33 关 Vim 编辑挑战，取材于文学与歌词" width="100%">
</p>

<h1 align="center">VIM WorkShop</h1>

<p align="center">
  <strong>把 Vim 用起来。</strong><br>
  33 关文学与歌词编辑挑战，从补回一个词，到处理上千行文本。
</p>

<p align="center">
  <a href="https://dideass.github.io/vim-workshop/"><strong>开始挑战</strong></a>
  &nbsp; · &nbsp; <a href="README.md">English</a> / <strong>简体中文</strong>
  &nbsp; · &nbsp; <a href="docs/DEVELOPMENT.md">开发与部署</a>
</p>

<p align="center">
  <a href="https://github.com/Dideass/vim-workshop/actions/workflows/pages.yml"><img src="https://img.shields.io/github/actions/workflow/status/Dideass/vim-workshop/pages.yml?branch=main&amp;style=flat-square&amp;label=CI&amp;labelColor=3b3b3b" alt="CI status"></a>
  <a href="package.json"><img src="https://img.shields.io/github/package-json/v/Dideass/vim-workshop?style=flat-square&amp;label=version&amp;color=2563eb&amp;labelColor=3b3b3b" alt="Project version"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D22.12-27803a?style=flat-square&amp;logo=node.js&amp;logoColor=dedede&amp;labelColor=3b3b3b" alt="Node.js >=22.12"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-a16207?style=flat-square&amp;labelColor=3b3b3b" alt="MIT license"></a>
  <a href="THIRD_PARTY_NOTICES.md"><img src="https://img.shields.io/badge/Vim-8.2.0055-7c3aed?style=flat-square&amp;logo=vim&amp;logoColor=dedede&amp;labelColor=3b3b3b" alt="Real Vim 8.2.0055"></a>
</p>

<br>

<a href="https://dideass.github.io/vim-workshop/">
  <img src="docs/assets/workshop.png" alt="第 20 关：在 Vim 中编辑《狂人日记》的英文片段" width="100%">
</a>

## 带着问题学 Vim

VIM WorkShop 借鉴了 [Bandit](https://overthewire.org/wargames/bandit/) 的闯关方式：每关给你一段需要修改的文字，以及明确的目标和规则。你可以先动手尝试，遇到困难再查资料、看提示，找到合适的 Vim 操作。

- **真正的 Vim。** 浏览器里运行的是编译为 WebAssembly 的 Vim，支持文本对象、寄存器、宏和 `:help`。在这里练习的操作，也能用在平时的 Vim 中。
- **从入门到进阶。** 从插入、删除和移动光标开始，逐步练习选区、分屏和批量编辑。文本越来越长，任务也越来越丰富；最后一关留给博尔赫斯。
- **目标清楚，解法开放。** 每关列明任务、操作要求和按键上限。满足规则即可通关，无需照着参考答案输入。
- **随时尝试，随时重来。** 可以自由练习、重新开始，也可以逐级查看提示。不计时，不设生命值，通关时会有像素风的庆祝反馈。

**25 段文学选文 · 8 段歌词 · 中英双语界面**  
编辑材料始终为英文。作者、版本和来源可在每关的「文本出处」（Behind the text）中查看。

## 开始使用

[**在线体验**](https://dideass.github.io/vim-workshop/) · 桌面浏览器 + 实体键盘。

无需注册或安装。进度保存在浏览器中，下次打开可以继续；也支持导出、导入 JSON 备份，方便更换设备。

如需本地运行，推荐使用 Node.js 24：

```sh
npm ci
npm run dev
```

[开发与部署（英文）](docs/DEVELOPMENT.md) · [关卡与文本来源](docs/COURSE.md) · [测试记录](VERIFICATION.md)

---

<sub>项目代码采用 <a href="LICENSE">MIT</a> 许可证。文学、歌词及第三方运行组件的版权与许可另见<a href="THIRD_PARTY_NOTICES.md">相关说明</a>。</sub>
