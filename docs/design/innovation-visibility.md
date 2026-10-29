# HORTUS MANUS · 指间花园 — 55 项创新可见性矩阵 Innovation Visibility v1

> Owner: atelier。用途：让 **每一项创新都能被看见、被截图、被验证**，而不是只活在注释里。
> 规则来自 `docs/contract.md` §5：55 项逐项给证据；★ 项必须在前两屏/前三次交互可见。
> 证据形式：截图（`screens/**`）、DOM/`data-hm` 钩子、接口响应、录屏帧。verifier 负责采集，本文件定义**在哪看、看什么、怎样算过**。

---

## 0. 先解决一个计数问题（必须读）

`contract.md` §5 在 A–D 组共标了 **19 个 ★**，但可见性预算写的是「★ **12 项**首屏/前两屏可见」。两者不一致，本文件做如下裁定并记录在此：

- **Tier-1（12 项）**：必须在 `/` 首屏或前两屏、或对应路由首屏可见。这是验收的硬指标。
- **Tier-2（其余 7 个 ★）**：不降低标准——它们在**对应路由首屏**或**前 3 次交互**内可见，同样给证据；只是不计入「首屏 12」。
- 19 个 ★ = Tier-1 12 + Tier-2 7。非 ★ 的 36 项按组给证据（B/D 组前 3 次交互；E 组走一次完整链路）。

| Tier | 数量 | 项目 |
|---|---|---|
| **Tier-1（首屏 12）** | 12 | **A1 A2 A3 A4 A5 B1 B2 B11 B12 B13 C1 D8** |
| **Tier-2（★，早期可见）** | 7 | A10 B3 B4 C5 C6 D1 D2 |
| 非 ★ | 36 | 其余（逐项见 §3 总表） |

> 建议 Lead 在 `docs/contract.md` §5 末尾加一行引用本文，避免验收时口径不一致。

---

## 1. Tier-1 · 首屏十二项（逐项落点 + 判据）

| ID | 创新 | 精确落点（1440×900） | 证据 | 一句可验收判据 |
|---|---|---|---|---|
| **A1** | 自绘藤蔓字标 | `/` 首屏 Nav 左（96, 24–52）+ Hero 巨字区（96, 168–300）；390 首屏顶部 | `screens/desktop/01-home-hero.png`；DOM `[data-hm="wordmark"] svg path` 数量 > 8 | 首屏字标是手绘藤蔓 SVG 路径（带茎/叶端点），不是字体直排；放大到 2× 不糊、不拉伸。 |
| **A2** | 活体图版首屏 | `/` 首屏右 7 列（626–1344, 150–790） | 截图 + 录屏 3s；DOM `[data-hm="hero-plate"][data-alive="true"]` | 首屏 3 秒内可见芍药图版并发生开合/呼吸运动；不是静态卡片。 |
| **A3** | 新编辑字体系统 | `/` 首屏：字标（Instrument）/ 中文幕题（Noto Serif SC）/ 主张（Cormorant italic）/ 标签（Plex Mono）；全站 | 首屏截图 + computed style 导出 | 首屏同时出现 4 种字体角色，字号/行高/字距来自 tokens，全部 ≥11px。 |
| **A4** | 四季节气色板 | `/` 首屏底部读数条（820–900）：季节名 + 4 枚 8×8 节气色点；幕 III CARE LABEL | 首屏截图 + 4 季切换截图 ×4 | 读数条可见 4 季色点；切换季节后 accent/wash 改变而 paper 底色不变，正文对比度仍 ≥4.5。 |
| **A5** | 纸→露水转场 | `/` 首屏 `推门` 点击（96–602, 600–644）→ 幕 II 进入 | 录屏 00:02–00:05；`data-hm="transition-dew"` | 推门后出现纸面吸墨/露水扩散的遮罩转场，1.2–3.2s 内完成；reduced-motion 直接切换。 |
| **B1** | 指尖花窗 | `/` 首屏花窗四角（指针靠近时出现框线）；幕 II 舞台主交互 | 首屏 hover 截图 + 幕 II 截图 | 指针/手指框出区域后，花窗边界跟随并触发开花；框撤销后回到苞。 |
| **B2** | 芍药开合 | `/` 首屏花窗主体；幕 II `frame` 模式 | 录屏 3 段（苞→半开→全开→回苞） | 握拳/指针离开回到苞、开掌/悬停全开；过渡 1.6–2.4s，可反复触发。 |
| **B11** | 幽灵手自动演出 | `/` 首屏静置 4s；`/touch` 按 `G` | 录屏 8–12s；`data-hm="ghost-hand"` | 首屏 4s 无操作后出现半透明手演示一次并退出；按 G 可重播；reduced-motion 不自动播放。 |
| **B12** | 指针/双指/键盘全平价 | `/` 首屏 CTA 下提示 + 键盘焦点；`/touch` 底部键盘提示 | 纯键盘操作录屏（不碰鼠标） | 仅用键盘（Tab/Enter/1–7/X/S/G/F/Esc）可完成推门、切模式、换季、采集；UI 均可见焦点。 |
| **B13** | 隐私仪式 | `/` 首屏 Nav/相机入口的隐私短句；幕 II 相机 gate 的 3 步 dialog；`/touch` 首屏 | 截图：隐私 dialog 3 步 | 任何摄像头请求前先出现 3 步隐私仪式；声明可见；拒绝后舞台仍可玩。 |
| **C1** | 四幕叙事 + 章节轨 | `/` 首屏右缘/导航：`I 园门 · II 授粉 · III 温室 · IV 标本馆 · 间奏 · 尾幕` | 首屏截图 + 滚到幕 II 的章节态截图 | 六段章节轨首屏可见，当前幕高亮，键盘可跳转；幕题与叙事顺序固定。 |
| **D8** | 活时钟 | `/` 首屏底部读数条（820–900）：本地时间 + FPS + 延迟 | 两张相隔 3s 的截图（时间不同）；DOM `[data-hm="clock"]` | 读数条显示真实本地时间并每秒更新，与系统时间一致；不伪造 FPS。 |

