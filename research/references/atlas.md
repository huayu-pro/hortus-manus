# One Page Love Atlas · 77 站（目标 55，实际 77）

> 数据来源：One Page Love 官方 MCP（`https://api.onepagelove.com/mcp`，`search_inspiration`），14 组查询去重后得 **77 个候选**，全部 77 站通过筛选。
> 每站：桌面 1440×900 + 移动 390×844 截图（Playwright/Chromium 1243，单浏览器串行），HTML、响应头、技术指纹落盘。
> 逐站原始数据：`screenshots.json`、`fingerprint/{slug}.json`、`html/{slug}.html`、`headers/{slug}.json`、`candidates.json`、`raw/*.json`（14 组 MCP 原始 SSE）。
> 截图：`screens/{slug}/desktop.jpg`（1440×900）、`screens/{slug}/mobile.jpg`（390×844）。接触表：`contact/desktop-part1.jpg`、`contact/desktop-part2.jpg`、`contact/mobile-contact.jpg`。
> 表里"3 手法"与"1 可转化技术"是基于**实际截图 + 实测指纹**的读解，不是文案复述；"→ID"映射到 `docs/contract.md` §5 的 A/B/C/D/E 创新编号。

## 查询批次（14 组）

| # | 查询 | 类型 | 返回 | 新增去重 |
|---|---|---|---|---|
| 1 | botanical nature | query | 10 | 4 |
| 2 | editorial | query | 10 | 10 |
| 3 | experimental | query | 10 | 10 |
| 4 | 3D | query | 10 | 10 |
| 5 | typographic | query | 10 | 6 |
| 6 | scroll effects | query | 10 | 10 |
| 7 | minimal | query | 10 | 3 |
| 8 | portfolio | query | 10 | 2 |
| 9 | art | query | 10 | 8 |
| 10 | interactive | query | 10 | 1 |
| 11 | garden | query | 8 | 3 |
| 12 | tech=three.js | tech | 8 | 2 |
| 13 | tech=gsap | tech | 8 | 2 |
| 14 | photography | query | 8 | 6 |

合计 **77 个唯一站点**（`candidates.json` 记录每站命中的查询）。

## 技术指纹总览

| 技术 | 站点数 | 说明 |
|---|---|---|
| Framer | 6 | angelo / ayush-halder-portfolio / britt-taylor / deeo-studio-2 / park / + 1 |
| Webflow | 2 | artem-taradash / belgrade-architecture |
| Astro | 5 | cape-town / city-of-angels / dabbit / felix-haas / svg-doodles |
| Next.js (`__NEXT_DATA__`) | 2 | bausola-banch / gardener |
| gsap（含 ScrollTrigger/SplitText） | 8 | duo-case / gunes / isa-de-burgh / jopecuro / kern-society / magma / voice-tag-gods / artem |
| Lenis | 8 | artem / city-of-angels / duo-case / isa-de-burgh / kern-society / magma / shelf / superlocal / swash |
| 有 canvas | 31 | 其中 3+ canvas 的 12 站（dabbit 8、angelo 8、melike 8、the-equator 7、rows 6、berd 4、textmode 4、grilled 4、superlocal 3、applied 3、bausola 3、flashform 3、hedroom 3） |
| WebGL 上下文 | 77 站中 31 站可创建（软件渲染），实际使用 WebGL 的约 6 站 | angelo / deeo(Spline) / dabbit / the-equator / rows / berd |
| Spline | 1 | deeo-studio-2（`spline-viewer.js`） |
| Matter.js | 1 | possible-monuments |
| Readymag | 2 | april / is-that-pigeon |
| Squarespace / Cargo | 2 | everline-studio / stolaze |
| 自托管字体 | 约 40 站 | 大量 PP Neue Montreal / ABC Diatype / Founders Grotesk / Suisse Intl / Reckless |

## 55 → 77 站表

