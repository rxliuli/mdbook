# mdbook

一个基于 pandoc 的 markdown => epub 的构建工具。

## 使用

```sh
pnpm i @liuli-util/mdbook
#根据 readme.md 构建 epub 书籍到 dist/ 目录下
mdbook build
```

## 配置

书籍配置写在 _readme.md_ yaml 元数据中，形如

```md
---
title: 第一卷 量子纠缠
author: Hieronym
rights: CC BY-NC-SA
description: 丘比承诺说人类总有一天也能到达那遥远的星空。但它们很明智地没有说出来，人类将会在那里遇到什么。
language: zh-CN
cover-image: './assets/cover.png'
sections:
  - 001-第一章-许愿.md
  - 002-第二章-幻影.md
  - 003-第三章-麻美观影记-上.md
  - 004-第四章-麻美观影记-下.md
  - 005-第五章：家人.md
  - 006-第六章-军队.md
  - 007-第七章-南方组.md
  - 008-第八章-政与教.md
  - 009-第九章-回声.md
  - 010-第十章-准将.md
  - 011-第十一章-以往生活的残骸.md
  - 012-第十二章-狩猎魔兽的人.md
  - 013-第十三章-不对等的信息.md
  - 014-第十四章-血缘.md
  - 015-第十五章-萨姆萨拉.md
  - 016-第十六章-属于天空的光芒.md
---

“上帝是不玩骰子的”

—— 阿尔伯特・爱因斯坦最常被引用的一句名言
```
