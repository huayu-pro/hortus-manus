# HORTUS MANUS · 指间花园 — 项目契约 v1

> 唯一权威：本文件 + `docs/design/**` + 各 owner 交付。遇到冲突以本文 §1/§2 为准。
> **本地交付，不部署云端；完全不参考/不复用用户现有 3D 网站的任何代码、素材、设计、配置。**
> 工作目录：`/home/huayu/Agent工作区/DSHarness/1/hortus-manus/`

## 1. 一句话与不可妥协

把 B 站三个「手指涂鸦」视频的交互机制、`research/cats-cradle` 的翻绳物理、`research/botanica-gif` 的编辑式植物学气质，做成一座能用手唤醒、采集、分享的**数字标本馆**：`HORTUS MANUS / 指间花园`。

不可妥协：
1. **一眼可见**：首屏 3 秒内出现活的植物舞台 / 新品牌字体 / 新色彩 / 新叙事；不是静态卡片页。
2. **不接摄像头也能玩**：指针/双指触屏/键盘/幽灵手全模式可用；接摄像头后 7 模式全开。
3. **清新自然**：奶油纸、苔绿、芍药粉、花粉金、水汽；禁止霓虹紫蓝、玻璃拟态、通用 SaaS 圆角、无意义 3D 球、粒子大杂烩。
4. **真后端**：本地 Hono + SQLite，采集→归档→分享页→OG/QR 全链路可用；不是假数据。
5. **本地优先**：`./start.sh` → `http://127.0.0.1:8787/`；运行时无外网依赖；摄像头画面不上传。
6. **研究硬账**：3 视频逐帧、gif 154 帧、zip 源码、50+ OPL 站、10+ REA、50 条技术映射、55 创新。

## 2. 品牌与叙事

- `HORTUS MANUS`（手之花园）· 中文 `指间花园`
- 副题 `A LIVING HERBARIUM FOR YOUR HANDS`
- 主张 `以手为土，以息为风。 / Your hands are the weather.`
- 四幕：**园门 → 授粉 → 温室 → 标本馆**；最后是版权页/colophon。
- 三个词：**触觉 / 标本 / 气候**。
- 文案中文优先、英文对照；诗性但准确，不用 lorem，不伪造数据。
- 隐藏致意：夜空的 O'Neill 圆柱、RIPPLE 的莫奈睡莲、尾页 `for Gerard & Claude`；可发现，不喧宾夺主。

## 3. 路由

| 路由 | 内容 |
|---|---|
| `/` | 一页式：园门 / 授粉 / 温室 / 田野笔记 / 标本馆 / 版权页，六幕滚动 |
| `/touch` | 全屏手部温室：7 模式、摄像头、季节、声音、采集、退出 |
| `/field-guide` | 手势图鉴、21 点解剖、制作方法、实时性能 |
| `/herbarium` | 采集归档：模式/季节筛选、搜索、排序、卡片预览 |
| `/s/:id` | 本地 API SSR 分享页：meta/OG/Twitter/JSON-LD + 标本卡 + QR |
| `*` | 404：`这株标本还没有被压进纸里` |

## 4. 七种模式（ModeId 固定）

| ModeId | 中文/英文 | 来源 | 核心交互 | 采集母题 |
|---|---|---|---|---|
| `frame` | 花窗 / FRAME | 视频「漫画框」 | 双手框出花窗，开掌开瓣、握拳回苞、捏瓣成种 | 芍药/窗 |
| `tendril` | 翻绳 / TENDRIL | zip + 视频「全开花纹」 | 21 点 Verlet 丝线 + 5 图案；露珠、嫩芽 | 绳结/藤 |
| `ripple` | 雨池 / RIPPLE | 视频「涟漪」 | 指尖触水成涟漪；莫奈睡莲色 | 睡莲/涟漪 |
| `spore` | 孢子 / SPORE | 视频「超新星」握拳 | 握拳吹蒲公英、开掌接、落地发芽 | 蒲公英 |
| `mycelium` | 菌络 / MYCELIUM | 视频「双手桥接+星座网」 | 双掌间长菌丝网络；呼吸/心跳脉冲 | 菌络/根 |
| `mist` | 晨雾 / MIST | 视频「冰雾」 | 擦冷凝玻璃，露出压花/手写；雾会回来 | 压花/水汽 |
| `phyllotaxis` | 花冠 / PHYLLOTAXIS | 视频「螺旋星系」 | 黄金角花瓣螺旋；转手旋转、开合缩放 | 螺旋/花冠 |

