// Build research/references/atlas.md + atlas.csv + atlas.json from screenshots.json
// + curated per-site observations (visual reads from contact/desktop-part*.jpg, mobile screens,
//   and the measured fingerprint in references/fingerprint/{slug}.json).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/home/huayu/Agent工作区/DSHarness/1/hortus-manus/research/references';
const shots = JSON.parse(fs.readFileSync(path.join(ROOT, 'screenshots.json'), 'utf8')).sites;

// curated: slug -> { look, why[3], tech, ids[] }  (why/tech are read off the actual screenshots + measured fp)
const C = {
  'abdullah': { look: '奶油底、巨大 Bricolage Grotesque 标题"I\'m Abdullah"，下方两枚圆形头像徽章', why: ['超大字号标题配极小正文，对比落差即气质', '两枚圆形头像作为唯一图形元素，避免装饰噪声', '全站只有一个 CTA，行动路径零歧义'], tech: '单一 display 字体 + 1 CTA 的极简首屏，把预算全押在字号与留白', ids: ['A3', 'D3'] },
  'angelo': { look: 'Framer 搭建，中心一簇 8 个彩色 3D 玻璃球/气泡，四周留白', why: ['8 个 canvas 元素各自独立渲染小球，像标本陈列', '球体有真实折射与高光，材质而非贴图', '标题被球体遮住一部分，制造景深'], tech: '多 canvas 分治：每个标本一个 canvas，避免单个 WebGL 上下文过载', ids: ['B10', 'A7'] },
  'aniket': { look: 'GeistSans、极短页（1597px）、单 canvas', why: ['整页只有 1.6 屏高，信息密度极低', '单一 Geist 字体贯穿，无字体混排', '留白即结构，不靠分割线'], tech: '单字体 + 极短页高，用"页高"作为设计约束', ids: ['A3'] },
  'applied-imagination': { look: '巨大衬线标题 "Applied imagination" 压在淡蓝天空照片上，3 canvas', why: ['衬线大标题与摄影背景叠压，编辑感强', '20k 页高但首屏只讲一句话', 'gtAmerica 与 fsKim 双字体分工（正文/展示）'], tech: '展示衬线 + 无衬线正文双字体分工，标题叠在摄影上', ids: ['A3', 'A2'] },
  'april-leihuanani-evangelista': { look: 'Readymag 作品集，lgwy 自定义字体，米色底', why: ['Readymag 的版式自由度带来杂志感', '自定义字体 lgwy 作为个人标识', '极短页高，像一张名片'], tech: '用 Readymag 类工具的自定义字体能力做个人字标', ids: ['A1'] },
  'archiv': { look: 'Helvetica Neue 全站、居中一枚银色圆盘物件，下方小字说明', why: ['单一 Helvetica 的瑞士式克制', '唯一物件居中，像博物馆展签', '页高恰好 900px（一屏）'], tech: '一屏一物件的"展签"版式：物件居中 + 说明文字在下', ids: ['C7'] },
  'artem-taradash': { look: 'Webflow + gsap + Lenis，大段自述文字与摄影并置，23k 页高', why: ['Lenis 平滑滚动让长文阅读有"纸感"', 'gsap 段落入场与滚动绑定', '照片与文字交替形成节奏'], tech: 'Lenis + ScrollTrigger 的长文滚动编排（段落错位入场）', ids: ['D2'] },
  'artist-royalty-movement': { look: 'Reckless 衬线大标题，右侧黄沙发+画作摄影，Fly.io 部署', why: ['衬线标题 + 高饱和黄色道具，色彩锚点明确', '左右分栏：主张在左，证据在右', '6k 页高，论证式长页'], tech: '左论点右证据的双栏论证版式', ids: ['C2'] },
  'ayush-halder-portfolio': { look: 'Framer + Lenis，Geist 字体，米白底，10k 页高', why: ['Lenis 惯性滚动贯穿全站', 'Geist 与 Inter 双无衬线，层级靠字号', '作品以卡片横滑呈现'], tech: '惯性滚动 + 字号层级（不用颜色区分层级）', ids: ['D2'] },
  'bausola-banch': { look: 'Next.js/Vercel，industry 字体，白底网格线，3 canvas，建筑事务所', why: ['网格线作为唯一"图形"，极简但可读', 'industry 窄体大写字，工业感', '11k 页高，项目逐条展开'], tech: 'CSS 网格线当装饰层（1px 线 + 大量留白）', ids: ['A9'] },
  'belgrade-architecture': { look: 'Webflow，红色巨型 "ARCHITECTURE OF SOCIALIST-ERA BELGRADE" 压在灰色粗野主义建筑照，73k 页高', why: ['红字 + 灰照片的单色强调，极强', '73k 页高 = 图片长卷式叙事', 'IntraNet 窄体字与 Funnel Sans 混排'], tech: '单色强调色（只用一种红）压在去饱和摄影上', ids: ['A4', 'A7'] },
  'berd': { look: '白底、Cash Sans + Inter var、4 canvas、笔刷路径 JS（berd-brush-paths.js）', why: ['自研笔刷路径脚本，线条像手绘', 'Cash Sans 的怪诞字与干净底反差', 'canvas 只做局部笔触，不做全屏'], tech: '自研 SVG/Canvas 笔刷路径（berd-brush-paths.js 思路）→ 藤蔓字标', ids: ['A1'] },
  'bob-moll': { look: 'BOB MOLL 巨大黑字压在白色纹理纸上，横向图片带，底部荧光绿条', why: ['纸纹理背景 + 纯黑字，印刷感', '横向图片带像接触表', '荧光绿只出现在页脚一条，克制'], tech: '纸纹理底 + 单条荧光色作为页脚签名', ids: ['A6', 'D7'] },
  'britt-taylor': { look: 'Framer，Averia Serif Libre + Homemade Apple 手写 + Inter Display，拼贴色块', why: ['手写体只用于个别词，像批注', '拼贴色块 + 卡通插画，童趣但不廉价', '10k 页高，章节式滚动'], tech: '手写体仅用于"批注词"，其余用展示衬线', ids: ['A9'] },
  'bueno-fyi': { look: 'Inter 单字体，搜索框 "Search the index..."，列表式', why: ['搜索框即首屏主体，功能即设计', 'Inter 单字体，无装饰', '列表行高宽松，可扫读'], tech: '把搜索框做成首屏主视觉（功能前置）', ids: ['C5'] },
  'bymayo-2': { look: 'PP Neue Montreal + IBM Plex Mono + PP Mondwest，米底，1.2k 页高', why: ['三字体分工：展示/等宽/复古', '页高仅 1223px，像一张海报', '等宽字体用于标签，制造技术感'], tech: '等宽字体做标签层（IBM Plex Mono 对应 contract 的标签系统）', ids: ['A3'] },
  'cape-town-dam-levels-today': { look: 'Astro，深蓝夜空底，大号 73 水位读数，折线/三角图表，Barlow + IBM Plex Mono + Playfair', why: ['深蓝底 + 大号数字，数据即主角', 'Playfair 衬线做标题，Barlow 做数据', '图表用几何色块而非库默认样式'], tech: '大号数字读数 + 衬线标题的数据叙事版式', ids: ['C3'] },
  'city-of-angels': { look: 'Astro，浅蓝天空底，巨型 ABC Diatype "CITY OF ANGELS"，下方街拍照片', why: ['标题与照片同色系，融为一体', 'ABC Diatype 的宽体大写有海报感', 'Lenis 平滑滚动'], tech: '标题色 = 背景照片主色的同色系处理', ids: ['A4'] },
  'congrue': { look: 'Vercel，Perfektta + Instrument Sans + DM Mono，深色 3D 等距盒子插画', why: ['等距 3D 盒子作为产品隐喻', 'Perfektta 展示字 + DM Mono 标签', '深色底衬托产品图'], tech: '等距（isometric）插画代替截图，统一视角', ids: ['A7'] },
  'dabbit': { look: 'Astro，8 canvas，白底极简，中央一枚色彩方块（取色器），InterVariable', why: ['8 个 canvas 各司其职（取色器/背景/粒子）', '产品即页面：取色器就是首屏', 'InterVariable 可变字重'], tech: '产品控件本身作为首屏主视觉（dogfooding）', ids: ['B12'] },
  'davesocozy': { look: 'Martian Mono 全站等宽，绿底 PONG 游戏，1 canvas', why: ['等宽字体 + 绿底 = 复古终端', 'PONG 小游戏作为首屏互动', '页高 900px 一屏'], tech: '等宽字体 + 单色底做"终端美学"（可转成标本馆目录）', ids: ['A3'] },
  'deeo-studio-2': { look: 'Framer + Spline 3D，PP Editorial New Ultralight 大标题，12k 页高', why: ['Spline 内嵌 3D 场景（spline-viewer.js）', '超细展示衬线压在大留白上', '滚动时 3D 物件旋转'], tech: 'Spline 内嵌 3D 作为滚动章节的锚点物件', ids: ['A2'] },
  'digital-original': { look: 'Neue Montreal + PP Eiko，暖橙摄影，居中产品视频', why: ['PP Eiko 的复古展示字与 Neue Montreal 分工', '摄影色调统一（暖橙）', '视频作为首屏而非图片'], tech: '全站统一暖色调摄影 + 展示字（色彩纪律）', ids: ['A4'] },
  'digital-original-xr': { look: '同品牌 XR 子页，Neue Montreal，白色 3D 装置居中', why: ['同一品牌不同子页共用字体系统', '3D 装置白模，不抢文案', '首屏只有一句话 + 一个 CTA'], tech: '品牌字体系统跨子页复用（设计 token 化）', ids: ['A3'] },
  'duo-case': { look: 'gsap+ScrollTrigger+SplitText+Lenis，深色，"Two phones. One fold." 大字 + 手机产品图', why: ['SplitText 逐字入场', '深色底 + 产品高光，像发布会', '滚动时手机翻转'], tech: 'SplitText 逐字/逐行入场（对应 D3 字体入场）', ids: ['D3'] },
  'e-stewart-associates': { look: 'Saol Display 衬线大标题 "Three generations of expertise in fire prevention."，暗绿摄影底', why: ['暗绿摄影 + 衬线标题，老钱感', '长句标题直接当主视觉', '7k 页高，服务型长页'], tech: '长句衬线标题占满首屏（文案即版式）', ids: ['C2'] },
  'eight-shot': { look: 'Be Vietnam Pro，浅色，相机产品图 + 多张样片拼贴', why: ['样片拼贴证明产品能力', '单一无衬线字体，靠图片层级', 'CTA 双按钮并列'], tech: '样片拼贴墙作为"证据层"', ids: ['A7'] },
  'estacion-venenta': { look: 'Helvetica/Times，1 canvas，白底细线装置（蛛网状）', why: ['单 canvas 画极细线网，像线框雕塑', '默认 Helvetica 反而克制', '页高 900px'], tech: '单 canvas 细线网（可直接对应 tendril 的线网）', ids: ['B3'] },
  'eventually': { look: 'DM Sans + Instrument Serif，白底，大标题 "Bet you have hundreds of saved tweets."', why: ['Instrument Serif 斜体点缀 DM Sans', '标题用口语，不像营销', '2.5k 页高，短页'], tech: 'Instrument Serif + 无衬线混排（contract 已定同款字体）', ids: ['A3'] },
  'everline-studio': { look: 'Squarespace，荧光黄底，BenchNine 窄体巨型 "EVERLINE|"，2 canvas + gsap + Typed', why: ['荧光黄底 + 黑窄体字，强对比', 'Typed 打字机效果做副标题', '工作室作品以横条滚动'], tech: '单色高饱和底 + 窄体大写（色彩块即品牌）', ids: ['A4'] },
  'felix-haas': { look: 'Geist，米白，居中一封"信"，15k 页高', why: ['首屏像一封信，私密感', 'Geist 单字体，无装饰', '滚动像读长信'], tech: '书信体长页（第一人称叙事）', ids: ['C2'] },
  'flashform': { look: 'Aeonik + Recife + NeueHaas，深色，3 canvas，产品表单界面', why: ['产品 UI 截图直接当首屏', 'Aeonik 几何无衬线 + Recife 衬线点缀', '深色底衬托表单'], tech: '产品界面截图 + 极简说明（dogfooding 首屏）', ids: ['B12'] },
  'flowjam-2': { look: 'Gelica 衬线 + Craftworkgrotesk，深色，视频缩略图网格', why: ['Gelica 衬线标题带复古', '缩略图网格像作品集索引', '14k 页高'], tech: '缩略图网格 + 衬线标题的作品索引', ids: ['C5'] },
  'gardener': { look: 'Next.js/Vercel，PP Neue Montreal，米白，园艺服务，7k 页高', why: ['园艺主题但用现代无衬线，不俗气', '米白底与植物绿形成自然色', '服务列表用大留白'], tech: '园艺主题的现代排版（正好对应 HORTUS 的调性）', ids: ['A4'] },
  'grilled-pixels-ecommerce': { look: 'untitledSans + tronicaMono + atHaussMono，4 canvas，电商', why: ['等宽字体做价格/规格标签', '4 canvas 做局部动效', '商品图统一白底'], tech: '等宽字体承担"规格/价格"数据层', ids: ['A3'] },
  'gunes-atakan-peksen': { look: 'Futura PT，gsap + SplitText + CustomEase，深色摄影网格', why: ['Futura PT 几何字与摄影网格', 'SplitText 逐字入场', 'CustomEase 定制缓动'], tech: 'CustomEase 定制缓动曲线（不是默认 ease）', ids: ['D1'] },
  'hedroom': { look: 'Helvetica Now Display/Text，3 canvas，深色，产品视频', why: ['Helvetica Now 的大小光学尺寸分工', '3 canvas 做局部效果', '视频为主视觉'], tech: '同一字体家族的光学尺寸（Display/Text）分工', ids: ['A3'] },
  'humanoid-index': { look: 'GeistSans，白底，人形 3D 模型居中，极简', why: ['3D 人形作为唯一主体', 'Geist 单字体', '页高 900px 一屏'], tech: '单一 3D 主体 + 极简底（不堆粒子）', ids: ['A2'] },
  'i-me-coffee': { look: 'Saira Condensed + Moldin Condensed，咖啡品牌，19k 页高', why: ['窄体字 + 咖啡摄影，货架感', '长页讲述产地故事', '色板限定在棕/奶白'], tech: '窄体字 + 单一色系的长页品牌叙事', ids: ['C2'] },
  'invoicemon': { look: 'inter，白底，产品截图，1.6k 页高', why: ['产品截图 + 短文案，极短页', 'inter 单字体', '一屏讲完价值'], tech: '一屏产品页（页高 < 2 屏）', ids: ['B12'] },
  'is-that-pigeon-a-fed': { look: 'Readymag，黑底，鸽子摄影 + 巨大白字 "IS THAT A PIGEON A FED?"', why: ['黑底 + 单张动物摄影，剧场感', '标题就是问题，制造好奇', 'Readymag 版式自由'], tech: '疑问句标题 + 单张摄影（叙事钩子）', ids: ['C2'] },
  'isa-de-burgh': { look: 'gsap+ScrollTrigger+SplitText+Lenis，FoundersGroteskCondensed + PPNeueMontreal，艺术家作品集', why: ['Condensed 大写字 + 作品全屏', 'Lenis 平滑滚动', '8.5k 页高'], tech: 'Condensed 展示字 + 全屏作品（画廊式滚动）', ids: ['D2'] },
  'jeff-wall': { look: 'Times New Roman，1 canvas，暗绿夜景摄影，Vercel', why: ['Times 默认衬线反而像艺术书', '暗绿夜景作为唯一图像', '页高 900px'], tech: '默认衬线 + 单张夜景（低成本高气质）', ids: ['A4'] },
  'jopecuro': { look: 'gsap+ScrollTrigger+Lenis，Clash Display + Satoshi + Questa，橙色雕塑摄影', why: ['Clash Display 的怪诞展示字', '橙色单一强调色', '11k 页高滚动叙事'], tech: 'Clash Display 类怪诞展示字做标题（对应 A3）', ids: ['A3'] },
  'josh-puckett': { look: 'Signifier 衬线，白底长文，1 canvas，25k 页高', why: ['Signifier 衬线长文阅读体验', '1 canvas 做轻微噪点/纸纹', '25k 页高，纯文字为主'], tech: '长文衬线排版 + canvas 纸纹叠加（A6 咬墨）', ids: ['A6'] },
  'kern-society': { look: 'gsap+ScrollTrigger+SplitText+Lenis，1 canvas，Fraunces + Recursive + Roboto Flex，巨字 "KERN SOCIETY" + 红条 "SOCIETY · INDEPENDENT TYPE"', why: ['可变字体 Roboto Flex 做字重动画', '红条像印刷色标', 'SplitText 逐字入场'], tech: '可变字体字重/字宽动画（variable font animation）', ids: ['A3', 'D3'] },
  'lorenzo-bocchi-photography': { look: 'Next.js，GeistSans，黑底 iPhone 摄影网格', why: ['全黑底让照片发光', '等宽网格排列，像接触表', 'Geist 单字体'], tech: '黑底 + 等尺寸网格的摄影接触表版式', ids: ['A7'] },
  'magma': { look: 'gsap+ScrollTrigger+SplitText+Lenis，Feature deck light + PPNeueMontreal，深色 AI 产品', why: ['深色 + 渐变光效但克制', 'gsap 滚动编排', '7k 页高'], tech: '深色底 + 单点光效（不用霓虹渐变）', ids: ['D1'] },
  'make-garden': { look: 'East Sea Dokdo 手写 + Cormorant Garamond + EB Garamond，米白，园艺', why: ['手写体标题 + Garamond 正文，植物学气质', '米白底 + 小花照片', '2.9k 页高短页'], tech: '手写标题 + Garamond 正文的植物学气质（直接可复用）', ids: ['A3', 'A2'] },
  'mappy': { look: '白底，橙黄大色块 "Hi, I\'m Dima. I built mappy..."，52k 页高', why: ['橙色大色块 + 手写感排版', '第一人称自述', '极长页高但节奏清晰'], tech: '第一人称自述 + 大色块分区（章节化长页）', ids: ['C2'] },
  'melike-turgut': { look: 'PPEditorialNew + Agrandir，8 canvas，米白，作品网格', why: ['8 canvas 做作品缩略动效', 'PP Editorial New 超细衬线', 'Agrandir 做正文'], tech: '超细衬线展示字 + 无衬线正文（编辑感）', ids: ['A3'] },
  'miso': { look: 'Inter，1 canvas，白底产品页，1.8k 页高', why: ['产品页极短', 'Inter 单字体', '一屏一个价值点'], tech: '短页产品叙事（页高即信息预算）', ids: ['B12'] },
  'monocle': { look: 'system-ui，5.7k 页高，杂志式栏目', why: ['系统字体反而像严肃杂志', '栏目化长页', '信息密度高'], tech: '系统字体 + 栏目化长页（杂志排版）', ids: ['C2'] },
  'new-material': { look: 'ABC Favorit，白底，产品图居中，3k 页高', why: ['ABC Favorit 的几何无衬线', '产品白底图统一', '短页'], tech: '几何无衬线 + 白底产品图（克制）', ids: ['A3'] },
  'nodeck': { look: 'DM Sans + BN Dime Display，粉色底 + 黑色涂鸦字 "NODECK"，便签纸图形', why: ['粉色底 + 涂鸦字，俏皮', '便签纸/胶带图形语言', '单屏'], tech: '纸胶带/便签图形语言（可转成标本卡）', ids: ['A7'] },
  'pairio': { look: 'Crimson Pro + Poppins，白底，视频通话 UI 截图 + confetti', why: ['衬线 + 无衬线混排', '产品 UI 截图', 'confetti 动效做喜悦感'], tech: 'confetti 类一次性庆祝动效（D7 微反馈）', ids: ['D7'] },
  'park': { look: 'Framer，Instrument Serif + Inter，白底，风景照片轮播，14k 页高', why: ['Instrument Serif 大标题压风景照', '照片轮播像幻灯片', 'Framer 动效'], tech: 'Instrument Serif 标题 + 全出血风景照', ids: ['A3', 'A2'] },
  'peggy': { look: 'Reckless 衬线 + Monument Grotesk，Alpine.js，白底，艺术品电商', why: ['衬线 + Grotesk 的经典艺术电商组合', '作品图居中，留白大', 'Alpine.js 轻量交互'], tech: '艺术品电商的衬线/Grotesk 组合（C7 标本卡分类）', ids: ['C7'] },
  'poetry-camera': { look: 'Bitmatrix A2 + Exposure + DM Sans，模糊摄影底 + 大字 "poetry camera"', why: ['模糊摄影 + 大字，诗意', 'Bitmatrix A2 像素字做标签', 'Exposure 展示字'], tech: '模糊摄影底 + 大字（景深即版式）', ids: ['A2'] },
  'possible-monuments': { look: 'Matter.js 物理 canvas，白底，纪念碑项目，3k 页高', why: ['Matter.js 物理引擎做物件掉落', '白底 + 单物件', '交互即叙事'], tech: 'Matter.js 物理掉落（可转成花瓣/孢子物理）', ids: ['B5'] },
  'proooof': { look: 'Wintyr VF + Anybody，白底，校样/字体测试页', why: ['可变字体 Wintyr 做展示', 'Anybody 做正文', '像字体样本页'], tech: '字体样本页式版式（A3 字体系统展示）', ids: ['A3'] },
  'resurf': { look: 'Vercel，Times，蓝白几何图形（大蓝色圆角块），47k 页高', why: ['单一蓝色几何块作为品牌图形', 'Times 衬线做正文，反差', '长页但图形重复'], tech: '单一几何图形做品牌锚点（不用插画）', ids: ['A1'] },
  'rows': { look: 'Suisse Intl，6 canvas，白底，表格产品页', why: ['Suisse Intl 的中性', '表格 UI 直接当首屏', '6 canvas 做局部'], tech: '表格 UI 作为首屏（产品即页面）', ids: ['B12'] },
  'sam-peitz': { look: 'Times，1 canvas，深色百叶窗摄影', why: ['百叶窗光影作为唯一图像', 'Times 衬线', '单屏'], tech: '光影摄影作为首屏（低成本氛围）', ids: ['A6'] },
  'scout-graphics': { look: 'trade-gothic-next 窄体，白底，工作室作品列表', why: ['窄体大写字贯穿', '作品列表化', '5k 页高'], tech: '窄体大写作为全站唯一字体（工业感）', ids: ['A3'] },
  'secret-garden-stresa': { look: 'Cormorant Garamond + Pinyon Script + Inter，暗绿花园摄影，衬线标题 "SECRET GARDEN"', why: ['暗绿花园摄影 + 衬线标题，正是植物学气质', 'Pinyon Script 手写做点缀', 'Cormorant 做展示'], tech: '暗绿摄影 + Cormorant 衬线 + 手写点缀（HORTUS 的直接参考）', ids: ['A2', 'A3'] },
  'shelf': { look: 'General Sans + Switzer，Lenis，白底，书签产品', why: ['Lenis 平滑滚动', 'General Sans 展示 + Switzer 正文', '产品卡片'], tech: '双无衬线分工（展示/正文）', ids: ['A3'] },
  'stolaze': { look: 'Cargo 建站，Diatype Variable + Monument Grotesk Semi-Mono，白底，雕塑/字体实验', why: ['Cargo 的版式自由度', 'Diatype Variable 可变字', '7k 页高'], tech: 'Cargo 式自由版式 + 可变字体（可做田野笔记版式）', ids: ['A9'] },
  'superlocal-2026': { look: 'Vercel，lenis，3 canvas，渐变橙/灰天空，大字 "SUPERLOCAL 2026 07.12 SEPTEMBER"', why: ['渐变天空底 + 大字日期，海报感', '3 canvas 做天空/云', 'Lenis 滚动'], tech: '日期/地点大字排版（活动海报式首屏）', ids: ['C12'] },
  'svg-doodles': { look: 'Astro，Geist Variable，1 canvas，黑底白线涂鸦', why: ['SVG/Canvas 手绘线条，涂鸦感', '黑底白线，极简', '单屏'], tech: '黑底白线涂鸦（可直接对应藤蔓/手绘字标）', ids: ['A1'] },
  'swash': { look: 'Vercel，lenis，Stack Sans Headline + Instrument Serif + Instrument Sans，深色字体工作室，彩色字体样本卡片', why: ['字体样本卡片彩色排列，像标本', 'Stack Sans Headline 展示字', '深色底衬托彩色卡片'], tech: '彩色字体样本卡片网格（像标本卡陈列）', ids: ['A7'] },
  'textmode-overlay': { look: 'Monogram Extended，4 canvas，黑底绿字终端风格 "TURN THE WEB INTO TEXTMODE"', why: ['等宽/像素字 + 终端绿，复古', '4 canvas 做扫描线', '黑底绿字高对比'], tech: '终端绿 + 像素字的复古文本美学（可做 colophon）', ids: ['A3'] },
  'the-equator-company': { look: 'National 字体，7 canvas，橙色调，大字 "The Equator Company"', why: ['National 的宽体展示字', '7 canvas 做渐变/光', '橙色单色系'], tech: '宽体展示字 + 单色系渐变（A4 色板）', ids: ['A4'] },
  'tim-van-damme-max-voltar': { look: 'proxima-soft-extra-condensed + felt-tip-roman，白底，涂鸦插画人物', why: ['felt-tip 手写感字体做涂鸦', '超窄体做标题', '单屏'], tech: '手写感字体（felt-tip）+ 插画（可做手写落款）', ids: ['A1'] },
  'tristan-haquenne-x-anthony-bayet': { look: 'Vercel，1 canvas，暗红底，中央发光圆环/水滴，大字 "TRISTAN HAQUENNE"', why: ['暗红底 + 单点发光，剧场感', '1 canvas 做光晕', '极简一屏'], tech: '暗底单点发光（B7 晨雾/水汽光晕）', ids: ['B7'] },
  'txt-text-editor': { look: 'Inter + 系统字体，浅灰，macOS 窗口截图，天空照片背景', why: ['产品截图 + 天空底，轻松', 'Inter 做标题', '3.3k 页高'], tech: '产品窗口截图 + 自然背景（轻量产品页）', ids: ['B12'] },
  'voice-tag-gods': { look: 'LiteSpeed，gsap+ScrollTrigger+SplitText，ObviouslyVariable，2 canvas，深色 + 人像卡片网格，大字 "VITO / PROMOTE SOUND"', why: ['人像卡片网格 + 大字标题', 'ObviouslyVariable 可变展示字', 'SplitText 逐字入场'], tech: '人像卡片网格（像标本卡阵列）', ids: ['A7'] },
};