| # | 站点 | URL | 字体（展示 / 正文 / 等宽） | 技术指纹（实测） | 3 条"为什么高级" | 1 条可转化技术 → ID | 截图 |
|---|---|---|---|---|---|---|---|
| 1 | **Abdullah** | https://helloabdullah.com | Bricolage Grotesque / Instrument Sans | static · no canvas · Vercel · 10.7 screens | 超大字号标题配极小正文，对比落差即气质；两枚圆形头像作为唯一图形元素，避免装饰噪声；全站只有一个 CTA，行动路径零歧义 | 单一 display 字体 + 1 CTA 的极简首屏，把预算全押在字号与留白 → A3/D3 | [桌面](screens/abdullah/desktop.jpg) · [移动](screens/abdullah/mobile.jpg) |
| 2 | **Angelo** | https://angelo.so/ | sans-serif / sans-serif | Framer ab24241 · 8 canvas+WebGL · Framer/ad3cf8f · 1.0 screens | 8 个 canvas 元素各自独立渲染小球，像标本陈列；球体有真实折射与高光，材质而非贴图；标题被球体遮住一部分，制造景深 | 多 canvas 分治：每个标本一个 canvas，避免单个 WebGL 上下文过载 → B10/A7 | [桌面](screens/angelo/desktop.jpg) · [移动](screens/angelo/mobile.jpg) |
| 3 | **Aniket** | https://unfunnyket.com | GeistSans / GeistSans | static · 1 canvas+WebGL · Vercel · 1.8 screens | 整页只有 1.6 屏高，信息密度极低；单一 Geist 字体贯穿，无字体混排；留白即结构，不靠分割线 | 单字体 + 极短页高，用"页高"作为设计约束 → A3 | [桌面](screens/aniket/desktop.jpg) · [移动](screens/aniket/mobile.jpg) |
| 4 | **Applied Imagination** | https://applied-imagination.gpc.consulting | fsKim / gtAmerica / gtAmericaMono | static · 3 canvas+WebGL · Vercel · 22.8 screens | 衬线大标题与摄影背景叠压，编辑感强；20k 页高但首屏只讲一句话；gtAmerica 与 fsKim 双字体分工（正文/展示） | 展示衬线 + 无衬线正文双字体分工，标题叠在摄影上 → A3/A2 | [桌面](screens/applied-imagination/desktop.jpg) · [移动](screens/applied-imagination/mobile.jpg) |
| 5 | **April Leihuanani Evangelista** | https://aprilleihuanani.com | lgwy / -apple-system | Readymag · no canvas · Caddy
nginx · 1.0 screens | Readymag 的版式自由度带来杂志感；自定义字体 lgwy 作为个人标识；极短页高，像一张名片 | 用 Readymag 类工具的自定义字体能力做个人字标 → A1 | [桌面](screens/april-leihuanani-evangelista/desktop.jpg) · [移动](screens/april-leihuanani-evangelista/mobile.jpg) |
| 6 | **ARCHIV** | https://www.archiv.systems/ | Helvetica Neue / Helvetica Neue | static · no canvas · Vercel · 1.0 screens | 单一 Helvetica 的瑞士式克制；唯一物件居中，像博物馆展签；页高恰好 900px（一屏） | 一屏一物件的"展签"版式：物件居中 + 说明文字在下 → C7 | [桌面](screens/archiv/desktop.jpg) · [移动](screens/archiv/mobile.jpg) |
| 7 | **Artem Taradash** | https://taradash.me/ | Explorersdiatypecyrillic / Arial | Webflow + gsap 3.15.0 + Lenis + gsap.min.js · no canvas · cloudflare · 26.2 screens | Lenis 平滑滚动让长文阅读有"纸感"；gsap 段落入场与滚动绑定；照片与文字交替形成节奏 | Lenis + ScrollTrigger 的长文滚动编排（段落错位入场） → D2 | [桌面](screens/artem-taradash/desktop.jpg) · [移动](screens/artem-taradash/mobile.jpg) |
| 8 | **Artist Royalty Movement** | https://peggy.com/royalties | Reckless / Inter | static · no canvas · Fly/366e4bf88 (2026-10-27) · 6.7 screens | 衬线标题 + 高饱和黄色道具，色彩锚点明确；左右分栏：主张在左，证据在右；6k 页高，论证式长页 | 左论点右证据的双栏论证版式 → C2 | [桌面](screens/artist-royalty-movement/desktop.jpg) · [移动](screens/artist-royalty-movement/mobile.jpg) |
| 9 | **Ayush Halder Portfolio** | https://www.thoughtsofayush.com | sans-serif / sans-serif | Framer 13ebf9e + Lenis · no canvas · Framer/ad3cf8f · 12.0 screens | Lenis 惯性滚动贯穿全站；Geist 与 Inter 双无衬线，层级靠字号；作品以卡片横滑呈现 | 惯性滚动 + 字号层级（不用颜色区分层级） → D2 | [桌面](screens/ayush-halder-portfolio/desktop.jpg) · [移动](screens/ayush-halder-portfolio/mobile.jpg) |
| 10 | **Bausola Banch** | https://banch.bausola.com/ | industry / industry | Next.js · 3 canvas+WebGL · Vercel · 12.3 screens | 网格线作为唯一"图形"，极简但可读；industry 窄体大写字，工业感；11k 页高，项目逐条展开 | CSS 网格线当装饰层（1px 线 + 大量留白） → A9 | [桌面](screens/bausola-banch/desktop.jpg) · [移动](screens/bausola-banch/mobile.jpg) |
| 11 | **Architecture of Socialist-Era Belgrade** | https://belgrade.klmln.com | IntraNet / Funnel Sans | Webflow · no canvas · Vercel · 81.4 screens | 红字 + 灰照片的单色强调，极强；73k 页高 = 图片长卷式叙事；IntraNet 窄体字与 Funnel Sans 混排 | 单色强调色（只用一种红）压在去饱和摄影上 → A4/A7 | [桌面](screens/belgrade-architecture/desktop.jpg) · [移动](screens/belgrade-architecture/mobile.jpg) |
| 12 | **Berd** | https://berd.xyz/ | Inter var / Cash Sans | berd-brush-paths.js + step-brush-paths.js · 4 canvas+WebGL · cloudflare · 5.4 screens | 自研笔刷路径脚本，线条像手绘；Cash Sans 的怪诞字与干净底反差；canvas 只做局部笔触，不做全屏 | 自研 SVG/Canvas 笔刷路径（berd-brush-paths.js 思路）→ 藤蔓字标 → A1 | [桌面](screens/berd/desktop.jpg) · [移动](screens/berd/mobile.jpg) |
| 13 | **Bob Moll** | https://bobmoll.tech | Arial / Arial | static · no canvas · Apache · 1.0 screens | 纸纹理背景 + 纯黑字，印刷感；横向图片带像接触表；荧光绿只出现在页脚一条，克制 | 纸纹理底 + 单条荧光色作为页脚签名 → A6/D7 | [桌面](screens/bob-moll/desktop.jpg) · [移动](screens/bob-moll/mobile.jpg) |
| 14 | **Britt Taylor** | https://www.btay.ca | Inter Display / sans-serif | Framer a56d1fd · no canvas · Framer/ad3cf8f · 11.9 screens | 手写体只用于个别词，像批注；拼贴色块 + 卡通插画，童趣但不廉价；10k 页高，章节式滚动 | 手写体仅用于"批注词"，其余用展示衬线 → A9 | [桌面](screens/britt-taylor/desktop.jpg) · [移动](screens/britt-taylor/mobile.jpg) |
| 15 | **bueno.fyi** | https://bueno.fyi | Inter / Inter | static · no canvas · Apache · 4.3 screens | 搜索框即首屏主体，功能即设计；Inter 单字体，无装饰；列表行高宽松，可扫读 | 把搜索框做成首屏主视觉（功能前置） → C5 | [桌面](screens/bueno-fyi/desktop.jpg) · [移动](screens/bueno-fyi/mobile.jpg) |
| 16 | **ByMayo** | https://bymayo.co.uk/ | PP Neue Montreal / PP Neue Montreal / IBM Plex Mono | static · no canvas · Vercel · 1.4 screens | 三字体分工：展示/等宽/复古；页高仅 1223px，像一张海报；等宽字体用于标签，制造技术感 | 等宽字体做标签层（IBM Plex Mono 对应 contract 的标签系统） → A3 | [桌面](screens/bymayo-2/desktop.jpg) · [移动](screens/bymayo-2/mobile.jpg) |
| 17 | **Cape Town Dam Levels Today** | https://capetowndamlevels.co.za/ | Barlow / Barlow / IBM Plex Mono | Astro v4.16.19 + Astro · no canvas · Netlify · 9.3 screens | 深蓝底 + 大号数字，数据即主角；Playfair 衬线做标题，Barlow 做数据；图表用几何色块而非库默认样式 | 大号数字读数 + 衬线标题的数据叙事版式 → C3 | [桌面](screens/cape-town-dam-levels-today/desktop.jpg) · [移动](screens/cape-town-dam-levels-today/mobile.jpg) |
| 18 | **City of Angels** | https://cityxofxangels.com | ABC Diatype / ABC Diatype / Founders Grotesk Mono | Astro v7.0.7 + Lenis · no canvas · cloudflare · 7.0 screens | 标题与照片同色系，融为一体；ABC Diatype 的宽体大写有海报感；Lenis 平滑滚动 | 标题色 = 背景照片主色的同色系处理 → A4 | [桌面](screens/city-of-angels/desktop.jpg) · [移动](screens/city-of-angels/mobile.jpg) |
| 19 | **Congrue** | https://www.congrue.ai | Perfektta / Instrument Sans / DM Mono | static · 1 canvas+WebGL · Vercel · 10.3 screens | 等距 3D 盒子作为产品隐喻；Perfektta 展示字 + DM Mono 标签；深色底衬托产品图 | 等距（isometric）插画代替截图，统一视角 → A7 | [桌面](screens/congrue/desktop.jpg) · [移动](screens/congrue/mobile.jpg) |
| 20 | **Dabbit** | https://dabbit.app | InterVariable / InterVariable | Astro v7.3.3 + Astro · 8 canvas+WebGL · cloudflare · 7.3 screens | 8 个 canvas 各司其职（取色器/背景/粒子）；产品即页面：取色器就是首屏；InterVariable 可变字重 | 产品控件本身作为首屏主视觉（dogfooding） → B12 | [桌面](screens/dabbit/desktop.jpg) · [移动](screens/dabbit/mobile.jpg) |
| 21 | **davesocozy** | https://davesocozy.com | Martian Mono / Martian Mono / Martian Mono | static · 1 canvas+WebGL · Vercel · 1.0 screens | 等宽字体 + 绿底 = 复古终端；PONG 小游戏作为首屏互动；页高 900px 一屏 | 等宽字体 + 单色底做"终端美学"（可转成标本馆目录） → A3 | [桌面](screens/davesocozy/desktop.jpg) · [移动](screens/davesocozy/mobile.jpg) |
| 22 | **Deeo Studio** | https://deeo.studio | PP Editorial New Ultralight / sans-serif | Framer 9801af1 + spline-viewer.js · no canvas · Framer/ad3cf8f · 13.9 screens | Spline 内嵌 3D 场景（spline-viewer.js）；超细展示衬线压在大留白上；滚动时 3D 物件旋转 | Spline 内嵌 3D 作为滚动章节的锚点物件 → A2 | [桌面](screens/deeo-studio-2/desktop.jpg) · [移动](screens/deeo-studio-2/mobile.jpg) |
| 23 | **Digital Original™** | https://digitaloriginal.app/ | Neue Montreal / Neue Montreal | static · no canvas · cloudflare · 14.5 screens | PP Eiko 的复古展示字与 Neue Montreal 分工；摄影色调统一（暖橙）；视频作为首屏而非图片 | 全站统一暖色调摄影 + 展示字（色彩纪律） → A4 | [桌面](screens/digital-original/desktop.jpg) · [移动](screens/digital-original/mobile.jpg) |
| 24 | **Digital Original XR** | https://digitaloriginal.app/xr | Neue Montreal / Neue Montreal | static · no canvas · cloudflare · 13.8 screens | 同一品牌不同子页共用字体系统；3D 装置白模，不抢文案；首屏只有一句话 + 一个 CTA | 品牌字体系统跨子页复用（设计 token 化） → A3 | [桌面](screens/digital-original-xr/desktop.jpg) · [移动](screens/digital-original-xr/mobile.jpg) |
| 25 | **Duo Case** | https://www.duocase.lol | -apple-system / -apple-system | gsap 3.13.0 + ScrollTrigger + SplitText + Lenis + Lenis + gsap.min.js · no canvas · cloudflare · 10.2 screens | SplitText 逐字入场；深色底 + 产品高光，像发布会；滚动时手机翻转 | SplitText 逐字/逐行入场（对应 D3 字体入场） → D3 | [桌面](screens/duo-case/desktop.jpg) · [移动](screens/duo-case/mobile.jpg) |
| 26 | **E. Stewart &amp; Associates** | https://estewartandassociates.com/ | Saol Display / Source Sans Pro | tweenmax.min.js · no canvas · Apache · 7.9 screens | 暗绿摄影 + 衬线标题，老钱感；长句标题直接当主视觉；7k 页高，服务型长页 | 长句衬线标题占满首屏（文案即版式） → C2 | [桌面](screens/e-stewart-associates/desktop.jpg) · [移动](screens/e-stewart-associates/mobile.jpg) |
| 27 | **Eight Shot** | https://www.cookedapps.com/eight-shot | Be Vietnam Pro / Be Vietnam Pro | static · no canvas · UploadServer · 4.7 screens | 样片拼贴证明产品能力；单一无衬线字体，靠图片层级；CTA 双按钮并列 | 样片拼贴墙作为"证据层" → A7 | [桌面](screens/eight-shot/desktop.jpg) · [移动](screens/eight-shot/mobile.jpg) |
| 28 | **estacion venenta** | https://estacionvenenta.com | Helvetica / Times New Roman | static · 1 canvas+WebGL · cloudflare · 1.0 screens | 单 canvas 画极细线网，像线框雕塑；默认 Helvetica 反而克制；页高 900px | 单 canvas 细线网（可直接对应 tendril 的线网） → B3 | [桌面](screens/estacion-venenta/desktop.jpg) · [移动](screens/estacion-venenta/mobile.jpg) |
| 29 | **Eventually** | https://geteventually.com | DM Sans / DM Sans | static · no canvas · Vercel · 2.8 screens | Instrument Serif 斜体点缀 DM Sans；标题用口语，不像营销；2.5k 页高，短页 | Instrument Serif + 无衬线混排（contract 已定同款字体） → A3 | [桌面](screens/eventually/desktop.jpg) · [移动](screens/eventually/mobile.jpg) |
| 30 | **Everline Studio** | https://onepagelove.com/go/everline-studio | BenchNine / sans-serif | gsap 3.1.1 + Typed + gsap.min.js · 2 canvas+WebGL · Squarespace · 6.3 screens | 荧光黄底 + 黑窄体字，强对比；Typed 打字机效果做副标题；工作室作品以横条滚动 | 单色高饱和底 + 窄体大写（色彩块即品牌） → A4 | [桌面](screens/everline-studio/desktop.jpg) · [移动](screens/everline-studio/mobile.jpg) |
| 31 | **Felix Haas** | https://felixhaas.io/ | Geist / Geist | static · no canvas · Vercel · 17.4 screens | 首屏像一封信，私密感；Geist 单字体，无装饰；滚动像读长信 | 书信体长页（第一人称叙事） → C2 | [桌面](screens/felix-haas/desktop.jpg) · [移动](screens/felix-haas/mobile.jpg) |
| 32 | **Flashform** | https://flshfrm.com | Aeonik / NeueHaas | static · 3 canvas+WebGL · Vercel · 1.0 screens | 产品 UI 截图直接当首屏；Aeonik 几何无衬线 + Recife 衬线点缀；深色底衬托表单 | 产品界面截图 + 极简说明（dogfooding 首屏） → B12 | [桌面](screens/flashform/desktop.jpg) · [移动](screens/flashform/mobile.jpg) |
| 33 | **Flowjam** | http://flowjam.com | Gelica / Arial | static · no canvas · Vercel · 16.2 screens | Gelica 衬线标题带复古；缩略图网格像作品集索引；14k 页高 | 缩略图网格 + 衬线标题的作品索引 → C5 | [桌面](screens/flowjam-2/desktop.jpg) · [移动](screens/flowjam-2/mobile.jpg) |
| 34 | **Gardener** | https://www.gardener.nyc/ | PP Neue Montreal / PP Neue Montreal | Next.js · no canvas · Vercel · 8.1 screens | 园艺主题但用现代无衬线，不俗气；米白底与植物绿形成自然色；服务列表用大留白 | 园艺主题的现代排版（正好对应 HORTUS 的调性） → A4 | [桌面](screens/gardener/desktop.jpg) · [移动](screens/gardener/mobile.jpg) |
| 35 | **Grilled Pixels Ecommerce** | https://www.grilledpixels.com/ecommerce | untitledSans / Times New Roman / tronicaMono | static · 4 canvas+WebGL · Vercel · 1.0 screens | 等宽字体做价格/规格标签；4 canvas 做局部动效；商品图统一白底 | 等宽字体承担"规格/价格"数据层 → A3 | [桌面](screens/grilled-pixels-ecommerce/desktop.jpg) · [移动](screens/grilled-pixels-ecommerce/mobile.jpg) |
| 36 | **Gunes Atakan Peksen** | https://gunespeksen.com | Futura PT / Futura PT | gsap 3.15.0 + SplitText + gsap.min.js + customease.min.js · no canvas · 1.0 screens | Futura PT 几何字与摄影网格；SplitText 逐字入场；CustomEase 定制缓动 | CustomEase 定制缓动曲线（不是默认 ease） → D1 | [桌面](screens/gunes-atakan-peksen/desktop.jpg) · [移动](screens/gunes-atakan-peksen/mobile.jpg) |
| 37 | **HEDROOM™** | https://www.hedroom.fm/ | Helvetica Now Text / Helvetica Now Text | static · 3 canvas+WebGL · Vercel · 1.0 screens | Helvetica Now 的大小光学尺寸分工；3 canvas 做局部效果；视频为主视觉 | 同一字体家族的光学尺寸（Display/Text）分工 → A3 | [桌面](screens/hedroom/desktop.jpg) · [移动](screens/hedroom/mobile.jpg) |
| 38 | **Humanoid Index** | https://humanoid-index.com/ | GeistSans / GeistSans | static · no canvas · Vercel · 1.0 screens | 3D 人形作为唯一主体；Geist 单字体；页高 900px 一屏 | 单一 3D 主体 + 极简底（不堆粒子） → A2 | [桌面](screens/humanoid-index/desktop.jpg) · [移动](screens/humanoid-index/mobile.jpg) |
| 39 | **I & Me Coffee** | https://www.iandmecoffee.com/ | Moldin Condensed / Saira Condensed | static · no canvas · Vercel · 21.4 screens | 窄体字 + 咖啡摄影，货架感；长页讲述产地故事；色板限定在棕/奶白 | 窄体字 + 单一色系的长页品牌叙事 → C2 | [桌面](screens/i-me-coffee/desktop.jpg) · [移动](screens/i-me-coffee/mobile.jpg) |
| 40 | **invoicemon** | https://invoicemon.com | inter / inter | static · no canvas · Vercel · 1.9 screens | 产品截图 + 短文案，极短页；inter 单字体；一屏讲完价值 | 一屏产品页（页高 < 2 屏） → B12 | [桌面](screens/invoicemon/desktop.jpg) · [移动](screens/invoicemon/mobile.jpg) |
| 41 | **Is That Pigeon a Fed?** | https://readymag.website/u2492934797/isthatpigeonafed/ | -apple-system / -apple-system | Readymag · no canvas · nginx · 1.0 screens | 黑底 + 单张动物摄影，剧场感；标题就是问题，制造好奇；Readymag 版式自由 | 疑问句标题 + 单张摄影（叙事钩子） → C2 | [桌面](screens/is-that-pigeon-a-fed/desktop.jpg) · [移动](screens/is-that-pigeon-a-fed/mobile.jpg) |
| 42 | **Isa de Burgh** | https://isadeburgh.com | FoundersGroteskCondensedMedium / FoundersGroteskCondensedMedium | gsap 3.13.0 + ScrollTrigger + SplitText + Lenis + gsap.js + draggable.min.js · no canvas · Apache · 9.5 screens | Condensed 大写字 + 作品全屏；Lenis 平滑滚动；8.5k 页高 | Condensed 展示字 + 全屏作品（画廊式滚动） → D2 | [桌面](screens/isa-de-burgh/desktop.jpg) · [移动](screens/isa-de-burgh/mobile.jpg) |
| 43 | **Jeff Wall** | https://www.jeffwall.me/ | Times New Roman / Times New Roman | static · 1 canvas+WebGL · Vercel · 1.0 screens | Times 默认衬线反而像艺术书；暗绿夜景作为唯一图像；页高 900px | 默认衬线 + 单张夜景（低成本高气质） → A4 | [桌面](screens/jeff-wall/desktop.jpg) · [移动](screens/jeff-wall/mobile.jpg) |
| 44 | **Jopecuro** | https://jopecuro.com | Satoshi / Satoshi | gsap 3.12.5 + ScrollTrigger + Lenis + gsap.min.js · no canvas · nginx · 13.2 screens | Clash Display 的怪诞展示字；橙色单一强调色；11k 页高滚动叙事 | Clash Display 类怪诞展示字做标题（对应 A3） → A3 | [桌面](screens/jopecuro/desktop.jpg) · [移动](screens/jopecuro/mobile.jpg) |
| 45 | **Josh Puckett** | https://joshpuckett.me/ | Signifier / system-ui | static · 1 canvas+WebGL · Vercel · 28.3 screens | Signifier 衬线长文阅读体验；1 canvas 做轻微噪点/纸纹；25k 页高，纯文字为主 | 长文衬线排版 + canvas 纸纹叠加（A6 咬墨） → A6 | [桌面](screens/josh-puckett/desktop.jpg) · [移动](screens/josh-puckett/mobile.jpg) |
| 46 | **Kern Society** | https://shockingmike.github.io/kern-society | Roboto Flex / Roboto Flex | gsap 3.15.0 + ScrollTrigger + SplitText + Lenis + Lenis + gsap.min.js · 1 canvas+WebGL · GitHub.com · 9.0 screens | 可变字体 Roboto Flex 做字重动画；红条像印刷色标；SplitText 逐字入场 | 可变字体字重/字宽动画（variable font animation） → A3/D3 | [桌面](screens/kern-society/desktop.jpg) · [移动](screens/kern-society/mobile.jpg) |
| 47 | **Lorenzo Bocchi - Shot on iPhone** | https://shotoniphone.lorenzobocchi.com | GeistSans / GeistSans | Next.js · 1 canvas+WebGL · Vercel · 1.0 screens | 全黑底让照片发光；等宽网格排列，像接触表；Geist 单字体 | 黑底 + 等尺寸网格的摄影接触表版式 → A7 | [桌面](screens/lorenzo-bocchi-photography/desktop.jpg) · [移动](screens/lorenzo-bocchi-photography/mobile.jpg) |
| 48 | **Magma** | https://magma.build | Feature deck light / Ppneuemontreal | gsap 3.12.5 + ScrollTrigger + SplitText + Lenis + Lenis + gsap.min.js · no canvas · cloudflare · 7.8 screens | 深色 + 渐变光效但克制；gsap 滚动编排；7k 页高 | 深色底 + 单点光效（不用霓虹渐变） → D1 | [桌面](screens/magma/desktop.jpg) · [移动](screens/magma/mobile.jpg) |
| 49 | **Make Garden** | https://www.makegarden.uk/ | East Sea Dokdo:Regular / ui-sans-serif | static · no canvas · cloudflare · 3.2 screens | 手写体标题 + Garamond 正文，植物学气质；米白底 + 小花照片；2.9k 页高短页 | 手写标题 + Garamond 正文的植物学气质（直接可复用） → A3/A2 | [桌面](screens/make-garden/desktop.jpg) · [移动](screens/make-garden/mobile.jpg) |
| 50 | **mappy** | https://meetmappy.com | -apple-system / -apple-system | static · no canvas · Netlify · 58.2 screens | 橙色大色块 + 手写感排版；第一人称自述；极长页高但节奏清晰 | 第一人称自述 + 大色块分区（章节化长页） → C2 | [桌面](screens/mappy/desktop.jpg) · [移动](screens/mappy/mobile.jpg) |
| 51 | **Melike Turgut** | https://meliketurgut.com/ | PPEditorialNew / Agrandir | static · 8 canvas+WebGL · cloudflare · 1.0 screens | 8 canvas 做作品缩略动效；PP Editorial New 超细衬线；Agrandir 做正文 | 超细衬线展示字 + 无衬线正文（编辑感） → A3 | [桌面](screens/melike-turgut/desktop.jpg) · [移动](screens/melike-turgut/mobile.jpg) |
| 52 | **Miso** | https://miso.com/ | Inter / Inter | static · 1 canvas+WebGL · cloudflare · 2.0 screens | 产品页极短；Inter 单字体；一屏一个价值点 | 短页产品叙事（页高即信息预算） → B12 | [桌面](screens/miso/desktop.jpg) · [移动](screens/miso/mobile.jpg) |
| 53 | **Monocle** | https://trymonocle.app/ | system-ui / system-ui | static · no canvas · openresty · 6.4 screens | 系统字体反而像严肃杂志；栏目化长页；信息密度高 | 系统字体 + 栏目化长页（杂志排版） → C2 | [桌面](screens/monocle/desktop.jpg) · [移动](screens/monocle/mobile.jpg) |
| 54 | **New Material** | https://newmaterial.ai/ | ABC Favorit / ABC Favorit | static · no canvas · cloudflare · 3.4 screens | ABC Favorit 的几何无衬线；产品白底图统一；短页 | 几何无衬线 + 白底产品图（克制） → A3 | [桌面](screens/new-material/desktop.jpg) · [移动](screens/new-material/mobile.jpg) |
| 55 | **Nodeck** | https://www.nodeck.online | BN Dime Display / DM Sans / BN Dime Display | static · no canvas · Vercel · 1.0 screens | 粉色底 + 涂鸦字，俏皮；便签纸/胶带图形语言；单屏 | 纸胶带/便签图形语言（可转成标本卡） → A7 | [桌面](screens/nodeck/desktop.jpg) · [移动](screens/nodeck/mobile.jpg) |
| 56 | **Pairio** | https://pairio.app | Crimson Pro / Crimson Pro | static · 1 canvas+WebGL · cloudflare · 10.4 screens | 衬线 + 无衬线混排；产品 UI 截图；confetti 动效做喜悦感 | confetti 类一次性庆祝动效（D7 微反馈） → D7 | [桌面](screens/pairio/desktop.jpg) · [移动](screens/pairio/mobile.jpg) |
| 57 | **Park** | https://www.park.photos/ | Instrument Serif / sans-serif | Framer c0d7099 · no canvas · Framer/ad3cf8f · 15.7 screens | Instrument Serif 大标题压风景照；照片轮播像幻灯片；Framer 动效 | Instrument Serif 标题 + 全出血风景照 → A3/A2 | [桌面](screens/park/desktop.jpg) · [移动](screens/park/mobile.jpg) |
| 58 | **Peggy** | https://peggy.com/ | Reckless / Inter | Alpine · no canvas · Fly/366e4bf88 (2026-10-27) · 9.7 screens | 衬线 + Grotesk 的经典艺术电商组合；作品图居中，留白大；Alpine.js 轻量交互 | 艺术品电商的衬线/Grotesk 组合（C7 标本卡分类） → C7 | [桌面](screens/peggy/desktop.jpg) · [移动](screens/peggy/mobile.jpg) |
| 59 | **Poetry Camera** | https://poetry.camera/ | Exposure / DM Sans / Bitmatrix A2 | static · no canvas · cloudflare · 7.5 screens | 模糊摄影 + 大字，诗意；Bitmatrix A2 像素字做标签；Exposure 展示字 | 模糊摄影底 + 大字（景深即版式） → A2 | [桌面](screens/poetry-camera/desktop.jpg) · [移动](screens/poetry-camera/mobile.jpg) |
| 60 | **Possible Monuments** | https://possiblemonuments.se/ | sans-serif / sans-serif | Matter · 1 canvas+WebGL · nginx/1.18.0 (Ubuntu) · 3.5 screens | Matter.js 物理引擎做物件掉落；白底 + 单物件；交互即叙事 | Matter.js 物理掉落（可转成花瓣/孢子物理） → B5 | [桌面](screens/possible-monuments/desktop.jpg) · [移动](screens/possible-monuments/mobile.jpg) |
| 61 | **PROOOOF** | https://proooof.app | Wintyr VF / Times New Roman | static · no canvas · Netlify · 3.0 screens | 可变字体 Wintyr 做展示；Anybody 做正文；像字体样本页 | 字体样本页式版式（A3 字体系统展示） → A3 | [桌面](screens/proooof/desktop.jpg) · [移动](screens/proooof/mobile.jpg) |
| 62 | **Resurf** | https://resurf.so | Times New Roman / Times New Roman | static · no canvas · Vercel · 52.8 screens | 单一蓝色几何块作为品牌图形；Times 衬线做正文，反差；长页但图形重复 | 单一几何图形做品牌锚点（不用插画） → A1 | [桌面](screens/resurf/desktop.jpg) · [移动](screens/resurf/mobile.jpg) |
| 63 | **Rows** | https://rows.gg/ | Suisse Intl / Suisse Intl | static · 6 canvas+WebGL · Vercel · 7.3 screens | Suisse Intl 的中性；表格 UI 直接当首屏；6 canvas 做局部 | 表格 UI 作为首屏（产品即页面） → B12 | [桌面](screens/rows/desktop.jpg) · [移动](screens/rows/mobile.jpg) |
| 64 | **Sam Peitz** | https://www.sam-peitz.com/ | Times New Roman / Times New Roman | static · 1 canvas+WebGL · GitHub.com · 1.0 screens | 百叶窗光影作为唯一图像；Times 衬线；单屏 | 光影摄影作为首屏（低成本氛围） → A6 | [桌面](screens/sam-peitz/desktop.jpg) · [移动](screens/sam-peitz/mobile.jpg) |
| 65 | **Scout Graphics** | https://scoutgraphics.com | trade-gothic-next / trade-gothic-next | static · no canvas · cloudflare · 5.6 screens | 窄体大写字贯穿；作品列表化；5k 页高 | 窄体大写作为全站唯一字体（工业感） → A3 | [桌面](screens/scout-graphics/desktop.jpg) · [移动](screens/scout-graphics/mobile.jpg) |
| 66 | **Secret Garden Stresa** | https://secretgardenstresa.com | Cormorant Garamond / Inter | static · no canvas · Apache · 11.3 screens | 暗绿花园摄影 + 衬线标题，正是植物学气质；Pinyon Script 手写做点缀；Cormorant 做展示 | 暗绿摄影 + Cormorant 衬线 + 手写点缀（HORTUS 的直接参考） → A2/A3 | [桌面](screens/secret-garden-stresa/desktop.jpg) · [移动](screens/secret-garden-stresa/mobile.jpg) |
| 67 | **Shelf** | https://www.savetoshelf.com | General Sans / Switzer | Lenis · no canvas · Vercel · 6.0 screens | Lenis 平滑滚动；General Sans 展示 + Switzer 正文；产品卡片 | 双无衬线分工（展示/正文） → A3 | [桌面](screens/shelf/desktop.jpg) · [移动](screens/shelf/mobile.jpg) |
| 68 | **Stolaze** | https://stolaze.com/ | Diatype Variable / -apple-system / Monument Grotesk Semi-Mono Variable | Cargo (https://cargo.site) · no canvas · Cargo · 8.0 screens | Cargo 的版式自由度；Diatype Variable 可变字；7k 页高 | Cargo 式自由版式 + 可变字体（可做田野笔记版式） → A9 | [桌面](screens/stolaze/desktop.jpg) · [移动](screens/stolaze/mobile.jpg) |
| 69 | **Superlocal 2026** | https://www.superlocaldesign.com/ | fontSans / fontSans | Lenis · 3 canvas+WebGL · Vercel · 17.6 screens | 渐变天空底 + 大字日期，海报感；3 canvas 做天空/云；Lenis 滚动 | 日期/地点大字排版（活动海报式首屏） → C12 | [桌面](screens/superlocal-2026/desktop.jpg) · [移动](screens/superlocal-2026/mobile.jpg) |
| 70 | **SVG Doodles** | https://svgdoodles.com | Geist Variable / Geist Variable | Astro · 1 canvas+WebGL · cloudflare · 1.0 screens | SVG/Canvas 手绘线条，涂鸦感；黑底白线，极简；单屏 | 黑底白线涂鸦（可直接对应藤蔓/手绘字标） → A1 | [桌面](screens/svg-doodles/desktop.jpg) · [移动](screens/svg-doodles/mobile.jpg) |
| 71 | **Swash** | https://swashmotion.com/?utm_source=onepagelove&utm_medium=gallery&utm_campaign=launch-2026-09 | Stack Sans Headline / Stack Sans Headline | Lenis · 1 canvas+WebGL · Vercel · 12.3 screens | 字体样本卡片彩色排列，像标本；Stack Sans Headline 展示字；深色底衬托彩色卡片 | 彩色字体样本卡片网格（像标本卡陈列） → A7 | [桌面](screens/swash/desktop.jpg) · [移动](screens/swash/mobile.jpg) |
| 72 | **Textmode Overlay** | https://extension.textmode.art | Monogram Extended / Monogram Extended / Monogram Extended | static · 4 canvas+WebGL · cloudflare · 9.4 screens | 等宽/像素字 + 终端绿，复古；4 canvas 做扫描线；黑底绿字高对比 | 终端绿 + 像素字的复古文本美学（可做 colophon） → A3 | [桌面](screens/textmode-overlay/desktop.jpg) · [移动](screens/textmode-overlay/mobile.jpg) |
| 73 | **The Equator Company** | https://equatorcompany.com | National / National | static · 7 canvas+WebGL · cloudflare · 16.1 screens | National 的宽体展示字；7 canvas 做渐变/光；橙色单色系 | 宽体展示字 + 单色系渐变（A4 色板） → A4 | [桌面](screens/the-equator-company/desktop.jpg) · [移动](screens/the-equator-company/mobile.jpg) |
| 74 | **Tim Van Damme (Max Voltar)** | https://timvandamme.com/ | proxima-soft-extra-condensed / proxima-soft-condensed | static · no canvas · cloudflare · 4.9 screens | felt-tip 手写感字体做涂鸦；超窄体做标题；单屏 | 手写感字体（felt-tip）+ 插画（可做手写落款） → A1 | [桌面](screens/tim-van-damme-max-voltar/desktop.jpg) · [移动](screens/tim-van-damme-max-voltar/mobile.jpg) |
| 75 | **Tristan Haquenne X Anthony Bayet** | https://rain-drops.justabayet.com | sans-serif / Times New Roman | static · 1 canvas+WebGL · Vercel · 1.0 screens | 暗红底 + 单点发光，剧场感；1 canvas 做光晕；极简一屏 | 暗底单点发光（B7 晨雾/水汽光晕） → B7 | [桌面](screens/tristan-haquenne-x-anthony-bayet/desktop.jpg) · [移动](screens/tristan-haquenne-x-anthony-bayet/mobile.jpg) |
| 76 | **Txt Text Editor** | https://adrien.website/txt/ | Inter / -apple-system | static · no canvas · Apache · 3.7 screens | 产品截图 + 天空底，轻松；Inter 做标题；3.3k 页高 | 产品窗口截图 + 自然背景（轻量产品页） → B12 | [桌面](screens/txt-text-editor/desktop.jpg) · [移动](screens/txt-text-editor/mobile.jpg) |
| 77 | **Voice Tag Gods** | https://voicetaggods.com | ObviouslyVariable / ObviouslyVariable | gsap 3.15.0 + ScrollTrigger + SplitText + gsap-3.15.0.min.js · 2 canvas+WebGL · LiteSpeed · 7.3 screens | 人像卡片网格 + 大字标题；ObviouslyVariable 可变展示字；SplitText 逐字入场 | 人像卡片网格（像标本卡阵列） → A7 | [桌面](screens/voice-tag-gods/desktop.jpg) · [移动](screens/voice-tag-gods/mobile.jpg) |

