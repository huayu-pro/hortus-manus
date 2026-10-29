# REA 深挖汇总（10 完整 + 1 部分）

> 工具：`npx -y rea-agents@latest`（rea 6.8.0），CDP 127.0.0.1:9222 + Playwright Chromium 1243。
> 每站目录保留 `COMMANDS.txt`、`source-url.txt`、`inspect-web-page.json`、`capture-browser-scenario.json`、`export-web-scripts.json`、`analyze-web-bundle.json`、`scripts/`，以及 `*.LIMITATION` / `*.err`。

| 站点 | 目录 | 证据状态 | 可转化 |
|---|---|---|---|
| Bausola Banch | `bausola-banch/` | inspect + capture + export + analyze | 多 canvas / 字体 / 版式 |
| Dabbit | `dabbit/` | inspect + capture + export + analyze | 8 canvas 分治、滚动动效 |
| Duo Case | `duo-case/` | inspect + capture + export + analyze | GSAP/ScrollTrigger、图版转场 |
| Everline Studio | `everline-studio/` | inspect + capture + export + analyze | 字体/留白/慢动效 |
| Isa de Burgh | `isa-de-burgh/` | inspect（部分 limitation） | 出血图版 / 排版 |
| Kern Society | `kern-society/` | inspect + capture + export + analyze | 编辑式排版、分享卡 |
| Magma | `magma/` | inspect + capture + export + analyze | 视差、图像处理 |
| Possible Monuments | `possible-monuments/` | inspect + capture + export + analyze | 3D/空间叙事 |
| Superlocal 2026 | `superlocal-2026/` | inspect + capture + export + analyze | 多 canvas、滚动 |
| Swash | `swash/` | inspect + capture + export + analyze | 字体动效 |
| Voice Tag Gods | `voice-tag-gods/` | inspect + capture + export + analyze | 声音/交互 |
| `_scenarios/` | 批量场景脚本 | angelo / superlocal 等场景 JSON；jopecuro 未跑 |

> 结论：**10 站完整**（inspect+analyze+capture+scripts）+ **1 站部分**（isa-de-burgh 仅 inspect）；`jopecuro` 未跑、`swash` export 失败，均如实记录。研究不作为产品运行时依赖。
