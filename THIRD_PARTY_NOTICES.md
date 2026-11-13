# 素材与依赖说明

本表说明本目录包含的内容及来源。项目所有者于 2026-11-13 明确确认这是其个人原创项目；自有源码、品牌、图标与活动背景按此确认采用根目录的 MIT License，版权署名为 `Copyright (c) 2026 MiniZone`。

| 范围 | 来源与范围 | 许可 |
| --- | --- | --- |
| `index.html` | MiniZone 历史单文件前端；复制来源及历史版本限制见 `README.md` | MIT |
| `assets/brand/*`、`favicon.png` | 随历史页面整理的 MiniZone 品牌文件；原始尺寸及派生方式见 `assets/brand/README.md` | MIT |
| `app-icons/*.svg`、`app-icons/*.png` | 历史页面配套的 10 组图标；SVG 为内联矢量路径 | MIT |
| `activity-background.png` | 历史活动背景图 | MIT |
| `scripts/*.cjs` | 本次整理补充的无依赖 Node.js 工具 | MIT |

`index.html` 使用系统字体和浏览器原生 API，没有引用远程脚本、字体或 npm 前端库。品牌 SVG 可能内嵌本地 PNG 数据。

`package.json` 只用于本地命令，无 npm 依赖。Node.js 和浏览器由使用者自行安装，未作为本项目的二进制依赖重新分发。

当前未识别出需要单独附带许可证的第三方源码或素材；若后续引入第三方内容，应在本文件中记录其准确来源、许可及署名，保留原许可文本。MIT License 不授予以 MiniZone 品牌暗示官方身份或背书的权利。
