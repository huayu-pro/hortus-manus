# HORTUS MANUS · 指间花园 — 组件清单 Component Inventory v1

> Owner: atelier（规格）· 实现：stage / mechanics / server。本文件定义**用途、状态、可访问性、所用 primitive**，不写实现。
> 目录按 `docs/contract.md` §10：stage 拥有 `components/{shell,editorial,archive,ui}` 与 `pages`；mechanics 拥有 `components/stage`。
> 每个组件只允许引用 `styles/base.css` 的类与 `tokens.css` 的 `--hm-*`；不允许私有 hex、私有字体栈、私有阴影。

## 0. 约定

- **尺寸**：交互命中 ≥ **44×44px**（图标按钮 44；行内链接可用 padding 扩展）。
- **焦点**：全部可聚焦元素有 `focus-visible` 2px ink 环 + 3px 偏移；Dialog 内焦点陷阱，关闭后焦点回到触发元素。
- **文案**：一律来自 `packages/shared/src/copy.ts`，组件 props 只接收 `Copy` 片段或显式 key，不内联句子。
- **动效**：只用 `--hm-dur-*` / `--hm-ease-*`；终态必须完整；reduced-motion 下无位移。
- **状态命名**：`default · hover · focus-visible · active · selected · disabled · loading · empty · error`。
- **不新增**：不新增颜色、字体、圆角 >2px、emoji 图标、玻璃模糊、无限动画。

---

## 1. Shell / 外壳

| 组件 | 用途 | 关键状态 | 可访问性 | Primitive / 依赖 | Owner |
|---|---|---|---|---|---|
| `AppShell` | 全站骨架：`<header> <main> <footer>`、skip link、页边注 rail 插槽、读数条插槽 | `page=home/touch/inner` | landmark 语义；`main` 唯一；skip link 首 tab | 无 / 原生语义 | stage |
| `Nav` | 顶部 88px：藤蔓字标（A1）、六幕章节轨锚点、语言/声音/夜花园/⌘K | 当前幕、滚动收缩（88→56 仅内页）、夜间 | `<nav aria-label>`；`aria-current="page"`；44×44；字标链接到 `/` | shadcn `Button`（ghost）+ 原生 `a` | stage |
| `ChapterRail` | 六幕章节轨（C1）：I–IV + 间奏 + 尾幕；横向导航 + 右侧竖排版本 | 当前幕实心、hover 下划线、聚焦 | `aria-label="章节"`；`aria-current="step"`；键盘 ←→；跳转按钮 | 自定义（roving tabindex） | stage |
| `NavMobile` | 390 折叠菜单（Sheet） | 打开/关闭、焦点陷阱 | `Dialog` + 焦点返回；`Esc` 关闭；按钮 `aria-expanded` | shadcn `Sheet`（Radix Dialog） | stage |
| `SkipLink` | 跳到正文 | 聚焦可见 | 首个 tab 位；`.hm-skip-link` | 原生 `a` | stage |
| `Footer` | 尾页/内页页脚：版权、隐私、来源、`for Gerard & Claude` | 默认 | `<footer>`；链接可聚焦 | 原生 | stage |
| `Colophon` | 版权页模块：字体/图版/研究/隐私分组、致敬、回顶部 | 默认 | 分组用 `<dl>` 或标题层级；`for Gerard & Claude` 为普通文本 | 自定义 | stage |
| `OfflineBanner` | 离线提示条（C10） | online/offline | `role="status"`；不遮挡操作 | 自定义 + `aria-live="polite"` | stage |

---

## 2. Editorial / 编辑模块