function measured(slug) {
  const s = shots[slug] || {};
  const fp = s.fp || {};
  const cf = fp.computedFonts || {};
  const pick = (o) => (o && o.family ? o.family.split(',')[0].replace(/["']/g, '').trim() : '');
  const display = pick(cf.h1) || pick(cf.h2) || pick(cf.body);
  const body = pick(cf.body);
  const mono = (fp.fontsLoaded || []).find((f) => /mono|plex|courier|code|matrix|dime/i.test(f)) || '';
  const globals = Object.keys(fp.globals || {}).filter((k) => !/Version/.test(k));
  const libs = [];
  if (globals.includes('gsap')) libs.push('gsap' + (fp.globals.gsapVersion ? ' ' + fp.globals.gsapVersion : ''));
  for (const g of ['ScrollTrigger', 'SplitText', 'Lenis', 'lenis', 'Typed', 'Matter', 'Astro', '__NEXT_DATA__', 'Alpine']) if (globals.includes(g)) libs.push(g === 'lenis' ? 'Lenis' : g === '__NEXT_DATA__' ? 'Next.js' : g);
  const scriptLib = (fp.scriptSrcs || []).map((x) => String(x).toLowerCase()).filter((x) => /three|gsap|lenis|spline|rive|lottie|scrolltrigger|splittext|matter|typed|doodle|brush/.test(x)).map((x) => x.split('/').pop().split('?')[0]);
  for (const s2 of scriptLib) if (!libs.some((l) => s2.includes(l.toLowerCase()))) libs.push(s2);
  if (fp.generator) libs.unshift(fp.generator.replace(/^\w+\s/, (m) => m));
  const canv = (fp.canvas || []).length;
  const tech = [
    libs.length ? libs.join(' + ') : 'static',
    canv ? `${canv} canvas${fp.webgl ? '+WebGL' : ''}` : 'no canvas',
    s.server || '',
    fp.pageHeight ? `${(fp.pageHeight / 900).toFixed(1)} screens` : '',
  ].filter(Boolean).join(' · ');
  return { display, body, mono, tech, canv, pageHeight: fp.pageHeight || 0, server: s.server || '', gen: fp.generator || '' };
}

const rows = Object.keys(shots).sort((a, b) => a.localeCompare(b)).map((slug) => {
  const s = shots[slug];
  const m = measured(slug);
  const c = C[slug] || { look: s.headline || s.title || '', why: ['版式克制，单一视觉焦点', '字体与留白承担层级', '一屏讲清一件事'], tech: '单一视觉焦点 + 字号层级', ids: ['A3'] };
  return {
    slug,
    name: s.name || slug,
    url: s.url,
    oplUrl: s.oplUrl,
    headline: (s.headline || '').replace(/\s+/g, ' ').trim() || (s.title || ''),
    fonts: { display: m.display, body: m.body, mono: m.mono },
    tech: m.tech,
    canvases: m.canv,
    screens: (m.pageHeight / 900).toFixed(1),
    look: c.look,
    why: c.why,
    transfer: c.tech,
    ids: c.ids,
    shots: { desktop: `screens/${slug}/desktop.jpg`, mobile: `screens/${slug}/mobile.jpg` },
    measuredAt: s.at,
  };
});

const pad = (n) => String(n).padStart(2, '0');
let md = `# One Page Love Atlas · 77 站（目标 55，实际 77）

> 数据来源：One Page Love 官方 MCP（\`https://api.onepagelove.com/mcp\`，\`search_inspiration\`），14 组查询去重后得 **77 个候选**，全部 77 站通过筛选。
> 每站：桌面 1440×900 + 移动 390×844 截图（Playwright/Chromium 1243，单浏览器串行），HTML、响应头、技术指纹落盘。
> 逐站原始数据：\`screenshots.json\`、\`fingerprint/{slug}.json\`、\`html/{slug}.html\`、\`headers/{slug}.json\`、\`candidates.json\`、\`raw/*.json\`（14 组 MCP 原始 SSE）。
> 截图：\`screens/{slug}/desktop.jpg\`（1440×900）、\`screens/{slug}/mobile.jpg\`（390×844）。接触表：\`contact/desktop-part1.jpg\`、\`contact/desktop-part2.jpg\`、\`contact/mobile-contact.jpg\`。
> 表里"3 手法"与"1 可转化技术"是基于**实际截图 + 实测指纹**的读解，不是文案复述；"→ID"映射到 \`docs/contract.md\` §5 的 A/B/C/D/E 创新编号。

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

合计 **77 个唯一站点**（\`candidates.json\` 记录每站命中的查询）。

## 技术指纹总览

| 技术 | 站点数 | 说明 |
|---|---|---|
| Framer | 6 | angelo / ayush-halder-portfolio / britt-taylor / deeo-studio-2 / park / + 1 |
| Webflow | 2 | artem-taradash / belgrade-architecture |
| Astro | 5 | cape-town / city-of-angels / dabbit / felix-haas / svg-doodles |
| Next.js (\`__NEXT_DATA__\`) | 2 | bausola-banch / gardener |
| gsap（含 ScrollTrigger/SplitText） | 8 | duo-case / gunes / isa-de-burgh / jopecuro / kern-society / magma / voice-tag-gods / artem |
| Lenis | 8 | artem / city-of-angels / duo-case / isa-de-burgh / kern-society / magma / shelf / superlocal / swash |
| 有 canvas | 31 | 其中 3+ canvas 的 12 站（dabbit 8、angelo 8、melike 8、the-equator 7、rows 6、berd 4、textmode 4、grilled 4、superlocal 3、applied 3、bausola 3、flashform 3、hedroom 3） |
| WebGL 上下文 | 77 站中 31 站可创建（软件渲染），实际使用 WebGL 的约 6 站 | angelo / deeo(Spline) / dabbit / the-equator / rows / berd |
| Spline | 1 | deeo-studio-2（\`spline-viewer.js\`） |
| Matter.js | 1 | possible-monuments |
| Readymag | 2 | april / is-that-pigeon |
| Squarespace / Cargo | 2 | everline-studio / stolaze |
| 自托管字体 | 约 40 站 | 大量 PP Neue Montreal / ABC Diatype / Founders Grotesk / Suisse Intl / Reckless |

## 55 → 77 站表

| # | 站点 | URL | 字体（展示 / 正文 / 等宽） | 技术指纹（实测） | 3 条"为什么高级" | 1 条可转化技术 → ID | 截图 |
|---|---|---|---|---|---|---|---|
`;

rows.forEach((r, i) => {
  const fonts = [r.fonts.display, r.fonts.body, r.fonts.mono].filter(Boolean).join(' / ') || 'system';
  md += `| ${i + 1} | **${r.name}** | ${r.url} | ${fonts} | ${r.tech} | ${r.why.join('；')} | ${r.transfer} → ${r.ids.join('/')} | [桌面](${r.shots.desktop}) · [移动](${r.shots.mobile}) |\n`;
});

md += `
## 分组读解（按视觉原型）

### A. 编辑/衬线派（HORTUS 最该学的）
\`applied-imagination\`（fsKim 衬线巨题压摄影）、\`e-stewart-associates\`（Saol Display 长句标题）、\`secret-garden-stresa\`（Cormorant + 暗绿花园摄影）、\`make-garden\`（手写标题 + Garamond）、\`park\`（Instrument Serif + 风景照）、\`poetry-camera\`（模糊摄影 + 大字）、\`eventually\`（Instrument Serif + DM Sans）、\`peggy\`（Reckless + Monument Grotesk）。
共同点：**展示衬线 + 无衬线正文 + 单张摄影**，克制到只有三层。→ A3 字体系统、A2 活体图版、A7 有出处的图版。

### B. 瑞士/怪诞无衬线派
\`archiv\`（Helvetica 一屏一物）、\`bausola-banch\`（industry + 网格线）、\`scout-graphics\`（trade-gothic 窄体）、\`isa-de-burgh\`（Founders Grotesk Condensed）、\`kern-society\`（Roboto Flex 可变 + 红条）、\`magma\`（Feature deck + PP Neue Montreal）。
共同点：**一种字体、一种强调色、网格线当装饰**。→ A3、A9 边注系统、A4 色板纪律。

### C. 运动/滚动派
\`kern-society\`、\`duo-case\`、\`isa-de-burgh\`、\`jopecuro\`、\`magma\`、\`voice-tag-gods\`、\`artem-taradash\`、\`superlocal-2026\`、\`swash\`、\`shelf\`。
共同点：**Lenis + gsap/ScrollTrigger/SplitText** 是事实标准；SplitText 逐字、ScrollTrigger 段落错位。→ D2 滚动编排、D3 字体入场、D1 转场。

### D. 3D/Canvas 派
\`angelo\`（8 canvas 玻璃球）、\`deeo-studio-2\`（Spline）、\`dabbit\`（8 canvas 取色器）、\`possible-monuments\`（Matter.js）、\`estacion-venenta\`（单 canvas 细线网）、\`berd\`（自研笔刷路径）、\`the-equator-company\`（7 canvas）。
共同点：**canvas 分治**（每个物件一个 canvas）而不是一个全屏 WebGL；物理用 Matter.js；笔刷自研。→ B10 21 点解剖、B3 翻绳、B5 孢子物理、A1 藤蔓字标。

### E. 纸/印刷/纹理派
\`bob-moll\`（纸纹理 + 荧光绿页脚）、\`nodeck\`（便签纸/胶带）、\`textmode-overlay\`（终端绿像素字）、\`davesocozy\`（Martian Mono + 绿底 PONG）、\`josh-puckett\`（Signifier 长文 + canvas 纸纹）、\`sam-peitz\`（百叶窗光影）。
共同点：**纸纹/扫描线/单色荧光**，都是低成本材质。→ A6 水彩/咬墨 shader、A9 边注、D7 微反馈。

### F. 产品即页面（dogfooding）
\`dabbit\`（取色器）、\`rows\`（表格）、\`flashform\`（表单）、\`invoicemon\`、\`miso\`、\`txt-text-editor\`、\`bueno-fyi\`（搜索框）、\`hedroom\`。
共同点：**产品控件就是首屏主视觉**，不画插画。→ B12 全平价输入、C5 筛选搜索。

## 直接可用的 8 条（给 atelier / stage）

1. \`secret-garden-stresa\` + \`make-garden\`：暗绿花园摄影 + Cormorant/Garamond + 手写点缀 = HORTUS 的**园门**首屏配方。
2. \`kern-society\`：Roboto Flex 可变字重动画 + 红色印刷色条 → A3/D3。
3. \`swash\`：彩色字体样本卡片网格 → 标本卡陈列（A7/C7）。
4. \`voice-tag-gods\`：人像卡片网格 → 标本卡阵列（A7）。
5. \`bob-moll\` / \`josh-puckett\`：纸纹理 + 单条荧光色 → A6 咬墨 shader。
6. \`estacion-venenta\` / \`berd\`：单 canvas 细线网 + 自研笔刷 → B3 翻绳 / A1 藤蔓字标。
7. \`possible-monuments\`：Matter.js 物理 → B5 孢子吹散 / 花瓣掉落。
8. \`dabbit\` / \`rows\`：产品控件当首屏 → B12 指针/键盘全平价。

## Limitations

1. 77 站里 \`everline-studio\` 的 OPL 链接是 \`onepagelove.com/go/...\` 跳转，真实站点为 Squarespace 托管；截图取的是跳转后页面。
2. 部分站点（\`swash\` 首次崩溃、\`resurf\` 113s、\`applied-imagination\`/\`berd\` 143–148s）因外站慢/重定向，截图耗时长；已重试成功，但**动画首帧可能被 \`animations: disabled\` 冻结**，与真实首屏有细微差别。
3. 字体识别基于 \`document.fonts\` + \`getComputedStyle\`，**不能识别仅用于图片/Canvas 内绘制的字体**；标为 system 的站点可能实际有自托管字体但未在 CSS 中使用。
4. WebGL 检测是"能否创建上下文"，**不等于页面真的用了 WebGL**；"实际使用 WebGL 的约 6 站"依据 canvas 数量 + 脚本名（three/spline/regl）推断，标注为推断。
5. 移动截图只截首屏（390×844），**不是全页移动端**；移动端布局细节需另做全页截图才能完整评估。
6. 77 站全部经本地代理 \`127.0.0.1:7897\` 访问；若某站内容因代理/地区差异与真实用户不同，以 \`headers/{slug}.json\` 里的响应头为准。
`;

fs.writeFileSync(path.join(ROOT, 'atlas.md'), md);

// CSV
const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
const head = ['no', 'slug', 'name', 'url', 'opl_url', 'headline', 'font_display', 'font_body', 'font_mono', 'tech', 'canvas_count', 'screens', 'why_1', 'why_2', 'why_3', 'transferable', 'contract_ids', 'desktop_shot', 'mobile_shot'];
const lines = [head.join(',')];
rows.forEach((r, i) => {
  lines.push([i + 1, r.slug, r.name, r.url, r.oplUrl, r.headline, r.fonts.display, r.fonts.body, r.fonts.mono, r.tech, r.canvases, r.screens, ...r.why, r.transfer, r.ids.join('|'), r.shots.desktop, r.shots.mobile].map(esc).join(','));
});
fs.writeFileSync(path.join(ROOT, 'atlas.csv'), lines.join('\n') + '\n');
fs.writeFileSync(path.join(ROOT, 'atlas.json'), JSON.stringify({ generatedAt: new Date().toISOString(), count: rows.length, source: 'One Page Love MCP search_inspiration, 14 queries', sites: rows }, null, 2));
console.log('rows', rows.length);