**首屏构图校验**：以上 12 项在 1440×900 的首屏 + 下滚一屏（幕 II）内全部可见；其中 A1/A2/A3/A4/B1/B2/B11/B12/B13/C1/D8 在首屏，A5 在首屏点击后立即触发。

---

## 2. Tier-2 · 其余 7 个 ★（早期可见，不降标）

| ID | 创新 | 落点 | 证据 | 判据 |
|---|---|---|---|---|
| **A10** | 植物学检索表模式轨 | `/touch` 首屏右侧 1320–1416；`/` 幕 II 左侧 4 列 | 两张截图；DOM `[data-hm="mode-rail"]` 含 7 行 | 7 行检索表首屏可见（罗马数字+中文+拉丁+手势+选中态），不是横向 chip 堆。 |
| **B3** | 翻绳藤蔓 + 5 图案 | `/` 幕 II 切到 `tendril`；`/touch` 模式轨第 II 行 | 5 张图案截图；录屏拉紧回弹 | 21 点丝线可见，5 种图案可切；拉紧有张力、松手回弹。 |
| **B4** | 雨池涟漪 | `/` 幕 II 切到 `ripple`；`/touch` 第 III 行 | 触点前后截图 | 指尖/指针触水出现 ≥3 圈涟漪并在 1.6s 内扩散淡出。 |
| **C5** | 标本馆筛选/搜索 | `/herbarium` 首屏（标题带+筛选栏+首行卡）；`/` 幕 IV 筛选栏 | 筛选前后截图 + URL/状态导出 | 模式、季节、搜索、排序组合生效；空态与清空筛选正确。 |
| **C6** | 分享页 SSR/OG | `/s/:id` 首屏 | `curl -s /s/:id` 的 HTML；OG 调试截图 | 关闭 JS 直接请求也返回成品 HTML，含 og:/twitter:/JSON-LD/QR。 |
| **D1** | 墨/花瓣转场 | `/` 推门、幕 II→III、进入温室、退出 `/touch` | 录屏 4 段 | 至少有 2 种转场（墨洇/花瓣）且 1.2–3.2s、只播一次；reduced-motion 直接切换。 |
| **D2** | 滚动编排 | `/` 首屏→幕 II（第一次滚动） | 录屏 6 幕滚动；回滚重看 | 标题/图版/读数按序入场，回滚不重播；首屏已有滚动提示。 |

