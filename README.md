# mdbook

mdbook 是一个用于处理 epub 电子书的工具集，主要希望实现以下目标。

- 提供低层次的 sdk 用以生成和解析 epub 文件
- 提供高层次的 cli 用以从 markdown 生成书籍
  - 使用 markdown-it 渲染 markdown 为 html 并支持其插件系统
- 提供书籍的预览功能
- 使用 typescript 完成并支持在浏览器、nodejs 使用
- 基于上面的这一切开发在线书籍编辑器