手势语法：`frame / open / pinch / fist / weave`；带滞回、置信度、停留去抖。双拳切模式（致敬视频）。键盘 `1–7`、兼容 `Q/W/E/R`、`D` 视图、`C` 清屏、`X` 换季、`S` 声音、`G` 幽灵手、`?` 帮助、`Esc` 退出。

## 5. 55 项创新（完整编号，验收时逐项给证据）

### A 视觉/品牌（12）
A1 ★ 自绘藤蔓字标；A2 ★ 活体图版首屏；A3 ★ 新编辑字体系统；A4 ★ 四季节气色板；A5 ★ 纸→露水转场；A6 水彩/咬墨 shader；A7 12–20 张有出处的植物图版；A8 黄铜放大镜光标；A9 边注系统；A10 ★ 植物学检索表模式轨；A11 夜花园；A12 `press F to press a flower`。

### B 手部交互/引擎（15）
B1 ★ 指尖花窗；B2 ★ 芍药开合；B3 ★ 翻绳藤蔓 + 5 图案；B4 ★ 雨池涟漪；B5 孢子吹散；B6 菌络桥接；B7 晨雾擦窗；B8 花冠螺旋；B9 手势语法；B10 One Euro + 预测 + 21 点解剖；B11 ★ 幽灵手自动演出；B12 ★ 指针/双指/键盘全平价；B13 ★ 隐私仪式；B14 种子式采集；B15 摄像头视图三态 + 清屏。

### C 叙事/信息/IDX（12）
C1 ★ 四幕叙事 + 章节轨；C2 双语编辑文案；C3 每日一株；C4 田野笔记；C5 ★ 标本馆筛选/搜索；C6 ★ 分享页 SSR/OG；C7 标本卡分类学；C8 ⌘K 指令抽屉；C9 隐藏致意；C10 404/离线；C11 下一朵路标；C12 真实花园公告条。

### D 动效/声音/微交互（8）
D1 ★ 墨/花瓣转场；D2 ★ 滚动编排；D3 字体入场；D4 磁吸/藤蔓/印章/透镜；D5 生成式声景；D6 移动轻触觉；D7 微反馈；D8 ★ 活时钟。

### E 本地后端/工程（8）
E1 Hono+SQLite WAL/ETag/304/gzip/LRU；E2 确定性卡片/OG（@napi-rs/canvas + QR）；E3 匿名采集 + HMAC 删除 token + 限流 + zod；E4 全部自托管、0 外网运行时；E5 PWA/离线；E6 性能预算 + 自适应；E7 隐私/安全（CSP、localhost、无上传）；E8 健康检查/迁移/seed/reset/start.sh/README。

**可见性预算**：★ 12 项首屏/前两屏可见；B/D 组前 3 次交互可见；E 组通过一次采集→刷新→分享全链路可见。每项在 `docs/contract.md` 末尾或 `docs/qa/` 有证据（截图/DOM/接口）。

## 6. 视觉系统（atelier 细化，其他 owner 遵守）