---

## 3. 55 项总表（逐项证据与判据）

> 证据文件名按 `screens/desktop|mobile|fake-camera|demo` 规划；verifier 可改名，但需在本表登记最终路径。
> `data-hm` 是建议钩子：无样式、无行为，只用于自动化取证。

### A 组 · 视觉/品牌（12）

| ID | 创新 | 页面/组件 | 证据 | 一句可验收判据 |
|---|---|---|---|---|
| A1 ★ | 自绘藤蔓字标 | Nav + Hero `PlantWordmark` | 首屏截图 + SVG DOM | 见 Tier-1 |
| A2 ★ | 活体图版首屏 | Hero `PlateImage` + `StageFrame` | 首屏截图 + 3s 录屏 | 见 Tier-1 |
| A3 ★ | 新编辑字体系统 | 全站 typography 类 | 首屏 + 图鉴截图 + computed style | 见 Tier-1 |
| A4 ★ | 四季节气色板 | `SeasonSwatch` + `[data-season]` | 4 季截图 ×4 | 见 Tier-1 |
| A5 ★ | 纸→露水转场 | 转场层 | 推门录屏 | 见 Tier-1 |
| A6 | 水彩/咬墨 shader | 图版边缘/转场（mechanics） | 图版边缘特写 2 张 | 图版边缘是程序化咬墨/水彩位移（可对比静态边框），在 60fps 下不抖动。 |
| A7 | 12–20 张有出处图版 | `PlateImage` / Gallery | 图版墙截图 + 来源行截图 | 至少 12 张图版，每张页面显示来源行，来源可在 `ASSET-LICENSES.md` 查到。 |
| A8 | 黄铜放大镜光标 | `PlateImage` hover | 光标进出示意截图 | hover 图版出现 1.6× 圆形镜片；镜内放大、镜外不变；移出消失。 |
| A9 | 边注系统 | `Marginalia` | 1440 右缘截图 + 390 折叠截图 | 1440 右缘有竖排 folio/采集号/坐标；390 折叠为横带且不溢出。 |
| A10 ★ | 植物学检索表模式轨 | `ModeRail` | 见 Tier-2 | 见 Tier-2 |
| A11 | 夜花园 | `ThemeToggle` + `[data-theme=night]` | 夜间首页/温室截图 | 夜间背景 night、文字 moon、正文对比 ≥4.5；无纯黑、无霓虹。 |
| A12 | press F to press a flower | `CollectButton` + 快捷键 | 键位提示截图 + 按 F 采集录屏 | 按 F 等同采集按钮，出现提示；键盘可完成采集。 |

### B 组 · 手部交互/引擎（15）

