<p align="center">
  <img src="docs/assets/readme-header.svg" alt="VIM WorkShop — 33 literary editing challenges in real Vim" width="100%">
</p>

<h1 align="center">VIM WorkShop</h1>

<p align="center">
  <strong>Learn Vim by fixing pages.</strong><br>
  33 challenges in real Vim, built around literature and lyrics.
</p>

<p align="center">
  <a href="https://dideass.github.io/vim-workshop/"><strong>Enter the workshop ↗</strong></a>
  &nbsp; · &nbsp; <strong>English</strong> / <a href="README.zh-CN.md">简体中文</a>
  &nbsp; · &nbsp; <a href="docs/DEVELOPMENT.md">Build & deploy</a>
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
  <img src="docs/assets/level-cleared.png" alt="A repaired passage from A Madman’s Diary, with the pixel level-cleared stamp" width="100%">
</a>

## A task before a technique

You get a damaged passage, a goal and a few rules. Work out how to repair it.
Inspired by [Bandit](https://overthewire.org/wargames/bandit/), the workshop gives you a reason to look up a command and try it, instead of handing you another command to memorize.

- **Real Vim.** Motions, text objects, registers, macros and `:help` run in Vim itself, compiled to WebAssembly.
- **A growing challenge.** Start with a missing word; move into selections, windows and edits across hundreds of lines. The final ten levels go further. Borges closes the workshop.
- **Room to find your route.** Public rules and key budgets shape each problem. Valid alternatives count; the hint is one possible route.
- **Practice without pressure.** Explore freely, restart cleanly, or open three stages of hints. No timer. No lives. A small pixel celebration when the page is repaired.

**25 literary passages · 8 lyric interludes · English / 中文 interface**  
The editing texts stay in English. Authors, editions and sources live in *Behind the text*.

<details>
<summary><strong>01 / Start with one missing word</strong></summary>
<br>
<img src="docs/assets/first-page.png" alt="The first level: restore one missing word, with no key budget" width="100%">
</details>

<br>

## Open a page

[**Play in your browser →**](https://dideass.github.io/vim-workshop/) · Desktop browser + physical keyboard.

No account or installation. Progress stays in your browser; export a JSON backup to take it elsewhere.

To run locally with Node.js 24:

```sh
npm ci
npm run dev
```

[Development & deployment](docs/DEVELOPMENT.md) · [Course & sources](docs/COURSE.md) · [Verification](VERIFICATION.md)

---

<sub>Application code: <a href="LICENSE">MIT</a>. Literary selections and bundled runtimes retain their respective rights; see <a href="THIRD_PARTY_NOTICES.md">source & licence notes</a>.</sub>
