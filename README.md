# HORTUS MANUS · 指间花园

> A living herbarium for your hands. 一座只在你手中生长的数字标本馆。
> **本地交付，不部署云端**；不参考/不复用用户现有 3D 网站。

## 现在就能开

```bash
cd /home/huayu/Agent工作区/DSHarness/1/hortus-manus
./start.sh
# http://127.0.0.1:8787/
```

当前本地服务已在 `http://127.0.0.1:8787/` 运行；数据在 `data/`，摄像头画面不上传/不写盘。

开发：

```bash
pnpm install
pnpm dev        # web http://127.0.0.1:5180 + api 127.0.0.1:8787
pnpm db:reset   # 清标本/卡（保留 data/.secret）
```

## 是什么

- `/` — 六幕编辑式体验：园门 / 授粉 / 温室 / 田野笔记 / 标本馆 / 版权页。
- `/touch` — 全屏手部温室：7 模式 `FRAME / TENDRIL / RIPPLE / SPORE / MYCELIUM / MIST / PHYLLOTAXIS`；摄像头可选，指针/双指/键盘/幽灵手全可玩。
- `/herbarium` — 真实本地采集归档，模式/季节/搜索/排序/分页。
- `/field-guide` — 21 关键点解剖、5 手势、制作说明、真实 vitals。
- `/s/:id` — 本地 API SSR 分享页：OG/Twitter/JSON-LD + 标本卡 + QR。
- `/api/*` — 本地 Hono + SQLite（标本/致谢/每日 edition/卡片/OG/QR/health）。

## 硬指标（可复核）

| 项 | 结果 |
|---|---|
| 3 支 B 站视频 | 下载 + **3093 帧**逐帧解码 + 83 证据帧 + 逐模式/UI/手势/日志文档 |
| BOTANICA gif | **154 帧**拆解 + 12 条美术规则 |
| 翻绳 zip | **1049 行**源码拆解 + 5 图案迁移 |
| One Page Love | **77 站**（目标 50）截图/指纹/atlas |
| REA | **10 完整 + 1 部分**（目标 10） |
| 技术矩阵 | **50 条**可转化技术 |
| 创新 | **55 项**（Tier-1 12 项） |
| API smoke | **93/93 PASS** |
| axe wcag2a/aa | **0 violations**（5 页） |
| 研究校验 | `node research/check.mjs` → **14/14 PASS** |
| 初始包 | **89.74KB gzip**；引擎 lazy 160.92KB gzip |

完整交付说明：[`docs/DELIVERY.md`](docs/DELIVERY.md) · QA：[`docs/qa/qa-report.md`](docs/qa/qa-report.md) · 创新证据：[`docs/qa/innovation-evidence.md`](docs/qa/innovation-evidence.md) · 契约：[`docs/contract.md`](docs/contract.md)

## 截图 / Demo

- 首屏：[`screens/desktop/home-hero-1440.png`](screens/desktop/home-hero-1440.png)
- 温室：[`screens/desktop/home-greenhouse-1440.png`](screens/desktop/home-greenhouse-1440.png)
- 手部温室：[`screens/touch/touch-frame-1440.png`](screens/touch/touch-frame-1440.png)
- 采集成功：[`screens/touch/collect-success-1440.png`](screens/touch/collect-success-1440.png)
- 标本馆：[`screens/desktop/herbarium-1440.png`](screens/desktop/herbarium-1440.png)
- 分享页：[`screens/share/share-1440.png`](screens/share/share-1440.png)
- 手机：[`screens/mobile/home-390.png`](screens/mobile/home-390.png) / [`touch-390.png`](screens/mobile/touch-390.png)
- Demo：[`screens/demo/hortus-manus-demo.mp4`](screens/demo/hortus-manus-demo.mp4)（[gif](screens/demo/hortus-manus-demo.gif)）


## GitHub

- Repository: https://github.com/huayu-pro/hortus-manus
- Release: https://github.com/huayu-pro/hortus-manus/releases/tag/v1.0.0
- **GitHub Pages（静态体验版）**: https://huayu-pro.github.io/hortus-manus/

> Pages 版使用 `HashRouter` + `public/api` 静态种子数据 + localStorage 采集；完整 SQLite/SSR/API 版本仍在本地 `./start.sh`。

## 结构

```
apps/web      Vite + React 19 + TS + Three.js + Canvas2D + MediaPipe
apps/api      Hono + better-sqlite3 + zod + @napi-rs/canvas + qrcode
packages/shared  types / modes / seasons / PRNG / copy
packages/art     deterministic card / OG / QR / fonts
research/      video/gif/zip/77 站/REA/50 techniques/assets
docs/          contract/design/delivery/qa/api
screens/       final shots + demo
data/          SQLite + cards (gitignored)
```

## 说明

- 摄像头只在用户点“把手借给花园”并允许后开启；画面不录、不传、不存。
- 7 模式在无摄像头/拒绝权限时由幽灵手演出，全部可玩。
- 素材：产品仅 PD/CC0/OFL；研究第三方截图只用于本地研究。见 [`ASSET-LICENSES.md`](ASSET-LICENSES.md)。
- 本地实验：不部署、不联网生长、不替用户保管手。

> 以手为土，以息为风。 / Your hands are the weather.