| ID | 创新 | 页面/组件 | 证据 | 一句可验收判据 |
|---|---|---|---|---|
| B1 ★ | 指尖花窗 | 舞台 `frame` | 见 Tier-1 | 见 Tier-1 |
| B2 ★ | 芍药开合 | 舞台 `frame` | 见 Tier-1 | 见 Tier-1 |
| B3 ★ | 翻绳藤蔓 + 5 图案 | 舞台 `tendril` | 见 Tier-2 | 见 Tier-2 |
| B4 ★ | 雨池涟漪 | 舞台 `ripple` | 见 Tier-2 | 见 Tier-2 |
| B5 | 孢子吹散 | 舞台 `spore` | 握拳前后截图 | 握拳后冠毛散开、开掌可接回落种，状态可逆。 |
| B6 | 菌络桥接 | 舞台 `mycelium` | 双掌靠近前后截图 | 双掌靠近后菌丝网络在掌间生长，并随呼吸脉冲。 |
| B7 | 晨雾擦窗 | 舞台 `mist` | 擦前/擦后/2s 复雾截图 | 擦过区域露出压花，2s 后雾回；擦除区域与手势路径一致。 |
| B8 | 花冠螺旋 | 舞台 `phyllotaxis` | 螺旋特写 + 转手前后 | 花瓣按黄金角生成；转手可改方向、开合可缩放。 |
| B9 | 手势语法 | `GestureState` + HUD | 5 手势识别截图 | 5 种手势被识别并有文字反馈；带滞回/置信度，不抖动。 |
| B10 | One Euro + 预测 + 21 点解剖 | 图鉴 + `HandOverlay` | 21 点编号截图 + 代码引用 | 21 点全部可命名显示；平滑为 One Euro 滤波（代码可查）。 |
| B11 ★ | 幽灵手自动演出 | `GhostHand` | 见 Tier-1 | 见 Tier-1 |
| B12 ★ | 指针/双指/键盘全平价 | Hero + `/touch` | 见 Tier-1 | 见 Tier-1 |
| B13 ★ | 隐私仪式 | `PrivacyRitual` + `CameraGate` | 见 Tier-1 | 见 Tier-1 |
| B14 | 种子式采集 | `CollectButton` + `/api/specimens` | 采集响应 JSON + 重复渲染对比 | 每次采集有唯一 seed；同一 seed 的 card/OG 完全一致。 |
| B15 | 摄像头视图三态 + 清屏 | `/touch` | off/requesting/on 三截图 + 清屏截图 | 三态清晰；C 清屏后只留舞台与 folio，任意输入恢复。 |

### C 组 · 叙事/信息/IDX（12）

| ID | 创新 | 页面/组件 | 证据 | 一句可验收判据 |
|---|---|---|---|---|
| C1 ★ | 四幕叙事 + 章节轨 | Nav/`ChapterRail` | 见 Tier-1 | 见 Tier-1 |
| C2 | 双语编辑文案 | 全站 | 双语标题截图 + `copy.ts` 键检查 | 每页同时出现中英对照；文案来自 copy.ts；无 lorem、无伪造数字。 |
| C3 | 每日一株 | `DailySpecimen` + `/api/edition/today` | 截图 + JSON；次日截图 | 每日卡由 API seed 决定；同日刷新一致，次日变化。 |
| C4 | 田野笔记 | 幕间奏 `FieldNoteEntry`/`HandNote` | 4 则截图 | 4 则笔记含日期/正文/手写批注；手写字体只此处出现。 |
| C5 ★ | 标本馆筛选/搜索 | `/herbarium` | 见 Tier-2 | 见 Tier-2 |
| C6 ★ | 分享页 SSR/OG | `/s/:id` | 见 Tier-2 | 见 Tier-2 |
| C7 | 标本卡分类学 | `SpecimenCard`/`TaxonomyBlock` | 卡片特写 | 卡含学名/俗名/科/采集号/日期/季节/致谢，字段来自真实 API。 |
| C8 | ⌘K 指令抽屉 | `CommandPalette` | 打开/搜索/执行三截图 | ⌘K 打开；键盘可搜索并执行（换模式/换季/分享/去图鉴）；Esc 关闭。 |
| C9 | 隐藏致意 | 夜空/雨池/版权页 | 版权页截图 + 夜间角落截图 | 版权页出现 `for Gerard & Claude`；O'Neill/睡莲以 ≤8% 透明度可发现、不抢戏。 |
| C10 | 404/离线 | `NotFound` + `OfflineBanner` | 404 截图 + 离线截图 | 未知路由显示指定 404 文案；离线页面可读并提示本地服务。 |
| C11 | 下一朵路标 | `NextActMarker` | 每幕底部截图 | 每幕底部有下一幕链接；键盘可聚焦并滚动/跳转。 |
| C12 | 真实花园公告条 | `AnnouncementMarquee` | 公告条截图 + 内容核对 | 只含真实声明（本机/无上传/按 F/每日种子），无伪造数据；可暂停。 |

### D 组 · 动效/声音/微交互（8）

