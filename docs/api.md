# HORTUS MANUS · API

Local, single-process backend: **Hono** on `@hono/node-server`, **better-sqlite3** (WAL),
**zod** validation, deterministic **@napi-rs/canvas** cards/OG/QR.
No cloud, no accounts, no PII, no uploads. Everything lives under `data/`.

```
apps/api/src/
  index.ts          process entry: static/SPA shell + server bootstrap
  app.ts            Hono app: middleware, routes, error handling
  config.ts         paths, ports, limits, public origin, URL builders
  db/index.ts       SQLite open + WAL + versioned migrations
  db/schema.sql     migration 1 (specimens / thanks / editions / telemetry)
  db/repo.ts        prepared statements + queries + daily edition
  db/reset.ts       `pnpm db:reset`
  lib/{security,ratelimit,cache,respond,artcache,limit,errors,validation}.ts
  routes/{specimens,media,meta,share}.ts
  ssr/share.ts      standalone /s/:id HTML (+ designed 404)
packages/art/src/   deterministic card / OG / QR drawing (fonts, palette, prng, text)
```

Run:

```bash
pnpm -F @hortus/api dev     # tsx watch
pnpm -F @hortus/api start   # http://127.0.0.1:8787/
pnpm db:reset               # wipe data/hortus.db* + data/cards (keeps .secret)
./scripts/smoke.sh          # 93-check end-to-end curl suite (--save → docs/api-smoke.txt)
```

Environment (all optional):

| var | default | meaning |
|---|---|---|
| `PORT` | `8787` | port |
| `HOST` | `127.0.0.1` | bind host (local only by design) |
| `HORTUS_DATA_DIR` | `<repo>/data` | SQLite + cards + `.secret` |
| `HORTUS_WEB_DIST` | `<repo>/apps/web/dist` | static build served at `/` |
| `HORTUS_FONT_DIR` | `<repo>/apps/api/assets/fonts` | TTFs for canvas art |
| `HORTUS_PUBLIC_ORIGIN` | `http://127.0.0.1:8787` | absolute URLs in share/OG/QR |
| `HORTUS_SECRET` | generated into `data/.secret` | HMAC key for delete tokens |
| `HORTUS_RL_COLLECT` / `HORTUS_RL_THANKS` | `10` / `60` per hour per IP | rate limits |

## Routes

| Method | Path | Cache | Notes |
|---|---|---|---|
| GET | `/api/health` | `no-store` | db ok, counts, card count, uptime, fonts, migration |
| GET | `/api/stats` | `max-age=60` + ETag | real SQLite counts |
| GET | `/api/edition/today` | until local midnight + ETag | deterministic daily specimen |
| POST | `/api/specimens` | `no-store` | create; returns one-time `deleteToken` |
| GET | `/api/specimens` | `max-age=15` + ETag | `limit&cursor&mode&season&q&sort` |
| GET | `/api/specimens/:id` | `max-age=60` + ETag | 404 when absent |
| DELETE | `/api/specimens/:id` | `no-store` | `Authorization: Bearer <deleteToken>` |
| POST | `/api/specimens/:id/thanks` | `no-store` | idempotent per visitor per day |
| GET | `/api/specimens/:id/card.png` | `immutable` + ETag | 1200×1600 PNG |
| GET | `/api/specimens/:id/og.png` | `immutable` + ETag | 1200×630 PNG |
| GET | `/api/specimens/:id/qr.png` | `immutable` + ETag | `?size=120..1024`, default 320 |
| GET | `/s/:id` | `no-cache` | standalone SSR share page (no SPA needed) |
| GET | `/` … | SPA shell / static | `apps/web/dist` + SPA fallback |

All JSON responses are gzip-compressed when the client sends `Accept-Encoding: gzip`
(`Vary: Accept-Encoding`); PNGs are not re-compressed.

### POST /api/specimens

```bash
curl -s -X POST http://127.0.0.1:8787/api/specimens \
  -H 'Content-Type: application/json' \
  -d '{"mode":"frame","season":"spring","seed":2317827271,
       "caption":"窗里那株牡丹，跟着我的掌开合。","lang":"zh",
       "clientId":"3f2a8c10-77bd-4a1e-9c33-2b6f0d8e1a44"}'
```

