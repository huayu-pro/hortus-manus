# HORTUS MANUS · 50 条可转化技术（研究 → 产品）

> 来源：`research/references/atlas.md` 77 站实测指纹 + `research/video-teardown/` 3093 帧 + `research/botanica-gif/` 154 帧 + `research/cats-cradle/` 1049 行源码 + `research/rea/` 10 完整 + 1 部分证据。
> “→” 映射到 `docs/contract.md` §5 的 A/B/C/D/E 创新编号；每条都落在产品代码里，不是纸面清单。

## A · 字体与编辑排版（10）

| # | 技术 | 证据 | 本项目 |
|---|---|---|---|
| 1 | 单一 display 字体 + 极小正文，把气质押在字号落差 | atlas `abdullah` | A3：Instrument Serif + Noto Serif SC / Plex Mono 三层 |
| 2 | 巨字与图版互相遮挡，制造景深而非并排 | atlas `angelo` | A2：首屏 5/7，牡丹出血到右缘 |
| 3 | 旧式数字 + 等宽读数，让编辑感变成“仪表” | atlas `british-art-fair` 等 | A9：标本号 / 坐标 / folio 全 mono |
| 4 | 字距随字号反向变化（大标题负字距，小标签正字距） | atlas `felix-haas` | A3 / tokens `--hm-tracking-*` |
| 5 | 中英混排：中文不斜、拉丁斜体作为气口 | gif BOTANICA | A3 / `--hm-font-italic` |
| 6 | 压花图版的“印刷说明”式 caption | gif + atlas `kern-society` | A7 / C7：PLATE / 学名 / 科 / 花期 |
| 7 | 边注竖排，正文永不被装饰打断 | atlas `the-equator` | A9 / 章节页边注 |
| 8 | 11px 微标签作为唯一下限，所有读数可读 | 自身 a11y 门 | A3 / axe 0 |
| 9 | 图版可 ±1–2° 旋转，但正文绝不歪 | atlas `dabbit` | A2/A7 / `.hm-field-plate` |
| 10 | 字体子集化 + 自托管，避免 CJK 全量拖慢 | 本项目 | A3/E4：830 字 woff2，~800KB total |

## B · 布局与图像（10）

| # | 技术 | 证据 | 本项目 |
|---|---|---|---|
| 11 | 奶油纸底 + 单一彩色主体，留白≥35% | gif BOTANICA | A2 / 全站 |
| 12 | 5/7 不对称首屏：左文右图，不居中 | atlas `josh-puckett` | A2 / `hm-gate-grid` |
| 13 | 图版越界到视口边缘，文字永不越界 | atlas `isa-de-burgh` | A2 / 主图出血 |
| 14 | 艺术指导裁切：同一图版可有 hero/方形/竖幅三种 crop | 本项目 plates | A7 / `plates.json` |
| 15 | 双层材质：纸纹 + 摄影颗粒，不用玻璃拟态 | atlas `monocle` | A6/A9 / CSS 生成纸纹 |
| 16 | 手写只出现在田野笔记/引线，不做按钮 | 本项目 | A9 / Ma Shan Zheng 子集 |
| 17 | 图版 caption 用 mono，正文用 sans/serif，互不抢 | atlas `kern-society` | A7/C7 |
| 18 | “密度对比”：一屏只有一处密集信息（温室读数/标本卡） | 本项目 | A9/C7 |
| 19 | 圆形/椭圆模切窗口作为叙事装置 | gif 的圆窗 | B1/B8 / mobile FRAME 圆窗 |
| 20 | 5 张 PD 图版各自承担一个角色（hero/雾/池/图鉴/归档） | 本项目 | A7 / `public/plates` |

## C · 动效与滚动（10）

