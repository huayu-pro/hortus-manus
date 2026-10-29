# HORTUS MANUS · 指间花园 — 交付说明

> 本地交付版 · 不部署云端 · 不参考/不复用用户现有 3D 网站。
> 运行：`cd /home/huayu/Agent工作区/DSHarness/1/hortus-manus && ./start.sh` → **http://127.0.0.1:8787/**  
> GitHub Pages（静态体验版）：**https://huayu-pro.github.io/hortus-manus/** · Release **v1.0.0**
> 当前本地服务已在 8787 运行；数据在 `data/`，摄像头/照片不上传。

## 1. 一句话

把三支 B 站「手指涂鸦」视频的手势交互、旧作 zip 的翻绳物理、BOTANICA gif 的编辑式植物学气质，做成一座**用手唤醒、采集、分享的数字标本馆**，并配上一套本地全栈（Hono + SQLite + 确定性标本卡/OG/QR + SSR 分享页）。

## 2. 六幕 + 七个模式

**一页式 `/` 六幕**：园门 → 授粉 → 温室 → 田野笔记 → 标本馆 → 版权页。
- 园门：奶油纸 + 巨字 `指间花园` + 真实 PD 牡丹照片 + 17 世纪植物学图版 + 温室读数；`幽灵手`/指针/键盘均可。
- 温室：内嵌活体 Stage，7 模式轨 + 季节 / 摄像头 / FPS；可进全屏 `/touch`。
- 田野笔记：21 关键点解剖、手势语法、制作说明、真实 vitals。
- 标本馆：真实 API 卡片流；空态、筛选、搜索、分享。
- 版权页：夜花园；字体/图版/隐私/致谢 `for Gerard & Claude`。

**七模式**（`frame / tendril / ripple / spore / mycelium / mist / phyllotaxis`）：
花窗（芍药图版圆窗/开合/捏瓣成种）、翻绳（Verlet 5 图案/露珠/嫩芽）、雨池（Monet 水面/涟漪）、孢子（蒲公英钟/吹散/落地发芽）、菌络（21 点菌丝/琥珀节点/桥接）、晨雾（冷凝玻璃/擦雾/压花+手写）、花冠（黄金角/落瓣）。
键盘 `1–7`、`Q/W/E/R`、`X` 换季、`C` 清屏、`G` 幽灵手、`S` 声音、`F` 采集、`Esc` 退出；双拳切模式。

**无摄像头完整可玩**：幽灵手自动演出、指针、双指、键盘；`/touch` 里摄像头是“把手借给花园”的仪式，拒绝/无设备自动回落。

## 3. 本地全栈

```
apps/web     Vite + React 19 + TS + Three.js + Canvas2D + MediaPipe
apps/api     Hono + better-sqlite3 (WAL) + zod + @napi-rs/canvas + qrcode
packages/shared  types / modes / seasons / PRNG / copy
packages/art     deterministic card / OG / QR / fonts
research/        视频/gif/zip/77 站/REA/50 techniques/素材许可
screens/         最终截图 + demo mp4/gif
data/            SQLite + cards（.gitignore）
```

- **采集**：`POST /api/specimens`（匿名、限流、HMAC 删除 token）→ `specimen.id` → 确定性卡片/OG/QR；前端 localStorage 存 delete token。
- **分享**：`/api/specimens/:id/card.png`（1200×1600，immutable）、`og.png`（1200×630）、`qr.png?size=320`；`/s/:id` SSR 独立 HTML（OG/Twitter/JSON-LD/canonical/QR）。
- **性能**：SQLite WAL + 预编译 + ETag/304 + 60–300s 缓存 + 卡片缓存；入口 JS **89.74KB gzip**，引用 **281KB raw**；引擎/MediaPipe/three 懒加载（GardenEngine **160.92KB gzip**）。
- **隐私**：只在用户手势后开摄像头；不录、不传、不存；数据只在本机。

## 4. 研究硬账（全部可复核）

