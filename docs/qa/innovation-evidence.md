# 55 项创新 · 落地证据（Lead 验收版）

> 全量设计映射：`docs/design/innovation-visibility.md`（逐项路由/组件/`data-hm` 证据/验收判据）。
> 本表是**交付验证口径**：每项有实现位置/可见证据，未把创新停留在注释里。
> Tier-1 ★ 12 项：A1 A2 A3 A4 A5 B1 B2 B11 B12 B13 C1 D8。

| ID | 创新（可见行为） | 实现 / 证据 |
|---|---|---|
| A1 | 自绘藤蔓字标 | `components/shell/Wordmark.tsx`；`screens/desktop/home-hero-1440.png` |
| A2 | 活体图版首屏 | `pages/HomePage.tsx` 5/7 分屏 + `plates/peony-red.webp`；hero 截图 |
| A3 | 新编辑字体系统 | `styles/fonts.css` + `tokens.css`；Instrument/Cormorant/Noto/Plex/MaShan 子集 |
| A4 | 四季节气色板 | `packages/shared/seasons.ts` + tokens `data-season`；切换见 `/touch` 季节 chips |
| A5 | 纸→露水转场 | `styles/home.css` `hm-plate-in` / dissolve；hero 入图与实际渲染 |
| A6 | 水彩/咬墨 shader | `engine/modes/frame.ts` PETAL_FRAG / 纸纹 |
| A7 | 12–20 张有出处图版 | 5 张产品 PD 图版 + 17 张研究素材；`ASSET-LICENSES.md` |
| A8 | 黄铜放大镜光标 | `styles/ui.css` + `engine/Ink2D.ts` 光标/透镜态 |
| A9 | 边注系统 | 全站 PLATE/拉丁/坐标/folio；`screens/share`、`screens/touch` |
| A10 | 植物学检索表模式轨 | `/touch` 七模式 rail + `lab.html` key；截图 |
| A11 | 夜花园 | `components/night/NightHost`（stage 体系）/ colophon dark；`home-colophon` |
| A12 | 按 F 压花 | Home keydown → `hm-pressed-layer`；可选互动 |
| B1 | 指尖花窗（双手/单手 L） | `hands/gestures.ts` `buildPortal` + `engine/modes/frame.ts`；`/touch` FRAME |
| B2 | 芍药开合/捏瓣成种 | `frame.ts` open → `uOpen`，pinch→seed 粒子；截图 |
| B3 | 翻绳藤蔓 5 图案 | `hands` + `engine/modes/tendril.ts`；`screens/touch/touch-tendril-1440.png` |
| B4 | 雨池涟漪 | `engine/modes/ripple.ts` + Monet plate；`touch-ripple-1440.png` |
| B5 | 孢子吹散/落地发芽 | `engine/modes/spore.ts`；`touch-spore-1440.png` |
| B6 | 菌络桥接 | `engine/modes/mycelium.ts`；`touch-mycelium-1440.png` |
| B7 | 晨雾擦窗 | `engine/modes/mist.ts` + `plates/peony-white`；`touch-mist-1440.png` |
| B8 | 花冠黄金角 | `engine/modes/phyllotaxis.ts`；`touch-phyllotaxis-1440.png` |
| B9 | 手势语法 frame/open/pinch/fist/weave | `hands/gestures.ts` 滞回 + 去抖；lab/HUD 显示 |
| B10 | One Euro + 预测 + 21 点解剖 | `hands/smoothing.ts` + `components/editorial/AnatomyHand.tsx`；`/field-guide` |
| B11 | 幽灵手自动演出 | `hands/ghost.ts` + `public/fixtures/*`；所有模式无摄像头可看 |
| B12 | 指针/双指/键盘全平价 | `hands/pointer.ts` + `Stage` 键盘；fake-camera 与无 camera 测试 |
| B13 | 隐私仪式 | `pages/TouchPage` cameraAsk + `Stage` 不自动开；`screens/touch/camera-ritual` |
| B14 | 种子式采集 | `CollectDialog` → `createSpecimen` → 确定性卡；`collect-success` |
| B15 | 摄像头视图三态 + 清屏 | `Stage` camera on/off + `C` clear + `D`（帮助已移除未实现行） |
| C1 | 六幕叙事 + 章节轨 | Home 六 section + Shell chapter rail；desktop 截图 |
| C2 | 双语编辑文案 | `packages/shared/copy.ts` 594 键；`/touch` 中/EN 切换 |
| C3 | 每日一株 | `GET /api/edition/today` + `packages/shared/prng`；smoke PASS |
| C4 | 田野笔记 | `/field-guide` + 制作说明/vitals；页码截图 |
| C5 | 标本馆筛选/搜索/排序 | `/herbarium` 真实 list + filters；API smoke |
| C6 | 分享页 SSR/OG | `/s/:id` + `og.png`/`twitter:card`/JSON-LD；`scripts/smoke.sh` |
| C7 | 标本卡分类学 | `packages/art` 卡面：科/花期/坐标/seed/barcode/QR；`card.png` |
| C8 | ⌘K 指令抽屉 | `components/shell/CommandPalette.tsx`（cmdk）；键盘可达 |
| C9 | 隐藏致意 | colophon `for Gerard & Claude` + Monet/RIPPLE + night sky |
| C10 | 404/离线 | `pages/NotFoundPage.tsx` + `offline`/SW 壳；axe 0 |
| C11 | 下一朵路标 | Home 各 section `next` + rail progress；截图 |
| C12 | 真实花园公告条 | Home 底部 telemetry（本地时间/季节/温度表）；非假数据 |
| D1 | 墨/花瓣转场 | CSS `hm-press`/Shell route fold；reduced-motion 终态 |
| D2 | 滚动编排 | IntersectionObserver + CSS clamp/视差；无横向溢出 |
| D3 | 字体入场 | `hm-rise`/`hm-fade`；一次性 |
| D4 | 磁吸/藤蔓/印章/透镜 | `Button` magnetic + collect seal + loupe 光标 |
| D5 | 生成式声景 | `engine/audio.ts`（风/水/丝弦/五声音阶，默认静音） |
| D6 | 移动轻触觉 | `haptics` in ui/stage；可关 |
| D7 | 微反馈 | 采集“压进纸里”、种子、印章、hover ink；`collect-success` |
| D8 | 活时钟/光温 | Home local clock + Shell strip + Stage care label；`home-hero` |
| E1 | Hono+SQLite WAL/ETag/304/LRU | `apps/api` + `docs/api-smoke.txt`（93/93） |
| E2 | 确定性卡片/OG/QR | `packages/art` + `data/cards`；card/og/qr 200/304 |
| E3 | 匿名采集 + HMAC token + 限流 + zod | `apps/api/lib/{security,validation,limit}`；smoke |
| E4 | 全部自托管 0 外网运行时 | `public/fonts/models/wasm/plates`；构建检查 |
| E5 | PWA/离线 | `public/manifest`/offline/SW；404/离线页 |
| E6 | 性能预算/自适应 | 入口 89.74KB gz；GardenEngine 161KB lazy；`quality.ts` governor |
| E7 | 隐私/安全 | 摄像头不上传；CSP/Permissions 由 local server headers；DELETE token |
| E8 | 健康/迁移/reset/start/README | `/api/health`、`start.sh`、`pnpm db:reset`、`docs/DELIVERY.md` |

**计数**：55/55 已实现；Tier-1 12/12 有首屏/前两屏截图；其余 43 项在前 3 次交互或一次完整采集链路中可见。截图汇总：`screens/`。研究/QA 硬账：`docs/qa/qa-report.md`、`research/check.mjs`（14/14）。