| 组件 | 用途 | 关键状态 | 可访问性 | Primitive | Owner |
|---|---|---|---|---|---|
| `HeroGate` | 幕 I 首屏：字标 + 主张 + CTA + 活体花窗 | 默认 / 悬停花窗 / 幽灵手演示 / 已推门 | `<h1>` 唯一；CTA 44px；花窗 `aria-hidden` 若为装饰，否则 `role="img"` + alt | 自定义 + `PlateImage` + `Button` | stage |
| `ActIntro` | 幕 II–IV 的标题 + 导语 + 幕号 | 默认 / 进入视口入场一次 | 标题层级 h2；幕号 `aria-hidden` | 自定义 | stage |
| `PlantWordmark` | 自绘藤蔓字标（A1）：`HORTUS MANUS` SVG | 纸/夜；尺寸 168/96/28 | `<svg role="img" aria-labelledby>` 或纯装饰 + 文字品牌 | 内联 SVG | atelier 出图 · stage 集成 |
| `PlateImage` | 植物图版（A2/A7）：图片 + 毛边遮罩 + 投影 + 放大镜 1.6× + 来源行 | loading(LQIP)/loaded/hover-lens/error | `alt` 必填（模式见 art-direction §7）；不阻塞点击；`decoding="async"` | 自定义 + shadcn `HoverCard`（可选） | stage |
| `FigureCaption` | 图注：PLATE 号、学名、俗名、科、来源 | 默认 / 紧凑 / 长文截断 | `<figcaption>`；11px 以上 | 原生 `figure/figcaption` | stage |
| `Marginalia` | 页边注（A9）：folio、采集号、坐标、竖排中文、手写旁注、色标 | 默认 / hover（仅链接）/ 移动折叠 | 装饰部分 `aria-hidden`；采集号链接可聚焦 | 自定义 | stage |
| `ReadoutStrip` | 底部温室读数（D8 活时钟）：FPS、延迟、相机、季节、输入 | 实时更新；离线/降级 | `aria-live="off"` + 每 30s `aria-live="polite"` 摘要；不逐秒朗读 | 自定义 | stage |
| `FieldNoteEntry` | 田野笔记条目：日期、标题、正文、手写批注 | 默认 / hover 引线 | `<article>`；日期 `<time>` | 自定义 | stage |
| `HandNote` | 手写旁注 + 1px 引线（仅田野笔记/落款） | 默认 / hover 引线延长 8px | 装饰性 `aria-hidden`；正文不依赖它 | 自定义 | stage |
| `TaxonomyBlock` | 标本分类学（C7）：学名/俗名/科属/采集号/日期/生境 | 默认 / 分享页 / 卡片紧凑 | `<dl>` 语义；学名 `<i lang="la">` | 原生 + `Badge` | stage |
| `DailySpecimen` | 每日一株（C3）：种子生成的今日卡 + 题记 | loading/ready/unavailable | `<aside>`；卡可点；`aria-live` 不重复 | 自定义 | stage |
| `NextActMarker` | 下一朵路标（C11）：`下一幕 → 授粉` | 默认 / hover | 链接；44px | 原生 `a` | stage |
| `AnnouncementMarquee` | 温室公告条（C12）：真实信息（本机/无上传/按 F） | 默认 / 暂停（hover/focus） | `role="marquee"` 慎用 → 用 `aria-label` + 可暂停；`prefers-reduced-motion` 静态 | 自定义 CSS 动画 | stage |
| `SeasonSwatch` | 四季节气色板（A4）：4 枚 8×8 色点 + 节气名 | 当前季 / 可选 | `role="list"`；当前 `aria-current` | 自定义 | stage |

---

## 3. Stage / 舞台（mechanics）

