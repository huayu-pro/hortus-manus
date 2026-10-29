# HORTUS MANUS · 指间花园 — 文案全集 Copy Deck v1

> Owner: atelier。**唯一实现**是 `packages/shared/src/copy.ts`；本文是人读版，二者逐字一致。
> 语言策略：**中文优先、英文对照**。中文不是英文的翻译，英文也不是中文的注释——两种语言说同一件事。
> 诗性但准确：数字真实、模拟标注、不伪造数据、不用 lorem、不用感叹号、不用「欢迎来到」「沉浸式」「未来感」。

## 0. 双语使用规则

1. 页面上同时出现时：中文 ≥1.0×，英文 0.72–0.8×，英文用 mono 或 Cormorant italic，颜色降一级。
2. 大标题可双行并列（中文在上、英文在下），**绝不并排等重**。
3. 按钮、标签、ARIA 只出现一种语言（跟随当前语言），避免屏幕阅读器读两遍。
4. 英文标题用句首大写（sentence case）；品牌、幕号、标签用全大写。
5. 数字、单位、采集号保持原样；中文里不插入英文标点。
6. 以下词禁用：`lorem ipsum`、`欢迎来到`、`探索无限可能`、`未来已来`、`沉浸式体验`、`一键开启`、`颠覆`、`黑科技`、`赋能`。
7. 不使用 emoji 作为文案的一部分。

---

## 1. 品牌基础

| 项 | 中文 | English |
|---|---|---|
| 品牌名 | **HORTUS MANUS**（手之花园） | **HORTUS MANUS** |
| 中文名 | **指间花园** | 指间花园（保留汉字） |
| 副题 | 一座属于双手的活体标本馆 | A LIVING HERBARIUM FOR YOUR HANDS |
| 主张 | **以手为土，以息为风。** | **Your hands are the weather.** |
| 拉丁题铭 | `Manus est tempestas.`（手即是天气） | `Manus est tempestas.` |
| 三个词 | 触觉 · 标本 · 气候 | TOUCH · SPECIMEN · WEATHER |
| 宣言句 | 我们不用手指点击花朵；我们用手指成为天气。 | We do not click flowers. We become their weather. |
| 版本 | 本地版 · LOCAL EDITION | LOCAL EDITION |

**品牌短句（可用于首屏/OG/footer）**
- 纸先安静下来，花才敢开。 / *Let the paper go quiet, and the flower will dare to open.*
- 花园合上时，手还记得。 / *When the garden closes, the hand remembers.*
- 每一次采集，都是把会消失的东西压进纸里。 / *Every collection presses something vanishing into paper.*

---

## 2. 导航与常用动作

| 键 | 中文 | English |
|---|---|---|
| `nav.home` | 园门 | The Gate |
| `nav.touch` | 手部温室 | Hand Greenhouse |
| `nav.fieldGuide` | 手势图鉴 | Field Guide |
| `nav.herbarium` | 标本馆 | Herbarium |
| `nav.colophon` | 版权页 | Colophon |
| `nav.menu` | 目录 | Menu |
| `nav.theme` | 夜花园 / 回到白天 | Night Garden / Back to daylight |
| `nav.sound` | 声音 | Sound |
| `nav.skip` | 跳到正文 | Skip to content |
| `common.enter` | 推门 | Open the gate |
| `common.next` | 下一幕 | Next act |
| `common.back` | 返回 | Back |
| `common.close` | 关闭 | Close |
| `common.retry` | 再试一次 | Try again |
| `common.loading` | 正在生长… | Growing… |
| `common.viewAll` | 查看全部 | View all |
| `common.readMore` | 继续读 | Read on |

> 说明：`common` 其余键（`save / cancel / confirm / copy / copied / download / share / search / filter / sort / clear / apply / reset / all / none / yes / no / dismiss / more / optional / offline / online`）见附录 A。

---

## 3. 四幕 + 间奏 + 尾幕

### 第一幕 · 园门 / ACT I · THE GATE

- 幕号：`I`
- 标签：`第一幕 · 园门` / `ACT I · THE GATE`
- 大标题：
  > 推门的手，<br>先于眼睛<br>知道春天。
  >
  > *The hand that opens the gate<br>knows spring<br>before the eye.*
- 导语：
  > 一座不属于任何季节的花园。你带着手来，它才开始生长。
  >
  > *A garden that belongs to no season. It begins growing when you arrive with your hands.*
- 正文：
  > 这里没有欢迎页。只有一扇门，和一株等你呼吸的花。
  >
  > *No welcome screen. Only a gate, and a flower waiting for your breath.*
- 按钮：`推门` / `Open the gate`
- 按钮下提示：`不需要摄像头。指针、触屏、键盘都可以。` / `No camera needed — pointer, touch and keyboard all work.`
- 图注：`PLATE I · 活体图版 · 芍药正在醒来` / `PLATE I · living plate · the peony is waking`
- 页脚读数：`本地温室 · 第 1 日` / `LOCAL GREENHOUSE · DAY 1`
- 下一幕：`授粉` / `Pollination`

### 第二幕 · 授粉 / ACT II · POLLINATION

- 标签：`第二幕 · 授粉` / `ACT II · POLLINATION`
- 大标题：
  > 让指尖先落下，<br>花才想起如何开。
  >
  > *Let the fingertip land first —<br>then the flower remembers<br>how to open.*
- 导语：
  > 七种花，七种手感。手指停在哪里，天气就落在哪里。
  >
  > *Seven flowers, seven kinds of touch. Wherever your fingers stop, the weather falls there.*
- 正文：
  > 先选一种花式；把手放进光里，或者只动鼠标。
  >
  > *Choose a flower first. Put your hands into the light — or just move the pointer.*
- 按钮：`把手放上去` / `Lend your hands`
- 提示：`键盘 1–7 也能换花。` / `Keys 1–7 switch the flower.`
- 图注：`花窗 · 翻绳 · 雨池 · 孢子 · 菌络 · 晨雾 · 花冠` / `FRAME · TENDRIL · RIPPLE · SPORE · MYCELIUM · MIST · PHYLLOTAXIS`
- 页脚：`七种花式 · 五种手势 · 三路输入` / `SEVEN MODES · FIVE GESTURES · THREE INPUTS`
- 下一幕：`温室` / `The Greenhouse`

### 第三幕 · 温室 / ACT III · THE GREENHOUSE

- 标签：`第三幕 · 温室` / `ACT III · THE GREENHOUSE`
- 大标题：
  > 这里没有墙，<br>只有气候。
  >
  > *No walls here —<br>only weather.*
- 导语：
  > 换季，调光，听风。温室会记住你上一次停留的温度。
  >
  > *Change the season, dim the light, listen to the wind. The greenhouse remembers the temperature of your last visit.*
- 正文：
  > 四季不是皮肤，是空气。换季时，整座温室一起呼吸。
  >
  > *Seasons here are not a skin; they are air. When the season turns, the whole greenhouse breathes with it.*
- 按钮：`打开温室` / `Open the greenhouse`
- 提示：`按 X 换季；按 S 听风。` / `X changes the season; S listens to the wind.`
- 图注：`四时之息 · 春分 夏至 秋分 冬至` / `THE BREATH OF FOUR SEASONS · EQUINOXES AND SOLSTICES`
- 页脚：`模拟气候 · 非传感器数据` / `SIMULATED CLIMATE · NOT SENSOR DATA`
- 下一幕：`田野笔记` / `Field Notes`

### 间奏 · 田野笔记 / INTERLUDE · FIELD NOTES

- 标签：`间奏 · 田野笔记` / `INTERLUDE · FIELD NOTES`
- 大标题：
  > 每一种手感，<br>都是天气<br>留下的笔迹。
  >
  > *Every kind of touch<br>is handwriting<br>left by weather.*
- 导语：
  > 来自温室的日常记录：风的方向、露水的重量、某朵花不合时宜地开了。
  >
  > *Notes from the greenhouse: the direction of wind, the weight of dew, a flower opening out of season.*
- 正文：
  > 园丁不在场时，记录还在继续。
  >
  > *When the gardener is away, the record continues.*
- 按钮：`继续读` / `Read on`
- 图注：`FIELD NOTES · 第 1–4 则` / `FIELD NOTES · I–IV`
- 页脚：`手写部分只在这里出现` / `HANDWRITING APPEARS ONLY HERE`

### 第四幕 · 标本馆 / ACT IV · THE HERBARIUM

- 标签：`第四幕 · 标本馆` / `ACT IV · THE HERBARIUM`
- 大标题：
  > 把会消失的，<br>压进纸里。
  >
  > *Press what would vanish<br>into paper.*
- 导语：
  > 每一次采集，都会得到一张带编号的标本卡。它留在这台机器上，也可以被分享。
  >
  > *Every collection becomes a numbered specimen card. It stays on this machine — and it can be shared.*
- 正文：
  > 花不是数据。但它的形状、季节和那一刻的手感，可以被压平保存。
  >
  > *A flower is not data. But its shape, its season and the touch of that moment can be pressed flat and kept.*
- 按钮：`进入标本馆` / `Enter the herbarium`
- 提示：`采集后按 F 也能压花。` / `After collecting, press F to press a flower.`
- 图注：`本机保存 · 无上传 · 无账号` / `STORED LOCALLY · NOTHING UPLOADED · NO ACCOUNT`
- 页脚：`标本为生成物 · 不是真实采集记录` / `SPECIMENS ARE GENERATED ART · NOT REAL COLLECTION RECORDS`

### 尾幕 · 版权页 / CODA · COLOPHON

- 标签：`尾幕 · 版权页` / `CODA · COLOPHON`
- 大标题：
  > 花园合上时，<br>手还记得。
  >
  > *When the garden closes,<br>the hand remembers.*
- 导语：
  > 一切生长都在本地发生。没有云端，没有账户，没有上传。
  >
  > *Everything grows locally. No cloud, no account, no upload.*
- 正文：
  > 这座花园是一次本地实验：研究、设计、代码与声音都在这台机器上。
  >
  > *This garden is a local experiment: research, design, code and sound, all on this machine.*
- 按钮：`回到园门` / `Back to the gate`
- 图注：`LOCAL EDITION · 第 1 版` / `LOCAL EDITION · FIRST PRINTING`
- 落款：`for Gerard & Claude`
- 尾句：`以手为土，以息为风。` / `Your hands are the weather.`

---

## 4. 七种花式（名称 / 学名 / 分类 / 题记）

| # | 模式 | 中文名 | English | 学名 | 俗名 | 科 | 手势 | 采集母题 |
|---|---|---|---|---|---|---|---|---|
| I | `frame` | 花窗 | Frame / FRAME | *Paeonia suffruticosa* | 牡丹 / Tree Peony | 芍药科 Paeoniaceae | 框 | 花窗 / frame flower |
| II | `tendril` | 翻绳 | Tendril / TENDRIL | *Lonicera japonica* | 金银花 / Japanese Honeysuckle | 忍冬科 Caprifoliaceae | 织 | 绳结 / tendril knot |
| III | `ripple` | 雨池 | Ripple / RIPPLE | *Nymphaea tetragona* | 睡莲 / Pygmy Water Lily | 睡莲科 Nymphaeaceae | 捏 | 睡莲 / water lily |
| IV | `spore` | 孢子 | Spore / SPORE | *Taraxacum mongolicum* | 蒲公英 / Dandelion | 菊科 Asteraceae | 拳 | 蒲公英 / dandelion |
| V | `mycelium` | 菌络 | Mycelium / MYCELIUM | *Armillaria mellea* | 蜜环菌 / Honey Fungus | 蜜环菌科 Physalacriaceae | 框 | 菌络 / mycelium |
| VI | `mist` | 晨雾 | Mist / MIST | *Adiantum capillus-veneris* | 铁线蕨 / Maidenhair Fern | 凤尾蕨科 Pteridaceae | 开 | 压花 / pressed fern |
| VII | `phyllotaxis` | 花冠 | Phyllotaxis / PHYLLOTAXIS | *Helianthus annuus* | 向日葵 / Sunflower | 菊科 Asteraceae | 开 | 花冠 / sunflower spiral |