```json
{
  "specimen": {
    "id": "7hxqc34qxmwj",
    "mode": "frame", "season": "spring", "seed": 2317827271,
    "caption": "窗里那株牡丹，跟着我的掌开合。", "lang": "zh", "thanks": 0,
    "createdAt": "2026-10-29T17:50:21.711Z",
    "cardUrl": "http://127.0.0.1:8787/api/specimens/7hxqc34qxmwj/card.png",
    "ogUrl":   "http://127.0.0.1:8787/api/specimens/7hxqc34qxmwj/og.png",
    "shareUrl":"http://127.0.0.1:8787/s/7hxqc34qxmwj"
  },
  "deleteToken": "UevUnPnHbeTS4qIpBrL3L7ZMqteoRS9Uvi8AyquW_GQ",
  "shareUrl": "http://127.0.0.1:8787/s/7hxqc34qxmwj"
}
```

* `mode` ∈ `frame|tendril|ripple|spore|mycelium|mist|phyllotaxis`
* `season` ∈ `spring|summer|autumn|winter`
* `seed` uint32 `0..4294967295`
* `caption` ≤ 80 characters, no control characters, trimmed, may be `""`
* `lang` `zh|en` (default `zh`)
* `clientId` optional uuid-like string — stored only as `sha256`-style HMAC (`client_hash`)
* body ≤ 8 KB; unknown fields are ignored

`deleteToken` is returned **exactly once** and never stored: the DB keeps
`sha256(token)`. It is also derivable locally from the HMAC secret, so
`data/.secret` must stay stable to keep old tokens working.

### GET /api/specimens

```bash
curl -s 'http://127.0.0.1:8787/api/specimens?limit=3&mode=ripple&season=summer&sort=thanks'
```

```json
{ "items": [ { "id": "…", "cardUrl": "…", "shareUrl": "…", … } ],
  "nextCursor": "eyJ2IjoxLCJ0Ijoi…", "total": 42 }
```

* `limit` 1..60 (default 24); `cursor` opaque from `nextCursor`; invalid cursor → empty page (never 500)
* `mode`, `season` filters; `q` matches captions (≤40 chars); `sort=new|thanks`
* keyset pagination: `(created_at,id)` for `new`, `(thanks,created_at,id)` for `thanks`

### DELETE /api/specimens/:id

```bash
curl -s -X DELETE http://127.0.0.1:8787/api/specimens/7hxqc34qxmwj \
  -H "Authorization: Bearer $DELETE_TOKEN"
# → {"ok":true,"id":"7hxqc34qxmwj"}
```

Wrong token → `403`; missing header → `401`; unknown id → `404`. The card cache
file is deleted with the row (the PNG route 404s afterwards).

### POST /api/specimens/:id/thanks

```bash
curl -s -X POST http://127.0.0.1:8787/api/specimens/7hxqc34qxmwj/thanks \
  -H 'Content-Type: application/json' -d '{}'
# → {"ok":true,"thanks":1,"duplicate":false}
```

One thanks per `(specimen, visitor, day)`: the visitor hash is HMAC of
IP + optional `visitorId` + specimen id + UTC day. A repeat returns the same
count with `"duplicate": true`. Limit 60/hour/IP.

### GET /s/:id (SSR)

Standalone HTML — no SPA bundle, no client-side data fetch. Contains:

* `<title>`, `description`, `canonical`, `og:*`, `twitter:summary_large_image`
* `application/ld+json` (`VisualArtwork`, image = card + OG, url = share)
* the 1200×1600 card image, the QR PNG, "thanks" and "share" buttons, CTA back to `/herbarium`
* `Cache-Control: no-cache`, `X-Robots-Tag: noindex`
* 404 → designed page with `这株标本还没有被压进纸里。 / This specimen has not been pressed yet.`

### Health

```json
{ "ok": true, "version": "1.0.0", "uptimeSec": 27,
  "specimens": 1,
  "counts": { "specimens": 1, "thanks": 0, "editions": 1, "telemetry": 1, "cards": 3 },
  "db": { "path": "data/hortus.db", "sizeBytes": 61440, "wal": true, "version": 2, "ok": true, "migration": 2 },
  "fonts": { "display": true, "displayItalic": true, "mono": true, "monoMedium": true,
             "serifSC": true, "sansSC": true, "hand": true },
  "limits": { "collectPerHour": 10, "thanksPerHour": 60 },
  "publicOrigin": "http://127.0.0.1:8787", "dataDir": "…/data", "time": "…" }
```

## Errors

Every error is `{"error": <code>, "message": <readable zh/en>}` (+ optional
`details.issues` for validation). Never a bare 500.