| 组件 | 用途 | 关键状态 | 可访问性 | Primitive | Owner |
|---|---|---|---|---|---|
| `StageFrame` | 首页嵌框 / `/touch` 全屏两种壳；负责尺寸、安全区、暗角、读数插槽 | framed / immersive / paused / quiet | 容器 `role="region"` + `aria-label`；`tabIndex=0` 接收键盘 | 自定义（`Stage.tsx` + `StageProps` 冻结） | mechanics |
| `StageCanvas` | WebGL/Canvas 渲染层：七种花 | 初始化/运行/降级/错误 | `aria-hidden`（画面本身无控件）；状态通过文本输出 | Three.js / Canvas2D | mechanics |
| `HandOverlay` | 21 点骨架/手形轮廓（B10） | 检测中/稳定/丢失/幽灵手 | 装饰 `aria-hidden` | Canvas2D | mechanics |
| `GhostHand` | 幽灵手自动演出（B11） | idle→playing→exit；reduced-motion 关闭自动播放 | 播放时 `aria-live` 提示「幽灵手演示」 | 引擎内置 | mechanics |
| `ModeRail` | 植物学检索表模式轨（A10）：7 行模式 + 手势 | 选中/hover/键盘/禁用 | `role="listbox"` 或 `role="tablist"`；↑↓/Home/End；`aria-selected`；44px 行 | 自定义 roving tabindex（不用 Tabs，因模式是状态不是页面） | stage + mechanics |
| `CareLabel` | 左下采集条件（B15/D8）：FPS、延迟、相机、季节、声音 | 实时 / 静默 / 离线 | `<dl>`；每秒更新不朗读；摘要 `aria-live="polite"` 每 30s | 自定义 | stage |
| `GestureHint` | 底部手势提示：5 枚线稿图标 + 文字 | 默认 / 当前手势高亮 / 空 | `aria-label`；图标 `aria-hidden`；文字 11px+ | 自定义内联 SVG | stage |
| `CollectButton` | 采集按钮（B14）：56×56 印章 | 默认/hover/press/loading/success/disabled | `aria-label="采集这一株"`；`aria-busy`；成功 toast | shadcn `Button`（icon，自定义样式） | stage |
| `CameraGate` | 摄像头未启用时的舞台遮罩（B13） | off/requesting/denied/unavailable/ready | 按钮组；`role="dialog"` 仅当模态；文案 `copy.camera.*` | shadcn `Dialog` 或内联面板 | stage |
| `PrivacyRitual` | 隐私仪式 3 步 dialog（B13） | 3 步 / 确认 / 关闭 | 焦点陷阱；`aria-labelledby`；进度 `1/3`；`Esc` 可退 | shadcn `Dialog`（Radix） | stage |
| `StagePauseOverlay` | 暂停/清屏状态 | paused / quiet | `role="status"`；恢复按钮可聚焦 | 自定义 | mechanics |
| `CollectDialog` | 采集卡编辑：题记输入、预览、保存 | 默认/输入/校验/保存中/成功/错误 | `Dialog`；label 关联；60 字限制；错误 `aria-describedby`；焦点到输入 | shadcn `Dialog` + `Textarea` + `Button` | stage |
| `SeasonControl` | 换季：4 个节气按钮（X 键） | 当前季/hover/键盘 | `role="radiogroup"`；方向键；`aria-checked` | Radix `ToggleGroup` 或 `RadioGroup` | stage |
| `SoundToggle` | 声音开关（S 键） | 关/开/静默模式 | `aria-pressed`；文字 `声音`；不自动播放 | shadcn `Switch` 或 `Button` | stage |
| `TouchShell` | `/touch` 外壳：极简 nav + 退出 + 键盘提示 | 进入/退出/静置 HUD 40% | landmark；退出 44px；`Esc` | 自定义 | stage |
| `HUD` | /touch 四角信息层（标识、模式轨、care label、手势、键盘） | 默认/静置/清屏 | 不遮挡舞台安全区；`aria-hidden` 装饰 + 可聚焦控件 | 组合组件 | stage |
| `StageError` | 引擎/模型加载失败 | 错误 / 重试 / 降级为指针 | `role="alert"`；重试按钮 | 自定义 | mechanics |

---

## 4. Archive / 归档（stage）