**模式题记（模式轨/图鉴用）**

- **花窗**：双手框成窗，花在里面开合。 / *Frame a window with both hands; the flower opens inside it.*
  - 操作：张开双手框住花窗；张开手掌唤醒花瓣，握拳让它回到苞。 / *Frame the window with both hands, open your palms to wake the petals, close your fists to return to the bud.*
  - 短句：花窗不是取景框，是花呼吸的地方。 / *The frame is not a viewfinder; it is where the flower breathes.*
- **翻绳**：二十一根丝线，在你指间编成藤。 / *Twenty-one silk threads weave into a vine between your fingers.*
  - 操作：五指张开牵引丝线，捏住一处拉紧，松手让它回弹。 / *Spread five fingers to pull the threads, pinch one point to tighten, release to let it spring back.*
  - 短句：翻绳的绳子是活的，它记得每一次张力。 / *The string is alive; it remembers every tension.*
- **雨池**：指尖触水，整个池塘开始回应。 / *Touch the water and the whole pond answers.*
  - 操作：指尖轻触水面，涟漪会记住你落下的位置。 / *Touch the surface with a fingertip; the ripple remembers where you landed.*
  - 短句：池塘是手指写下、水面写完的一句话。 / *A pond is a sentence the finger writes and the water finishes.*
- **孢子**：握拳把风交给种子，开掌接住它。 / *Close your fist to give the wind a seed; open your palm to catch it.*
  - 操作：握拳吹散蒲公英，张开手掌接住飘回的种子。 / *Close your fist to blow the dandelion apart; open your palm to catch the seeds that drift back.*
  - 短句：一口可以握在拳头里的气。 / *A breath you can hold in a fist.*
- **菌络**：两掌之间，地下的网络开始呼吸。 / *Between two palms, the underground network begins to breathe.*
  - 操作：双掌相对靠近，让菌丝在掌间生长；呼吸会改变它的脉冲。 / *Bring both palms close; mycelium grows between them. Your breathing changes its pulse.*
  - 短句：森林大半长在看不见的地下。 / *The forest is mostly underground.*
- **晨雾**：擦开一层雾，露出压进玻璃里的花。 / *Wipe the glass and a pressed flower appears. The mist will return.*
  - 操作：用手掌擦过冷凝的玻璃，雾会慢慢回来。 / *Wipe the condensed glass with your palm; the fog slowly comes back.*
  - 短句：有些花只有在你擦净窗户时才出现。 / *Some flowers are only visible when you clear the window.*
- **花冠**：黄金角旋转，花瓣自己找到位置。 / *At the golden angle, petals find their own places.*
  - 操作：转动双手改变螺旋方向，开合手掌缩放花冠。 / *Rotate your hands to turn the spiral; open and close your palms to scale the corolla.*
  - 短句：没有人替向日葵排列花瓣。 / *No one arranges a sunflower.*

---

## 5. 五种手势

| 手势 | 中文 | English | 手形 | 提示 |
|---|---|---|---|---|
| `frame` | 框 | FRAME | 双手拇指与食指围成方形 / *Thumbs and index fingers of both hands form a square* | 框住一朵花 / *Frame a flower* |
| `open` | 开 | OPEN | 五指张开，掌心向上 / *Five fingers spread, palm up* | 让花醒来 / *Wake the flower* |
| `pinch` | 捏 | PINCH | 拇指与食指相触 / *Thumb and index finger touch* | 捏住一瓣 / *Hold one petal* |
| `fist` | 拳 | FIST | 握拳，指节朝前 / *A closed fist, knuckles forward* | 让花回苞 / *Return to the bud* |
| `weave` | 织 | WEAVE | 双手交叉，错开一个指缝 / *Both hands crossed, one finger-gap apart* | 编一段藤 / *Weave a vine* |

---

## 6. 四季 / 节气

| season | 中文 | English | 节气 | 记录（田野笔记语气） |
|---|---|---|---|---|
| `spring` | 春 | SPRING | 春分 / Vernal Equinox | 纸是湿的，花窗自己开了一指宽。 / *The paper is damp; the frame opened a finger-width by itself.* |
| `summer` | 夏 | SUMMER | 夏至 / Summer Solstice | 光落在水面上，涟漪比风先到。 / *Light lands on the water; the ripple arrives before the wind.* |
| `autumn` | 秋 | AUTUMN | 秋分 / Autumnal Equinox | 孢子飞得比上次远，也许因为天更高。 / *The spores flew farther than last time — maybe the sky is higher.* |
| `winter` | 冬 | WINTER | 冬至 / Winter Solstice | 玻璃结雾，压花在雾后面等一只手。 / *The glass fogs; the pressed flower waits behind it for a hand.* |

色标短名：春 `湿绿 / wet green` · 夏 `浓荫 / deep shade` · 秋 `金粉 / gold dust` · 冬 `水汽 / water vapour`。

---

## 7. `/touch` 与现场仪表

### 7.1 温室 HUD

| 键 | 中文 | English |
|---|---|---|
| `touch.kicker` | 手部温室 · HAND GREENHOUSE | HAND GREENHOUSE |
| `touch.title` | 全屏手部温室 | Full-screen hand greenhouse |
| `touch.subtitle` | 七种花 · 四种气候 · 三路输入 | Seven flowers · four climates · three inputs |
| `touch.modeRailTitle` | 植物学检索表 | Botanical key |
| `touch.modeRailHint` | 选择一种花式；再按一次回到默认。 | Choose a flower; press again to return to the default. |
| `touch.careLabel` | 采集条件 | Care label |
| `touch.gestureHint` | 张开手掌 · 捏住花瓣 · 握拳回苞 | Open palm · pinch a petal · close a fist |
| `touch.gestureIdle` | 把手放进光里。 | Put your hand into the light. |
| `touch.noHand` | 还没有看到手。指针和键盘同样可以开始。 | No hand yet. Pointer and keyboard can start just as well. |
| `touch.hands` | 手已就位。 | Hands in place. |
| `touch.collect` | 采集 | Collect |
| `touch.collectHint` | 把这一株压进纸里 | Press this one into paper |
| `touch.exit` | 退出温室 | Leave the greenhouse |
| `touch.pause` | 暂停 / `resume` 继续 | Pause / Resume |
| `touch.ghost` | 幽灵手 | Ghost hand |
| `touch.ghostHint` | 看一只手如何唤醒花园 | Watch a hand wake the garden |
| `touch.clear` | 清屏 | Clear |
| `touch.quiet` | 静默模式 | Quiet mode |
| `touch.keyboard` | 1–7 换花 · Q/W/E/R 兼容 · X 换季 · C 清屏 · G 幽灵手 · S 声音 · D 视图 · ? 帮助 · Esc 退出 | 1–7 mode · Q/W/E/R switch · X season · C clear · G ghost hand · S sound · D view · ? help · Esc exit |
| `touch.privacyShort` | 画面不离开这台设备。 | Frames never leave this device. |

### 7.2 care label 字段

| 键 | 中文 | English |
|---|---|---|
| `care.fps` / `latency` / `mode` / `season` / `camera` / `sound` | 帧率 / 延迟 / 花式 / 季节 / 相机 / 声音 | FPS / Latency / Mode / Season / Camera / Sound |
| `care.source` | 输入 | Input |
| `care.sourcePointer` / `sourceTouch` / `sourceCamera` / `sourceGhost` / `sourceNone` | 指针 / 双指 / 相机 / 幽灵手 / 等待 | pointer / touch / camera / ghost hand / waiting |
| `care.cameraOff` / `Requesting` / `On` / `Denied` / `Unavailable` | 未启用 / 请求中 / 已就绪 / 被拒绝 / 不可用 | off / asking / ready / denied / unavailable |
| `care.soundOff` / `soundOn` | 静音 / 开启 | muted / on |

> 单位：`fps`、`ms`。读数每秒更新，但屏幕阅读器每 30 秒才播报摘要。

---

## 8. 相机与隐私

### 8.1 相机面板

| 场景 | 中文 | English |
|---|---|---|
| 标题 | 把手借给花园 | Lend your hands to the garden |
| 正文 | 摄像头只在本地辨认你的手。画面不录、不传、不存。 | The camera reads your hands locally. Frames are not recorded, uploaded or stored. |
| 请求中 | 正在向这台机器请求画面… | Asking this machine for a picture… |
| 就绪 | 手部追踪已就绪 | Hand tracking is ready |
| 被拒绝 | 摄像头被拒绝。指针与键盘同样可以开始。 | Camera denied. Pointer and keyboard can start just as well. |
| 不可用 | 这台设备没有可用的摄像头。花园不会因此关闭。 | No camera on this device. The garden does not close for that. |
| 重试 | 重新请求 | Ask again |
| 允许 | 允许使用摄像头 | Allow camera |
| 暂不 | 暂时不用 | Not now |
| 预览 | 本地预览 | Local preview |
| 关闭 | 关闭摄像头 | Stop camera |
| 声明 | 本机处理 · 无上传 · 无录像 | ON-DEVICE · NO UPLOAD · NO RECORDING |

### 8.2 隐私仪式（点击「允许」后出现，3 步）

- 标题：`隐私仪式` / `Privacy ritual`
- 说明：`我们只读取 21 个手部关键点。` / `We read 21 hand landmarks. Nothing else.`
- 三步：
  1. `画面留在内存` / *Frames stay in memory*
  2. `只有坐标离开画面` / *Only coordinates leave the frame*
  3. `关闭即忘记` / *Close it and it is forgotten*
- 隐私总则（图鉴/版权页）：
  - `摄像头只用来辨认 21 个手部关键点。` / *The camera is used only to read 21 hand landmarks.*
  - `画面不离开这台设备，不录制，不写入磁盘。` / *Frames never leave this device — not recorded, not written to disk.*
  - `没有账号，没有 PII，没有云。` / *No account, no PII, no cloud.*
  - `删除凭证只保存在本机 localStorage。` / *The delete token lives only in this browser’s localStorage.*
  - `一切优先在本地发生。` / *Everything happens locally first.*
  - `不使用追踪 cookie。` / *No tracking cookies.*
  - `只统计匿名事件计数，不含画面。` / *Only anonymous event counts — never frames.*

---

## 9. 声音

| 键 | 中文 | English |
|---|---|---|
| 标题 | 花园的声音 | The sound of the garden |
| 说明 | 风、水、丝弦与五声音阶，全部由合成器当场生成。 | Wind, water, silk strings and a pentatonic scale, synthesised live. |
| 开启 / 关闭 | 打开声音 / 关闭声音 | Turn sound on / Turn sound off |
| 提示 | 声音默认关闭。只有你允许，花园才会响。 | Sound is off by default. The garden only sounds when you allow it. |
| 启动中 | 正在唤醒风… | Waking the wind… |
| 四层 | 风 / 水 / 丝弦 / 五声音阶 | Wind / Water / Silk strings / Pentatonic |
| 声明 | 无音频文件；无自动播放。 | No audio files; no autoplay. |
| 静音态 | 静音 | Muted |

---

## 10. 采集卡与标本卡分类学

### 10.1 采集流程

| 步骤 | 中文 | English |
|---|---|---|
| 卡名 | 采集卡 | Collection card |
| 字段 | 标本名 / 题记 | Specimen / Field note |
| 题记占位 | 给这朵花留一句话（可选，60 字以内） | Leave this flower a line (optional, max 60 characters) |
| 保存 | 压进纸里 | Press into paper |
| 进行中 | 正在压进纸里… | Pressing into paper… |
| 成功标题 | 已压进纸里 | Pressed into paper |
| 成功正文 | 标本卡生成了。它留在本机，也可以分享。 | The specimen card exists. It stays on this machine — and it can be shared. |
| 查看 | 查看标本卡 | View specimen card |
| 分享 | 分享这株 | Share this one |
| 致谢 | 致谢 | Thanks |
| 删除标题 | 把这株从纸上取下来？ | Take this one off the paper? |
| 删除正文 | 标本卡与分享页会一并消失。删除凭证存在这台机器的 localStorage。 | The specimen card and its share page will disappear. The delete token lives in this browser’s localStorage. |
| 删除确认 / 取消 | 确认移除 / 留着 | Remove it / Keep it |
| 删除完成 | 这株已被取下。 | This one has been taken down. |
| 凭证说明 | 删除凭证只保存在本机浏览器。 | The delete token is stored only in this browser. |
| 下载 / 复制 | 下载卡片 / 复制链接 | Download card / Copy link |
| QR alt | 指向这株标本分享页的二维码 | QR code pointing to this specimen share page |
| 卡片 alt | 这株标本的标本卡 | Specimen card for this flower |
| 分享句 | 我的手在花园里留下了一株花。 | My hands left a flower in the garden. |