| ID | 创新 | 页面/组件 | 证据 | 一句可验收判据 |
|---|---|---|---|---|
| D1 ★ | 墨/花瓣转场 | 转场层 | 见 Tier-2 | 见 Tier-2 |
| D2 ★ | 滚动编排 | 全站 | 见 Tier-2 | 见 Tier-2 |
| D3 | 字体入场 | 标题 | 首屏录屏 | 标题分行错峰升起 ≤720ms，只播一次。 |
| D4 | 磁吸/藤蔓/印章/透镜 | 按钮/采集/图版 | 3 段微交互录屏 | 磁吸位移 ≤8px；印章一次性过冲；镜片放大不阻塞点击。 |
| D5 | 生成式声景 | `SoundToggle` + WebAudio | 声音开启截图 + Network 无音频请求 | 声景由 WebAudio 实时合成；默认静音；首次发声由手势触发。 |
| D6 | 移动轻触觉 | `/touch` 移动端 | 真机录屏/说明 | 移动端采集成功触发 ≤12ms 振动；桌面不触发。 |
| D7 | 微反馈 | 全部交互件 | hover/press/focus 三态截图 | 三类微反馈均 ≤360ms、可见、有终态。 |
| D8 ★ | 活时钟 | `ReadoutStrip`/`CareLabel` | 见 Tier-1 | 见 Tier-1 |

### E 组 · 本地后端/工程（8）——一次链路取证

> E 组不靠首屏，靠**一次「采集 → 刷新 → 分享 → OG/QR → 删除」**全链路。接口证据用 `curl -i` 原始输出存 `docs/qa/`。

| ID | 创新 | 证据 | 一句可验收判据 |
|---|---|---|---|
| E1 | Hono+SQLite WAL/ETag/304/gzip/LRU | `curl -i` 响应头 | `/api/health` 200；标本列表返回 ETag，二次请求 304；SQLite 为 WAL 模式。 |
| E2 | 确定性卡片/OG（@napi-rs/canvas + QR） | 同 id 两次 `card.png` sha256 | 同一 specimen 两次卡片字节一致；OG 1200×630 含 QR 与文字。 |
| E3 | 匿名采集 + HMAC 删除 token + 限流 + zod | 创建/删除/非法 body/超频 4 条 curl | 无账号可创建；删除需 token；非法 body 400；超频 429。 |
| E4 | 全部自托管、0 外网运行时 | Network 面板导出 | 断网后首页、字体、图标、模型仍可用；无外网请求。 |
| E5 | PWA/离线 | 安装提示 + 离线刷新截图 | Service worker 缓存核心资源；离线可打开缓存页并提示本地服务。 |
| E6 | 性能预算 + 自适应 | Lighthouse/构建产物统计 | 初始 JS ≤300KB gz；舞台 60fps 目标，<45fps 时降级可见。 |
| E7 | 隐私/安全（CSP、localhost、无上传） | 响应头 + Network | CSP 头存在；无图像上传请求；无 PII；监听 127.0.0.1。 |
| E8 | 健康检查/迁移/seed/reset/start.sh/README | 脚本输出 | `./start.sh` 一条命令启动；health/migrate/seed/reset 幂等可用；README 步骤可复现。 |

---

## 4. 截图与录屏计划（verifier 执行，8 张 + 1 段）

| # | 文件 | 视口 | 覆盖创新 |
|---|---|---|---|
| 1 | `screens/desktop/01-home-hero.png` | 1440×900 | A1 A2 A3 A4 B1 B2 B11 B12 B13 C1 D8 |
| 2 | `screens/desktop/02-home-pollination.png` | 1440×900 | A10 B3 B4 B12 C1 |
| 3 | `screens/desktop/03-greenhouse-night.png` | 1440×900 | A4 A5 A11 D8 |
| 4 | `screens/desktop/04-herbarium.png` | 1440×900 | A7 A8 C3 C5 C7 C11 |
| 5 | `screens/desktop/05-share-ssr.png` | 1440×900 | C6 C7 E2 |
| 6 | `screens/desktop/06-field-guide.png` | 1440×900 | A3 A9 B10 C2 |
| 7 | `screens/mobile/07-home-390.png` | 390×844 | A1 A2 A9 B12 C1（响应式） |
| 8 | `screens/desktop/08-404.png` | 1440×900 | C10 |
| + | `screens/demo/*.mp4` 15–20s | 录屏 | B1 B2 B3 B4 B11 D1 D2 D5 D6 D7 三路输入 |
| + | `screens/fake-camera/*.png` | 1440×900 | B3/B4/B13 识别证据（fake camera fixture） |

