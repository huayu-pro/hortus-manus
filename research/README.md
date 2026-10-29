# HORTUS MANUS · 研究档案

> 本地研究，不部署、不上传。所有数字都可用目录内文件复核；失败/限制写在各文档与 `rea/*/ *.LIMITATION` 中。

## 目录

| 目录/文件 | 内容 |
|---|---|
| `videos/` + `videos/frames/` | 3 支 B 站手指涂鸦视频（已下载）+ 逐帧解码（3093 帧） |
| `video-teardown/` | `finger-doodle.md`（逐帧机制/UI/手势/日志）、`ui-inventory.md`、证据帧 83 张、接触表/差分/条带 |
| `botanica-gif/` | 154 帧 + 接触表 + `teardown.md`（版式/字体/交互/12 条美术规则） |
| `cats-cradle/` | 用户旧作 1049 行源码 + `teardown.md`（Verlet/5 图案/迁移方案） |
| `references/` | One Page Love **77 站**截图/HTML/headers/技术指纹；`atlas.md` / `atlas.csv` / `atlas.json` |
| `rea/` | **10 完整 + 1 部分** REA 证据（inspect / capture / export / analyze / scripts / limitations） |
| `assets/` | **17 张** PD/CC-BY 研究素材 + `assets.json`；产品只用 PD/CC0/OFL |
| `techniques.md` | **50 条**可转化技术，逐条映射到 A/B/C/D/E 创新 ID |
| `check.mjs` | 研究硬指标校验器（见根 `ASSET-LICENSES.md`） |

## 方法

1. **视频**：`ffprobe` 全量元数据 → ffmpeg `-vsync 0` 逐帧 JPEG → 帧差/亮度/色相扫描 → 接触表/关键帧裁切 → 逐张读图记录。诚实边界见 `video-teardown/finger-doodle.md §7`。
2. **gif**：154 帧全解 → 接触表 → 版式/字体/交互拆解。
3. **zip**：读源码，提取 Verlet/图案/音频/滑块，形成 TENDRIL 迁移说明。
4. **77 站**：One Page Love 官方 MCP 14 组查询 → 去重 → Playwright 串行截 1440×900 + 390×844 → 抓 HTML/headers/技术指纹 → 逐站 3 手法 + 1 可转化技术。
5. **REA 10 完整 + 1 部分**：Chromium CDP + `npx rea-agents@latest` 的 inspect/capture/export/analyze；原始 JSON、命令、限制全部保留。
6. **50 techniques**：从上述证据提炼，逐条落到本项目实现（不是纸面清单）。

## 复核

```bash
node research/check.mjs
# 77 rows: wc -l research/references/atlas.csv
# 3093 frames: ls research/videos/frames/*/ | ...
# REA: ls research/rea
```

## 诚实边界

- OPL 站点截图是第三方页面，版权归原站；只作本地研究，不随产品分发。
- REA 在部分站点受 CDP/反爬/噪声限制，`*.LIMITATION` 文件如实记录；不是所有站都拿到完整脚本。
- 视频只记录三支视频中真实出现的模式；“涟漪/冰雾”未在视频里被观察到，产品中的对应模式是**设计转化**，不由视频证据支持。
- 本档案不复制任何第三方的品牌/文案/资产；产品素材全部 PD/CC0/OFL 并单独记录。