### 10.2 分类学标签

| 中文 | English |
|---|---|
| 学名 | Latin name |
| 俗名 | Common name |
| 科 / 属 / 种 | Family / Genus / Species |
| 采集号 | Herbarium no. |
| 图版 | Plate |
| 采集时间 | Collected |
| 采集人 | Collector |
| 生境 | Habitat |
| 季节 / 花式 | Season / Mode |
| 坐标 | Coordinates |
| 致谢 | Thanks |
| 田野题记 | Field note |
| 压花状态 / 已压平 | Pressed state / Pressed flat |
| 仅存于本机 | On this machine only |
| 鉴定 | Determination |
| 扫码或打开链接 | Scan or open the link |
| 本地温室 | Local greenhouse |

**采集号示范**：`HM-2026-SPR-004`；**坐标**：`31°14′N · 121°29′E`（虚构温室）。

---

## 11. 标本馆 `/herbarium`

| 键 | 中文 | English |
|---|---|---|
| 标签 | 标本馆 · HERBARIUM | HERBARIUM |
| 标题 | 所有被压进纸里的花。 | Every flower pressed into paper. |
| 导语 | 按花式、季节、日期筛选。每一张卡都由种子确定性生成，不存图片。 | Filter by mode, season or date. Every card is generated deterministically from a seed — no images stored. |
| 搜索占位 | 搜索题记、花式、采集号… | Search field notes, modes, herbarium numbers… |
| 筛选 | 花式 / 季节 / 排序 | Mode / Season / Sort |
| 排序项 | 最新采集 / 最早采集 / 最多致谢 | Newest first / Oldest first / Most thanked |
| 计数 | 株 | specimens |
| 空态标题 | 纸还是空的。 | The paper is still empty. |
| 空态正文 | 去温室采一朵，这里就会有第一株。 | Collect one in the greenhouse and the first specimen will appear here. |
| 空态按钮 | 进入温室 | Enter the greenhouse |
| 筛选空 | 没有符合这组条件的花。 | No flowers match this set of filters. |
| 清空 | 清空筛选 | Clear filters |
| 加载 | 正在翻页… | Turning the page… |
| 错误标题 | 纸页受潮了。 | The paper is damp. |
| 错误正文 | 本地服务没有回应。确认 pnpm start 正在运行。 | The local service did not answer. Check that pnpm start is running. |
| 重试 | 再翻一次 | Turn the page again |
| 离线 | 离线了。 | Offline. |
| 离线正文 | 标本馆存在本机；网络恢复后刷新即可。 | The herbarium lives on this machine; refresh when the service is back. |
| 说明 | 标本为生成物，不是真实采集记录。 | Specimens are generated art, not real collection records. |
| 操作 | 打开 / 致谢 / 取下 | Open / Thanks / Remove |

---

## 12. 每日一株 / 今日标本

- 标签：`每日一株 · TODAY'S SPECIMEN` / `TODAY'S SPECIMEN`
- 标题：`今天，花园选了这一株。` / *Today the garden chose this one.*
- 正文：`每天凌晨，本地温室会抽一株新的。不是推荐算法，是种子。` / *At midnight the local greenhouse draws a new specimen. Not a recommendation algorithm — a seed.*
- 按钮：`看这一株` / `See this one`
- 说明：`由本机种子决定 · 每日更换` / *Chosen by a local seed · changes daily*
- 无内容：`今日的种子还没发芽。` / *Today’s seed has not sprouted yet.*
- 日期前缀：`今日` / `Today`

---

## 13. 手势图鉴 `/field-guide`

| 键 | 中文 | English |
|---|---|---|
| 标签 | 图鉴 · FIELD GUIDE | FIELD GUIDE |
| 标题 | 手势图鉴与二十一点解剖 | Gestures and the anatomy of twenty-one points |
| 导语 | 七种花式，五种手势，二十一个手部关键点。这里没有摄像头也能读。 | Seven modes, five gestures, twenty-one hand landmarks. This page reads fine without a camera. |
| 五种手势 | 五种手势 | Five gestures |
| 七种花式 | 七种花式 | Seven modes |
| 解剖标题 | 二十一点解剖 | Twenty-one points |
| 解剖导语 | MediaPipe 的手部模型把一只手读成 21 个点。点不动，花才动。 | MediaPipe reads one hand as 21 landmarks. The points stay still; the flower moves. |
| 怎么做 | 怎么做的 | How it is made |
| 方法 | 自写 Verlet 丝线、One Euro 滤波、黄金角与手部追踪。没有引擎模板，没有复制粘贴的 demo。 | Hand-written Verlet threads, One Euro filtering, golden angle and hand tracking. No engine template, no copied demo. |
| 性能 | 实时性能 | Live performance |
| 性能说明 | 舞台目标 60fps；低于 45 自动降级；指针模式建议 30fps 以上。 | Stage target 60fps; automatic degradation below 45; pointer mode is fine above 30. |
| 隐私 | 隐私 / 摄像头画面只在本机内存里被读取，不上传、不录制、不写入磁盘。 | Privacy / Camera frames are read in memory only — not uploaded, not recorded, not written to disk. |
| 键盘 | 键盘 | Keyboard |

**21 点解剖名称（中文 / English）**

`01 腕 WRIST` · `02 拇指根 CMC` · `03 拇指掌指 MCP` · `04 拇指间 IP` · `05 拇指尖 TIP` · `06 食指掌指 MCP` · `07 食指近节 PIP` · `08 食指中节 DIP` · `09 食指尖 TIP` · `10 中指掌指 MCP` · `11 中指近节 PIP` · `12 中指中节 DIP` · `13 中指尖 TIP` · `14 无名指掌指 MCP` · `15 无名指近节 PIP` · `16 无名指中节 DIP` · `17 无名指尖 TIP` · `18 小指掌指 MCP` · `19 小指近节 PIP` · `20 小指中节 DIP` · `21 小指尖 TIP`

（英文：WRIST / THUMB CMC / THUMB MCP / THUMB IP / THUMB TIP / INDEX MCP / INDEX PIP / INDEX DIP / INDEX TIP / MIDDLE MCP / MIDDLE PIP / MIDDLE DIP / MIDDLE TIP / RING MCP / RING PIP / RING DIP / RING TIP / PINKY MCP / PINKY PIP / PINKY DIP / PINKY TIP）

**键盘表**

| 键 | 中文 | English |
|---|---|---|
| 1–7 | 切换花式 | Switch mode |
| Q W E R | 兼容切换花式 | Alternate mode switch |
| X | 换季 | Change season |
| S | 声音开关 | Sound on / off |
| G | 幽灵手演示 | Ghost-hand demo |
| C | 清屏 | Clear the stage |
| D | 切换视图 | Toggle view |
| F | 压花 / 采集 | Press / collect |
| ? | 帮助 | Help |
| Esc | 退出温室 | Leave the greenhouse |
| ⌘K | 指令抽屉 | Command drawer |

---

## 14. 田野笔记（手写 + 印刷）

**标题**：`每一种手感，都是天气留下的笔迹。` / *Every kind of touch is handwriting left by weather.*
**导语**：`园丁不在场时，记录还在继续。` / *When the gardener is away, the record continues.*

| 日期 | 标题 | 正文 | 手写批注 |
|---|---|---|---|
| 第 3 日 / Day 3 | 风从东南来 / *Wind from the southeast* | 花窗自己开了一指宽；没有人碰它。 / *The frame opened a finger-width by itself; nobody touched it.* | 给风留一扇窗。 / *Leave the wind a window.* |
| 第 9 日 / Day 9 | 露水重过昨天 / *Dew heavier than yesterday* | 铁线蕨的背面结了一层雾，像有人呵过气。 / *A layer of fog formed on the back of the maidenhair fern, as if someone had breathed on it.* | 雾会回来。 / *The mist will return.* |
| 第 17 日 / Day 17 | 一枚不合时宜的花瓣 / *One petal out of season* | 芍药在冬天开了第三层。气候是假的，手是真的。 / *The peony opened a third layer in winter. The climate is fake; the hand is real.* | 花不知道季节。 / *The flower does not know the season.* |
| 第 27 日 / Day 27 | 夜里的访客 / *A visitor at night* | 关灯后，花粉像小小的灯。没有人看见，除了你。 / *After the lights went out, pollen became tiny lamps. No one saw it but you.* | 夜里也要开花。 / *Bloom at night too.* |

**落款**：`园丁的手记` / `The gardener’s hand`
**隐藏致意**：`for Gerard & Claude`（只在版权页与田野笔记末尾出现）

---

## 15. 分享页 `/s/:id`、OG、QR

| 键 | 中文 | English |
|---|---|---|
| 标签 | 标本分享 · SHARE | SHARE |
| 标题 | 一朵花的手印。 | A handprint of a flower. |
| 正文 | 这株花由本机采集，卡片与 OG 图由服务端确定性生成。 | This flower was collected locally; the card and OG image are generated deterministically by the server. |
| 致谢 | 致谢 / 已致谢 | Thanks / Thanked |
| QR 标题 | 扫码看这一株 | Scan to see this specimen |
| QR 说明 | 二维码指向本机地址；只在这台设备或同一局域网内有效。 | The QR code points to a local address — valid on this device or the same local network. |
| 下载 | 下载卡片 | Download card |
| 复制 | 复制链接 / 链接已复制 | Copy link / Link copied |
| 返回 | 回到标本馆 | Back to the herbarium |
| 删除提示 | 不想要这株？打开删除凭证即可移除。 | Want it gone? Open the delete token link to remove it. |
| OG 标题 | 一朵花的手印 — HORTUS MANUS | A handprint of a flower — HORTUS MANUS |
| OG 描述 | 这株花由一只手的天气生成。点开，看它的标本卡。 | This flower was made by the weather of one hand. Open it and see its specimen card. |
| 卡片说明 | HORTUS MANUS · 本机标本 | HORTUS MANUS · LOCAL SPECIMEN |

**页面 meta / OG（首页）**
- title：`HORTUS MANUS · 指间花园` / `HORTUS MANUS · A Living Herbarium`
- description：`一座属于双手的活体标本馆。以手为土，以息为风；七种花式，四季气候，全部在本机生长。` / *A living herbarium for your hands. Your hands are the weather: seven flowers, four seasons, growing locally.*
- ogDescription：`以手为土，以息为风。你的手就是天气。` / *Your hands are the weather. A living herbarium for your hands.*
- locale：`zh_CN` / `en_US`

---

## 16. 404、错误与空态

### 404

- 标签：`未压进纸里 · NOT PRESSED` / `NOT PRESSED`
- 标题：**这株标本还没有被压进纸里。** / *This specimen has not been pressed yet.*
- 正文：`也许它还在温室里长着，也许这个编号从来不存在。` / *Perhaps it is still growing in the greenhouse; perhaps this number never existed.*
- 提示：`如果你是从分享页来的，可能这株已被采集者取下。` / *If you came from a share link, the collector may have taken it down.*
- 按钮：`回到标本馆` / `Back to the herbarium`；`回到园门` / `Back to the gate`
- 手写旁注：`（角落里有一朵没人认领的花。）` / *(There is an unclaimed flower in the corner.)*

### 错误