| # | 技术 | 证据 | 本项目 |
|---|---|---|---|
| 21 | 页面入场按“纸落下”分层，而非整页 fade | atlas `swash` | D2 / `hm-rise` |
| 22 | 图版 clip-path 揭开 + grain 淡入 | atlas `duo-case` | D2 |
| 23 | 滚动驱动章节轨（圆点实心/变细） | 本项目 | C1/C11 / `hm-rail` |
| 24 | 一次性 reveal，回看不重播 | 本项目 | D2 / IntersectionObserver |
| 25 | 墨/花瓣转场（radial clip）而不是硬切 | atlas `kern-society` | D1 |
| 26 | 花开 1.6–2.4s，慢而重；不可 bounce | 视频手指涂鸦 + 本项目 | B2/B8/D2 |
| 27 | 滚动速度驱动图版视差（≤12px） | atlas `magma` | D2 / CSS vars |
| 28 | 阅读进度条用 1px 线，不抢视觉 | 本项目 | C1 / Shell strip |
| 29 | 深色段只用于“夜花园/版权页”，不连续两段 | 本项目 | A11 / colophon |
| 30 | reduced-motion 直接给终态，不隐藏内容 | 本项目 | D2 / axe/qa |

## D · WebGL / Canvas / 3D（8）

| # | 技术 | 证据 | 本项目 |
|---|---|---|---|
| 31 | 多 canvas 分治，避免单 WebGL 上下文过载 | atlas `angelo` | E6 / 引擎单 canvas + overlay |
| 32 | 背景视频/摄像头做纸面/去色处理，不直接铺 | atlas `bella-kotton` | B1/B15 / FRAME |
| 33 | 程序化花瓣 instanced geometry + 水彩 shader | 视频手指涂鸦 | B2/B8 |
| 34 | 水波法线 + 同心涟漪，触点成圆心 | 视频涟漪 + Monet | B4 |
| 35 | 蒲公英 instanced 种子 + 曲率噪声风场 | 视频超新星 + PD 图版 | B5 |
| 36 | Verlet 弦与手部关键点绑定，自然形成翻绳图案 | zip 1049 行源码 | B3 / 5 图案 |
| 37 | 菌丝网络用节点/边 + 呼吸脉冲，不用霓虹 bloom | 视频星座网 | B6 |
| 38 | 用 PD 图版 + 冷凝玻璃 mask 做“擦雾”揭示 | gif 圆窗 + 本项目 | B7 / MIST |

## E · 交互 / 声音 / 输入（7）

| # | 技术 | 证据 | 本项目 |
|---|---|---|---|
| 39 | 指尖五点/凸包成“窗口”，不是整只手 | 视频漫画框 | B1/B9 |
| 40 | 手势滞回 + 停留去抖，避免模式闪烁 | 本项目 | B9 |
| 41 | 幽灵手自动演出：录制关键点轨迹，无摄像头也可看 | 视频 + 本项目 | B11 |
| 42 | 指针 = 一只手，双指/双指针 = 两只手 | 本项目 | B12 |
| 43 | 采集用“按住印章”做人机确认，不用验证码 | 本项目 | B14 / CollectDialog |
| 44 | 声景分层：风/水/丝弦/五声音阶，默认静音 | gif + 本项目 | D5 |
| 45 | 手 x 位置驱动声像，手越快风越大 | 本项目 | D5/B4 |

## F · 后端 / 性能 / 可用性（5）

| # | 技术 | 证据 | 本项目 |
|---|---|---|---|
| 46 | 确定性标本卡：seed→PRNG→Canvas，不存用户图 | 本项目 | E2 / `packages/art` |
| 47 | SSR 分享页：独立 HTML + OG/Twitter/JSON-LD + QR | atlas 分享卡 | C6/E2 |
| 48 | ETag/304 + immutable 卡片 + LRU edition | atlas 性能实践 | E1 |
| 49 | 本地限流 + HMAC 删除 token，匿名也可控 | 本项目 | E3/E7 |
| 50 | 初始包 ≤300KB gz；引擎/MediaPipe/three 懒加载 | 本项目实测 89.7KB gz + 引擎 chunk | E6 |

**补充证据**：`research/references/atlas.md`（77 站逐站 3 手法 + 1 技术），`research/rea/` 10 完整 + 1 部分证据，`research/video-teardown/finger-doodle.md`（3093 帧），`research/botanica-gif/`（154 帧），`research/cats-cradle/`（1049 行）。