| 组件 | 用途 | 关键状态 | 可访问性 | Primitive | Owner |
|---|---|---|---|---|---|
| `SpecimenCard` | 标本卡（C7/A7）：图版、采集号、学名、俗名、季节、致谢 | default/hover/focus/loading | `<article>` + 链接；`aria-label` 含采集号；hover 放大镜不遮文字 | 自定义 + `PlateImage` + `Badge` | stage |
| `Gallery` | 卡片网格（4 列 / 2 列 / 1 列） | loading/empty/error/loaded | 列表语义 `<ul>`；每卡可聚焦；分页 `nav` | 自定义（不用 shadcn Card） | stage |
| `FilterBar` | 花式/季节/排序/搜索（C5） | 默认/已选/清空/移动 Sheet | `search` landmark；`ToggleGroup`；`aria-label`；`/` 聚焦 | shadcn `ToggleGroup` / `Select` / `Input` | stage |
| `SearchField` | 标本搜索 | 空/输入/无结果/清除 | `type="search"`；label 可见或 `aria-label`；去抖 240ms | shadcn `Input` + 自定义 | stage |
| `SortSelect` | 排序（最新/最早/致谢） | 默认/打开/选中 | Radix `Select` 键盘完整；`aria-label` | shadcn `Select` | stage |
| `ThanksButton` | 致谢（每访客一次） | 默认/已致谢/禁用/失败 | `aria-pressed`；计数 `aria-live` | shadcn `Button` | stage |
| `ShareSheet` | 分享面板：复制链接、下载卡、QR | 默认/复制成功/错误 | `Dialog`；复制成功 toast + `aria-live` | shadcn `Dialog` | stage |
| `SpecimenMeta` | 分类学信息列表（分享页） | 默认 / 紧凑 | `<dl>`；学名 italic | 原生 | stage |
| `DeleteDialog` | 删除确认（AlertDialog） | 默认/确认/删除中/错误 | `AlertDialog`；危险按钮用 danger 色 + 文案；不可撤销说明 | shadcn `AlertDialog` | stage |
| `EmptyState` | 空态：纸还是空的。 | empty/filtered-empty/error/offline | 标题 + 说明 + 一个动作；`role="status"` | 自定义 | stage |
| `Pagination` | 分页 / 加载更多 | 有下一页/加载中/没有更多 | `nav`；按钮 44px；加载状态 `aria-busy` | 自定义 / shadcn `Button` | stage |

---

## 5. Share / 分享（server + stage）

| 组件 | 用途 | 关键状态 | 可访问性 | Primitive | Owner |
|---|---|---|---|---|---|
| `ShareCard` | 分享页标本卡（C6）：canvas 560×700 + QR | loading/loaded/error | `<img alt>`（服务端生成）；QR `alt` | 服务端 canvas → `<img>` | server |
| `QRBlock` | 二维码 + `扫码看这一株` | 默认/长地址 | 图片 alt；下方文字说明 | server 生成 | server |
| `OGMeta` | meta/OG/Twitter/JSON-LD | — | `<head>` 注入；`lang` 正确 | SSR HTML | server |
| `DeleteTokenPanel` | 删除凭证说明 | 默认 / 已删除 | 文本 + 按钮；危险确认 | 原生 + `AlertDialog` | stage |

---

## 6. UI primitives / 基础件（stage，shadcn/Radix）

