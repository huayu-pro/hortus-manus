/**
 * HORTUS MANUS · static comp screenshot driver (not product code).
 * Uses the Playwright Chromium binary via the DevTools protocol, one instance.
 *
 *   python3 -m http.server 8123   (from hortus-manus root)
 *   node docs/design/comp/shoot.mjs
 *
 * Writes PNGs to docs/design/comp/shots/.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = '/home/huayu/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'
const PORT = 9333
const BASE = process.env.BASE ?? 'http://127.0.0.1:8123'
const COMP = `${BASE}/docs/design/comp`
const OUT = path.resolve('docs/design/comp/shots')
const PROFILE = '/tmp/hm-comp-chrome'

fs.mkdirSync(OUT, { recursive: true })
fs.rmSync(PROFILE, { recursive: true, force: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--mute-audio',
    '--force-color-profile=srgb',
    '--font-render-hinting=none',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

async function waitBrowser() {
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (res.ok) return await res.json()
    } catch {}
    await sleep(150)
  }
  throw new Error('chrome did not expose devtools')
}

class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(msg.error.message))
        else resolve(msg.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id)
          reject(new Error(`CDP timeout: ${method}`))
        }
      }, 30000)
    })
  }
}

async function newPage() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
  const target = await res.json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })
  const cdp = new CDP(ws)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setEmulatedMedia', { features: [] })
  return { cdp, ws }
}

async function setViewport(cdp, width, height, mobile = false) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  })
}

async function goto(cdp, url) {
  await cdp.send('Page.navigate', { url })
  await sleep(900)
  await cdp.send('Runtime.evaluate', {
    expression: `(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => {})));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return 'ready';
    })()`,
    awaitPromise: true,
    returnByValue: true,
  })
  await sleep(250)
}

async function shot(cdp, file) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
  fs.writeFileSync(path.join(OUT, file), Buffer.from(data, 'base64'))
  console.log('wrote', file)
}

async function scrollTo(cdp, id) {
  await cdp.send('Runtime.evaluate', {
    expression: `document.getElementById(${JSON.stringify(id)})?.scrollIntoView({block:'start'})`,
  })
  await sleep(350)
}

async function fullShot(cdp, file, width) {
  const metrics = await cdp.send('Page.getLayoutMetrics')
  const content = metrics.cssContentSize ?? metrics.contentSize
  const height = Math.min(Math.ceil(content.height), 16000)
  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  })
  fs.writeFileSync(path.join(OUT, file), Buffer.from(data, 'base64'))
  console.log('wrote', file, `${width}x${height}`)
}

const ACTS = ['gate', 'pollination', 'greenhouse', 'fieldnotes', 'herbarium', 'colophon']

try {
  await waitBrowser()
  const { cdp, ws } = await newPage()

  /* ---------------- desktop 1440×900 ---------------- */
  await setViewport(cdp, 1440, 900, false)
  await goto(cdp, `${COMP}/index.html`)
  await shot(cdp, '01-home-hero-1440.png')
  await fullShot(cdp, '00-home-full-1440.png', 1440)

  const actNames = {
    gate: '01-home-hero-1440.png',
    pollination: '02-pollination-1440.png',
    greenhouse: '03-greenhouse-1440.png',
    fieldnotes: '04-fieldnotes-1440.png',
    herbarium: '05-herbarium-1440.png',
    colophon: '06-colophon-1440.png',
  }
  for (const act of ACTS) {
    if (act === 'gate') continue
    await scrollTo(cdp, act)
    await shot(cdp, actNames[act])
  }

  await goto(cdp, `${COMP}/touch.html`)
  await shot(cdp, '07-touch-1440.png')

  /* ---------------- mobile 390×844 ---------------- */
  await setViewport(cdp, 390, 844, true)
  await goto(cdp, `${COMP}/index.html`)
  await shot(cdp, '08-home-hero-390.png')
  await fullShot(cdp, '09-home-full-390.png', 390)
  for (const act of ACTS) {
    await scrollTo(cdp, act)
    const name = {
      gate: '08-home-hero-390.png',
      pollination: '10-pollination-390.png',
      greenhouse: '11-greenhouse-390.png',
      fieldnotes: '12-fieldnotes-390.png',
      herbarium: '13-herbarium-390.png',
      colophon: '14-colophon-390.png',
    }[act]
    if (act === 'gate') continue
    await shot(cdp, name)
  }

  await goto(cdp, `${COMP}/touch.html`)
  await shot(cdp, '15-touch-390.png')

  ws.close()
} finally {
  chrome.kill('SIGKILL')
}