## 分组读解（按视觉原型）

### A. 编辑/衬线派（HORTUS 最该学的）
`applied-imagination`（fsKim 衬线巨题压摄影）、`e-stewart-associates`（Saol Display 长句标题）、`secret-garden-stresa`（Cormorant + 暗绿花园摄影）、`make-garden`（手写标题 + Garamond）、`park`（Instrument Serif + 风景照）、`poetry-camera`（模糊摄影 + 大字）、`eventually`（Instrument Serif + DM Sans）、`peggy`（Reckless + Monument Grotesk）。
共同点：**展示衬线 + 无衬线正文 + 单张摄影**，克制到只有三层。→ A3 字体系统、A2 活体图版、A7 有出处的图版。

### B. 瑞士/怪诞无衬线派
`archiv`（Helvetica 一屏一物）、`bausola-banch`（industry + 网格线）、`scout-graphics`（trade-gothic 窄体）、`isa-de-burgh`（Founders Grotesk Condensed）、`kern-society`（Roboto Flex 可变 + 红条）、`magma`（Feature deck + PP Neue Montreal）。
共同点：**一种字体、一种强调色、网格线当装饰**。→ A3、A9 边注系统、A4 色板纪律。

### C. 运动/滚动派
`kern-society`、`duo-case`、`isa-de-burgh`、`jopecuro`、`magma`、`voice-tag-gods`、`artem-taradash`、`superlocal-2026`、`swash`、`shelf`。
共同点：**Lenis + gsap/ScrollTrigger/SplitText** 是事实标准；SplitText 逐字、ScrollTrigger 段落错位。→ D2 滚动编排、D3 字体入场、D1 转场。

