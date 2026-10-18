# Third-party components and literary sources

The application code is MIT licensed. The following materials retain their own
licenses or public-domain status.

## Runtime

- **Vim 8.2.0055 / vim-wasm 0.0.13** — Vim license (charityware).
  Copyright Bram Moolenaar and Vim contributors; WebAssembly port by rhysd.
  Source: https://github.com/rhysd/vim.wasm (wasm branch).
  Reproducible binary package: https://www.npmjs.com/package/vim-wasm/v/0.0.13.
  No Vim binary patches are applied by this application. The exercise vimrc is
  application configuration. Matching official English help (139 files from
  vim/vim tag v8.2.0055, runtime/doc) is shipped locally as `public/vim-help.json`
  under the same Vim licence. Practice mappings record actions and return the
  native commands unchanged. The full upstream notice is shipped as
  `public/licenses/vim.txt` and included in the runtime's `:help license`.
- **coi-serviceworker 0.1.7** — MIT; copyright 2021 Guido Zuidhof.
  https://github.com/gzuidhof/coi-serviceworker.
  Its license is copied to `public/licenses/coi-serviceworker.txt` at build time.
- **React / React DOM** — MIT; copyright Meta Platforms, Inc. and affiliates.
  https://github.com/facebook/react. License texts are copied to
  `public/licenses/react.txt` and `public/licenses/react-dom.txt` at build time.

Build/test dependencies are recorded in package-lock.json and are not shipped
as runtime dependencies of the static site.

## Literary text and song quotations

The 33-level course uses 25 literary sources and eight brief lyric quotations.
The full per-level attribution, edition, translator, URL, excerpt checksum and
use basis are in `docs/source-manifest.json` and the in-app Behind the text panel.

Most long excerpts use early original or translated editions in the public
domain in the United States. No claim is made about every jurisdiction. Later
translations do not inherit the status of an older original. Excerpts retain
their original words, with declared punctuation normalization and line reflow.
Exercise damage is generated separately and is not an authoritative edition.

Modern literary and song sources are represented by brief quotations only;
their original copyrights remain with their respective holders. Levels 5, 7, 8
and 11 are workshop English translations of complete Chinese sentences supplied
by the user; they are not attributed to published English translators. The application
MIT licence does not license those works or their full lyrics. This course does
not claim that attribution, free distribution or an online copy grants a full-text
redistribution licence.

**Franz Kafka, Metamorphosis, David Wyllie English translation (2002):** this
translation is expressly identified as copyrighted and made available under the
Project Gutenberg terms. The unmodified source with its full notice and licence
is included at `public/sources/kafka-5200.txt` (deployed as `sources/kafka-5200.txt`).
Source: https://www.gutenberg.org/ebooks/5200 . It is not relicensed under MIT.

**Workshop translations:** the Lu Xun and Borges selections are newly rendered
from the identified early Chinese and Spanish originals, not copied from modern
English translations. The very short Wang Xiaobo rendering is explicitly a
workshop translation of a short Chinese clause, not Yan Yan's published version.
The project's own translation contributions and editing-damage definitions are
offered under CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/ .
This does not change any underlying source rights.

The prior twelve-level course's original miniatures and bonus variants are no
longer part of the active course.