| 场景 | 中文 | English |
|---|---|---|
| 通用标题 | 这一页被风吹走了。 | The wind took this page. |
| 通用正文 | 没有完成。再试一次，或者回到园门。 | It did not complete. Try again, or return to the gate. |
| 服务错误 | 土壤是干的。 / 本地服务没有回应。确认 pnpm start 正在运行，然后刷新。 | The soil is dry. / The local service did not answer. Check that pnpm start is running, then refresh. |
| 离线 | 网线不重要，但服务要活着。 / 页面已缓存；采集与标本馆需要本地服务。 | The cable does not matter, but the service does. / The page is cached; collecting and the herbarium need the local service. |
| 无相机 | 没有镜头也可以。 / 指针、双指和键盘同样能让花醒来。 | You can do this without a lens. / Pointer, touch and keyboard can wake the flower just as well. |
| 采集失败 | 这朵花没有被夹住。 / 再试一次；如果还不行，刷新页面。 | This flower was not caught. / Try again; if it still fails, refresh the page. |
| 题记过长 | 题记太长了，留给花一点空白。 | The field note is too long — leave the flower some blank paper. |
| 编号非法 | 这个编号不像一株标本。 | This number does not look like a specimen. |

### 空态

| 场景 | 中文 | English |
|---|---|---|
| 标本 | 还没有标本。 | No specimens yet. |
| 笔记 | 笔记还没有写。 | No notes written yet. |
| 结果 | 没有结果。 | No results. |
| 加载 | 正在加载… | Loading… |

---

## 17. 无障碍标签（ARIA）

| 键 | 中文 | English |
|---|---|---|
| 主导航 | 主导航 | Main navigation |
| 章节 | 章节 | Chapters |
| 模式轨 | 花式检索表 | Botanical mode key |
| 舞台 | 活体花窗舞台 | Living frame stage |
| 图版 alt 前缀 | 植物图版： | Botanical plate: |
| 声音开关 | 声音开关 | Sound toggle |
| 夜花园开关 | 夜花园开关 | Night garden toggle |
| 语言 | 切换语言 | Switch language |
| 采集 | 采集这一株 | Collect this specimen |
| 分享 | 分享这一株 | Share this specimen |
| 取下 | 取下这一株 | Remove this specimen |
| 关闭对话框 | 关闭对话框 | Close dialog |
| 指令菜单 | 指令菜单 | Command menu |
| 搜索标本 | 搜索标本 | Search specimens |
| 筛选 | 筛选 | Filters |
| 实时读数 | 温室实时读数 | Live greenhouse readout |
| 跳过 | 跳到正文 | Skip to content |
| 加载 | 正在加载 | Loading |
| 手势提示 | 手势提示 | Gesture hint |
| 摄像头预览 | 本地摄像头预览 | Local camera preview |
| 二维码 | 分享二维码 | Share QR code |
| 公告滚动 | 公告滚动 | Announcement ticker |
| 外部链接 | 外部链接 | External link |
| 手部舞台 | 手部追踪舞台 | Hand-tracking stage |
| 致谢按钮 | 给这一株致谢 | Thank this specimen |
| 下载卡片 | 下载标本卡 | Download specimen card |
| 复制链接 | 复制分享链接 | Copy share link |

---

## 18. 公告条、首次引导、Toast

**公告条**（真实信息，不滚动也可读）：
`以手为土，以息为风。` · `本机运行 · 无云端` · `摄像头画面不上传` · `按 F 压花` · `每日一株 · 本地种子` · `夜花园 · 可选`
/ *Your hands are the weather.* · *Runs locally · no cloud* · *Camera frames are never uploaded* · *Press F to press a flower* · *Today's specimen · local seed* · *Night garden · optional*

**首次引导**：
- 标题：`第一次来？` / *First time here?*
- 正文：`不必先给摄像头。指针、双指、键盘都能让花醒来。` / *You do not have to give the camera first. Pointer, touch and keyboard can wake the flower.*
- 三步：`把手放在光里` / `选择一种花式` / `采一株带走` — *Put your hand in the light* / *Choose a flower* / *Take one home*
- 按钮：`开始` / `Start`；`我自己逛` / *I’ll wander*
- 提示：`随时按 ? 看手势` / *Press ? anytime for gestures*

**Toast**：
`已压进纸里` / `链接已复制` / `标本已取下` / `声音已打开` / `声音已关闭` / `换季了` / `换了一种花式` / `相机已就绪` / `相机已关闭` / `分享卡已生成` / `本地服务离线` / `本地服务已恢复` / `已致谢` / `这株已收过你的致谢` / `没有成功，再试一次` / `采集太快了，等一秒再压。`
/ *Pressed into paper* · *Link copied* · *Specimen removed* · *Sound on* · *Sound off* · *Season changed* · *Flower changed* · *Camera ready* · *Camera off* · *Share card ready* · *Local service offline* · *Local service is back* · *Thanked* · *This specimen already has your thanks* · *That did not work — try again* · *Collecting too fast; wait a second.*

---

## 19. 版权页 / Colophon

| 键 | 中文 | English |
|---|---|---|
| 标签 | 版权页 · COLOPHON | CODA · COLOPHON |
| 标题 | 花园合上时，手还记得。 | When the garden closes, the hand remembers. |
| 导语 | HORTUS MANUS 是一座本地的数字标本馆。它不联网生长，也不替你保管手。 | HORTUS MANUS is a local digital herbarium. It does not grow online, and it does not keep your hands. |
| 版本 | 本地版 · 第 1 版 | LOCAL EDITION · FIRST PRINTING |
| 字体 | 字体 / TYPEFACES — Instrument Serif、Cormorant、Noto Serif SC、Noto Sans SC、IBM Plex Mono、Ma Shan Zheng，全部自托管。 | TYPEFACES — Instrument Serif, Cormorant, Noto Serif SC, Noto Sans SC, IBM Plex Mono, Ma Shan Zheng — all self-hosted. |
| 图版 | 图版 / PLATES — PD / CC0 植物学素材，来源逐项记录在 ASSET-LICENSES.md。 | PLATES — PD / CC0 botanical material, each source recorded in ASSET-LICENSES.md. |
| 技术 | 技术与材料 / MATERIALS — React、Three.js、Canvas 2D、MediaPipe、Hono、SQLite、WebAudio。 | MATERIALS — React, Three.js, Canvas 2D, MediaPipe, Hono, SQLite, WebAudio. |
| 研究 | 研究 / RESEARCH — 三段手指涂鸦视频的逐帧拆解、154 帧植物 gif、翻绳源码，以及 50 座以上植物学站点的编排研究。 | RESEARCH — Frame-by-frame teardowns of three finger-doodle videos, a 154-frame botanical gif, cat’s cradle source, and a survey of 50+ botanical sites. |
| 隐私 | 隐私 / PRIVACY — 摄像头画面不上传；采集只存元数据与种子；分享页可删除。 | PRIVACY — Camera frames are never uploaded; collections store metadata and a seed; share pages can be deleted. |
| 致谢 | 致谢 / THANKS — 给所有把花压进书里的人。 | THANKS — To everyone who has pressed a flower into a book. |
| 隐藏致意 | for Gerard & Claude | for Gerard & Claude |
| 授权 | 作品与代码 · 本地实验 · 不作商业发行 | Work and code · local experiment · not for commercial distribution |
| 回顶部 | 回到园门 | Back to the gate |
| 本地声明 | 生长于本地 · 不部署云端 | Grown locally · not deployed to the cloud |
| 尾句 | 以手为土，以息为风。 | Your hands are the weather. |
| 版权行 | © 2026 HORTUS MANUS · LOCAL EDITION | © 2026 HORTUS MANUS · LOCAL EDITION |
| 免责声明 | 虚构温室，标本为生成物，非真实采集数据。 | Fictional greenhouse; specimens are generated art, not real collection data. |

---

## 20. 文案禁区（写新文案前先读）

1. 不写「欢迎来到…」「在这里，你可以…」这类导览式空话。
2. 不用「体验」「探索」「解锁」「开启」作为按钮动词；用**手能做的动作**：推门、把手放上去、压进纸里、换季、听风。
3. 不承诺技术奇观（「前所未有的沉浸感」）；只描述可感知的事：露水、玻璃、纸、手的温度。
4. 不伪造数字与来源；模拟数据必须标「模拟」，生成标本必须标「生成物」。
5. 不用 emoji、颜文字、网络梗；不用感叹号连用。
6. 英文避免营销词（revolutionary, seamless, immersive, unleash）；用具体名词与短句。
7. 中文不堆四字成语；一个比喻最多出现一次。
8. 不把中文写成英文的直译；英文也不做中文的逐字注脚。

---

## 附录 A · 全量双语键值表（`copy.ts` 镜像）

<!-- AUTO-GENERATED-KEYS-START -->
<!-- 由脚本从 packages/shared/src/copy.ts 生成；请勿手工编辑；改 copy.ts 后重跑生成。 -->

### A.1 键值总表

> 本表由脚本从 `packages/shared/src/copy.ts` 逐字导出，共 542 条。