### D. 3D/Canvas 派
`angelo`（8 canvas 玻璃球）、`deeo-studio-2`（Spline）、`dabbit`（8 canvas 取色器）、`possible-monuments`（Matter.js）、`estacion-venenta`（单 canvas 细线网）、`berd`（自研笔刷路径）、`the-equator-company`（7 canvas）。
共同点：**canvas 分治**（每个物件一个 canvas）而不是一个全屏 WebGL；物理用 Matter.js；笔刷自研。→ B10 21 点解剖、B3 翻绳、B5 孢子物理、A1 藤蔓字标。

### E. 纸/印刷/纹理派
`bob-moll`（纸纹理 + 荧光绿页脚）、`nodeck`（便签纸/胶带）、`textmode-overlay`（终端绿像素字）、`davesocozy`（Martian Mono + 绿底 PONG）、`josh-puckett`（Signifier 长文 + canvas 纸纹）、`sam-peitz`（百叶窗光影）。
共同点：**纸纹/扫描线/单色荧光**，都是低成本材质。→ A6 水彩/咬墨 shader、A9 边注、D7 微反馈。

### F. 产品即页面（dogfooding）
`dabbit`（取色器）、`rows`（表格）、`flashform`（表单）、`invoicemon`、`miso`、`txt-text-editor`、`bueno-fyi`（搜索框）、`hedroom`。
共同点：**产品控件就是首屏主视觉**，不画插画。→ B12 全平价输入、C5 筛选搜索。

