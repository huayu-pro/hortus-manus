# HORTUS MANUS v1.0.0 · 指间花园

A living herbarium for your hands. 一座只在你手中生长的数字标本馆。

## 这次交付

- **六幕编辑式首页**：园门 / 授粉 / 温室 / 田野笔记 / 标本馆 / 版权页
- **七个手部模式**：花窗 FRAME / 翻绳 TENDRIL / 雨池 RIPPLE / 孢子 SPORE / 菌络 MYCELIUM / 晨雾 MIST / 花冠 PHYLLOTAXIS
- **无摄像头完整可玩**：幽灵手、指针、双指、键盘；摄像头按“把手借给花园”仪式开启，画面不录、不传、不存
- **本地全栈**：Hono + SQLite + 确定性标本卡/OG/QR + SSR `/s/:id` 分享页；采集→归档→分享→删除闭环
- **GitHub Pages 静态版**：静态种子数据 + localStorage 采集 + HashRouter，完整保留 Home / Touch / Herbarium / Field Guide / Share UI

## 硬指标

- 3 支 B 站视频：**3093 帧**逐帧解码 + 83 证据帧 + 逐模式/UI/手势/日志拆解
- BOTANICA gif：**154 帧**拆解；翻绳 zip：**1049 行**源码拆解
- One Page Love：**77 站**截图/技术指纹；REA：**10 完整 + 1 部分**证据
- 技术矩阵：**50 条**；创新：**55 项**
- API smoke：**93/93 PASS**；axe wcag2a/aa：**0 violations**
- 初始包：**89.74KB gzip**；GardenEngine 懒加载 160.92KB gzip

## 链接

- GitHub Pages: https://huayu-pro.github.io/hortus-manus/
- 本地完整版：`./start.sh` → http://127.0.0.1:8787/
- 交付说明：`docs/DELIVERY.md`；QA：`docs/qa/qa-report.md`；创新证据：`docs/qa/innovation-evidence.md`

## 说明

GitHub Pages 版是静态展示/体验版：种子标本与卡片随站点打包，用户采集保存在浏览器 localStorage；完整 API/SQLite/SSR 分享页请在本地运行完整版。研究用的第三方视频/截图/大体积帧不随仓库分发，研究方法和文档在 `research/`。

— HORTUS MANUS · 以手为土，以息为风。