| 组件 | 用途 | 变体 / 状态 | 可访问性 | shadcn / Radix primitive |
|---|---|---|---|---|
| `Button` | 主操作 | `ink`（实心 ink 底 paper 字）/ `outline`（1px ink，透明底）/ `text-arrow`（下划线 + →）/ `icon`（44×44）/ `danger` | 44px；disabled 42% 不透明度；focus 环；图标需 `aria-label` | shadcn `Button`（Radix `Slot`） |
| `IconButton` | 纯图标按钮 | 44×44；描边/幽灵 | 必须 `aria-label`；tooltip 可选但非唯一标签 | shadcn `Button size="icon"` |
| `Badge` | 状态点/标签（季节、模式） | 8×8 点 + 11px 文字；`moss/pollen/peony` 变体 | 文字可读；不单靠颜色 | 自定义（非圆角 pill；`--hm-radius-input`） |
| `Chip` | 筛选 chip | 默认/选中（ink 反白）/dis 可 | `aria-pressed`；≥32px 高、44px 命中 | Radix `ToggleGroup` 自定义 |
| `Tabs` | 内页分区（图鉴/标本馆） | 默认/选中 | Radix Tabs 键盘；`aria-controls` | shadcn `Tabs` |
| `Accordion` | 移动筛选 / 图鉴条目 | 折叠/展开 | Radix `Accordion`；`aria-expanded` | shadcn `Accordion` |
| `Dialog` | 对话框（采集/隐私/分享/命令） | open/close | 焦点陷阱、`Esc`、`aria-modal`、返回焦点 | shadcn `Dialog`（Radix） |
| `AlertDialog` | 破坏性确认（删除） | 默认/确认中 | 默认焦点在「留着」；危险按钮最后 | shadcn `AlertDialog` |
| `Sheet` | 移动端菜单/筛选 | open/close | 同 Dialog；触屏滑出 | shadcn `Sheet` |
| `Tooltip` | 图标释义（仅补充） | hover/focus | Radix Tooltip；不承载必要信息；触屏不用 | shadcn `Tooltip` |
| `CommandPalette` | ⌘K 指令抽屉（C8） | 关闭/搜索/空结果/执行 | cmdk 键盘导航；输入框聚焦；结果 `aria-selected`；`Esc` 关闭 | shadcn `Command`（cmdk） |
| `Toast` | 短反馈（采集/复制/错误） | 进入/停留 5s/退出 | `role="status"`；不抢焦点；`aria-live` | sonner（shadcn `Sonner`）或 Radix Toast |
| `Slider` | 音量/强度 | 默认/拖动/禁用 | Radix Slider；`aria-valuetext`；44px 滑轨命中 | shadcn `Slider` |
| `Switch` | 声音/夜花园 | on/off | Radix Switch；`aria-checked`；文字标签 | shadcn `Switch` |
| `Select` | 排序/筛选 | 默认/打开 | Radix Select；键盘完整 | shadcn `Select` |
| `DropdownMenu` | 卡片操作（打开/分享/删除） | 默认/打开 | Radix DropdownMenu；`aria-haspopup` | shadcn `DropdownMenu` |
| `Popover` | 色标/图版说明 | 打开/关闭 | Radix Popover；`Esc` | shadcn `Popover` |
| `HoverCard` | 图版悬停放大提示（可选） | hover | 不当唯一信息；触屏不依赖 | shadcn `HoverCard` |
| `ScrollArea` | 长列表/抽屉 | 默认 | 保留原生滚动；键盘可用 | shadcn `ScrollArea`（Radix） |
| `Separator` | 发丝线 | 横/竖 | 装饰 `aria-hidden` | Radix `Separator` |
| `SkeletonPaper` | 加载占位（纸色块，无 shimmer） | loading | `aria-busy`；≤1.2s 给真实态 | 自定义（不用 shimmer） |
| `Onboarding` | 首次引导（3 步） | 关闭/完成 | Dialog；可跳过；不自动弹出超过一次 | shadcn `Dialog` |
| `NotFound` | 404 页 | 默认/离线 | `<h1>`；两个动作 | 自定义页面 |
| `ErrorBoundaryFallback` | 运行时错误页 | error | `role="alert"`；重试/回园门 | 自定义 |
| `ThemeToggle` | 夜花园开关 | light/night | `aria-pressed`；持久化 | shadcn `Switch` 或 `Button` |
| `LanguageToggle` | 中/EN | zh/en | `aria-label`；切换后 `lang` 属性更新 | shadcn `Button` |
| `Marquee` | 公告条 | 滚动/暂停 | 可暂停；reduced-motion 静态；`aria-label` | 自定义 |
| `Progress` | 采集/上传进度（本地） | 进行中/完成 | Radix `Progress`；`aria-valuenow` | shadcn `Progress`（如需要） |

---

## 7. 组件状态矩阵（必须实现）