**OG 截图**：`screens/desktop/og-1200x630.png`（来自 `/api/specimens/:id/og.png`），用于验证 C6/E2。

---

## 5. `data-hm` 取证钩子（建议 stage/mechanics 添加）

无样式、无行为，只用于自动截图/断言：

| 钩子 | 位置 | 证明 |
|---|---|---|
| `data-hm="wordmark"` | `PlantWordmark` 根 | A1 |
| `data-hm="hero-plate"` + `data-alive` | 首屏花窗 | A2 |
| `data-hm="chapter-rail"` + `data-current` | 章节轨 | C1 |
| `data-hm="readout"` / `data-hm="clock"` | 读数条 | A4/D8 |
| `data-hm="season-swatch"` ×4 | 读数条色点 | A4 |
| `data-hm="mode-rail"` + `data-mode` | 模式轨 | A10/B3/B4 |
| `data-hm="stage-canvas"` + `data-fps` | 舞台 | E6/B1 |
| `data-hm="ghost-hand"` + `data-playing` | 幽灵手 | B11 |
| `data-hm="camera-gate"` + `data-state` | 相机 gate | B13/B15 |
| `data-hm="privacy-ritual"` | 隐私 dialog | B13 |
| `data-hm="collect-button"` | 采集按钮 | B14/A12 |
| `data-hm="hairline"` / `data-hm="marginalia"` | 边注 | A9 |
| `data-hm="specimen-card"` + `data-id` | 卡片 | C7 |
| `data-hm="filter-bar"` | 筛选 | C5 |
| `data-hm="share-card"` / `data-hm="qr"` | 分享页 | C6 |
| `data-hm="theme"`（html） | 夜花园 | A11 |
| `data-hm="reduced-motion"`（html，JS 写入） | 减弱动效 | 终态验证 |

---

## 6. 验收顺序（建议 verifier）

1. **首屏 3 秒**：截图 1，核对 A1/A2/A3/A4/B12/B13/C1/D8；录 3s 确认花在动（A2）。
2. **静置 4 秒**：录幽灵手（B11）；reduced-motion 重跑，确认不自动播放。
3. **首次交互**：推门 → 录 A5/D1；进幕 II → 截图 2，核对 A10/B3/B4。
4. **键盘走查**：不碰鼠标完成推门→切模式→换季→采集（B12）；截图焦点环。
5. **相机仪式**：点允许 → 截 3 步（B13）；拒绝路径再走一次。
6. **采集全链路**：采集 → toast → 刷新 → `/herbarium` 出现 → `/s/:id` → OG/QR → 删除（E1–E4、C5/C6）。
7. **夜间**：切换 → 截图 3（A11）；核对对比度。
8. **减少动效**：逐页截图与正常模式构图一致（§motion-sound 终态表）。
9. **离线/404**：断网、未知路由（C10）。
10. **性能**：构建产物 ≤300KB gz；舞台 fps 采样（E6）。

---

## 7. 一句话总结给 Lead

> 55 项不能靠「写了」验收，只能靠「看见了」。首屏 12 项（**A1 A2 A3 A4 A5 B1 B2 B11 B12 B13 C1 D8**）是硬指标；其余 7 个 ★ 在对应路由首屏/前三次交互出现；E 组用一次完整采集链路证明。任何一项如果只能截到静态卡片，就算未完成。

---

*本文件与 `wireframes.md`、`art-direction.md`、`motion-sound.md` 交叉引用；证据路径最终以 verifier 的 `docs/qa/` 登记为准。*