## 直接可用的 8 条（给 atelier / stage）

1. `secret-garden-stresa` + `make-garden`：暗绿花园摄影 + Cormorant/Garamond + 手写点缀 = HORTUS 的**园门**首屏配方。
2. `kern-society`：Roboto Flex 可变字重动画 + 红色印刷色条 → A3/D3。
3. `swash`：彩色字体样本卡片网格 → 标本卡陈列（A7/C7）。
4. `voice-tag-gods`：人像卡片网格 → 标本卡阵列（A7）。
5. `bob-moll` / `josh-puckett`：纸纹理 + 单条荧光色 → A6 咬墨 shader。
6. `estacion-venenta` / `berd`：单 canvas 细线网 + 自研笔刷 → B3 翻绳 / A1 藤蔓字标。
7. `possible-monuments`：Matter.js 物理 → B5 孢子吹散 / 花瓣掉落。
8. `dabbit` / `rows`：产品控件当首屏 → B12 指针/键盘全平价。

## Limitations

1. 77 站里 `everline-studio` 的 OPL 链接是 `onepagelove.com/go/...` 跳转，真实站点为 Squarespace 托管；截图取的是跳转后页面。
2. 部分站点（`swash` 首次崩溃、`resurf` 113s、`applied-imagination`/`berd` 143–148s）因外站慢/重定向，截图耗时长；已重试成功，但**动画首帧可能被 `animations: disabled` 冻结**，与真实首屏有细微差别。
3. 字体识别基于 `document.fonts` + `getComputedStyle`，**不能识别仅用于图片/Canvas 内绘制的字体**；标为 system 的站点可能实际有自托管字体但未在 CSS 中使用。
4. WebGL 检测是"能否创建上下文"，**不等于页面真的用了 WebGL**；"实际使用 WebGL 的约 6 站"依据 canvas 数量 + 脚本名（three/spline/regl）推断，标注为推断。
5. 移动截图只截首屏（390×844），**不是全页移动端**；移动端布局细节需另做全页截图才能完整评估。
6. 77 站全部经本地代理 `127.0.0.1:7897` 访问；若某站内容因代理/地区差异与真实用户不同，以 `headers/{slug}.json` 里的响应头为准。