| status | `error` | when |
|---|---|---|
| 400 | `bad_request` | malformed JSON body |
| 401 | `unauthorized` | DELETE without `Authorization: Bearer` |
| 403 | `forbidden` | delete token does not match this specimen |
| 404 | `not_found` | unknown specimen id / path / share page |
| 413 | `payload_too_large` | body > 8 KB |
| 422 | `validation_error` | mode/season/seed/caption/lang/limit/cursor/size invalid |
| 429 | `rate_limited` | collect 10/h/IP, thanks 60/h/IP — carries `Retry-After` |
| 500 | `internal_error` | unexpected server fault (logged) |

Examples:

```json
{"error":"validation_error",
 "message":"caption must not contain control characters",
 "details":{"issues":[{"path":"caption","message":"caption must not contain control characters"}]}}

{"error":"rate_limited",
 "message":"温室今天已经接满了，请 60 分钟后再来采一株。 / The glasshouse is full for now — collect again in 60 min.",
 "details":{"retryAfterSec":3600,"limit":10,"window":"1h"}}
```

## Caching

* JSON: strong `ETag`; `If-None-Match` → `304` (weak comparison, `W/"x"` matches `"x"`).
  Lists `max-age=15`, details `max-age=60`, stats `max-age=60`, edition until local midnight.
* PNG: `Cache-Control: public, max-age=31536000, immutable` + ETag; identical bytes for
  identical spec (verified by hash in `scripts/smoke.sh`).
* In-memory: LRU-ish map for rendered art (40 entries) + `stats`/`edition` reuse via ETag salt.
* Disk: `data/cards/{id}.png`, `{id}-og.png`, `{id}-qr-{size}.png` — regenerated on demand,
  deleted with the specimen.

## Determinism

Art seed = `mulberry32(seedFromParts(id, mode, season, seed))` from `@hortus/shared`.
Fonts are fixed TTFs (`apps/api/assets/fonts`), no `Date.now()`/`Math.random()` inside the
drawing code, so the same specimen always produces byte-identical PNGs. If a TTF is missing
the family falls back to `P052 / DejaVu Serif / Noto Serif CJK` — rendering never throws.

## Local data

```
data/
  hortus.db (+ -wal, -shm)   SQLite, WAL
  .secret                    HMAC key (0600) for delete tokens + visitor hashes
  cards/*.png                deterministic card / OG / QR cache
```

Reset:

```bash
pnpm db:reset                    # drop DB + card cache, keep .secret (tokens stay valid)
HORTUS_RESET_SECRET=1 pnpm db:reset   # also rotate the secret (all old tokens die)
```

Telemetry is aggregated only: `telemetry(day, mode, event, count)` — one row per
day/mode/event, no IPs, no ids, no captions.

## Performance (local, this machine)

| operation | cold | warm |
|---|---|---|
| `GET /api/specimens?limit=10` | ~2 ms | ~1.8 ms p50 / 3.3 ms p95 |
| `GET /api/specimens/:id` | ~1 ms | 1.1 ms p50 / 1.5 ms p95 |
| `GET /s/:id` (SSR) | ~2 ms | — |
| `card.png` (first render) | ~250–370 ms | ~2.5 ms (memo/disk) |
| `og.png` (first render) | ~90 ms | ~2 ms |
| `qr.png?size=320` | ~9 ms | ~1 ms |
| 20 concurrent list requests | — | 30 ms total, all 200 |

## Security / privacy

* Binds `127.0.0.1`; CORS only `http://localhost:5173|4173` and `http://127.0.0.1:5173|4173`.
* No camera frames, audio, or images are accepted or stored — metadata only.
* `clientId` → HMAC hash; IPs are never persisted (rate limiter is in-memory).
* Delete requires a bearer token; the stored value is a hash (constant-time compare).
* `/s/:id` sends `X-Robots-Tag: noindex` and a restrictive CSP (inline style/script only).

## Known limitations

* Rate limits are per-process and reset on restart (single local server, no shared store).
* The LRU is per-process; a restart re-renders cards from disk (already cached).
* `?size` for QR is capped at 1024 and cached per size — a wide spread of sizes grows `data/cards`.
* Fonts are loaded from local TTFs; on a machine without them the art falls back to
  system serif (still deterministic, slightly different look).
* No auth beyond delete tokens: anyone who can reach the local port can create specimens
  (by design — it is a local-first installation).
