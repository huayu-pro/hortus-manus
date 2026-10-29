# QA · HORTUS MANUS 本地交付

日期：2026-10-30 · 环境：Linux / Node 22.22 / pnpm 11.21 / Chromium 1243（headless + SwiftShader）
生产本地：`http://127.0.0.1:8787/`

## 1. 自动化结果

| 检查 | 命令/证据 | 结果 |
|---|---|---|
| API 全链路 | `bash scripts/smoke.sh` → `docs/api-smoke.txt` | **93 passed / 0 failed** |
| a11y | axe-core 4.x，wcag2a/aa —— `/` `/touch` `/herbarium` `/field-guide` `/nope` | **0 violations**（passes 24/20/28/27/24） |
| 横向溢出 | Playwright 390×844 + 1440×900，5 页 | 0 / 0 |
| console/page errors | 最终 5 页 + collect/share 流程 | **0** |
| 初始包 | `vite build` | index **281KB raw / 89.74KB gzip**；GardenEngine lazy **161KB gzip** |
| 7 模式 | 逐模式键盘 1–7 + 采集 | 7/7，零 console error |
| 假摄像头 | Chromium `--use-file-for-fake-video-capture=/tmp/hands.y4m` | camera on / 2 hands / `相机 已就绪` |
| 采集→归档→分享 | Playwright 真实 API | 201 → card/OG/QR 200 → SSR `/s/:id` → DELETE token `{ok:true}` → 404 |
| 研究硬指标 | `node research/check.mjs` | **14/14 PASS** |

## 2. 视觉证据

- `screens/desktop/home-hero-1440.png`、`home-pollination`、`home-greenhouse`、`home-field-notes`、`home-herbarium`、`home-colophon`
- `screens/touch/touch-frame-1440.png` + 6 modes + `camera-ritual` / `collect-dialog` / `collect-success`
- `screens/desktop/herbarium-1440.png`、`field-guide-1440.png`、`404-1440.png`
- `screens/share/share-1440.png`
- `screens/mobile/home-390.png`、`touch-390.png`、`herbarium-390.png`、`field-guide-390.png`、`404-390.png`
- `screens/demo/hortus-manus-demo.mp4` / `.gif`

## 3. 逐项验收

1. 首屏 3 秒内出现巨字 + 真实牡丹 + 温室读数 + 双 CTA；1440×900 完整，无溢出。
2. 无摄像头：幽灵手/指针/键盘全部可玩；7 模式可进/退；`/touch` 相机 ritual 拒绝后可回落。
3. 摄像头：fake camera 真实识别 2 hands；GPU delegate 优先，CPU fallback；无设备/拒绝有可读状态。
4. 采集：`/touch` 按 F 或采集按钮 → 弹层预览/题记/按住“压进纸里”（人机确认）→ POST 201 → 分享链接/QR/下载。
5. 归档：`/herbarium` 真实 list；模式/季节/搜索/排序/分页；卡片 200；点击 `/s/:id`。
6. 分享：SSR title/og:image/twitter:card/JSON-LD/canonical/QR 全部存在；OG PNG 1200×630。
7. 删除：localStorage token → DELETE `{ok:true}` → share 404；API smoke 覆盖 wrong token 403。
8. a11y：axe 0；键盘可达；focus-visible；aria-live；reduced-motion 终态；forced-colors 有边界。
9. 响应式：390/768/1280/1440/1920；移动端 FRAME 圆窗、topbar 收敛、无横向溢出。
10. 性能：入口 89.74KB gzip；引擎/模型/three 懒加载；质量 governor（<45/30fps 降 DPR/粒子）。
11. 本地性：字体/模型/wasm/图版全部自托管；运行时无外网请求；不写摄像头画面。
12. 研究：3 视频 3093 帧、gif 154 帧、zip 1049 行、77 站 atlas、10 完整 REA + 1 部分证据、50 techniques、17 assets、14/14 check。

## 4. 已知限制

- Headless SwiftShader 软件渲染 FPS 1–16；不代表真实 GPU。真实 GPU 下由 governor 目标 60fps；可在 `/touch` care label 看 FPS/延迟。
- 摄像头权限/真实手部体验需带摄像头浏览器手工确认；无摄像头模式完整。
- Safari/Firefox 未做逐浏览器像素验收，只做 CSS/JS 回退。
- 429 本地限流默认由 `start.sh` 设为 60 次/小时；API 默认 10，可通过 `HORTUS_RL_COLLECT` 覆盖。
- 研究 REA 部分站受 CDP/反爬限制（`*.LIMITATION`），不是所有站都拿到完整 bundle。

## 5. 复跑

```bash
cd /home/huayu/Agent工作区/DSHarness/1/hortus-manus
bash scripts/smoke.sh
node research/check.mjs
# 截图/axe 脚本在 /tmp（Lead 验收用）；最终证据在 screens/
```

> 本 QA 只针对本地交付；无云端部署、无用户 3D 网站引用。