| 键 | 中文 | English |
|---|---|---|
| **brand** | | |
| `brand.name` | HORTUS MANUS | HORTUS MANUS |
| `brand.nameCn` | 指间花园 | 指间花园 |
| `brand.subtitle` | 一座属于双手的活体标本馆 | A LIVING HERBARIUM FOR YOUR HANDS |
| `brand.claim` | 以手为土，以息为风。 | Your hands are the weather. |
| `brand.latinClaim` | Manus est tempestas. | Manus est tempestas. |
| `brand.claimNote` | 触觉 · 标本 · 气候 | TOUCH · SPECIMEN · WEATHER |
| `brand.words` | 触觉 · 标本 · 气候 | TOUCH · SPECIMEN · WEATHER |
| `brand.manifestoLine` | 我们不用手指点击花朵；我们用手指成为天气。 | We do not click flowers. We become their weather. |
| `brand.edition` | 本地版 · LOCAL EDITION | LOCAL EDITION |
| **nav** | | |
| `nav.home` | 园门 | The Gate |
| `nav.touch` | 手部温室 | Hand Greenhouse |
| `nav.fieldGuide` | 手势图鉴 | Field Guide |
| `nav.herbarium` | 标本馆 | Herbarium |
| `nav.colophon` | 版权页 | Colophon |
| `nav.menu` | 目录 | Menu |
| `nav.theme` | 夜花园 | Night Garden |
| `nav.themeLight` | 回到白天 | Back to daylight |
| `nav.sound` | 声音 | Sound |
| `nav.languageSwitch` | English | 中文 |
| `nav.skip` | 跳到正文 | Skip to content |
| `nav.brandHome` | 回到园门 | Back to the gate |
| **common** | | |
| `common.enter` | 推门 | Open the gate |
| `common.enterHint` | 按 Enter，或直接点击 | Press Enter, or simply click |
| `common.next` | 下一幕 | Next act |
| `common.back` | 返回 | Back |
| `common.close` | 关闭 | Close |
| `common.cancel` | 取消 | Cancel |
| `common.confirm` | 确认 | Confirm |
| `common.save` | 保存 | Save |
| `common.saved` | 已保存 | Saved |
| `common.retry` | 再试一次 | Try again |
| `common.more` | 更多 | More |
| `common.dismiss` | 知道了 | Dismiss |
| `common.copy` | 复制 | Copy |
| `common.copied` | 已复制 | Copied |
| `common.download` | 下载 | Download |
| `common.share` | 分享 | Share |
| `common.search` | 搜索 | Search |
| `common.filter` | 筛选 | Filter |
| `common.sort` | 排序 | Sort |
| `common.clear` | 清空 | Clear |
| `common.apply` | 应用 | Apply |
| `common.reset` | 重置 | Reset |
| `common.all` | 全部 | All |
| `common.none` | 无 | None |
| `common.loading` | 正在生长… | Growing… |
| `common.offline` | 离线 | Offline |
| `common.online` | 在线 | Online |
| `common.yes` | 好 | Yes |
| `common.no` | 不用 | No |
| `common.readMore` | 继续读 | Read on |
| `common.viewAll` | 查看全部 | View all |
| `common.backHome` | 回到园门 | Back to the gate |
| `common.optional` | 可选 | Optional |
| **acts** | | |
| `acts.gate.index` | I | I |
| `acts.gate.kicker` | 第一幕 · 园门 | ACT I · THE GATE |
| `acts.gate.title` | 推门的手，<br>先于眼睛<br>知道春天。 | The hand that opens the gate<br>knows spring<br>before the eye. |
| `acts.gate.lead` | 一座不属于任何季节的花园。你带着手来，它才开始生长。 | A garden that belongs to no season. It begins growing when you arrive with your hands. |
| `acts.gate.body` | 这里没有欢迎页。只有一扇门，和一株等你呼吸的花。 | No welcome screen. Only a gate, and a flower waiting for your breath. |
| `acts.gate.cta` | 推门 | Open the gate |
| `acts.gate.ctaHint` | 不需要摄像头。指针、触屏、键盘都可以。 | No camera needed — pointer, touch and keyboard all work. |
| `acts.gate.caption` | PLATE I · 活体图版 · 芍药正在醒来 | PLATE I · living plate · the peony is waking |
| `acts.gate.meta` | 本地温室 · 第 1 日 | LOCAL GREENHOUSE · DAY 1 |
| `acts.gate.next` | 授粉 | Pollination |
| `acts.pollination.index` | II | II |
| `acts.pollination.kicker` | 第二幕 · 授粉 | ACT II · POLLINATION |
| `acts.pollination.title` | 让指尖先落下，<br>花才想起如何开。 | Let the fingertip land first —<br>then the flower remembers<br>how to open. |
| `acts.pollination.lead` | 七种花，七种手感。手指停在哪里，天气就落在哪里。 | Seven flowers, seven kinds of touch. Wherever your fingers stop, the weather falls there. |
| `acts.pollination.body` | 先选一种花式；把手放进光里，或者只动鼠标。 | Choose a flower first. Put your hands into the light — or just move the pointer. |
| `acts.pollination.cta` | 把手放上去 | Lend your hands |
| `acts.pollination.ctaHint` | 键盘 1–7 也能换花。 | Keys 1–7 switch the flower. |
| `acts.pollination.caption` | 花窗 · 翻绳 · 雨池 · 孢子 · 菌络 · 晨雾 · 花冠 | FRAME · TENDRIL · RIPPLE · SPORE · MYCELIUM · MIST · PHYLLOTAXIS |
| `acts.pollination.meta` | 七种花式 · 五种手势 · 三路输入 | SEVEN MODES · FIVE GESTURES · THREE INPUTS |
| `acts.pollination.next` | 温室 | The Greenhouse |
| `acts.greenhouse.index` | III | III |
| `acts.greenhouse.kicker` | 第三幕 · 温室 | ACT III · THE GREENHOUSE |
| `acts.greenhouse.title` | 这里没有墙，<br>只有气候。 | No walls here —<br>only weather. |
| `acts.greenhouse.lead` | 换季，调光，听风。温室会记住你上一次停留的温度。 | Change the season, dim the light, listen to the wind. The greenhouse remembers the temperature of your last visit. |
| `acts.greenhouse.body` | 四季不是皮肤，是空气。换季时，整座温室一起呼吸。 | Seasons here are not a skin; they are air. When the season turns, the whole greenhouse breathes with it. |
| `acts.greenhouse.cta` | 打开温室 | Open the greenhouse |
| `acts.greenhouse.ctaHint` | 按 X 换季；按 S 听风。 | X changes the season; S listens to the wind. |
| `acts.greenhouse.caption` | 四时之息 · 春分 夏至 秋分 冬至 | THE BREATH OF FOUR SEASONS · EQUINOXES AND SOLSTICES |
| `acts.greenhouse.meta` | 模拟气候 · 非传感器数据 | SIMULATED CLIMATE · NOT SENSOR DATA |
| `acts.greenhouse.next` | 田野笔记 | Field Notes |
| `acts.fieldNotes.index` | 间奏 | INTERLUDE |
| `acts.fieldNotes.kicker` | 间奏 · 田野笔记 | INTERLUDE · FIELD NOTES |
| `acts.fieldNotes.title` | 每一种手感，<br>都是天气<br>留下的笔迹。 | Every kind of touch<br>is handwriting<br>left by weather. |
| `acts.fieldNotes.lead` | 来自温室的日常记录：风的方向、露水的重量、某朵花不合时宜地开了。 | Notes from the greenhouse: the direction of wind, the weight of dew, a flower opening out of season. |
| `acts.fieldNotes.body` | 园丁不在场时，记录还在继续。 | When the gardener is away, the record continues. |
| `acts.fieldNotes.cta` | 继续读 | Read on |
| `acts.fieldNotes.caption` | FIELD NOTES · 第 1–4 则 | FIELD NOTES · I–IV |
| `acts.fieldNotes.meta` | 手写部分只在这里出现 | HANDWRITING APPEARS ONLY HERE |
| `acts.fieldNotes.next` | 版权页 | Colophon |
| `acts.herbarium.index` | IV | IV |
| `acts.herbarium.kicker` | 第四幕 · 标本馆 | ACT IV · THE HERBARIUM |
| `acts.herbarium.title` | 把会消失的，<br>压进纸里。 | Press what would vanish<br>into paper. |
| `acts.herbarium.lead` | 每一次采集，都会得到一张带编号的标本卡。它留在这台机器上，也可以被分享。 | Every collection becomes a numbered specimen card. It stays on this machine — and it can be shared. |
| `acts.herbarium.body` | 花不是数据。但它的形状、季节和那一刻的手感，可以被压平保存。 | A flower is not data. But its shape, its season and the touch of that moment can be pressed flat and kept. |
| `acts.herbarium.cta` | 进入标本馆 | Enter the herbarium |
| `acts.herbarium.ctaHint` | 采集后按 F 也能压花。 | After collecting, press F to press a flower. |
| `acts.herbarium.caption` | 本机保存 · 无上传 · 无账号 | STORED LOCALLY · NOTHING UPLOADED · NO ACCOUNT |
| `acts.herbarium.meta` | 标本为生成物 · 不是真实采集记录 | SPECIMENS ARE GENERATED ART · NOT REAL COLLECTION RECORDS |
| `acts.herbarium.next` | 尾幕 | Colophon |
| `acts.colophon.index` | 尾幕 | CODA |
| `acts.colophon.kicker` | 尾幕 · 版权页 | CODA · COLOPHON |
| `acts.colophon.title` | 花园合上时，<br>手还记得。 | When the garden closes,<br>the hand remembers. |
| `acts.colophon.lead` | 一切生长都在本地发生。没有云端，没有账户，没有上传。 | Everything grows locally. No cloud, no account, no upload. |
| `acts.colophon.body` | 这座花园是一次本地实验：研究、设计、代码与声音都在这台机器上。 | This garden is a local experiment: research, design, code and sound, all on this machine. |
| `acts.colophon.cta` | 回到园门 | Back to the gate |
| `acts.colophon.caption` | LOCAL EDITION · 第 1 版 | LOCAL EDITION · FIRST PRINTING |
| `acts.colophon.meta` | for Gerard & Claude | for Gerard & Claude |
| `acts.colophon.next` | 回到园门 | Back to the gate |
| **modes** | | |
| `modes.frame.index` | I | I |
| `modes.frame.name` | 花窗 | Frame |
| `modes.frame.en` | FRAME | FRAME |
| `modes.frame.latin` | Paeonia suffruticosa | Paeonia suffruticosa |
| `modes.frame.common` | 牡丹 | Tree Peony |
| `modes.frame.family` | Paeoniaceae · 芍药科 | Paeoniaceae · Peony family |
| `modes.frame.gesture` | 框 | Frame |
| `modes.frame.tagline` | 双手框成窗，花在里面开合。 | Frame a window with both hands; the flower opens inside it. |
| `modes.frame.instruction` | 张开双手框住花窗；张开手掌唤醒花瓣，握拳让它回到苞。 | Frame the window with both hands, open your palms to wake the petals, close your fists to return to the bud. |
| `modes.frame.blurb` | 花窗不是取景框，是花呼吸的地方。 | The frame is not a viewfinder; it is where the flower breathes. |
| `modes.frame.collectNoun` | 花窗 | frame flower |
| `modes.tendril.index` | II | II |
| `modes.tendril.name` | 翻绳 | Tendril |
| `modes.tendril.en` | TENDRIL | TENDRIL |
| `modes.tendril.latin` | Lonicera japonica | Lonicera japonica |
| `modes.tendril.common` | 金银花 | Japanese Honeysuckle |
| `modes.tendril.family` | Caprifoliaceae · 忍冬科 | Caprifoliaceae · Honeysuckle family |
| `modes.tendril.gesture` | 织 | Weave |
| `modes.tendril.tagline` | 二十一根丝线，在你指间编成藤。 | Twenty-one silk threads weave into a vine between your fingers. |
| `modes.tendril.instruction` | 五指张开牵引丝线，捏住一处拉紧，松手让它回弹。 | Spread five fingers to pull the threads, pinch one point to tighten, release to let it spring back. |
| `modes.tendril.blurb` | 翻绳的绳子是活的，它记得每一次张力。 | The string is alive; it remembers every tension. |
| `modes.tendril.collectNoun` | 绳结 | tendril knot |
| `modes.ripple.index` | III | III |
| `modes.ripple.name` | 雨池 | Ripple |
| `modes.ripple.en` | RIPPLE | RIPPLE |
| `modes.ripple.latin` | Nymphaea tetragona | Nymphaea tetragona |
| `modes.ripple.common` | 睡莲 | Pygmy Water Lily |
| `modes.ripple.family` | Nymphaeaceae · 睡莲科 | Nymphaeaceae · Water-lily family |
| `modes.ripple.gesture` | 捏 | Pinch |
| `modes.ripple.tagline` | 指尖触水，整个池塘开始回应。 | Touch the water and the whole pond answers. |
| `modes.ripple.instruction` | 指尖轻触水面，涟漪会记住你落下的位置。 | Touch the surface with a fingertip; the ripple remembers where you landed. |
| `modes.ripple.blurb` | 池塘是手指写下、水面写完的一句话。 | A pond is a sentence the finger writes and the water finishes. |
| `modes.ripple.collectNoun` | 睡莲 | water lily |
| `modes.spore.index` | IV | IV |
| `modes.spore.name` | 孢子 | Spore |
| `modes.spore.en` | SPORE | SPORE |
| `modes.spore.latin` | Taraxacum mongolicum | Taraxacum mongolicum |
| `modes.spore.common` | 蒲公英 | Dandelion |
| `modes.spore.family` | Asteraceae · 菊科 | Asteraceae · Daisy family |
| `modes.spore.gesture` | 拳 | Fist |
| `modes.spore.tagline` | 握拳把风交给种子，开掌接住它。 | Close your fist to give the wind a seed; open your palm to catch it. |
| `modes.spore.instruction` | 握拳吹散蒲公英，张开手掌接住飘回的种子。 | Close your fist to blow the dandelion apart; open your palm to catch the seeds that drift back. |
| `modes.spore.blurb` | 一口可以握在拳头里的气。 | A breath you can hold in a fist. |
| `modes.spore.collectNoun` | 蒲公英 | dandelion |
| `modes.mycelium.index` | V | V |
| `modes.mycelium.name` | 菌络 | Mycelium |
| `modes.mycelium.en` | MYCELIUM | MYCELIUM |
| `modes.mycelium.latin` | Armillaria mellea | Armillaria mellea |
| `modes.mycelium.common` | 蜜环菌 | Honey Fungus |
| `modes.mycelium.family` | Physalacriaceae · 蜜环菌科 | Physalacriaceae · Honey-fungus family |
| `modes.mycelium.gesture` | 框 | Frame |
| `modes.mycelium.tagline` | 两掌之间，地下的网络开始呼吸。 | Between two palms, the underground network begins to breathe. |
| `modes.mycelium.instruction` | 双掌相对靠近，让菌丝在掌间生长；呼吸会改变它的脉冲。 | Bring both palms close; mycelium grows between them. Your breathing changes its pulse. |
| `modes.mycelium.blurb` | 森林大半长在看不见的地下。 | The forest is mostly underground. |
| `modes.mycelium.collectNoun` | 菌络 | mycelium |
| `modes.mist.index` | VI | VI |
| `modes.mist.name` | 晨雾 | Mist |
| `modes.mist.en` | MIST | MIST |
| `modes.mist.latin` | Adiantum capillus-veneris | Adiantum capillus-veneris |
| `modes.mist.common` | 铁线蕨 | Maidenhair Fern |
| `modes.mist.family` | Pteridaceae · 凤尾蕨科 | Pteridaceae · Maidenhair family |
| `modes.mist.gesture` | 开 | Open |
| `modes.mist.tagline` | 擦开一层雾，露出压进玻璃里的花。 | Wipe the glass and a pressed flower appears. The mist will return. |
| `modes.mist.instruction` | 用手掌擦过冷凝的玻璃，雾会慢慢回来。 | Wipe the condensed glass with your palm; the fog slowly comes back. |
| `modes.mist.blurb` | 有些花只有在你擦净窗户时才出现。 | Some flowers are only visible when you clear the window. |
| `modes.mist.collectNoun` | 压花 | pressed fern |
| `modes.phyllotaxis.index` | VII | VII |
| `modes.phyllotaxis.name` | 花冠 | Phyllotaxis |
| `modes.phyllotaxis.en` | PHYLLOTAXIS | PHYLLOTAXIS |
| `modes.phyllotaxis.latin` | Helianthus annuus | Helianthus annuus |
| `modes.phyllotaxis.common` | 向日葵 | Sunflower |
| `modes.phyllotaxis.family` | Asteraceae · 菊科 | Asteraceae · Daisy family |
| `modes.phyllotaxis.gesture` | 开 | Open |
| `modes.phyllotaxis.tagline` | 黄金角旋转，花瓣自己找到位置。 | At the golden angle, petals find their own places. |
| `modes.phyllotaxis.instruction` | 转动双手改变螺旋方向，开合手掌缩放花冠。 | Rotate your hands to turn the spiral; open and close your palms to scale the corolla. |
| `modes.phyllotaxis.blurb` | 没有人替向日葵排列花瓣。 | No one arranges a sunflower. |
| `modes.phyllotaxis.collectNoun` | 花冠 | sunflower spiral |
| **gestures** | | |
| `gestures.frame.name` | 框 | Frame |
| `gestures.frame.en` | FRAME | FRAME |
| `gestures.frame.hand` | 双手拇指与食指围成方形 | Thumbs and index fingers of both hands form a square |
| `gestures.frame.hint` | 框住一朵花 | Frame a flower |
| `gestures.open.name` | 开 | Open |
| `gestures.open.en` | OPEN | OPEN |
| `gestures.open.hand` | 五指张开，掌心向上 | Five fingers spread, palm up |
| `gestures.open.hint` | 让花醒来 | Wake the flower |
| `gestures.pinch.name` | 捏 | Pinch |
| `gestures.pinch.en` | PINCH | PINCH |
| `gestures.pinch.hand` | 拇指与食指相触 | Thumb and index finger touch |
| `gestures.pinch.hint` | 捏住一瓣 | Hold one petal |
| `gestures.fist.name` | 拳 | Fist |
| `gestures.fist.en` | FIST | FIST |
| `gestures.fist.hand` | 握拳，指节朝前 | A closed fist, knuckles forward |
| `gestures.fist.hint` | 让花回苞 | Return to the bud |
| `gestures.weave.name` | 织 | Weave |
| `gestures.weave.en` | WEAVE | WEAVE |
| `gestures.weave.hand` | 双手交叉，错开一个指缝 | Both hands crossed, one finger-gap apart |
| `gestures.weave.hint` | 编一段藤 | Weave a vine |
| **seasons** | | |
| `seasons.spring.name` | 春 | Spring |
| `seasons.spring.en` | SPRING | SPRING |
| `seasons.spring.term` | 春分 | Vernal Equinox |
| `seasons.spring.note` | 纸是湿的，花窗自己开了一指宽。 | The paper is damp; the frame opened a finger-width by itself. |
| `seasons.spring.short` | 湿绿 | wet green |
| `seasons.summer.name` | 夏 | Summer |
| `seasons.summer.en` | SUMMER | SUMMER |
| `seasons.summer.term` | 夏至 | Summer Solstice |
| `seasons.summer.note` | 光落在水面上，涟漪比风先到。 | Light lands on the water; the ripple arrives before the wind. |
| `seasons.summer.short` | 浓荫 | deep shade |
| `seasons.autumn.name` | 秋 | Autumn |
| `seasons.autumn.en` | AUTUMN | AUTUMN |
| `seasons.autumn.term` | 秋分 | Autumnal Equinox |
| `seasons.autumn.note` | 孢子飞得比上次远，也许因为天更高。 | The spores flew farther than last time — maybe the sky is higher. |
| `seasons.autumn.short` | 金粉 | gold dust |
| `seasons.winter.name` | 冬 | Winter |
| `seasons.winter.en` | WINTER | WINTER |
| `seasons.winter.term` | 冬至 | Winter Solstice |
| `seasons.winter.note` | 玻璃结雾，压花在雾后面等一只手。 | The glass fogs; the pressed flower waits behind it for a hand. |
| `seasons.winter.short` | 水汽 | water vapour |
| **touch** | | |
| `touch.kicker` | 手部温室 · HAND GREENHOUSE | HAND GREENHOUSE |
| `touch.title` | 全屏手部温室 | Full-screen hand greenhouse |
| `touch.subtitle` | 七种花 · 四种气候 · 三路输入 | Seven flowers · four climates · three inputs |
| `touch.stageLabel` | 活体舞台 | Living stage |
| `touch.modeRailTitle` | 植物学检索表 | Botanical key |
| `touch.modeRailHint` | 选择一种花式；再按一次回到默认。 | Choose a flower; press again to return to the default. |
| `touch.careLabel` | 采集条件 | Care label |
| `touch.gestureHint` | 张开手掌 · 捏住花瓣 · 握拳回苞 | Open palm · pinch a petal · close a fist |
| `touch.gestureIdle` | 把手放进光里。 | Put your hand into the light. |
| `touch.keyboard` | 1–7 换花 · Q/W/E/R 兼容 · X 换季 · C 清屏 · G 幽灵手 · S 声音 · D 视图 · ? 帮助 · Esc 退出 | 1–7 mode · Q/W/E/R switch · X season · C clear · G ghost hand · S sound · D view · ? help · Esc exit |
| `touch.collect` | 采集 | Collect |
| `touch.collectHint` | 把这一株压进纸里 | Press this one into paper |
| `touch.exit` | 退出温室 | Leave the greenhouse |
| `touch.exitHint` | Esc | Esc |
| `touch.pause` | 暂停 | Pause |
| `touch.resume` | 继续 | Resume |
| `touch.ghost` | 幽灵手 | Ghost hand |
| `touch.ghostHint` | 看一只手如何唤醒花园 | Watch a hand wake the garden |
| `touch.clear` | 清屏 | Clear |
| `touch.view` | 视图 | View |
| `touch.help` | 帮助 | Help |
| `touch.quiet` | 静默模式 | Quiet mode |
| `touch.noHand` | 还没有看到手。指针和键盘同样可以开始。 | No hand yet. Pointer and keyboard can start just as well. |
| `touch.hands` | 手已就位。 | Hands in place. |
| `touch.ready` | 舞台已就绪 | Stage ready |
| `touch.offline` | 舞台离线 | Stage offline |
| `touch.compact` | 收起面板 | Collapse panel |
| `touch.expand` | 展开面板 | Expand panel |
| `touch.privacyShort` | 画面不离开这台设备。 | Frames never leave this device. |
| **care** | | |
| `care.label` | 采集条件 · CARE | CARE LABEL |
| `care.fps` | 帧率 | FPS |
| `care.latency` | 延迟 | Latency |
| `care.camera` | 相机 | Camera |
| `care.season` | 季节 | Season |
| `care.mode` | 花式 | Mode |
| `care.source` | 输入 | Input |
| `care.sound` | 声音 | Sound |
| `care.fpsUnit` | fps | fps |
| `care.latencyUnit` | ms | ms |
| `care.sourcePointer` | 指针 | pointer |
| `care.sourceTouch` | 双指 | touch |
| `care.sourceCamera` | 相机 | camera |
| `care.sourceGhost` | 幽灵手 | ghost hand |
| `care.sourceNone` | 等待 | waiting |
| `care.cameraOff` | 未启用 | off |
| `care.cameraRequesting` | 请求中 | asking |
| `care.cameraOn` | 已就绪 | ready |
| `care.cameraDenied` | 被拒绝 | denied |
| `care.cameraUnavailable` | 不可用 | unavailable |
| `care.soundOff` | 静音 | muted |
| `care.soundOn` | 开启 | on |
| **camera** | | |
| `camera.title` | 把手借给花园 | Lend your hands to the garden |
| `camera.body` | 摄像头只在本地辨认你的手。画面不录、不传、不存。 | The camera reads your hands locally. Frames are not recorded, uploaded or stored. |
| `camera.waiting` | 正在向这台机器请求画面… | Asking this machine for a picture… |
| `camera.ready` | 手部追踪已就绪 | Hand tracking is ready |
| `camera.denied` | 摄像头被拒绝。指针与键盘同样可以开始。 | Camera denied. Pointer and keyboard can start just as well. |
| `camera.unavailable` | 这台设备没有可用的摄像头。花园不会因此关闭。 | No camera on this device. The garden does not close for that. |
| `camera.retry` | 重新请求 | Ask again |
| `camera.allow` | 允许使用摄像头 | Allow camera |
| `camera.notNow` | 暂时不用 | Not now |
| `camera.preview` | 本地预览 | Local preview |
| `camera.stop` | 关闭摄像头 | Stop camera |
| `camera.privacyTitle` | 隐私仪式 | Privacy ritual |
| `camera.privacyBody` | 我们只读取 21 个手部关键点。 | We read 21 hand landmarks. Nothing else. |
| `camera.privacySteps` | 画面留在内存 · 只有坐标离开画面 · 关闭即忘记 | Frames stay in memory · Only coordinates leave the frame · Close it and it is forgotten |
| `camera.disclaimer` | 本机处理 · 无上传 · 无录像 | ON-DEVICE · NO UPLOAD · NO RECORDING |
| `camera.cameraOnly` | 摄像头只用来辨认 21 个手部关键点。 | The camera is used only to read 21 hand landmarks. |
| **sound** | | |
| `sound.title` | 花园的声音 | The sound of the garden |
| `sound.body` | 风、水、丝弦与五声音阶，全部由合成器当场生成。 | Wind, water, silk strings and a pentatonic scale, synthesised live. |
| `sound.on` | 打开声音 | Turn sound on |
| `sound.off` | 关闭声音 | Turn sound off |
| `sound.muted` | 静音 | Muted |
| `sound.volume` | 音量 | Volume |
| `sound.hint` | 声音默认关闭。只有你允许，花园才会响。 | Sound is off by default. The garden only sounds when you allow it. |
| `sound.starting` | 正在唤醒风… | Waking the wind… |
| `sound.layers.wind` | 风 | Wind |
| `sound.layers.water` | 水 | Water |
| `sound.layers.string` | 丝弦 | Silk strings |
| `sound.layers.pentatonic` | 五声音阶 | Pentatonic |
| `sound.note` | 无音频文件；无自动播放。 | No audio files; no autoplay. |
| **collect** | | |
| `collect.title` | 采集卡 | Collection card |
| `collect.nameLabel` | 标本名 | Specimen |
| `collect.captionLabel` | 题记 | Field note |
| `collect.captionPlaceholder` | 给这朵花留一句话（可选，60 字以内） | Leave this flower a line (optional, max 60 characters) |
| `collect.save` | 压进纸里 | Press into paper |
| `collect.saving` | 正在压进纸里… | Pressing into paper… |
| `collect.savedTitle` | 已压进纸里 | Pressed into paper |
| `collect.savedBody` | 标本卡生成了。它留在本机，也可以分享。 | The specimen card exists. It stays on this machine — and it can be shared. |
| `collect.viewSpecimen` | 查看标本卡 | View specimen card |
| `collect.share` | 分享这株 | Share this one |
| `collect.thanks` | 致谢 | Thanks |
| `collect.thanksDone` | 已致谢 | Thanked |
| `collect.deleteTitle` | 把这株从纸上取下来？ | Take this one off the paper? |
| `collect.deleteBody` | 标本卡与分享页会一并消失。删除凭证存在这台机器的 localStorage。 | The specimen card and its share page will disappear. The delete token lives in this browser’s localStorage. |
| `collect.deleteConfirm` | 确认移除 | Remove it |
| `collect.deleteCancel` | 留着 | Keep it |
| `collect.deleted` | 这株已被取下。 | This one has been taken down. |
| `collect.tokenNote` | 删除凭证只保存在本机浏览器。 | The delete token is stored only in this browser. |
| `collect.downloadCard` | 下载卡片 | Download card |
| `collect.copyLink` | 复制链接 | Copy link |
| `collect.qrAlt` | 指向这株标本分享页的二维码 | QR code pointing to this specimen share page |
| `collect.cardAlt` | 这株标本的标本卡 | Specimen card for this flower |
| `collect.shareText` | 我的手在花园里留下了一株花。 | My hands left a flower in the garden. |
| **specimen** | | |
| `specimen.latin` | 学名 | Latin name |
| `specimen.commonName` | 俗名 | Common name |
| `specimen.family` | 科 | Family |
| `specimen.genus` | 属 | Genus |
| `specimen.species` | 种 | Species |
| `specimen.herbariumNo` | 采集号 | Herbarium no. |
| `specimen.plate` | 图版 | Plate |
| `specimen.collectedAt` | 采集时间 | Collected |
| `specimen.collector` | 采集人 | Collector |
| `specimen.habitat` | 生境 | Habitat |
| `specimen.season` | 季节 | Season |
| `specimen.mode` | 花式 | Mode |
| `specimen.coordinates` | 坐标 | Coordinates |
| `specimen.thanksCount` | 致谢 | Thanks |
| `specimen.note` | 田野题记 | Field note |
| `specimen.pressed` | 压花状态 | Pressed state |
| `specimen.pressedState` | 已压平 | Pressed flat |
| `specimen.localOnly` | 仅存于本机 | On this machine only |
| `specimen.determination` | 鉴定 | Determination |
| `specimen.shareHint` | 扫码或打开链接 | Scan or open the link |
| `specimen.garden` | 本地温室 | Local greenhouse |
| **herbarium** | | |
| `herbarium.kicker` | 标本馆 · HERBARIUM | HERBARIUM |
| `herbarium.title` | 所有被压进纸里的花。 | Every flower pressed into paper. |
| `herbarium.lead` | 按花式、季节、日期筛选。每一张卡都由种子确定性生成，不存图片。 | Filter by mode, season or date. Every card is generated deterministically from a seed — no images stored. |
| `herbarium.searchPlaceholder` | 搜索题记、花式、采集号… | Search field notes, modes, herbarium numbers… |
| `herbarium.filterMode` | 花式 | Mode |
| `herbarium.filterSeason` | 季节 | Season |
| `herbarium.filterSort` | 排序 | Sort |
| `herbarium.sortNewest` | 最新采集 | Newest first |
| `herbarium.sortOldest` | 最早采集 | Oldest first |
| `herbarium.sortThanks` | 最多致谢 | Most thanked |
| `herbarium.countLabel` | 株 | specimens |
| `herbarium.emptyTitle` | 纸还是空的。 | The paper is still empty. |
| `herbarium.emptyBody` | 去温室采一朵，这里就会有第一株。 | Collect one in the greenhouse and the first specimen will appear here. |
| `herbarium.emptyCta` | 进入温室 | Enter the greenhouse |
| `herbarium.filteredEmpty` | 没有符合这组条件的花。 | No flowers match this set of filters. |
| `herbarium.clearFilters` | 清空筛选 | Clear filters |
| `herbarium.loading` | 正在翻页… | Turning the page… |
| `herbarium.errorTitle` | 纸页受潮了。 | The paper is damp. |
| `herbarium.errorBody` | 本地服务没有回应。确认 pnpm start 正在运行。 | The local service did not answer. Check that pnpm start is running. |
| `herbarium.retry` | 再翻一次 | Turn the page again |
| `herbarium.offlineTitle` | 离线了。 | Offline. |
| `herbarium.offlineBody` | 标本馆存在本机；网络恢复后刷新即可。 | The herbarium lives on this machine; refresh when the service is back. |
| `herbarium.preview` | 预览 | Preview |
| `herbarium.thanksAction` | 致谢 | Thanks |
| `herbarium.view` | 打开 | Open |
| `herbarium.delete` | 取下 | Remove |
| `herbarium.note` | 标本为生成物，不是真实采集记录。 | Specimens are generated art, not real collection records. |
| **daily** | | |
| `daily.kicker` | 每日一株 · TODAY'S SPECIMEN | TODAY'S SPECIMEN |
| `daily.title` | 今天，花园选了这一株。 | Today the garden chose this one. |
| `daily.body` | 每天凌晨，本地温室会抽一株新的。不是推荐算法，是种子。 | At midnight the local greenhouse draws a new specimen. Not a recommendation algorithm — a seed. |
| `daily.cta` | 看这一株 | See this one |
| `daily.note` | 由本机种子决定 · 每日更换 | Chosen by a local seed · changes daily |
| `daily.unavailable` | 今日的种子还没发芽。 | Today’s seed has not sprouted yet. |
| `daily.datePrefix` | 今日 | Today |
| **fieldGuide** | | |
| `fieldGuide.kicker` | 图鉴 · FIELD GUIDE | FIELD GUIDE |
| `fieldGuide.title` | 手势图鉴与二十一点解剖 | Gestures and the anatomy of twenty-one points |
| `fieldGuide.lead` | 七种花式，五种手势，二十一个手部关键点。这里没有摄像头也能读。 | Seven modes, five gestures, twenty-one hand landmarks. This page reads fine without a camera. |
| `fieldGuide.gesturesTitle` | 五种手势 | Five gestures |
| `fieldGuide.modesTitle` | 七种花式 | Seven modes |
| `fieldGuide.anatomyTitle` | 二十一点解剖 | Twenty-one points |
| `fieldGuide.anatomyLead` | MediaPipe 的手部模型把一只手读成 21 个点。点不动，花才动。 | MediaPipe reads one hand as 21 landmarks. The points stay still; the flower moves. |
| `fieldGuide.makingTitle` | 怎么做的 | How it is made |
| `fieldGuide.makingBody` | 自写 Verlet 丝线、One Euro 滤波、黄金角与手部追踪。没有引擎模板，没有复制粘贴的 demo。 | Hand-written Verlet threads, One Euro filtering, golden angle and hand tracking. No engine template, no copied demo. |
| `fieldGuide.performanceTitle` | 实时性能 | Live performance |
| `fieldGuide.performanceLead` | 舞台目标 60fps；低于 45 自动降级；指针模式建议 30fps 以上。 | Stage target 60fps; automatic degradation below 45; pointer mode is fine above 30. |
| `fieldGuide.privacyTitle` | 隐私 | Privacy |
| `fieldGuide.privacyBody` | 摄像头画面只在本机内存里被读取，不上传、不录制、不写入磁盘。 | Camera frames are read in memory only — not uploaded, not recorded, not written to disk. |
| `fieldGuide.shortcutsTitle` | 键盘 | Keyboard |
| `fieldGuide.landmarks` | 腕 WRIST · 拇指根 CMC · 拇指掌指 MCP · 拇指间 IP · 拇指尖 TIP · 食指掌指 MCP · 食指近节 PIP · 食指中节 DIP · 食指尖 TIP · 中指掌指 MCP · 中指近节 PIP · 中指中节 DIP · 中指尖 TIP · 无名指掌指 MCP · 无名指近节 PIP · 无名指中节 DIP · 无名指尖 TIP · 小指掌指 MCP · 小指近节 PIP · 小指中节 DIP · 小指尖 TIP | WRIST · THUMB CMC · THUMB MCP · THUMB IP · THUMB TIP · INDEX MCP · INDEX PIP · INDEX DIP · INDEX TIP · MIDDLE MCP · MIDDLE PIP · MIDDLE DIP · MIDDLE TIP · RING MCP · RING PIP · RING DIP · RING TIP · PINKY MCP · PINKY PIP · PINKY DIP · PINKY TIP |
| **fieldNotes** | | |
| `fieldNotes.kicker` | 田野笔记 · FIELD NOTES | FIELD NOTES |
| `fieldNotes.title` | 每一种手感，都是天气留下的笔迹。 | Every kind of touch is handwriting left by weather. |
| `fieldNotes.lead` | 园丁不在场时，记录还在继续。 | When the gardener is away, the record continues. |
| `fieldNotes.entries` | 第 3 日 · 风从东南来 · 花窗自己开了一指宽；没有人碰它。 · 给风留一扇窗。 · 第 9 日 · 露水重过昨天 · 铁线蕨的背面结了一层雾，像有人呵过气。 · 雾会回来。 · 第 17 日 · 一枚不合时宜的花瓣 · 芍药在冬天开了第三层。气候是假的，手是真的。 · 花不知道季节。 · 第 27 日 · 夜里的访客 · 关灯后，花粉像小小的灯。没有人看见，除了你。 · 夜里也要开花。 | Day 3 · Wind from the southeast · The frame opened a finger-width by itself; nobody touched it. · Leave the wind a window. · Day 9 · Dew heavier than yesterday · A layer of fog formed on the back of the maidenhair fern, as if someone had breathed on it. · The mist will return. · Day 17 · One petal out of season · The peony opened a third layer in winter. The climate is fake; the hand is real. · The flower does not know the season. · Day 27 · A visitor at night · After the lights went out, pollen became tiny lamps. No one saw it but you. · Bloom at night too. |
| `fieldNotes.signature` | 园丁的手记 | The gardener’s hand |
| `fieldNotes.homage` | for Gerard & Claude | for Gerard & Claude |
| **share** | | |
| `share.kicker` | 标本分享 · SHARE | SHARE |
| `share.title` | 一朵花的手印。 | A handprint of a flower. |
| `share.body` | 这株花由本机采集，卡片与 OG 图由服务端确定性生成。 | This flower was collected locally; the card and OG image are generated deterministically by the server. |
| `share.thanks` | 致谢 | Thanks |
| `share.thanksDone` | 已致谢 | Thanked |
| `share.qrTitle` | 扫码看这一株 | Scan to see this specimen |
| `share.qrHint` | 二维码指向本机地址；只在这台设备或同一局域网内有效。 | The QR code points to a local address — valid on this device or the same local network. |
| `share.download` | 下载卡片 | Download card |
| `share.copyLink` | 复制链接 | Copy link |
| `share.copied` | 链接已复制 | Link copied |
| `share.back` | 回到标本馆 | Back to the herbarium |
| `share.deleteHint` | 不想要这株？打开删除凭证即可移除。 | Want it gone? Open the delete token link to remove it. |
| `share.ogTitle` | 一朵花的手印 — HORTUS MANUS | A handprint of a flower — HORTUS MANUS |
| `share.ogDescription` | 这株花由一只手的天气生成。点开，看它的标本卡。 | This flower was made by the weather of one hand. Open it and see its specimen card. |
| `share.cardCaption` | HORTUS MANUS · 本机标本 | HORTUS MANUS · LOCAL SPECIMEN |
| **meta** | | |
| `meta.title` | HORTUS MANUS · 指间花园 | HORTUS MANUS · A Living Herbarium |
| `meta.description` | 一座属于双手的活体标本馆。以手为土，以息为风；七种花式，四季气候，全部在本机生长。 | A living herbarium for your hands. Your hands are the weather: seven flowers, four seasons, growing locally. |
| `meta.ogTitle` | HORTUS MANUS · 指间花园 | HORTUS MANUS · A Living Herbarium |
| `meta.ogDescription` | 以手为土，以息为风。你的手就是天气。 | Your hands are the weather. A living herbarium for your hands. |
| `meta.twitterTitle` | HORTUS MANUS · 指间花园 | HORTUS MANUS · A Living Herbarium |
| `meta.twitterDescription` | 一座属于双手的活体标本馆。 | A living herbarium for your hands. |
| `meta.locale` | zh_CN | en_US |
| `meta.siteName` | HORTUS MANUS | HORTUS MANUS |
| **notFound** | | |
| `notFound.code` | 404 | 404 |
| `notFound.kicker` | 未压进纸里 · NOT PRESSED | NOT PRESSED |
| `notFound.title` | 这株标本还没有被压进纸里。 | This specimen has not been pressed yet. |
| `notFound.body` | 也许它还在温室里长着，也许这个编号从来不存在。 | Perhaps it is still growing in the greenhouse; perhaps this number never existed. |
| `notFound.hint` | 如果你是从分享页来的，可能这株已被采集者取下。 | If you came from a share link, the collector may have taken it down. |
| `notFound.cta` | 回到标本馆 | Back to the herbarium |
| `notFound.home` | 回到园门 | Back to the gate |
| `notFound.ghostNote` | （角落里有一朵没人认领的花。） | (There is an unclaimed flower in the corner.) |
| **privacy** | | |
| `privacy.title` | 隐私是一道门，不是一堵墙。 | Privacy is a door, not a wall. |
| `privacy.cameraOnly` | 摄像头只用来辨认 21 个手部关键点。 | The camera is used only to read 21 hand landmarks. |
| `privacy.noUpload` | 画面不离开这台设备，不录制，不写入磁盘。 | Frames never leave this device — not recorded, not written to disk. |
| `privacy.noAccount` | 没有账号，没有 PII，没有云。 | No account, no PII, no cloud. |
| `privacy.deleteToken` | 删除凭证只保存在本机 localStorage。 | The delete token lives only in this browser’s localStorage. |
| `privacy.localFirst` | 一切优先在本地发生。 | Everything happens locally first. |
| `privacy.noCookies` | 不使用追踪 cookie。 | No tracking cookies. |
| `privacy.analytics` | 只统计匿名事件计数，不含画面。 | Only anonymous event counts — never frames. |
| **colophon** | | |
| `colophon.kicker` | 版权页 · COLOPHON | CODA · COLOPHON |
| `colophon.title` | 花园合上时，手还记得。 | When the garden closes, the hand remembers. |
| `colophon.lead` | HORTUS MANUS 是一座本地的数字标本馆。它不联网生长，也不替你保管手。 | HORTUS MANUS is a local digital herbarium. It does not grow online, and it does not keep your hands. |
| `colophon.edition` | 本地版 · 第 1 版 | LOCAL EDITION · FIRST PRINTING |
| `colophon.typeCredit` | 字体 / TYPEFACES | TYPEFACES |
| `colophon.typeBody` | Instrument Serif、Cormorant、Noto Serif SC、Noto Sans SC、IBM Plex Mono、Ma Shan Zheng，全部自托管。 | Instrument Serif, Cormorant, Noto Serif SC, Noto Sans SC, IBM Plex Mono, Ma Shan Zheng — all self-hosted. |
| `colophon.plateCredit` | 图版 / PLATES | PLATES |
| `colophon.plateBody` | PD / CC0 植物学素材，来源逐项记录在 ASSET-LICENSES.md。 | PD / CC0 botanical material, each source recorded in ASSET-LICENSES.md. |
| `colophon.techCredit` | 技术与材料 / MATERIALS | MATERIALS |
| `colophon.techBody` | React、Three.js、Canvas 2D、MediaPipe、Hono、SQLite、WebAudio。 | React, Three.js, Canvas 2D, MediaPipe, Hono, SQLite, WebAudio. |
| `colophon.researchCredit` | 研究 / RESEARCH | RESEARCH |
| `colophon.researchBody` | 三段手指涂鸦视频的逐帧拆解、154 帧植物 gif、翻绳源码，以及 50 座以上植物学站点的编排研究。 | Frame-by-frame teardowns of three finger-doodle videos, a 154-frame botanical gif, cat’s cradle source, and a survey of 50+ botanical sites. |
| `colophon.privacyCredit` | 隐私 / PRIVACY | PRIVACY |
| `colophon.privacyBody` | 摄像头画面不上传；采集只存元数据与种子；分享页可删除。 | Camera frames are never uploaded; collections store metadata and a seed; share pages can be deleted. |
| `colophon.thanks` | 致谢 / THANKS | THANKS |
| `colophon.thanksBody` | 给所有把花压进书里的人。 | To everyone who has pressed a flower into a book. |
| `colophon.homage` | for Gerard & Claude | for Gerard & Claude |
| `colophon.license` | 作品与代码 · 本地实验 · 不作商业发行 | Work and code · local experiment · not for commercial distribution |
| `colophon.backTop` | 回到园门 | Back to the gate |
| `colophon.madeLocal` | 生长于本地 · 不部署云端 | Grown locally · not deployed to the cloud |
| `colophon.footerLine` | 以手为土，以息为风。 | Your hands are the weather. |
| `colophon.copyright` | © 2026 HORTUS MANUS · LOCAL EDITION | © 2026 HORTUS MANUS · LOCAL EDITION |
| `colophon.disclaimer` | 虚构温室，标本为生成物，非真实采集数据。 | Fictional greenhouse; specimens are generated art, not real collection data. |
| **marquee** | | |
| `marquee.aria` | 温室公告 | Greenhouse announcements |
| `marquee.items` | 以手为土，以息为风。 · 本机运行 · 无云端 · 摄像头画面不上传 · 按 F 压花 · 每日一株 · 本地种子 · 夜花园 · 可选 | Your hands are the weather. · Runs locally · no cloud · Camera frames are never uploaded · Press F to press a flower · Today's specimen · local seed · Night garden · optional |
| **onboarding** | | |
| `onboarding.title` | 第一次来？ | First time here? |
| `onboarding.body` | 不必先给摄像头。指针、双指、键盘都能让花醒来。 | You do not have to give the camera first. Pointer, touch and keyboard can wake the flower. |
| `onboarding.steps` | 把手放在光里 · 选择一种花式 · 采一株带走 | Put your hand in the light · Choose a flower · Take one home |
| `onboarding.start` | 开始 | Start |
| `onboarding.skip` | 我自己逛 | I’ll wander |
| `onboarding.hint` | 随时按 ? 看手势 | Press ? anytime for gestures |
| **toasts** | | |
| `toasts.collected` | 已压进纸里 | Pressed into paper |
| `toasts.copied` | 链接已复制 | Link copied |
| `toasts.deleted` | 标本已取下 | Specimen removed |
| `toasts.soundOn` | 声音已打开 | Sound on |
| `toasts.soundOff` | 声音已关闭 | Sound off |
| `toasts.seasonChanged` | 换季了 | Season changed |
| `toasts.modeChanged` | 换了一种花式 | Flower changed |
| `toasts.cameraOn` | 相机已就绪 | Camera ready |
| `toasts.cameraOff` | 相机已关闭 | Camera off |
| `toasts.shareReady` | 分享卡已生成 | Share card ready |
| `toasts.offline` | 本地服务离线 | Local service offline |
| `toasts.online` | 本地服务已恢复 | Local service is back |
| `toasts.thanks` | 已致谢 | Thanked |
| `toasts.thanksAlready` | 这株已收过你的致谢 | This specimen already has your thanks |
| `toasts.error` | 没有成功，再试一次 | That did not work — try again |
| `toasts.limit` | 采集太快了，等一秒再压。 | Collecting too fast; wait a second. |
| **errors** | | |
| `errors.genericTitle` | 这一页被风吹走了。 | The wind took this page. |
| `errors.genericBody` | 没有完成。再试一次，或者回到园门。 | It did not complete. Try again, or return to the gate. |
| `errors.apiTitle` | 土壤是干的。 | The soil is dry. |
| `errors.apiBody` | 本地服务没有回应。确认 pnpm start 正在运行，然后刷新。 | The local service did not answer. Check that pnpm start is running, then refresh. |
| `errors.offlineTitle` | 网线不重要，但服务要活着。 | The cable does not matter, but the service does. |
| `errors.offlineBody` | 页面已缓存；采集与标本馆需要本地服务。 | The page is cached; collecting and the herbarium need the local service. |
| `errors.cameraTitle` | 没有镜头也可以。 | You can do this without a lens. |
| `errors.cameraBody` | 指针、双指和键盘同样能让花醒来。 | Pointer, touch and keyboard can wake the flower just as well. |
| `errors.collectTitle` | 这朵花没有被夹住。 | This flower was not caught. |
| `errors.collectBody` | 再试一次；如果还不行，刷新页面。 | Try again; if it still fails, refresh the page. |
| `errors.invalidCaption` | 题记太长了，留给花一点空白。 | The field note is too long — leave the flower some blank paper. |
| `errors.invalidId` | 这个编号不像一株标本。 | This number does not look like a specimen. |
| **empty** | | |
| `empty.specimens` | 还没有标本。 | No specimens yet. |
| `empty.notes` | 笔记还没有写。 | No notes written yet. |
| `empty.results` | 没有结果。 | No results. |
| `empty.loading` | 正在加载… | Loading… |
| **loading** | | |
| `loading.stage` | 温室正在开门… | The greenhouse is opening… |
| `loading.archive` | 正在翻页… | Turning the page… |
| `loading.share` | 正在压平这株… | Pressing this one flat… |
| `loading.garden` | 正在生长… | Growing… |
| **shortcuts** | | |
| `shortcuts` | 1–7 · 切换花式 · Q W E R · 兼容切换花式 · X · 换季 · S · 声音开关 · G · 幽灵手演示 · C · 清屏 · D · 切换视图 · F · 压花 / 采集 · ? · 帮助 · Esc · 退出温室 · ⌘K · 指令抽屉 | 1–7 · Switch mode · Q W E R · Alternate mode switch · X · Change season · S · Sound on / off · G · Ghost-hand demo · C · Clear the stage · D · Toggle view · F · Press / collect · ? · Help · Esc · Leave the greenhouse · ⌘K · Command drawer |
| **aria** | | |
| `aria.navMain` | 主导航 | Main navigation |
| `aria.chapterRail` | 章节 | Chapters |
| `aria.modeRail` | 花式检索表 | Botanical mode key |
| `aria.stage` | 活体花窗舞台 | Living frame stage |
| `aria.plateAltPrefix` | 植物图版： | Botanical plate:  |
| `aria.soundToggle` | 声音开关 | Sound toggle |
| `aria.themeToggle` | 夜花园开关 | Night garden toggle |
| `aria.languageToggle` | 切换语言 | Switch language |
| `aria.collectButton` | 采集这一株 | Collect this specimen |
| `aria.shareButton` | 分享这一株 | Share this specimen |
| `aria.deleteButton` | 取下这一株 | Remove this specimen |
| `aria.closeDialog` | 关闭对话框 | Close dialog |
| `aria.commandMenu` | 指令菜单 | Command menu |
| `aria.searchSpecimens` | 搜索标本 | Search specimens |
| `aria.filters` | 筛选 | Filters |
| `aria.liveReadout` | 温室实时读数 | Live greenhouse readout |
| `aria.skip` | 跳到正文 | Skip to content |
| `aria.loading` | 正在加载 | Loading |
| `aria.gestureHint` | 手势提示 | Gesture hint |
| `aria.cameraPreview` | 本地摄像头预览 | Local camera preview |
| `aria.qr` | 分享二维码 | Share QR code |
| `aria.marquee` | 公告滚动 | Announcement ticker |
| `aria.external` | 外部链接 | External link |
| `aria.handStage` | 手部追踪舞台 | Hand-tracking stage |
| `aria.thanksButton` | 给这一株致谢 | Thank this specimen |
| `aria.downloadCard` | 下载标本卡 | Download specimen card |
| `aria.copyLink` | 复制分享链接 | Copy share link |

<!-- AUTO-GENERATED-KEYS-END -->