| 项 | 数量 / 结果 |
|---|---|
| B 站视频 | 3 支全部下载；**3093 帧**逐帧解码（884 / 1251 / 958）；83 张证据帧 + 接触表/差分/UI 条带 |
| BOTANICA gif | 154 帧全解；版式/字体/交互/12 条美术规则 |
| 翻绳 zip | 1049 行源码拆解；Verlet + 5 图案 + 迁移方案 |
| One Page Love | **77 站**（目标 50）；77×2 截图 + HTML/headers + 技术指纹；`atlas.md/csv/json` |
| REA | **10 完整 + 1 部分**（目标 10）；inspect/capture/export/analyze + limitations |
| 技术矩阵 | **50 条**可转化技术（表格 62 行含表头/分组），逐条映射 A/B/C/D/E 创新 ID |
| 素材 | **17 张** PD/CC-BY 研究素材 + 5 张 PD 产品图版；`ASSET-LICENSES.md` |
| 校验 | `node research/check.mjs` → **14/14 PASS** |

研究只看机制/版式/技术，不复制第三方品牌/文案/资产；第三方截图只作本地研究，不随产品分发。

## 5. 55 项创新（证据索引）

完整逐项映射：`docs/design/innovation-visibility.md`（55 项 → 路由/组件/`data-hm` 证据/验收判据）、`docs/contract.md §5`。
交付验收中重点可见的 12 项（Tier-1）：A1 字标、A2 活体图版、A3 字体系统、A4 季节色、A5 纸→露水、B1 花窗、B2 芍药开合、B11 幽灵手、B12 三路输入、B13 隐私仪式、C1 六幕章节轨、D8 活时钟。
其余 43 项分在 A6–A12、B3–B10/B14–B15、C2–C12、D1–D7、E1–E8。截图证据在 `screens/desktop`、`screens/touch`、`screens/mobile`、`screens/share`。

## 6. 验收结果

| 项 | 结果 |
|---|---|
| axe (wcag2a/aa) | **0 violations**：`/` `/touch` `/herbarium` `/field-guide` `/nope` |
| API smoke | **93/93 PASS**（`docs/api-smoke.txt`，含 create/thanks/delete/ETag/rate/card/og/qr/share） |
| 7 模式 | 7/7 渲染 + 采集；1440/390 截图零 console error |
| 假摄像头 | `/touch` 相机 ritual → 2 hands detected → `相机 已就绪`（headless SwiftShader 2fps，真实 GPU 目标 60fps） |
| 响应式 | 390/768/1280/1440/1920 无横向溢出；移动端 FRAME 圆窗 |
| reduced-motion | 全终态、无循环动画；截图 `screens/...` |
| 运行时 | 自托管字体/模型/wasm，无 CDN、无外网请求 |

已知限制：
- Headless SwiftShader 下 FPS 仅 1–16，不代表真实 GPU；真实 GPU 由质量 governor 目标 60fps。
- 摄像头真实画面/权限行为需在带摄像头的浏览器手工体验；无摄像头炉石手完整可玩。
- Safari/Firefox 只做优雅回退，未做逐浏览器像素验收。
- 研究 REA 部分站点受 CDP/反爬限制，已在 `research/rea/*/*.LIMITATION` 记录。

## 7. 文件索引

- 运行与结构：`README.md`、`start.sh`、`apps/api/docs`（`docs/api.md`）
- 设计：`docs/design/art-direction.md`、`wireframes.md`、`motion-sound.md`、`component-inventory.md`、`copy-deck.md`、`innovation-visibility.md`、`comp/`
- 契约：`docs/contract.md`
- 研究：`research/README.md`、`research/check.mjs`、`research/references/atlas.md`、`research/rea/REA-SUMMARY.md`、`research/techniques.md`
- 证据：`docs/api-smoke.txt`、`docs/qa/qa-report.md`、`screens/`
- Demo：`screens/demo/hortus-manus-demo.mp4` / `.gif`

## 8. 如何继续

```bash
cd /home/huayu/Agent工作区/DSHarness/1/hortus-manus
./start.sh                 # build + 本地 8787
pnpm db:reset              # 清标本/卡（保留 .secret）
pnpm -F @hortus/web dev    # 5180，API 8787
node research/check.mjs    # 研究硬指标
```

> 这是本地实验，不部署、不联网生长、不替用户保管手。以手为土，以息为风。