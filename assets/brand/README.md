# 品牌资源

更新：2026-09-30。1254×1254两张原图原样保存：logo-transparent.png=RGBA，logo-white.png=RGB。SVG仅嵌入原PNG并裁定展示窗口，不重绘或改颜色。

| 文件 | 使用位置 |
|---|---|
| mark-transparent.svg | 小M/轨道/星标：认证、重置、发现、玻璃条、原主站 |
| wordmark-transparent.svg | 原图minizone字样：替代品牌标题的系统字体；与M分开布局 |
| mark-white.svg | favicon、错误兜底 |
| wordmark-white.svg | 需要白底的文字标记 |
| logo-white.svg | 完整品牌：关于页 |
| logo-white.png | Apple touch/旧PNG地址兼容 |

窗口：透明标记130 225 1010 635；白底标记190 250 890 580；完整白底190 250 890 760；透明字130 860 1010 190；白底字190 830 890 175。用contain，不拉伸，不在透明场景叠旧白色圆角底或投影。版权、页面标题、无障碍名称仍为文本。

appweb/assets/mz-icon.png与原主站favicon.png/mz-icon.png/logo.png已换白底兼容图；minizone-server/public/assets/brand及旧appweb-next兼容资产已更新。

Android source：Manifest指向@mipmap/mz_launcher；API26+透明前景配白底，legacy白底；启动图API23+居中完整品牌，API22纯白。未改生成物、未升版本/构建APK。

beta静态包已同步。原主站public/、next_entry.js和Android分别发布；beta脚本不会自动更新它们。原图不手工抠图或改字形，更新需同步派生SVG及对应缓存标记。