- 色：`paper #F6F1E7` / `paper-deep #EDE5D6` / `ink #1C211A` / `ink-soft #5D6658` / `moss #4A5A42` / `sage #8A9A7B` / `leaf #6F875F` / `peony #C97F7F` / `blush #E8C4BE` / `pollen #D8A84E` / `mist #C9D8D0` / `pond #5E7F78` / `night #111A14` / `moon #E8E3CF`。
- 字：Instrument Serif（拉丁展示）+ Cormorant（斜体/软性）+ Noto Serif SC（中文标题）+ Noto Sans SC（正文）+ IBM Plex Mono（标签/读数）+ Ma Shan Zheng 子集（手写，仅田野笔记/引线/落款）。
- 布局：12 列不对称、最大 1520、巨幅留白、出血图版、竖排边注、folio/坐标/色标/图版号；禁止通用卡片网格。
- 材质：纸纤维/咬墨/毛边/露珠/玻璃/摄影颗粒；CSS/SVG/WebGL 生成，不新增无意义位图。
- 动效：慢而重；花开 1.2–2.4s；只用 transform/opacity/clip-path/filter；一次性入场，不无限扫光；reduced-motion 全终态。
- 声音：WebAudio 合成（风/水/丝弦/五声音阶），默认静音，手势启动，可持久化；不自动播放。
- 禁止：霓虹、紫蓝渐变、玻璃拟态、通用 SaaS 圆角、emoji 当图标、伪造数据、假 loading、10px 以下文字、无意义 3D 球/粒子。

## 7. 技术栈与本地架构

```
hortus-manus/
  apps/web      Vite + React 19 + TS + Tailwind v4 + shadcn(Radix) + Motion + 自写 Three.js/Canvas 引擎
  apps/api      Hono + @hono/node-server + better-sqlite3 + zod + @napi-rs/canvas + qrcode
  packages/shared  types / modes / seasons / prng / copy
  packages/art     确定性标本卡 + OG 绘制（前端 Canvas2D / 服务端 @napi-rs/canvas 共用）
  research/     视频/gif/zip/atlas/REA/技术映射/素材
  docs/         contract/design/qa/api
  data/         SQLite + cards/OG（.gitignore）
  screens/      验收截图/演示
```
- Web 端口 5173（dev）；API 8787；生产本地 `pnpm start` 由 API 服务 `apps/web/dist`。
- 引擎/MediaPipe/three 懒加载；初始 ≤300KB gz。
- MediaPipe：`@mediapipe/tasks-vision` 0.10.17；模型 `hand_landmarker.task` 与 wasm 自托管。
- 后端数据只存 seed/mode/season/caption/created_at 等元数据；卡片/OG 确定性生成，不存用户图片。
- 分享页 SSR（独立 HTML，不依赖 SPA）；OG/Twitter/JSON-LD；QR 指向 `http://127.0.0.1:8787/s/:id`。
- 无账号、无 PII、无摄像头录像/上传；删除 token 存 localStorage。
- 不使用云端；不创建/修改任何线上资源。

## 8. 数据与 API

```sql
specimens(id TEXT PK, mode TEXT, season TEXT, seed INTEGER, caption TEXT, lang TEXT,
          client_hash TEXT, thanks INTEGER DEFAULT 0, created_at TEXT, is_public INTEGER,
          delete_token_hash TEXT)
thanks(specimen_id TEXT, visitor_hash TEXT, created_at TEXT, PRIMARY KEY(specimen_id, visitor_hash))
editions(date TEXT PK, seed INTEGER, mode TEXT, season TEXT, note TEXT)
telemetry(day TEXT, mode TEXT, event TEXT, count INTEGER, PRIMARY KEY(day, mode, event))
```

| 方法 | 路径 | 缓存 |
|---|---|---|
| POST | `/api/specimens` | no-store |
| GET | `/api/specimens?limit&cursor&mode&season&q&sort` | ETag + 15s |
| GET | `/api/specimens/:id` | ETag + 60s |
| DELETE | `/api/specimens/:id` | no-store |
| POST | `/api/specimens/:id/thanks` | no-store |
| GET | `/api/specimens/:id/card.png` | immutable |
| GET | `/api/specimens/:id/og.png` | immutable |
| GET | `/api/edition/today` | 到当日结束 |
| GET | `/api/stats` | 60s |
| GET | `/api/health` | no-store |
| GET | `/s/:id` | SSR HTML no-cache |

