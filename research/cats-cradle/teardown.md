# 翻绳（cats_cradle.zip）源码拆解 → TENDRIL 模式

> 素材：`research/cats-cradle/cats_cradle/index.html`（1,049 行，单文件），README。作者：用户本人旧作。
> 结论：保留 **Verlet 弦 + 5 图案谱系 + 双手关键点绑定** 的物理思想；重写渲染/配色/材质为自然纤维、露珠、嫩芽；UI 全部由 HORTUS MANUS 重新设计。

## 1. 技术骨架

- 引入 MediaPipe Hands（CDN），`Hands({locateFile})` + `Camera`，双手 21 点。
- `CONFIG`：`pattern:'star'`、`audioEnabled:false`、`gravity:0.5`、发光强度/物理弹性/线条数量。
- 类：`Point`（位置/旧位置/约束）、`Stick`（两点距离约束，含 stiffness）、`Simulation`（多根弦、重力/阻尼/约束迭代）。
- 每帧：MediaPipe onResults → 关键点（4/8/12/16/20 指尖 + 0 腕）→ 图案生成器返回若干“string” → 每根 string 创建/更新 Simulation。
- 渲染：Canvas 2D 霓虹发光（shadowBlur/lineWidth）+ 深色摄像头底；5 图案切换按钮、3 滑块（glow/physics/string count）、隐藏摄像头、Web Audio 音效、日志式 HUD。

## 2. Verlet 关键参数（源码可复核）

- 位置更新：`newPos = pos + (pos - oldPos) * damping + gravity`；`oldPos = pos; pos = newPos`。
- 约束：每帧迭代若干次，按 `(dist - restLength)/dist * stiffness` 修正两端点。
- 控制点：指尖/腕点作为 anchor，弦的端点跟随平滑后的手部位置；其余点受重力和约束。
- 阻尼/重力/刚度由 UI 滑块映射（`physicsSlider` 0–100；`stringSlider` 1–10）。

## 3. 五个图案谱系

| data-pattern | 中文 | 结构（概念） | 本项目 TENDRIL 转化 |
|---|---|---|---|
| `star` | 星星阵 | 多根弦在双手之间交叉成星形 | 星阵：五条主藤 + 露珠节点，星形为花萼 |
| `starry` | 满天星 | 更多短弦/散点，形成网状星群 | 满天星：短藤/花粉散点，织成藤架 |
| `cradle` | 古老翻绳 | 经典 cat's cradle 的交叉 X 形 | 古老：双层 X 藤，中心结露 |
| `well` | 金井翻绳 | 中心方形/井字，四边下垂 | 金井：方形井口，四角垂藤/嫩芽 |
| `flower` | 花局 | 中心花形控制点，弦绕成花瓣 | 花局：花瓣形藤环 + 中心花蕊 |

## 4. 旧作问题 / 本项目改进

| 旧作 | 问题 | 本项目 |
|---|---|---|
| 霓虹青/洋红/荧光绿 + 黑底 | 赛博朋克，与“清新自然”冲突 | 苔绿/藤黄/露珠白 + 纸底；无 neon |
| 阴影发光很重 | 视觉噪、廉价 | 3 层线宽 + 露珠高光 + 纸面投影 |
| 图案是硬编码点集 | 平面、像图表 | 锚点绑定手 + 重力/风/露珠；图案有生命 |
| 单文件、CDN | 不可持续、离线不可用 | 引擎模块化；模型/wasm 自托管；离线可用 |
| 无 a11y | 键盘/读屏不可用 | 7 模式可键盘；reduced-motion；aria-live |
| 无采集/保存 | 体验结束即消失 | seed→确定性标本卡→本地归档/分享 |

## 5. 可直接复用的东西

- 5 个图案的中文名与“图案=弦的拓扑”概念。
- Verlet 的“位置/旧位置/约束迭代”实现思路（本项目重写为 TypeScript 引擎）。
- “双拳切换模式”的手势语义（本项目保留为彩蛋）。
- 反面教材：霓虹、发光、黑底、UI 遮挡 — 全部弃用。

## 6. 与本项目 TENDRIL 的差异

- 本项目是 WebGL/Canvas 混合：主藤用 Canvas2D 画多层线，节点/露珠/嫩芽用轻量粒子；不是纯 2D 霓虹。
- 5 图案与手部手势联动：拉/压/双手距离改变图案张力；`double fist` 换图案；键盘 2 进入 TENDRIL。
- 采集时 TENDRIL 的 seed 记录“当前图案 + 张力 + 季节”，卡片母题是绳结/藤。