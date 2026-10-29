# 决策记录 · HORTUS MANUS

1. **本地全栈，不部署**：用户最新要求“做完放在本地”。静态 Vite dist + Hono API + SQLite 由 `./start.sh` 单进程启动，无云端资源。
2. **不参考用户 3D 网站**：独立新项目；未复用其代码/素材/配置/数据。此仓库只依赖通用开源栈与公共领域素材。
3. **交互优先于“页面数量”**：七模式 + 采集/分享闭环，而不是再做一个卡片落地页。
4. **shadcn/Radix 风格而非三套设计系统**：使用 Radix primitives + 自研 tokens/CSS；未引入 HeroUI/Mantine 组件层，避免视觉与包体冲突（`@mantine/hooks` 仅作可选工具依赖）。理由：已有一套完整纸/墨/植物 token。
5. **摄像头默认关闭**：`Stage` 不自动请求；只有“把手借给花园”仪式后才开。画面不上传、不录制。
6. **无摄像头全可玩**：幽灵手 fixture + 指针/双指/键盘平价；保证演示和无权限环境完整。
7. **FRAME 用真实芍药图版而非程序化低模**：美术评审指出程序化花瓣呈低模/橙色尖刺；改为 PD 芍药图版 + 圆形/手框窗口，更接近 BOTANICA 参考。
8. **确定性卡片**：不存用户图片；`seed+mode+season` 通过同一 PRNG/Canvas 代码生成卡片/OG/QR，服务端缓存字节。
9. **分享页独立 SSR**：不依赖 SPA/JS，爬虫可读 OG/Twitter/JSON-LD；二维码回本机。
10. **隐私/安全**：绑定 127.0.0.1、无账号、无 PII、HMAC 删除 token、限流、zod 校验；研究截图不进产品包。
11. **研究与产品分离**：77 站/10 完整 REA + 1 部分/50 techniques 只用于设计依据；产品素材全部 PD/CC0/OFL，许可单独记录。
12. **性能预算**：入口 89.74KB gzip；引擎/MediaPipe/three 懒加载；`prefers-reduced-motion` 终态；axe 0。