## 9. 研究硬指标（scout 负责）

1. `research/videos/*.mp4` 全帧解码（每帧落盘 + 场景差分选关键帧）；`research/video-teardown/finger-doodle.md` 逐模式/逐 UI/逐手势/逐日志；证据帧 ≥30。
2. `research/botanica-gif/teardown.md`（154 帧）；`research/cats-cradle/teardown.md`（源码 + Verlet + 5 图案）。
3. `research/references/atlas.md` + `atlas.csv`：**≥50 站**，每站截图（桌面 + 移动）、技术指纹、3 条可感知手法、1 条可转化技术；目标 55。
4. `research/rea/`：**≥10 站** REA 证据（inspect/export/analyze/capture），每站有 summary + 原始 JSON/命令；失败记录 limitation。
5. `research/techniques.md`：**50 条可转化技术** → 映射到 A/B/C/D/E 创新 ID。
6. `ASSET-LICENSES.md` + `research/assets/`：12–20 张 PD/CC0 植物素材，含 URL/license/author；产品使用清单。
7. `research/check.mjs`：自动校验上述数量/文件存在；输出清单。

## 10. 目录/写域（多 agent 防冲突）

- `scout`：`research/**`、`ASSET-LICENSES.md`
- `atelier`：`docs/design/**`、`apps/web/src/styles/tokens.css`、`base.css`、`packages/shared/src/copy.ts`
- `mechanics`：`apps/web/src/engine/**`、`apps/web/src/hands/**`、`apps/web/src/components/stage/**`、`apps/web/public/{models,wasm,fixtures}/`、`apps/web/lab.html` + `apps/web/src/lab-main.tsx`（开发实验室）
- `stage`：`apps/web/src/pages/**`、`apps/web/src/components/{shell,editorial,archive,ui}/**`、`apps/web/src/styles/{sections,ui}.css`、`apps/web/src/lib/i18n*`
- `server`：`apps/api/**`、`packages/art/**`、`server/**`、`scripts/**`
- `verifier`：`tests/**`、`tools/verify/**`、`docs/qa/**`、`screens/**`
- Lead：根配置、`apps/web/src/App.tsx`、`main.tsx`、`docs/contract.md`、集成、start.sh、最终验收。

公共接口（Lead 定，任何人不要改签名）：
- `packages/shared/src/types.ts`、`modes.ts`、`seasons.ts`、`prng.ts`、`index.ts`
- 引擎 React 入口：`apps/web/src/components/stage/Stage.tsx`，props `StageProps`；`/touch` 与首页都通过它挂载。
- 页面只通过 `api` client 调用 `/api/*`，不直连 SQLite。

## 11. 验收（verifier + Lead）

- 7 模式可进/退，三路输入；无摄像头可玩；fake camera 能真实识别。
- 采集→归档→分享→OG/QR→删除全链路；重启持久。
- 5 视口无溢出/遮挡；0 console error；axe critical 0；reduced-motion 终态。
- 初始 ≤300KB gz；引擎懒加载；舞台 60fps 目标、45 降级、30 建议指针。
- 研究数量全达标；55 项创新矩阵每项有证据；最终 8 张截图 + 15–20s 演示视频。
- 本地 `http://127.0.0.1:8787/` 可打开；README 写清运行方式。

## 12. 明确不做

- 不部署、不创建云端资源、不改用户现有站点/账号/数据库。
- 不参考用户 3D 网站（代码/设计/素材/配置一概不用）。
- 不上传摄像头/照片/音频；不收集 PII；不做账号体系。
- 不伪造 API 数据/README 数字；研究失败写 limitation。
- 不把创新只写在注释里；必须有可见证据。