| 组件 | 必须覆盖的状态 |
|---|---|
| `StageFrame` | framed / immersive / paused / quiet / camera-on / camera-denied / error / reduced-motion |
| `ModeRail` | 7 选中 / hover / focus / keyboard / 手机横向滚动 / 禁用（引擎未就绪） |
| `SpecimenCard` | loading / default / hover / focus / long-caption / missing-image / deleted |
| `Gallery` | loading / empty / filtered-empty / error / offline / pagination-end |
| `CollectDialog` | default / caption-too-long / saving / success / error / offline |
| `CameraGate` | off / requesting / on / denied / unavailable / no-secure-context |
| `ShareSheet` | default / copy-success / copy-error / qr-loading / delete-available |
| `CommandPalette` | closed / open / query / no-results / action-success |
| `Nav` | default / scrolled / current-act / mobile-open / night |
| `ReadoutStrip` | live / degraded (45fps) / offline / paused |

---

## 8. 组件与创新的对应

| 创新 | 组件 |
|---|---|
| A1 藤蔓字标 | `PlantWordmark` |
| A2 活体图版 | `HeroGate` + `PlateImage` + `StageFrame` |
| A3 编辑字体 | 全部组件的 typography 类（`.hm-mega`…） |
| A4 季节色板 | `SeasonSwatch` + `SeasonControl` |
| A5 纸→露水转场 | `StageFrame` + 转场层 |
| A8 放大镜光标 | `PlateImage` + base.css cursor |
| A9 页边注 | `Marginalia` |
| A10 检索表模式轨 | `ModeRail` |
| A11 夜花园 | `ThemeToggle` + `[data-theme]` |
| A12 press F | `CollectButton` + 快捷键 hook |
| B1/B2/B3/B4 舞台 | `StageFrame` + `StageCanvas` |
| B10 21 点 | `HandOverlay` + 图鉴解剖 |
| B11 幽灵手 | `GhostHand` + `GhostHandHint` |
| B12 三路输入 | `Nav` 提示 + `StageFrame` + `GestureHint` |
| B13 隐私仪式 | `PrivacyRitual` + `CameraGate` |
| B14 种子采集 | `CollectButton` + `CollectDialog` |
| C1 四幕叙事 | `ChapterRail` + `ActIntro` |
| C3 每日一株 | `DailySpecimen` |
| C4 田野笔记 | `FieldNoteEntry` + `HandNote` |
| C5 标本馆筛选 | `FilterBar` + `Gallery` + `SpecimenCard` |
| C6 分享页 | `ShareCard` + `QRBlock` + `OGMeta` |
| C7 标本卡分类学 | `TaxonomyBlock` + `SpecimenMeta` |
| C8 ⌘K | `CommandPalette` |
| C10 404/离线 | `NotFound` + `OfflineBanner` |
| D5 声景 | `SoundToggle` + 引擎 sound layer |
| D8 活时钟 | `ReadoutStrip` + `CareLabel` |

---

## 9. 文件地图（建议，不占用写域）

```
apps/web/src/components/
  shell/      AppShell Nav ChapterRail NavMobile Footer SkipLink OfflineBanner
  editorial/  HeroGate ActIntro PlantWordmark PlateImage FigureCaption Marginalia
              ReadoutStrip FieldNoteEntry HandNote TaxonomyBlock DailySpecimen
              NextActMarker AnnouncementMarquee SeasonSwatch
  stage/      Stage.tsx StageFrame StageCanvas HandOverlay GhostHand SoundLayer
              ModeRail CareLabel GestureHint CollectButton CameraGate PrivacyRitual
              StagePauseOverlay CollectDialog SeasonControl SoundToggle TouchShell
  archive/    SpecimenCard Gallery FilterBar SearchField SortSelect ThanksButton
              ShareSheet SpecimenMeta DeleteDialog EmptyState Pagination
  ui/         button dialog alert-dialog sheet tooltip command toast slider switch
              tabs accordion select dropdown-menu popover hover-card scroll-area
              separator badge chip marquee skeleton-paper onboarding
  pages/      HomePage TouchPage FieldGuidePage HerbariumPage NotFoundPage
```

**不新增**：Card、GlassPanel、GlowButton、ParticleBackground、FeatureGrid 这类通用 SaaS 组件——它们会破坏艺术方向。

---

*新增组件前先回答三件事：它替代哪个现有组件？它的 reduced-motion 终态是什么？它引用了哪些 token？*